const { isURL } = require('validator');
const express = require('express');
const { scrapeCifra } = require('../services/scrapingService');
const pdfQueue = require('../queues/pdfQueue');

const router = express.Router();

router.post('/generate', async (req, res) => {
  const { url } = req.body;

  if (!url || !isURL(url, { require_protocol: true })) {
    return res.status(400).json({ error: 'A URL fornecida é inválida.' });
  }

  if (!url.includes('cifraclub.com.br')) {
    return res
      .status(400)
      .json({ error: 'A URL deve ser do site Cifra Club.' });
  }

  try {
    const cifraData = await scrapeCifra(url);

    if (!cifraData) {
      return res.status(404).json({ error: 'Cifra não encontrada.' });
    }

    const job = await pdfQueue.add({ pdfData: cifraData });

    res.status(202).json({
      message: 'Música adicionada à fila para processamento.',
      jobId: job.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao gerar o PDF.' });
  }
});

module.exports = router;
