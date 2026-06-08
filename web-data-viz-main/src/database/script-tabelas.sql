-- ════════════════════════════════════════════════════════════════
--  NewRoad — Script de banco de dados (schema + seed com mocks)
--  Execute em ordem; recria o banco do zero.
-- ════════════════════════════════════════════════════════════════
SET NAMES utf8mb4;
CREATE DATABASE newroad_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE newroad_db;

CREATE TABLE IF NOT EXISTS registro_trafego (
    id              BIGINT       NOT NULL AUTO_INCREMENT,

    -- Campos da classe mãe RegistroTrafego
    data            DATE         NOT NULL,
    hora            TINYINT      NOT NULL,
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
    INDEX idx_praca_hora (praca, hora),
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

CREATE TABLE IF NOT EXISTS mapa_praca_rodovia (
    praca VARCHAR(120) PRIMARY KEY,
    rodovia VARCHAR(120) NOT NULL
);

CREATE TABLE IF NOT EXISTS trafego_rodovia_historico (

    rodovia VARCHAR(120) NOT NULL,

    dia_semana TINYINT NOT NULL,

    hora TINYINT NOT NULL,

    volume_total DECIMAL(12,2),

    volume_leve DECIMAL(12,2),

    volume_pesado DECIMAL(12,2),

    volume_moto DECIMAL(12,2),

    volume_especial DECIMAL(12,2),

    PRIMARY KEY (
        rodovia,
        dia_semana,
        hora
    )

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE OR REPLACE VIEW vw_fluxo_medio AS
SELECT
    rodovia,
    ROUND(AVG(fluxo_diario), 0) AS fluxo
FROM (
    SELECT
        rodovia,
        dia_semana,
        SUM(volume_total) AS fluxo_diario
    FROM trafego_rodovia_historico
    GROUP BY rodovia, dia_semana
) consolidado
GROUP BY rodovia;


CREATE OR REPLACE VIEW vw_horario_critico AS
SELECT *
FROM (
    SELECT
        rodovia,
        hora,
        ROUND(AVG(volume_total), 0) AS volume,
        ROW_NUMBER() OVER (
            PARTITION BY rodovia
            ORDER BY AVG(volume_total) DESC
        ) AS ranking
    FROM trafego_rodovia_historico
    GROUP BY rodovia, hora
) ranking_horario
WHERE ranking = 1;


CREATE OR REPLACE VIEW vw_janela_ideal AS
SELECT *
FROM (
    SELECT
        rodovia,
        hora,
        ROUND(AVG(volume_total), 0) AS volume,
        ROW_NUMBER() OVER (
            PARTITION BY rodovia
            ORDER BY AVG(volume_total) ASC
        ) AS ranking
    FROM trafego_rodovia_historico
    GROUP BY rodovia, hora
) ranking_horario
WHERE ranking = 1;


CREATE OR REPLACE VIEW vw_melhor_dia AS
SELECT *
FROM (
    SELECT
        rodovia,
        dia_semana,
        ROUND(AVG(volume_total), 0) AS media,
        ROW_NUMBER() OVER (
            PARTITION BY rodovia
            ORDER BY AVG(volume_total) ASC
        ) AS ranking
    FROM trafego_rodovia_historico
    GROUP BY rodovia, dia_semana
) ranking_dia
WHERE ranking = 1;


CREATE OR REPLACE VIEW vw_fluxo_horario AS
SELECT
    rodovia,
    hora,
    ROUND(AVG(volume_total), 0) AS volume
FROM trafego_rodovia_historico
GROUP BY rodovia, hora;


CREATE OR REPLACE VIEW vw_congestionamento AS
SELECT
    dados.rodovia,
    dados.hora,
    ROUND((dados.volume / pico.volume_maximo) * 100, 2) AS congestionamento
FROM (
    SELECT
        rodovia,
        hora,
        AVG(volume_total) AS volume
    FROM trafego_rodovia_historico
    GROUP BY rodovia, hora
) dados
JOIN (
    SELECT
        rodovia,
        MAX(volume) AS volume_maximo
    FROM (
        SELECT
            rodovia,
            hora,
            AVG(volume_total) AS volume
        FROM trafego_rodovia_historico
        GROUP BY rodovia, hora
    ) maximos
    GROUP BY rodovia
) pico
ON dados.rodovia = pico.rodovia;


CREATE OR REPLACE VIEW vw_pressao_operacional AS
SELECT
    rodovia,
    hora,
    ROUND(
        (AVG(volume_pesado) / NULLIF(AVG(volume_total), 0)) * 100,
        2
    ) AS pressao_operacional
FROM trafego_rodovia_historico
GROUP BY rodovia, hora;


CREATE OR REPLACE VIEW vw_perfil_rodovia AS
SELECT
    rodovia,
    ROUND(AVG(volume_leves_dia), 0) AS media_leves,
    ROUND(AVG(volume_pesados_dia), 0) AS media_pesados,
    ROUND(AVG(volume_motos_dia), 0) AS media_motos,
    ROUND(AVG(volume_especiais_dia), 0) AS media_especiais
FROM (
    SELECT
        rodovia,
        dia_semana,
        SUM(volume_leve) AS volume_leves_dia,
        SUM(volume_pesado) AS volume_pesados_dia,
        SUM(volume_moto) AS volume_motos_dia,
        SUM(volume_especial) AS volume_especiais_dia
    FROM trafego_rodovia_historico
    GROUP BY rodovia, dia_semana
) consolidado
GROUP BY rodovia;


CREATE OR REPLACE VIEW vw_volume_dia_semana AS
SELECT
    rodovia,
    dia_semana,
    CASE
        WHEN dia_semana = 1 THEN 'Dom'
        WHEN dia_semana = 2 THEN 'Seg'
        WHEN dia_semana = 3 THEN 'Ter'
        WHEN dia_semana = 4 THEN 'Qua'
        WHEN dia_semana = 5 THEN 'Qui'
        WHEN dia_semana = 6 THEN 'Sex'
        WHEN dia_semana = 7 THEN 'Sáb'
    END AS nome_dia,
    ROUND(SUM(volume_total), 0) AS volume_total
FROM trafego_rodovia_historico
GROUP BY rodovia, dia_semana;

-- ────────────────────────────────────────────────────────────────
--  TABELAS
-- ────────────────────────────────────────────────────────────────
CREATE TABLE empresa (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome        VARCHAR(120) NOT NULL,
    cnpj        VARCHAR(20),
    criado_em   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE usuario (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome            VARCHAR(120) NOT NULL,
    email           VARCHAR(160) NOT NULL UNIQUE,
    senha           VARCHAR(255) NOT NULL,
    telefone        VARCHAR(30),
    perfil          ENUM('Gestor','Analista','Operador') DEFAULT 'Analista',
    regiao          VARCHAR(50) DEFAULT 'SP Region',
    avatar          CHAR(2),
    cor             CHAR(7),
    ultimo_acesso   VARCHAR(40),
    role            VARCHAR(60),
    is_me           TINYINT(1) DEFAULT 0,
    fk_empresa      INT UNSIGNED,
    criado_em       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fk_empresa) REFERENCES empresa(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE obra (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
   rodovia         VARCHAR(200) NOT NULL,
    descricao       TEXT,
   status          ENUM('Planejada','Em andamento','Finalizada','Critica') DEFAULT 'Planejada',
   data_inicio     DATE NOT NULL,
   data_fim        DATE,
   impacto_previsto TINYINT UNSIGNED DEFAULT 1 COMMENT '1=baixo 2=medio 3=alto',
   fk_empresa      INT UNSIGNED,
   criado_em       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   FOREIGN KEY (fk_empresa) REFERENCES empresa(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE aviso_mural (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    fk_usuario  INT UNSIGNED NOT NULL,
    tipo        ENUM('urgente','atencao','info','concluido','planejado') NOT NULL,
   rodovia     VARCHAR(200) NOT NULL,
    titulo      VARCHAR(200) NOT NULL,
    descricao   TEXT,
    pinned      TINYINT(1) DEFAULT 0,
    has_img     TINYINT(1) DEFAULT 0,
    likes       INT DEFAULT 0,
    criado_em   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fk_usuario) REFERENCES usuario(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE aviso_curtida (
    fk_aviso    INT UNSIGNED,
    fk_usuario  INT UNSIGNED,
    PRIMARY KEY (fk_aviso, fk_usuario),
    FOREIGN KEY (fk_aviso)   REFERENCES aviso_mural(id) ON DELETE CASCADE,
    FOREIGN KEY (fk_usuario) REFERENCES usuario(id)    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE aviso_comentario (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    fk_aviso    INT UNSIGNED NOT NULL,
    fk_usuario  INT UNSIGNED NOT NULL,
    texto       TEXT NOT NULL,
    criado_em   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fk_aviso)   REFERENCES aviso_mural(id) ON DELETE CASCADE,
    FOREIGN KEY (fk_usuario) REFERENCES usuario(id)    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE mural_chat (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    fk_usuario  INT UNSIGNED NOT NULL,
    texto       TEXT NOT NULL,
    criado_em   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fk_usuario) REFERENCES usuario(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE preferencia (
    fk_usuario             INT UNSIGNED PRIMARY KEY,
    intervalo              VARCHAR(20) DEFAULT '1 minuto',
    regiao_padrao          VARCHAR(50) DEFAULT 'SP Region (todas)',
    notif_critica          TINYINT(1) DEFAULT 1,
    notif_pico             TINYINT(1) DEFAULT 1,
    notif_relatorio        TINYINT(1) DEFAULT 1,
    dark_mode              TINYINT(1) DEFAULT 0,
    FOREIGN KEY (fk_usuario) REFERENCES usuario(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notificacoes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    visualizada BOOLEAN DEFAULT FALSE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
