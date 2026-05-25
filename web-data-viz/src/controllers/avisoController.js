// controllers/avisoController.js
var avisoModel = require("../models/avisoModel");

async function listar(req, res) {
    try {
        var avisos = await avisoModel.listarTodos({ tipo: req.query.tipo });
        return res.status(200).json(avisos);
    } catch (erro) {
        return res.status(500).json({ erro: erro.message });
    }
}

async function cadastrar(req, res) {
    var { titulo, mensagem, tipo, fk_obra, fk_usuario } = req.body;
    if (!titulo)   return res.status(400).send("Título é obrigatório");
    if (!mensagem) return res.status(400).send("Mensagem é obrigatória");

    try {
        var r = await avisoModel.cadastrar({ titulo, mensagem, tipo, fk_obra, fk_usuario });
        return res.status(201).json({ id: r.insertId, mensagem: "Aviso publicado" });
    } catch (erro) {
        return res.status(500).json({ erro: erro.message });
    }
}

async function marcarLido(req, res) {
    try {
        await avisoModel.marcarComoLido(req.params.id);
        return res.status(200).json({ mensagem: "Aviso marcado como lido" });
    } catch (erro) {
        return res.status(500).json({ erro: erro.message });
    }
}

async function excluir(req, res) {
    try {
        await avisoModel.excluir(req.params.id);
        return res.status(200).json({ mensagem: "Aviso excluído" });
    } catch (erro) {
        return res.status(500).json({ erro: erro.message });
    }
}

module.exports = { listar, cadastrar, marcarLido, excluir };
