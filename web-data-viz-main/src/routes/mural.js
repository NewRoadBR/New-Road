var express = require("express");
var router = express.Router();
var muralController = require("../controllers/muralController");

// avisos
router.get("/avisos",                  function (req, res) { muralController.listarAvisos(req, res); });
router.post("/avisos",                 function (req, res) { muralController.criarAviso(req, res); });
router.put("/avisos/:id",              function (req, res) { muralController.atualizarAviso(req, res); });
router.delete("/avisos/:id",           function (req, res) { muralController.deletarAviso(req, res); });
router.post("/avisos/:id/pin",         function (req, res) { muralController.togglePin(req, res); });
router.post("/avisos/:id/curtir",      function (req, res) { muralController.curtir(req, res); });
router.post("/avisos/:id/comentarios", function (req, res) { muralController.comentar(req, res); });

// usuários do mural
router.get("/usuarios",                function (req, res) { muralController.listarUsuariosMural(req, res); });

// chat
router.get("/chat",                    function (req, res) { muralController.listarChat(req, res); });
router.post("/chat",                   function (req, res) { muralController.enviarChat(req, res); });

module.exports = router;
