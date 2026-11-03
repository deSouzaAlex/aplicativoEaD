const DIA_MS = 24 * 60 * 60 * 1000;

function diasEntre(inicio, fim) {
    return (new Date(fim).getTime() - new Date(inicio).getTime()) / DIA_MS;
}

function inicioDoDia(data) {
    const d = new Date(data);
    d.setHours(0, 0, 0, 0);
    return d;
}

function somarDias(data, dias) {
    return new Date(new Date(data).getTime() + dias * DIA_MS);
}

module.exports = { DIA_MS, diasEntre, inicioDoDia, somarDias };
