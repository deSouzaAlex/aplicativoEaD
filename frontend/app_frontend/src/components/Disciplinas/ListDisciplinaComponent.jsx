import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllDisciplinas, deleteDisciplina } from "../../services/DisciplinaService";

const ListDisciplinaComponent = () => {
    const [disciplinas, setDisciplinas] = useState([]);
    const navigator = useNavigate();

    useEffect(() => {
        carregarDisciplinas();
    }, []);

    function carregarDisciplinas() {
        getAllDisciplinas()
            .then((response) => setDisciplinas(response.data))
            .catch((error) => console.error(error));
    }

    function handleEditar(id) {
        navigator(`/disciplinas/editar/${id}`);
    }

    function handleDeletar(id) {
        if (window.confirm("Deseja realmente excluir esta disciplina?")) {
            deleteDisciplina(id)
                .then(() => carregarDisciplinas())
                .catch((error) => console.error(error));
        }
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0">Disciplinas</h2>
                <button className="btn btn-primary" onClick={() => navigator("/disciplinas/nova")}>
                    + Nova Disciplina
                </button>
            </div>

            {disciplinas.length === 0 ? (
                <div className="text-center py-5 text-muted">
                    <i className="bi bi-book" style={{ fontSize: "48px" }}></i>
                    <p className="mt-3">Nenhuma disciplina cadastrada ainda.</p>
                    <button className="btn btn-primary" onClick={() => navigator("/disciplinas/nova")}>
                        Cadastrar primeira disciplina
                    </button>
                </div>
            ) : (
                <div className="row g-3">
                    {disciplinas.map((d) => (
                        <div key={d._id} className="col-md-4">
                            <div className="card h-100 shadow-sm border-0"
                                style={{ borderTop: `4px solid ${d.cor}` }}>
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h5 className="card-title fw-bold mb-0">{d.nome}</h5>
                                        <span className="badge rounded-pill"
                                            style={{ background: d.cor, fontSize: "11px" }}>
                                            {d.codigo}
                                        </span>
                                    </div>
                                    <p className="text-muted mb-1" style={{ fontSize: "13px" }}>
                                        <i className="bi bi-person me-1"></i>{d.professor}
                                    </p>
                                    <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
                                        <i className="bi bi-clock me-1"></i>{d.cargaHoraria}h
                                        &nbsp;|&nbsp;
                                        <i className="bi bi-calendar me-1"></i>{d.semestre}
                                    </p>
                                </div>
                                <div className="card-footer bg-white border-0 d-flex gap-2 pt-0 pb-3 px-3">
                                    <button className="btn btn-sm btn-outline-primary w-50"
                                        onClick={() => handleEditar(d._id)}>
                                        Editar
                                    </button>
                                    <button className="btn btn-sm btn-outline-danger w-50"
                                        onClick={() => handleDeletar(d._id)}>
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ListDisciplinaComponent;
