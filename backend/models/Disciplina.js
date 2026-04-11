const mongoose = require("mongoose");

const disciplinaSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    codigo: { type: String, required: true },
    professor: { type: String, required: true },
    cargaHoraria: { type: Number, required: true },
    semestre: { type: String, required: true },
    cor: { type: String, default: "#4F46E5" },
});

module.exports = mongoose.model("Disciplina", disciplinaSchema);
