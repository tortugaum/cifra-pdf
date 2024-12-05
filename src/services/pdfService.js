const PDFDocument = require('pdfkit');
const fs = require('fs');

async function generatePDF({ title, cifra }) {
  const doc = new PDFDocument();
  const fileName = `${title.replace(/ /g, '_')}.pdf`;
  const writeStream = fs.createWriteStream(`./${fileName}`);

  doc.pipe(writeStream);

  // Adicionar título
  doc.fontSize(20).text(title, { align: 'center' });

  // Adicionar cifra
  doc.moveDown();
  doc.fontSize(12).text(cifra);

  // Finalizar o documento
  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => resolve(fileName));
    writeStream.on('error', reject);
  });
}

module.exports = { generatePDF };
