var obrasModel = require("../models/obrasModel");

function obterEmpresaId(req, res) {
    var empresaId = Number(req.query.empresaId);

    if (!Number.isInteger(empresaId) || empresaId <= 0) {
        res.status(400).send("empresaId inválido");
        return null;
    }

    return empresaId;
}

function listar(req, res) {
    if (!obterEmpresaId(req, res)) return;

    obrasModel.listar()
        .then(function (resultado) {
            res.status(200).json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

function listarPorRodovia(req, res) {
    var rodovia = req.params.rodovia;

    if (!obterEmpresaId(req, res)) return;

    obrasModel.listarPorRodovia(rodovia)
        .then(function (resultado) {
            res.status(200).json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

function buscarPorId(req, res) {
    var id = req.params.id;

    if (!obterEmpresaId(req, res)) return;

    obrasModel.buscarPorId(id)
        .then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado[0]);
            } else {
                res.status(404).json({ mensagem: "Obra não encontrada" });
            }
        })
        .catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

function cadastrar(req, res) {
    var body = req.body;

    if (!body.rodovia) return res.status(400).send("Rodovia é obrigatória");
    if (!body.status) return res.status(400).send("Status é obrigatório");
    if (!body.data_inicio) return res.status(400).send("Data início é obrigatória");
    if (!obterEmpresaId(req, res)) return;

    obrasModel.cadastrar(
        body.rodovia,
        body.descricao,
        body.status,
        body.data_inicio,
        body.data_fim,
        body.impacto_previsto
    )
        .then(function (resultado) {
            res.status(201).json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

function atualizar(req, res) {
    var id = req.params.id;
    var body = req.body;

    if (!obterEmpresaId(req, res)) return;
    if (!body.rodovia) return res.status(400).send("Rodovia é obrigatória");
    if (!body.status) return res.status(400).send("Status é obrigatório");
    if (!body.data_inicio) return res.status(400).send("Data início é obrigatória");

    obrasModel.atualizar(
        id,
        body.rodovia,
        body.descricao,
        body.status,
        body.data_inicio,
        body.data_fim,
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

function deletar(req, res) {
    var id = req.params.id;

    if (!obterEmpresaId(req, res)) return;

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
