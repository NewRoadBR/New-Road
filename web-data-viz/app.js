// var ambiente_processo = 'producao';
var ambiente_processo = 'desenvolvimento';

var caminho_env = ambiente_processo === 'producao' ? '.env' : '.env.dev';
require("dotenv").config({ path: caminho_env });

var express = require("express");
var cors    = require("cors");
var path    = require("path");

var PORTA_APP = process.env.APP_PORT;
var HOST_APP  = process.env.APP_HOST;

var app = express();

// ── Rotas ─────────────────────────────────────────────────────
var indexRouter        = require("./src/routes/index");
var usuarioRouter      = require("./src/routes/usuarios");
var avisosRouter       = require("./src/routes/avisos");
var medidasRouter      = require("./src/routes/medidas");
var empresasRouter     = require("./src/routes/empresas");
var dashboardRouter    = require("./src/routes/dashboard");
var obrasRouter        = require("./src/routes/obras");        // ← atualizado
var notificacoesRouter = require("./src/routes/notificacoes");

// ── Middlewares ───────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

// ── Rotas legadas ─────────────────────────────────────────────
app.use("/",         indexRouter);
app.use("/usuarios", usuarioRouter);
app.use("/avisos",   avisosRouter);
app.use("/medidas",  medidasRouter);
app.use("/empresas", empresasRouter);

// ── Rotas /api ────────────────────────────────────────────────
app.use("/api/dashboard",    dashboardRouter);
app.use("/api/obras",        obrasRouter);        // ← rotas novas incluídas
app.use("/api/avisos",       avisosRouter);
app.use("/api/notificacoes", notificacoesRouter);
app.use("/api/usuarios",     usuarioRouter);      // ← adicionado (usado no frontend)
app.use("/api/empresas",     empresasRouter);     // ← adicionado (usado no modal de obras)

app.listen(PORTA_APP, HOST_APP, () => {
    console.log(`Servidor rodando em http://${HOST_APP}:${PORTA_APP}`);
});

module.exports = app;
app.listen(PORTA_APP, function () {
    console.log(`
    ##   ##  ######   #####             ####       ##     ######     ##              ##  ##    ####    ######  
    ##   ##  ##       ##  ##            ## ##     ####      ##      ####             ##  ##     ##         ##  
    ##   ##  ##       ##  ##            ##  ##   ##  ##     ##     ##  ##            ##  ##     ##        ##   
    ## # ##  ####     #####    ######   ##  ##   ######     ##     ######   ######   ##  ##     ##       ##    
    #######  ##       ##  ##            ##  ##   ##  ##     ##     ##  ##            ##  ##     ##      ##     
    ### ###  ##       ##  ##            ## ##    ##  ##     ##     ##  ##             ####      ##     ##      
    ##   ##  ######   #####             ####     ##  ##     ##     ##  ##              ##      ####    ######  
    \n\n\n                                                                                                 
    Servidor do seu site já está rodando! Acesse o caminho a seguir para visualizar .: http://${HOST_APP}:${PORTA_APP} :. \n\n
    Você está rodando sua aplicação em ambiente de .:${process.env.AMBIENTE_PROCESSO}:. \n\n
    \tSe .:desenvolvimento:. você está se conectando ao banco local. \n
    \tSe .:producao:. você está se conectando ao banco remoto. \n\n
    \t\tPara alterar o ambiente, comente ou descomente as linhas 1 ou 2 no arquivo 'app.js'\n\n`);
});
