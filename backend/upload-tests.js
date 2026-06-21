const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

const email = 'test_dheeraj@gmail.com';
const password = 'Test@123';
const outDir = 'C:\\Users\\Sai Dheeraj\\OneDrive\\Desktop\\Main_Projects\\test_docs';
const filesToUpload = ['Resume.pdf', 'PAN.jpg', 'Nokia_Notice.pdf', 'Electricity_Bill.pdf'];

async function run() {
  // 1. Login
  const loginRes = await axios.post('http://127.0.0.1:5000/api/auth/login', { email, password });
  const token = loginRes.data.token;
  console.log('Logged in successfully.');

  // 2. Upload files
  for (const filename of filesToUpload) {
    const filePath = path.join(outDir, filename);
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    
    try {
      const uploadRes = await axios.post('http://127.0.0.1:5000/api/documents/upload', form, {
        headers: {
          'Authorization': `Bearer ${token}`,
          ...form.getHeaders()
        }
      });
      console.log(`Uploaded ${filename}:`, uploadRes.data.message || uploadRes.data);
    } catch (err) {
      console.error(`Failed to upload ${filename}:`, err.response?.data || err.message);
    }
  }
}

run();
