const Queue = require('bull');
const { generatePDF } = require('../services/pdfService');

const pdfQueue = new Queue('pdf-generation', {
  redis: { host: '127.0.0.1', port: 6379 },
});

// Processar a fila
pdfQueue.process(async (job) => {
  const { pdfData } = job.data;
  return await generatePDF(pdfData);
});

module.exports = pdfQueue;
