import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    createDisciplina,
    getDisciplinaById,
    updateDisciplina,
} from "../../services/DisciplinaService";
import { mensagemErro } from "../../utils/rotulos";
import useTitulo from "../../hooks/useTitulo";
import Alerta from "../Alerta";

const DisciplinaComponent = () => {
    const { id } = useParams();
    const navigator = useNavigate();
    const isEdicao = Boolean(id);
    useTitulo(isEdicao ? "Editar disciplina" : "Nova disciplina");

    const [form, setForm] = useState({
        nome: "",
        codigo: "",
        professor: "",
        cargaHoraria: "",
        semestre: "",
        cor: "#4F46E5",
    });

    const [erros, setErros] = useState({});
    const [erroGeral, setErroGeral] = useState("");

    useEffect(() => {
        if (isEdicao) {
            getDisciplinaById(id)
                .then((response) => {
                    const { nome, codigo, professor, cargaHoraria, semestre, cor } = response.data;
                    setForm({ nome, codigo, professor, cargaHoraria, semestre, cor: cor || "#4F46E5" });
                })
                .catch((error) => setErroGeral(mensagemErro(error, "Disciplina não encontrada.")));
        }
    }, [id, isEdicao]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const validar = () => {
        const novosErros = {};
        if (!String(form.nome).trim()) novosErros.nome = "Nome é obrigatório.";
        if (!String(form.codigo).trim()) novosErros.codigo = "Código é obrigatório.";
        if (!String(form.professor).trim()) novosErros.professor = "Professor é obrigatório.";
        if (!form.cargaHoraria || Number(form.cargaHoraria) <= 0) novosErros.cargaHoraria = "Informe uma carga horária maior que zero.";
        if (!String(form.semestre).trim()) novosErros.semestre = "Semestre é obrigatório.";
        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErroGeral("");
        if (!validar()) return;
        const dados = { ...form, cargaHoraria: Number(form.cargaHoraria) };
        const operacao = isEdicao ? updateDisciplina(id, dados) : createDisciplina(dados);
        operacao
            .then(() => navigator("/disciplinas"))
            .catch((error) => setErroGeral(mensagemErro(error, "Não foi possível salvar a disciplina.")));
    };

    // Campo de texto com rótulo associado e mensagem de erro anunciada (WCAG 1.3.1 e 3.3.1)
    const campo = (nome, rotulo, props = {}, classeColuna = "col-12") => (
        <div className={classeColuna}>
            <label htmlFor={`disciplina-${nome}`} className="form-label fw-semibold">{rotulo}</label>
            <input
                id={`disciplina-${nome}`}
                name={nome}
                value={form[nome]}
                onChange={handleChange}
                aria-invalid={Boolean(erros[nome])}
                aria-describedby={erros[nome] ? `erro-disciplina-${nome}` : undefined}
                className={`form-control ${erros[nome] ? "is-invalid" : ""}`}
                {...props}
            />
            {erros[nome] && <div id={`erro-disciplina-${nome}`} className="invalid-feedback">{erros[nome]}</div>}
        </div>
    );

    return (
        <div>
            <div className="d-flex align-items-center gap-2 mb-4">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => navigator("/disciplinas")}
                    aria-label="Voltar para a lista de disciplinas">
                    <i className="bi bi-arrow-left" aria-hidden="true"></i>
                </button>
                <h1 className="h2 fw-bold mb-0">
                    {isEdicao ? "Editar Disciplina" : "Nova Disciplina"}
                </h1>
            </div>

            <div className="card shadow-sm border-0" style={{ maxWidth: "680px" }}>
                <div className="card-body p-4">
                    <Alerta mensagem={erroGeral} />
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="row g-3">
                            {campo("nome", "Nome da Disciplina", { type: "text", placeholder: "Ex: Banco de Dados", required: true }, "col-md-8")}
                            {campo("codigo", "Código", { type: "text", placeholder: "Ex: BCC301", required: true }, "col-md-4")}
                            {campo("professor", "Professor", { type: "text", placeholder: "Nome do professor", required: true })}
                            {campo("cargaHoraria", "Carga Horária (h)", { type: "number", min: 1, placeholder: "Ex: 60", required: true }, "col-md-6")}
                            {campo("semestre", "Semestre", { type: "text", placeholder: "Ex: 2026.2", required: true }, "col-md-6")}

                            <div className="col-md-4">
                                <label htmlFor="disciplina-cor" className="form-label fw-semibold">Cor de identificação</label>
                                <div className="d-flex align-items-center gap-2">
                                    <input
                                        id="disciplina-cor"
                                        type="color"
                                        name="cor"
                                        value={form.cor}
                                        onChange={handleChange}
                                        className="form-control form-control-color"
                                        style={{ width: "60px", height: "38px" }}
                                    />
                                    <span className="text-secondary" style={{ fontSize: "13px" }} aria-hidden="true">{form.cor}</span>
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
