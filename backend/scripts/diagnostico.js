// Mostra as contas cadastradas e quantas disciplinas e tarefas pertencem a cada uma.
// Uso: npm run diagnostico
const config = require("../config");
const { conectar, mongoose } = require("../db/conn");
const Usuario = require("../models/Usuario");
const Disciplina = require("../models/Disciplina");
const Tarefa = require("../models/Tarefa");

async function main() {
    await conectar(config.MONGODB_URI);
    console.log(`Banco: ${mongoose.connection.name}\n`);

    const usuarios = await Usuario.find({}, { nome: 1, email: 1 }).lean();
    console.log(`Contas (${usuarios.length}):`);
    for (const u of usuarios) {
        const [d, t] = await Promise.all([
            Disciplina.countDocuments({ usuario: u._id }),
            Tarefa.countDocuments({ usuario: u._id }),
        ]);
        console.log(`  ${u.email} (${u.nome}): ${d} disciplina(s), ${t} tarefa(s)`);
    }

    const semDono = { usuario: { $exists: false } };
    const [dSem, tSem] = await Promise.all([Disciplina.countDocuments(semDono), Tarefa.countDocuments(semDono)]);
    console.log(`\nSem dono (anteriores à autenticação): ${dSem} disciplina(s), ${tSem} tarefa(s)`);
    if (dSem || tSem) console.log("Para atribuí-las a uma conta: npm run migrar:legado -- email@exemplo.com");

    const outros = (await mongoose.connection.db.admin().listDatabases()).databases.map((b) => b.name);
    console.log(`\nBancos existentes no servidor: ${outros.join(", ")}`);
    await mongoose.disconnect();
}

main().catch(async (err) => {
    console.error("Erro:", err.message);
    await mongoose.disconnect();
    process.exit(1);
});
