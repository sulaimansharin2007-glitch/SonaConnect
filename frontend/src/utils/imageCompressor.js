/**
 * Compresses an image (base64 or File) before sending to AI.
 * Resizes to max 1000px wide and reduces JPEG quality to 70%.
 * This reduces payload from ~3MB to ~100KB → 5-10x faster AI extraction.
 */
export const compressImageForAI = (base64OrDataUrl) => {
  return new Promise((resolve) => {
    // If it's already a URL (not base64), return as-is
    if (!base64OrDataUrl || base64OrDataUrl.startsWith('http')) {
      resolve(base64OrDataUrl);
      return;
    }

    const img = new Image();
    img.onload = () => {
      const MAX_WIDTH = 1000;
      const MAX_HEIGHT = 1000;

      let { width, height } = img;

      // Scale down if too large
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Output as JPEG at 70% quality
      const compressed = canvas.toDataURL('image/jpeg', 0.7);
      resolve(compressed);
    };

    img.onerror = () => resolve(base64OrDataUrl); // fallback: send original
    img.src = base64OrDataUrl;
  });
};
