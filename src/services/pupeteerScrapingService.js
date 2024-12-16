const { timeout } = require('puppeteer');
const puppeteer = require('puppeteer');

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function scrapeCifra(url, tune = 0) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

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

    const title = await page.$eval('h1.t1', (el) => el.textContent.trim());
    const artist = await page.$eval('h2.t3', (el) => el.textContent.trim());
    const cifra = await page.$eval('.cifra_cnt.g-fix.cifra-mono pre', (el) =>
      el.textContent.trim()
    );

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

async function scrapeSearchCifra(song) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto('https://www.cifraclub.com.br', {
      waitUntil: 'domcontentloaded',
    });

    await page.waitForSelector('#js-h-search');

    await page.type('#js-h-search', `${song}`, { delay: 100 });

    const suggestions = await page.evaluate(() => {
      const suggestionElements = document.querySelectorAll('.list-suggest a');
      return Array.from(suggestionElements).map((el) => el.textContent.trim());
    });
    await page.click('.list-suggest a');

    await page.waitForSelector('.cifra_cnt.g-fix.cifra-mono pre');

    const title = await page.$eval('h1.t1', (el) => el.textContent.trim());
    const artistName = await page.$eval('h2.t3', (el) => el.textContent.trim());
    const cifra = await page.$eval('.cifra_cnt.g-fix.cifra-mono pre', (el) =>
      el.textContent.trim()
    );

    await browser.close();

    return { title, cifra, artist: artistName };
  } catch (error) {
    console.error('Erro ao acessar o site:', error);
    return null;
  }
}

module.exports = { scrapeCifra, scrapeSearchCifra };
