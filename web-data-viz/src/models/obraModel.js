// models/obraModel.js
var database = require("../database/config");

// ─── LISTAR (com filtros + paginação) ────────────────────────────────────────
function listarTodas(filtros) {
    var where  = "WHERE 1=1";
    var params = [];

    if (filtros.regiao && filtros.regiao !== "all") {
        where += " AND o.regiao = ?";
        params.push(filtros.regiao);
    }
    if (filtros.status) {
        where += " AND o.status = ?";
        params.push(filtros.status);
    }
    if (filtros.busca) {
        where += " AND (o.nome LIKE ? OR o.regiao LIKE ? OR o.descricao LIKE ?)";
        params.push(`%${filtros.busca}%`, `%${filtros.busca}%`, `%${filtros.busca}%`);
    }

    // LIMIT e OFFSET interpolados diretamente (inteiros seguros)
    var limit  = parseInt(filtros.limit)  || 100;
    var offset = parseInt(filtros.offset) || 0;

    var sql = `
        SELECT
            o.id,
            o.nome,
            o.descricao,
            o.regiao,
            o.status,
            o.progresso,
            DATE_FORMAT(o.data_inicio, '%d/%m/%Y') AS data_inicio,
            DATE_FORMAT(o.data_fim,    '%d/%m/%Y') AS data_fim,
            o.lat,
            o.lng,
            o.criado_em,
            o.atualizado_em,
            e.nome AS empresa_nome
        FROM obra o
        LEFT JOIN empresa e ON e.id = o.fk_empresa
        ${where}
        ORDER BY o.criado_em DESC
        LIMIT ${limit} OFFSET ${offset}
    `;

    return database.executar(sql, params);
}

// ─── BUSCAR POR ID ────────────────────────────────────────────────────────────
function buscarPorId(id) {
    var sql = `
        SELECT
            o.id,
            o.nome,
            o.descricao,
            o.regiao,
            o.status,
            o.progresso,
            DATE_FORMAT(o.data_inicio, '%d/%m/%Y') AS data_inicio,
            DATE_FORMAT(o.data_fim,    '%d/%m/%Y') AS data_fim,
            o.lat,
            o.lng,
            o.criado_em,
            o.atualizado_em,
            e.nome AS empresa_nome,
            e.id   AS empresa_id
        FROM obra o
        LEFT JOIN empresa e ON e.id = o.fk_empresa
        WHERE o.id = ?
    `;
    return database.executar(sql, [id]);
}

// ─── RESUMO (KPIs) — usa view vw_resumo_obras ────────────────────────────────
function resumo() {
    return database.executar("SELECT * FROM vw_resumo_obras");
}

// ─── PARA MAPA — retorna apenas obras georreferenciadas ──────────────────────
function paraMapa(regiao) {
    var where  = regiao && regiao !== "all" ? "WHERE regiao = ?" : "";
    var params = regiao && regiao !== "all" ? [regiao] : [];
    var sql    = `SELECT * FROM vw_obras_mapa ${where} ORDER BY nome ASC`;
    return database.executar(sql, params);
}

// ─── CADASTRAR ────────────────────────────────────────────────────────────────
function cadastrar(dados) {
    var sql = `
        INSERT INTO obra
            (nome, descricao, regiao, status, progresso, data_inicio, data_fim, lat, lng, fk_empresa)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    return database.executar(sql, [
        dados.nome,
        dados.descricao  || null,
        dados.regiao,
        dados.status     || "planejada",
        dados.progresso  != null ? dados.progresso : 0,
        dados.data_inicio || null,
        dados.data_fim    || null,
        dados.lat         || null,
        dados.lng         || null,
        dados.fk_empresa  || null
    ]);
}

// ─── ATUALIZAR ────────────────────────────────────────────────────────────────
function atualizar(id, dados) {
    var sql = `
        UPDATE obra
        SET nome        = ?,
            descricao   = ?,
            regiao      = ?,
            status      = ?,
            progresso   = ?,
            data_inicio = ?,
            data_fim    = ?,
            lat         = ?,
            lng         = ?,
            fk_empresa  = ?
        WHERE id = ?
    `;
    return database.executar(sql, [
        dados.nome,
        dados.descricao   || null,
        dados.regiao,
        dados.status,
        dados.progresso   != null ? dados.progresso : 0,
        dados.data_inicio || null,
        dados.data_fim    || null,
        dados.lat         || null,
        dados.lng         || null,
        dados.fk_empresa  || null,
        id
    ]);
}

// ─── ATUALIZAR APENAS PROGRESSO ──────────────────────────────────────────────
function atualizarProgresso(id, progresso, status) {
    var sql = `
        UPDATE obra
        SET progresso = ?,
            status    = COALESCE(?, status)
        WHERE id = ?
    `;
    return database.executar(sql, [progresso, status || null, id]);
}

// ─── EXCLUIR ──────────────────────────────────────────────────────────────────
function excluir(id) {
    return database.executar("DELETE FROM obra WHERE id = ?", [id]);
}

module.exports = {
    listarTodas,
    buscarPorId,
    resumo,
    paraMapa,
    cadastrar,
    atualizar,
    atualizarProgresso,
    excluir
};
