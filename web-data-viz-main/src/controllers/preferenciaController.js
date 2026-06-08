var preferenciaModel = require("../models/preferenciaModel");

var DEFAULT = {
    idUsuario: null,
    intervalo: "1 minuto",
    regiaoPadrao: "SP Region (todas)",
    notifEtl: true,
    darkMode: false
};

function buscar(req, res) {
    var idUsuario = parseInt(req.params.idUsuario);
    if (!idUsuario) return res.status(400).send("idUsuario inválido");

    preferenciaModel.buscarPorUsuario(idUsuario)
        .then(function (rows) {
            if (!rows.length) {
                return res.status(200).json({
                    idUsuario: idUsuario,
                    intervalo: DEFAULT.intervalo,
                    regiaoPadrao: null,
                    notifEtl: DEFAULT.notifEtl,
                    darkMode: DEFAULT.darkMode
                });
            }
            var p = rows[0];
            res.status(200).json({
                idUsuario: p.idUsuario,
                intervalo: p.intervalo,
                regiaoPadrao: p.regiaoPadrao || DEFAULT.regiaoPadrao,
                notifEtl: p.notifEtl === 1,
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
        regiaoPadrao: req.body.regiaoPadrao || DEFAULT.regiaoPadrao,
        notifEtl: req.body.notifEtl !== false,
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
