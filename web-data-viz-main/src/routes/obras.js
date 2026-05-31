const express = require("express");

const router = express.Router();

const obraController = require("../controllers/obraController");

router.get("/", function (req, res) {
    obraController.listar(req, res);
});

router.get("/rodovia/:rodovia", function (req, res) {
    obraController.listarPorRodovia(req, res);
});

router.get("/:id", function (req, res) {
    obraController.buscarPorId(req, res);
});

router.post("/", function (req, res) {
    obraController.cadastrar(req, res);
});

router.put("/:id", function (req, res) {
    obraController.atualizar(req, res);
});

router.delete("/:id", function (req, res) {
    obraController.deletar(req, res);
});

module.exports = router;