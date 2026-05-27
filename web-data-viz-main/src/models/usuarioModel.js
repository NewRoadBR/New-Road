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

function listar() {
    var sql = `
        SELECT
            id, nome, email, telefone, perfil, regiao, avatar, status, ultimo_acesso AS ultimo
        FROM usuario
        ORDER BY id;
    `;
    return database.executar(sql);
}

function buscarPorId(id) {
    var sql = `
        SELECT
            id, nome, email, telefone, perfil, regiao, avatar, cor, role, status,
            ultimo_acesso AS ultimo
        FROM usuario
        WHERE id = ?;
    `;
    return database.executar(sql, [id]);
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
            (nome, email, senha, telefone, perfil, regiao, avatar, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `;
    return database.executar(sql, [
        dados.nome,
        dados.email,
        dados.senha || "senha123",
        dados.telefone || null,
        dados.perfil || "Analista",
        dados.regiao || "SP Region",
        dados.avatar || gerarAvatar(dados.nome),
        dados.status || "ativo"
    ]);
}

function atualizar(id, dados) {
    var sql = `
        UPDATE usuario SET
            nome     = ?,
            email    = ?,
            telefone = ?,
            perfil   = ?,
            regiao   = ?,
            avatar   = ?,
            status   = ?
        WHERE id = ?;
    `;
    return database.executar(sql, [
        dados.nome,
        dados.email,
        dados.telefone || null,
        dados.perfil,
        dados.regiao,
        dados.avatar || gerarAvatar(dados.nome),
        dados.status || "ativo",
        id
    ]);
}

function deletar(id) {
    return database.executar(`DELETE FROM usuario WHERE id = ?;`, [id]);
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
