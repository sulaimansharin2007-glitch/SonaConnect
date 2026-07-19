const axios = require('axios');
const User = require('../models/User');
const Event = require('../models/Event');
const { GoogleGenAI } = require('@google/genai');

// Initialize Gemini
let ai;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
} catch (err) {
  console.log('Gemini API skipped for WhatsApp');
}

// Helper to send WhatsApp messages back
const sendWhatsAppMessage = async (to, text) => {
  if (!process.env.WHATSAPP_TOKEN || !process.env.WHATSAPP_PHONE_ID) return;
  try {
    await axios.post(
      `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: text },
      },
      { headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` } }
    );
  } catch (err) {
    console.error('Error sending WhatsApp reply:', err?.response?.data || err.message);
  }
};

// @desc    Verify webhook for Meta
// @route   GET /api/whatsapp/webhook
const verifyWebhook = (req, res) => {
  const verify_token = process.env.WHATSAPP_VERIFY_TOKEN || 'sona_connect_whatsapp';
  
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === verify_token) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.status(400).send('Invalid request');
  }
};

// @desc    Receive messages from WhatsApp
// @route   POST /api/whatsapp/webhook
const handleWebhook = async (req, res) => {
  const body = req.body;

  if (body.object) {
    if (
      body.entry &&
      body.entry[0].changes &&
      body.entry[0].changes[0] &&
      body.entry[0].changes[0].value.messages &&
      body.entry[0].changes[0].value.messages[0]
    ) {
      const message = body.entry[0].changes[0].value.messages[0];
      const senderPhone = message.from; // Contains phone number e.g., 919876543210
      
      // 1. Authorize Sender
      const user = await User.findOne({ phoneNumber: senderPhone });
      const hardcodedAdmin = process.env.ADMIN_WHATSAPP_NUMBER;
      
      const isAuthorized = user || (hardcodedAdmin && senderPhone === hardcodedAdmin);

      if (!isAuthorized) {
        await sendWhatsAppMessage(senderPhone, "❌ Unauthorized. You are not allowed to post to SonaConnect.");
        return res.sendStatus(200);
      }

      // Check if they are club admin or faculty
      if (user && user.role !== 'club_admin' && user.role !== 'faculty' && user.role !== 'super_admin') {
        await sendWhatsAppMessage(senderPhone, "❌ You do not have permission to create events.");
        return res.sendStatus(200);
      }

      // 2. Process Image
      if (message.type === 'image') {
        const imageId = message.image.id;
        
        await sendWhatsAppMessage(senderPhone, "⏳ Poster received! AI is extracting details, please wait...");
        
        try {
          // Get Image URL from Meta
          const mediaRes = await axios.get(`https://graph.facebook.com/v19.0/${imageId}`, {
            headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` }
          });
          
          const imageUrl = mediaRes.data.url;
          
          // Download Image Bytes
          const imageRes = await axios.get(imageUrl, {
            headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` },
            responseType: 'arraybuffer'
          });
          
          const base64Data = Buffer.from(imageRes.data, 'binary').toString('base64');
          const mimeType = imageRes.headers['content-type'] || 'image/jpeg';
          
          // 3. Extract Details with Gemini
          const prompt = `
            You are an AI assistant that extracts event details from posters.
            Analyze this event poster and extract the following information. 
            Return ONLY a valid JSON object matching this exact structure:
            {
              "title": "Event Title Here",
              "description": "A brief 2-3 sentence description based on the poster",
              "date": "YYYY-MM-DD", 
              "time": "HH:MM AM/PM",
              "venue": "Event Venue",
              "prizes": "Prize details if any",
              "eligibility": "Who can attend (e.g. All Students, 3rd Years)",
              "participationType": "solo or team"
            }
            If any information is not found in the poster, leave it as an empty string "". 
            For the date, try to format it as YYYY-MM-DD.
          `;
          
          const aiResponse = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: [
              {
                role: 'user',
                parts: [
                  { text: prompt },
                  { inlineData: { mimeType, data: base64Data } }
                ]
              }
            ],
            config: { responseMimeType: "application/json" }
          });
          
          let jsonString = aiResponse.text;
          const markdownMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (markdownMatch && markdownMatch[1]) {
            jsonString = markdownMatch[1];
          } else {
            const start = jsonString.indexOf('{');
            const end = jsonString.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
              jsonString = jsonString.substring(start, end + 1);
            }
          }
          
          const parsedData = JSON.parse(jsonString);
          
          // Note: The poster image would ideally be uploaded to Cloudinary here.
          // For simplicity, we create the event with a placeholder URL, or we could pass the base64 
          // but base64 is too large for MongoDB string field usually.
          
          // 4. Save to Database
          const newEvent = await Event.create({
            title: parsedData.title || "Untitled Event",
            description: parsedData.description || "No description provided.",
            date: parsedData.date || new Date().toISOString().split('T')[0],
            time: parsedData.time || "TBD",
            venue: parsedData.venue || "TBD",
            category: "other", // Default category
            organizer: user ? user._id : null,
            club: user && user.clubManaged ? user.clubManaged : null,
            posterUrl: "", // We skip posterUrl here because saving base64 to DB is bad practice
            prizes: parsedData.prizes || "",
            eligibility: parsedData.eligibility || "All Students",
            participationType: parsedData.participationType || "solo",
            status: "upcoming"
          });
          
          await sendWhatsAppMessage(senderPhone, `🎉 Success! Event "${newEvent.title}" has been published automatically.`);
          
        } catch (err) {
          console.error("WhatsApp AI Error:", err);
          await sendWhatsAppMessage(senderPhone, "❌ Failed to extract details from the poster. Please post manually on the website.");
        }
      } else {
        await sendWhatsAppMessage(senderPhone, "Hi! Please send an event *poster image* directly to me, and I will publish it to SonaConnect using AI.");
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
};

module.exports = { verifyWebhook, handleWebhook };
