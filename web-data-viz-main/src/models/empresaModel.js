var database = require("../database/config");

function buscarPorId(id) {
  var instrucaoSql = `
    SELECT id, nome, cnpj, criado_em
    FROM empresa
    WHERE id = ?;
  `;

  return database.executar(instrucaoSql, [id]);
}

function listar() {
  var instrucaoSql = `
    SELECT id, nome, cnpj, criado_em
    FROM empresa;
  `;

  return database.executar(instrucaoSql);
}

function buscarPorCnpj(cnpj) {
  var instrucaoSql = `
    SELECT id, nome, cnpj, criado_em
    FROM empresa
    WHERE cnpj = ?;
  `;

  return database.executar(instrucaoSql, [cnpj]);
}

function cadastrar(razaoSocial, cnpj) {
  var instrucaoSql = `
    INSERT INTO empresa (nome, cnpj)
    VALUES (?, ?);
  `;

  return database.executar(instrucaoSql, [razaoSocial, cnpj]);
}

module.exports = { buscarPorCnpj, buscarPorId, cadastrar, listar };
