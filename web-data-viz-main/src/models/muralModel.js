var database = require("../database/config");

// ─────── AVISOS ───────
function listarAvisos(idUsuario) {
    var sql = `
        SELECT
            a.id,
            a.tipo,
            a.regiao,
            a.titulo,
            a.descricao,
            a.pinned,
            a.has_img    AS hasImg,
            a.likes,
            a.criado_em  AS criadoEm,
            a.fk_usuario AS autorId,
            u.nome       AS autorNome,
            u.avatar     AS autorAvatar,
            u.cor        AS autorCor,
            u.role       AS autorRole,
            (u.id = ?)   AS autorIsMe,
            EXISTS(
                SELECT 1 FROM aviso_curtida c WHERE c.fk_aviso = a.id AND c.fk_usuario = ?
            )            AS liked
        FROM aviso_mural a
        INNER JOIN usuario u ON u.id = a.fk_usuario
        ORDER BY a.pinned DESC, a.criado_em DESC;
    `;
    return database.executar(sql, [idUsuario, idUsuario]);
}

function listarComentarios(idsAvisos) {
    if (!idsAvisos.length) return Promise.resolve([]);
    var placeholders = idsAvisos.map(function () { return "?"; }).join(",");
    var sql = `
        SELECT
            c.id,
            c.fk_aviso  AS avisoId,
            c.texto,
            c.criado_em AS criadoEm,
            u.id        AS autorId,
            u.nome      AS autorNome,
            u.avatar    AS autorAvatar,
            u.cor       AS autorCor,
            u.role      AS autorRole,
            u.is_me     AS autorIsMe
        FROM aviso_comentario c
        INNER JOIN usuario u ON u.id = c.fk_usuario
        WHERE c.fk_aviso IN (${placeholders})
        ORDER BY c.criado_em ASC;
    `;
    return database.executar(sql, idsAvisos);
}

function criarAviso(dados) {
    var sql = `
        INSERT INTO aviso_mural
            (fk_usuario, tipo, regiao, titulo, descricao, pinned, has_img)
        VALUES (?, ?, ?, ?, ?, ?, ?);
    `;
    return database.executar(sql, [
        dados.fkUsuario,
        dados.tipo,
        dados.regiao,
        dados.titulo,
        dados.descricao,
        dados.pinned ? 1 : 0,
        dados.hasImg ? 1 : 0
    ]);
}

function atualizarAviso(id, dados) {
    var sql = `
        UPDATE aviso_mural
        SET titulo = ?, descricao = ?, tipo = ?, regiao = ?
        WHERE id = ?;
    `;
    return database.executar(sql, [dados.titulo, dados.descricao, dados.tipo, dados.regiao, id]);
}

function deletarAviso(id) {
    return database.executar(`DELETE FROM aviso_mural WHERE id = ?;`, [id]);
}

function togglePin(id) {
    var sql = `UPDATE aviso_mural SET pinned = NOT pinned WHERE id = ?;`;
    return database.executar(sql, [id]);
}

// ─────── CURTIDAS ───────
function toggleCurtida(idAviso, idUsuario) {
    // se já existe, remove; senão insere; retorna estado final
    var checar = `SELECT 1 FROM aviso_curtida WHERE fk_aviso = ? AND fk_usuario = ?;`;
    return database.executar(checar, [idAviso, idUsuario]).then(function (r) {
        if (r.length) {
            return database.executar(
                `DELETE FROM aviso_curtida WHERE fk_aviso = ? AND fk_usuario = ?;`,
                [idAviso, idUsuario]
            ).then(function () {
                return database.executar(
                    `UPDATE aviso_mural SET likes = GREATEST(likes - 1, 0) WHERE id = ?;`,
                    [idAviso]
                );
            }).then(function () { return { liked: false }; });
        }
        return database.executar(
            `INSERT INTO aviso_curtida (fk_aviso, fk_usuario) VALUES (?, ?);`,
            [idAviso, idUsuario]
        ).then(function () {
            return database.executar(
                `UPDATE aviso_mural SET likes = likes + 1 WHERE id = ?;`,
                [idAviso]
            );
        }).then(function () { return { liked: true }; });
    }).then(function (estado) {
        return database.executar(`SELECT likes FROM aviso_mural WHERE id = ?;`, [idAviso])
            .then(function (rows) { estado.likes = rows[0] ? rows[0].likes : 0; return estado; });
    });
}

// ─────── COMENTÁRIOS ───────
function criarComentario(idAviso, idUsuario, texto) {
    var sql = `INSERT INTO aviso_comentario (fk_aviso, fk_usuario, texto) VALUES (?, ?, ?);`;
    return database.executar(sql, [idAviso, idUsuario, texto]);
}

// ─────── USUÁRIOS DO MURAL ───────
function listarUsuariosMural() {
    var sql = `
        SELECT
            id,
            avatar    AS initials,
            nome      AS name,
            role,
            cor       AS color,
            is_me     AS isMe
        FROM usuario
        ORDER BY id;
    `;
    return database.executar(sql);
}

// ─────── CHAT ───────
function listarChat() {
    var sql = `
        SELECT
            m.id,
            m.texto       AS text,
            m.criado_em   AS time,
            u.id          AS autorId,
            u.avatar      AS autorAvatar,
            u.nome        AS autorNome,
            u.role        AS autorRole,
            u.cor         AS autorCor,
            u.is_me       AS autorIsMe
        FROM mural_chat m
        INNER JOIN usuario u ON u.id = m.fk_usuario
        ORDER BY m.criado_em ASC;
    `;
    return database.executar(sql);
}

function enviarChat(idUsuario, texto) {
    var sql = `INSERT INTO mural_chat (fk_usuario, texto) VALUES (?, ?);`;
    return database.executar(sql, [idUsuario, texto]);
}

module.exports = {
    listarAvisos,
    listarComentarios,
    criarAviso,
    atualizarAviso,
    deletarAviso,
    togglePin,
    toggleCurtida,
    criarComentario,
    listarUsuariosMural,
    listarChat,
    enviarChat
};
