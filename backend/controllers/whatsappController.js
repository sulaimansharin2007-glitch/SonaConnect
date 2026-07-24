const axios = require('axios');
const User = require('../models/User');
const Event = require('../models/Event');
const Groq = require('groq-sdk');

// Initialize Groq AI
let groq;
try {
  if (process.env.GROQ_API_KEY) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
} catch (err) {
  console.log('Groq API skipped for WhatsApp');
}

const sendWhatsAppMessage = require('../utils/whatsappService');

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
  console.log('📨 WhatsApp Webhook received:', JSON.stringify(body).substring(0, 300));

  // 1. Immediately send 200 OK to Meta so they stop retrying!
  res.sendStatus(200);

  if (body.object) {
    if (
      body.entry &&
      body.entry[0].changes &&
      body.entry[0].changes[0] &&
      body.entry[0].changes[0].value.messages &&
      body.entry[0].changes[0].value.messages[0]
    ) {
      const message = body.entry[0].changes[0].value.messages[0];
      const senderPhone = message.from; 
      console.log('📱 Message from:', senderPhone, '| Type:', message.type);
      
      const user = await User.findOne({ phoneNumber: senderPhone });
      const hardcodedAdmin = process.env.ADMIN_WHATSAPP_NUMBER;
      
      const isAuthorized = user || (hardcodedAdmin && senderPhone === hardcodedAdmin);

      if (!isAuthorized) {
        console.log('❌ Unauthorized sender:', senderPhone);
        await sendWhatsAppMessage(senderPhone, "❌ Unauthorized. Your phone number is not registered as an authorized poster on SonaConnect.");
        return;
      }

      if (user && user.role !== 'club_admin' && user.role !== 'faculty' && user.role !== 'super_admin') {
        console.log('❌ User lacks permission:', user.role);
        await sendWhatsAppMessage(senderPhone, "❌ You do not have permission to create events.");
        return;
      }

      if (message.type === 'image') {
        const imageId = message.image.id;
        console.log('🖼️ Processing image ID:', imageId);
        
        await sendWhatsAppMessage(senderPhone, "⏳ Poster received! AI is extracting details, please wait...");
        
        try {
          const mediaRes = await axios.get(`https://graph.facebook.com/v19.0/${imageId}`, {
            headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` }
          });
          
          const imageUrl = mediaRes.data.url;
          console.log('🔗 Got image URL from Meta');
          
          const imageRes = await axios.get(imageUrl, {
            headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` },
            responseType: 'arraybuffer'
          });
          
          const base64Data = Buffer.from(imageRes.data, 'binary').toString('base64');
          const mimeType = imageRes.headers['content-type'] || 'image/jpeg';
          console.log('📦 Image downloaded, mimeType:', mimeType);
          
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
          
          console.log('🤖 Sending to Groq Vision AI...');
          const dataUrl = `data:${mimeType};base64,${base64Data}`;
          
          const groqClient = groq || new Groq({ apiKey: process.env.GROQ_API_KEY });

          const chatCompletion = await groqClient.chat.completions.create({
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: prompt },
                  { type: 'image_url', image_url: { url: dataUrl } }
                ]
              }
            ],
            model: 'qwen/qwen3.6-27b',
            response_format: { type: 'json_object' }
          });
          
          let jsonString = chatCompletion.choices[0]?.message?.content || '{}';
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
          
          let rawType = (parsedData.participationType || "solo").toLowerCase().trim();
          let cleanParticipationType = 'solo';
          if (rawType.includes('team')) {
            cleanParticipationType = 'team';
          }

          const newEvent = await Event.create({
            title: parsedData.title || "Untitled Event",
            description: parsedData.description || "No description provided.",
            date: parsedData.date || new Date().toISOString().split('T')[0],
            time: parsedData.time || "TBD",
            venue: parsedData.venue || "TBD",
            category: "other",
            organizer: user ? (user.name || user.email) : "WhatsApp Bot",
            club: user && user.clubManaged ? user.clubManaged : null,
            posterUrl: "", 
            prizes: parsedData.prizes || "",
            eligibility: parsedData.eligibility || "All Students",
            participationType: cleanParticipationType,
            status: "upcoming",
            isApproved: true
          });
          
          await sendWhatsAppMessage(senderPhone, `🎉 Success! Event "${newEvent.title}" has been published automatically.`);
          
        } catch (err) {
          console.error("WhatsApp AI Error:", err);
          const errorDetail = err?.response?.data ? JSON.stringify(err.response.data) : err.message;
          await sendWhatsAppMessage(senderPhone, `❌ Failed to extract details. ERROR: ${errorDetail}`);
        }
      } else {
        await sendWhatsAppMessage(senderPhone, "Hi! Please send an event *poster image* directly to me, and I will publish it to SonaConnect using AI.");
      }
    }
  }
};

module.exports = { verifyWebhook, handleWebhook };
