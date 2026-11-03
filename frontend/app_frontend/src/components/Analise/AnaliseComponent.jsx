import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAnaliseRisco, getDatasetCsv } from "../../services/AnaliseService";
import { formatarData } from "../../utils/datas";
import { mensagemErro, nivelRisco, NIVEIS_RISCO } from "../../utils/rotulos";
import useTitulo from "../../hooks/useTitulo";
import Alerta from "../Alerta";
import Carregando from "../Carregando";

const pct = (v) => (v === null || v === undefined ? "—" : `${Math.round(v * 100)}%`);

const AnaliseComponent = () => {
    useTitulo("Análise de risco");
    const [analise, setAnalise] = useState(null);
    const [erro, setErro] = useState("");

    useEffect(() => {
        getAnaliseRisco()
            .then((res) => setAnalise(res.data))
            .catch((err) => setErro(mensagemErro(err, "Não foi possível calcular a análise.")));
    }, []);

    async function baixarDataset() {
        try {
            const res = await getDatasetCsv();
            const url = URL.createObjectURL(new Blob([res.data], { type: "text/csv;charset=utf-8" }));
            const a = document.createElement("a");
            a.href = url;
            a.download = "dataset-tarefas.csv";
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            setErro(mensagemErro(err));
        }
    }

    if (!analise && !erro) return <Carregando />;

    const h = analise?.historico;

    return (
        <div>
            <h1 className="h2 fw-bold mb-1">Análise de risco</h1>
            <p className="text-secondary mb-4">
                Indicadores calculados a partir dos seus prazos, da concentração de entregas e do seu histórico de
                conclusões. Têm caráter apenas orientativo.
            </p>
            <Alerta mensagem={erro} />

            {analise && (
                <>
                    <section aria-labelledby="titulo-resumo" className="mb-4">
                        <h2 id="titulo-resumo" className="visually-hidden">Resumo</h2>
                        <ul className="row g-3 list-unstyled mb-0">
                            {["atrasada", "alto", "medio", "baixo"].map((n) => (
                                <li key={n} className="col-6 col-lg-3">
                                    <div className="card shadow-sm border-0 h-100">
                                        <div className="card-body">
                                            <span className={`badge ${NIVEIS_RISCO[n].badge} mb-2`}>
                                                <i className={`bi ${NIVEIS_RISCO[n].icone} me-1`} aria-hidden="true"></i>
                                                {NIVEIS_RISCO[n].rotulo}
                                            </span>
                                            <div className="fs-3 fw-bold">{analise.resumo[n]}</div>
                                            <div className="text-secondary" style={{ fontSize: "12px" }}>tarefa(s) pendente(s)</div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <div className="row g-3 mb-4">
                        <section className="col-lg-6" aria-labelledby="titulo-sobrecarga">
                            <div className="card shadow-sm border-0 h-100">
                                <div className="card-body">
                                    <h2 id="titulo-sobrecarga" className="h6 fw-bold">Períodos de sobrecarga</h2>
                                    <p className="text-secondary" style={{ fontSize: "13px" }}>
                                        Intervalos de 7 dias com {analise.parametros.limiteSobrecarga} ou mais entregas pendentes
                                        (limite ajustável no <Link to="/perfil">perfil</Link>).
                                    </p>
                                    {analise.sobrecarga.length === 0 ? (
                                        <p className="text-success mb-0">
                                            <i className="bi bi-check-circle me-1" aria-hidden="true"></i>
                                            Nenhum período de sobrecarga nas próximas seis semanas.
                                        </p>
                                    ) : (
                                        <ul className="mb-0">
                                            {analise.sobrecarga.map((p) => (
                                                <li key={p.inicio}>
                                                    De {formatarData(p.inicio)} a {formatarData(p.fim)}: até{" "}
                                                    <strong>{p.maximoEm7Dias}</strong> entregas em 7 dias ({p.tarefas.length} tarefas envolvidas).
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className="col-lg-6" aria-labelledby="titulo-historico">
                            <div className="card shadow-sm border-0 h-100">
                                <div className="card-body">
                                    <h2 id="titulo-historico" className="h6 fw-bold">Seu histórico</h2>
                                    <dl className="row mb-0" style={{ fontSize: "14px" }}>
                                        <dt className="col-8 fw-normal text-secondary">Tarefas concluídas</dt>
                                        <dd className="col-4 text-end fw-semibold">{h.concluidas}</dd>
                                        <dt className="col-8 fw-normal text-secondary">Concluídas no prazo</dt>
                                        <dd className="col-4 text-end fw-semibold">{h.concluidasNoPrazo}</dd>
                                        <dt className="col-8 fw-normal text-secondary">Concluídas com atraso</dt>
                                        <dd className="col-4 text-end fw-semibold">{h.concluidasComAtraso}</dd>
                                        <dt className="col-8 fw-normal text-secondary">Pendentes já vencidas</dt>
                                        <dd className="col-4 text-end fw-semibold">{h.pendentesVencidas}</dd>
                                        <dt className="col-8 fw-normal text-secondary">Taxa de pontualidade</dt>
                                        <dd className="col-4 text-end fw-semibold mb-0">{pct(h.taxaPontualidade)}</dd>
                                    </dl>
                                </div>
                            </div>
                        </section>
                    </div>

                    <section className="card shadow-sm border-0 mb-4" aria-labelledby="titulo-tarefas-risco">
                        <div className="card-body">
                            <h2 id="titulo-tarefas-risco" className="h6 fw-bold mb-3">Risco por tarefa pendente</h2>
                            {analise.tarefas.length === 0 ? (
                                <p className="text-secondary mb-0">Não há tarefas pendentes.</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table align-middle mb-0">
                                        <caption className="visually-hidden">Tarefas pendentes ordenadas do maior para o menor risco</caption>
                                        <thead>
                                            <tr>
                                                <th scope="col">Tarefa</th>
                                                <th scope="col">Entrega</th>
                                                <th scope="col">Nível</th>
                                                <th scope="col" className="text-end">Índice</th>
                                                <th scope="col">Por quê</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {analise.tarefas.map((a) => {
                                                const n = nivelRisco(a.nivel);
                                                return (
                                                    <tr key={a.tarefa._id}>
                                                        <td>
                                                            <Link to={`/tarefas/editar/${a.tarefa._id}`} className="fw-semibold">{a.tarefa.nome}</Link>
                                                            <div className="text-secondary" style={{ fontSize: "12px" }}>{a.tarefa.disciplina?.nome}</div>
                                                        </td>
                                                        <td className="text-nowrap">{formatarData(a.tarefa.dataEntrega)}</td>
                                                        <td><span className={`badge ${n.badge}`}>
                                                            <i className={`bi ${n.icone} me-1`} aria-hidden="true"></i>{n.rotulo}</span></td>
                                                        <td className="text-end">
                                                            <span className="visually-hidden">{a.indice} de 100</span>
                                                            <div className="d-flex align-items-center justify-content-end gap-2" aria-hidden="true">
                                                                <div className="progress flex-grow-1" style={{ height: "6px", minWidth: "50px" }}>
                                                                    <div className="progress-bar bg-secondary" style={{ width: `${a.indice}%` }}></div>
                                                                </div>
                                                                <span style={{ minWidth: "28px" }}>{a.indice}</span>
                                                            </div>
                                                        </td>
                                                        <td style={{ fontSize: "13px" }}>{a.explicacao.join(" ")}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </section>

                    <details className="card shadow-sm border-0">
                        <summary className="card-body fw-semibold">Como o índice é calculado</summary>
                        <div className="card-body pt-0" style={{ fontSize: "14px" }}>
                            <p>
                                O índice de 0 a 100 combina três fatores: a proximidade do prazo (peso{" "}
                                {analise.parametros.pesos.prazo * 100}%, considerando um horizonte de{" "}
                                {analise.parametros.horizontePrazoDias} dias), a quantidade de outras entregas pendentes num
                                intervalo de ±{analise.parametros.janelaCargaDias} dias (peso {analise.parametros.pesos.carga * 100}%)
                                e a sua taxa recente de entregas fora do prazo (peso {analise.parametros.pesos.historico * 100}%).
                                Valores a partir de {analise.parametros.limiares.alto} indicam risco alto e a partir de{" "}
                                {analise.parametros.limiares.medio}, risco médio.
                            </p>
                            <p className="mb-2">
                                Os registros de tarefas concluídas também podem ser exportados, sem dados pessoais, para o
                                treinamento de modelos de classificação.
                            </p>
                            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={baixarDataset}>
                                <i className="bi bi-download me-1" aria-hidden="true"></i>Baixar meus dados de treino (CSV)
                            </button>
                        </div>
                    </details>
                </>
            )}
        </div>
    );
};

export default AnaliseComponent;
