const obraModel = require("../models/obraModel");

function listar(req, res) {

    obraModel.listar()
        .then(resultado => {
            res.status(200).json(resultado);
        })
        .catch(erro => {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });

}

function listarPorRodovia(req, res) {

    const rodovia = req.params.rodovia;

    obraModel.listarPorRodovia(rodovia)
        .then(resultado => {
            res.status(200).json(resultado);
        })
        .catch(erro => {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });

}

function buscarPorId(req, res) {

    const id = req.params.id;

    obraModel.buscarPorId(id)
        .then(resultado => {

            if (resultado.length > 0) {
                res.status(200).json(resultado[0]);
            } else {
                res.status(404).json({
                    mensagem: "Obra não encontrada"
                });
            }

        })
        .catch(erro => {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });

}

function cadastrar(req, res) {

    const {
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
    } = req.body;

    if (!rodovia || !titulo || !status || !data_inicio) {

        return res.status(400).json({
            mensagem: "Dados obrigatórios não informados"
        });

    }

    obraModel.cadastrar(
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
        .then(resultado => {
            res.status(201).json(resultado);
        })
        .catch(erro => {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });

}

function atualizar(req, res) {

    const id = req.params.id;

    const {
        titulo,
        descricao,
        tipo,
        status,
        data_inicio,
        data_fim,
        hora_inicio,
        hora_fim,
        impacto_previsto
    } = req.body;

    obraModel.atualizar(
        id,
        titulo,
        descricao,
        tipo,
        status,
        data_inicio,
        data_fim,
        hora_inicio,
        hora_fim,
        impacto_previsto
    )
        .then(resultado => {
            res.status(200).json(resultado);
        })
        .catch(erro => {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });

}

function deletar(req, res) {

    const id = req.params.id;

    obraModel.deletar(id)
        .then(resultado => {
            res.status(200).json(resultado);
        })
        .catch(erro => {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });

}

module.exports = {
    listar,
    listarPorRodovia,
    buscarPorId,
    cadastrar,
    atualizar,
    deletar
};