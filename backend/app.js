require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const { scrapeData } = require('./services/scraper');

// Initialize the Express application
const app = express();

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Define routes
const scraperRoutes = require('./routes/scraperRoutes');
app.use('/api', scraperRoutes);

app.post('/scrape', async (req, res) => {
  const { url, loginUrl } = req.body;
  console.log(`Received scrape request for URL: ${url} with login URL: ${loginUrl}`);
  
  try {
    const result = await scrapeData(url, loginUrl);
    res.json(result);
  } catch (error) {
    console.error('Error during scraping:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});