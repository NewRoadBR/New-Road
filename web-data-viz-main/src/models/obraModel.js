const database = require("../database/config");

function listar() {

    const instrucao = `
        SELECT *
        FROM obra
        ORDER BY created_at DESC;
    `;

    return database.executar(instrucao);
}

function listarPorRodovia(rodovia) {

    const instrucao = `
        SELECT *
        FROM obra
        WHERE rodovia = '${rodovia}'
        ORDER BY data_inicio DESC;
    `;

    return database.executar(instrucao);
}

function buscarPorId(id) {

    const instrucao = `
        SELECT *
        FROM obra
        WHERE id = ${id};
    `;

    return database.executar(instrucao);
}

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

    const instrucao = `
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
        ) VALUES (
            '${rodovia}',
            '${titulo}',
            '${descricao}',
            '${tipo}',
            '${status}',
            '${dataInicio}',
            '${dataFim}',
            ${horaInicio},
            ${horaFim},
            ${impactoPrevisto},
            ${fkEmpresa}
        );
    `;

    return database.executar(instrucao);
}

function atualizar(
    id,
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

    const instrucao = `
        UPDATE obra
        SET
            titulo = '${titulo}',
            descricao = '${descricao}',
            tipo = '${tipo}',
            status = '${status}',
            data_inicio = '${dataInicio}',
            data_fim = '${dataFim}',
            hora_inicio = ${horaInicio},
            hora_fim = ${horaFim},
            impacto_previsto = ${impactoPrevisto}
        WHERE id = ${id};
    `;

    return database.executar(instrucao);
}

function deletar(id) {

    const instrucao = `
        DELETE FROM obra
        WHERE id = ${id};
    `;

    return database.executar(instrucao);
}

module.exports = {
    listar,
    listarPorRodovia,
    buscarPorId,
    cadastrar,
    atualizar,
    deletar
};