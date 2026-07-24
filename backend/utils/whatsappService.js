const axios = require('axios');

const sendWhatsAppMessage = async (to, text) => {
  if (!process.env.WHATSAPP_TOKEN || !process.env.WHATSAPP_PHONE_ID) {
    console.log('⚠️ WHATSAPP_TOKEN or WHATSAPP_PHONE_ID missing in env');
    return false;
  }
  
  // Format phone number to clean digits
  const cleanPhone = to.replace(/[^0-9]/g, '');

  try {
    await axios.post(
      `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'text',
        text: { body: text },
      },
      { headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` } }
    );
    console.log(`📱 WhatsApp OTP sent to ${cleanPhone}`);
    return true;
  } catch (err) {
    console.error('Error sending WhatsApp message:', err?.response?.data || err.message);
    return false;
  }
};

module.exports = sendWhatsAppMessage;
