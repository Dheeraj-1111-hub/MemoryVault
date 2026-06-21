const express = require('express');
const router = express.Router();
const timelineController = require('../controllers/timeline.controller');

router.get('/', timelineController.getTimeline);
router.get('/upcoming', timelineController.getUpcoming);
router.get('/history', timelineController.getHistory);

module.exports = router;
