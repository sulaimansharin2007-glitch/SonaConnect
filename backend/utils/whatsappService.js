const axios = require('axios');

const sendWhatsAppMessage = async (to, text) => {
  if (!process.env.WHATSAPP_TOKEN || !process.env.WHATSAPP_PHONE_ID) {
    console.log('⚠️ WHATSAPP_TOKEN or WHATSAPP_PHONE_ID missing in env');
    return { success: false, error: 'WHATSAPP_TOKEN or WHATSAPP_PHONE_ID not set in server environment.' };
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
    return { success: true };
  } catch (err) {
    const errorMsg = err?.response?.data?.error?.message || err.message;
    console.error('Error sending WhatsApp message:', err?.response?.data || err.message);
    return { success: false, error: errorMsg };
  }
};

module.exports = sendWhatsAppMessage;
