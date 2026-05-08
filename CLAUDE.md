# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Backend** (run from `backend/`):
```bash
npm run dev      # starts with nodemon on port 3001
npm start        # starts with node (sem reload automático)
```

**Frontend** (run from `frontend/app_frontend/`):
```bash
npm run dev      # Vite dev server on port 5173
npm run lint     # ESLint
npm run build    # production build
```

MongoDB deve estar rodando localmente antes de iniciar o backend.

## Architecture

```
aplicativoEaD/
├── backend/
│   ├── index.js          # Express app, middleware, route mounting
│   ├── .env              # API_URL=/api/v1  PORT=3001
│   ├── db/conn.js        # Mongoose → mongodb://localhost:27017/academico-app
│   ├── models/
│   │   ├── Disciplina.js # nome, codigo, professor, cargaHoraria, semestre, cor (#hex, default #4F46E5)
│   │   └── Tarefa.js     # nome, descricao, dataEntrega (Date), prioridade (alta|media|baixa),
│   │                     # concluida (Boolean), disciplina (→ Disciplina ObjectId, required)
│   └── routes/
│       ├── disciplinasRoute.js  # CRUD completo: GET / GET /:id / POST / PUT /:id / DELETE /:id
│       └── tarefasRoute.js      # CRUD completo — GET sempre popula o campo disciplina
└── frontend/app_frontend/
    └── src/
        ├── App.jsx              # React Router config + layout (sidebar 220px + main)
        ├── services/
        │   ├── DisciplinaService.js   # Axios, base URL: http://localhost:3001/api/v1/disciplinas
        │   └── TarefaService.js       # Axios, base URL: http://localhost:3001/api/v1/tarefas
        └── components/
            ├── HeaderComponent.jsx    # Sidebar fixa com NavLink e active state automático
            ├── IndexComponent.jsx     # Dashboard: tarefa prioritária, próximos prazos, visão da semana
            ├── Disciplinas/
            │   ├── ListDisciplinaComponent.jsx   # Cards com cor da disciplina, editar/excluir
            │   └── DisciplinaComponent.jsx       # Form criar/editar (detecta modo pelo useParams id)
            ├── Tarefas/
            │   ├── ListTarefaComponent.jsx       # Lista com filtro todas/pendentes/concluídas + toggle concluída inline
            │   └── TarefaComponent.jsx           # Form criar/editar; carrega lista de disciplinas para o select
            └── Calendario/
                └── CalendarioComponent.jsx       # Grade mensal customizada; busca todas as tarefas e mapeia por dataEntrega
```

## Frontend routes

| Path | Component |
|---|---|
| `/` | IndexComponent (dashboard) |
| `/disciplinas` | ListDisciplinaComponent |
| `/disciplinas/nova` | DisciplinaComponent (modo criar) |
| `/disciplinas/editar/:id` | DisciplinaComponent (modo editar) |
| `/tarefas` | ListTarefaComponent |
| `/tarefas/nova` | TarefaComponent (modo criar) |
| `/tarefas/editar/:id` | TarefaComponent (modo editar) |
| `/calendario` | CalendarioComponent |

## Key patterns

- **Create/edit no mesmo componente**: `DisciplinaComponent` e `TarefaComponent` detectam o modo com `const isEdicao = Boolean(useParams().id)` e fazem `createX` ou `updateX` conforme o caso.
- **Tarefa sempre popula disciplina**: as rotas `GET /tarefas` e `GET /tarefas/:id` usam `.populate("disciplina")`, então `t.disciplina` chega como objeto no frontend. Ao enviar PUT, é necessário extrair o `_id`: `disciplina: tarefa.disciplina?._id || tarefa.disciplina`.
- **`dataEntrega` no form**: o campo `date` do HTML precisa de `YYYY-MM-DD`. Ao carregar para edição faz `t.dataEntrega?.slice(0, 10)`.
- **API base URLs estão hardcoded** em `src/services/` — atualizar lá se a porta ou o prefixo mudarem.
- **Nome do usuário hardcoded**: "Maria" aparece fixo em `IndexComponent` e `HeaderComponent`; não há autenticação ou perfil dinâmico.
- Backend é CommonJS (`require`/`module.exports`); frontend é ESM (`import`/`export`).
- Sem testes configurados em nenhuma das partes.
