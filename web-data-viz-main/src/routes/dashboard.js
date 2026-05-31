var express = require("express");

var router = express.Router();

var dashboardController =
    require("../controllers/dashboardController");

/*
=========================================================
KPIs
=========================================================
*/

router.get(
    "/fluxo-medio/:rodovia",
    dashboardController.fluxoMedio
);

router.get(
    "/horario-critico/:rodovia",
    dashboardController.horarioCritico
);

router.get(
    "/janela-ideal/:rodovia",
    dashboardController.janelaIdeal
);

router.get(
    "/melhor-dia/:rodovia",
    dashboardController.melhorDia
);

router.get(
    "/perfil-rodovia/:rodovia",
    dashboardController.perfilRodovia
);

router.get(
    "/pressao-operacional/:rodovia",
    dashboardController.pressaoOperacional
);

/*
=========================================================
GRÁFICOS
=========================================================
*/

router.get(
    "/fluxo-horario/:rodovia",
    dashboardController.fluxoHorario
);

router.get(
    "/volume-dia-semana/:rodovia",
    dashboardController.volumeDiaSemana
);

module.exports = router;