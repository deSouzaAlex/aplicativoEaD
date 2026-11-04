import { Link } from "react-router-dom";
import useTitulo from "../../hooks/useTitulo";

const PrivacidadeComponent = () => {
    useTitulo("Política de privacidade");
    return (
        <main id="conteudo" className="container py-5" style={{ maxWidth: "760px" }}>
            <h1 className="h3 fw-bold mb-4">Política de privacidade</h1>
            <p>
                Esta aplicação foi desenvolvida no Projeto Integrador II da UNIVESP para apoiar a organização acadêmica
                de estudantes da educação a distância. O tratamento de dados segue os princípios da Lei Geral de
                Proteção de Dados Pessoais (Lei nº 13.709/2018).
            </p>
            <h2 className="h5 fw-bold mt-4">Quais dados coletamos</h2>
            <p>
                Nome, e-mail e senha (armazenada apenas de forma criptografada), além das disciplinas e tarefas que
                você cadastra e das datas em que as tarefas são concluídas.
            </p>
            <h2 className="h5 fw-bold mt-4">Para que usamos</h2>
            <p>
                Exclusivamente para exibir seus prazos, emitir lembretes e calcular indicadores de risco de atraso e
                de sobrecarga. Os indicadores têm finalidade orientativa e não são usados para avaliação, classificação
                ou qualquer medida disciplinar. Para fins de pesquisa, os registros podem ser exportados de forma
                anonimizada, sem nome, e-mail ou identificadores pessoais.
            </p>
            <h2 className="h5 fw-bold mt-4">Seus direitos</h2>
            <p>
                Na página Meu perfil você pode baixar todos os seus dados em formato JSON e excluir definitivamente a
                sua conta, o que remove também as disciplinas e tarefas cadastradas.
            </p>
            <Link to="/cadastro" className="btn btn-outline-primary mt-3">Voltar</Link>
        </main>
    );
};

export default PrivacidadeComponent;
