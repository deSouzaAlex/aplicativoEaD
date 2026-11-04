// Banco de dados para os testes de integração.
// Usa MONGODB_URI_TEST quando definida (ex.: serviço MongoDB do CI); caso contrário,
// sobe uma instância temporária em memória com mongodb-memory-server.
const mongoose = require("mongoose");

let servidor;

async function conectarBancoTeste() {
    let uri = process.env.MONGODB_URI_TEST;
    if (!uri) {
        const { MongoMemoryServer } = require("mongodb-memory-server");
        servidor = await MongoMemoryServer.create();
        uri = servidor.getUri();
    }
    const nomeBanco = `teste_${process.pid}_${Math.random().toString(36).slice(2, 8)}`;
    await mongoose.connect(uri, { dbName: nomeBanco });
}

async function limparBanco() {
    const colecoes = await mongoose.connection.db.collections();
    for (const c of colecoes) await c.deleteMany({});
}

async function desconectarBancoTeste() {
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    }
    if (servidor) await servidor.stop();
}

module.exports = { conectarBancoTeste, limparBanco, desconectarBancoTeste };
