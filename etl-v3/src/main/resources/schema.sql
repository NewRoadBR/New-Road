CREATE DATABASE IF NOT EXISTS transito_sp
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE transito_sp;

-- ════════════════════════════════════════════════════════════════
-- TABELA 1: Log de execucao do ETL
-- Registra tudo que acontece durante o processo de importacao
-- ════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS log_etl (
    id              BIGINT      NOT NULL AUTO_INCREMENT,
    data_hora       DATETIME(3) NOT NULL COMMENT 'Quando o evento ocorreu',
    nivel           VARCHAR(10) NOT NULL COMMENT 'INFO = normal | AVISO = atencao | ERRO = falha',
    etapa           VARCHAR(50) NOT NULL COMMENT 'Em qual etapa do ETL ocorreu (EXTRACT, TRANSFORM, LOAD)',
    mensagem        TEXT        NOT NULL COMMENT 'O que aconteceu',
    detalhe_erro    TEXT                 COMMENT 'Detalhes tecnicos de erros (preenchido so em caso de ERRO)',
    id_execucao     VARCHAR(36) NOT NULL COMMENT 'Codigo unico de cada vez que o ETL e executado',
    PRIMARY KEY (id),
    INDEX idx_execucao (id_execucao),
    INDEX idx_nivel    (nivel),
    INDEX idx_data     (data_hora)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Historico de todas as execucoes do ETL';

-- ════════════════════════════════════════════════════════════════
-- TABELA 2: Medicoes de transito (dados brutos importados)
-- Cada linha = uma medicao de congestionamento numa via
-- ════════════════════════════════════════════════════════════════
-- ════════════════════════════════════════════════════════
-- PERFORMANCE (MySQL 8.0.43)
-- ════════════════════════════════════════════════════════
SET GLOBAL local_infile                    = 1;
SET GLOBAL innodb_flush_log_at_trx_commit  = 2;
SET GLOBAL sync_binlog                     = 0;
SET GLOBAL bulk_insert_buffer_size         = 268435456;  -- 256 MB

-- Novos no MySQL 8: hash join e paralelismo no GROUP BY
SET GLOBAL optimizer_switch = 'hash_join=on';
SET GLOBAL sort_buffer_size  = 33554432;   -- 32 MB por thread

-- ─────────────────────────────────────────────
-- TABELA PRINCIPAL
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS medicao_transito (
    id                BIGINT       NOT NULL AUTO_INCREMENT,
    nome_via          VARCHAR(255) NOT NULL,
    sentido           VARCHAR(100),
    tipo_via          VARCHAR(10),
    regiao            VARCHAR(100),
    data_hora_medicao VARCHAR(50),
    fila_em_metros    INT,
    trecho            VARCHAR(255),
    hora_do_dia       TINYINT UNSIGNED,   -- era INT, 0-23 cabe em 1 byte
    dia_da_semana     TINYINT UNSIGNED,   -- era INT, 1-7 cabe em 1 byte
    fim_de_semana     TINYINT(1),
    via_expressa      TINYINT(1),
    periodo_do_dia    VARCHAR(20),        -- era 50; "Manha Cedo" = 10 chars
    PRIMARY KEY (id)
) ENGINE=InnoDB ROW_FORMAT=COMPRESSED;   -- compressão reduz I/O no GROUP BY

-- 🔑 CRÍTICO: índice criado como INVISIBLE para não penalizar o LOAD DATA.
-- O Carregador o torna VISIBLE antes do calcularResumo() e INVISIBLE de novo.
CREATE INDEX idx_medicao_resumo
ON medicao_transito (nome_via, regiao, via_expressa,
                     hora_do_dia, periodo_do_dia, fim_de_semana)
INVISIBLE;   -- ← MySQL 8 — não participa de query nem de rebuild durante INSERT

-- ─────────────────────────────────────────────
-- TABELA RESUMO
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resumo_transito_por_horario (
    id                    BIGINT       NOT NULL AUTO_INCREMENT,
    nome_via              VARCHAR(255),
    regiao                VARCHAR(100),
    trecho                VARCHAR(255),
    via_expressa          TINYINT(1),
    hora_do_dia           TINYINT UNSIGNED,
    periodo_do_dia        VARCHAR(20),
    fim_de_semana         TINYINT(1),
    fila_media_metros     DOUBLE,
    fila_maxima_metros    INT,
    total_medicoes        BIGINT,
    fila_mediana_metros   DOUBLE NULL,
    fila_p75_metros       DOUBLE NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_resumo (
        nome_via, regiao, via_expressa,
        hora_do_dia, periodo_do_dia, fim_de_semana
    )
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
-- TABELA RECOMENDAÇÕES (sem alterações)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recomendacao_obras (
    id                     BIGINT NOT NULL AUTO_INCREMENT,
    nome_via               VARCHAR(255),
    regiao                 VARCHAR(100),
    trecho                 VARCHAR(255),
    via_expressa           TINYINT(1),
    hora_recomendada       TINYINT UNSIGNED,
    periodo_recomendado    VARCHAR(20),
    tipo_dia               VARCHAR(20),
    fila_media_esperada_m  DOUBLE,
    fila_garantida_75pct_m DOUBLE,
    total_medicoes         BIGINT,
    posicao_ranking        INT,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

SELECT * from medicao_transito;

