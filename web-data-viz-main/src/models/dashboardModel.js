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
        WHERE rodovia = '${rodovia}';
    `;

    console.log(instrucaoSql);

    return database.executar(instrucaoSql);
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
            volume_medio
        FROM vw_horario_critico
        WHERE rodovia = '${rodovia}'
        ORDER BY hora;
    `;

    console.log(instrucaoSql);

    return database.executar(instrucaoSql);
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
            volume_medio
        FROM vw_janela_ideal
        WHERE rodovia = '${rodovia}'
        ORDER BY hora;
    `;

    console.log(instrucaoSql);

    return database.executar(instrucaoSql);
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
        WHERE rodovia = '${rodovia}'
        ORDER BY media ASC
        LIMIT 1;
    `;

    console.log(instrucaoSql);

    return database.executar(instrucaoSql);
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
        WHERE rodovia = '${rodovia}'
        ORDER BY hora;
    `;

    console.log(instrucaoSql);

    return database.executar(instrucaoSql);
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
        WHERE rodovia = '${rodovia}'
        ORDER BY hora;
    `;

    console.log(instrucaoSql);

    return database.executar(instrucaoSql);
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
    buscarCongestionamento

};