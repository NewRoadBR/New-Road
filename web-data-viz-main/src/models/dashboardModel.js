var database = require("../database/config");

/*
=========================================================
FLUXO MÉDIO
=========================================================
*/

function buscarFluxoMedio(rodovia) {

    var instrucaoSql = `
        SELECT
            rodovia,
            fluxo
        FROM vw_fluxo_medio
        WHERE rodovia = ?;
    `;

    return database.executar(instrucaoSql, [rodovia]);

}

/*
=========================================================
HORÁRIO CRÍTICO
=========================================================
*/

function buscarHorarioCritico(rodovia) {

    var instrucaoSql = `
        SELECT
            rodovia,
            hora,
            CONCAT(hora, 'h–', hora + 1, 'h') AS periodo,
            volume
        FROM vw_horario_critico
        WHERE rodovia = ?;
    `;

    return database.executar(instrucaoSql, [rodovia]);

}

/*
=========================================================
JANELA IDEAL
=========================================================
*/

function buscarJanelaIdeal(rodovia) {

    var instrucaoSql = `
        SELECT
            rodovia,
            hora,
            CONCAT(hora, 'h–', hora + 1, 'h') AS periodo,
            volume
        FROM vw_janela_ideal
        WHERE rodovia = ?;
    `;

    return database.executar(instrucaoSql, [rodovia]);

}

/*
=========================================================
MELHOR DIA
=========================================================
*/

function buscarMelhorDia(rodovia) {

    var instrucaoSql = `
        SELECT
            rodovia,
            dia_semana,
            media
        FROM vw_melhor_dia
        WHERE rodovia = ?;
    `;

    return database.executar(instrucaoSql, [rodovia]);

}

/*
=========================================================
FLUXO HORÁRIO
=========================================================
*/

function buscarFluxoHorario(rodovia) {

    var instrucaoSql = `
        SELECT
            hora,
            volume
        FROM vw_fluxo_horario
        WHERE rodovia = ?
        ORDER BY hora;
    `;

    return database.executar(instrucaoSql, [rodovia]);

}

/*
=========================================================
VOLUME DIA SEMANA
=========================================================
*/

function buscarVolumeDiaSemana(rodovia) {

    var instrucaoSql = `
        SELECT
            dia_semana,
            nome_dia,
            volume_total
        FROM vw_volume_dia_semana
        WHERE rodovia = ?
        ORDER BY dia_semana;
    `;

    return database.executar(instrucaoSql, [rodovia]);

}

/*
=========================================================
PERFIL RODOVIA
=========================================================
*/

function buscarPerfilRodovia(rodovia) {

    var instrucaoSql = `
        SELECT
            media_leves,
            media_pesados,
            media_motos,
            media_especiais
        FROM vw_perfil_rodovia
        WHERE rodovia = ?;
    `;

    return database.executar(instrucaoSql, [rodovia]);

}

/*
=========================================================
PRESSÃO OPERACIONAL
=========================================================
*/

function buscarPressaoOperacional(rodovia) {

    var instrucaoSql = `
        SELECT
            hora,
            pressao_operacional
        FROM vw_pressao_operacional
        WHERE rodovia = ?
        ORDER BY hora;
    `;

    return database.executar(instrucaoSql, [rodovia]);

}

module.exports = {

    buscarFluxoMedio,
    buscarHorarioCritico,
    buscarJanelaIdeal,
    buscarMelhorDia,
    buscarFluxoHorario,
    buscarVolumeDiaSemana,
    buscarPerfilRodovia,
    buscarPressaoOperacional

};