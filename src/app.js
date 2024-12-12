const express = require('express');
const pdfRoutes = require('./routes/pdfRoutes');
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const pdfQueue = require('./queues/pdfQueue');
const { initializeWhatsAppClient } = require('./services/whatsappService');

const app = express();
const port = 3000;

// Middleware para tratar JSON
app.use(express.json());

// Inicializar o WhatsApp Client
initializeWhatsAppClient();

// Rotas da API
app.use('/', (req, res) => {
  res.send('API is running');
});

app.use('/api/pdf', pdfRoutes);

// Configuração do Bull Board (Monitor de Filas)
const serverAdapter = new ExpressAdapter();
createBullBoard({
  queues: [new BullAdapter(pdfQueue)],
  serverAdapter,
});

// Definir a rota do Bull Board (painel de monitoramento)
serverAdapter.setBasePath('/admin/queues');
app.use('/admin/queues', serverAdapter.getRouter());

// Inicializar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log(
    `Monitor de filas disponível em http://localhost:${port}/admin/queues`
  );
});
