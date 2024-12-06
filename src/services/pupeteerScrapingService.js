const { timeout } = require('puppeteer');
const puppeteer = require('puppeteer');

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function scrapeCifra(url) {
  try {
    // Launch Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate to the URL
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    await page.waitForResponse((response) => {
      console.log(response.url());
      return response.url().includes('transpose') && response.status() === 200; // Adjust this to match the network request URL or other criteria
    });
    // Extract the necessary data
    const title = await page.$eval('h1.t1', (el) => el.textContent.trim());
    const artist = await page.$eval('h2.t3', (el) => el.textContent.trim());
    const cifra = await page.$eval('.cifra_cnt.g-fix.cifra-mono pre', (el) =>
      el.textContent.trim()
    );

    // Close Puppeteer
    await browser.close();

    return { title, cifra, artist };
  } catch (error) {
    console.error('Erro ao acessar o site:', error);
    return null;
  }
}

module.exports = { scrapeCifra };
