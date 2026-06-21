const Document = require('../../models/Document');
const statsService = require('./stats.service');
const deadlinesService = require('./deadlines.service');
const insightsService = require('./insights.service');
const suggestionsService = require('./suggestions.service');
const healthService = require('./health.service');

exports.getDashboardData = async (userId) => {
  const [stats, deadlines, insights, suggestions, health, recentDocs] = await Promise.all([
    statsService.getStats(userId),
    deadlinesService.getUpcomingDeadlines(userId),
    insightsService.getInsights(userId),
    suggestionsService.getSuggestions(userId),
    healthService.getHealthScore(userId),
    Document.find({ userId }).sort({ uploadDate: -1 }).limit(4).lean()
  ]);

  const recentUploads = recentDocs.map(doc => ({
    id: doc._id,
    title: doc.title,
    filename: doc.fileName,
    category: doc.category,
    documentType: doc.documentType,
    kind: doc.kind,
    uploadedAt: doc.uploadDate,
    tags: doc.tags,
    summary: doc.summary,
    excerpt: doc.extractedText,
    filePath: doc.filePath,
    important: doc.isImportant,
    status: doc.status,
    fields: doc.metadata,
    dates: doc.dates,
    companies: doc.companies,
    salaries: doc.salaries,
    entities: doc.entities
  }));

  return {
    stats,
    recentUploads,
    insights,
    deadlines,
    suggestions,
    health
  };
};
