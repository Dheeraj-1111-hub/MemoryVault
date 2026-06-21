const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');

// GET /api/search?q=...&type=...
router.get('/', searchController.search);

// GET /api/search/suggestions?q=...
router.get('/suggestions', searchController.getSuggestions);

// GET /api/search/recent
router.get('/recent', searchController.getRecent);

// POST /api/search/save
router.post('/save', searchController.saveSearch);

module.exports = router;
