var muralModel = require("../models/muralModel");

/*
=========================================================
LISTAR AVISOS
=========================================================
*/

function listarAvisos(req, res) {
  muralModel
    .listarAvisos()

    .then(function (resultado) {
      res.json(resultado);
    })

    .catch(function (erro) {
      console.log(erro);

      res.status(500).json(erro);
    });
}

/*
=========================================================
PUBLICAR AVISO
=========================================================
*/

function publicarAviso(req, res) {
  var fkUsuario = req.body.fkUsuario;

  var tipo = req.body.tipo;

  var regiao = req.body.regiao;

  var titulo = req.body.titulo;

  var descricao = req.body.descricao;

  var pinned = req.body.pinned || 0;

  muralModel
    .publicarAviso(fkUsuario, tipo, regiao, titulo, descricao, pinned)

    .then(function (resultado) {
      res.json(resultado);
    })

    .catch(function (erro) {
      console.log(erro);

      res.status(500).json(erro);
    });
}

/*
=========================================================
DELETAR
=========================================================
*/

function deletarAviso(req, res) {
  var id = req.params.id;

  muralModel
    .deletarAviso(id)

    .then(function (resultado) {
      res.json(resultado);
    });
}

/*
=========================================================
CURTIR
=========================================================
*/

function curtirAviso(req, res) {
  var fkAviso = req.body.fkAviso;

  var fkUsuario = req.body.fkUsuario;

  muralModel
    .curtirAviso(fkAviso, fkUsuario)

    .then(function (resultado) {
      res.json(resultado);
    });
}

/*
=========================================================
COMENTAR
=========================================================
*/

function comentarAviso(req, res) {
  var fkAviso = req.body.fkAviso;

  var fkUsuario = req.body.fkUsuario;

  var texto = req.body.texto;

  muralModel
    .comentarAviso(fkAviso, fkUsuario, texto)

    .then(function (resultado) {
      res.json(resultado);
    });
}

/*
=========================================================
LISTAR COMENTÁRIOS
=========================================================
*/

function listarComentarios(req, res) {
  var idAviso = req.params.idAviso;

  muralModel
    .listarComentarios(idAviso)

    .then(function (resultado) {
      res.json(resultado);
    });
}

/*
=========================================================
CHAT
=========================================================
*/

function listarChat(req, res) {
  muralModel
    .listarChat()

    .then(function (resultado) {
      res.json(resultado);
    });
}

function enviarMensagem(req, res) {
  var fkUsuario = req.body.fkUsuario;

  var texto = req.body.texto;

  muralModel
    .enviarMensagem(fkUsuario, texto)

    .then(function (resultado) {
      res.json(resultado);
    });
}

module.exports = {
  listarAvisos,
  publicarAviso,
  deletarAviso,

  curtirAviso,

  comentarAviso,
  listarComentarios,

  listarChat,
  enviarMensagem,
};
