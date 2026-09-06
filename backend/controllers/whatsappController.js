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
      const senderPhone = message.from || '';
      const cleanSenderPhone = senderPhone.replace(/[^0-9]/g, '');
      const last10 = cleanSenderPhone.slice(-10);
      
      // Match either full clean number or last 10 digits
      const user = await User.findOne({ 
        $or: [
          { phoneNumber: cleanSenderPhone },
          { phoneNumber: last10 },
          { phoneNumber: { $regex: last10 + '$' } }
        ]
      });
      const isAuthorized = true; // Auto-authorize incoming messages so WhatsApp bot always replies

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

      if (message.image && message.image.id) {
        const imageId = message.image.id;
        console.log('🖼️ Processing image ID:', imageId);
        
        await sendWhatsAppMessage(senderPhone, "⏳ Poster received! AI is extracting details, please wait...");
        
        try {
          const mediaRes = await axios.get(`https://graph.facebook.com/v19.0/${imageId}`, {
            headers: { 
              Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
              'User-Agent': 'curl/7.64.1'
            }
          });
          
          const imageUrl = mediaRes.data.url;
          console.log('🔗 Got image URL from Meta:', imageUrl);
          
          const imageRes = await axios.get(imageUrl, {
            headers: { 
              Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
              'User-Agent': 'curl/7.64.1'
            },
            responseType: 'arraybuffer'
          });
          
          const base64Data = Buffer.from(imageRes.data, 'binary').toString('base64');
          const mimeType = imageRes.headers['content-type'] || 'image/jpeg';
          console.log('📦 Image downloaded, mimeType:', mimeType);

          // Upload image to ImgBB (free image hosting)
          let posterUrl = '';
          try {
            const imgbbKey = process.env.IMGBB_API_KEY;
            if (imgbbKey) {
              const FormData = require('form-data');
              const form = new FormData();
              form.append('key', imgbbKey);
              form.append('image', base64Data);
              form.append('name', 'SonaConnect_Poster');
              const imgbbRes = await axios.post('https://api.imgbb.com/1/upload', form, {
                headers: form.getHeaders()
              });
              posterUrl = imgbbRes.data?.data?.display_url || imgbbRes.data?.data?.url || '';
              console.log('🖼️ Poster uploaded to ImgBB:', posterUrl);
            } else {
              console.warn('⚠️ IMGBB_API_KEY not set — poster not uploaded');
            }
          } catch (uploadErr) {
            console.warn('⚠️ ImgBB upload failed, continuing without poster:', uploadErr.response?.data || uploadErr.message);
          }
          const prompt = `You are extracting event details from this poster image. Read ALL text carefully.
Return ONLY a valid JSON object:
{
  "title": "Event name",
  "description": "2-3 sentence description",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "time": "HH:MM AM/PM or empty",
  "venue": "Location",
  "prizes": "Prize info or empty",
  "eligibility": "Who can join or empty",
  "participationType": "solo or team or empty",
  "registrationLink": "URL if visible or empty"
}

DATE RULES (very important):
- Look carefully for month names (Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec).
- Single date "September 15" → startDate:"2026-09-15", endDate:""
- Date range "Sep 15-16" or "15 & 16 Sep" → startDate:"2026-09-15", endDate:"2026-09-16"
- If year not shown, use 2026.
- If you cannot find a date, return "". NEVER return "2026-01-01" unless January 1 is literally written.`;
          
          console.log('🤖 Sending to Gemini Vision AI...');

          const { GoogleGenerativeAI } = require('@google/generative-ai');
          const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
          const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

          const geminiResult = await geminiModel.generateContent([
            prompt,
            { inlineData: { mimeType, data: base64Data } }
          ]);

          let jsonString = geminiResult.response.text();
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

          // Safety net: wipe Jan 1 hallucination
          const isJan1 = (d) => d && /^\d{4}-01-01$/.test(d);
          if (isJan1(parsedData.startDate)) parsedData.startDate = '';
          if (isJan1(parsedData.endDate)) parsedData.endDate = '';
          if (isJan1(parsedData.date)) parsedData.date = '';

          // --- Safe date parser ---
          // Handles: "2026-09-03 - 2026-09-05", "03/09/2026", "September 3, 2026", plain "YYYY-MM-DD"
          const parseEventDate = (raw) => {
            if (!raw) return new Date().toISOString().split('T')[0];
            const str = String(raw).trim();
            // If it's a range like "2026-09-03 - 2026-09-05", take the start date
            const rangePart = str.split(/\s*[-–to]+\s*/)[0].trim();
            // Try DD/MM/YYYY or MM/DD/YYYY slash formats → convert to YYYY-MM-DD
            const slashMatch = rangePart.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
            if (slashMatch) {
              // Assume DD/MM/YYYY (Indian format)
              return `${slashMatch[3]}-${slashMatch[2].padStart(2,'0')}-${slashMatch[1].padStart(2,'0')}`;
            }
            // Try natural language date
            const d = new Date(rangePart);
            if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
            // Fallback: today
            return new Date().toISOString().split('T')[0];
          };

          let rawType = (parsedData.participationType || "solo").toLowerCase().trim();
          let cleanParticipationType = 'solo';
          if (rawType.includes('team')) {
            cleanParticipationType = 'team';
          }

          const newEvent = await Event.create({
            title: parsedData.title || "Untitled Event",
            description: parsedData.description || "No description provided.",
            date: parseEventDate(parsedData.startDate || parsedData.date),
            endDate: parsedData.endDate ? parseEventDate(parsedData.endDate) : null,
            time: parsedData.time || "TBD",
            venue: parsedData.venue || "TBD",
            category: "other",
            organizer: user ? (user.name || user.email) : "WhatsApp Bot",
            club: user && user.clubManaged ? user.clubManaged : null,
            posterUrl: posterUrl,
            prizes: parsedData.prizes || "",
            eligibility: parsedData.eligibility || "All Students",
            participationType: cleanParticipationType,
            registrationLink: parsedData.registrationLink || "",
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
