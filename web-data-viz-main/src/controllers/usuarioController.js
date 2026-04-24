const usuarioModel = require("../models/usuarioModel");

function autenticar(req, res) {
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;

    if (!email) {
        return res.status(400).send("Email não informado");
    }

    if (!senha) {
        return res.status(400).send("Senha não informada");
    }

    usuarioModel.autenticar(email, senha)
        .then(function (resultado) {

            console.log("Resultado login:", resultado);

            if (resultado.length === 0) {
                return res.status(403).send("Email ou senha inválidos");
            }

            if (resultado.length > 1) {
                return res.status(403).send("Erro: múltiplos usuários com mesmo login");
            }

            var usuario = resultado[0];

            return res.status(200).json({
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                empresaId: usuario.empresaId
            });

        })
        .catch(function (erro) {
            console.error("Erro no login:", erro);

            return res.status(500).json({
                erro: "Erro interno no servidor",
                detalhe: erro.sqlMessage || erro.message
            });
        });
}


function cadastrar(req, res) {
    // Crie uma variável que vá recuperar os valores do arquivo cadastro.html
    var nome = req.body.nomeServer;
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;
    var fkEmpresa = req.body.idEmpresaVincularServer;

    // Faça as validações dos valores
    if (nome == undefined) {
        res.status(400).send("Seu nome está undefined!");
    } else if (email == undefined) {
        res.status(400).send("Seu email está undefined!");
    } else if (senha == undefined) {
        res.status(400).send("Sua senha está undefined!");
    } else if (fkEmpresa == undefined) {
        res.status(400).send("Sua empresa a vincular está undefined!");
    } else {

        // Passe os valores como parâmetro e vá para o arquivo usuarioModel.js
        usuarioModel.cadastrar(nome, email, senha, fkEmpresa)
            .then(
                function (resultado) {
                    res.json(resultado);
                }
            ).catch(
                function (erro) {
                    console.log(erro);
                    console.log(
                        "\nHouve um erro ao realizar o cadastro! Erro: ",
                        erro.sqlMessage
                    );
                    res.status(500).json(erro.sqlMessage);
                }
            );
    }
}

module.exports = {
    autenticar,
    cadastrar
}