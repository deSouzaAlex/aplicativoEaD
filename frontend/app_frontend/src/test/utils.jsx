import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { axe } from "jest-axe";

export function renderComRota(ui, { rota = "/" } = {}) {
    return render(<MemoryRouter initialEntries={[rota]}>{ui}</MemoryRouter>);
}

// Verificação automática de acessibilidade com axe-core (regras WCAG A e AA)
export function verificarAcessibilidade(container) {
    return axe(container, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
        // contraste depende do CSS real, que não é carregado no jsdom
        rules: { "color-contrast": { enabled: false } },
    });
}

const DIA = 24 * 60 * 60 * 1000;
export const emDias = (d) => new Date(Date.now() + d * DIA).toISOString();

export const disciplina = { _id: "d1", nome: "Banco de Dados", cor: "#4F46E5" };

export const tarefa = (extra = {}) => ({
    _id: Math.random().toString(36).slice(2),
    nome: "Tarefa",
    prioridade: "media",
    concluida: false,
    dataEntrega: emDias(2),
    disciplina,
    ...extra,
});
