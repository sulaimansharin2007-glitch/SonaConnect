const { GoogleGenAI } = require('@google/genai');

// Initialize Gemini API
let ai;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
} catch (err) {
  console.log('Gemini API initialization skipped (No API key found)');
}

// @desc    Extract event details from a base64 poster image
// @route   POST /api/ai/extract-poster
const extractPosterData = async (req, res) => {
  try {
    if (!ai) {
      return res.status(400).json({ message: 'Gemini API key is not configured in the backend' });
    }

    const { base64Image } = req.body;
    
    if (!base64Image) {
      return res.status(400).json({ message: 'No image provided' });
    }

    // The frontend sends base64 string which might have "data:image/jpeg;base64," prefix.
    let mimeType = 'image/jpeg';
    const matches = base64Image.match(/^data:(image\/\w+);base64,/);
    if (matches && matches[1]) {
      mimeType = matches[1];
    }
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');

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

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    let jsonString = response.text;
    
    // Sometimes Gemini wraps response in markdown even with application/json
    const markdownMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[1]) {
      jsonString = markdownMatch[1];
    } else {
      // Fallback: try to find the outermost JSON object
      const start = jsonString.indexOf('{');
      const end = jsonString.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        jsonString = jsonString.substring(start, end + 1);
      }
    }
    
    let parsedData = {};
    try {
      parsedData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON Parse Error. Raw string:', jsonString);
      throw new Error('AI returned invalid data format. Please try again.');
    }

    res.json(parsedData);
  } catch (error) {
    console.error('AI Extraction Error:', error);
    res.status(500).json({ message: error.message || 'Failed to extract data from image' });
  }
};

// @desc    AI Chatbot — students ask about events
// @route   POST /api/ai/chat
const chatEvent = async (req, res) => {
  try {
    if (!ai) {
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

Here is the context about current events on SonaConnect:
${eventsContext || 'No events found currently.'}

Here is the context about active clubs on SonaConnect:
${clubsContext || 'No clubs found currently.'}

Guidelines:
- Answer questions naturally, even if they are general greetings or casual conversation.
- If asked about events, clubs, hackathons, or workshops, use the context provided above to give accurate answers.
- Pay attention to specific criteria like "for which department", "which year", "eligibility", etc., and answer accordingly.
- If they ask something completely irrelevant to the college/platform, answer playfully but guide them back to campus activities.
- Keep responses brief, clear, and well-formatted.`;

    // Build conversation history for context
    const conversationParts = [];
    if (history && Array.isArray(history)) {
      history.slice(-6).forEach(msg => {
        conversationParts.push({ role: msg.role === 'bot' ? 'model' : 'user', parts: [{ text: msg.text }] });
      });
    }
    conversationParts.push({ role: 'user', parts: [{ text: message }] });

    const model = ai.chats.create({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
      history: conversationParts.slice(0, -1),
    });

    const result = await model.sendMessage({ message });
    const reply = result.text;

    res.json({ reply });
  } catch (error) {
    console.error('ChatBot Error:', error);
    res.status(500).json({ message: error.message || 'Chatbot failed to respond.' });
  }
};

module.exports = { extractPosterData, chatEvent };


