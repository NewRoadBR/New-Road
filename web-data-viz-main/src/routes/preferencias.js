var express = require("express");
var router = express.Router();
var preferenciaController = require("../controllers/preferenciaController");

router.get("/:idUsuario", function (req, res) { preferenciaController.buscar(req, res); });
router.put("/:idUsuario", function (req, res) { preferenciaController.salvar(req, res); });

module.exports = router;
