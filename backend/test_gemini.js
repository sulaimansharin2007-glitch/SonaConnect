require('dotenv').config();

const GEMINI_KEY = process.env.GEMINI_API_KEY;

console.log("Testing API key:", GEMINI_KEY.substring(0, 10) + "...");

fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ contents: [{ parts: [{ text: "Say hello" }] }] })
})
.then(r => r.json())
.then(data => {
  if (data.error) {
    console.error("❌ FAILED:", data.error.code, data.error.message.substring(0, 200));
  } else {
    console.log("✅ SUCCESS! Reply:", data.candidates[0].content.parts[0].text);
  }
});
