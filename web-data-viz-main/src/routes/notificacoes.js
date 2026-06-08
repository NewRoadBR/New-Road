var express = require("express");
var router = express.Router();
var notificacaoController = require("../controllers/notificacaoController");

router.get("/", function (req, res) {
    notificacaoController.listar(req, res);
});

module.exports = router;
