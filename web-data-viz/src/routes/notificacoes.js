// routes/notificacoes.js
var express                 = require("express");
var router                  = express.Router();
var notificacaoController   = require("../controllers/notificacaoController");

// GET  /api/notificacoes/:usuarioId
router.get("/:usuarioId",               notificacaoController.listar);
router.patch("/:usuarioId/marcar-lidas", notificacaoController.marcarTodasLidas);

module.exports = router;
