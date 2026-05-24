

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

SET GLOBAL LOCAL_INFILE = 1;
CREATE DATABASE IF NOT EXISTS transito_sp
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE transito_sp;

CREATE TABLE IF NOT EXISTS registro_trafego (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    data            DATE         NOT NULL,
    hora            TINYINT      NOT NULL,
    lote            VARCHAR(100) NOT NULL,
    praca           VARCHAR(100) NOT NULL,
    sentido         VARCHAR(50)  NOT NULL,
    leve_eixos_2    INT NOT NULL DEFAULT 0,
    moto_eixos_2    INT NOT NULL DEFAULT 0,
    pesado_eixos_2  INT NOT NULL DEFAULT 0,
    leve_eixos_3    INT NOT NULL DEFAULT 0,
    pesado_eixos_3  INT NOT NULL DEFAULT 0,
    leve_eixos_4    INT NOT NULL DEFAULT 0,
    pesado_eixos_4  INT NOT NULL DEFAULT 0,
    pesado_eixos_5  INT NOT NULL DEFAULT 0,
    pesado_eixos_6  INT NOT NULL DEFAULT 0,
    especial        INT NOT NULL DEFAULT 0,
    volume_total    INT GENERATED ALWAYS AS (
        leve_eixos_2  + moto_eixos_2   + pesado_eixos_2 +
        leve_eixos_3  + pesado_eixos_3 +
        leve_eixos_4  + pesado_eixos_4 +
        pesado_eixos_5 + pesado_eixos_6 +
        especial
    ) STORED,
    arquivo_origem  VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_data_hora  (data, hora),
    INDEX idx_lote_praca (lote, praca),
    INDEX idx_arquivo    (arquivo_origem)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS log_etl (
    id                   BIGINT       NOT NULL AUTO_INCREMENT,
    timestamp            DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    nivel_log            VARCHAR(10)  NOT NULL,
    classe_origem        VARCHAR(255) NOT NULL,
    mensagem             TEXT         NOT NULL,
    exception_stacktrace MEDIUMTEXT   NULL,

    PRIMARY KEY (id),
    INDEX idx_nivel_log (nivel_log),
    INDEX idx_timestamp (timestamp)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
