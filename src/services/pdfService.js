const PDFDocument = require('pdfkit');
const fs = require('fs');

async function generatePDF(pdfDataArray, name) {
  const doc = new PDFDocument();
  const randomName = `${new Date().toISOString().slice(0, 10)}_${Math.random()
    .toString(36)
    .substring(2, 8)}`;

  const fileName = `${name || randomName}.pdf`;
  const writeStream = fs.createWriteStream(`./${fileName}`);

  doc.pipe(writeStream);

  // Adicionar cada cifra ao PDF
  for (let pdfData of pdfDataArray) {
    const { title, cifra, artist } = pdfData;

    // Adicionar título da música
    doc.fontSize(20).text(`${title} - ${artist}`, { align: 'center' });

    // Adicionar cifra
    doc.moveDown();
    doc.fontSize(12).text(cifra);

    doc.addPage();
  }

  // Finalizar o documento
  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => resolve(fileName));
    writeStream.on('error', reject);
  });
}

module.exports = { generatePDF };
