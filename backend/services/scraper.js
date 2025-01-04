require('dotenv').config(); // Ensure this is at the top

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function simulateHumanBehavior(page) {
  console.log('Simulating human behavior...');
  // Random mouse movements
  await page.mouse.move(getRandomInt(0, 100), getRandomInt(0, 100));
  await page.waitForTimeout(getRandomInt(100, 500));
  await page.mouse.move(getRandomInt(100, 200), getRandomInt(100, 200));
  await page.waitForTimeout(getRandomInt(100, 500));

  // Random keyboard interactions
  await page.keyboard.press('Tab');
  await page.waitForTimeout(getRandomInt(100, 500));
  await page.keyboard.press('Tab');
  await page.waitForTimeout(getRandomInt(100, 500));
}

async function loginAndGetCookies(loginUrl, captchaSolved = false) {
  const username = process.env.LOGIN_USERNAME;
  const password = process.env.LOGIN_PASSWORD;
  console.log('Starting login process...');
  console.log(`Username: ${username}, Password: ${password}`);
  
  if (typeof username !== 'string' || typeof password !== 'string') {
    throw new Error('Username and password must be strings');
  }

  const browser = await puppeteer.launch({
    headless: false, // Run in non-headless mode
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-blink-features=AutomationControlled'
    ]
  });
  const page = await browser.newPage();

  // Rotate user agent
  const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
  await page.setUserAgent(userAgent);
  console.log(`Using user agent: ${userAgent}`);

  // Set viewport
  await page.setViewport({ width: 1280, height: 800 });
  console.log('Viewport set to 1280x800');

  console.log(`Navigating to login URL: ${loginUrl}`);
  await page.goto(loginUrl, { waitUntil: 'networkidle2' });

  try {
    // Log the presence of elements along the XPath
    await page.waitForTimeout(2000); // Wait for 2 seconds to ensure the page is loaded
    const htmlExists = await page.evaluate(() => !!document.querySelector('html'));
    console.log('HTML element exists:', htmlExists);

    const bodyExists = await page.evaluate(() => !!document.querySelector('body'));
    console.log('Body element exists:', bodyExists);

    const formExists = await page.evaluate(() => !!document.querySelector('form'));
    console.log('Form element exists:', formExists);

    const usernameFieldExists = await page.evaluate(() => !!document.querySelector('#email1'));
    console.log('Username field exists:', usernameFieldExists);

    // Log the entire HTML content for debugging
    const pageContent = await page.content();
    console.log('Page content:', pageContent);

    // Check for CAPTCHA
    const captchaExists = await page.evaluate(() => !!document.querySelector('iframe[title="DataDome CAPTCHA"]'));
    if (captchaExists && !captchaSolved) {
      console.log('CAPTCHA detected. Returning page content for manual solving.');
      await browser.close();
      return { captcha: true, content: pageContent };
    }

    // Wait for the form to be visible
    console.log('Waiting for form to be visible...');
    await page.waitForSelector('form', { visible: true, timeout: 60000 });
    console.log('Form is visible.');

    // Wait for the username field to be available
    console.log('Waiting for username field...');
    await page.waitForXPath('//input[@id="email1"]', { visible: true, timeout: 60000 });
    console.log('Username field found, typing username...');
    const usernameField = await page.$x('//input[@id="email1"]');
    await usernameField[0].type(username); // Adjust the selector to match the username input field

    // Wait for the password field to be available
    console.log('Waiting for password field...');
    await page.waitForXPath('//input[@name="password"]', { visible: true, timeout: 60000 });
    console.log('Password field found, typing password...');
    const passwordField = await page.$x('//input[@name="password"]');
    await passwordField[0].type(password); // Adjust the selector to match the password input field

    // Wait for the login button to be available
    console.log('Waiting for login button...');
    await page.waitForXPath('//button[@type="submit"]', { visible: true, timeout: 60000 });
    console.log('Login button found, clicking login button...');
    const loginButton = await page.$x('//button[@type="submit"]');
    await loginButton[0].click(); // Adjust the selector to match the login button

    console.log('Waiting for navigation after login...');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Get cookies
    console.log('Getting cookies...');
    const cookies = await page.cookies();
    console.log('Login successful, cookies obtained:', cookies);

    await browser.close();
    return { captcha: false, cookies };
  } catch (error) {
    console.error('Error during login process:', error.message);
    await browser.close();
    throw error;
  }
}

async function scrapeData(url, loginUrl, captchaSolved = false) {
  console.log('Scraping data with login URL:', loginUrl);
  const loginResult = await loginAndGetCookies(loginUrl, captchaSolved);

  if (loginResult.captcha) {
    console.log('CAPTCHA detected. Returning page content for manual solving.');
    return { captcha: true, content: loginResult.content };
  }

  const cookies = loginResult.cookies;

  const browser = await puppeteer.launch({
    headless: false, // Run in non-headless mode
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-blink-features=AutomationControlled'
    ]
  });
  const page = await browser.newPage();

  // Rotate user agent
  const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
  await page.setUserAgent(userAgent);
  console.log(`Using user agent: ${userAgent}`);

  // Set viewport
  await page.setViewport({ width: 1280, height: 800 });
  console.log('Viewport set to 1280x800');

  // Add a delay to mimic human behavior
  console.log('Adding delay to mimic human behavior...');
  await page.waitForTimeout(getRandomInt(3000, 8000));

  // Set cookies
  console.log('Setting cookies...');
  await page.setCookie(...cookies);

  console.log(`Navigating to URL: ${url}`);
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Simulate human behavior
  await simulateHumanBehavior(page);

  try {
    // Get the HTML body content
    console.log('Getting HTML body content...');
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);

    console.log('Scraping successful, HTML content obtained.');
    await browser.close();

    // Parse the HTML content
    const listings = await parseHTML(bodyHTML);
    console.log('Parsed listings:', listings);

    // Save listings to the database
    await saveListings(listings);
    console.log('Listings saved to the database.');

    return { captcha: false, content: listings };
  } catch (error) {
    console.error('Error during scraping:', error.message);
    await browser.close();
    throw new Error(`Evaluation failed: ${error.message}`);
  }
}

module.exports = { scrapeData };