var obrasModel = require("../models/obrasModel");

/*
=========================================================
LISTAR
=========================================================
*/

function listar(req, res) {

    obrasModel.listar()

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
LISTAR POR RODOVIA
=========================================================
*/

function listarPorRodovia(req, res) {

    var rodovia = req.params.rodovia;

    obrasModel.listarPorRodovia(rodovia)

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
BUSCAR POR ID
=========================================================
*/

function buscarPorId(req, res) {

    var id = req.params.id;

    obrasModel.buscarPorId(id)

        .then(function (resultado) {

            if (resultado.length > 0) {

                res.status(200).json(resultado[0]);

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

    if (!body.titulo) {
        return res.status(400).send("Título é obrigatório");
    }

    if (!body.status) {
        return res.status(400).send("Status é obrigatório");
    }

    if (!body.data_inicio) {
        return res.status(400).send("Data início é obrigatória");
    }

    obrasModel.cadastrar(
        body.rodovia,
        body.titulo,
        body.descricao,
        body.tipo,
        body.status,
        body.data_inicio,
        body.data_fim,
        body.hora_inicio,
        body.hora_fim,
        body.impacto_previsto,
        body.fk_empresa
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

    obrasModel.atualizar(
        id,
        body.rodovia,
        body.titulo,
        body.descricao,
        body.tipo,
        body.status,
        body.data_inicio,
        body.data_fim,
        body.hora_inicio,
        body.hora_fim,
        body.impacto_previsto
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

    obrasModel.deletar(id)

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