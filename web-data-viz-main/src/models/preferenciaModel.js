var database = require("../database/config");

function buscarPorUsuario(idUsuario) {
    var sql = `
        SELECT
            fk_usuario       AS idUsuario,
            intervalo,
            regiao_padrao    AS regiaoPadrao,
            notif_critica    AS notifEtl,
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
        VALUES (?, ?, ?, ?, 0, 0, ?)
        ON DUPLICATE KEY UPDATE
            intervalo       = VALUES(intervalo),
            regiao_padrao   = VALUES(regiao_padrao),
            notif_critica   = VALUES(notif_critica),
            notif_pico      = 0,
            notif_relatorio = 0,
            dark_mode       = VALUES(dark_mode);
    `;
    return database.executar(sql, [
        idUsuario,
        dados.intervalo,
        dados.regiaoPadrao || "SP Region (todas)",
        dados.notifEtl ? 1 : 0,
        dados.darkMode ? 1 : 0
    ]);
}

function notificacoesEtlHabilitadas(idUsuario) {
    return buscarPorUsuario(idUsuario).then(function (rows) {
        if (!rows.length) return true;
        return rows[0].notifEtl === 1;
    });
}

module.exports = {
    buscarPorUsuario: buscarPorUsuario,
    salvar: salvar,
    notificacoesEtlHabilitadas: notificacoesEtlHabilitadas
};
