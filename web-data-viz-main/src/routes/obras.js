var express = require("express");

var router = express.Router();

var obrasController =
    require("../controllers/obrasController");

router.get(
    "/",
    obrasController.listar
);

router.get(
    "/rodovia/:rodovia",
    obrasController.listarPorRodovia
);

router.get(
    "/:id",
    obrasController.buscarPorId
);

router.post(
    "/",
    obrasController.cadastrar
);

router.put(
    "/:id",
    obrasController.atualizar
);


router.delete(
    "/:id",
    obrasController.deletar
);



module.exports = router;