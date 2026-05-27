var express = require("express");

var router = express.Router();

var dashboardController =
    require("../controllers/dashboardController");

/*
    ============================================================
    KPI — FLUXO MÉDIO
    ============================================================
*/

router.get(
    "/fluxo-medio",
    function(req, res) {
        dashboardController.buscarFluxoMedio(req, res);
    }
);

/*
    ============================================================
    KPI — HORÁRIO CRÍTICO
    ============================================================
*/

router.get(
    "/horario-critico",
    function(req, res) {
        dashboardController.buscarHorarioCritico(req, res);
    }
);

/*
    ============================================================
    KPI — JANELA IDEAL
    ============================================================
*/

router.get(
    "/janela-ideal",
    function(req, res) {
        dashboardController.buscarJanelaIdeal(req, res);
    }
);

/*
    ============================================================
    KPI — MELHOR DIA
    ============================================================
*/

router.get(
    "/melhor-dia",
    function(req, res) {
        dashboardController.buscarMelhorDia(req, res);
    }
);

/*
    ============================================================
    GRÁFICO — FLUXO HORÁRIO
    ============================================================
*/

router.get(
    "/fluxo-horario",
    function(req, res) {
        dashboardController.buscarFluxoHorario(req, res);
    }
);

/*
    ============================================================
    GRÁFICO — VOLUME POR DIA DA SEMANA
    ============================================================
*/

router.get(
    "/volume-dia-semana",
    function(req, res) {
        dashboardController.buscarVolumeDiaSemana(req, res);
    }
);

/*
    ============================================================
    KPI — PERFIL DA RODOVIA
    ============================================================
*/

router.get(
    "/perfil-rodovia",
    function(req, res) {
        dashboardController.buscarPerfilRodovia(req, res);
    }
);

/*
    ============================================================
    KPI — PRESSÃO OPERACIONAL
    ============================================================
*/

router.get(
    "/pressao-operacional",
    function(req, res) {
        dashboardController.buscarPressaoOperacional(req, res);
    }
);

module.exports = router;