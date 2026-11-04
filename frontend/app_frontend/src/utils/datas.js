const DIA_MS = 24 * 60 * 60 * 1000;

const doisDigitos = (n) => String(n).padStart(2, "0");

// O campo <input type="date"> trabalha com "AAAA-MM-DD" sem fuso horário.
// Para que a entrega seja exibida no mesmo dia em qualquer fuso, ela é armazenada
// como o fim do dia no horário local do estudante.
export function paraDataEntregaISO(valorInput) {
    if (!valorInput) return "";
    const [ano, mes, dia] = valorInput.split("-").map(Number);
    return new Date(ano, mes - 1, dia, 23, 59, 0, 0).toISOString();
}

export function paraValorInput(data) {
    if (!data) return "";
    const d = new Date(data);
    if (Number.isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`;
}

export function formatarData(data) {
    return new Date(data).toLocaleDateString("pt-BR");
}

export function inicioDaSemana(referencia = new Date()) {
    const d = new Date(referencia);
    d.setHours(0, 0, 0, 0);
    const deslocamento = (d.getDay() + 6) % 7; // segunda-feira = 0
    d.setDate(d.getDate() - deslocamento);
    return d;
}

export function diasDaSemana(referencia = new Date()) {
    const inicio = inicioDaSemana(referencia);
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(inicio);
        d.setDate(inicio.getDate() + i);
        return d;
    });
}

export function mesmoDia(a, b) {
    const x = new Date(a);
    const y = new Date(b);
    return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate();
}

export function tempoRestante(dataEntrega, agora = new Date()) {
    const diff = new Date(dataEntrega) - agora;
    if (diff < 0) return { texto: "Atrasada", atrasada: true };
    const horas = Math.floor(diff / (60 * 60 * 1000));
    if (horas < 24) return { texto: `${horas}h`, descricao: `${horas} horas restantes`, atrasada: false };
    const dias = Math.round(diff / DIA_MS);
    return { texto: `${dias}d`, descricao: `${dias} dias restantes`, atrasada: false };
}
