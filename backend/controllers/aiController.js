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

module.exports = { extractPosterData };
