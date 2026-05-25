// routes/avisos.js
var express         = require("express");
var router          = express.Router();
var avisoController = require("../controllers/avisoController");

router.get("/",             avisoController.listar);
router.post("/",            avisoController.cadastrar);
router.patch("/:id/lido",   avisoController.marcarLido);
router.delete("/:id",       avisoController.excluir);

module.exports = router;
