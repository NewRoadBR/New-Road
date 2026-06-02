var database = require("../database/config");

function buscarPorUsuario(idUsuario) {
    var sql = `
        SELECT
            fk_usuario       AS idUsuario,
            intervalo,
            notif_critica    AS notifCritica,
            notif_pico       AS notifPico,
            notif_relatorio  AS notifRelatorio,
            dark_mode        AS darkMode
        FROM preferencia
        WHERE fk_usuario = ?;
    `;
    return database.executar(sql, [idUsuario]);
}

function salvar(idUsuario, dados) {
    var sql = `
        INSERT INTO preferencia
            (fk_usuario, intervalo, regiao_padrao, notif_critica, notif_pico, notif_relatorio, dark_mode)
        VALUES (?, ?, 'SP Region (todas)', ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            intervalo       = VALUES(intervalo),
            notif_critica   = VALUES(notif_critica),
            notif_pico      = VALUES(notif_pico),
            notif_relatorio = VALUES(notif_relatorio),
            dark_mode       = VALUES(dark_mode);
    `;
    return database.executar(sql, [
        idUsuario,
        dados.intervalo,
        dados.notifCritica ? 1 : 0,
        dados.notifPico ? 1 : 0,
        dados.notifRelatorio ? 1 : 0,
        dados.darkMode ? 1 : 0
    ]);
}

module.exports = { buscarPorUsuario, salvar };
