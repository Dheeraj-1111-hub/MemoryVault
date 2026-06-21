const Chat = require('../../models/Chat');
const { routeQuery } = require('./queryRouter');
const { retrieveDocuments } = require('./retrieveDocuments');
const { buildContext } = require('./buildContext');
const { generateAnswer } = require('./generateAnswer');
const crypto = require('crypto');

exports.askQuestion = async (userId, threadId, question) => {
  // 1. Get or Create Thread
  let chat = await Chat.findOne({ userId, threadId });
  if (!chat) {
    chat = new Chat({
      userId,
      threadId,
      title: question.substring(0, 50),
      messages: []
    });
  }

  // Add User Message
  chat.messages.push({
    id: 'u_' + crypto.randomBytes(4).toString('hex'),
    role: 'user',
    text: question
  });

  // 2. Route Query
  const route = await routeQuery(question);

  let finalResponse;

  if (route.type === 'direct_search') {
    // Fast path: bypass synthesis
    if (route.intent === 'deadlines') {
      const TimelineEvent = require('../../models/TimelineEvent');
      const now = new Date();
      const events = await TimelineEvent.find({ userId, date: { $gte: now } })
        .populate('sourceDocumentId', 'title kind _id')
        .sort({ date: 1 })
        .limit(10)
        .lean();
        
      if (events.length === 0) {
        finalResponse = {
          answer: "You don't have any upcoming deadlines or events in your timeline.",
          confidence: 100,
          sources: [],
          followUps: []
        };
      } else {
        const eventsList = events.map(e => `- **${e.title}** on ${new Date(e.date).toDateString()}`).join('\n');
        finalResponse = {
          answer: `Here are your upcoming deadlines and events:\n\n${eventsList}`,
          confidence: 100,
          sources: events.map(e => ({ 
            documentId: e.sourceDocumentId?._id, 
            title: e.sourceDocumentId?.title || 'Unknown', 
            kind: e.sourceDocumentId?.kind || 'pdf' 
          })).filter(s => s.documentId),
          followUps: []
        };
      }
    } else if (route.intent === 'notifications') {
      const Notification = require('../../models/Notification');
      const unreadNotifs = await Notification.find({ userId, isRead: false }).sort({ createdAt: -1 }).limit(10).lean();
      
      if (unreadNotifs.length === 0) {
        finalResponse = {
          answer: "You don't have any unread notifications or reminders right now. You're all caught up!",
          confidence: 100,
          sources: [],
          followUps: []
        };
      } else {
        const notifsList = unreadNotifs.map((n, i) => `${i + 1}. **${n.title}**: ${n.message}`).join('\n\n');
        finalResponse = {
          answer: `Here is what you should pay attention to:\n\n${notifsList}`,
          confidence: 100,
          sources: [],
          followUps: []
        };
      }
    } else {
      const docs = await retrieveDocuments(userId, question);
      
      if (docs.length === 0) {
        finalResponse = {
          answer: "I couldn't find any documents matching your request.",
          confidence: 0,
          sources: [],
          followUps: []
        };
      } else {
        finalResponse = {
          answer: `Here are the top documents I found for your request:`,
          confidence: 95,
          sources: docs.map(d => ({ documentId: d._id, title: d.title, kind: d.kind })),
          followUps: []
        };
      }
    }

  } else {
    // Synthesis Path (RAG)
    const docs = await retrieveDocuments(userId, question);
    
    if (docs.length === 0) {
      finalResponse = {
        answer: "I don't have any uploaded documents that contain the answer to your question.",
        confidence: 0,
        sources: [],
        followUps: []
      };
    } else {
      const User = require('../../models/User');
      const user = await User.findById(userId);
      const settings = user?.settings || {};

      const contextString = buildContext(docs);
      finalResponse = await generateAnswer(question, contextString, docs, settings);
    }
  }

  // 3. Add AI Message
  const aiMessage = {
    id: 'a_' + crypto.randomBytes(4).toString('hex'),
    role: 'ai',
    text: finalResponse.answer,
    confidence: finalResponse.confidence,
    sources: finalResponse.sources,
    followUps: finalResponse.followUps
  };

  chat.messages.push(aiMessage);
  chat.updatedAt = Date.now();
  await chat.save();

  return aiMessage;
};

exports.getThreadHistory = async (userId, threadId) => {
  const chat = await Chat.findOne({ userId, threadId }).lean();
  return chat ? chat.messages : [];
};
