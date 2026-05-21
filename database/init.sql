

CREATE DATABASE IF NOT EXISTS newroad_db
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE newroad_db;

CREATE TABLE IF NOT EXISTS empresa (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    cnpj VARCHAR(18),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    fk_empresa INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fk_empresa) REFERENCES empresa(id)
);

INSERT INTO empresa (nome, cnpj)
VALUES ('NewRoad', '00000000000191');

INSERT INTO usuario (nome, email, senha, fk_empresa)
VALUES ('admin', 'admin@newroad.com', '123456', 1);

-- =====================================================
-- DATABASE ETL
-- =====================================================

CREATE DATABASE IF NOT EXISTS transito_sp
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE transito_sp;

CREATE TABLE IF NOT EXISTS log_etl (
    id BIGINT NOT NULL AUTO_INCREMENT,
    data_hora DATETIME(3) NOT NULL,
    nivel VARCHAR(10) NOT NULL,
    etapa VARCHAR(50) NOT NULL,
    mensagem TEXT NOT NULL,
    detalhe_erro TEXT,
    id_execucao VARCHAR(36) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS medicao_transito (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nome_via VARCHAR(255) NOT NULL,
    sentido VARCHAR(100),
    tipo_via VARCHAR(10),
    regiao VARCHAR(100),
    data_hora_medicao VARCHAR(50),
    fila_em_metros INT,
    trecho VARCHAR(255),
    hora_do_dia TINYINT UNSIGNED,
    dia_da_semana TINYINT UNSIGNED,
    fim_de_semana TINYINT(1),
    via_expressa TINYINT(1),
    periodo_do_dia VARCHAR(20),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS resumo_transito_por_horario (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nome_via VARCHAR(255),
    regiao VARCHAR(100),
    trecho VARCHAR(255),
    via_expressa TINYINT(1),
    hora_do_dia TINYINT UNSIGNED,
    periodo_do_dia VARCHAR(20),
    fim_de_semana TINYINT(1),
    fila_media_metros DOUBLE,
    fila_maxima_metros INT,
    total_medicoes BIGINT,
    PRIMARY KEY (id)
);