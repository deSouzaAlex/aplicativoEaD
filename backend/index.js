const express = require("express");
const app = express();

const conn = require("./db/conn");

const cors = require("cors");
app.use(cors());

require("dotenv/config");

const api = process.env.API_URL;
const PORT = process.env.PORT || 3001;

const bodyParser = require("body-parser");
const morgan = require("morgan");

app.use(bodyParser.json());
app.use(express.json());
app.use(morgan("tiny"));

app.get("/", (req, res) => {
    res.send("Servidor Acadêmico funcionando!");
});

const disciplinasRoutes = require("./routes/disciplinasRoute");
const tarefasRoutes = require("./routes/tarefasRoute");

app.use(`${api}/disciplinas`, disciplinasRoutes);
app.use(`${api}/tarefas`, tarefasRoutes);

app.use((req, res, next) => {
    res.status(404).json({
        erro: "Rota não encontrada",
        tentou: req.url,
        disponiveis: [`${api}/disciplinas`, `${api}/tarefas`],
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`API disponível em: http://localhost:${PORT}${api}`);
});
