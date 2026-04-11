import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllTarefas, deleteTarefa, updateTarefa } from "../../services/TarefaService";

const ListTarefaComponent = () => {
    const [tarefas, setTarefas] = useState([]);
    const [filtro, setFiltro] = useState("todas");
    const navigator = useNavigate();

    useEffect(() => {
        carregarTarefas();
    }, []);

    function carregarTarefas() {
        getAllTarefas()
            .then((response) => setTarefas(response.data))
            .catch((error) => console.error(error));
    }

    function handleEditar(id) {
        navigator(`/tarefas/editar/${id}`);
    }

    function handleDeletar(id) {
        if (window.confirm("Deseja realmente excluir esta tarefa?")) {
            deleteTarefa(id)
                .then(() => carregarTarefas())
                .catch((error) => console.error(error));
        }
    }

    function handleToggleConcluida(tarefa) {
        updateTarefa(tarefa._id, {
            ...tarefa,
            concluida: !tarefa.concluida,
            disciplina: tarefa.disciplina?._id || tarefa.disciplina,
        })
            .then(() => carregarTarefas())
            .catch((error) => console.error(error));
    }

    const tarefasFiltradas = tarefas.filter((t) => {
        if (filtro === "pendentes") return !t.concluida;
        if (filtro === "concluidas") return t.concluida;
        return true;
    });

    const badgePrioridade = (p) => {
        if (p === "alta") return "danger";
        if (p === "media") return "warning";
        return "success";
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0">Tarefas</h2>
                <button className="btn btn-primary" onClick={() => navigator("/tarefas/nova")}>
                    + Nova Tarefa
                </button>
            </div>

            <div className="btn-group mb-3" role="group">
                {["todas", "pendentes", "concluidas"].map((f) => (
                    <button
                        key={f}
                        type="button"
                        className={`btn btn-sm ${filtro === f ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => setFiltro(f)}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {tarefasFiltradas.length === 0 ? (
                <div className="text-center py-5 text-muted">
                    <i className="bi bi-clipboard-check" style={{ fontSize: "48px" }}></i>
                    <p className="mt-3">Nenhuma tarefa encontrada.</p>
                </div>
            ) : (
                <div className="card shadow-sm border-0">
                    <ul className="list-group list-group-flush">
                        {tarefasFiltradas.map((t) => (
                            <li key={t._id}
                                className={`list-group-item d-flex align-items-center gap-3 py-3 ${t.concluida ? "opacity-50" : ""}`}>
                                <input
                                    type="checkbox"
                                    className="form-check-input mt-0"
                                    checked={t.concluida}
                                    onChange={() => handleToggleConcluida(t)}
                                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                                />
                                <div className="flex-grow-1">
                                    <div className={`fw-semibold ${t.concluida ? "text-decoration-line-through" : ""}`}>
                                        {t.nome}
                                    </div>
                                    <div className="text-muted" style={{ fontSize: "12px" }}>
                                        {t.disciplina?.nome || "—"}
                                    </div>
                                </div>
                                <span className={`badge bg-${badgePrioridade(t.prioridade)}`}>
                                    {t.prioridade}
                                </span>
                                <span className="text-muted" style={{ fontSize: "12px", minWidth: "80px" }}>
                                    {new Date(t.dataEntrega).toLocaleDateString("pt-BR")}
                                </span>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-sm btn-outline-primary"
                                        onClick={() => handleEditar(t._id)}>
                                        Editar
                                    </button>
                                    <button className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleDeletar(t._id)}>
                                        Excluir
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ListTarefaComponent;
