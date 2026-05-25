var dashboardModel = require("../models/dashboardModel");

/*
    ============================================================
    KPI — FLUXO MÉDIO
    ============================================================
*/

function buscarFluxoMedio(req, res) {

    var rodovia = req.query.rodovia;

    dashboardModel.buscarFluxoMedio(rodovia)
        .then(function(resultado) {

            res.json(resultado);

        }).catch(function(erro) {

            console.log(erro);

            res.status(500).json(erro.sqlMessage);

        });
}

/*
    ============================================================
    KPI — HORÁRIO CRÍTICO
    ============================================================
*/

function buscarHorarioCritico(req, res) {

    var rodovia = req.query.rodovia;

    dashboardModel.buscarHorarioCritico(rodovia)
        .then(function(resultado) {

            res.json(resultado);

        }).catch(function(erro) {

            console.log(erro);

            res.status(500).json(erro.sqlMessage);

        });
}

/*
    ============================================================
    KPI — JANELA IDEAL
    ============================================================
*/

function buscarJanelaIdeal(req, res) {

    var rodovia = req.query.rodovia;

    dashboardModel.buscarJanelaIdeal(rodovia)
        .then(function(resultado) {

            res.json(resultado);

        }).catch(function(erro) {

            console.log(erro);

            res.status(500).json(erro.sqlMessage);

        });
}

/*
    ============================================================
    KPI — MELHOR DIA
    ============================================================
*/

function buscarMelhorDia(req, res) {

    var rodovia = req.query.rodovia;

    dashboardModel.buscarMelhorDia(rodovia)
        .then(function(resultado) {

            res.json(resultado);

        }).catch(function(erro) {

            console.log(erro);

            res.status(500).json(erro.sqlMessage);

        });
}

/*
    ============================================================
    GRÁFICO — FLUXO HORÁRIO
    ============================================================
*/

function buscarFluxoHorario(req, res) {

    var rodovia = req.query.rodovia;

    dashboardModel.buscarFluxoHorario(rodovia)
        .then(function(resultado) {

            res.json(resultado);

        }).catch(function(erro) {

            console.log(erro);

            res.status(500).json(erro.sqlMessage);

        });
}

/*
    ============================================================
    GRÁFICO — CONGESTIONAMENTO
    ============================================================
*/

function buscarCongestionamento(req, res) {

    var rodovia = req.query.rodovia;

    dashboardModel.buscarCongestionamento(rodovia)
        .then(function(resultado) {

            res.json(resultado);

        }).catch(function(erro) {

            console.log(erro);

            res.status(500).json(erro.sqlMessage);

        });
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