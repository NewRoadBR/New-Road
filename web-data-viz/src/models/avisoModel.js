// models/avisoModel.js
var database = require("../database/config");

function listarTodos(filtros) {
    var where = "WHERE 1=1";
    var params = [];

    if (filtros && filtros.tipo) {
        where += " AND a.tipo = ?";
        params.push(filtros.tipo);
    }

    var sql = `
        SELECT a.id, a.titulo, a.mensagem, a.tipo, a.lido,
               DATE_FORMAT(a.criado_em, '%d/%m/%Y %H:%i') AS criado_em,
               o.nome AS obra_nome,
               u.nome AS usuario_nome
        FROM aviso a
        LEFT JOIN obra    o ON o.id = a.fk_obra
        LEFT JOIN usuario u ON u.id = a.fk_usuario
        ${where}
        ORDER BY a.criado_em DESC
    `;
    return database.executar(sql, params);
}

function cadastrar(dados) {
    var sql = `
        INSERT INTO aviso (titulo, mensagem, tipo, fk_obra, fk_usuario)
        VALUES (?, ?, ?, ?, ?)
    `;
    return database.executar(sql, [
        dados.titulo, dados.mensagem, dados.tipo || "info",
        dados.fk_obra || null, dados.fk_usuario || null
    ]);
}

function marcarComoLido(id) {
    return database.executar("UPDATE aviso SET lido = 1 WHERE id = ?", [id]);
}

function excluir(id) {
    return database.executar("DELETE FROM aviso WHERE id = ?", [id]);
}

module.exports = { listarTodos, cadastrar, marcarComoLido, excluir };
