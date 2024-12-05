const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeCifra(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Extrair o título e a cifra
    const title = $('h1.t1').text().trim();
    const artist = $('h2.t2').text().trim();
    const cifra = $('.cifra_cnt.g-fix.cifra-mono').text().trim();

    return { title, cifra, artist };
  } catch (error) {
    console.error('Erro ao acessar o site:', error);
    return null;
  }
}

module.exports = { scrapeCifra };
