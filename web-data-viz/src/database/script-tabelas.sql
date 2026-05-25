-- Arquivo de apoio, caso você queira criar tabelas como as aqui criadas para a API funcionar.
-- Você precisa executar os comandos no banco de dados para criar as tabelas,
-- ter este arquivo aqui não significa que a tabela em seu BD estará como abaixo!

/*
comandos para mysql server
- ============================================================
--  NewRoad — Script de criação do banco de dados
--  Execute este arquivo inteiro no MySQL Workbench ou CLI
-- ============================================================

CREATE DATABASE IF NOT EXISTS newroad CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE newroad;

-- ------------------------------------------------------------
-- Empresa (necessária para FK de usuario)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS empresa (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nome        VARCHAR(120)    NOT NULL,
    cnpj        VARCHAR(20)     UNIQUE,
    criado_em   DATETIME        DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- Usuário
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuario (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nome        VARCHAR(120)    NOT NULL,
    email       VARCHAR(150)    NOT NULL UNIQUE,
    senha       VARCHAR(255)    NOT NULL,
    fk_empresa  INT,
    criado_em   DATETIME        DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fk_empresa) REFERENCES empresa(id)
);

-- ------------------------------------------------------------
-- Obras viárias
-- Status: planejada | em_andamento | concluida | pausada
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS obra (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    nome            VARCHAR(200)    NOT NULL,
    descricao       TEXT,
    regiao          VARCHAR(80),         -- ex: Zona Norte, Av. Paulista
    status          ENUM('planejada','em_andamento','concluida','pausada') DEFAULT 'planejada',
    progresso       TINYINT UNSIGNED DEFAULT 0 CHECK (progresso BETWEEN 0 AND 100),
    data_inicio     DATE,
    data_fim        DATE,
    lat             DECIMAL(10,7),       -- coordenada para o mapa
    lng             DECIMAL(10,7),
    fk_empresa      INT,
    criado_em       DATETIME        DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fk_empresa) REFERENCES empresa(id)
);

-- ------------------------------------------------------------
-- Mural de avisos
-- Tipo: info | alerta | critico
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS aviso (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    titulo      VARCHAR(200)    NOT NULL,
    mensagem    TEXT            NOT NULL,
    tipo        ENUM('info','alerta','critico') DEFAULT 'info',
    fk_obra     INT,
    fk_usuario  INT,
    lido        TINYINT(1)      DEFAULT 0,
    criado_em   DATETIME        DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fk_obra)    REFERENCES obra(id)    ON DELETE SET NULL,
    FOREIGN KEY (fk_usuario) REFERENCES usuario(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- Notificações (sino do header)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notificacao (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    titulo      VARCHAR(200)    NOT NULL,
    descricao   TEXT,
    tipo        ENUM('info','alerta','critico') DEFAULT 'info',
    lida        TINYINT(1)      DEFAULT 0,
    fk_usuario  INT,
    criado_em   DATETIME        DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fk_usuario) REFERENCES usuario(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- KPIs mensais (histórico para gráficos)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kpi_mensal (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    mes                 DATE            NOT NULL,       -- primeiro dia do mês
    obras_concluidas    SMALLINT        DEFAULT 0,
    obras_em_andamento  SMALLINT        DEFAULT 0,
    obras_planejadas    SMALLINT        DEFAULT 0,
    orcamento_gasto     DECIMAL(14,2)   DEFAULT 0,
    orcamento_total     DECIMAL(14,2)   DEFAULT 0
);

-- ============================================================
--  DADOS DE EXEMPLO
-- ============================================================

INSERT INTO empresa (nome, cnpj) VALUES
('Prefeitura SP - Infra',   '00.000.000/0001-00'),
('Construtora ViaSP Ltda',  '11.111.111/0001-11');

INSERT INTO usuario (nome, email, senha, fk_empresa) VALUES
('Eng. Mateus',  'mateus@newroad.sp', '1234', 1),
('Ana Oliveira', 'ana@newroad.sp',    '1234', 1),
('Carlos Lima',  'carlos@viasp.com',  '1234', 2);

INSERT INTO obra (nome, descricao, regiao, status, progresso, data_inicio, data_fim, lat, lng, fk_empresa) VALUES
('Recapeamento Av. Paulista',      'Reparo completo do asfalto e calçadas',       'paulista',  'em_andamento', 68, '2025-03-01', '2025-07-31', -23.5611, -46.6560, 1),
('Alargamento Rua Augusta',        'Ampliação de pistas e instalação de ciclovia', 'paulista',  'planejada',    10, '2025-06-01', '2025-12-01', -23.5573, -46.6616, 1),
('Ponte Marginal Tietê - Bloco 2', 'Reforço estrutural da ponte km 22',           'norte',     'em_andamento', 45, '2025-01-15', '2025-09-30', -23.5065, -46.6333, 2),
('Viaduto Zona Leste - Vila Mara', 'Construção de novo viaduto sobre trilhos',    'leste',     'planejada',     5, '2025-07-01', '2026-03-01', -23.5369, -46.5268, 2),
('Asfalto Rua João Dias',          'Recapeamento emergencial bairro Morumbi',     'sul',       'concluida',   100, '2025-01-10', '2025-02-28', -23.6180, -46.7187, 1),
('Ciclofaixa Av. Rebouças',        'Implantação de ciclofaixa 3 km',              'oeste',     'em_andamento', 82, '2025-02-01', '2025-05-31', -23.5629, -46.6830, 1),
('Drenagem Centro Histórico',      'Renovação da rede de drenagem subterrânea',   'centro',    'pausada',      33, '2024-11-01', '2025-08-01', -23.5478, -46.6358, 2),
('Manutenção Corredor Norte-Sul',  'Recomposição de pavimento km 5-12',           'norte',     'concluida',   100, '2024-12-01', '2025-03-31', -23.4855, -46.6226, 1);

INSERT INTO aviso (titulo, mensagem, tipo, fk_obra, fk_usuario) VALUES
('Interdição Av. Paulista nível 2',     'Pistas centrais interditadas das 22h às 5h nos dias úteis.',      'alerta',  1, 1),
('Atraso no fornecimento de material',  'Entrega de asfalto da obra Rua Augusta atrasou 2 semanas.',       'critico', 2, 2),
('Obra Rua João Dias concluída',        'Recapeamento finalizado com aprovação da vistoria técnica.',       'info',    5, 1),
('Chuva suspende trabalhos',            'Obra Marginal Tietê suspensa temporariamente por chuvas fortes.', 'alerta',  3, 3),
('Novo contrato aprovado',              'Licitação do Viaduto Vila Mara homologada pelo Tribunal.',         'info',    4, 1);

INSERT INTO notificacao (titulo, descricao, tipo, lida, fk_usuario) VALUES
('Obra em atraso',           'Recapeamento Av. Paulista com 3 dias de atraso.',       'alerta',  0, 1),
('Vistoria amanhã',          'Inspeção técnica Ponte Marginal Tietê às 8h.',          'info',    0, 1),
('Orçamento revisado',       'Budget Ciclofaixa Rebouças reajustado em +12%.',        'critico', 0, 1),
('Relatório semanal',        'Relatório de progresso da semana disponível.',           'info',    1, 1);

INSERT INTO kpi_mensal (mes, obras_concluidas, obras_em_andamento, obras_planejadas, orcamento_gasto, orcamento_total) VALUES
('2024-12-01', 2, 4, 3,  980000, 1500000),
('2025-01-01', 1, 5, 2, 1100000, 1600000),
('2025-02-01', 2, 4, 2, 1250000, 1700000),
('2025-03-01', 1, 5, 3, 1400000, 1800000),
('2025-04-01', 0, 6, 2, 1100000, 1750000),
('2025-05-01', 1, 5, 3, 1350000, 1800000);

-- ============================================================
--  VIEWS úteis (opcional mas recomendado)
-- ============================================================

CREATE OR REPLACE VIEW vw_resumo_obras AS
SELECT
    SUM(CASE WHEN status = 'em_andamento' THEN 1 ELSE 0 END) AS em_andamento,
    SUM(CASE WHEN status = 'concluida'    THEN 1 ELSE 0 END) AS concluidas,
    SUM(CASE WHEN status = 'planejada'    THEN 1 ELSE 0 END) AS planejadas,
    SUM(CASE WHEN status = 'pausada'      THEN 1 ELSE 0 END) AS pausadas,
    COUNT(*) AS total
FROM obra;

CREATE OR REPLACE VIEW vw_obras_mapa AS
SELECT id, nome, regiao, status, progresso, lat, lng
FROM obra
WHERE lat IS NOT NULL AND lng IS NOT NULL;
