// var ambiente_processo = 'producao';
var ambiente_processo = 'desenvolvimento';

var caminho_env =
    ambiente_processo === 'producao'
        ? '.env'
        : '.env.dev';

require("dotenv").config({
    path: caminho_env
});

const express = require("express");

const cors = require("cors");

const path = require("path");

const app = express();

const PORTA_APP = process.env.APP_PORT || 3333;

const HOST_APP = process.env.APP_HOST || "0.0.0.0";

/*
=========================================================
ROUTES
=========================================================
*/

const indexRouter =
    require("./src/routes/index");

const usuarioRouter =
    require("./src/routes/usuarios");

const obrasRouter =
    require("./src/routes/obras");

const dashboardRouter =
    require("./src/routes/dashboard");

const muralRouter =
    require("./src/routes/mural");

const preferenciasRouter =
    require("./src/routes/preferencias");

const empresasRouter =
    require("./src/routes/empresas");

/*
=========================================================
MIDDLEWARES
=========================================================
*/

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: false
}));

app.use(express.static(
    path.join(__dirname, "public")
));

/*
=========================================================
ROTAS
=========================================================
*/

app.use("/", indexRouter);

app.use("/usuarios", usuarioRouter);

app.use("/obras", obrasRouter);

app.use("/dashboard", dashboardRouter);

app.use("/mural", muralRouter);

app.use("/preferencias", preferenciasRouter);

app.use("/empresas", empresasRouter);

/*
=========================================================
SERVER
=========================================================
*/

app.listen(PORTA_APP, function () {

    console.log(`

=========================================================
NEWROAD SERVER
=========================================================

Servidor rodando em:

http://${HOST_APP}:${PORTA_APP}

Ambiente:
${process.env.AMBIENTE_PROCESSO}

=========================================================

`);

});