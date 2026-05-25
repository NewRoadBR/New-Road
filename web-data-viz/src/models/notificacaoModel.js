// models/notificacaoModel.js
var database = require("../database/config");

function listarPorUsuario(fkUsuario) {
    var sql = `
        SELECT id, titulo, descricao, tipo, lida,
               DATE_FORMAT(criado_em, '%d/%m/%Y %H:%i') AS criado_em
        FROM notificacao
        WHERE fk_usuario = ?
        ORDER BY criado_em DESC
        LIMIT 20
    `;
    return database.executar(sql, [fkUsuario]);
}

function contarNaoLidas(fkUsuario) {
    var sql = `SELECT COUNT(*) AS total FROM notificacao WHERE fk_usuario = ? AND lida = 0`;
    return database.executar(sql, [fkUsuario]);
}

function marcarTodasLidas(fkUsuario) {
    return database.executar("UPDATE notificacao SET lida = 1 WHERE fk_usuario = ?", [fkUsuario]);
}

module.exports = { listarPorUsuario, contarNaoLidas, marcarTodasLidas };
