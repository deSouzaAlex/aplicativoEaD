# aplicativoEaD

Sistema web inteligente de apoio à organização acadêmica para estudantes EaD (Projeto Integrador II, UNIVESP).

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `backend/` | API REST em Node.js, Express e MongoDB (Mongoose) |
| `frontend/app_frontend/` | Interface em React, React Router e Bootstrap (Vite) |
| `analise/` | Fase 2 do módulo preditivo: treino e comparação de classificadores em Python |
| `.github/workflows/ci.yml` | Integração contínua (testes, lint e build a cada push) |

## Requisitos implementados

| Código | Requisito | Onde |
|---|---|---|
| RF01 | CRUD de disciplinas (a exclusão remove as tarefas vinculadas) | `backend/routes/disciplinasRoute.js`, `Disciplinas/` |
| RF02 | Tarefas com prazo, prioridade, disciplina, situação e data de conclusão | `backend/routes/tarefasRoute.js`, `Tarefas/` |
| RF03 | Painel com prazos, pendências, alertas e semana corrente | `IndexComponent.jsx` |
| RF04 | Calendário mensal com destaque dos períodos de sobrecarga | `Calendario/` |
| RF05 | Lembretes com antecedência configurável (perfil e por tarefa) e notificações do navegador | `services/lembretes.js`, `/lembretes`, `Lembretes/` |
| RF06 | Ordenação automática por prazo e prioridade | `services/priorizacao.js`, `GET /tarefas?ordenar=auto` |
| RF07 | Indicador de risco de atraso e detecção de sobrecarga | `services/analiseRisco.js`, `/analise/risco`, `Analise/` |
| RF08 | Cadastro, login (JWT) e isolamento dos dados por conta | `routes/authRoute.js`, `middleware/auth.js` |
| RNF01 | WCAG 2.2 AA: rótulos associados, nomes acessíveis, foco visível, prioridade em texto, contraste | testes com axe-core |
| RNF02 | Layout responsivo com menu recolhível | `App.css`, `HeaderComponent.jsx` |
| RNF03 | LGPD: consentimento, senha com hash, exportação e exclusão da conta | `routes/authRoute.js`, `Perfil/` |
| RNF04 | Testes automatizados e integração contínua | `backend/tests/`, `src/**/*.test.jsx`, `ci.yml` |
| RNF05 | Configuração por variáveis de ambiente para implantação em nuvem | `.env.example` |

## Como executar localmente

Pré-requisitos: Node.js 20 ou superior e MongoDB em execução (local ou Atlas).

```bash
# API
cd backend
cp .env.example .env        # ajuste MONGODB_URI e JWT_SECRET
npm install
npm run seed                # opcional: usuário demo@exemplo.com / demo1234 com dados fictícios
npm run dev                 # http://localhost:3001/api/v1

# Interface
cd frontend/app_frontend
cp .env.example .env        # VITE_API_URL=http://localhost:3001/api/v1
npm install
npm run dev                 # http://localhost:5173
```

Dados criados antes da autenticação (sem dono) podem ser atribuídos a uma conta já cadastrada com
`npm run migrar:legado -- email@exemplo.com`.

## Testes

```bash
cd backend && npm test                       # unidade + integração (Jest e Supertest)
cd frontend/app_frontend && npm test         # componentes e acessibilidade (Vitest, Testing Library, axe-core)
```

Os testes de integração usam `MONGODB_URI_TEST`, se definida, ou sobem um MongoDB temporário em memória
(`mongodb-memory-server`, que baixa o binário do MongoDB na primeira execução).

## API

Todas as rotas, exceto `/auth/registrar` e `/auth/login`, exigem o cabeçalho `Authorization: Bearer <token>`.

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/registrar` | Cria conta (`nome`, `email`, `senha`, `consentimento`) |
| POST | `/auth/login` | Autentica e devolve o token |
| GET / PUT / DELETE | `/auth/me` | Consulta, atualiza (nome e preferências) ou exclui a conta |
| GET | `/auth/me/exportar` | Exporta todos os dados do usuário (LGPD) |
| GET / POST | `/disciplinas` | Lista ou cadastra disciplinas |
| GET / PUT / DELETE | `/disciplinas/:id` | Consulta, atualiza ou exclui (com as tarefas vinculadas) |
| GET | `/tarefas?ordenar=auto\|prazo&situacao=pendentes\|concluidas&disciplina=:id` | Lista tarefas |
| POST | `/tarefas` | Cadastra tarefa |
| GET / PUT / DELETE | `/tarefas/:id` | Consulta, atualiza (registra `dataConclusao`) ou exclui |
| GET | `/lembretes` | Tarefas pendentes dentro da janela de antecedência |
| GET | `/analise/risco` | Índice de risco por tarefa, histórico e períodos de sobrecarga |
| GET | `/analise/dataset?formato=json\|csv` | Exemplos rotulados para treino de modelos |

Erros: 400 (dados ou identificador inválidos), 401 (sem autenticação), 404 (inexistente ou de outra conta),
409 (e-mail já cadastrado) e 500 (erro interno).

## Módulo preditivo

A fase 1 (em produção) é um indicador baseado em regras: proximidade do prazo (50%), carga de entregas num
intervalo de ±3 dias (30%) e taxa suavizada de atrasos do histórico (20%), com índice de 0 a 100 e níveis baixo,
médio (≥ 35), alto (≥ 60) e atrasada. Sobrecarga é sinalizada quando uma janela de 7 dias atinge o limite
definido no perfil (padrão: 4 entregas).

A fase 2 compara regressão logística, árvore de decisão e floresta aleatória com validação cruzada estratificada,
priorizando a revocação:

```bash
cd backend && npm run exportar:dataset > ../analise/dataset.csv   # anonimizado
cd ../analise && pip install -r requirements.txt
python treinar_modelos.py dataset.csv
python treinar_modelos.py --sintetico 400                          # demonstração com dados simulados
```

## Implantação em nuvem

A aplicação não depende de um provedor específico. Uma combinação gratuita possível:

1. Banco: cluster MongoDB Atlas, liberando o acesso da API e copiando a string `mongodb+srv://...`.
2. API (Render, Railway ou similar): diretório `backend`, comando `npm start`, variáveis `NODE_ENV=production`,
   `MONGODB_URI`, `JWT_SECRET` (valor longo e aleatório) e `CORS_ORIGIN` (URL do frontend).
3. Interface (Vercel, Netlify ou Render Static): diretório `frontend/app_frontend`, comando `npm run build`,
   pasta `dist`, variável `VITE_API_URL` com a URL pública da API. Os arquivos `vercel.json` e
   `public/_redirects` direcionam as rotas do React Router para o `index.html`.
