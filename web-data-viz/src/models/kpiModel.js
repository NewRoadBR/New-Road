// models/kpiModel.js
var database = require("../database/config");

function historico(meses) {
    var limite = meses || 6;
    var sql = `
        SELECT DATE_FORMAT(mes, '%b/%Y') AS label,
               obras_concluidas, obras_em_andamento, obras_planejadas,
               orcamento_gasto, orcamento_total
        FROM kpi_mensal
        ORDER BY mes DESC
        LIMIT ?
    `;
    // Retorna em ordem cronológica para os gráficos
    return database.executar(sql, [limite]).then(function (rows) {
        return rows.reverse();
    });
}

module.exports = { historico };
