import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllDisciplinas, deleteDisciplina } from "../../services/DisciplinaService";
import { getAllTarefas } from "../../services/TarefaService";
import { useLembretes } from "../../contexts/LembretesContext";
import { mensagemErro } from "../../utils/rotulos";
import useTitulo from "../../hooks/useTitulo";
import Alerta from "../Alerta";

const ListDisciplinaComponent = () => {
    useTitulo("Disciplinas");
    const [disciplinas, setDisciplinas] = useState([]);
    const [contagem, setContagem] = useState({});
    const [erro, setErro] = useState("");
    const [aviso, setAviso] = useState("");
    const { recarregar: recarregarLembretes } = useLembretes();
    const navigator = useNavigate();

    const carregarDisciplinas = useCallback(() => {
        Promise.all([getAllDisciplinas(), getAllTarefas()])
            .then(([dRes, tRes]) => {
                setDisciplinas(dRes.data);
                const mapa = {};
                tRes.data.forEach((t) => {
                    const id = t.disciplina?._id || t.disciplina;
                    mapa[id] = (mapa[id] || 0) + 1;
                });
                setContagem(mapa);
            })
            .catch((error) => setErro(mensagemErro(error, "Não foi possível carregar as disciplinas.")));
    }, []);

    useEffect(() => {
        carregarDisciplinas();
    }, [carregarDisciplinas]);

    function handleEditar(id) {
        navigator(`/disciplinas/editar/${id}`);
    }

    function handleDeletar(d) {
        const qtd = contagem[d._id] || 0;
        const detalhe = qtd > 0 ? `\n\nAtenção: ${qtd} tarefa(s) vinculada(s) também serão excluídas.` : "";
        if (window.confirm(`Deseja realmente excluir a disciplina "${d.nome}"?${detalhe}`)) {
            deleteDisciplina(d._id)
                .then((res) => {
                    const removidas = res.data?.tarefasRemovidas || 0;
                    setAviso(`Disciplina excluída${removidas ? ` com ${removidas} tarefa(s) vinculada(s)` : ""}.`);
                    carregarDisciplinas();
                    recarregarLembretes();
                })
                .catch((error) => setErro(mensagemErro(error)));
        }
    }

    return (
        <div>
            <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-4">
                <h1 className="h2 fw-bold mb-0">Disciplinas</h1>
                <button className="btn btn-primary" onClick={() => navigator("/disciplinas/nova")}>
                    + Nova Disciplina
                </button>
            </div>

            <Alerta mensagem={erro} onFechar={() => setErro("")} />
            <Alerta mensagem={aviso} tipo="success" onFechar={() => setAviso("")} />

            {disciplinas.length === 0 ? (
                <div className="text-center py-5 text-secondary">
                    <i className="bi bi-book" style={{ fontSize: "48px" }} aria-hidden="true"></i>
                    <p className="mt-3">Nenhuma disciplina cadastrada ainda.</p>
                    <button className="btn btn-primary" onClick={() => navigator("/disciplinas/nova")}>
                        Cadastrar primeira disciplina
                    </button>
                </div>
            ) : (
                <ul className="row g-3 list-unstyled">
                    {disciplinas.map((d) => (
                        <li key={d._id} className="col-sm-6 col-lg-4">
                            <article className="card h-100 shadow-sm border-0"
                                style={{ borderTop: `4px solid ${d.cor}` }} aria-labelledby={`disc-${d._id}`}>
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                                        <h2 id={`disc-${d._id}`} className="h5 card-title fw-bold mb-0">{d.nome}</h2>
                                        <span className="badge rounded-pill bg-light text-dark border"
                                            style={{ borderColor: d.cor, fontSize: "11px" }}>
                                            <span className="visually-hidden">Código</span>{" "}{d.codigo}
                                        </span>
                                    </div>
                                    <p className="text-secondary mb-1" style={{ fontSize: "13px" }}>
                                        <i className="bi bi-person me-1" aria-hidden="true"></i>
                                        <span className="visually-hidden">Professor:</span>{" "}{d.professor}
                                    </p>
                                    <p className="text-secondary mb-1" style={{ fontSize: "12px" }}>
                                        <i className="bi bi-clock me-1" aria-hidden="true"></i>{d.cargaHoraria}h
                                        &nbsp;|&nbsp;
                                        <i className="bi bi-calendar me-1" aria-hidden="true"></i>
                                        <span className="visually-hidden">Semestre</span>{" "}{d.semestre}
                                    </p>
                                    <p className="text-secondary mb-0" style={{ fontSize: "12px" }}>
                                        <i className="bi bi-clipboard-check me-1" aria-hidden="true"></i>
                                        {contagem[d._id] || 0} tarefa(s)
                                    </p>
                                </div>
                                <div className="card-footer bg-white border-0 d-flex gap-2 pt-0 pb-3 px-3">
                                    <button className="btn btn-sm btn-outline-primary w-50"
                                        aria-label={`Editar disciplina ${d.nome}`}
                                        onClick={() => handleEditar(d._id)}>
                                        Editar
                                    </button>
                                    <button className="btn btn-sm btn-outline-danger w-50"
                                        aria-label={`Excluir disciplina ${d.nome}`}
                                        onClick={() => handleDeletar(d)}>
                                        Excluir
                                    </button>
                                </div>
                            </article>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ListDisciplinaComponent;
