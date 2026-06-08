var database = require("../database/config");

function listarRecentes(limite) {
    var sql = `
        SELECT
            id,
            titulo,
            mensagem,
            tipo,
            data_criacao AS dataCriacao,
            visualizada
        FROM notificacoes
        ORDER BY data_criacao DESC
        LIMIT ?;
    `;
    return database.executar(sql, [limite]);
}

module.exports = {
    listarRecentes: listarRecentes
};
