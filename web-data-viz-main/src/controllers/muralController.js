var muralModel = require("../models/muralModel");

function autorObj(row, prefix) {
    return {
        id: row[prefix + "Id"],
        initials: row[prefix + "Avatar"] || "",
        name: row[prefix + "Nome"] || "",
        role: row[prefix + "Role"] || "",
        color: row[prefix + "Cor"] || "#64748b",
        isMe: row[prefix + "IsMe"] === 1 || row[prefix + "IsMe"] === true
    };
}

function listarAvisos(req, res) {
    var idUsuario = parseInt(req.query.idUsuario) || 1;

    muralModel.listarAvisos(idUsuario)
        .then(function (avisos) {
            if (!avisos.length) return res.status(200).json([]);
            var ids = avisos.map(function (a) { return a.id; });

            return muralModel.listarComentarios(ids).then(function (comentarios) {
                var mapaComentarios = {};
                comentarios.forEach(function (c) {
                    if (!mapaComentarios[c.avisoId]) mapaComentarios[c.avisoId] = [];
                    mapaComentarios[c.avisoId].push({
                        id: c.id,
                        author: autorObj(c, "autor"),
                        text: c.texto,
                        time: c.criadoEm
                    });
                });

                var payload = avisos.map(function (a) {
                    return {
                        id: a.id,
                        pinned: a.pinned === 1,
                        tipo: a.tipo,
                        regiao: a.regiao,
                        title: a.titulo,
                        desc: a.descricao || "",
                        time: a.criadoEm,
                        likes: a.likes,
                        liked: a.liked === 1,
                        hasImg: a.hasImg === 1,
                        commentsOpen: false,
                        comments: mapaComentarios[a.id] || [],
                        author: {
                            id: a.autorId,
                            initials: a.autorAvatar || "",
                            name: a.autorNome || "",
                            role: a.autorRole || "",
                            color: a.autorCor || "#64748b",
                            isMe: a.autorIsMe === 1
                        }
                    };
                });

                res.status(200).json(payload);
            });
        })
        .catch(function (erro) {
            console.log("Erro ao listar avisos:", erro);
            res.status(500).json(erro.sqlMessage || erro.message);
        });
}

function criarAviso(req, res) {
    var dados = {
        fkUsuario: parseInt(req.body.idUsuario) || 1,
        tipo: req.body.tipo || "info",
        regiao: req.body.regiao || "Centro",
        titulo: (req.body.title || req.body.titulo || "").trim(),
        descricao: (req.body.desc || req.body.descricao || "").trim(),
        pinned: !!req.body.pinned,
        hasImg: !!req.body.hasImg
    };
    if (!dados.titulo) return res.status(400).send("Título é obrigatório");

    muralModel.criarAviso(dados)
        .then(function (r) { res.status(201).json({ id: r.insertId }); })
        .catch(function (erro) {
            console.log("Erro ao criar aviso:", erro);
            res.status(500).json(erro.sqlMessage || erro.message);
        });
}

function atualizarAviso(req, res) {
    var dados = {
        titulo: (req.body.title || req.body.titulo || "").trim(),
        descricao: (req.body.desc || req.body.descricao || "").trim(),
        tipo: req.body.tipo,
        regiao: req.body.regiao
    };
    if (!dados.titulo) return res.status(400).send("Título é obrigatório");

    muralModel.atualizarAviso(req.params.id, dados)
        .then(function () { res.status(200).json({ ok: true }); })
        .catch(function (erro) {
            console.log("Erro ao atualizar aviso:", erro);
            res.status(500).json(erro.sqlMessage || erro.message);
        });
}

function deletarAviso(req, res) {
    muralModel.deletarAviso(req.params.id)
        .then(function () { res.status(200).json({ ok: true }); })
        .catch(function (erro) {
            console.log("Erro ao deletar aviso:", erro);
            res.status(500).json(erro.sqlMessage || erro.message);
        });
}

function togglePin(req, res) {
    muralModel.togglePin(req.params.id)
        .then(function () { res.status(200).json({ ok: true }); })
        .catch(function (erro) {
            console.log("Erro ao alternar pin:", erro);
            res.status(500).json(erro.sqlMessage || erro.message);
        });
}

function curtir(req, res) {
    var idUsuario = parseInt(req.body.idUsuario) || 1;
    muralModel.toggleCurtida(req.params.id, idUsuario)
        .then(function (estado) { res.status(200).json(estado); })
        .catch(function (erro) {
            console.log("Erro ao curtir aviso:", erro);
            res.status(500).json(erro.sqlMessage || erro.message);
        });
}

function comentar(req, res) {
    var idUsuario = parseInt(req.body.idUsuario) || 1;
    var texto = (req.body.texto || req.body.text || "").trim();
    if (!texto) return res.status(400).send("Texto do comentário é obrigatório");

    muralModel.criarComentario(req.params.id, idUsuario, texto)
        .then(function (r) { res.status(201).json({ id: r.insertId }); })
        .catch(function (erro) {
            console.log("Erro ao comentar aviso:", erro);
            res.status(500).json(erro.sqlMessage || erro.message);
        });
}

function listarUsuariosMural(req, res) {
    muralModel.listarUsuariosMural()
        .then(function (resultado) {
            var mapped = resultado.map(function (u) {
                return {
                    id: u.id,
                    initials: u.initials || "",
                    name: u.name,
                    role: u.role || "",
                    color: u.color || "#64748b",
                    isMe: u.isMe === 1
                };
            });
            res.status(200).json(mapped);
        })
        .catch(function (erro) {
            console.log("Erro ao listar usuários do mural:", erro);
            res.status(500).json(erro.sqlMessage || erro.message);
        });
}

function listarChat(req, res) {
    muralModel.listarChat()
        .then(function (rows) {
            var mapped = rows.map(function (m) {
                return {
                    id: m.id,
                    text: m.text,
                    time: m.time,
                    author: autorObj(m, "autor")
                };
            });
            res.status(200).json(mapped);
        })
        .catch(function (erro) {
            console.log("Erro ao listar chat:", erro);
            res.status(500).json(erro.sqlMessage || erro.message);
        });
}

function enviarChat(req, res) {
    var idUsuario = parseInt(req.body.idUsuario) || 1;
    var texto = (req.body.texto || req.body.text || "").trim();
    if (!texto) return res.status(400).send("Mensagem é obrigatória");

    muralModel.enviarChat(idUsuario, texto)
        .then(function (r) { res.status(201).json({ id: r.insertId }); })
        .catch(function (erro) {
            console.log("Erro ao enviar chat:", erro);
            res.status(500).json(erro.sqlMessage || erro.message);
        });
}

module.exports = {
    listarAvisos,
    criarAviso,
    atualizarAviso,
    deletarAviso,
    togglePin,
    curtir,
    comentar,
    listarUsuariosMural,
    listarChat,
    enviarChat
};
