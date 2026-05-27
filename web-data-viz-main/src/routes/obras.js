var express = require("express");
var router = express.Router();
var obraController = require("../controllers/obraController");

router.get("/",         function (req, res) { obraController.listar(req, res); });
router.get("/:id",      function (req, res) { obraController.buscarPorId(req, res); });
router.post("/",        function (req, res) { obraController.criar(req, res); });
router.put("/:id",      function (req, res) { obraController.atualizar(req, res); });
router.patch("/:id/status", function (req, res) { obraController.atualizarStatus(req, res); });
router.delete("/:id",   function (req, res) { obraController.deletar(req, res); });

module.exports = router;
