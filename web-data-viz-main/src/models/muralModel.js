var database = require("../database/config");

/*
=========================================================
LISTAR AVISOS
=========================================================
*/

function listarAvisos(empresaId) {
  var instrucaoSql = `

        SELECT

            aviso.id,
            aviso.fk_usuario AS fkUsuario,

            aviso.tipo,

            aviso.rodovia,

            aviso.titulo,

            aviso.descricao,

            aviso.pinned,

            aviso.likes,

            aviso.criado_em,

            usuario.nome,

            usuario.avatar,

            usuario.cor,
            usuario.fk_empresa AS empresaId,

            COALESCE(usuario.role, usuario.perfil, 'Operação') AS role,

            (
                SELECT COUNT(*)
                FROM aviso_comentario comentario
                WHERE comentario.fk_aviso = aviso.id
            ) AS total_comentarios

        FROM aviso_mural aviso

        JOIN usuario usuario
            ON usuario.id = aviso.fk_usuario

        WHERE usuario.fk_empresa = ?

        ORDER BY
            aviso.pinned DESC,
            aviso.criado_em DESC;

    `;

  return database.executar(instrucaoSql, [empresaId]);
}

/*
=========================================================
PUBLICAR AVISO
=========================================================
*/

function publicarAviso(fkUsuario, tipo, rodovia, titulo, descricao, pinned, empresaId) {
  var instrucaoSql = `

        INSERT INTO aviso_mural (

            fk_usuario,
            tipo,
            rodovia,
            titulo,
            descricao,
            pinned

        )

        SELECT

            ?,
            ?,
            ?,
            ?,
            ?,
            ?

        FROM usuario
        WHERE id = ?
          AND fk_empresa = ?;

    `;

  return database.executar(instrucaoSql, [
    fkUsuario,
    tipo,
    rodovia,
    titulo,
    descricao,
    pinned,
    fkUsuario,
    empresaId,
  ]);
}

function possuiPermissaoMural(idAviso, fkUsuarioSolicitante) {
  var instrucaoSql = `
        SELECT
            aviso.fk_usuario          AS autorId,
            autor.fk_empresa         AS autorEmpresaId,
            solicitante.id           AS solicitanteId,
            solicitante.fk_empresa   AS solicitanteEmpresaId,
            solicitante.perfil       AS solicitantePerfil,
            solicitante.role         AS solicitanteRole
        FROM aviso_mural aviso
        JOIN usuario autor
            ON autor.id = aviso.fk_usuario
        JOIN usuario solicitante
            ON solicitante.id = ?
        WHERE aviso.id = ?;
    `;

  return database.executar(instrucaoSql, [fkUsuarioSolicitante, idAviso])
    .then(function (rows) {
      if (!rows.length) throw new Error("Aviso não encontrado");

      var permissao = rows[0];
      var ehAutor = Number(permissao.autorId) === Number(fkUsuarioSolicitante);
      var ehGestorMesmaEmpresa =
        Number(permissao.autorEmpresaId) === Number(permissao.solicitanteEmpresaId) &&
        ((permissao.solicitantePerfil || "") === "Gestor" || /gestor/i.test(permissao.solicitanteRole || ""));

      if (!ehAutor && !ehGestorMesmaEmpresa) {
        throw new Error("Sem permissão para alterar este aviso");
      }

      return permissao;
    });
}

function editarAviso(idAviso, fkUsuarioSolicitante, dados) {
  return possuiPermissaoMural(idAviso, fkUsuarioSolicitante)
    .then(function () {
      var instrucaoSql = `
            UPDATE aviso_mural
            SET
                tipo = ?,
                rodovia = ?,
                titulo = ?,
                descricao = ?,
                pinned = ?
            WHERE id = ?;
        `;

      return database.executar(instrucaoSql, [
        dados.tipo,
        dados.rodovia,
        dados.titulo,
        dados.descricao,
        dados.pinned ? 1 : 0,
        idAviso
      ]);
    });
}

/*
=========================================================
DELETAR
=========================================================
*/

function deletarAviso(id, fkUsuarioSolicitante) {
  return possuiPermissaoMural(id, fkUsuarioSolicitante)
    .then(function () {
      var instrucaoSql = `

            DELETE FROM aviso_mural

            WHERE id = ?;

        `;

      return database.executar(instrucaoSql, [id]);
    });
}

/*
=========================================================
CURTIR
=========================================================
*/

function curtirAviso(fkAviso, fkUsuario, empresaId) {
  var instrucaoSql = `

  INSERT IGNORE INTO aviso_curtida (

            fk_aviso,
            fk_usuario

        )

        SELECT

            ?,
            ?

        FROM DUAL
        WHERE EXISTS (
            SELECT 1
            FROM aviso_mural aviso
            JOIN usuario autor
                ON autor.id = aviso.fk_usuario
            WHERE aviso.id = ?
              AND autor.fk_empresa = ?
        )
          AND EXISTS (
            SELECT 1
            FROM usuario curtidor
            WHERE curtidor.id = ?
              AND curtidor.fk_empresa = ?
        );

    `;

  return database
    .executar(instrucaoSql, [fkAviso, fkUsuario, fkAviso, empresaId, fkUsuario, empresaId])

    .then(function () {
      var atualizarLikes = `

            UPDATE aviso_mural

            SET likes = (

                SELECT COUNT(*)

                FROM aviso_curtida

                WHERE fk_aviso = ?

            )

            WHERE id = ?
              AND EXISTS (
                SELECT 1
                FROM usuario autor
                WHERE autor.id = aviso_mural.fk_usuario
                  AND autor.fk_empresa = ?
              );

        `;

      return database.executar(atualizarLikes, [fkAviso, fkAviso, empresaId]);
    });
}

/*
=========================================================
COMENTAR
=========================================================
*/

function comentarAviso(fkAviso, fkUsuario, texto, empresaId) {
  var instrucaoSql = `

        INSERT INTO aviso_comentario (

            fk_aviso,
            fk_usuario,
            texto

        )

        SELECT

            ?,
            ?,
            ?

        FROM DUAL
        WHERE EXISTS (
            SELECT 1
            FROM aviso_mural aviso
            JOIN usuario autor
                ON autor.id = aviso.fk_usuario
            WHERE aviso.id = ?
              AND autor.fk_empresa = ?
        )
          AND EXISTS (
            SELECT 1
            FROM usuario comentarista
            WHERE comentarista.id = ?
              AND comentarista.fk_empresa = ?
        );

    `;

  return database.executar(instrucaoSql, [
    fkAviso,
    fkUsuario,
    texto,
    fkAviso,
    empresaId,
    fkUsuario,
    empresaId,
  ]);
}

/*
=========================================================
LISTAR COMENTÁRIOS
=========================================================
*/

function listarComentarios(idAviso, empresaId) {
  var instrucaoSql = `

        SELECT

            comentario.id,
          comentario.fk_usuario AS fkUsuario,

            comentario.texto,

            comentario.criado_em,

            usuario.nome,

            usuario.avatar,

            usuario.cor,

            usuario.fk_empresa AS empresaId

        FROM aviso_comentario comentario

        JOIN usuario usuario
            ON usuario.id = comentario.fk_usuario

        JOIN aviso_mural aviso
          ON aviso.id = comentario.fk_aviso

        JOIN usuario autor
          ON autor.id = aviso.fk_usuario

        WHERE comentario.fk_aviso = ?
          AND autor.fk_empresa = ?

        ORDER BY comentario.criado_em ASC;

    `;

  return database.executar(instrucaoSql, [idAviso, empresaId]);
}

function fixarAviso(idAviso, fkUsuarioSolicitante, pinned) {
  var permissaoSql = `
        SELECT
            aviso.id,
            aviso.fk_usuario        AS autorId,
            autor.fk_empresa             AS autorEmpresaId,
            solicitante.fk_empresa       AS solicitanteEmpresaId,
            solicitante.perfil           AS solicitantePerfil,
            solicitante.role             AS solicitanteRole
        FROM aviso_mural aviso
        JOIN usuario autor
            ON autor.id = aviso.fk_usuario
        JOIN usuario solicitante
            ON solicitante.id = ?
        WHERE aviso.id = ?;
    `;

  return database.executar(permissaoSql, [fkUsuarioSolicitante, idAviso])
    .then(function (rows) {
      if (!rows.length) throw new Error("Aviso não encontrado");

      var permissao = rows[0];
      var ehAutor = Number(permissao.autorId) === Number(fkUsuarioSolicitante);
      var ehGestorMesmaEmpresa =
        Number(permissao.autorEmpresaId) === Number(permissao.solicitanteEmpresaId) &&
        ((permissao.solicitantePerfil || "") === "Gestor" || /gestor/i.test(permissao.solicitanteRole || ""));

      if (!ehAutor && !ehGestorMesmaEmpresa) {
        throw new Error("Sem permissão para fixar este aviso");
      }

      return database.executar(
        `UPDATE aviso_mural SET pinned = ? WHERE id = ?;`,
        [pinned ? 1 : 0, idAviso]
      );
    });
}

/*
=========================================================
CHAT
=========================================================
*/

function listarChat(empresaId) {
  var instrucaoSql = `

        SELECT

            chat.id,

            chat.fk_usuario AS fkUsuario,

            chat.texto,

            chat.criado_em,

            usuario.nome,

            usuario.avatar,

            usuario.cor

        FROM mural_chat chat

        JOIN usuario usuario
            ON usuario.id = chat.fk_usuario

        WHERE usuario.fk_empresa = ?

        ORDER BY chat.criado_em DESC

        LIMIT 30;

    `;

  return database.executar(instrucaoSql, [empresaId]);
}

/*
=========================================================
ENVIAR CHAT
=========================================================
*/

function enviarMensagem(fkUsuario, texto, empresaId) {
  var instrucaoSql = `

        INSERT INTO mural_chat (

            fk_usuario,
            texto

        )

        SELECT

            ?,
            ?

        FROM usuario
        WHERE id = ?
          AND fk_empresa = ?;

    `;

  return database.executar(instrucaoSql, [fkUsuario, texto, fkUsuario, empresaId]);
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
