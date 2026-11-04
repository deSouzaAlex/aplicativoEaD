// RF05 - Lembretes de atividades com antecedência configurável.
//
// A antecedência é definida por tarefa (lembreteAntecedenciaDias) ou, na ausência
// dela, pela preferência do usuário. Uma tarefa pendente gera lembrete a partir do
// momento em que faltam "antecedência" dias ou menos para o prazo.
const { DIA_MS } = require("./datas");

function gerarLembretes(tarefas, antecedenciaPadraoDias = 2, agora = new Date()) {
    const lembretes = [];
    for (const t of tarefas) {
        if (t.concluida) continue;
        const antecedencia =
            t.lembreteAntecedenciaDias === null || t.lembreteAntecedenciaDias === undefined
                ? antecedenciaPadraoDias
                : t.lembreteAntecedenciaDias;
        const prazo = new Date(t.dataEntrega).getTime();
        const restanteMs = prazo - agora.getTime();
        if (restanteMs > antecedencia * DIA_MS) continue;

        let tipo;
        if (restanteMs < 0) tipo = "atrasada";
        else if (restanteMs <= DIA_MS) tipo = "hoje";
        else tipo = "proxima";

        lembretes.push({
            tarefa: t,
            tipo,
            horasRestantes: Math.round(restanteMs / (60 * 60 * 1000)),
            antecedenciaDias: antecedencia,
        });
    }
    const ordemTipo = { atrasada: 0, hoje: 1, proxima: 2 };
    return lembretes.sort(
        (a, b) =>
            ordemTipo[a.tipo] - ordemTipo[b.tipo] ||
            new Date(a.tarefa.dataEntrega) - new Date(b.tarefa.dataEntrega)
    );
}

module.exports = { gerarLembretes };
