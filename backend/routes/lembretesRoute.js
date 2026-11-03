const express = require("express");
const router = express.Router();
const Tarefa = require("../models/Tarefa");
const Usuario = require("../models/Usuario");
const { gerarLembretes } = require("../services/lembretes");

// GET /lembretes - tarefas pendentes que já entraram na janela de antecedência (RF05)
router.get("/", async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.usuarioId);
        if (!usuario) return res.status(404).json({ success: false, error: "Usuário não encontrado." });
        const tarefas = await Tarefa.find({ usuario: req.usuarioId, concluida: false }).populate("disciplina");
        const lembretes = gerarLembretes(tarefas, usuario.preferencias?.antecedenciaLembreteDias ?? 2);
        res.status(200).json(lembretes);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
