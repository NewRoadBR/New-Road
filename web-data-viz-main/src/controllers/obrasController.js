var obrasModel = require("../models/obrasModel");
var impactoUtil = require("../utils/impacto");

function obterEmpresaId(req, res) {

    var empresaId = Number(req.query.empresaId);

    if (!Number.isInteger(empresaId) || empresaId <= 0) {
        res.status(400).send("empresaId inválido");
        return null;
    }

    return empresaId;

}

/*
=========================================================
LISTAR
=========================================================
*/

function listar(req, res) {

    var empresaId = obterEmpresaId(req, res);
    if (!empresaId) return;

    obrasModel.listar(empresaId)

        .then(function (resultado) {

            res.status(200).json(impactoUtil.formatarListaObrasImpacto(resultado));

        })

        .catch(function (erro) {

            console.log(erro);

            res.status(500).json(erro.sqlMessage);

        });

}

/*
=========================================================
LISTAR POR RODOVIA
=========================================================
*/

function listarPorRodovia(req, res) {

    var rodovia = req.params.rodovia;

    var empresaId = obterEmpresaId(req, res);
    if (!empresaId) return;

    obrasModel.listarPorRodovia(rodovia, empresaId)

        .then(function (resultado) {

            res.status(200).json(impactoUtil.formatarListaObrasImpacto(resultado));

        })

        .catch(function (erro) {

            console.log(erro);

            res.status(500).json(erro.sqlMessage);

        });

}

/*
=========================================================
BUSCAR POR ID
=========================================================
*/

function buscarPorId(req, res) {

    var id = req.params.id;

    var empresaId = obterEmpresaId(req, res);
    if (!empresaId) return;

    obrasModel.buscarPorId(id, empresaId)

        .then(function (resultado) {

            if (resultado.length > 0) {

                res.status(200).json(impactoUtil.formatarObraImpacto(resultado[0]));

            } else {

                res.status(404).json({
                    mensagem: "Obra não encontrada"
                });

            }

        })

        .catch(function (erro) {

            console.log(erro);

            res.status(500).json(erro.sqlMessage);

        });

}

/*
=========================================================
CADASTRAR
=========================================================
*/

function cadastrar(req, res) {

    var body = req.body;

    if (!body.rodovia) {
        return res.status(400).send("Rodovia é obrigatória");
    }

    if (!body.status) {
        return res.status(400).send("Status é obrigatório");
    }

    if (!body.data_inicio) {
        return res.status(400).send("Data início é obrigatória");
    }

    if (!body.impacto_previsto) {
        return res.status(400).send("Impacto previsto é obrigatório");
    }

    var empresaId = obterEmpresaId(req, res);
    if (!empresaId) return;

    obrasModel.cadastrar(
        body.rodovia,
        body.descricao,
        body.status,
        body.data_inicio,
        body.data_fim,
        impactoUtil.impactoParaCodigo(body.impacto_previsto),
        empresaId
    )

        .then(function (resultado) {

            res.status(201).json(resultado);

        })

        .catch(function (erro) {

            console.log(erro);

            res.status(500).json(erro.sqlMessage);

        });

}

/*
=========================================================
ATUALIZAR
=========================================================
*/

function atualizar(req, res) {

    var id = req.params.id;

    var body = req.body;

    var empresaId = obterEmpresaId(req, res);
    if (!empresaId) return;

    if (!body.rodovia) {
        return res.status(400).send("Rodovia é obrigatória");
    }

    if (!body.status) {
        return res.status(400).send("Status é obrigatório");
    }

    if (!body.data_inicio) {
        return res.status(400).send("Data início é obrigatória");
    }

    if (!body.impacto_previsto) {
        return res.status(400).send("Impacto previsto é obrigatório");
    }

    obrasModel.atualizar(
        id,
        body.rodovia,
        body.descricao,
        body.status,
        body.data_inicio,
        body.data_fim,
        impactoUtil.impactoParaCodigo(body.impacto_previsto),
        empresaId
    )

        .then(function (resultado) {

            res.status(200).json(resultado);

        })

        .catch(function (erro) {

            console.log(erro);

            res.status(500).json(erro.sqlMessage);

        });

}

/*
=========================================================
DELETAR
=========================================================
*/

function deletar(req, res) {

    var id = req.params.id;

    var empresaId = obterEmpresaId(req, res);
    if (!empresaId) return;

    obrasModel.deletar(id, empresaId)

        .then(function (resultado) {

            res.status(200).json(resultado);

        })

        .catch(function (erro) {

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