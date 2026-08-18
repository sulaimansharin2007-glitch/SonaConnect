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
    const groqClient = groq || (process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null);
    if (!groqClient) {
      return res.status(400).json({ message: 'AI service is not configured on the server.' });
    }

    const { base64Image } = req.body;
    if (!base64Image) {
      return res.status(400).json({ message: 'No image provided' });
    }

    let mimeType = 'image/jpeg';
    let base64Data;

    // Check if it's a URL or already base64
    if (base64Image.startsWith('http://') || base64Image.startsWith('https://')) {
      const axios = require('axios');
      const imageResponse = await axios.get(base64Image, { responseType: 'arraybuffer' });
      mimeType = (imageResponse.headers['content-type'] || 'image/jpeg').split(';')[0];
      base64Data = Buffer.from(imageResponse.data).toString('base64');
    } else {
      const matches = base64Image.match(/^data:(image\/\w+);base64,/);
      if (matches && matches[1]) mimeType = matches[1];
      base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    }

    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    const prompt = `You are an AI assistant that extracts event details from posters.
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
For the date, use YYYY-MM-DD format. If a date range is given (e.g. Sep 3-5), use the start date.`;

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
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    let jsonString = chatCompletion.choices[0]?.message?.content || '{}';

    // Strip markdown if present
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
      throw new Error('AI returned invalid data format. Please try again.');
    }

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
      model: 'llama-3.1-8b-instant', // fast and great for general chat
      temperature: 0.7,
    });

    const reply = chatCompletion.choices[0]?.message?.content || 'Sorry, I got confused for a second there.';

    res.json({ reply });
  } catch (error) {
    console.error('ChatBot Error:', error);
    res.status(500).json({ message: error.message || 'Chatbot failed to respond.' });
  }
};

module.exports = { extractPosterData, chatEvent };


