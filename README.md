# Car Compass

## Overview

Car Compass is a web scraping project designed to scrape data from an auto trader website and store it in a PostgreSQL database. The project uses Puppeteer for web scraping and Express for the backend server.

## Progress

- Implemented CAPTCHA handling using Puppeteer and StealthPlugin.
- Successfully scraped data from the website.
- Parsed the scraped HTML content to extract relevant data (titles and prices).
- Stored the extracted data in a PostgreSQL database.

## Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/Leftyshields/car-compass.git
   cd car-compass
   ```

### Backend
1. Navigate to the `backend` directory.
2. Install dependencies:
   ```
   npm install
   ```
3. Start the Express server:
   ```
   node app.js
   ```

### Frontend
1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```
   npm install
   ```
3. Start the React application:
   ```
   npm start
   ```

## Usage
Once both the backend and frontend are running, you can access the application in your web browser. The API endpoints can be tested using tools like Postman or directly from the frontend.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.