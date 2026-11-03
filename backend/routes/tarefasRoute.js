const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Tarefa = require("../models/Tarefa");
const Disciplina = require("../models/Disciplina");
const { validarId } = require("../middleware/validarId");
const { ordenarPorPrioridade, ordenarPorPrazo } = require("../services/priorizacao");

router.param("id", validarId);

async function disciplinaDoUsuario(id, usuarioId) {
    if (!mongoose.isValidObjectId(id)) return null;
    return Disciplina.findOne({ _id: id, usuario: usuarioId });
}

// GET /tarefas?ordenar=auto|prazo  &situacao=pendentes|concluidas  &disciplina=<id>
router.get("/", async (req, res) => {
    try {
        const filtro = { usuario: req.usuarioId };
        if (req.query.situacao === "pendentes") filtro.concluida = false;
        if (req.query.situacao === "concluidas") filtro.concluida = true;
        if (req.query.disciplina && mongoose.isValidObjectId(req.query.disciplina)) {
            filtro.disciplina = req.query.disciplina;
        }
        let tarefas = await Tarefa.find(filtro).populate("disciplina");
        if (req.query.ordenar === "auto") tarefas = ordenarPorPrioridade(tarefas);
        else if (req.query.ordenar === "prazo") tarefas = ordenarPorPrazo(tarefas);
        res.status(200).send(tarefas);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const tarefa = await Tarefa.findOne({ _id: req.params.id, usuario: req.usuarioId }).populate("disciplina");
        if (!tarefa) return res.status(404).json({ message: "Tarefa não encontrada." });
        res.status(200).send(tarefa);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const body = req.body || {};
        const disciplina = await disciplinaDoUsuario(body.disciplina, req.usuarioId);
        if (!disciplina) return res.status(404).json({ success: false, error: "Disciplina inválida." });

        const concluida = Boolean(body.concluida);
        const tarefa = await Tarefa.create({
            nome: body.nome,
            descricao: body.descricao,
            dataEntrega: body.dataEntrega,
            prioridade: body.prioridade,
            concluida,
            dataConclusao: concluida ? new Date() : null,
            lembreteAntecedenciaDias: body.lembreteAntecedenciaDias ?? null,
            disciplina: disciplina._id,
            usuario: req.usuarioId,
        });
        res.status(201).send(tarefa);
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const body = req.body || {};
        const tarefa = await Tarefa.findOne({ _id: req.params.id, usuario: req.usuarioId });
        if (!tarefa) return res.status(404).json({ message: "Tarefa não encontrada." });

        if (body.disciplina !== undefined) {
            const idDisciplina = body.disciplina?._id || body.disciplina;
            const disciplina = await disciplinaDoUsuario(idDisciplina, req.usuarioId);
            if (!disciplina) return res.status(404).json({ success: false, error: "Disciplina inválida." });
            tarefa.disciplina = disciplina._id;
        }
        for (const campo of ["nome", "descricao", "dataEntrega", "prioridade", "lembreteAntecedenciaDias"]) {
            if (body[campo] !== undefined) tarefa[campo] = body[campo];
        }
        if (body.concluida !== undefined) {
            const concluida = Boolean(body.concluida);
            // Registra o momento da conclusão apenas na transição pendente -> concluída
            if (concluida && !tarefa.concluida) tarefa.dataConclusao = new Date();
            if (!concluida) tarefa.dataConclusao = null;
            tarefa.concluida = concluida;
        }
        await tarefa.save();
        await tarefa.populate("disciplina");
        res.status(200).send(tarefa);
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const tarefa = await Tarefa.findOneAndDelete({ _id: req.params.id, usuario: req.usuarioId });
        if (tarefa)
            return res.status(200).json({ success: true, message: "Tarefa apagada." });
        else
            return res.status(404).json({ success: false, message: "Tarefa não encontrada." });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
