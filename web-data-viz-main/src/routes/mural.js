var express = require("express");

var router = express.Router();

var muralController = require("../controllers/muralController");

/*
=========================================================
AVISOS
=========================================================
*/

router.get("/listar", function (req, res) {
  muralController.listarAvisos(req, res);
});

router.post("/publicar", function (req, res) {
  muralController.publicarAviso(req, res);
});

router.delete("/deletar/:id", function (req, res) {
  muralController.deletarAviso(req, res);
});

/*
=========================================================
CURTIDAS
=========================================================
*/

router.post("/curtir", function (req, res) {
  muralController.curtirAviso(req, res);
});

/*
=========================================================
COMENTÁRIOS
=========================================================
*/

router.get("/comentarios/:idAviso", function (req, res) {
  muralController.listarComentarios(req, res);
});

router.post("/comentar", function (req, res) {
  muralController.comentarAviso(req, res);
});

/*
=========================================================
CHAT
=========================================================
*/

router.get("/chat", function (req, res) {
  muralController.listarChat(req, res);
});

router.post("/chat/enviar", function (req, res) {
  muralController.enviarMensagem(req, res);
});

module.exports = router;
