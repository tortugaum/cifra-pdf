const { isURL } = require('validator');
const express = require('express');
const {
  scrapeCifra,
  scrapeSearchCifra,
} = require('../services/pupeteerScrapingService');
const pdfQueue = require('../queues/pdfQueue');

const router = express.Router();

router.post('/generate', async (req, res) => {
  const { urls, name = null, tune = 0 } = req.body; // Accepts an array of URLs

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return res
      .status(400)
      .json({ error: 'É necessário fornecer pelo menos uma URL.' });
  }

  for (let url of urls) {
    if (!isURL(url, { require_protocol: true })) {
      return res
        .status(400)
        .json({ error: `A URL fornecida é inválida: ${url}` });
    }

    if (!url.includes('cifraclub.com.br')) {
      return res
        .status(400)
        .json({ error: `A URL deve ser do site Cifra Club: ${url}` });
    }
  }

  try {
    const cifraDataArray = [];

    for (let url of urls) {
      const cifraData = await scrapeCifra(url, tune);
      if (!cifraData) {
        return res
          .status(404)
          .json({ error: `Cifra não encontrada para a URL: ${url}` });
      }
      cifraDataArray.push(cifraData);
    }

    const job = await pdfQueue.add({ pdfDataArray: cifraDataArray, name });

    res.status(202).json({
      message: 'Músicas adicionadas à fila para processamento.',
      jobId: job.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao gerar o PDF.' });
  }
});

router.get('/search', async (req, res) => {
  const { artist, song } = req.query;

  if (!artist || !song) {
    return res.status(400).json({ error: 'Artist and song are required.' });
  }

  const songData = await scrapeSearchCifra(artist, song);

  if (!songData) {
    return res
      .status(404)
      .json({ error: `Cifra não encontrada para a URL: ${url}` });
  }

  const job = await pdfQueue.add({ pdfDataArray: [songData], name: null });

  res.status(202).json({
    message: 'Músicas adicionadas à fila para processamento.',
    jobId: job.id,
  });
});

module.exports = router;
