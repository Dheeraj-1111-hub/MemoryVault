const fs = require('fs');
const PDFDocument = require('pdfkit');
const path = require('path');

const outDir = 'C:\\Users\\Sai Dheeraj\\OneDrive\\Desktop\\Main_Projects\\test_docs';

function createPdf(filename, text) {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(path.join(outDir, filename)));
  doc.fontSize(25).text(text, 100, 100);
  doc.end();
}

createPdf('Resume.pdf', 'Sai Dheeraj Resume\n\nExperience:\n- Software Engineer at Digital Heroes\n- Proficient in React, Node.js, and MongoDB.\n\nEducation:\n- B.Tech in Computer Science');
createPdf('Nokia_Notice.pdf', 'Nokia Placement Notice\n\nDate: 2026-06-25\nThe upcoming Nokia technical assessment interview is scheduled for 28 June 2026. Please be prepared with your identity documents.');
createPdf('Electricity_Bill.pdf', 'Monthly Electricity Bill\n\nAmount Due: $150.00\nDue Date: 2026-07-05\nAccount: 123456789\nPlease pay immediately to avoid service interruption.');

// Create a dummy PAN.jpg
// We'll just copy an existing small image or create a solid color image if we had canvas.
// For now, let's just make it a small 1x1 valid PNG renamed to JPG or just use an empty file if the app doesn't validate image content.
// Actually, tesseract will fail on a 1x1 empty image. Let's create a very basic text image using Node canvas or just use another PDF instead, but the user explicitly requested "PAN.jpg".
// I'll just write a base64 encoded valid small JPG.
const jpgBase64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
fs.writeFileSync(path.join(outDir, 'PAN.jpg'), Buffer.from(jpgBase64, 'base64'));

console.log('Files created.');
