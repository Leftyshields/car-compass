const express = require('express');
const router = express.Router();
const { scrapeData } = require('../services/scraper');

router.get('/scrape', async (req, res) => {
  const url = req.query.url;
  const loginUrl = req.query.loginUrl;

  console.log(`Received scrape request for URL: ${url} with login URL: ${loginUrl}`);

  try {
    const data = await scrapeData(url, loginUrl);
    console.log('Scraping successful, sending data back to client.');
    res.json({ data });
  } catch (error) {
    console.error('Error during scraping:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;