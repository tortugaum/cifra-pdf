const express = require('express');

const router = express.Router();

router.post('/reload', (req, res) => {
  //delete .wwebjs_auth folder
  const fs = require('fs');
  const path = require('path');
  const directory = path.join(__dirname, '../../.wwebjs_auth');
  fs.rmdir(directory, { recursive: true }, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao deletar o diretório.' });
    }
    res.status(200).json({ message: 'Diretório deletado com sucesso.' });
  });
});

router.use('/', (req, res) => {
  res.send('API is running');
});

module.exports = router;
