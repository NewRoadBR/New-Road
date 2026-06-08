var notificacaoModel = require("../models/notificacaoModel");
var preferenciaModel = require("../models/preferenciaModel");

function listar(req, res) {
    var limite = parseInt(req.query.limit, 10);
    if (!Number.isInteger(limite) || limite <= 0) limite = 20;
    if (limite > 50) limite = 50;

    var idUsuario = parseInt(req.query.idUsuario, 10);
    if (!Number.isInteger(idUsuario) || idUsuario <= 0) idUsuario = 1;

    preferenciaModel.notificacoesEtlHabilitadas(idUsuario)
        .then(function (habilitado) {
            if (!habilitado) {
                return res.status(200).json({
                    habilitado: false,
                    notificacoes: []
                });
            }

            return notificacaoModel.listarRecentes(limite).then(function (rows) {
                var lista = (rows || []).map(function (item) {
                    return {
                        id: item.id,
                        titulo: item.titulo,
                        mensagem: item.mensagem,
                        tipo: item.tipo,
                        dataCriacao: item.dataCriacao,
                        visualizada: item.visualizada === 1 || item.visualizada === true
                    };
                });

                res.status(200).json({
                    habilitado: true,
                    notificacoes: lista
                });
            });
        })
        .catch(function (erro) {
            console.log("Erro ao listar notificações:", erro);
            res.status(500).json({
                erro: erro.sqlMessage || erro.message || "Erro ao listar notificações"
            });
        });
}

module.exports = {
    listar: listar
};
