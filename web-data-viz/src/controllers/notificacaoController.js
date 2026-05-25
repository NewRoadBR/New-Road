// controllers/notificacaoController.js
var notificacaoModel = require("../models/notificacaoModel");

async function listar(req, res) {
    var fkUsuario = req.params.usuarioId;
    if (!fkUsuario) return res.status(400).send("ID do usuário obrigatório");

    try {
        var [notifs, contagem] = await Promise.all([
            notificacaoModel.listarPorUsuario(fkUsuario),
            notificacaoModel.contarNaoLidas(fkUsuario)
        ]);
        return res.status(200).json({ notificacoes: notifs, nao_lidas: contagem[0].total });
    } catch (erro) {
        return res.status(500).json({ erro: erro.message });
    }
}

async function marcarTodasLidas(req, res) {
    var fkUsuario = req.params.usuarioId;
    try {
        await notificacaoModel.marcarTodasLidas(fkUsuario);
        return res.status(200).json({ mensagem: "Notificações marcadas como lidas" });
    } catch (erro) {
        return res.status(500).json({ erro: erro.message });
    }
}

module.exports = { listar, marcarTodasLidas };
