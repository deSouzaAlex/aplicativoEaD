const mongoose = require("mongoose");

const tarefaSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    descricao: { type: String },
    dataEntrega: { type: Date, required: true },
    prioridade: { type: String, enum: ["alta", "media", "baixa"], default: "media" },
    concluida: { type: Boolean, default: false },
    disciplina: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Disciplina",
        required: true,
    },
});

module.exports = mongoose.model("Tarefa", tarefaSchema);
