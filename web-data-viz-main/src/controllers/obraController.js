var obraModel = require("../models/obraModel");

var STATUS_VALIDOS = ["planned", "ongoing", "completed", "critical"];

function calcularMarcador(impacto) {
    if (impacto >= 70) return "red";
    if (impacto >= 40) return "yellow";
    return "green";
}

function calcularUrgencia(grauUrgencia) {
    if (grauUrgencia <= 7)  return "urgente";
    if (grauUrgencia <= 15) return "alta";
    if (grauUrgencia <= 30) return "media";
    return "baixa";
}

function montarPayload(req) {
    var b = req.body;
    var impacto = parseInt(b.impacto);
    if (isNaN(impacto)) impacto = 50;
    var grau = parseInt(b.grauUrgencia);
    if (isNaN(grau)) grau = 30;

    return {
        local: b.local,
        bairro: b.bairro || null,
        tipo: b.tipo || null,
        dataInicio: b.dataInicio || null,
        duracao: parseInt(b.duracao) || 7,
        impacto: impacto,
        status: STATUS_VALIDOS.indexOf(b.status) >= 0 ? b.status : "planned",
        lat: parseFloat(b.lat) || null,
        lng: parseFloat(b.lng) || null,
        marcador: b.marcador || calcularMarcador(impacto),
        urgencia: b.urgencia || calcularUrgencia(grau),
        grauUrgencia: grau,
        descricao: b.descricao || null
    };
}

function listar(req, res) {
    obraModel.listar()
        .then(function (resultado) {
            res.status(200).json(resultado);
        })
        .catch(function (erro) {
            console.log("Erro ao listar obras:", erro);
            res.status(500).json(erro.sqlMessage || erro.message);
        });
}

function buscarPorId(req, res) {
    obraModel.buscarPorId(req.params.id)
        .then(function (resultado) {
            if (!resultado.length) return res.status(404).send("Obra não encontrada");
            res.status(200).json(resultado[0]);
        })
        .catch(function (erro) {
            console.log("Erro ao buscar obra:", erro);
            res.status(500).json(erro.sqlMessage || erro.message);
        });
}

function criar(req, res) {
    if (!req.body.local) return res.status(400).send("Localização é obrigatória");
    if (!req.body.dataInicio) return res.status(400).send("Data de início é obrigatória");

    var dados = montarPayload(req);
    obraModel.criar(dados)
        .then(function (resultado) {
            res.status(201).json(Object.assign({ id: resultado.insertId }, dados));
        })
        .catch(function (erro) {
            console.log("Erro ao criar obra:", erro);
            res.status(500).json(erro.sqlMessage || erro.message);
        });
}

function atualizar(req, res) {
    var dados = montarPayload(req);
    obraModel.atualizar(req.params.id, dados)
        .then(function () {
            res.status(200).json(Object.assign({ id: Number(req.params.id) }, dados));
        })
        .catch(function (erro) {
            console.log("Erro ao atualizar obra:", erro);
            res.status(500).json(erro.sqlMessage || erro.message);
        });
}

function atualizarStatus(req, res) {
    var status = req.body.status;
    if (STATUS_VALIDOS.indexOf(status) < 0) return res.status(400).send("Status inválido");

    obraModel.atualizarStatus(req.params.id, status)
        .then(function () { res.status(200).json({ id: Number(req.params.id), status: status }); })
        .catch(function (erro) {
            console.log("Erro ao atualizar status:", erro);
            res.status(500).json(erro.sqlMessage || erro.message);
        });
}

function deletar(req, res) {
    obraModel.deletar(req.params.id)
        .then(function () { res.status(200).json({ ok: true }); })
        .catch(function (erro) {
            console.log("Erro ao deletar obra:", erro);
            res.status(500).json(erro.sqlMessage || erro.message);
        });
}

module.exports = {
    listar,
    buscarPorId,
    criar,
    atualizar,
    atualizarStatus,
    deletar
};
