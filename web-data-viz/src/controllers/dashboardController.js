// controllers/dashboardController.js
var obraModel        = require("../models/obraModel");
var kpiModel         = require("../models/kpiModel");
var notificacaoModel = require("../models/notificacaoModel");

// GET /api/dashboard
// Retorna tudo que a tela inicial precisa em uma única chamada
async function getDashboard(req, res) {
    try {
        var [resumo, obras, kpis] = await Promise.all([
            obraModel.resumo(),
            obraModel.paraMapa(req.query.regiao),
            kpiModel.historico(6)
        ]);

        return res.status(200).json({
            resumo:    resumo[0],
            obras:     obras,
            kpis:      kpis
        });
    } catch (erro) {
        console.error("Erro no dashboard:", erro);
        return res.status(500).json({ erro: "Erro interno", detalhe: erro.message });
    }
}

module.exports = { getDashboard };
