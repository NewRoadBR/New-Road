var database = require("../database/config");

/*
=========================================================
LISTAR OBRAS
=========================================================
*/

function listar(empresaId) {

    var instrucaoSql = `
        SELECT
            id,
            rodovia,
            descricao,
            status,
            DATE_FORMAT(data_inicio, '%Y-%m-%d') AS data_inicio,
            DATE_FORMAT(data_fim, '%Y-%m-%d') AS data_fim,
            impacto_previsto
        FROM obra
        WHERE fk_empresa = ?
        ORDER BY data_inicio DESC;
    `;

    return database.executar(instrucaoSql, [empresaId]);

}

/*
=========================================================
LISTAR POR RODOVIA
=========================================================
*/

function listarPorRodovia(rodovia, empresaId) {

    var instrucaoSql = `
        SELECT
            id,
            rodovia,
            descricao,
            status,
            DATE_FORMAT(data_inicio, '%Y-%m-%d') AS data_inicio,
            DATE_FORMAT(data_fim, '%Y-%m-%d') AS data_fim,
            impacto_previsto
        FROM obra
                WHERE rodovia = ?
                    AND fk_empresa = ?
        ORDER BY data_inicio DESC;
    `;

        return database.executar(instrucaoSql, [rodovia, empresaId]);

}

/*
=========================================================
BUSCAR POR ID
=========================================================
*/

function buscarPorId(id, empresaId) {

    var instrucaoSql = `
        SELECT
            id,
            rodovia,
            descricao,
            status,
            DATE_FORMAT(data_inicio, '%Y-%m-%d') AS data_inicio,
            DATE_FORMAT(data_fim, '%Y-%m-%d') AS data_fim,
            impacto_previsto,
            fk_empresa
        FROM obra
                WHERE id = ?
                    AND fk_empresa = ?;
    `;

        return database.executar(instrucaoSql, [id, empresaId]);

}

/*
=========================================================
CADASTRAR
=========================================================
*/

function cadastrar(
    rodovia,
    descricao,
    status,
    dataInicio,
    dataFim,
    impactoPrevisto,
    fkEmpresa
) {

    var instrucaoSql = `
        INSERT INTO obra (
            rodovia,
            descricao,
            status,
            data_inicio,
            data_fim,
            impacto_previsto,
            fk_empresa
        )
        VALUES (
            ?, ?, ?, ?, ?, ?, ?
        );
    `;

    return database.executar(instrucaoSql, [
        rodovia,
        descricao,
        status,
        dataInicio,
        dataFim,
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
    descricao,
    status,
    dataInicio,
    dataFim,
    impactoPrevisto,
    empresaId
) {

    var instrucaoSql = `
        UPDATE obra
        SET
            rodovia = ?,
            descricao = ?,
            status = ?,
            data_inicio = ?,
            data_fim = ?,
            impacto_previsto = ?
                WHERE id = ?
                    AND fk_empresa = ?;
    `;

    return database.executar(instrucaoSql, [
        rodovia,
        descricao,
        status,
        dataInicio,
        dataFim,
        impactoPrevisto,
        id,
        empresaId
    ]);

}

/*
=========================================================
DELETAR
=========================================================
*/

function deletar(id, empresaId) {

    var instrucaoSql = `
        DELETE FROM obra
                WHERE id = ?
                    AND fk_empresa = ?;
    `;

        return database.executar(instrucaoSql, [id, empresaId]);

}


module.exports = {

    listar,
    listarPorRodovia,
    buscarPorId,
    cadastrar,
    atualizar,
    deletar

};