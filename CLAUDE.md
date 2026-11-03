# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Backend** (run from `backend/`):
```bash
npm run dev      # nodemon, porta 3001 (PORT)
npm start        # node index.js (produção)
npm test         # Jest + Supertest (unidade e integração)
npm run seed     # usuário demo@exemplo.com / demo1234 com dados fictícios
```

**Frontend** (run from `frontend/app_frontend/`):
```bash
npm run dev      # Vite dev server on port 5173
npm run lint     # ESLint
npm test         # Vitest + Testing Library + axe-core
npm run build    # production build
```

Configuração por variáveis de ambiente: `backend/.env` (ver `.env.example`: MONGODB_URI, JWT_SECRET, CORS_ORIGIN)
e `frontend/app_frontend/.env` (VITE_API_URL). Testes de integração usam `MONGODB_URI_TEST` ou mongodb-memory-server.

## Architecture

```
aplicativoEaD/
├── backend/
│   ├── index.js          # conecta ao MongoDB e sobe o servidor
│   ├── app.js            # criarApp(): middlewares, rotas, 404 e tratamento de erros (usado nos testes)
│   ├── config.js         # leitura das variáveis de ambiente
│   ├── middleware/       # auth.js (JWT -> req.usuarioId), validarId.js (ObjectId inválido -> 400)
│   ├── models/           # Usuario (preferencias), Disciplina, Tarefa (dataConclusao, lembreteAntecedenciaDias); todos com campo usuario
│   ├── routes/           # auth, disciplinas, tarefas, lembretes, analise
│   ├── services/         # regras puras: priorizacao (RF06), lembretes (RF05), analiseRisco (RF07)
│   ├── scripts/          # seed, atribuirDadosLegados, exportarDataset
│   └── tests/            # unit/ (serviços) e integration/ (rotas)
├── frontend/app_frontend/src/
│   ├── App.jsx           # rotas públicas (/login, /cadastro, /privacidade) e protegidas (RotaProtegida + LayoutComponent)
│   ├── contexts/         # AuthContext (token em localStorage), LembretesContext (polling + notificações)
│   ├── services/         # api.js (axios com baseURL e token), Disciplina/Tarefa/Auth/AnaliseService
│   ├── utils/            # datas.js (conversão de datas), rotulos.js (prioridade e risco em texto)
│   └── components/       # Dashboard, Disciplinas, Tarefas, Calendario, Lembretes, Analise, Perfil, Auth
└── analise/              # treinar_modelos.py (fase 2 do módulo preditivo)
```

## Key patterns

- **Isolamento por usuário**: toda consulta filtra por `usuario: req.usuarioId`; recurso de outra conta responde 404.
- **Create/edit no mesmo componente**: `DisciplinaComponent` e `TarefaComponent` detectam o modo com `useParams().id`.
- **Datas de entrega**: o formulário converte `AAAA-MM-DD` para o fim do dia local (`paraDataEntregaISO`) e volta com `paraValorInput`; não usar `slice(0, 10)` (erro de fuso).
- **Conclusão**: o PUT de tarefa aceita atualização parcial; `dataConclusao` é preenchida na transição para concluída e limpa ao reabrir.
- **Acessibilidade**: todo campo tem `id` + `label htmlFor`; botões só com ícone têm `aria-label`; prioridade e risco sempre aparecem em texto (A/M/B, rótulos), nunca só por cor.
- Backend é CommonJS (`require`/`module.exports`); frontend é ESM (`import`/`export`).
