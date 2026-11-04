import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllTarefas } from "../services/TarefaService";
import { getAllDisciplinas } from "../services/DisciplinaService";
import { getAnaliseRisco } from "../services/AnaliseService";
import { useAuth } from "../contexts/AuthContext";
import { diasDaSemana, formatarData, mesmoDia, tempoRestante } from "../utils/datas";
import { mensagemErro, nivelRisco, prioridade } from "../utils/rotulos";
import useTitulo from "../hooks/useTitulo";
import Alerta from "./Alerta";
import Carregando from "./Carregando";

const NOMES_DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const estiloSubtitulo = { fontSize: "11px", letterSpacing: "0.06em" };

const IndexComponent = () => {
    useTitulo("Dashboard");
    const { usuario } = useAuth();
    const [tarefas, setTarefas] = useState([]);
    const [disciplinas, setDisciplinas] = useState([]);
    const [analise, setAnalise] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState("");
    const navigator = useNavigate();

    useEffect(() => {
        Promise.all([getAllTarefas({ ordenar: "auto" }), getAllDisciplinas(), getAnaliseRisco()])
            .then(([tarefasRes, disciplinasRes, analiseRes]) => {
                setTarefas(tarefasRes.data);
                setDisciplinas(disciplinasRes.data);
                setAnalise(analiseRes.data);
            })
            .catch((error) => setErro(mensagemErro(error, "Não foi possível carregar o painel.")))
            .finally(() => setLoading(false));
    }, []);

    const hoje = new Date();
    const tarefasPendentes = tarefas.filter((t) => !t.concluida);
    const tarefasConcluidas = tarefas.filter((t) => t.concluida).length;
    const totalTarefas = tarefas.length;
    const percentual = totalTarefas > 0 ? Math.round((tarefasConcluidas / totalTarefas) * 100) : 0;

    // RF06: a lista já chega ordenada pela API (vencidas, depois maior urgência)
    const tarefaPrioritaria = tarefasPendentes[0];

    const proximosPrazos = [...tarefasPendentes]
        .sort((a, b) => new Date(a.dataEntrega) - new Date(b.dataEntrega))
        .slice(0, 4);

    // Visão da semana restrita à semana corrente (segunda a domingo)
    const semana = diasDaSemana(hoje);

    const riscoPorTarefa = new Map((analise?.tarefas || []).map((a) => [a.tarefa._id, a]));
    const riscoPrioritaria = tarefaPrioritaria && riscoPorTarefa.get(tarefaPrioritaria._id);
    const emRisco = (analise?.tarefas || []).filter((a) => a.nivel === "alto" || a.nivel === "atrasada");
    const sobrecarga = analise?.sobrecarga?.[0];

    if (loading) return <Carregando />;

    return (
        <div>
            <div className="mb-4">
                <h1 className="h2 fw-bold mb-1">Olá, {usuario?.nome?.split(" ")[0]}!</h1>
                <p className="text-secondary">Vamos organizar seus estudos?</p>
            </div>

            <Alerta mensagem={erro} />

            {(emRisco.length > 0 || sobrecarga) && (
                <div className="alert alert-warning d-flex flex-wrap align-items-center gap-2" role="status">
                    <i className="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
                    <span className="flex-grow-1">
                        {emRisco.length > 0 && <>{emRisco.length} tarefa(s) com risco alto ou em atraso. </>}
                        {sobrecarga && (
                            <>Período de sobrecarga entre {formatarData(sobrecarga.inicio)} e {formatarData(sobrecarga.fim)}, com até {sobrecarga.maximoEm7Dias} entregas em 7 dias.</>
                        )}
                    </span>
                    <Link to="/analise" className="btn btn-sm btn-dark">Ver análise</Link>
                </div>
            )}

            <div className="row g-3 mb-3">
                {/* O que estudar agora */}
                <section className="col-md-4" aria-labelledby="titulo-estudar">
                    <div className="card h-100 shadow-sm border-0">
                        <div className="card-body">
                            <h2 id="titulo-estudar" className="h6 card-subtitle text-secondary text-uppercase mb-3" style={estiloSubtitulo}>
                                O que estudar agora?
                            </h2>
                            {tarefaPrioritaria ? (
                                <>
                                    <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                                        <span className={`badge ${prioridade(tarefaPrioritaria.prioridade).badge}`}>
                                            Prioridade {prioridade(tarefaPrioritaria.prioridade).rotulo.toLowerCase()}
                                        </span>
                                        {riscoPrioritaria && (
                                            <span className={`badge ${nivelRisco(riscoPrioritaria.nivel).badge}`}>
                                                {nivelRisco(riscoPrioritaria.nivel).rotulo}
                                            </span>
                                        )}
                                    </div>
                                    <p className="h5 fw-bold">{tarefaPrioritaria.nome}</p>
                                    <p className="text-primary mb-1" style={{ fontSize: "13px" }}>
                                        {tarefaPrioritaria.disciplina?.nome}
                                    </p>
                                    <p className="text-secondary mb-0" style={{ fontSize: "12px" }}>
                                        Entrega: {formatarData(tarefaPrioritaria.dataEntrega)}
                                    </p>
                                </>
                            ) : (
                                <p className="text-success fw-semibold mt-2">Nenhuma tarefa pendente!</p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Próximos prazos */}
                <section className="col-md-4" aria-labelledby="titulo-prazos">
                    <div className="card h-100 shadow-sm border-0">
                        <div className="card-body">
                            <h2 id="titulo-prazos" className="h6 card-subtitle text-secondary text-uppercase mb-3" style={estiloSubtitulo}>
                                Próximos Prazos
                            </h2>
                            {proximosPrazos.length === 0 && <p className="text-secondary mb-0">Sem prazos pendentes.</p>}
                            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
                                {proximosPrazos.map((t) => {
                                    const p = prioridade(t.prioridade);
                                    const tempo = tempoRestante(t.dataEntrega, hoje);
                                    return (
                                        <li key={t._id} className="d-flex justify-content-between align-items-center gap-2">
                                            <div className="px-2 py-1 rounded text-truncate"
                                                style={{ background: p.cor, color: p.corTexto, fontSize: "12px", fontWeight: "600", flex: 1 }}>
                                                <span className="visually-hidden">Prioridade {p.rotulo}:</span>{" "}
                                                {t.nome}
                                            </div>
                                            <span className={`text-nowrap ${tempo.atrasada ? "text-danger fw-semibold" : "text-secondary"}`}
                                                style={{ fontSize: "12px" }}>
                                                <span aria-hidden={Boolean(tempo.descricao)}>{tempo.texto}</span>
                                                {tempo.descricao && <span className="visually-hidden">{tempo.descricao}</span>}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Cadastrar nova tarefa */}
                <section className="col-md-4" aria-labelledby="titulo-cadastrar">
                    <div className="card h-100 shadow-sm border-0">
                        <div className="card-body d-flex flex-column">
                            <h2 id="titulo-cadastrar" className="h6 card-subtitle text-secondary text-uppercase mb-3" style={estiloSubtitulo}>
                                Cadastrar Nova Tarefa
                            </h2>
                            <button className="btn btn-primary mb-3" onClick={() => navigator("/tarefas/nova")}>
                                + Nova Tarefa
                            </button>
                            <dl className="d-flex flex-column gap-2 mt-auto mb-0">
                                <div className="d-flex justify-content-between align-items-center bg-light rounded p-2">
                                    <dt className="text-secondary fw-normal" style={{ fontSize: "13px" }}>Pendentes</dt>
                                    <dd className="fw-bold text-primary mb-0">{tarefasPendentes.length}</dd>
                                </div>
                                <div className="d-flex justify-content-between align-items-center bg-light rounded p-2">
                                    <dt className="text-secondary fw-normal" style={{ fontSize: "13px" }}>Concluídas</dt>
                                    <dd className="fw-bold text-success mb-0">{tarefasConcluidas}</dd>
                                </div>
                                <div className="d-flex justify-content-between align-items-center bg-light rounded p-2">
                                    <dt className="text-secondary fw-normal" style={{ fontSize: "13px" }}>Disciplinas</dt>
                                    <dd className="fw-bold text-info-emphasis mb-0">{disciplinas.length}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </section>
            </div>

            {/* Visão da semana corrente */}
            <section className="card shadow-sm border-0" aria-labelledby="titulo-semana">
                <div className="card-body">
                    <h2 id="titulo-semana" className="h6 card-subtitle text-secondary text-uppercase mb-3" style={estiloSubtitulo}>
                        Visão Geral da Semana ({formatarData(semana[0])} a {formatarData(semana[6])})
                    </h2>
                    <div className="semana-grade mb-3">
                        {semana.map((dia, i) => {
                            const tarefasDia = tarefasPendentes.filter((t) => mesmoDia(t.dataEntrega, dia));
                            const ehHoje = mesmoDia(dia, hoje);
                            return (
                                <div key={NOMES_DIAS[i]} className="text-center" data-testid={`dia-${i}`}>
                                    <div className={`mb-2 ${ehHoje ? "text-primary fw-bold" : "text-secondary"}`} style={{ fontSize: "11px", fontWeight: "600" }}>
                                        {NOMES_DIAS[i]} <span className="d-block fw-normal">{dia.getDate()}</span>
                                        {ehHoje && <span className="visually-hidden"> (hoje)</span>}
                                    </div>
                                    <ul className="list-unstyled d-flex flex-column gap-1 mb-0">
                                        {tarefasDia.length === 0 && (
                                            <li className="bg-light rounded" style={{ height: "18px" }}>
                                                <span className="visually-hidden">Sem entregas</span>
                                            </li>
                                        )}
                                        {tarefasDia.slice(0, 3).map((t) => {
                                            const p = prioridade(t.prioridade);
                                            return (
                                                <li key={t._id} className="rounded px-1 text-truncate"
                                                    style={{ background: p.cor, color: p.corTexto, fontSize: "10px", lineHeight: "18px" }}
                                                    title={`${t.nome} (prioridade ${p.rotulo.toLowerCase()})`}>
                                                    <span aria-hidden="true">{p.sigla}</span>
                                                    <span className="visually-hidden">Prioridade {p.rotulo}: {t.nome}</span>
                                                </li>
                                            );
                                        })}
                                        {tarefasDia.length > 3 && (
                                            <li className="text-secondary" style={{ fontSize: "10px" }}>+{tarefasDia.length - 3}</li>
                                        )}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                    <p className="text-secondary mb-2" style={{ fontSize: "11px" }}>
                        Legenda: A = prioridade alta, M = média, B = baixa.
                    </p>
                    <div className="text-secondary mb-1" style={{ fontSize: "12px" }} id="rotulo-progresso">
                        {tarefasConcluidas}/{totalTarefas} tarefas concluídas ({percentual}%)
                    </div>
                    <div className="progress" style={{ height: "6px" }} role="progressbar"
                        aria-labelledby="rotulo-progresso" aria-valuenow={percentual} aria-valuemin={0} aria-valuemax={100}>
                        <div className="progress-bar bg-primary" style={{ width: `${percentual}%` }}></div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default IndexComponent;
