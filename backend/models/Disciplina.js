const mongoose = require("mongoose");

const disciplinaSchema = new mongoose.Schema(
    {
        nome: { type: String, required: true, trim: true },
        codigo: { type: String, required: true, trim: true },
        professor: { type: String, required: true, trim: true },
        cargaHoraria: { type: Number, required: true, min: 1 },
        semestre: { type: String, required: true, trim: true },
        cor: { type: String, default: "#4F46E5", match: /^#[0-9a-fA-F]{6}$/ },
        usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true, index: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Disciplina", disciplinaSchema);
