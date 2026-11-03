const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const Usuario = require("../models/Usuario");
const Disciplina = require("../models/Disciplina");
const Tarefa = require("../models/Tarefa");
const { autenticar, gerarToken } = require("../middleware/auth");

const SENHA_MINIMA = 8;

router.post("/registrar", async (req, res) => {
    try {
        const { nome, email, senha, consentimento } = req.body || {};
        if (!nome || !email || !senha) {
            return res.status(400).json({ success: false, error: "Nome, e-mail e senha são obrigatórios." });
        }
        if (String(senha).length < SENHA_MINIMA) {
            return res.status(400).json({ success: false, error: `A senha deve ter ao menos ${SENHA_MINIMA} caracteres.` });
        }
        if (!consentimento) {
            return res.status(400).json({ success: false, error: "É necessário aceitar a política de privacidade." });
        }
        const existente = await Usuario.findOne({ email: String(email).toLowerCase().trim() });
        if (existente) {
            return res.status(409).json({ success: false, error: "Já existe uma conta com este e-mail." });
        }
        const usuario = await Usuario.create({
            nome,
            email,
            senhaHash: await bcrypt.hash(String(senha), 10),
            consentimentoEm: new Date(),
        });
        res.status(201).json({ token: gerarToken(usuario), usuario: usuario.toPublico() });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, senha } = req.body || {};
        if (!email || !senha) {
            return res.status(400).json({ success: false, error: "Informe e-mail e senha." });
        }
        const usuario = await Usuario.findOne({ email: String(email).toLowerCase().trim() }).select("+senhaHash");
        const valido = usuario && (await bcrypt.compare(String(senha), usuario.senhaHash));
        if (!valido) {
            return res.status(401).json({ success: false, error: "E-mail ou senha incorretos." });
        }
        res.status(200).json({ token: gerarToken(usuario), usuario: usuario.toPublico() });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get("/me", autenticar, async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.usuarioId);
        if (!usuario) return res.status(404).json({ success: false, error: "Usuário não encontrado." });
        res.status(200).json(usuario.toPublico());
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.put("/me", autenticar, async (req, res) => {
    try {
        const { nome, preferencias = {} } = req.body || {};
        const usuario = await Usuario.findById(req.usuarioId);
        if (!usuario) return res.status(404).json({ success: false, error: "Usuário não encontrado." });
        if (nome !== undefined) usuario.nome = nome;
        for (const campo of ["antecedenciaLembreteDias", "limiteSobrecarga", "notificacoesNavegador"]) {
            if (preferencias[campo] !== undefined) usuario.preferencias[campo] = preferencias[campo];
        }
        await usuario.save();
        res.status(200).json(usuario.toPublico());
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// LGPD (art. 18): portabilidade - exporta todos os dados do titular
router.get("/me/exportar", autenticar, async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.usuarioId);
        if (!usuario) return res.status(404).json({ success: false, error: "Usuário não encontrado." });
        const [disciplinas, tarefas] = await Promise.all([
            Disciplina.find({ usuario: req.usuarioId }).lean(),
            Tarefa.find({ usuario: req.usuarioId }).lean(),
        ]);
        res.setHeader("Content-Disposition", 'attachment; filename="meus-dados.json"');
        res.status(200).json({ exportadoEm: new Date(), usuario: usuario.toPublico(), disciplinas, tarefas });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// LGPD (art. 18): eliminação - exclui a conta e todos os dados associados
router.delete("/me", autenticar, async (req, res) => {
    try {
        await Tarefa.deleteMany({ usuario: req.usuarioId });
        await Disciplina.deleteMany({ usuario: req.usuarioId });
        const { deletedCount } = await Usuario.deleteOne({ _id: req.usuarioId });
        if (!deletedCount) return res.status(404).json({ success: false, error: "Usuário não encontrado." });
        res.status(200).json({ success: true, message: "Conta e dados excluídos." });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
