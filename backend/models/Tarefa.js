const mongoose = require("mongoose");

const tarefaSchema = new mongoose.Schema(
    {
        nome: { type: String, required: true, trim: true },
        descricao: { type: String },
        dataEntrega: { type: Date, required: true },
        prioridade: { type: String, enum: ["alta", "media", "baixa"], default: "media" },
        concluida: { type: Boolean, default: false },
        // Registrada automaticamente quando a tarefa é marcada como concluída.
        // Permite saber se a entrega ocorreu dentro do prazo (rótulo do módulo preditivo).
        dataConclusao: { type: Date, default: null },
        // Antecedência do lembrete desta tarefa, em dias. Nulo = usa a preferência do usuário.
        lembreteAntecedenciaDias: { type: Number, default: null, min: 0, max: 30 },
        disciplina: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Disciplina",
            required: true,
        },
        usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true, index: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Tarefa", tarefaSchema);
