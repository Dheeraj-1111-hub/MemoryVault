require('dotenv').config();
const mongoose = require('mongoose');
const Document = require('./src/models/Document');
const { processDocument } = require('./src/services/documentProcessor/processDocument');

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
  console.log('Connected to DB');
  
  const failedDocs = await Document.find({ status: 'failed' }).limit(1);
  if (failedDocs.length === 0) {
    console.log('No failed docs found.');
    process.exit(0);
  }
  
  console.log('Found failed doc:', failedDocs[0]._id, failedDocs[0].title);
  
  try {
    await processDocument(failedDocs[0]._id);
  } catch (err) {
    console.error('Test error:', err);
  }
  
  process.exit(0);
};

run();
