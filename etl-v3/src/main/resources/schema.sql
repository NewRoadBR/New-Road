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
    INDEX idx_praca_hora (praca, hora),
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

CREATE TABLE mapa_praca_rodovia (
    praca VARCHAR(120) PRIMARY KEY,
    rodovia VARCHAR(120) NOT NULL
);

INSERT INTO mapa_praca_rodovia (praca, rodovia)
VALUES

-- Rodovia dos Bandeirantes
('CAIEIRAS', 'Rodovia dos Bandeirantes'),
('CAMPO LIMPO', 'Rodovia dos Bandeirantes'),
('ITUPEVA NORTE', 'Rodovia dos Bandeirantes'),
('ITUPEVA SUL', 'Rodovia dos Bandeirantes'),
('NOVA ODESSA NORTE', 'Rodovia dos Bandeirantes'),
('NOVA ODESSA SUL', 'Rodovia dos Bandeirantes'),
('SUMARÉ NORTE', 'Rodovia dos Bandeirantes'),
('SUMARÉ - SUL', 'Rodovia dos Bandeirantes'),

-- Rodovia Anhanguera
('LIMEIRA A NORTE', 'Rodovia Anhanguera'),
('LIMEIRA A SUL', 'Rodovia Anhanguera'),
('LIMEIRA B NORTE', 'Rodovia Anhanguera'),
('LIMEIRA B SUL', 'Rodovia Anhanguera'),
('PERUS - NORTE', 'Rodovia Anhanguera'),
('PERUS - SUL', 'Rodovia Anhanguera'),
('VALINHOS NORTE', 'Rodovia Anhanguera'),
('VALINHOS SUL', 'Rodovia Anhanguera'),

-- Rodovia Dom Pedro I
('ATIBAIA', 'Rodovia Dom Pedro I'),
('IGARATÁ NORTE', 'Rodovia Dom Pedro I'),
('IGARATÁ SUL', 'Rodovia Dom Pedro I'),
('ITATIBA', 'Rodovia Dom Pedro I'),
('JUNDIAÍ', 'Rodovia Dom Pedro I'),
('LOUVEIRA', 'Rodovia Dom Pedro I'),
('PAULINIA A', 'Rodovia Dom Pedro I'),
('PAULINIA B', 'Rodovia Dom Pedro I'),
('PÓRTICO COSMOPOLIS', 'Rodovia Dom Pedro I'),
('PÓRTICO KM 74', 'Rodovia Dom Pedro I'),
('PÓRTICO PAULÍNIA JD. BETEL', 'Rodovia Dom Pedro I'),

-- Rodovia Washington Luís
('ARARAQUARA', 'Rodovia Washington Luís'),
('CATIGUÁ', 'Rodovia Washington Luís'),
('DOBRADA', 'Rodovia Washington Luís'),
('ITÁPOLIS', 'Rodovia Washington Luís'),
('JABOTICABAL', 'Rodovia Washington Luís'),
('TAIÚVA', 'Rodovia Washington Luís'),

-- Rodovia Adhemar Pereira de Barros
('AGUAÍ', 'Rodovia Adhemar Pereira de Barros'),
('AGUAS DA PRATA', 'Rodovia Adhemar Pereira de Barros'),
('CASA BRANCA', 'Rodovia Adhemar Pereira de Barros'),
('ESTIVA GERBI', 'Rodovia Adhemar Pereira de Barros'),
('ITOBI', 'Rodovia Adhemar Pereira de Barros'),
('JAGUARIÚNA', 'Rodovia Adhemar Pereira de Barros'),
('MOCOCA', 'Rodovia Adhemar Pereira de Barros'),
('PINHAL', 'Rodovia Adhemar Pereira de Barros'),
('PÓRTICO STO. ANT. DE POSSE', 'Rodovia Adhemar Pereira de Barros'),
('SÃO JOÃO DA BOA VISTA', 'Rodovia Adhemar Pereira de Barros'),

-- Rodovia Castello Branco
('ALUMINIO', 'Rodovia Castello Branco'),
('ARAÇOIABA LESTE', 'Rodovia Castello Branco'),
('ARAÇOIABA OESTE', 'Rodovia Castello Branco'),
('BARUERI', 'Rodovia Castello Branco'),
('ITAPEVI', 'Rodovia Castello Branco'),
('ITÚ', 'Rodovia Castello Branco'),
('OSASCO', 'Rodovia Castello Branco'),
('SÃO ROQUE', 'Rodovia Castello Branco'),
('SOROCABA', 'Rodovia Castello Branco'),

-- Rodovia Santos Dumont
('BLOQUEIO DE BOITUVA', 'Rodovia Santos Dumont'),
('BLOQUEIO DE INDAIATUBA', 'Rodovia Santos Dumont'),
('BOITUVA', 'Rodovia Santos Dumont'),
('INDAIATUBA', 'Rodovia Santos Dumont'),
('ITUPEVA', 'Rodovia Santos Dumont'),
('PÓRTICO AEROPORTO', 'Rodovia Santos Dumont'),
('PÓRTICO CAMPINAS', 'Rodovia Santos Dumont'),
('PÓRTICO ITU - 1', 'Rodovia Santos Dumont'),
('PÓRTICO ITU - 2', 'Rodovia Santos Dumont'),
('PÓRTICO SALTO - 1', 'Rodovia Santos Dumont'),
('PÓRTICO SALTO - 2', 'Rodovia Santos Dumont'),
('PÓRTICO SALTO - 3', 'Rodovia Santos Dumont'),
('PORTO FELIZ', 'Rodovia Santos Dumont'),
('RIO DAS PEDRAS', 'Rodovia Santos Dumont'),

-- Rodovia Raposo Tavares
('ASSIS', 'Rodovia Raposo Tavares'),
('CAIUÁ', 'Rodovia Raposo Tavares'),
('OURINHOS', 'Rodovia Raposo Tavares'),
('PALMITAL', 'Rodovia Raposo Tavares'),
('PIRATININGA', 'Rodovia Raposo Tavares'),
('PRES. BERNARDES', 'Rodovia Raposo Tavares'),
('RANCHARIA', 'Rodovia Raposo Tavares'),
('REGENTE FEIJÓ', 'Rodovia Raposo Tavares'),
('STA. CRUZ R. PARDO', 'Rodovia Raposo Tavares'),

-- Rodovia Marechal Rondon
('AVAÍ', 'Rodovia Marechal Rondon'),
('CASTILHO', 'Rodovia Marechal Rondon'),
('GLICÉRIO', 'Rodovia Marechal Rondon'),
('GUARAÇAÍ', 'Rodovia Marechal Rondon'),
('LAVÍNIA', 'Rodovia Marechal Rondon'),
('PIRAJUÍ', 'Rodovia Marechal Rondon'),
('PROMISSÃO', 'Rodovia Marechal Rondon'),
('RUBIÁCEA', 'Rodovia Marechal Rondon'),

-- Sistema Anchieta-Imigrantes
('BATISTINI', 'Sistema Anchieta-Imigrantes'),
('DIADEMA', 'Sistema Anchieta-Imigrantes'),
('ELDORADO', 'Sistema Anchieta-Imigrantes'),
('RIACHO GRANDE', 'Sistema Anchieta-Imigrantes'),
('SANTOS', 'Sistema Anchieta-Imigrantes'),
('SÃO VICENTE', 'Sistema Anchieta-Imigrantes'),
('ANCHIETA', 'Sistema Anchieta-Imigrantes'),
('IMIGRANTES', 'Sistema Anchieta-Imigrantes'),
('IMIGRANTES - CAPITAL', 'Sistema Anchieta-Imigrantes'),
('IMIGRANTES - LITORAL', 'Sistema Anchieta-Imigrantes'),

-- Rodovia Presidente Dutra
('CAÇAPAVA', 'Rodovia Presidente Dutra'),
('GUARAREMA', 'Rodovia Presidente Dutra'),
('ITAQUAQUECETUBA', 'Rodovia Presidente Dutra'),
('SÃO JOSÉ DOS CAMPOS', 'Rodovia Presidente Dutra'),
('DUTRA', 'Rodovia Presidente Dutra'),

-- Rodovia Ayrton Senna
('AYRTON SENNA', 'Rodovia Ayrton Senna'),

-- Rodoanel
('ANHANGUERA EXTERNA', 'Rodoanel'),
('ANHANGUERA INTERNA NORTE', 'Rodoanel'),
('ANHANGUERA INTERNA SUL', 'Rodoanel'),
('BANDEIRANTES EXTERNA', 'Rodoanel'),
('BANDEIRANTES INTERNA', 'Rodoanel'),
('CASTELLO BRANCO EXTERNA', 'Rodoanel'),
('CASTELLO BRANCO INTERNA', 'Rodoanel'),
('PADROEIRA EXTERNA', 'Rodoanel'),
('PADROEIRA INTERNA', 'Rodoanel'),
('RAIMUNDO MAGALHÃES', 'Rodoanel'),
('RAPOSO TAVARES EXTERNA', 'Rodoanel'),
('RAPOSO TAVARES INTERNA', 'Rodoanel'),
('REGIS BITTENCOURT', 'Rodoanel');


-- =============================================================
-- TABELA: trafego_rodovia_historico
-- =============================================================
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

SELECT * from registro_trafego;
SELECT * from trafego_rodovia_historico;
