const Groq = require('groq-sdk');
const { GoogleGenAI } = require('@google/genai');

// Initialize Gemini API
let ai;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
} catch (err) {
  console.log('Gemini API initialization skipped');
}

// Initialize Groq API
let groq;
try {
  if (process.env.GROQ_API_KEY) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
} catch (err) {
  console.log('Groq API initialization skipped');
}

// @desc    Extract event details from a poster image (URL or base64)
// @route   POST /api/ai/extract-poster
const extractPosterData = async (req, res) => {
  try {
    const { base64Image } = req.body;
    if (!base64Image) {
      return res.status(400).json({ message: 'No image provided' });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return res.status(400).json({ message: 'GEMINI_API_KEY is not configured on the server.' });
    }

    // Parse image data
    let mimeType = 'image/jpeg';
    let base64Data;
    if (base64Image.startsWith('http://') || base64Image.startsWith('https://')) {
      const axios = require('axios');
      const imageResponse = await axios.get(base64Image, { responseType: 'arraybuffer' });
      mimeType = (imageResponse.headers['content-type'] || 'image/jpeg').split(';')[0];
      base64Data = Buffer.from(imageResponse.data).toString('base64');
    } else {
      const matches = base64Image.match(/^data:(image\/[\w+]+);base64,/);
      if (matches && matches[1]) mimeType = matches[1];
      base64Data = base64Image.replace(/^data:image\/[\w+]+;base64,/, '');
    }

const prompt = `You are extracting event details from this poster image. Read ALL text on the poster carefully.
Return ONLY a valid JSON object:
{
  "title": "Event name",
  "description": "2-3 sentence description",
  "eventDate": "YYYY-MM-DD",
  "deadline": "YYYY-MM-DD or empty string",
  "time": "time or empty",
  "venue": "location or empty",
  "prizes": "prize info or empty",
  "eligibility": "who can join or empty",
  "participationType": "solo or team or empty",
  "registrationLink": "URL if visible or empty"
}
DATE RULES:
- "eventDate" is the day the event happens. "deadline" is the last date to apply/register.
- Format as YYYY-MM-DD.
- If no year shown, use 2026.
- If no date found, return "" for both. NEVER guess Jan 1st.`;

    // Call Gemini REST API directly (AQ. keys work with fetch, not the old SDK)
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType, data: base64Data } }
            ]
          }],
          generationConfig: { temperature: 0.1 }
        })
      }
    );

    const geminiData = await geminiRes.json();
    if (!geminiData.candidates) {
      throw new Error(geminiData.error?.message || 'Gemini returned no response');
    }

    let jsonString = geminiData.candidates[0].content.parts[0].text;

    // Strip markdown fences if present
    const markdownMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[1]) {
      jsonString = markdownMatch[1];
    } else {
      const start = jsonString.indexOf('{');
      const end = jsonString.lastIndexOf('}');
      if (start !== -1 && end !== -1) jsonString = jsonString.substring(start, end + 1);
    }

    let parsedData = {};
    try {
      parsedData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON Parse Error:', jsonString);
      throw new Error('AI returned invalid data. Please try again.');
    }

    // Safety net: wipe any Jan 1 hallucination (01-01)
    const isJan1 = (d) => d && String(d).includes('-01-01');
    if (isJan1(parsedData.eventDate)) parsedData.eventDate = '';
    if (isJan1(parsedData.deadline)) parsedData.deadline = '';
    
    // Map back to what frontend expects for now, or just send directly
    // Frontend expects: startDate/date, endDate/deadline
    parsedData.startDate = parsedData.eventDate;
    parsedData.endDate = parsedData.deadline; // frontend will use this if needed
    
    res.json(parsedData);
  } catch (error) {
    console.error('AI Extraction Error:', error.message);
    res.status(500).json({ message: error.message || 'Failed to extract data from image' });
  }
};

// @desc    AI Chatbot — students ask about events
// @route   POST /api/ai/chat
const chatEvent = async (req, res) => {
  try {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return res.status(400).json({ message: 'AI service (GEMINI_API_KEY) is not configured.' });
    }

    const { message, history } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required.' });

    // Fetch all upcoming/current events for context
    const Event = require('../models/Event');
    const Club = require('../models/Club');
    
    const [events, clubs] = await Promise.all([
      Event.find({ isApproved: true })
        .sort({ date: 1 })
        .limit(30)
        .select('title description date time venue organizer category registrationLink prizes eligibility'),
      Club.find({ isActive: true })
        .select('name category description memberCount')
    ]);

    const eventsContext = events.map((e, i) =>
      `Event ${i + 1}: "${e.title}" | Category: ${e.category} | Date: ${e.date || 'TBD'} | Time: ${e.time || 'TBD'} | Venue: ${e.venue || 'TBD'} | Organizer: ${e.organizer || 'TBD'} | Prizes: ${e.prizes || 'None'} | Eligibility: ${e.eligibility || 'All students'} | Registration: ${e.registrationLink || 'On SonaConnect'} | Description: ${e.description || ''}`.trim()
    ).join('\n\n');

    const clubsContext = clubs.map((c, i) =>
      `Club ${i + 1}: "${c.name}" | Category: ${c.category} | Members: ${c.memberCount || 0} | Description: ${c.description || ''}`.trim()
    ).join('\n\n');

    const systemPrompt = `You are SonaBot, the official AI assistant for SonaConnect.

CRITICAL RULES:
1. You MUST ONLY use the data provided in the EVENTS and CLUBS lists below. 
2. If the EVENTS list is empty, you MUST tell the user there are no events currently scheduled.
3. If the user asks for hackathons, workshops, or any category, and it is NOT in the EVENTS list below, you MUST say there are none scheduled right now.
4. DO NOT INVENT, GUESS, OR HALLUCINATE any events, clubs, dates, venues, or prizes. NEVER provide examples or dummy data.
5. If the exact information is not in the data below, say "I don't have that information right now."

LIVE DATA:
EVENTS (${events.length} found):
${eventsContext || 'NONE (No events are currently listed).'}

CLUBS (${clubs.length} found):
${clubsContext || 'NONE (No clubs are currently listed).'}
`;

    // Build Gemini contents array
    const contents = [];
    if (history && Array.isArray(history)) {
      history.slice(-6).forEach(msg => {
        contents.push({
          role: msg.role === 'bot' ? 'model' : 'user',
          parts: [{ text: msg.text }]
        });
      });
    }
    
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }]
          },
          contents,
          generationConfig: { temperature: 0.1 } // Extremely low temp to prevent hallucination
        })
      }
    );

    const geminiData = await geminiRes.json();
    
    if (geminiData.error) {
      console.error('Gemini API Error:', geminiData.error);
      throw new Error(geminiData.error.message || 'AI service error');
    }

    if (!geminiData.candidates || geminiData.candidates.length === 0) {
      throw new Error('No response from AI');
    }

    let reply = geminiData.candidates[0].content.parts[0].text || 'Sorry, I got confused for a second there.';

    // Strip out any <think> blocks if the model includes reasoning tokens
    reply = reply.replace(/<think>[\s\S]*?<\/think>\s*/gi, '');

    res.json({ reply });
  } catch (error) {
    console.error('ChatBot Error:', error);
    res.status(500).json({ message: error.message || 'Chatbot failed to respond.' });
  }
};

module.exports = { extractPosterData, chatEvent };


