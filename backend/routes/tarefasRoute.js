const express = require("express");
const router = express.Router();
const Tarefa = require("../models/Tarefa");
const Disciplina = require("../models/Disciplina");

router.get("/", async (req, res) => {
    try {
        const tarefas = await Tarefa.find().populate("disciplina");
        res.status(200).send(tarefas);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const tarefa = await Tarefa.findById(req.params.id).populate("disciplina");
        if (!tarefa) return res.status(404).json({ message: "Tarefa não encontrada." });
        res.status(200).send(tarefa);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const disciplina = await Disciplina.findById(req.body.disciplina);
        if (!disciplina) return res.status(404).send("Disciplina inválida.");

        let tarefa = new Tarefa({
            nome: req.body.nome,
            descricao: req.body.descricao,
            dataEntrega: req.body.dataEntrega,
            prioridade: req.body.prioridade,
            concluida: req.body.concluida || false,
            disciplina: disciplina._id,
        });
        tarefa = await tarefa.save();
        res.status(200).send(tarefa);
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const tarefa = await Tarefa.findByIdAndUpdate(
            req.params.id,
            {
                nome: req.body.nome,
                descricao: req.body.descricao,
                dataEntrega: req.body.dataEntrega,
                prioridade: req.body.prioridade,
                concluida: req.body.concluida,
                disciplina: req.body.disciplina,
            },
            { new: true }
        );
        if (!tarefa) return res.status(404).json({ message: "Tarefa não encontrada." });
        res.status(200).send(tarefa);
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const tarefa = await Tarefa.findByIdAndDelete(req.params.id);
        if (tarefa)
            return res.status(200).json({ success: true, message: "Tarefa apagada." });
        else
            return res.status(404).json({ success: false, message: "Tarefa não encontrada." });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
