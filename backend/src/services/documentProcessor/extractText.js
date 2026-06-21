const fs = require('fs');
const pdfParse = require('pdf-parse');
const tesseract = require('tesseract.js');
const path = require('path');

exports.extractTextFromPDF = async (filePath) => {
  try {
    const absolutePath = path.join(__dirname, '../../../', filePath);
    const dataBuffer = fs.readFileSync(absolutePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw error;
  }
};

exports.extractTextFromImage = async (filePath) => {
  try {
    const absolutePath = path.join(__dirname, '../../../', filePath);
    const result = await tesseract.recognize(absolutePath, 'eng');
    return result.data.text;
  } catch (error) {
    console.error('Error extracting Image text:', error);
    throw error;
  }
};
