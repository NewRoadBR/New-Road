require("dotenv").config({ path: require("path").join(__dirname, "..", ".env.dev") });

var database = require("../src/database/config");

async function migrar() {
    var cols = await database.executar("SHOW COLUMNS FROM obra LIKE 'fk_empresa'");

    if (!cols.length) {
        await database.executar(
            "ALTER TABLE obra ADD COLUMN fk_empresa INT UNSIGNED NULL AFTER grau_urgencia"
        );
        console.log("Coluna fk_empresa adicionada em obra.");
    } else {
        console.log("Coluna fk_empresa ja existe.");
    }

    var indices = await database.executar("SHOW INDEX FROM obra WHERE Key_name = 'idx_obra_empresa'");
    if (!indices.length) {
        await database.executar("ALTER TABLE obra ADD INDEX idx_obra_empresa (fk_empresa)");
        console.log("Indice idx_obra_empresa criado.");
    }

    var atualizado = await database.executar(
        "UPDATE obra SET fk_empresa = 1 WHERE fk_empresa IS NULL"
    );
    console.log("Obras vinculadas a empresa 1:", atualizado.affectedRows || 0);

    var total = await database.executar(
        "SELECT COUNT(*) AS n FROM obra WHERE fk_empresa = 1"
    );
    console.log("Total obras empresa 1:", total[0].n);
}

migrar().catch(function (erro) {
    console.error("Falha na migracao:", erro.sqlMessage || erro.message || erro);
    process.exit(1);
});
