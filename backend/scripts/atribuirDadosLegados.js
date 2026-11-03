// Atribui a um usuário as disciplinas e tarefas criadas antes da autenticação (sem campo "usuario").
// Uso: node scripts/atribuirDadosLegados.js email@exemplo.com
const config = require("../config");
const { conectar, mongoose } = require("../db/conn");
const Usuario = require("../models/Usuario");
const Disciplina = require("../models/Disciplina");
const Tarefa = require("../models/Tarefa");

async function main() {
    const email = process.argv[2];
    if (!email) throw new Error("Informe o e-mail do usuário que receberá os dados.");
    await conectar(config.MONGODB_URI);
    const usuario = await Usuario.findOne({ email: email.toLowerCase() });
    if (!usuario) throw new Error(`Usuário ${email} não encontrado. Crie a conta pela tela de cadastro.`);

    const semDono = { usuario: { $exists: false } };
    const d = await Disciplina.updateMany(semDono, { $set: { usuario: usuario._id } });
    const t = await Tarefa.updateMany(semDono, { $set: { usuario: usuario._id } });
    console.log(`${d.modifiedCount} disciplina(s) e ${t.modifiedCount} tarefa(s) atribuídas a ${email}.`);
    await mongoose.disconnect();
}

main().catch(async (err) => {
    console.error(err.message);
    await mongoose.disconnect();
    process.exit(1);
});
