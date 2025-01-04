import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [data, setData] = useState(null);
  const [captchaContent, setCaptchaContent] = useState(null);
  const [captchaSolved, setCaptchaSolved] = useState(false);

  const url = 'https://www.rvtrader.com/Class-B/rvs-for-sale?type=Class%20B%7C198068&zip=91361&radius=150';
  const loginUrl = 'https://www.rvtrader.com/myt/login'; // Replace with the actual login URL

  const handleScrapeData = async () => {
    console.log('Sending scrape request with URL:', url, 'and login URL:', loginUrl);
    try {
      const response = await axios.post('http://192.168.1.126:3000/scrape', { // Ensure the correct backend URL
        url,
        loginUrl,
        captchaSolved
      });
      console.log('Scrape request successful, response data:', response.data);
      if (response.data.captcha) {
        setCaptchaContent(response.data.content);
        setCaptchaSolved(true);
      } else {
        setData(response.data.content);
        setCaptchaContent(null);
        setCaptchaSolved(false);
      }
    } catch (error) {
      console.error('Error during scrape request:', error);
    }
  };

  const handleCaptchaSolved = () => {
    setCaptchaSolved(true);
    handleScrapeData();
  };

  return (
    <div>
      <h1>Welcome to Car Compass</h1>
      <button onClick={handleScrapeData}>Scrape Data</button>
      {captchaContent && (
        <div>
          <h2>CAPTCHA Detected. Please solve it below:</h2>
          <iframe
            srcDoc={captchaContent}
            style={{ width: '100%', height: '500px', border: 'none' }}
            title="CAPTCHA"
          ></iframe>
          <button onClick={handleCaptchaSolved}>I have solved the CAPTCHA</button>
        </div>
      )}
      {data && (
        <div>
          <h2>Scraped Data:</h2>
          <pre>{data}</pre>
        </div>
      )}
    </div>
  );
}

export default App;