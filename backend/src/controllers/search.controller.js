const searchService = require('../services/search/search.service');

exports.search = async (req, res) => {
  try {
    const userId = req.user.id;
    const docs = await searchService.executeSearch(userId, req.query);
    
    // If there is a query, asynchronously save it
    if (req.query.q) {
      searchService.saveSearch(userId, req.query.q).catch(console.error);
    }
    
    res.status(200).json({ success: true, results: docs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.user.id;
    const suggestions = await searchService.getSuggestions(userId, q);
    res.status(200).json({ success: true, suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRecent = async (req, res) => {
  try {
    const userId = req.user.id;
    const recent = await searchService.getRecentSearches(userId);
    res.status(200).json({ success: true, recent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.saveSearch = async (req, res) => {
  try {
    const userId = req.user.id;
    await searchService.saveSearch(userId, req.body.q);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
