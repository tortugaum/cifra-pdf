const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const Queue = require('bull');
const { scrapeCifra, scrapeSearchCifra } = require('./pupeteerScrapingService');
const { generatePDF } = require('./pdfService');

let chatStarted = false;
// Create a Bull queue
const songQueue = new Queue('song-queue', {
  redis: {
    host: 'localhost',
    port: 6379,
  },
});

let whatsappClient;

function initializeWhatsAppClient() {
  whatsappClient = new Client({
    authStrategy: new LocalAuth(),
  });

  whatsappClient.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
  });

  whatsappClient.on('ready', () => {
    console.log('WhatsApp Client is ready!');
  });

  whatsappClient.on('message_create', async (message) => {
    try {
      if (message.body && message.from.includes('99632')) {
        if (!chatStarted || message.body.toLowerCase().startsWith('/start')) {
          chatStarted = true;

          songQueue.empty();

          await message.reply(
            'Olá! Envie o nome ou link da música que deseja receber em PDF.'
          );
        } else {
          if (message.body === '1') {
            const file = await processQueueAndGeneratePDF(message);

            if (file) {
              console.log('file', { file });
              const media = MessageMedia.fromFilePath(file);

              await message.reply(media);
            }
            return;
          }

          if (message.body === '2') {
            message.reply(
              'Envie o nome (Artista - Musica) ou link da próxima música.'
            );
            return;
          }

          const songInfo = message.body;

          await songQueue.add({ url: songInfo });

          await message.reply(
            'Música recebida. \n 1 - Gerar PDF \n\n 2 - Enviar outra música'
          );
        }
      }
    } catch (err) {
      console.log('Erro', err);
    }
  });

  // whatsappClient.on('message_create', async (message) => {
  //   if (message.body === '1') {
  //     // Process the queue and generate PDF
  //     // await processQueueAndGeneratePDF(message);
  //   } else if (message.body === '2') {
  //     // Prompt for another song
  //     message.reply('Envie o nome ou link da próxima música.');
  //   } else {
  //     message.reply('Opção inválida. Por favor, escolha uma opção válida.');
  //   }
  // });

  whatsappClient.initialize();
}

async function processQueueAndGeneratePDF(message) {
  try {
    const jobs = await songQueue.getJobs(['waiting', 'active', 'delayed']);
    let fileName = null;

    if (!jobs || jobs.length === 0) {
      await message.reply('Nenhuma música na fila para processar.');
      return;
    }

    const pdfData = [];

    for (const job of jobs) {
      const { url } = job.data;
      try {
        const isUrl =
          /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\\w .-]*)*\/?$/.test(
            url
          );

        const scrapedData = isUrl
          ? await scrapeCifra(url)
          : await scrapeSearchCifra(url.split('-')[0], url.split('-')[1]);

        if (scrapedData) {
          pdfData.push(scrapedData);
        } else {
          await message.reply(`Erro ao processar a música: ${url}`);
        }

        // Remove job after processing
        await job.remove();
      } catch (err) {
        console.error(`Erro ao processar a música: ${url}`, err);
        await message.reply(`Erro ao processar a música: ${url}`);
      }
    }

    fileName = await generatePDF(pdfData, 'ArquivoTeste');

    await message.reply('Todas as músicas foram processadas.');

    if (fileName) {
      return fileName;
    }
  } catch (error) {
    console.error('Erro ao processar a fila e gerar o PDF', error);
    message.reply('Erro ao gerar o PDF. Tente novamente mais tarde.');
  }
}

module.exports = { initializeWhatsAppClient, whatsappClient };
