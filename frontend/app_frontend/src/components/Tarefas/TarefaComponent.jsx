import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createTarefa, getTarefaById, updateTarefa } from "../../services/TarefaService";
import { getAllDisciplinas } from "../../services/DisciplinaService";
import { useAuth } from "../../contexts/AuthContext";
import { useLembretes } from "../../contexts/LembretesContext";
import { paraDataEntregaISO, paraValorInput } from "../../utils/datas";
import { mensagemErro } from "../../utils/rotulos";
import useTitulo from "../../hooks/useTitulo";
import Alerta from "../Alerta";

const OPCOES_LEMBRETE = [0, 1, 2, 3, 5, 7, 14];

const TarefaComponent = () => {
    const { id } = useParams();
    const navigator = useNavigate();
    const isEdicao = Boolean(id);
    useTitulo(isEdicao ? "Editar tarefa" : "Nova tarefa");
    const { usuario } = useAuth();
    const { recarregar: recarregarLembretes } = useLembretes();
    const antecedenciaPadrao = usuario?.preferencias?.antecedenciaLembreteDias ?? 2;

    const [form, setForm] = useState({
        nome: "",
        descricao: "",
        dataEntrega: "",
        prioridade: "media",
        concluida: false,
        disciplina: "",
        lembreteAntecedenciaDias: "",
    });

    const [disciplinas, setDisciplinas] = useState([]);
    const [erros, setErros] = useState({});
    const [erroGeral, setErroGeral] = useState("");

    useEffect(() => {
        getAllDisciplinas()
            .then((res) => setDisciplinas(res.data))
            .catch((err) => setErroGeral(mensagemErro(err)));

        if (isEdicao) {
            getTarefaById(id)
                .then((res) => {
                    const t = res.data;
                    setForm({
                        nome: t.nome,
                        descricao: t.descricao || "",
                        prioridade: t.prioridade,
                        concluida: t.concluida,
                        disciplina: t.disciplina?._id || t.disciplina,
                        dataEntrega: paraValorInput(t.dataEntrega),
                        lembreteAntecedenciaDias:
                            t.lembreteAntecedenciaDias === null || t.lembreteAntecedenciaDias === undefined
                                ? ""
                                : String(t.lembreteAntecedenciaDias),
                    });
                })
                .catch((err) => setErroGeral(mensagemErro(err, "Tarefa não encontrada.")));
        }
    }, [id, isEdicao]);

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
        setErroGeral("");
        if (!validar()) return;
        const dados = {
            ...form,
            dataEntrega: paraDataEntregaISO(form.dataEntrega),
            lembreteAntecedenciaDias: form.lembreteAntecedenciaDias === "" ? null : Number(form.lembreteAntecedenciaDias),
        };
        const operacao = isEdicao ? updateTarefa(id, dados) : createTarefa(dados);
        operacao
            .then(() => {
                recarregarLembretes();
                navigator("/tarefas");
            })
            .catch((error) => setErroGeral(mensagemErro(error, "Não foi possível salvar a tarefa.")));
    };

    const props = (nome) => ({
        id: `tarefa-${nome}`,
        name: nome,
        value: form[nome],
        onChange: handleChange,
        "aria-invalid": Boolean(erros[nome]),
        "aria-describedby": erros[nome] ? `erro-tarefa-${nome}` : undefined,
    });
    const erro = (nome) =>
        erros[nome] && <div id={`erro-tarefa-${nome}`} className="invalid-feedback">{erros[nome]}</div>;

    return (
        <div>
            <div className="d-flex align-items-center gap-2 mb-4">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => navigator("/tarefas")}
                    aria-label="Voltar para a lista de tarefas">
                    <i className="bi bi-arrow-left" aria-hidden="true"></i>
                </button>
                <h1 className="h2 fw-bold mb-0">
                    {isEdicao ? "Editar Tarefa" : "Nova Tarefa"}
                </h1>
            </div>

            <div className="card shadow-sm border-0" style={{ maxWidth: "680px" }}>
                <div className="card-body p-4">
                    <Alerta mensagem={erroGeral} />
                    {!isEdicao && disciplinas.length === 0 && (
                        <Alerta tipo="info" mensagem="Cadastre uma disciplina antes de criar tarefas." />
                    )}
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="row g-3">

                            <div className="col-12">
                                <label htmlFor="tarefa-nome" className="form-label fw-semibold">Nome da Tarefa</label>
                                <input type="text" required placeholder="Ex: Atividade 1 - Banco de Dados"
                                    className={`form-control ${erros.nome ? "is-invalid" : ""}`} {...props("nome")} />
                                {erro("nome")}
                            </div>

                            <div className="col-12">
                                <label htmlFor="tarefa-descricao" className="form-label fw-semibold">Descrição</label>
                                <textarea placeholder="Descreva a tarefa..." className="form-control" rows={3}
                                    {...props("descricao")} />
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="tarefa-disciplina" className="form-label fw-semibold">Disciplina</label>
                                <select required className={`form-select ${erros.disciplina ? "is-invalid" : ""}`}
                                    {...props("disciplina")}>
                                    <option value="">Selecione...</option>
                                    {disciplinas.map((d) => (
                                        <option key={d._id} value={d._id}>{d.nome}</option>
                                    ))}
                                </select>
                                {erro("disciplina")}
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="tarefa-dataEntrega" className="form-label fw-semibold">Data de Entrega</label>
                                <input type="date" required
                                    className={`form-control ${erros.dataEntrega ? "is-invalid" : ""}`} {...props("dataEntrega")} />
                                {erro("dataEntrega")}
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="tarefa-prioridade" className="form-label fw-semibold">Prioridade</label>
                                <select className="form-select" {...props("prioridade")}>
                                    <option value="alta">Alta</option>
                                    <option value="media">Média</option>
                                    <option value="baixa">Baixa</option>
                                </select>
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="tarefa-lembreteAntecedenciaDias" className="form-label fw-semibold">Lembrete</label>
                                <select className="form-select" {...props("lembreteAntecedenciaDias")}
                                    aria-describedby="ajuda-lembrete">
                                    <option value="">Padrão do perfil ({antecedenciaPadrao} dia(s) antes)</option>
                                    {OPCOES_LEMBRETE.map((n) => (
                                        <option key={n} value={String(n)}>
                                            {n === 0 ? "Somente no dia da entrega" : `${n} dia(s) antes`}
                                        </option>
                                    ))}
                                </select>
                                <div id="ajuda-lembrete" className="form-text">
                                    A partir de quando a tarefa aparece nos lembretes.
                                </div>
                            </div>

                            <div className="col-12">
                                <div className="form-check">
                                    <input type="checkbox" name="concluida" id="concluida" checked={form.concluida}
                                        onChange={handleChange} className="form-check-input" />
                                    <label className="form-check-label" htmlFor="concluida">
                                        Tarefa concluída
                                    </label>
                                </div>
                            </div>

                            <div className="col-12 d-flex justify-content-end gap-2 mt-2">
                                <button type="button" className="btn btn-outline-secondary" onClick={() => navigator("/tarefas")}>
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
