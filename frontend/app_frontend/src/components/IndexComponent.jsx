import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllTarefas } from "../services/TarefaService";
import { getAllDisciplinas } from "../services/DisciplinaService";

const IndexComponent = () => {
    const [tarefas, setTarefas] = useState([]);
    const [disciplinas, setDisciplinas] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigator = useNavigate();

    useEffect(() => {
        Promise.all([getAllTarefas(), getAllDisciplinas()])
            .then(([tarefasRes, disciplinasRes]) => {
                setTarefas(tarefasRes.data);
                setDisciplinas(disciplinasRes.data);
            })
            .catch((error) => console.error(error))
            .finally(() => setLoading(false));
    }, []);

    const hoje = new Date();
    const tarefasPendentes = tarefas.filter((t) => !t.concluida);
    const tarefasConcluidas = tarefas.filter((t) => t.concluida).length;
    const totalTarefas = tarefas.length;
    const percentual = totalTarefas > 0 ? Math.round((tarefasConcluidas / totalTarefas) * 100) : 0;

    const tarefaPrioritaria = tarefasPendentes
        .filter((t) => t.prioridade === "alta")
        .sort((a, b) => new Date(a.dataEntrega) - new Date(b.dataEntrega))[0];

    const proximosPrazos = [...tarefasPendentes]
        .sort((a, b) => new Date(a.dataEntrega) - new Date(b.dataEntrega))
        .slice(0, 4);
    console.log("proximosPrazos:", proximosPrazos);

    const calcularTempo = (dataEntrega) => {
        const diff = new Date(dataEntrega) - hoje;
        const horas = Math.round(diff / (1000 * 60 * 60));
        if (horas < 0) return "Atrasada";
        if (horas < 24) return `${horas}h`;
        return `${Math.round(horas / 24)}d`;
    };

    const badgePrioridade = (p) => {
        if (p === "alta") return "perigo";
        if (p === "media") return "atenção";
        return "success";
    };

    const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
            </div>
        </div>
    );

    return (
        <div>
            <div className="mb-4">
                <h2 className="fw-bold mb-1">Olá, Maria!</h2>
                <p className="text-muted">Vamos organizar seus estudos?</p>
            </div>

            <div className="row g-3 mb-3">
                {/* O que estudar agora */}
                <div className="col-md-4">
                    <div className="card h-100 shadow-sm border-0">
                        <div className="card-body">
                            <h6 className="card-subtitle text-muted text-uppercase mb-3" style={{ fontSize: "11px", letterSpacing: "0.06em" }}>
                                O que estudar agora?
                            </h6>
                            {tarefaPrioritaria ? (
                                <>
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <span className="badge bg-danger">Alta prioridade</span>
                                    </div>
                                    <h5 className="fw-bold">{tarefaPrioritaria.nome}</h5>
                                    <p className="text-primary mb-1" style={{ fontSize: "13px" }}>
                                        {tarefaPrioritaria.disciplina?.nome}
                                    </p>
                                    <p className="text-muted" style={{ fontSize: "12px" }}>
                                        Entrega: {new Date(tarefaPrioritaria.dataEntrega).toLocaleDateString("pt-BR")}
                                    </p>
                                </>
                            ) : (
                                <p className="text-success fw-semibold mt-2">Nenhuma tarefa urgente! </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Próximos prazos */}
                <div className="col-md-4">
                    <div className="card h-100 shadow-sm border-0">
                        <div className="card-body">
                            <h6 className="card-subtitle text-muted text-uppercase mb-3" style={{ fontSize: "11px", letterSpacing: "0.06em" }}>
                                Próximos Prazos
                            </h6>
                            {proximosPrazos.map((t) => (
                                <li key={t._id} className="d-flex justify-content-between align-items-center gap-2">
                                    <div className={`px-2 py-1 rounded text-white`}
                                        style={{
                                            background: t.prioridade === "alta" ? "#dc3545" : t.prioridade === "media" ? "#ffc107" : "#198754",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            flex: 1,
                                        }}>
                                        {t.nome}
                                    </div>
                                    <span className="text-muted text-nowrap" style={{ fontSize: "12px" }}>
                                        {calcularTempo(t.dataEntrega)}
                                    </span>
                                </li>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Cadastrar nova tarefa */}
                <div className="col-md-4">
                    <div className="card h-100 shadow-sm border-0">
                        <div className="card-body d-flex flex-column">
                            <h6 className="card-subtitle text-muted text-uppercase mb-3" style={{ fontSize: "11px", letterSpacing: "0.06em" }}>
                                Cadastrar Nova Tarefa
                            </h6>
                            <button className="btn btn-primary mb-3" onClick={() => navigator("/tarefas/nova")}>
                                + Nova Tarefa
                            </button>
                            <div className="d-flex flex-column gap-2 mt-auto">
                                <div className="d-flex justify-content-between align-items-center bg-light rounded p-2">
                                    <span className="text-muted" style={{ fontSize: "13px" }}>Pendentes</span>
                                    <span className="fw-bold text-primary">{tarefasPendentes.length}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center bg-light rounded p-2">
                                    <span className="text-muted" style={{ fontSize: "13px" }}>Concluídas</span>
                                    <span className="fw-bold text-success">{tarefasConcluidas}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center bg-light rounded p-2">
                                    <span className="text-muted" style={{ fontSize: "13px" }}>Disciplinas</span>
                                    <span className="fw-bold text-info">{disciplinas.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Visão da semana */}
            <div className="card shadow-sm border-0">
                <div className="card-body">
                    <h6 className="card-subtitle text-muted text-uppercase mb-3" style={{ fontSize: "11px", letterSpacing: "0.06em" }}>
                        Visão Geral da Semana
                    </h6>
                    <div className="row g-2 mb-3">
                        {diasSemana.map((dia, i) => {
                            const tarefasDia = tarefasPendentes.filter((t) => {
                                const d = new Date(t.dataEntrega);
                                return d.getDay() === (i + 1);
                            });
                            return (
                                <div key={dia} className="col text-center">
                                    <div className="text-muted mb-2" style={{ fontSize: "11px", fontWeight: "600" }}>{dia}</div>
                                    <div className="d-flex flex-column gap-1">
                                        {tarefasDia.length === 0 && (
                                            <div className="bg-light rounded" style={{ height: "18px" }}></div>
                                        )}
                                        {tarefasDia.slice(0, 3).map((t) => (
                                            <div key={t._id}
                                                className={`bg-${badgePrioridade(t.prioridade)} rounded`}
                                                style={{ height: "18px", opacity: 0.85 }}
                                                title={t.nome}>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="text-muted mb-1" style={{ fontSize: "12px" }}>
                        {tarefasConcluidas}/{totalTarefas} tarefas concluídas ({percentual}%)
                    </div>
                    <div className="progress" style={{ height: "6px" }}>
                        <div className="progress-bar bg-primary" style={{ width: `${percentual}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IndexComponent;
