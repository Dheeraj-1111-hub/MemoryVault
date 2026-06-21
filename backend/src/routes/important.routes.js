const express = require('express');
const router = express.Router();
const importantController = require('../controllers/important.controller');

router.get('/', importantController.getDashboard);

module.exports = router;
