export const PRIORIDADES = {
    alta: { rotulo: "Alta", sigla: "A", badge: "bg-danger", cor: "#dc3545", corTexto: "#fff" },
    media: { rotulo: "Média", sigla: "M", badge: "bg-warning text-dark", cor: "#ffc107", corTexto: "#212529" },
    baixa: { rotulo: "Baixa", sigla: "B", badge: "bg-success", cor: "#198754", corTexto: "#fff" },
};

export const prioridade = (p) => PRIORIDADES[p] || PRIORIDADES.media;

export const NIVEIS_RISCO = {
    atrasada: { rotulo: "Atrasada", badge: "bg-dark", icone: "bi-exclamation-octagon" },
    alto: { rotulo: "Risco alto", badge: "bg-danger", icone: "bi-exclamation-triangle" },
    medio: { rotulo: "Risco médio", badge: "bg-warning text-dark", icone: "bi-exclamation-circle" },
    baixo: { rotulo: "Risco baixo", badge: "bg-success", icone: "bi-check-circle" },
};

export const nivelRisco = (n) => NIVEIS_RISCO[n] || NIVEIS_RISCO.baixo;

export function mensagemErro(error, padrao = "Não foi possível concluir a operação.") {
    if (!error?.response) return "Não foi possível conectar ao servidor. Verifique sua conexão.";
    return error.response.data?.error || error.response.data?.message || padrao;
}
