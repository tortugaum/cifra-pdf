const { timeout } = require('puppeteer');
const puppeteer = require('puppeteer');

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function scrapeCifra(url, tune) {
  try {
    // Launch Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate to the URL
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    if (url.includes('key=')) {
      await waitForTranspose(page);
    }

    if (tune != 0) {
      for (let i = 0; i < tune; i++) {
        await page.click('#side-tom-more');
      }
      await waitForTranspose(page);
    }
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

const waitForTranspose = async (page) => {
  await page.waitForResponse(
    (response) => {
      return response.url().includes('transpose') && response.status() === 200;
    },
    { timeout: 9000 }
  );
};

async function scrapeSearchCifra(artist, song) {
  try {
    // Launch Puppeteer
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Navigate to the Cifra Club website
    await page.goto('https://www.cifraclub.com.br', {
      waitUntil: 'domcontentloaded',
    });

    // Wait for the search field to be available
    await page.waitForSelector('#js-h-search');

    // Set the search field value to the artist and song
    await page.type('#js-h-search', `${artist} ${song}`, { delay: 100 }); // Adding a delay for more natural typing

    // Wait for suggestions to appear (wait for 500 ms after typing)
    const suggestions = await page.evaluate(() => {
      const suggestionElements = document.querySelectorAll('.list-suggest a'); // Select all <a> elements in the suggestions list
      return Array.from(suggestionElements).map((el) => el.textContent.trim()); // Return the text content of each suggestion
    });
    // Click the first result under the list-suggest class
    await page.click('.list-suggest a');

    // Wait for the song page to load and the chords to appear
    await page.waitForSelector('.cifra_cnt.g-fix.cifra-mono pre');

    // Extract the song details
    const title = await page.$eval('h1.t1', (el) => el.textContent.trim());
    const artistName = await page.$eval('h2.t3', (el) => el.textContent.trim());
    const cifra = await page.$eval('.cifra_cnt.g-fix.cifra-mono pre', (el) =>
      el.textContent.trim()
    );

    // Close Puppeteer
    await browser.close();

    return { title, cifra, artist: artistName };
  } catch (error) {
    console.error('Erro ao acessar o site:', error);
    return null;
  }
}

module.exports = { scrapeCifra, scrapeSearchCifra };
