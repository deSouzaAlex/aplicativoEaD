import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createTarefa, getTarefaById, updateTarefa } from "../../services/TarefaService";
import { getAllDisciplinas } from "../../services/DisciplinaService";

const TarefaComponent = () => {
    const { id } = useParams();
    const navigator = useNavigate();
    const isEdicao = Boolean(id);

    const [form, setForm] = useState({
        nome: "",
        descricao: "",
        dataEntrega: "",
        prioridade: "media",
        concluida: false,
        disciplina: "",
    });

    const [disciplinas, setDisciplinas] = useState([]);
    const [erros, setErros] = useState({});

    useEffect(() => {
        getAllDisciplinas()
            .then((res) => setDisciplinas(res.data))
            .catch((err) => console.error(err));

        if (isEdicao) {
            getTarefaById(id)
                .then((res) => {
                    const t = res.data;
                    setForm({
                        ...t,
                        disciplina: t.disciplina?._id || t.disciplina,
                        dataEntrega: t.dataEntrega?.slice(0, 10) || "",
                    });
                })
                .catch((err) => console.error(err));
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    };

    const validar = () => {
        const novosErros = {};
        if (!form.nome.trim()) novosErros.nome = "Nome é obrigatório.";
        if (!form.dataEntrega) novosErros.dataEntrega = "Data de entrega é obrigatória.";
        if (!form.disciplina) novosErros.disciplina = "Selecione uma disciplina.";
        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validar()) return;
        const operacao = isEdicao ? updateTarefa(id, form) : createTarefa(form);
        operacao
            .then(() => navigator("/tarefas"))
            .catch((error) => console.error(error));
    };

    return (
        <div>
            <div className="d-flex align-items-center gap-2 mb-4">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => navigator("/tarefas")}>
                    <i className="bi bi-arrow-left"></i>
                </button>
                <h2 className="fw-bold mb-0">
                    {isEdicao ? "Editar Tarefa" : "Nova Tarefa"}
                </h2>
            </div>

            <div className="card shadow-sm border-0" style={{ maxWidth: "680px" }}>
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">

                            <div className="col-12">
                                <label className="form-label fw-semibold">Nome da Tarefa</label>
                                <input
                                    type="text"
                                    name="nome"
                                    value={form.nome}
                                    onChange={handleChange}
                                    placeholder="Ex: Atividade 1 - Banco de Dados"
                                    className={`form-control ${erros.nome ? "is-invalid" : ""}`}
                                />
                                {erros.nome && <div className="invalid-feedback">{erros.nome}</div>}
                            </div>

                            <div className="col-12">
                                <label className="form-label fw-semibold">Descrição</label>
                                <textarea
                                    name="descricao"
                                    value={form.descricao}
                                    onChange={handleChange}
                                    placeholder="Descreva a tarefa..."
                                    className="form-control"
                                    rows={3}
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Disciplina</label>
                                <select
                                    name="disciplina"
                                    value={form.disciplina}
                                    onChange={handleChange}
                                    className={`form-select ${erros.disciplina ? "is-invalid" : ""}`}
                                >
                                    <option value="">Selecione...</option>
                                    {disciplinas.map((d) => (
                                        <option key={d._id} value={d._id}>{d.nome}</option>
                                    ))}
                                </select>
                                {erros.disciplina && <div className="invalid-feedback">{erros.disciplina}</div>}
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Data de Entrega</label>
                                <input
                                    type="date"
                                    name="dataEntrega"
                                    value={form.dataEntrega}
                                    onChange={handleChange}
                                    className={`form-control ${erros.dataEntrega ? "is-invalid" : ""}`}
                                />
                                {erros.dataEntrega && <div className="invalid-feedback">{erros.dataEntrega}</div>}
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Prioridade</label>
                                <select
                                    name="prioridade"
                                    value={form.prioridade}
                                    onChange={handleChange}
                                    className="form-select"
                                >
                                    <option value="alta">Alta</option>
                                    <option value="media">Média</option>
                                    <option value="baixa">Baixa</option>
                                </select>
                            </div>

                            <div className="col-md-6 d-flex align-items-end">
                                <div className="form-check mb-2">
                                    <input
                                        type="checkbox"
                                        name="concluida"
                                        id="concluida"
                                        checked={form.concluida}
                                        onChange={handleChange}
                                        className="form-check-input"
                                    />
                                    <label className="form-check-label" htmlFor="concluida">
                                        Tarefa concluída
                                    </label>
                                </div>
                            </div>

                            <div className="col-12 d-flex justify-content-end gap-2 mt-2">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => navigator("/tarefas")}
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

export default TarefaComponent;
