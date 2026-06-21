const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Document = require('./src/models/Document');
const TimelineEvent = require('./src/models/TimelineEvent');
const Notification = require('./src/models/Notification');
const Chat = require('./src/models/Chat');
const SavedSearch = require('./src/models/SavedSearch');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Create Demo User
    const demoEmail = 'demo@memoryvault.com';
    let user = await User.findOne({ email: demoEmail });

    if (!user) {
      console.log('Creating demo user...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      user = await User.create({
        name: 'Demo User',
        email: demoEmail,
        password: hashedPassword,
        storageUsed: 0
      });
      console.log('Demo user created with ID:', user._id);
    } else {
      console.log('Demo user already exists with ID:', user._id);
    }

    // Assign orphaned documents to demo user
    console.log('Assigning orphaned documents to demo user...');
    const docResult = await Document.updateMany({ userId: { $exists: false } }, { userId: user._id });
    console.log(`Updated ${docResult.modifiedCount} documents.`);

    console.log('Assigning orphaned timeline events...');
    const timelineResult = await TimelineEvent.updateMany({ userId: { $exists: false } }, { userId: user._id });
    console.log(`Updated ${timelineResult.modifiedCount} timeline events.`);

    console.log('Assigning orphaned notifications...');
    const notifResult = await Notification.updateMany({ userId: { $exists: false } }, { userId: user._id });
    console.log(`Updated ${notifResult.modifiedCount} notifications.`);

    console.log('Assigning orphaned chats...');
    const chatResult = await Chat.updateMany({ userId: { $exists: false } }, { userId: user._id });
    console.log(`Updated ${chatResult.modifiedCount} chats.`);
    
    console.log('Assigning orphaned saved searches...');
    const searchResult = await SavedSearch.updateMany({ userId: { $exists: false } }, { userId: user._id });
    console.log(`Updated ${searchResult.modifiedCount} saved searches.`);

    console.log('Database seeded and migrated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
