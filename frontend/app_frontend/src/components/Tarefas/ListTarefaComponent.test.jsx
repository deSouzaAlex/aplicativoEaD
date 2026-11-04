import { beforeEach, describe, expect, test, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderComRota, tarefa, verificarAcessibilidade } from "../../test/utils";

const servicos = vi.hoisted(() => ({
    getAllTarefas: vi.fn(),
    updateTarefa: vi.fn(),
    deleteTarefa: vi.fn(),
    getAnaliseRisco: vi.fn(),
}));
vi.mock("../../services/TarefaService", () => servicos);
vi.mock("../../services/AnaliseService", () => ({ getAnaliseRisco: servicos.getAnaliseRisco }));
vi.mock("../../contexts/LembretesContext", () => ({ useLembretes: () => ({ recarregar: vi.fn() }) }));

import ListTarefaComponent from "./ListTarefaComponent";

const lista = [
    tarefa({ _id: "t1", nome: "Lista de SQL", prioridade: "alta" }),
    tarefa({ _id: "t2", nome: "Fórum semanal", prioridade: "baixa", concluida: true }),
];

beforeEach(() => {
    vi.clearAllMocks();
    servicos.getAllTarefas.mockResolvedValue({ data: lista });
    servicos.updateTarefa.mockResolvedValue({ data: {} });
    servicos.getAnaliseRisco.mockResolvedValue({
        data: { tarefas: [{ tarefa: { _id: "t1" }, nivel: "alto", indice: 72, explicacao: ["Faltam 2 dia(s)."] }] },
    });
});

describe("ListTarefaComponent", () => {
    test("solicita a ordenação automática e exibe prioridade e risco também em texto", async () => {
        const { container } = renderComRota(<ListTarefaComponent />);
        const item = (await screen.findByText("Lista de SQL")).closest("li");
        expect(servicos.getAllTarefas).toHaveBeenCalledWith({ ordenar: "auto" });
        expect(within(item).getByText("Alta")).toBeInTheDocument();
        expect(within(item).getByText("Risco alto")).toBeInTheDocument();
        expect(await verificarAcessibilidade(container)).toHaveNoViolations();
    });

    test("caixa de seleção tem nome acessível e envia apenas a mudança de situação", async () => {
        renderComRota(<ListTarefaComponent />);
        const caixa = await screen.findByRole("checkbox", { name: /Lista de SQL/ });
        await userEvent.click(caixa);
        expect(servicos.updateTarefa).toHaveBeenCalledWith("t1", { concluida: true });
    });

    test("filtros indicam o estado selecionado", async () => {
        renderComRota(<ListTarefaComponent />);
        await screen.findByText("Lista de SQL");
        const pendentes = screen.getByRole("button", { name: "Pendentes" });
        await userEvent.click(pendentes);
        expect(pendentes).toHaveAttribute("aria-pressed", "true");
        expect(screen.queryByText("Fórum semanal")).not.toBeInTheDocument();
    });

    test("permite ordenar por data de entrega", async () => {
        renderComRota(<ListTarefaComponent />);
        await screen.findByText("Lista de SQL");
        await userEvent.selectOptions(screen.getByLabelText("Ordenar por"), "prazo");
        expect(servicos.getAllTarefas).toHaveBeenLastCalledWith({ ordenar: "prazo" });
    });
});
