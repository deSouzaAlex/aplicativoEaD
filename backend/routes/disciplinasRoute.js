const express = require("express");
const router = express.Router();
const Disciplina = require("../models/Disciplina");

router.get("/", async (req, res) => {
    try {
        const disciplinas = await Disciplina.find();
        res.status(200).send(disciplinas);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const disciplina = await Disciplina.findById(req.params.id);
        if (!disciplina) return res.status(404).json({ message: "Disciplina não encontrada." });
        res.status(200).send(disciplina);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post("/", async (req, res) => {
    try {
        let disciplina = new Disciplina({
            nome: req.body.nome,
            codigo: req.body.codigo,
            professor: req.body.professor,
            cargaHoraria: req.body.cargaHoraria,
            semestre: req.body.semestre,
            cor: req.body.cor,
        });
        disciplina = await disciplina.save();
        res.status(200).send(disciplina);
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const disciplina = await Disciplina.findByIdAndUpdate(
            req.params.id,
            {
                nome: req.body.nome,
                codigo: req.body.codigo,
                professor: req.body.professor,
                cargaHoraria: req.body.cargaHoraria,
                semestre: req.body.semestre,
                cor: req.body.cor,
            },
            { new: true }
        );
        if (!disciplina) return res.status(404).json({ message: "Disciplina não encontrada." });
        res.status(200).send(disciplina);
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const disciplina = await Disciplina.findByIdAndDelete(req.params.id);
        if (disciplina)
            return res.status(200).json({ success: true, message: "Disciplina apagada." });
        else
            return res.status(404).json({ success: false, message: "Disciplina não encontrada." });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
