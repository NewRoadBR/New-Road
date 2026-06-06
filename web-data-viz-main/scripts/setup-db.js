require("dotenv").config({ path: require("path").join(__dirname, "..", ".env.dev") });

var fs = require("fs");
var path = require("path");
var mysql = require("mysql2/promise");

var dbDir = path.join(__dirname, "..", "src", "database");

async function executarArquivo(conexao, nomeArquivo) {
    var conteudo = fs.readFileSync(path.join(dbDir, nomeArquivo), "utf8");
    console.log("Executando", nomeArquivo, "...");
    await conexao.query(conteudo);
    console.log("OK:", nomeArquivo);
}

async function main() {
    var config = {
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD,
        port: Number(process.env.DB_PORT || 3306),
        multipleStatements: true
    };

    console.log("Conectando em", config.host + ":" + config.port, "...");
    var conexao = await mysql.createConnection(config);

    console.log("Removendo banco antigo (se existir)...");
    await conexao.query("DROP DATABASE IF EXISTS newroad_db");

    await executarArquivo(conexao, "script-tabelas.sql");
    await executarArquivo(conexao, "apoio.sql");

    await conexao.changeUser({ database: "newroad_db" });

    var [[empresas]] = await conexao.query("SELECT COUNT(*) AS n FROM empresa");
    var [[usuarios]] = await conexao.query("SELECT COUNT(*) AS n FROM usuario");
    var [[obras]] = await conexao.query("SELECT COUNT(*) AS n FROM obra");
    var [[trafego]] = await conexao.query("SELECT COUNT(*) AS n FROM trafego_rodovia_historico");
    var [[avisos]] = await conexao.query("SELECT COUNT(*) AS n FROM aviso_mural");

    console.log("\n--- Banco newroad_db pronto ---");
    console.log("Empresas:", empresas.n);
    console.log("Usuarios:", usuarios.n);
    console.log("Obras:", obras.n);
    console.log("Trafego historico:", trafego.n);
    console.log("Avisos mural:", avisos.n);
    console.log("\nLogin de teste:");
    console.log("  Email: leandro@ccr.com");
    console.log("  Senha: 123456");
    console.log("  empresaId: 1");

    await conexao.end();
}

main().catch(function (erro) {
    console.error("Falha:", erro.message);
    process.exit(1);
});
