const express = require("express");
const router = express.Router();
const Tarefa = require("../models/Tarefa");
const Usuario = require("../models/Usuario");
const { analisar, montarDataset } = require("../services/analiseRisco");

// GET /analise/risco - indicador de risco por tarefa e períodos de sobrecarga (RF07)
router.get("/risco", async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.usuarioId);
        if (!usuario) return res.status(404).json({ success: false, error: "Usuário não encontrado." });
        const tarefas = await Tarefa.find({ usuario: req.usuarioId }).populate("disciplina");
        res.status(200).json(
            analisar(tarefas, { limiteSobrecarga: usuario.preferencias?.limiteSobrecarga ?? 4 })
        );
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /analise/dataset?formato=json|csv - exemplos rotulados para treinar modelos (fase 2)
router.get("/dataset", async (req, res) => {
    try {
        const tarefas = await Tarefa.find({ usuario: req.usuarioId }).lean();
        const linhas = montarDataset(tarefas);
        if (req.query.formato === "csv") {
            const colunas = [
                "antecedenciaCadastroDias", "tarefasAbertasJanela", "prioridadeNum",
                "diaSemanaPrazo", "historicoTarefas", "taxaAtrasoAnterior", "atrasou",
            ];
            const csv = [colunas.join(",")]
                .concat(linhas.map((l) => colunas.map((c) => (l[c] === null ? "" : l[c])).join(",")))
                .join("\n");
            res.setHeader("Content-Type", "text/csv; charset=utf-8");
            res.setHeader("Content-Disposition", 'attachment; filename="dataset-tarefas.csv"');
            return res.status(200).send(csv);
        }
        res.status(200).json(linhas);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
