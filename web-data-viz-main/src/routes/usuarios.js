var express = require("express");
var router = express.Router();
var usuarioController = require("../controllers/usuarioController");

// Mantém as rotas antigas usadas pelo login/cadastro
router.post("/cadastrar",  function (req, res) { usuarioController.cadastrar(req, res); });
router.post("/autenticar", function (req, res) { usuarioController.autenticar(req, res); });

// CRUD novo da tela Usuários
router.get("/",        function (req, res) { usuarioController.listar(req, res); });
router.get("/regioes/lista", function (req, res) { usuarioController.listarRegioes(req, res); });
router.get("/:id",     function (req, res) { usuarioController.buscarPorId(req, res); });
router.post("/",       function (req, res) { usuarioController.criar(req, res); });
router.put("/:id",     function (req, res) { usuarioController.atualizar(req, res); });
router.delete("/:id",  function (req, res) { usuarioController.deletar(req, res); });

module.exports = router;
