// RF07 - Indicador de risco de atraso e sinalização de períodos de sobrecarga.
//
// Primeira fase do módulo preditivo descrito na metodologia: um indicador baseado
// em regras explícitas, que combina três fatores normalizados entre 0 e 1:
//   1. proximidade do prazo   (peso 0,5) -> 1 - diasRestantes / HORIZONTE_PRAZO_DIAS
//   2. carga na janela        (peso 0,3) -> outras pendências com prazo a até ±3 dias
//   3. histórico de atrasos   (peso 0,2) -> taxa suavizada de entregas fora do prazo
// O índice final (0 a 100) é classificado em baixo, médio ou alto. Tarefas já
// vencidas recebem diretamente o nível "atrasada".
//
// A segunda fase (modelos supervisionados) utiliza os vetores de atributos gerados
// por montarDataset(), exportados pela rota GET /analise/dataset.
const { diasEntre, inicioDoDia, somarDias } = require("./datas");

const PESOS = { prazo: 0.5, carga: 0.3, historico: 0.2 };
const HORIZONTE_PRAZO_DIAS = 14;
const JANELA_CARGA_DIAS = 3;
const CARGA_SATURACAO = 4;
const LIMIARES = { alto: 60, medio: 35 };
// Suavização do histórico: equivale a partir de 2 entregas fictícias com 20% de atraso,
// evitando taxas extremas quando o usuário ainda tem poucos registros.
const PRIOR_TAXA = 0.2;
const PRIOR_PESO = 2;
const HISTORICO_MAX = 20;

function entregueComAtraso(t) {
    return Boolean(t.concluida && t.dataConclusao && new Date(t.dataConclusao) > new Date(t.dataEntrega));
}

function calcularHistorico(tarefas, agora = new Date()) {
    const concluidas = tarefas
        .filter((t) => t.concluida && t.dataConclusao)
        .sort((a, b) => new Date(b.dataConclusao) - new Date(a.dataConclusao));
    const recentes = concluidas.slice(0, HISTORICO_MAX);
    const atrasadasConcluidas = recentes.filter(entregueComAtraso).length;
    const vencidasPendentes = tarefas.filter((t) => !t.concluida && new Date(t.dataEntrega) < agora).length;

    const total = recentes.length + vencidasPendentes;
    const atrasos = atrasadasConcluidas + vencidasPendentes;
    const taxaSuavizada = (atrasos + PRIOR_TAXA * PRIOR_PESO) / (total + PRIOR_PESO);

    return {
        concluidas: concluidas.length,
        concluidasNoPrazo: concluidas.filter((t) => !entregueComAtraso(t)).length,
        concluidasComAtraso: concluidas.filter(entregueComAtraso).length,
        pendentesVencidas: vencidasPendentes,
        taxaPontualidade: concluidas.length
            ? concluidas.filter((t) => !entregueComAtraso(t)).length / concluidas.length
            : null,
        taxaAtrasoSuavizada: taxaSuavizada,
    };
}

function contarCargaJanela(tarefa, pendentes) {
    const prazo = new Date(tarefa.dataEntrega);
    return pendentes.filter(
        (o) =>
            String(o._id) !== String(tarefa._id) &&
            Math.abs(diasEntre(prazo, o.dataEntrega)) <= JANELA_CARGA_DIAS
    ).length;
}

function classificar(indice) {
    if (indice >= LIMIARES.alto) return "alto";
    if (indice >= LIMIARES.medio) return "medio";
    return "baixo";
}

function avaliarTarefa(tarefa, pendentes, historico, agora = new Date()) {
    const diasRestantes = diasEntre(agora, tarefa.dataEntrega);
    const carga = contarCargaJanela(tarefa, pendentes);

    if (diasRestantes < 0) {
        return {
            indice: 100,
            nivel: "atrasada",
            diasRestantes,
            fatores: { prazo: 1, carga: Math.min(1, carga / CARGA_SATURACAO), historico: historico.taxaAtrasoSuavizada },
            explicacao: [`Prazo vencido há ${Math.ceil(-diasRestantes)} dia(s).`],
        };
    }

    const fatores = {
        prazo: Math.max(0, 1 - diasRestantes / HORIZONTE_PRAZO_DIAS),
        carga: Math.min(1, carga / CARGA_SATURACAO),
        historico: historico.taxaAtrasoSuavizada,
    };
    const indice = Math.round(
        100 * (PESOS.prazo * fatores.prazo + PESOS.carga * fatores.carga + PESOS.historico * fatores.historico)
    );

    const explicacao = [];
    if (diasRestantes < 1) explicacao.push("O prazo termina em menos de 24 horas.");
    else if (diasRestantes <= 3) explicacao.push(`Faltam cerca de ${Math.max(1, Math.round(diasRestantes))} dia(s) para o prazo.`);
    if (carga > 0) explicacao.push(`${carga} outra(s) entrega(s) pendente(s) num intervalo de ±${JANELA_CARGA_DIAS} dias.`);
    if (historico.concluidas + historico.pendentesVencidas >= 3 && historico.taxaAtrasoSuavizada >= 0.3) {
        explicacao.push(`Histórico recente com ${Math.round(historico.taxaAtrasoSuavizada * 100)}% de entregas fora do prazo.`);
    }
    if (!explicacao.length) explicacao.push("Prazo confortável e baixa concentração de entregas.");

    return { indice, nivel: classificar(indice), diasRestantes, fatores, explicacao };
}

// Janelas deslizantes de 7 dias a partir de hoje; dias consecutivos cuja janela
// atinge o limite são fundidos em um único período de sobrecarga.
function detectarSobrecarga(pendentes, limite = 4, agora = new Date(), horizonteDias = 42) {
    const hoje = inicioDoDia(agora);
    const periodos = [];
    let atual = null;

    for (let d = 0; d < horizonteDias; d++) {
        const inicio = somarDias(hoje, d);
        const fim = somarDias(inicio, 7);
        const naJanela = pendentes.filter((t) => {
            const p = new Date(t.dataEntrega);
            return p >= inicio && p < fim;
        });
        if (naJanela.length >= limite) {
            if (atual) {
                atual.fim = somarDias(fim, -1);
                atual.maximo = Math.max(atual.maximo, naJanela.length);
                naJanela.forEach((t) => atual.ids.add(String(t._id)));
            } else {
                atual = { inicio, fim: somarDias(fim, -1), maximo: naJanela.length, ids: new Set(naJanela.map((t) => String(t._id))) };
            }
        } else if (atual) {
            periodos.push(atual);
            atual = null;
        }
    }
    if (atual) periodos.push(atual);

    return periodos.map((p) => ({
        inicio: p.inicio,
        fim: p.fim,
        maximoEm7Dias: p.maximo,
        tarefas: [...p.ids],
    }));
}

function analisar(tarefas, { limiteSobrecarga = 4, agora = new Date() } = {}) {
    const pendentes = tarefas.filter((t) => !t.concluida);
    const historico = calcularHistorico(tarefas, agora);

    const avaliacoes = pendentes
        .map((t) => ({ tarefa: t, ...avaliarTarefa(t, pendentes, historico, agora) }))
        .sort((a, b) => b.indice - a.indice || new Date(a.tarefa.dataEntrega) - new Date(b.tarefa.dataEntrega));

    const resumo = { atrasada: 0, alto: 0, medio: 0, baixo: 0 };
    avaliacoes.forEach((a) => (resumo[a.nivel] += 1));

    return {
        geradoEm: agora,
        metodo: "regras",
        parametros: { pesos: PESOS, horizontePrazoDias: HORIZONTE_PRAZO_DIAS, janelaCargaDias: JANELA_CARGA_DIAS, limiares: LIMIARES, limiteSobrecarga },
        resumo,
        historico,
        tarefas: avaliacoes,
        sobrecarga: detectarSobrecarga(pendentes, limiteSobrecarga, agora),
    };
}

// Vetores de atributos para a segunda fase (classificação supervisionada).
// Cada tarefa concluída vira um exemplo rotulado (atrasou = 1 ou 0). Os atributos
// usam apenas informações disponíveis antes do prazo, para evitar vazamento de rótulo.
function montarDataset(tarefas) {
    const concluidas = tarefas.filter((t) => t.concluida && t.dataConclusao && t.createdAt);
    return concluidas.map((t) => {
        const prazo = new Date(t.dataEntrega);
        const criacao = new Date(t.createdAt);
        const anteriores = tarefas.filter(
            (o) => String(o._id) !== String(t._id) && o.concluida && o.dataConclusao && new Date(o.dataConclusao) < criacao
        );
        const atrasosAnteriores = anteriores.filter(entregueComAtraso).length;
        const abertasNaJanela = tarefas.filter(
            (o) =>
                String(o._id) !== String(t._id) &&
                new Date(o.createdAt || 0) <= prazo &&
                (!o.dataConclusao || new Date(o.dataConclusao) >= criacao) &&
                Math.abs(diasEntre(prazo, o.dataEntrega)) <= JANELA_CARGA_DIAS
        ).length;
        return {
            id: String(t._id),
            antecedenciaCadastroDias: Number(diasEntre(criacao, prazo).toFixed(2)),
            tarefasAbertasJanela: abertasNaJanela,
            prioridade: t.prioridade,
            prioridadeNum: { alta: 3, media: 2, baixa: 1 }[t.prioridade] || 2,
            diaSemanaPrazo: prazo.getDay(),
            historicoTarefas: anteriores.length,
            taxaAtrasoAnterior: anteriores.length ? Number((atrasosAnteriores / anteriores.length).toFixed(3)) : null,
            atrasou: entregueComAtraso(t) ? 1 : 0,
        };
    });
}

module.exports = {
    PESOS,
    LIMIARES,
    calcularHistorico,
    avaliarTarefa,
    detectarSobrecarga,
    analisar,
    montarDataset,
    classificar,
};
