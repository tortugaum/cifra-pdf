router.get('/status/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const job = await pdfQueue.getJob(id);

    if (!job) {
      return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }

    // Retornar o status da tarefa
    res.status(200).json({
      jobId: job.id,
      status: job.finishedOn
        ? 'Concluído'
        : job.failedReason
        ? 'Falhou'
        : 'Em processamento',
      result: job.returnvalue || null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar o status da tarefa.' });
  }
});
