// RF06 - Ordenação automática das tarefas segundo prazo e prioridade.
//
// Cada tarefa pendente recebe um índice de urgência dado por
//     urgencia = pesoPrioridade / (diasRestantes + 1)
// de modo que prazos mais próximos e prioridades mais altas sobem na lista.
// Tarefas já vencidas aparecem primeiro (da mais antiga para a mais recente)
// e as concluídas vão para o final.
const { diasEntre } = require("./datas");

const PESO_PRIORIDADE = { alta: 3, media: 2, baixa: 1 };

function indiceUrgencia(tarefa, agora = new Date()) {
    const dias = diasEntre(agora, tarefa.dataEntrega);
    const peso = PESO_PRIORIDADE[tarefa.prioridade] || PESO_PRIORIDADE.media;
    if (dias < 0) return Infinity;
    return peso / (dias + 1);
}

function ordenarPorPrioridade(tarefas, agora = new Date()) {
    const pendentes = tarefas.filter((t) => !t.concluida);
    const concluidas = tarefas.filter((t) => t.concluida);

    const vencidas = pendentes
        .filter((t) => new Date(t.dataEntrega) < agora)
        .sort((a, b) => new Date(a.dataEntrega) - new Date(b.dataEntrega));
    const noPrazo = pendentes
        .filter((t) => new Date(t.dataEntrega) >= agora)
        .sort((a, b) => {
            const diff = indiceUrgencia(b, agora) - indiceUrgencia(a, agora);
            return diff !== 0 ? diff : new Date(a.dataEntrega) - new Date(b.dataEntrega);
        });
    concluidas.sort((a, b) => new Date(b.dataEntrega) - new Date(a.dataEntrega));

    return [...vencidas, ...noPrazo, ...concluidas];
}

function ordenarPorPrazo(tarefas) {
    return [...tarefas].sort((a, b) => new Date(a.dataEntrega) - new Date(b.dataEntrega));
}

module.exports = { PESO_PRIORIDADE, indiceUrgencia, ordenarPorPrioridade, ordenarPorPrazo };
