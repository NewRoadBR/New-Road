var database = require("../database/config");

var SELECT_OBRA = `
    SELECT
        id,
        local AS rodovia,
        descricao,
        CASE status
            WHEN 'planned' THEN 'Planejada'
            WHEN 'ongoing' THEN 'Em andamento'
            WHEN 'completed' THEN 'Finalizada'
            WHEN 'critical' THEN 'Crítica'
            ELSE status
        END AS status,
        DATE_FORMAT(data_inicio, '%Y-%m-%d') AS data_inicio,
        DATE_FORMAT(DATE_ADD(data_inicio, INTERVAL duracao DAY), '%Y-%m-%d') AS data_fim,
        impacto AS impacto_previsto,
        lat AS latitude,
        lng AS longitude,
        bairro,
        tipo,
        duracao,
        marcador,
        urgencia
    FROM obra
`;

function normalizarStatusEntrada(status) {
    var valor = String(status || "").toLowerCase();

    if (valor.includes("planej")) return "planned";
    if (valor.includes("andamento") || valor.includes("ongoing")) return "ongoing";
    if (valor.includes("final") || valor.includes("conclu")) return "completed";
    if (valor.includes("crit")) return "critical";

    return "planned";
}

function calcularDuracao(dataInicio, dataFim) {
    if (!dataInicio || !dataFim) return 1;

    var inicio = new Date(dataInicio);
    var fim = new Date(dataFim);
    var diff = Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24));

    return diff > 0 ? diff : 1;
}

function listar() {
    var instrucaoSql = SELECT_OBRA + " ORDER BY data_inicio DESC;";
    return database.executar(instrucaoSql);
}

function listarPorRodovia(rodovia) {
    var instrucaoSql = SELECT_OBRA + `
        WHERE local LIKE ?
           OR bairro LIKE ?
           OR tipo LIKE ?
           OR descricao LIKE ?
        ORDER BY data_inicio DESC;
    `;

    var filtro = "%" + rodovia + "%";
    return database.executar(instrucaoSql, [filtro, filtro, filtro, filtro]);
}

function buscarPorId(id) {
    var instrucaoSql = SELECT_OBRA + " WHERE id = ?;";
    return database.executar(instrucaoSql, [id]);
}

function cadastrar(
    rodovia,
    descricao,
    status,
    dataInicio,
    dataFim,
    impactoPrevisto
) {
    var instrucaoSql = `
        INSERT INTO obra (
            local,
            bairro,
            tipo,
            descricao,
            status,
            data_inicio,
            duracao,
            impacto,
            lat,
            lng,
            marcador,
            urgencia,
            grau_urgencia
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    var impacto = Number(impactoPrevisto || 0);
    var marcador = impacto >= 70 ? "red" : impacto >= 40 ? "yellow" : "green";
    var urgencia = impacto >= 70 ? "alta" : impacto >= 40 ? "media" : "baixa";

    return database.executar(instrucaoSql, [
        rodovia,
        "SP Region",
        "Intervenção viária",
        descricao || "",
        normalizarStatusEntrada(status),
        dataInicio,
        calcularDuracao(dataInicio, dataFim),
        impacto,
        -23.5505,
        -46.6333,
        marcador,
        urgencia,
        Math.max(1, Math.min(20, Math.round(impacto / 5)))
    ]);
}

function atualizar(
    id,
    rodovia,
    descricao,
    status,
    dataInicio,
    dataFim,
    impactoPrevisto
) {
    var instrucaoSql = `
        UPDATE obra
        SET
            local = ?,
            descricao = ?,
            status = ?,
            data_inicio = ?,
            duracao = ?,
            impacto = ?,
            marcador = ?,
            urgencia = ?
        WHERE id = ?;
    `;

    var impacto = Number(impactoPrevisto || 0);
    var marcador = impacto >= 70 ? "red" : impacto >= 40 ? "yellow" : "green";
    var urgencia = impacto >= 70 ? "alta" : impacto >= 40 ? "media" : "baixa";

    return database.executar(instrucaoSql, [
        rodovia,
        descricao || "",
        normalizarStatusEntrada(status),
        dataInicio,
        calcularDuracao(dataInicio, dataFim),
        impacto,
        marcador,
        urgencia,
        id
    ]);
}

function deletar(id) {
    var instrucaoSql = "DELETE FROM obra WHERE id = ?;";
    return database.executar(instrucaoSql, [id]);
}

module.exports = {
    listar,
    listarPorRodovia,
    buscarPorId,
    cadastrar,
    atualizar,
    deletar
};
