import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useLembretes } from "../../contexts/LembretesContext";
import { formatarData } from "../../utils/datas";
import { prioridade } from "../../utils/rotulos";
import useTitulo from "../../hooks/useTitulo";

const TIPOS = {
    atrasada: { rotulo: "Atrasada", classe: "border-danger", badge: "bg-danger", icone: "bi-alarm" },
    hoje: { rotulo: "Vence em até 24h", classe: "border-warning", badge: "bg-warning text-dark", icone: "bi-hourglass-split" },
    proxima: { rotulo: "Próxima", classe: "border-primary", badge: "bg-primary", icone: "bi-bell" },
};

function descreverTempo(l) {
    const h = l.horasRestantes;
    if (h < 0) {
        const atraso = Math.abs(h);
        return atraso < 24 ? `atrasada há ${atraso} hora(s)` : `atrasada há ${Math.round(atraso / 24)} dia(s)`;
    }
    if (h < 24) return `faltam ${h} hora(s)`;
    return `faltam ${Math.round(h / 24)} dia(s)`;
}

const LembretesComponent = () => {
    useTitulo("Lembretes");
    const { usuario } = useAuth();
    const { lembretes, recarregar } = useLembretes();
    const antecedencia = usuario?.preferencias?.antecedenciaLembreteDias ?? 2;

    useEffect(() => {
        recarregar();
    }, [recarregar]);

    return (
        <div>
            <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-2">
                <h1 className="h2 fw-bold mb-0">Lembretes</h1>
                <Link to="/perfil" className="btn btn-outline-secondary btn-sm">
                    <i className="bi bi-gear me-1" aria-hidden="true"></i>Configurar antecedência
                </Link>
            </div>
            <p className="text-secondary mb-4">
                Tarefas pendentes que vencem nos próximos {antecedencia} dia(s), ou dentro da antecedência definida em cada tarefa.
            </p>

            {lembretes.length === 0 ? (
                <div className="text-center py-5 text-secondary">
                    <i className="bi bi-bell-slash" style={{ fontSize: "48px" }} aria-hidden="true"></i>
                    <p className="mt-3">Nenhum lembrete no momento.</p>
                </div>
            ) : (
                <ul className="list-unstyled d-flex flex-column gap-2" aria-live="polite">
                    {lembretes.map((l) => {
                        const tipo = TIPOS[l.tipo];
                        const p = prioridade(l.tarefa.prioridade);
                        return (
                            <li key={l.tarefa._id} className={`card border-0 border-start border-4 shadow-sm ${tipo.classe}`}>
                                <div className="card-body py-3 d-flex flex-wrap align-items-center gap-3">
                                    <i className={`bi ${tipo.icone} fs-4`} aria-hidden="true"></i>
                                    <div className="flex-grow-1">
                                        <div className="fw-semibold">{l.tarefa.nome}</div>
                                        <div className="text-secondary" style={{ fontSize: "13px" }}>
                                            {l.tarefa.disciplina?.nome} · entrega em {formatarData(l.tarefa.dataEntrega)} · {descreverTempo(l)}
                                        </div>
                                    </div>
                                    <span className={`badge ${tipo.badge}`}>{tipo.rotulo}</span>
                                    <span className={`badge ${p.badge}`}><span className="visually-hidden">Prioridade</span>{" "}{p.rotulo}</span>
                                    <Link to={`/tarefas/editar/${l.tarefa._id}`} className="btn btn-sm btn-outline-primary"
                                        aria-label={`Abrir tarefa ${l.tarefa.nome}`}>
                                        Abrir
                                    </Link>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default LembretesComponent;
