const fs = require('fs');
const https = require('https');
const path = require('path');
const qrcodeTerminal = require('qrcode-terminal');

const expoUrl = 'exp://192.168.29.130:8081';
const artifactPath = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\df97bf82-52cb-4e73-8186-21ac170c9064\\expo_qr.png';

console.log('\n================ EXPO METRO QR CODE ================');
console.log('Connecting to:', expoUrl);
console.log('=====================================================\n');

qrcodeTerminal.generate(expoUrl, { small: true }, (qrcode) => {
  console.log(qrcode);
});

// Download high-resolution PNG QR code for artifacts
const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=450x450&data=${encodeURIComponent(expoUrl)}&margin=10`;

https.get(qrApiUrl, (res) => {
  if (res.statusCode === 200) {
    const fileStream = fs.createWriteStream(artifactPath);
    res.pipe(fileStream);
    fileStream.on('finish', () => {
      fileStream.close();
      console.log('\n[SUCCESS] Updated QR Image saved to:', artifactPath);
    });
  } else {
    console.warn('Failed to fetch QR image, status:', res.statusCode);
  }
}).on('error', (err) => {
  console.warn('Network error fetching QR image:', err.message);
});
