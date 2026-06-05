var dashboardModel = require("../models/dashboardModel");

/*
=========================================================
FLUXO MÉDIO
=========================================================
*/

function fluxoMedio(req, res) {

    var rodovia = req.params.rodovia;

    dashboardModel.buscarFluxoMedio(rodovia)

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
HORÁRIO CRÍTICO
=========================================================
*/

function horarioCritico(req, res) {

    var rodovia = req.params.rodovia;

    dashboardModel.buscarHorarioCritico(rodovia)

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
JANELA IDEAL
=========================================================
*/

function janelaIdeal(req, res) {

    var rodovia = req.params.rodovia;

    dashboardModel.buscarJanelaIdeal(rodovia)

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
MELHOR DIA
=========================================================
*/

function melhorDia(req, res) {

    var rodovia = req.params.rodovia;

    dashboardModel.buscarMelhorDia(rodovia)

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
FLUXO HORÁRIO
=========================================================
*/

function fluxoHorario(req, res) {

    var rodovia = req.params.rodovia;

    dashboardModel.buscarFluxoHorario(rodovia)

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
VOLUME DIA SEMANA
=========================================================
*/

function volumeDiaSemana(req, res) {

    var rodovia = req.params.rodovia;

    dashboardModel.buscarVolumeDiaSemana(rodovia)

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
PERFIL RODOVIA
=========================================================
*/

function perfilRodovia(req, res) {

    var rodovia = req.params.rodovia;

    dashboardModel.buscarPerfilRodovia(rodovia)

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
PRESSÃO OPERACIONAL
=========================================================
*/

function pressaoOperacional(req, res) {

    var rodovia = req.params.rodovia;

    dashboardModel.buscarPressaoOperacional(rodovia)

        .then(function (resultado) {

            res.status(200).json(resultado);

        })

        .catch(function (erro) {

            console.log(erro);

            res.status(500).json(erro.sqlMessage);

        });

}

module.exports = {

    fluxoMedio,
    horarioCritico,
    janelaIdeal,
    melhorDia,
    fluxoHorario,
    volumeDiaSemana,
    perfilRodovia,
    pressaoOperacional

};