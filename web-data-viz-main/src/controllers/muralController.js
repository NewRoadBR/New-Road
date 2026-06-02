var muralModel = require("../models/muralModel");

function obterEmpresaId(req, res) {
  var empresaId = Number(req.query.empresaId);

  if (!Number.isInteger(empresaId) || empresaId <= 0) {
    res.status(400).send("empresaId inválido");
    return null;
  }

  return empresaId;
}

/*
=========================================================
LISTAR AVISOS
=========================================================
*/

function listarAvisos(req, res) {
  var empresaId = obterEmpresaId(req, res);
  if (!empresaId) return;

  muralModel
    .listarAvisos(empresaId)

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
  var empresaId = obterEmpresaId(req, res);
  if (!empresaId) return;

  var fkUsuario = req.body.fkUsuario;

  var tipo = req.body.tipo;

  var rodovia = req.body.rodovia;

  var titulo = req.body.titulo;

  var descricao = req.body.descricao;

  var pinned = req.body.pinned || 0;

  muralModel
    .publicarAviso(fkUsuario, tipo, rodovia, titulo, descricao, pinned, empresaId)

    .then(function (resultado) {
      res.json(resultado);
    })

    .catch(function (erro) {
      console.log(erro);

      res.status(500).json(erro);
    });
}

function editarAviso(req, res) {
  var idAviso = req.params.id;
  var fkUsuarioSolicitante = req.body.fkUsuario;

  muralModel
    .editarAviso(idAviso, fkUsuarioSolicitante, req.body)
    .then(function (resultado) {
      res.json(resultado);
    })
    .catch(function (erro) {
      console.log(erro);
      res.status(500).json({ erro: erro.message || erro });
    });
}

/*
=========================================================
DELETAR
=========================================================
*/

function deletarAviso(req, res) {
  var id = req.params.id;
  var fkUsuario = req.body.fkUsuario;

  muralModel
    .deletarAviso(id, fkUsuario)

    .then(function (resultado) {
      res.json(resultado);
    })
    .catch(function (erro) {
      console.log(erro);
      res.status(500).json({ erro: erro.message || erro });
    });
}

/*
=========================================================
CURTIR
=========================================================
*/

function curtirAviso(req, res) {
  var empresaId = obterEmpresaId(req, res);
  if (!empresaId) return;

  var fkAviso = req.body.fkAviso;

  var fkUsuario = req.body.fkUsuario;

  muralModel
    .curtirAviso(fkAviso, fkUsuario, empresaId)

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
  var empresaId = obterEmpresaId(req, res);
  if (!empresaId) return;

  var fkAviso = req.body.fkAviso;

  var fkUsuario = req.body.fkUsuario;

  var texto = req.body.texto;

  muralModel
    .comentarAviso(fkAviso, fkUsuario, texto, empresaId)

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
  var empresaId = obterEmpresaId(req, res);
  if (!empresaId) return;

  var idAviso = req.params.idAviso;

  muralModel
    .listarComentarios(idAviso, empresaId)

    .then(function (resultado) {
      res.json(resultado);
    });
}

function fixarAviso(req, res) {
  muralModel
    .fixarAviso(req.params.id, req.body.fkUsuario, req.body.pinned)
    .then(function (resultado) {
      res.json(resultado);
    })
    .catch(function (erro) {
      console.log(erro);
      res.status(500).json({ erro: erro.message || erro });
    });
}

/*
=========================================================
CHAT
=========================================================
*/

function listarChat(req, res) {
  var empresaId = obterEmpresaId(req, res);
  if (!empresaId) return;

  muralModel
    .listarChat(empresaId)

    .then(function (resultado) {
      res.json(resultado);
    });
}

function enviarMensagem(req, res) {
  var empresaId = obterEmpresaId(req, res);
  if (!empresaId) return;

  var fkUsuario = req.body.fkUsuario;

  var texto = req.body.texto;

  muralModel
    .enviarMensagem(fkUsuario, texto, empresaId)

    .then(function (resultado) {
      res.json(resultado);
    });
}

module.exports = {
  listarAvisos,
  publicarAviso,
  editarAviso,
  fixarAviso,
  deletarAviso,

  curtirAviso,

  comentarAviso,
  listarComentarios,

  listarChat,
  enviarMensagem,
};
