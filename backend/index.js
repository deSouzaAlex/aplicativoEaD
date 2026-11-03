const config = require("./config");
const { conectar, mongoose } = require("./db/conn");
const { criarApp } = require("./app");

const app = criarApp();

// O servidor HTTP sobe imediatamente; a conexão com o banco é feita em seguida,
// com novas tentativas. Assim /api/v1/saude sempre responde e informa o estado do banco.
app.listen(config.PORT, () => {
    console.log(`Servidor rodando na porta ${config.PORT}`);
    console.log(`API disponível em: http://localhost:${config.PORT}${config.API_URL}`);
});

async function conectarComTentativas() {
    for (let tentativa = 1; ; tentativa++) {
        try {
            await conectar(config.MONGODB_URI);
            return;
        } catch (err) {
            console.error(`Falha ao conectar ao MongoDB em ${config.MONGODB_URI} (tentativa ${tentativa}): ${err.message}`);
            console.error("Verifique se o MongoDB está em execução (brew services list). Nova tentativa em 5 s...");
            await mongoose.disconnect().catch(() => {});
            await new Promise((r) => setTimeout(r, 5000));
        }
    }
}

conectarComTentativas();
