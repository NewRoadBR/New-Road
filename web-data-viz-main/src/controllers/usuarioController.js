const usuarioModel = require("../models/usuarioModel");

function obterEmpresaId(req, res) {
    var empresaId = Number(req.query.empresaId);

    if (!Number.isInteger(empresaId) || empresaId <= 0) {
        res.status(400).send("empresaId inválido");
        return null;
    }

    return empresaId;
}

function autenticar(req, res) {
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;

    if (!email) return res.status(400).send("Email não informado");
    if (!senha) return res.status(400).send("Senha não informada");

    usuarioModel.autenticar(email, senha)
        .then(function (resultado) {
            if (resultado.length === 0) return res.status(403).send("Email ou senha inválidos");
            if (resultado.length > 1)   return res.status(403).send("Erro: múltiplos usuários com mesmo login");

            var u = resultado[0];
            return res.status(200).json({
                id: u.id,
                nome: u.nome,
                email: u.email,
                perfil: u.perfil,
                regiao: u.regiao,
                avatar: u.avatar,
                cor: u.cor,
                role: u.role,
                empresaId: u.empresaId
            });
        })
        .catch(function (erro) {
            console.error("Erro no login:", erro);
            res.status(500).json({ erro: "Erro interno", detalhe: erro.sqlMessage || erro.message });
        });
}

function cadastrar(req, res) {
    var nome = req.body.nomeServer;
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;
    var fkEmpresa = req.body.idEmpresaVincularServer;

    if (!nome)      return res.status(400).send("Nome não informado");
    if (!email)     return res.status(400).send("Email não informado");
    if (!senha)     return res.status(400).send("Senha não informada");
    if (!fkEmpresa) return res.status(400).send("Empresa não informada");

    usuarioModel.cadastrar(nome, email, senha, fkEmpresa)
        .then(function (r) { res.json(r); })
        .catch(function (erro) {
            console.log("Erro no cadastro:", erro);
            res.status(500).json(erro.sqlMessage || erro.message);
        });
}

function listar(req, res) {
    var empresaId = obterEmpresaId(req, res);
    if (!empresaId) return;

    usuarioModel.listar(empresaId)
        .then(function (rows) {
            // shape esperado pelo frontend: MOCK_USERS
            var mapped = rows.map(function (u) {
                return {
                    id: u.id,
                    nome: u.nome,
                    email: u.email,
                    telefone: u.telefone || "",
                    perfil: u.perfil,
                    ultimo: u.ultimo || "—",
                    avatar: u.avatar || ""
                };
            });
            res.status(200).json(mapped);
        })
        .catch(function (erro) {
            console.log("Erro ao listar usuários:", erro);
            res.status(500).json(erro.sqlMessage || erro.message);
        });
}

function buscarPorId(req, res) {
    var empresaId = obterEmpresaId(req, res);
    if (!empresaId) return;

    usuarioModel.buscarPorId(req.params.id, empresaId)
        .then(function (rows) {
            if (!rows.length) return res.status(404).send("Usuário não encontrado");
            var u = rows[0];
            res.status(200).json({
                id: u.id,
                nome: u.nome,
                email: u.email,
                telefone: u.telefone || "",
                perfil: u.perfil,
                avatar: u.avatar || "",
                cor: u.cor,
                role: u.role,
                ultimo: u.ultimo || "—"
            });
        })
        .catch(function (erro) {
            console.log("Erro ao buscar usuário:", erro);
            res.status(500).json(erro.sqlMessage || erro.message);
        });
}

function criar(req, res) {
    var empresaId = obterEmpresaId(req, res);
    if (!empresaId) return;

    var dados = {
        nome: (req.body.nome || "").trim(),
        email: (req.body.email || "").trim(),
        senha: req.body.senha,
        telefone: req.body.telefone,
        perfil: req.body.perfil,
        avatar: req.body.avatar,
        fk_empresa: empresaId
    };
    if (!dados.nome)  return res.status(400).send("Nome é obrigatório");
    if (!dados.email) return res.status(400).send("Email é obrigatório");
    if (!dados.senha) return res.status(400).send("Senha é obrigatória");

    usuarioModel.criar(dados)
        .then(function (r) {
            res.status(201).json({
                id: r.insertId,
                nome: dados.nome,
                email: dados.email,
                perfil: dados.perfil || "Analista",
                ultimo: "Agora",
                avatar: dados.avatar || usuarioModel.gerarAvatar(dados.nome)
            });
        })
        .catch(function (erro) {
            console.log("Erro ao criar usuário:", erro);
            res.status(500).json(erro.sqlMessage || erro.message);
        });
}

function atualizar(req, res) {
    var empresaId = obterEmpresaId(req, res);
    if (!empresaId) return;

    var dados = {
        nome: (req.body.nome || "").trim(),
        email: (req.body.email || "").trim(),
        telefone: req.body.telefone,
        perfil: req.body.perfil,
        avatar: req.body.avatar
    };
    if (!dados.nome)  return res.status(400).send("Nome é obrigatório");
    if (!dados.email) return res.status(400).send("Email é obrigatório");

    usuarioModel.atualizar(req.params.id, dados, empresaId)
        .then(function () { res.status(200).json(Object.assign({ id: Number(req.params.id) }, dados)); })
        .catch(function (erro) {
            console.log("Erro ao atualizar usuário:", erro);
            res.status(500).json(erro.sqlMessage || erro.message);
        });
}

function deletar(req, res) {
    var empresaId = obterEmpresaId(req, res);
    if (!empresaId) return;

    usuarioModel.deletar(req.params.id, empresaId)
        .then(function () { res.status(200).json({ ok: true }); })
        .catch(function (erro) {
            console.log("Erro ao deletar usuário:", erro);
            res.status(500).json(erro.sqlMessage || erro.message);
        });
}

module.exports = {
    autenticar,
    cadastrar,
    listar,
    buscarPorId,
    criar,
    atualizar,
    deletar
};
