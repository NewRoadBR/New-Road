var database = require("../database/config");

/*
=========================================================
LISTAR AVISOS
=========================================================
*/

function listarAvisos() {
  var instrucaoSql = `

        SELECT

            aviso.id,

            aviso.tipo,

            aviso.regiao,

            aviso.titulo,

            aviso.descricao,

            aviso.pinned,

            aviso.likes,

            aviso.criado_em,

            usuario.nome,

            usuario.avatar,

            usuario.cor,

            usuario.role,

            (
                SELECT COUNT(*)
                FROM aviso_comentario comentario
                WHERE comentario.fk_aviso = aviso.id
            ) AS total_comentarios

        FROM aviso_mural aviso

        JOIN usuario usuario
            ON usuario.id = aviso.fk_usuario

        ORDER BY
            aviso.pinned DESC,
            aviso.criado_em DESC;

    `;

  return database.executar(instrucaoSql);
}

/*
=========================================================
PUBLICAR AVISO
=========================================================
*/

function publicarAviso(fkUsuario, tipo, regiao, titulo, descricao, pinned) {
  var instrucaoSql = `

        INSERT INTO aviso_mural (

            fk_usuario,
            tipo,
            regiao,
            titulo,
            descricao,
            pinned

        )

        VALUES (

            ?,
            ?,
            ?,
            ?,
            ?,
            ?

        );

    `;

  return database.executar(instrucaoSql, [
    fkUsuario,
    tipo,
    regiao,
    titulo,
    descricao,
    pinned,
  ]);
}

/*
=========================================================
DELETAR
=========================================================
*/

function deletarAviso(id) {
  var instrucaoSql = `

        DELETE FROM aviso_mural

        WHERE id = ?;

    `;

  return database.executar(instrucaoSql, [id]);
}

/*
=========================================================
CURTIR
=========================================================
*/

function curtirAviso(fkAviso, fkUsuario) {
  var instrucaoSql = `

        INSERT IGNORE INTO aviso_curtida (

            fk_aviso,
            fk_usuario

        )

        VALUES (

            ?,
            ?

        );

    `;

  return database
    .executar(instrucaoSql, [fkAviso, fkUsuario])

    .then(function () {
      var atualizarLikes = `

            UPDATE aviso_mural

            SET likes = (

                SELECT COUNT(*)

                FROM aviso_curtida

                WHERE fk_aviso = ?

            )

            WHERE id = ?;

        `;

      return database.executar(atualizarLikes, [fkAviso, fkAviso]);
    });
}

/*
=========================================================
COMENTAR
=========================================================
*/

function comentarAviso(fkAviso, fkUsuario, texto) {
  var instrucaoSql = `

        INSERT INTO aviso_comentario (

            fk_aviso,
            fk_usuario,
            texto

        )

        VALUES (

            ?,
            ?,
            ?

        );

    `;

  return database.executar(instrucaoSql, [fkAviso, fkUsuario, texto]);
}

/*
=========================================================
LISTAR COMENTÁRIOS
=========================================================
*/

function listarComentarios(idAviso) {
  var instrucaoSql = `

        SELECT

            comentario.id,

            comentario.texto,

            comentario.criado_em,

            usuario.nome,

            usuario.avatar,

            usuario.cor

        FROM aviso_comentario comentario

        JOIN usuario usuario
            ON usuario.id = comentario.fk_usuario

        WHERE comentario.fk_aviso = ?

        ORDER BY comentario.criado_em ASC;

    `;

  return database.executar(instrucaoSql, [idAviso]);
}

/*
=========================================================
CHAT
=========================================================
*/

function listarChat() {
  var instrucaoSql = `

        SELECT

            chat.id,

            chat.texto,

            chat.criado_em,

            usuario.nome,

            usuario.avatar,

            usuario.cor

        FROM mural_chat chat

        JOIN usuario usuario
            ON usuario.id = chat.fk_usuario

        ORDER BY chat.criado_em DESC

        LIMIT 30;

    `;

  return database.executar(instrucaoSql);
}

/*
=========================================================
ENVIAR CHAT
=========================================================
*/

function enviarMensagem(fkUsuario, texto) {
  var instrucaoSql = `

        INSERT INTO mural_chat (

            fk_usuario,
            texto

        )

        VALUES (

            ?,
            ?

        );

    `;

  return database.executar(instrucaoSql, [fkUsuario, texto]);
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
