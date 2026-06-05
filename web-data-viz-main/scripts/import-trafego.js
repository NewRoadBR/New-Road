require("dotenv").config({ path: ".env" });
require("dotenv").config({ path: ".env.dev", override: true });

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

(async () => {
  const sqlPath = path.join(__dirname, "..", "src", "database", "apoio.sql");
  const content = fs.readFileSync(sqlPath, "utf8");

  const match = content.match(
    /INSERT INTO `trafego_rodovia_historico` VALUES[\s\S]*?;/
  );

  if (!match) {
    console.error("INSERT de trafego nao encontrado em apoio.sql");
    process.exit(1);
  }

  const insertSql = match[0];

  const c = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    multipleStatements: true,
  });

  const [[before]] = await c.query(
    "SELECT COUNT(*) AS n FROM trafego_rodovia_historico"
  );
  console.log("Antes:", before.n, "registros");

  if (before.n > 0) {
    console.log("Tabela ja possui dados. Nada a importar.");
    await c.end();
    return;
  }

  await c.query(insertSql);

  const [[after]] = await c.query(
    "SELECT COUNT(*) AS n FROM trafego_rodovia_historico"
  );
  const [[anhanguera]] = await c.query(
    "SELECT COUNT(*) AS n FROM vw_fluxo_medio WHERE rodovia = 'Rodovia Anhanguera'"
  );

  console.log("Depois:", after.n, "registros");
  console.log("vw_fluxo_medio Anhanguera:", anhanguera.n);

  await c.end();
})().catch((err) => {
  console.error("ERRO:", err.message);
  process.exit(1);
});
