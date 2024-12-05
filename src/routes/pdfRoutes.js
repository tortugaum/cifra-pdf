const { isURL } = require('validator');
const express = require('express');
const { scrapeCifra } = require('../services/scrapingService');
const pdfQueue = require('../queues/pdfQueue');

const router = express.Router();

router.post('/generate', async (req, res) => {
  const { urls, name = null } = req.body; // Accepts an array of URLs

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return res
      .status(400)
      .json({ error: 'É necessário fornecer pelo menos uma URL.' });
  }

  // Validar se todas as URLs são válidas
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

    // Coletar as cifras de todas as URLs
    for (let url of urls) {
      const cifraData = await scrapeCifra(url);
      if (!cifraData) {
        return res
          .status(404)
          .json({ error: `Cifra não encontrada para a URL: ${url}` });
      }
      cifraDataArray.push(cifraData);
    }

    // Enviar a tarefa para a fila para geração de PDF
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

module.exports = router;
