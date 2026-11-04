const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const config = require("./config");

const authRoutes = require("./routes/authRoute");
const disciplinasRoutes = require("./routes/disciplinasRoute");
const tarefasRoutes = require("./routes/tarefasRoute");
const lembretesRoutes = require("./routes/lembretesRoute");
const analiseRoutes = require("./routes/analiseRoute");
const { autenticar } = require("./middleware/auth");

function criarApp() {
    const app = express();
    const api = config.API_URL;

    // Em produção, apenas as origens de CORS_ORIGIN. Em desenvolvimento, também qualquer
    // endereço local (localhost ou 127.0.0.1, em qualquer porta), para o Vite funcionar sem ajustes.
    const origens = config.CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean);
    const origemLocal = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
    app.use(
        cors({
            origin(origem, callback) {
                const permitida =
                    !origem ||
                    origens.length === 0 ||
                    origens.includes(origem) ||
                    (config.NODE_ENV !== "production" && origemLocal.test(origem));
                callback(null, permitida);
            },
        })
    );
    app.use(helmet());
    app.use(express.json());
    if (config.NODE_ENV !== "test") app.use(morgan("tiny"));

    app.get("/", (req, res) => {
        res.send("Servidor Acadêmico funcionando!");
    });

    app.get(`${api}/saude`, (req, res) => {
        const estados = ["desconectado", "conectado", "conectando", "desconectando"];
        const banco = estados[mongoose.connection.readyState] || "desconhecido";
        res.status(banco === "conectado" ? 200 : 503).json({ status: banco === "conectado" ? "ok" : "sem banco", banco });
    });

    app.use(`${api}/auth`, authRoutes);
    app.use(`${api}/disciplinas`, autenticar, disciplinasRoutes);
    app.use(`${api}/tarefas`, autenticar, tarefasRoutes);
    app.use(`${api}/lembretes`, autenticar, lembretesRoutes);
    app.use(`${api}/analise`, autenticar, analiseRoutes);

    app.use((req, res) => {
        res.status(404).json({
            erro: "Rota não encontrada",
            tentou: req.url,
            disponiveis: ["auth", "disciplinas", "tarefas", "lembretes", "analise"].map((r) => `${api}/${r}`),
        });
    });

    // Tratamento centralizado de erros não capturados nas rotas
    // eslint-disable-next-line no-unused-vars
    app.use((err, req, res, next) => {
        if (err.type === "entity.parse.failed") {
            return res.status(400).json({ success: false, error: "JSON inválido." });
        }
        console.error(err);
        res.status(500).json({ success: false, error: "Erro interno do servidor." });
    });

    return app;
}

module.exports = { criarApp };
