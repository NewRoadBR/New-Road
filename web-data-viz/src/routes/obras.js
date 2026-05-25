// routes/obras.js
var express        = require("express");
var router         = express.Router();
var obraController = require("../controllers/obraController");

// GET    /api/obras?regiao=norte&status=em_andamento&busca=paulista&page=1&limit=20
router.get("/",         obraController.listar);

// GET    /api/obras/resumo  — KPIs para dashboard/página de obras
router.get("/resumo",   obraController.resumo);

// GET    /api/obras/mapa?regiao=leste  — somente obras com lat/lng
router.get("/mapa",     obraController.paraMapa);

// GET    /api/obras/:id
router.get("/:id",      obraController.buscarPorId);

// POST   /api/obras
router.post("/",        obraController.cadastrar);

// PUT    /api/obras/:id
router.put("/:id",      obraController.atualizar);

// PATCH  /api/obras/:id/progresso  — atualiza só o progresso
router.patch("/:id/progresso", obraController.atualizarProgresso);

// DELETE /api/obras/:id
router.delete("/:id",   obraController.excluir);

module.exports = router;