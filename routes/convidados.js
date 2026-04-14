// backend/routes/convidados.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// POST - Adicionar novo convidado
router.post('/api/convidados', async (req, res) => {
  try {
    const { nome, confirmado, acompanhantes } = req.body;

    // Validação básica (corrigida para boolean)
    if (!nome || typeof confirmado !== 'boolean') {
      return res.status(400).json({
        error: 'Nome e confirmação são obrigatórios',
      });
    }

    // Normaliza acompanhantes: pode vir array, string, null, undefined...
    const acompanhantesArray = Array.isArray(acompanhantes)
      ? acompanhantes
      : (acompanhantes ? [acompanhantes] : []);

    // Limpa itens: garante string e remove vazios
    const acompanhantesLimpos = acompanhantesArray
      .map((a) => String(a).trim())
      .filter(Boolean);

    // Salva como string (como sua tabela parece esperar)
    const acompanhantesString = acompanhantesLimpos.join(', ');

    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');

    const result = await pool.query(
      'INSERT INTO convidados (nome, confirmado, acompanhantes, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [String(nome).trim(), confirmado, acompanhantesString, ipAddress, userAgent]
    );

    res.status(201).json({
      success: true,
      message: 'Presença confirmada com sucesso!',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao salvar convidado:', error);
    res.status(500).json({
      error: 'Erro ao confirmar presença. Tente novamente.',
    });
  }
});

// GET - Listar todos os convidados (opcional, para admin)
router.get('/api/convidados', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM convidados ORDER BY data_confirmacao DESC');
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Erro ao listar convidados:', error);
    res.status(500).json({ error: 'Erro ao listar convidados' });
  }
});

// GET - Estatísticas
router.get('/api/convidados/stats', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM estatisticas_festa');
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

module.exports = router;