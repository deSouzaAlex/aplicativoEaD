import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllTarefas, deleteTarefa, updateTarefa } from "../../services/TarefaService";
import { getAnaliseRisco } from "../../services/AnaliseService";
import { useLembretes } from "../../contexts/LembretesContext";
import { formatarData } from "../../utils/datas";
import { mensagemErro, nivelRisco, prioridade } from "../../utils/rotulos";
import useTitulo from "../../hooks/useTitulo";
import Alerta from "../Alerta";

const FILTROS = [
    { valor: "todas", rotulo: "Todas" },
    { valor: "pendentes", rotulo: "Pendentes" },
    { valor: "concluidas", rotulo: "Concluídas" },
];

const ListTarefaComponent = () => {
    useTitulo("Tarefas");
    const [tarefas, setTarefas] = useState([]);
    const [riscos, setRiscos] = useState(new Map());
    const [filtro, setFiltro] = useState("todas");
    const [ordenacao, setOrdenacao] = useState("auto");
    const [erro, setErro] = useState("");
    const { recarregar: recarregarLembretes } = useLembretes();
    const navigator = useNavigate();

    const carregarTarefas = useCallback(() => {
        Promise.all([getAllTarefas({ ordenar: ordenacao }), getAnaliseRisco()])
            .then(([tRes, aRes]) => {
                setTarefas(tRes.data);
                setRiscos(new Map(aRes.data.tarefas.map((a) => [a.tarefa._id, a])));
            })
            .catch((error) => setErro(mensagemErro(error, "Não foi possível carregar as tarefas.")));
    }, [ordenacao]);

    useEffect(() => {
        carregarTarefas();
    }, [carregarTarefas]);

    function handleEditar(id) {
        navigator(`/tarefas/editar/${id}`);
    }

    function handleDeletar(t) {
        if (window.confirm(`Deseja realmente excluir a tarefa "${t.nome}"?`)) {
            deleteTarefa(t._id)
                .then(() => {
                    carregarTarefas();
                    recarregarLembretes();
                })
                .catch((error) => setErro(mensagemErro(error)));
        }
    }

    function handleToggleConcluida(tarefa) {
        updateTarefa(tarefa._id, { concluida: !tarefa.concluida })
            .then(() => {
                carregarTarefas();
                recarregarLembretes();
            })
            .catch((error) => setErro(mensagemErro(error)));
    }

    const tarefasFiltradas = tarefas.filter((t) => {
        if (filtro === "pendentes") return !t.concluida;
        if (filtro === "concluidas") return t.concluida;
        return true;
    });

    return (
        <div>
            <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-4">
                <h1 className="h2 fw-bold mb-0">Tarefas</h1>
                <button className="btn btn-primary" onClick={() => navigator("/tarefas/nova")}>
                    + Nova Tarefa
                </button>
            </div>

            <Alerta mensagem={erro} onFechar={() => setErro("")} />

            <div className="d-flex flex-wrap gap-3 align-items-center justify-content-between mb-3">
                <div className="btn-group" role="group" aria-label="Filtrar tarefas por situação">
                    {FILTROS.map((f) => (
                        <button
                            key={f.valor}
                            type="button"
                            aria-pressed={filtro === f.valor}
                            className={`btn btn-sm ${filtro === f.valor ? "btn-primary" : "btn-outline-primary"}`}
                            onClick={() => setFiltro(f.valor)}
                        >
                            {f.rotulo}
                        </button>
                    ))}
                </div>
                <div className="d-flex align-items-center gap-2">
                    <label htmlFor="ordenacao" className="form-label mb-0 text-nowrap">Ordenar por</label>
                    <select id="ordenacao" className="form-select form-select-sm" value={ordenacao}
                        onChange={(e) => setOrdenacao(e.target.value)}>
                        <option value="auto">Prioridade automática</option>
                        <option value="prazo">Data de entrega</option>
                    </select>
                </div>
            </div>

            {tarefasFiltradas.length === 0 ? (
                <div className="text-center py-5 text-secondary">
                    <i className="bi bi-clipboard-check" style={{ fontSize: "48px" }} aria-hidden="true"></i>
                    <p className="mt-3">Nenhuma tarefa encontrada.</p>
                </div>
            ) : (
                <div className="card shadow-sm border-0">
                    <ul className="list-group list-group-flush" aria-label="Lista de tarefas">
                        {tarefasFiltradas.map((t) => {
                            const p = prioridade(t.prioridade);
                            const risco = riscos.get(t._id);
                            const idCheckbox = `concluir-${t._id}`;
                            return (
                                <li key={t._id}
                                    className={`list-group-item d-flex flex-wrap align-items-center gap-3 py-3 ${t.concluida ? "tarefa-concluida" : ""}`}>
                                    <input
                                        id={idCheckbox}
                                        type="checkbox"
                                        className="form-check-input mt-0"
                                        checked={t.concluida}
                                        onChange={() => handleToggleConcluida(t)}
                                        style={{ width: "18px", height: "18px", cursor: "pointer" }}
                                    />
                                    <div className="flex-grow-1" style={{ minWidth: "160px" }}>
                                        <label htmlFor={idCheckbox}
                                            className={`fw-semibold d-block ${t.concluida ? "text-decoration-line-through" : ""}`}
                                            style={{ cursor: "pointer" }}>
                                            {t.nome}
                                            <span className="visually-hidden">{t.concluida ? " (concluída)" : " (pendente)"}</span>
                                        </label>
                                        <div className="text-secondary" style={{ fontSize: "12px" }}>
                                            {t.disciplina?.nome || "—"}
                                        </div>
                                    </div>
                                    <span className={`badge ${p.badge}`}>
                                        <span className="visually-hidden">Prioridade</span>{" "}{p.rotulo}
                                    </span>
                                    {risco && (
                                        <span className={`badge ${nivelRisco(risco.nivel).badge}`} title={risco.explicacao.join(" ")}>
                                            <i className={`bi ${nivelRisco(risco.nivel).icone} me-1`} aria-hidden="true"></i>
                                            {nivelRisco(risco.nivel).rotulo}
                                        </span>
                                    )}
                                    <span className="text-secondary" style={{ fontSize: "12px", minWidth: "80px" }}>
                                        <span className="visually-hidden">Entrega em</span>{" "}{formatarData(t.dataEntrega)}
                                    </span>
                                    <div className="d-flex gap-2">
                                        <button className="btn btn-sm btn-outline-primary"
                                            aria-label={`Editar tarefa ${t.nome}`}
                                            onClick={() => handleEditar(t._id)}>
                                            Editar
                                        </button>
                                        <button className="btn btn-sm btn-outline-danger"
                                            aria-label={`Excluir tarefa ${t.nome}`}
                                            onClick={() => handleDeletar(t)}>
                                            Excluir
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ListTarefaComponent;
