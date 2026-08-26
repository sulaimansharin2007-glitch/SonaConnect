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
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "time": "HH:MM AM/PM or empty",
  "venue": "Location",
  "prizes": "Prize info or empty",
  "eligibility": "Who can join or empty",
  "participationType": "solo or team or empty",
  "registrationLink": "URL if visible on poster or empty"
}

DATE RULES (very important):
- Look carefully for month names (Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec).
- Single date "September 15" → startDate:"2026-09-15", endDate:""
- Date range "Sep 15-16" or "15 & 16 Sep" → startDate:"2026-09-15", endDate:"2026-09-16"
- If year not shown, use 2026.
- If you cannot find a date, return "". NEVER return "2026-01-01" unless January 1 is literally written.`;

    // Use Gemini Flash for vision (free tier, excellent at OCR and image reading)
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return res.status(400).json({ message: 'Vision AI (GEMINI_API_KEY) is not configured on the server.' });
    }

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType, data: base64Data } }
    ]);

    let jsonString = result.response.text();

    // Strip markdown code fences if present
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

    // Safety net: clear any Jan 1 hallucination just in case
    const isJan1 = (d) => d && /^\d{4}-01-01$/.test(d);
    if (isJan1(parsedData.startDate)) parsedData.startDate = '';
    if (isJan1(parsedData.endDate)) parsedData.endDate = '';
    if (isJan1(parsedData.date)) parsedData.date = '';

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
    const groqClient = groq || (process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null);
    if (!groqClient) {
      return res.status(400).json({ message: 'AI service is not configured on the server.' });
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

    const systemPrompt = `You are SonaBot, the official AI assistant for SonaConnect — the campus event management platform for Sona College of Technology, Salem.

Your job is to help students discover, understand, and discuss campus events, clubs, hackathons, and workshops. Be friendly, conversational, and helpful.

Here is the LIVE data from SonaConnect right now:

EVENTS (${events.length} found):
${eventsContext || 'No events are currently listed on SonaConnect.'}

CLUBS (${clubs.length} found):
${clubsContext || 'No clubs are currently listed on SonaConnect.'}

STRICT RULES — follow these always:
1. NEVER make up or hallucinate events, clubs, dates, venues or any details that are not in the data above.
2. If the user asks "how many clubs" or "how many events", reply directly using the EXACT count provided above (e.g. "There are ${clubs.length} clubs currently listed." or "We have ${events.length} events coming up!").
3. If they ask about "upcoming events", list the next 2-3 events from the data above in a friendly way. If the events list is empty, say honestly: "There are no upcoming events listed right now. I'll let you know when new ones are added! 🙂"
4. If they ask about a specific event/club NOT in the data above, say: "That information hasn't been updated on SonaConnect yet."
5. Only answer based on the actual data provided above. Do not invent or suggest clubs/events from your general knowledge.
6. For general greetings or casual chat, respond naturally and warmly.
7. Keep responses short, friendly and well-formatted.`;


    // Build conversation history for context
    const messages = [{ role: 'system', content: systemPrompt }];
    
    if (history && Array.isArray(history)) {
      history.slice(-6).forEach(msg => {
        messages.push({ role: msg.role === 'bot' ? 'assistant' : 'user', content: msg.text });
      });
    }
    messages.push({ role: 'user', content: message });

    const chatCompletion = await groqClient.chat.completions.create({
      messages: messages,
      model: 'qwen/qwen3.6-27b', // Reliable model available on current tier
      temperature: 0.7,
    });

    let reply = chatCompletion.choices[0]?.message?.content || 'Sorry, I got confused for a second there.';

    // Strip out any <think> blocks if the model includes reasoning tokens
    reply = reply.replace(/<think>[\s\S]*?<\/think>\s*/gi, '');

    res.json({ reply });
  } catch (error) {
    console.error('ChatBot Error:', error);
    res.status(500).json({ message: error.message || 'Chatbot failed to respond.' });
  }
};

module.exports = { extractPosterData, chatEvent };


