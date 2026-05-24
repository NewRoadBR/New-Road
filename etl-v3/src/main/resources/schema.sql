-- =============================================================
-- ARTESP ETL — DDL com colunas reais da planilha
-- =============================================================
SET GLOBAL LOCAL_INFILE = 1;
CREATE DATABASE IF NOT EXISTS transito_sp
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE transito_sp;

-- =============================================================
-- TABELA: registro_trafego
-- =============================================================
CREATE TABLE IF NOT EXISTS registro_trafego (
    id              BIGINT       NOT NULL AUTO_INCREMENT,

    -- Campos da classe mãe RegistroTrafego
    data            DATE         NOT NULL,
    hora            TINYINT      NOT NULL,
    lote            VARCHAR(100) NOT NULL,
    praca           VARCHAR(100) NOT NULL,
    sentido         VARCHAR(50)  NOT NULL,

    -- Campos da classe filha RegistroTrafegoDetalhado
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

    -- Campo gerado automaticamente pelo banco
    volume_total    INT GENERATED ALWAYS AS (
        leve_eixos_2  + moto_eixos_2   + pesado_eixos_2 +
        leve_eixos_3  + pesado_eixos_3 +
        leve_eixos_4  + pesado_eixos_4 +
        pesado_eixos_5 + pesado_eixos_6 +
        especial
    ) STORED,

    -- Nome do arquivo de origem (rastreabilidade)
    arquivo_origem  VARCHAR(255) NOT NULL,

    PRIMARY KEY (id),
    INDEX idx_data_hora  (data, hora),
    INDEX idx_lote_praca (lote, praca),
    INDEX idx_arquivo    (arquivo_origem)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- TABELA: log_etl
-- =============================================================
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
