const PDFDocument = require('pdfkit');
const fs = require('fs');

async function generatePDF(pdfDataArray, name) {
  const doc = new PDFDocument();
  const randomName = `${new Date().toISOString().slice(0, 10)}_${Math.random()
    .toString(36)
    .substring(2, 8)}`;

  const fileName = `./src/files/${name || randomName}.pdf`;
  const writeStream = fs.createWriteStream(`./${fileName}`);

  doc.pipe(writeStream);

  const boldChordsRegex =
    /(?:^|\s)([A-G](?:#|b)?(?:m|maj|dim|sus|aug|add|M|7M)?(?:\d+)?(?:\(.*?\))?)(?=\s|$)/g;

  // Adicionar cada cifra ao PDF
  for (let pdfData of pdfDataArray) {
    const { title, cifra, artist } = pdfData;

    // Adicionar título da música
    doc
      .fontSize(20)
      .text(`${title} - ${artist}`, { align: 'center' })
      .font('Helvetica-Bold');

    // Adicionar cifra
    doc.moveDown();
    doc.fontSize(12);

    const lines = cifra.split('\n'); // Processa linha por linha da cifra
    lines.forEach((line) => {
      const parts = line.split(boldChordsRegex); // Divide em partes com base na regex

      parts.forEach((part) => {
        if (boldChordsRegex.test(part)) {
          // Aplique negrito aos acordes
          doc.font('Helvetica-Bold').text(part, { continued: true });
        } else {
          // Aplique fonte normal ao texto
          doc.font('Helvetica').text(part, { continued: true });
        }
      });

      doc.text('');
      doc.moveDown(); // Quebra a linha após renderizar uma linha completa
    });

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
