var database = require("../database/config");

function autenticar(email, senha) {
    var sql = `
        SELECT id, nome, email, perfil, regiao, avatar, cor, role, fk_empresa AS empresaId
        FROM usuario
        WHERE email = ? AND senha = ?;
    `;
    return database.executar(sql, [email, senha]);
}

function cadastrar(nome, email, senha, fkEmpresa) {
    var sql = `
        INSERT INTO usuario (nome, email, senha, fk_empresa)
        VALUES (?, ?, ?, ?);
    `;
    return database.executar(sql, [nome, email, senha, fkEmpresa]);
}

function listar(empresaId) {
    var sql = `
        SELECT
            id, nome, email, telefone, perfil, avatar, ultimo_acesso AS ultimo
        FROM usuario
        WHERE fk_empresa = ?
        ORDER BY id;
    `;
    return database.executar(sql, [empresaId]);
}

function buscarPorId(id, empresaId) {
    var sql = `
        SELECT
            id, nome, email, telefone, perfil, avatar, cor, role,
            ultimo_acesso AS ultimo
        FROM usuario
        WHERE id = ?
          AND fk_empresa = ?;
    `;
    return database.executar(sql, [id, empresaId]);
}

function gerarAvatar(nome) {
    if (!nome) return "??";
    var partes = nome.trim().split(/\s+/);
    var iniciais = partes.slice(0, 2).map(function (p) { return p.charAt(0); }).join("");
    return iniciais.toUpperCase().slice(0, 2);
}

function criar(dados) {
    var sql = `
        INSERT INTO usuario
            (nome, email, senha, telefone, perfil, avatar, fk_empresa)
        VALUES (?, ?, ?, ?, ?, ?, ?);
    `;
    return database.executar(sql, [
        dados.nome,
        dados.email,
        dados.senha || "senha123",
        dados.telefone || null,
        dados.perfil || "Analista",
        dados.avatar || gerarAvatar(dados.nome),
        dados.fk_empresa
    ]);
}

function atualizar(id, dados, empresaId) {
    var sql = `
        UPDATE usuario SET
            nome     = ?,
            email    = ?,
            telefone = ?,
            perfil   = ?,
            avatar   = ?
        WHERE id = ?
          AND fk_empresa = ?;
    `;
    return database.executar(sql, [
        dados.nome,
        dados.email,
        dados.telefone || null,
        dados.perfil,
        dados.avatar || gerarAvatar(dados.nome),
        id,
        empresaId
    ]);
}

function deletar(id, empresaId) {
    return database.executar(`DELETE FROM usuario WHERE id = ? AND fk_empresa = ?;`, [id, empresaId]);
}

module.exports = {
    autenticar,
    cadastrar,
    listar,
    buscarPorId,
    criar,
    atualizar,
    deletar,
    gerarAvatar
};
