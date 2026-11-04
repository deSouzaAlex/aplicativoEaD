// Exporta, de forma anonimizada, os exemplos rotulados de todos os usuários para o
// treinamento dos modelos supervisionados (fase 2 do módulo preditivo).
// Nenhum identificador, nome ou e-mail é incluído; cada usuário recebe um código sequencial.
// Uso: node scripts/exportarDataset.js > ../analise/dataset.csv
const config = require("../config");
const { conectar, mongoose } = require("../db/conn");
const Tarefa = require("../models/Tarefa");
const { montarDataset } = require("../services/analiseRisco");

const COLUNAS = [
    "usuario", "antecedenciaCadastroDias", "tarefasAbertasJanela", "prioridadeNum",
    "diaSemanaPrazo", "historicoTarefas", "taxaAtrasoAnterior", "atrasou",
];

async function main() {
    await conectar(config.MONGODB_URI);
    const usuarios = await Tarefa.distinct("usuario");
    const linhas = [COLUNAS.join(",")];
    let codigo = 0;
    for (const u of usuarios) {
        codigo += 1;
        const tarefas = await Tarefa.find({ usuario: u }).lean();
        for (const l of montarDataset(tarefas)) {
            const registro = { ...l, usuario: `u${codigo}` };
            linhas.push(COLUNAS.map((c) => (registro[c] === null ? "" : registro[c])).join(","));
        }
    }
    process.stdout.write(linhas.join("\n") + "\n");
    await mongoose.disconnect();
}

main().catch(async (err) => {
    console.error(err);
    await mongoose.disconnect();
    process.exit(1);
});
