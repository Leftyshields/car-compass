// filepath: /home/brian/docker/Car-Compass/backend/routes/index.js
const express = require('express');
const router = express.Router();

const scraperRoutes = require('./scraperRoutes');

router.use('/scraper', scraperRoutes);

module.exports = router;