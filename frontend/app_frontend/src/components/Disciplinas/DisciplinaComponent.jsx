import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    createDisciplina,
    getDisciplinaById,
    updateDisciplina,
} from "../../services/DisciplinaService";

const DisciplinaComponent = () => {
    const { id } = useParams();
    const navigator = useNavigate();
    const isEdicao = Boolean(id);

    const [form, setForm] = useState({
        nome: "",
        codigo: "",
        professor: "",
        cargaHoraria: "",
        semestre: "",
        cor: "#4F46E5",
    });

    const [erros, setErros] = useState({});

    useEffect(() => {
        if (isEdicao) {
            getDisciplinaById(id)
                .then((response) => setForm(response.data))
                .catch((error) => console.error(error));
        }
    }, [id]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const validar = () => {
        const novosErros = {};
        if (!form.nome.trim()) novosErros.nome = "Nome é obrigatório.";
        if (!form.codigo.trim()) novosErros.codigo = "Código é obrigatório.";
        if (!form.professor.trim()) novosErros.professor = "Professor é obrigatório.";
        if (!form.cargaHoraria) novosErros.cargaHoraria = "Carga horária é obrigatória.";
        if (!form.semestre.trim()) novosErros.semestre = "Semestre é obrigatório.";
        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validar()) return;
        const operacao = isEdicao ? updateDisciplina(id, form) : createDisciplina(form);
        operacao
            .then(() => navigator("/disciplinas"))
            .catch((error) => console.error(error));
    };

    return (
        <div>
            <div className="d-flex align-items-center gap-2 mb-4">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => navigator("/disciplinas")}>
                    <i className="bi bi-arrow-left"></i>
                </button>
                <h2 className="fw-bold mb-0">
                    {isEdicao ? "Editar Disciplina" : "Nova Disciplina"}
                </h2>
            </div>

            <div className="card shadow-sm border-0" style={{ maxWidth: "680px" }}>
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">

                            <div className="col-md-8">
                                <label className="form-label fw-semibold">Nome da Disciplina</label>
                                <input
                                    type="text"
                                    name="nome"
                                    value={form.nome}
                                    onChange={handleChange}
                                    placeholder="Ex: Banco de Dados"
                                    className={`form-control ${erros.nome ? "is-invalid" : ""}`}
                                />
                                {erros.nome && <div className="invalid-feedback">{erros.nome}</div>}
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-semibold">Código</label>
                                <input
                                    type="text"
                                    name="codigo"
                                    value={form.codigo}
                                    onChange={handleChange}
                                    placeholder="Ex: BCC301"
                                    className={`form-control ${erros.codigo ? "is-invalid" : ""}`}
                                />
                                {erros.codigo && <div className="invalid-feedback">{erros.codigo}</div>}
                            </div>

                            <div className="col-12">
                                <label className="form-label fw-semibold">Professor</label>
                                <input
                                    type="text"
                                    name="professor"
                                    value={form.professor}
                                    onChange={handleChange}
                                    placeholder="Nome do professor"
                                    className={`form-control ${erros.professor ? "is-invalid" : ""}`}
                                />
                                {erros.professor && <div className="invalid-feedback">{erros.professor}</div>}
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Carga Horária (h)</label>
                                <input
                                    type="number"
                                    name="cargaHoraria"
                                    value={form.cargaHoraria}
                                    onChange={handleChange}
                                    placeholder="Ex: 60"
                                    className={`form-control ${erros.cargaHoraria ? "is-invalid" : ""}`}
                                />
                                {erros.cargaHoraria && <div className="invalid-feedback">{erros.cargaHoraria}</div>}
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Semestre</label>
                                <input
                                    type="text"
                                    name="semestre"
                                    value={form.semestre}
                                    onChange={handleChange}
                                    placeholder="Ex: 2026.2"
                                    className={`form-control ${erros.semestre ? "is-invalid" : ""}`}
                                />
                                {erros.semestre && <div className="invalid-feedback">{erros.semestre}</div>}
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-semibold">Cor de identificação</label>
                                <div className="d-flex align-items-center gap-2">
                                    <input
                                        type="color"
                                        name="cor"
                                        value={form.cor}
                                        onChange={handleChange}
                                        className="form-control form-control-color"
                                        style={{ width: "60px", height: "38px" }}
                                    />
                                    <span className="text-muted" style={{ fontSize: "13px" }}>{form.cor}</span>
                                </div>
                            </div>

                            <div className="col-12 d-flex justify-content-end gap-2 mt-2">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => navigator("/disciplinas")}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {isEdicao ? "Salvar Alterações" : "Cadastrar"}
                                </button>
                            </div>

                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DisciplinaComponent;
