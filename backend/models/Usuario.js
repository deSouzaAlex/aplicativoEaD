const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema(
    {
        nome: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "E-mail inválido."],
        },
        senhaHash: { type: String, required: true, select: false },
        preferencias: {
            // Antecedência padrão (em dias) para os lembretes de tarefas (RF05)
            antecedenciaLembreteDias: { type: Number, default: 2, min: 0, max: 30 },
            // Quantidade de entregas em 7 dias a partir da qual o período é sinalizado como sobrecarga (RF07)
            limiteSobrecarga: { type: Number, default: 4, min: 2, max: 20 },
            notificacoesNavegador: { type: Boolean, default: false },
        },
        consentimentoEm: { type: Date },
    },
    { timestamps: true }
);

usuarioSchema.methods.toPublico = function () {
    return {
        _id: this._id,
        nome: this.nome,
        email: this.email,
        preferencias: this.preferencias,
        createdAt: this.createdAt,
    };
};

module.exports = mongoose.model("Usuario", usuarioSchema);
