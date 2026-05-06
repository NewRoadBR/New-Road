-- Execute este script no MySQL antes de rodar o projeto

CREATE DATABASE IF NOT EXISTS etldb;
USE etldb;

CREATE TABLE IF NOT EXISTS teste_etl (
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    valor_original     VARCHAR(500) NOT NULL,
    valor_transformado VARCHAR(500) NOT NULL,
    carregado_em       DATETIME     NOT NULL
);

CREATE TABLE IF NOT EXISTS etl_log (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    etapa         VARCHAR(30)   NOT NULL,
    status        VARCHAR(20)   NOT NULL,
    mensagem      VARCHAR(1000),
    registrado_em DATETIME      NOT NULL
);
