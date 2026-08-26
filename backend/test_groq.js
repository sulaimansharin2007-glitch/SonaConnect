require('dotenv').config();
const fs = require('fs');
const path = require('path');
const Groq = require('groq-sdk');

async function testLogo() {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const logoPath = path.join(__dirname, '../frontend/public/logo.png');
    const buf = fs.readFileSync(logoPath);
    const b64 = buf.toString('base64');
    
    console.log("Reading logo.png size:", buf.length, "bytes");
    console.log("Sending Groq request...");
    
    const res = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this image and describe it in JSON format: {"summary": "..."}' },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}` } }
          ]
        }
      ],
      model: 'qwen/qwen3.6-27b',
      response_format: { type: 'json_object' }
    });
    
    console.log("🎉 GROQ SUCCESS!");
    console.log("Output:", res.choices[0]?.message?.content);
  } catch (err) {
    console.error("❌ GROQ FAILED:", err);
  }
}

testLogo();
