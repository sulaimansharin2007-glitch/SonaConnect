const QRCode = require('qrcode');

const generateQRCode = async (data) => {
  try {
    const qrDataURL = await QRCode.toDataURL(JSON.stringify(data), {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: { dark: '#6C63FF', light: '#FFFFFF' },
      width: 300,
    });
    return qrDataURL;
  } catch (err) {
    console.error('QR Generation Error:', err);
    return '';
  }
};

module.exports = generateQRCode;
