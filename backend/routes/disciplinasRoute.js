const express = require("express");
const router = express.Router();
const Disciplina = require("../models/Disciplina");
const Tarefa = require("../models/Tarefa");
const { validarId } = require("../middleware/validarId");

router.param("id", validarId);

const camposDisciplina = (body = {}) => ({
    nome: body.nome,
    codigo: body.codigo,
    professor: body.professor,
    cargaHoraria: body.cargaHoraria,
    semestre: body.semestre,
    cor: body.cor,
});

router.get("/", async (req, res) => {
    try {
        const disciplinas = await Disciplina.find({ usuario: req.usuarioId }).sort({ nome: 1 });
        res.status(200).send(disciplinas);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const disciplina = await Disciplina.findOne({ _id: req.params.id, usuario: req.usuarioId });
        if (!disciplina) return res.status(404).json({ message: "Disciplina não encontrada." });
        res.status(200).send(disciplina);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const disciplina = await Disciplina.create({ ...camposDisciplina(req.body), usuario: req.usuarioId });
        res.status(201).send(disciplina);
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const disciplina = await Disciplina.findOneAndUpdate(
            { _id: req.params.id, usuario: req.usuarioId },
            camposDisciplina(req.body),
            { returnDocument: "after", runValidators: true }
        );
        if (!disciplina) return res.status(404).json({ message: "Disciplina não encontrada." });
        res.status(200).send(disciplina);
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// A exclusão remove também as tarefas vinculadas, evitando registros órfãos.
router.delete("/:id", async (req, res) => {
    try {
        const disciplina = await Disciplina.findOneAndDelete({ _id: req.params.id, usuario: req.usuarioId });
        if (!disciplina)
            return res.status(404).json({ success: false, message: "Disciplina não encontrada." });
        const { deletedCount } = await Tarefa.deleteMany({ disciplina: disciplina._id, usuario: req.usuarioId });
        return res.status(200).json({
            success: true,
            message: "Disciplina apagada.",
            tarefasRemovidas: deletedCount,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
