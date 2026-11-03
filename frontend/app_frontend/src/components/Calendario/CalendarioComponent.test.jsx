import { describe, expect, test, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderComRota, verificarAcessibilidade } from "../../test/utils";

vi.mock("../../services/TarefaService", () => ({
    getAllTarefas: vi.fn(() =>
        Promise.resolve({
            data: [{ _id: "x", nome: "Prova de BD", prioridade: "alta", concluida: false, dataEntrega: new Date().toISOString() }],
        })
    ),
}));
vi.mock("../../services/AnaliseService", () => ({
    getAnaliseRisco: vi.fn(() => Promise.resolve({ data: { sobrecarga: [] } })),
}));

import CalendarioComponent from "./CalendarioComponent";

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

describe("CalendarioComponent", () => {
    test("botões de navegação têm nomes acessíveis e alteram o mês", async () => {
        const hoje = new Date();
        renderComRota(<CalendarioComponent />);
        expect(screen.getByText(`${MESES[hoje.getMonth()]} ${hoje.getFullYear()}`)).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", { name: /Próximo mês/ }));
        const seguinte = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1);
        expect(screen.getByText(`${MESES[seguinte.getMonth()]} ${seguinte.getFullYear()}`)).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", { name: "Hoje" }));
        expect(screen.getByText(`${MESES[hoje.getMonth()]} ${hoje.getFullYear()}`)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Mês anterior/ })).toBeInTheDocument();
    });

    test("a prioridade da tarefa é informada por texto e não apenas pela cor", async () => {
        const { container } = renderComRota(<CalendarioComponent />);
        const link = await screen.findByRole("link", { name: /Prioridade Alta: Prova de BD/ });
        expect(link).toHaveTextContent("A");
        expect(await verificarAcessibilidade(container)).toHaveNoViolations();
    });
});

