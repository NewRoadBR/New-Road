var preferenciaModel = require("../models/preferenciaModel");

var DEFAULT = {
    idUsuario: null,
    intervalo: "1 minuto",
    notifCritica: true,
    notifPico: true,
    notifRelatorio: true,
    darkMode: false
};

function buscar(req, res) {
    var idUsuario = parseInt(req.params.idUsuario);
    if (!idUsuario) return res.status(400).send("idUsuario inválido");

    preferenciaModel.buscarPorUsuario(idUsuario)
        .then(function (rows) {
            if (!rows.length) {
                return res.status(200).json(Object.assign({}, DEFAULT, { idUsuario: idUsuario }));
            }
            var p = rows[0];
            res.status(200).json({
                idUsuario: p.idUsuario,
                intervalo: p.intervalo,
                notifCritica: p.notifCritica === 1,
                notifPico: p.notifPico === 1,
                notifRelatorio: p.notifRelatorio === 1,
                darkMode: p.darkMode === 1
            });
        })
        .catch(function (erro) {
            console.log("Erro ao buscar preferências:", erro);
            res.status(500).json(erro.sqlMessage || erro.message);
        });
}

function salvar(req, res) {
    var idUsuario = parseInt(req.params.idUsuario);
    if (!idUsuario) return res.status(400).send("idUsuario inválido");

    var dados = {
        intervalo: req.body.intervalo || DEFAULT.intervalo,
        notifCritica: !!req.body.notifCritica,
        notifPico: !!req.body.notifPico,
        notifRelatorio: !!req.body.notifRelatorio,
        darkMode: !!req.body.darkMode
    };

    preferenciaModel.salvar(idUsuario, dados)
        .then(function () { res.status(200).json(Object.assign({ idUsuario: idUsuario }, dados)); })
        .catch(function (erro) {
            console.log("Erro ao salvar preferências:", erro);
            res.status(500).json(erro.sqlMessage || erro.message);
        });
}

module.exports = { buscar, salvar };
