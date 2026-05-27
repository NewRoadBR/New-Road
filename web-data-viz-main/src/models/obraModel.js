var database = require("../database/config");

function listar() {
    var sql = `
        SELECT
            id,
            local,
            bairro,
            tipo,
            DATE_FORMAT(data_inicio, '%Y-%m-%d') AS dataInicio,
            duracao,
            impacto,
            status,
            lat,
            lng,
            marcador,
            urgencia,
            grau_urgencia AS grauUrgencia,
            descricao
        FROM obra
        ORDER BY id;
    `;
    return database.executar(sql);
}

function buscarPorId(id) {
    var sql = `
        SELECT
            id, local, bairro, tipo,
            DATE_FORMAT(data_inicio, '%Y-%m-%d') AS dataInicio,
            duracao, impacto, status, lat, lng, marcador,
            urgencia, grau_urgencia AS grauUrgencia, descricao
        FROM obra
        WHERE id = ?;
    `;
    return database.executar(sql, [id]);
}

function criar(dados) {
    var sql = `
        INSERT INTO obra
            (local, bairro, tipo, data_inicio, duracao, impacto, status, lat, lng, marcador, urgencia, grau_urgencia, descricao)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
    return database.executar(sql, [
        dados.local,
        dados.bairro,
        dados.tipo,
        dados.dataInicio,
        dados.duracao,
        dados.impacto,
        dados.status,
        dados.lat,
        dados.lng,
        dados.marcador,
        dados.urgencia,
        dados.grauUrgencia,
        dados.descricao
    ]);
}

function atualizar(id, dados) {
    var sql = `
        UPDATE obra SET
            local = ?, bairro = ?, tipo = ?, data_inicio = ?, duracao = ?,
            impacto = ?, status = ?, lat = ?, lng = ?, marcador = ?,
            urgencia = ?, grau_urgencia = ?, descricao = ?
        WHERE id = ?;
    `;
    return database.executar(sql, [
        dados.local,
        dados.bairro,
        dados.tipo,
        dados.dataInicio,
        dados.duracao,
        dados.impacto,
        dados.status,
        dados.lat,
        dados.lng,
        dados.marcador,
        dados.urgencia,
        dados.grauUrgencia,
        dados.descricao,
        id
    ]);
}

function atualizarStatus(id, status) {
    var sql = `UPDATE obra SET status = ? WHERE id = ?;`;
    return database.executar(sql, [status, id]);
}

function deletar(id) {
    var sql = `DELETE FROM obra WHERE id = ?;`;
    return database.executar(sql, [id]);
}

module.exports = {
    listar,
    buscarPorId,
    criar,
    atualizar,
    atualizarStatus,
    deletar
};
