var database = require("../database/config");

/*
=========================================================
LISTAR OBRAS
=========================================================
*/

function listar() {

    var instrucaoSql = `
        SELECT
            id,
            rodovia,
            titulo,
            descricao,
            tipo,
            status,
            DATE_FORMAT(data_inicio, '%Y-%m-%d') AS data_inicio,
            DATE_FORMAT(data_fim, '%Y-%m-%d') AS data_fim,
            hora_inicio,
            hora_fim,
            impacto_previsto
        FROM obra
        ORDER BY data_inicio DESC;
    `;

    return database.executar(instrucaoSql);

}

/*
=========================================================
LISTAR POR RODOVIA
=========================================================
*/

function listarPorRodovia(rodovia) {

    var instrucaoSql = `
        SELECT
            id,
            rodovia,
            titulo,
            descricao,
            tipo,
            status,
            DATE_FORMAT(data_inicio, '%Y-%m-%d') AS data_inicio,
            DATE_FORMAT(data_fim, '%Y-%m-%d') AS data_fim,
            hora_inicio,
            hora_fim,
            impacto_previsto
        FROM obra
        WHERE rodovia = ?
        ORDER BY data_inicio DESC;
    `;

    return database.executar(instrucaoSql, [rodovia]);

}

/*
=========================================================
BUSCAR POR ID
=========================================================
*/

function buscarPorId(id) {

    var instrucaoSql = `
        SELECT *
        FROM obra
        WHERE id = ?;
    `;

    return database.executar(instrucaoSql, [id]);

}

/*
=========================================================
CADASTRAR
=========================================================
*/

function cadastrar(
    rodovia,
    titulo,
    descricao,
    tipo,
    status,
    dataInicio,
    dataFim,
    horaInicio,
    horaFim,
    impactoPrevisto,
    fkEmpresa
) {

    var instrucaoSql = `
        INSERT INTO obra (
            rodovia,
            titulo,
            descricao,
            tipo,
            status,
            data_inicio,
            data_fim,
            hora_inicio,
            hora_fim,
            impacto_previsto,
            fk_empresa
        )
        VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        );
    `;

    return database.executar(instrucaoSql, [
        rodovia,
        titulo,
        descricao,
        tipo,
        status,
        dataInicio,
        dataFim,
        horaInicio,
        horaFim,
        impactoPrevisto,
        fkEmpresa
    ]);

}

/*
=========================================================
ATUALIZAR
=========================================================
*/

function atualizar(
    id,
    rodovia,
    titulo,
    descricao,
    tipo,
    status,
    dataInicio,
    dataFim,
    horaInicio,
    horaFim,
    impactoPrevisto
) {

    var instrucaoSql = `
        UPDATE obra
        SET
            rodovia = ?,
            titulo = ?,
            descricao = ?,
            tipo = ?,
            status = ?,
            data_inicio = ?,
            data_fim = ?,
            hora_inicio = ?,
            hora_fim = ?,
            impacto_previsto = ?
        WHERE id = ?;
    `;

    return database.executar(instrucaoSql, [
        rodovia,
        titulo,
        descricao,
        tipo,
        status,
        dataInicio,
        dataFim,
        horaInicio,
        horaFim,
        impactoPrevisto,
        id
    ]);

}

/*
=========================================================
DELETAR
=========================================================
*/

function deletar(id) {

    var instrucaoSql = `
        DELETE FROM obra
        WHERE id = ?;
    `;

    return database.executar(instrucaoSql, [id]);

}


module.exports = {

    listar,
    listarPorRodovia,
    buscarPorId,
    cadastrar,
    atualizar,
    deletar

};