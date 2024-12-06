const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeCifra(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Extrair o título e o artista
    const title = $('h1.t1').text().trim();
    const artist = $('h2.t3').text().trim();

    // Extrair a cifra (apenas o texto, sem HTML)
    const cifra = $('.cifra_cnt.g-fix.cifra-mono pre').text().trim();

    return { title, cifra, artist };
  } catch (error) {
    console.error('Erro ao acessar o site:', error);
    return null;
  }
}

module.exports = { scrapeCifra };
