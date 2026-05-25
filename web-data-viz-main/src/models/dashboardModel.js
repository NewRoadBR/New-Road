var database = require("../database/config");

/*
    ============================================================
    KPI — FLUXO MÉDIO
    ============================================================
*/

function buscarFluxoMedio(rodovia) {

    var instrucaoSql = `
        SELECT
            rodovia,
            fluxo
        FROM vw_fluxo_medio
        WHERE rodovia = ?;
    `;

    console.log(instrucaoSql, rodovia);

    return database.executar(instrucaoSql, [rodovia]);
}

/*
    ============================================================
    KPI — HORÁRIO CRÍTICO
    ============================================================
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

    console.log(instrucaoSql, rodovia);

    return database.executar(instrucaoSql, [rodovia]);
}

/*
    ============================================================
    KPI — JANELA IDEAL
    ============================================================
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

    console.log(instrucaoSql, rodovia);

    return database.executar(instrucaoSql, [rodovia]);
}

/*
    ============================================================
    KPI — MELHOR DIA PARA OBRA
    ============================================================
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

    console.log(instrucaoSql, rodovia);

    return database.executar(instrucaoSql, [rodovia]);
}

/*
    ============================================================
    GRÁFICO — FLUXO POR HORÁRIO
    ============================================================
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

    console.log(instrucaoSql, rodovia);

    return database.executar(instrucaoSql, [rodovia]);
}

/*
    ============================================================
    GRÁFICO — CONGESTIONAMENTO
    ============================================================
*/

function buscarCongestionamento(rodovia) {

    var instrucaoSql = `
        SELECT
            hora,
            congestionamento
        FROM vw_congestionamento
        WHERE rodovia = ?
        ORDER BY hora;
    `;

    console.log(instrucaoSql, rodovia);

    return database.executar(instrucaoSql, [rodovia]);
}

/*
    ============================================================
    KPI — IMPACTO OPERACIONAL
    ============================================================
*/

function buscarImpactoOperacional(rodovia) {
    // Removido: Impacto Operacional será removido das APIs
}

/*
    ============================================================
    KPI — PERFIL DA RODOVIA
    ============================================================
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

    console.log(instrucaoSql, rodovia);

    return database.executar(instrucaoSql, [rodovia]);
}

/*
    ============================================================
    KPI — PRESSÃO OPERACIONAL
    ============================================================
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

    console.log(instrucaoSql, rodovia);

    return database.executar(instrucaoSql, [rodovia]);
}

/*
    ============================================================
    EXPORTS
    ============================================================
*/

module.exports = {

    buscarFluxoMedio,
    buscarHorarioCritico,
    buscarJanelaIdeal,
    buscarMelhorDia,
    buscarFluxoHorario,
    buscarCongestionamento,
    buscarPerfilRodovia,
    buscarPressaoOperacional

};