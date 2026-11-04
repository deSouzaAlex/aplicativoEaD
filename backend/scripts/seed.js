// Popula o banco com um usuário e dados fictícios de demonstração.
// Uso: npm run seed   (e-mail demo@exemplo.com / senha demo1234, ou SEED_EMAIL / SEED_SENHA)
const bcrypt = require("bcryptjs");
const config = require("../config");
const { conectar, mongoose } = require("../db/conn");
const Usuario = require("../models/Usuario");
const Disciplina = require("../models/Disciplina");
const Tarefa = require("../models/Tarefa");

const DIA = 24 * 60 * 60 * 1000;
const fimDoDia = (deslocamentoDias) => {
    const d = new Date(Date.now() + deslocamentoDias * DIA);
    d.setHours(23, 59, 0, 0);
    return d;
};

async function main() {
    await conectar(config.MONGODB_URI);
    const email = process.env.SEED_EMAIL || "demo@exemplo.com";
    const senha = process.env.SEED_SENHA || "demo1234";

    let usuario = await Usuario.findOne({ email });
    if (usuario) {
        await Tarefa.deleteMany({ usuario: usuario._id });
        await Disciplina.deleteMany({ usuario: usuario._id });
    } else {
        usuario = await Usuario.create({
            nome: "Maria",
            email,
            senhaHash: await bcrypt.hash(senha, 10),
            consentimentoEm: new Date(),
        });
    }

    const [bd, es, ia] = await Disciplina.insertMany([
        { nome: "Banco de Dados", codigo: "COM210", professor: "Profa. Ana Lima", cargaHoraria: 80, semestre: "2026.2", cor: "#4F46E5", usuario: usuario._id },
        { nome: "Engenharia de Software", codigo: "COM230", professor: "Prof. Carlos Souza", cargaHoraria: 80, semestre: "2026.2", cor: "#0E7490", usuario: usuario._id },
        { nome: "Inteligência Artificial", codigo: "COM310", professor: "Profa. Beatriz Rocha", cargaHoraria: 60, semestre: "2026.2", cor: "#B45309", usuario: usuario._id },
    ]);

    const tarefa = (nome, disciplina, prazo, prioridade, extra = {}) => ({
        nome, disciplina: disciplina._id, dataEntrega: fimDoDia(prazo), prioridade, usuario: usuario._id, ...extra,
    });

    // Histórico: tarefas concluídas no prazo e com atraso
    const historico = [
        tarefa("Lista 1 - Modelo ER", bd, -30, "media", { concluida: true, dataConclusao: fimDoDia(-31) }),
        tarefa("Fórum - Requisitos", es, -25, "baixa", { concluida: true, dataConclusao: fimDoDia(-25) }),
        tarefa("Lista 2 - SQL básico", bd, -20, "alta", { concluida: true, dataConclusao: fimDoDia(-18) }),
        tarefa("Quiz - Busca heurística", ia, -15, "media", { concluida: true, dataConclusao: fimDoDia(-16) }),
        tarefa("Atividade - Casos de uso", es, -10, "alta", { concluida: true, dataConclusao: fimDoDia(-9) }),
        tarefa("Videoaula semana 5", ia, -6, "baixa", { concluida: true, dataConclusao: fimDoDia(-7) }),
    ];
    const pendentes = [
        tarefa("Resumo - Normalização", bd, -1, "media"),
        tarefa("Projeto - Diagrama de classes", es, 1, "alta", { lembreteAntecedenciaDias: 5 }),
        tarefa("Lista 3 - Joins", bd, 2, "alta"),
        tarefa("Quiz - Redes neurais", ia, 3, "media"),
        tarefa("Fórum - Metodologias ágeis", es, 4, "baixa"),
        tarefa("Atividade avaliativa - Árvores de decisão", ia, 9, "alta"),
        tarefa("Prova online - Banco de Dados", bd, 16, "alta", { lembreteAntecedenciaDias: 7 }),
    ];
    // createdAt retroativo para o histórico (alimenta a antecedência do cadastro)
    const docs = await Tarefa.insertMany([...historico, ...pendentes]);
    for (const d of docs) {
        const criadoEm = new Date(d.dataEntrega.getTime() - 10 * DIA);
        await Tarefa.collection.updateOne({ _id: d._id }, { $set: { createdAt: criadoEm } });
    }

    console.log(`Dados de demonstração criados para ${email} (senha: ${senha}).`);
    await mongoose.disconnect();
}

main().catch(async (err) => {
    console.error(err);
    await mongoose.disconnect();
    process.exit(1);
});
