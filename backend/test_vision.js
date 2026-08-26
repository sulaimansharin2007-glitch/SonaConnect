require('dotenv').config();
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
  const result = await groq.chat.completions.create({
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: 'Describe this image. Return JSON {"title":"your description"}' },
        { type: 'image_url', image_url: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png' } }
      ]
    }],
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    response_format: { type: 'json_object' }
  });
  console.log('SUCCESS with URL:', result.choices[0].message.content);
}

test().catch(e => {
  console.log('ERROR status:', e.status);
  console.log('ERROR message:', e.message);
  console.log('ERROR body:', JSON.stringify(e.error || e.body || {}));
});
