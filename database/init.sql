-- ════════════════════════════════════════════════════════════════
--  NewRoad — Script de banco de dados (schema + seed com mocks)
--  Execute em ordem; recria o banco do zero.
-- ════════════════════════════════════════════════════════════════
CREATE DATABASE IF NOT EXISTS newroad_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;


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
   impacto_previsto TINYINT UNSIGNED DEFAULT 0,
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


-- // pupular banco de dados 
-- 1. Inserir uma Empresa de teste
INSERT INTO empresa (id, nome, cnpj) 
VALUES (1, 'NewRoad Concessionária SP', '12.345.678/0001-99');

-- 2. Inserir Usuário para teste de LOGIN
-- Nota: A senha está como 'senha123'. Se o seu backend usar criptografia (como bcrypt), 
-- você precisará gerar o hash correspondente depois, mas para teste simples estrutural:
INSERT INTO usuario (id, nome, email, senha, perfil, regiao, fk_empresa, is_me) 
VALUES (1, 'Gustavo Henrique', 'gustavo@newroad.com', 'senha123', 'Gestor', 'SP Region', 1, 1);

-- 3. Inserir Preferências do usuário
INSERT INTO preferencia (fk_usuario, intervalo, regiao_padrao, dark_mode)
VALUES (1, '1 minuto', 'SP Region (todas)', 0);

-- 4. Inserir Mapeamento de Praças e Rodovias (Essencial para as Views funcionarem)
INSERT INTO mapa_praca_rodovia (praca, rodovia) VALUES
('Praça Jundiaí - Km 39', 'Rodovia dos Bandeirantes'),
('Praça Itupeva - Km 77', 'Rodovia dos Bandeirantes'),
('Praça Caieiras - Km 36', 'Rodovia Anhangüera'),
('Praça Louveira - Km 74', 'Rodovia Anhangüera');

-- 5. Popular Histórico de Tráfego (Alimenta a maior parte das suas Views de Dashboard)
-- Dias da semana: 1=Dom, 2=Seg, 3=Ter, 4=Qua, 5=Qui, 6=Sex, 7=Sáb
INSERT INTO trafego_rodovia_historico (rodovia, dia_semana, hora, volume_total, volume_leve, volume_pesado, volume_moto, volume_especial) VALUES
-- Rodovia dos Bandeirantes - Segunda-feira (Dia típico com pico às 18h)
('Rodovia dos Bandeirantes', 2, 08, 1500.00, 900.00, 400.00, 180.00, 20.00),
('Rodovia dos Bandeirantes', 2, 12, 1800.00, 1100.00, 500.00, 170.00, 30.00),
('Rodovia dos Bandeirantes', 2, 18, 3500.00, 2500.00, 600.00, 380.00, 20.00),
('Rodovia dos Bandeirantes', 2, 22, 1200.00, 700.00, 450.00, 40.00, 10.00),
-- Rodovia dos Bandeirantes - Domingo (Mais leve, pico ao meio-dia)
('Rodovia dos Bandeirantes', 1, 12, 2800.00, 2200.00, 150.00, 430.00, 20.00),
('Rodovia dos Bandeirantes', 1, 20, 1900.00, 1500.00, 200.00, 190.00, 10.00),

-- Rodovia Anhangüera - Segunda-feira (Forte presença de pesados/caminhões)
('Rodovia Anhangüera', 2, 06, 2200.00, 800.00, 1200.00, 150.00, 50.00),
('Rodovia Anhangüera', 2, 12, 2400.00, 1000.00, 1100.00, 200.00, 100.00),
('Rodovia Anhangüera', 2, 18, 3100.00, 1900.00, 900.00, 280.00, 20.00),
-- Rodovia Anhangüera - Sábado
('Rodovia Anhangüera', 7, 14, 1600.00, 950.00, 400.00, 210.00, 40.00);

-- 6. Inserir Obras em andamento/planejadas
INSERT INTO obra (rodovia, descricao, status, data_inicio, data_fim, impacto_previsto, fk_empresa) VALUES
('Rodovia dos Bandeirantes', 'Recapeamento asfáltico faixa da direita Km 42', 'Em andamento', '2026-06-01', '2026-06-10', 3, 1),
('Rodovia Anhangüera', 'Manutenção preventiva da passarela Km 72', 'Planejada', '2026-06-15', '2026-06-16', 1, 1);

-- 7. Inserir Mural de Avisos (Interação da comunidade/analistas)
INSERT INTO aviso_mural (id, fk_usuario, tipo, rodovia, titulo, descricao, pinned) VALUES
(1, 1, 'atencao', 'Rodovia dos Bandeirantes', 'Tráfego lento devido a obras no Km 42', 'A faixa da direita está interditada para recapeamento. Lentidão de 2km estimada.', 1),
(2, 1, 'info', 'Rodovia Anhangüera', 'Fluxo normalizado após acidente', 'O veículo que bloqueava a faixa 2 no Km 35 já foi removido pelo guincho.', 0);

-- 8. Inserir um comentário fake no mural
INSERT INTO aviso_comentario (fk_aviso, fk_usuario, texto) VALUES
(1, 1, 'Equipe de pista já sinalizou o local com cones.');

INSERT INTO empresa (nome,cnpj) VALUES
('CCR AutoBAn','02.846.056/0001-97'),
('EcoRodovias','04.149.454/0001-80'),
('Arteris','02.919.555/0001-67');

INSERT INTO usuario (nome,email,senha,telefone,perfil,regiao,avatar,cor,ultimo_acesso,role,is_me,fk_empresa) VALUES
('Leandro Almeida','leandro@ccr.com','123456','(11)99999-1111','Gestor','SP Capital','LA','#2563EB','Há 2 minutos','Administrador Geral',1,1),
('Camila Rocha','camila@ccr.com','123456','(11)98888-2222','Analista','Campinas','CR','#14B8A6','Há 10 minutos','Analista Operacional',0,1),
('Rafael Mendes','rafael@ccr.com','123456','(11)97777-3333','Operador','Sorocaba','RM','#F97316','Há 25 minutos','Operador Regional',0,1),

('Juliana Costa','juliana@eco.com','123456','(11)96666-4444','Gestor','Vale do Paraíba','JC','#7C3AED','Há 5 minutos','Gestora Operacional',0,2),
('Bruno Ferreira','bruno@eco.com','123456','(11)95555-5555','Analista','Guarulhos','BF','#0EA5E9','Há 18 minutos','Analista de Fluxo',0,2),
('Patricia Lima','patricia@eco.com','123456','(11)94444-6666','Operador','Litoral Sul','PL','#EF4444','Há 40 minutos','Operadora Regional',0,2),

('Carlos Henrique','carlos@arteris.com','123456','(11)93333-7777','Gestor','Interior SP','CH','#22C55E','Há 7 minutos','Gestor Regional',0,3),
('Fernanda Alves','fernanda@arteris.com','123456','(11)92222-8888','Analista','Ribeirão Preto','FA','#F59E0B','Há 20 minutos','Analista Operacional',0,3),
('Diego Martins','diego@arteris.com','123456','(11)91111-9999','Operador','São Carlos','DM','#EC4899','Há 50 minutos','Operador de Campo',0,3);

INSERT INTO obra (rodovia,descricao,status,data_inicio,data_fim,impacto_previsto,fk_empresa) VALUES
('Rodoanel','Ampliação de faixa no trecho oeste.','Em andamento','2026-06-01','2026-06-20',8,1),
('Rodovia Anhanguera','Recapeamento completo da pista.','Planejada','2026-06-10','2026-07-05',6,1),
('Rodovia dos Bandeirantes','Modernização da sinalização operacional.','Finalizada','2026-04-01','2026-05-10',3,1),
('Rodovia Castello Branco','Intervenção emergencial em viaduto.','Critica','2026-05-28','2026-06-15',10,1),
('Rodovia Raposo Tavares','Melhoria do sistema de drenagem.','Em andamento','2026-06-03','2026-06-25',7,1),

('Sistema Anchieta-Imigrantes','Operação especial na serra.','Critica','2026-05-30','2026-06-20',10,2),
('Rodovia Ayrton Senna','Ampliação de acesso operacional.','Planejada','2026-06-15','2026-07-10',6,2),
('Rodovia Presidente Dutra','Reforma estrutural da ponte.','Em andamento','2026-06-01','2026-06-24',8,2),
('Rodovia Santos Dumont','Substituição de defensas metálicas.','Finalizada','2026-04-05','2026-05-12',3,2),
('Rodovia Dom Pedro I','Implantação de nova sinalização.','Planejada','2026-06-11','2026-07-01',5,2),

('Rodovia Washington Luís','Recuperação de acostamento.','Em andamento','2026-06-04','2026-06-26',7,3),
('Rodovia Marechal Rondon','Manutenção preventiva do pavimento.','Finalizada','2026-03-18','2026-04-20',2,3),
('Rodovia Castello Branco','Interdição parcial após acidente.','Critica','2026-05-26','2026-06-19',10,3),
('Rodovia Raposo Tavares','Ampliação de faixa adicional.','Planejada','2026-06-09','2026-06-29',4,3),
('Rodovia Anhanguera','Reforço estrutural em ponte.','Em andamento','2026-06-02','2026-06-22',9,3);

INSERT INTO aviso_mural (fk_usuario,tipo,rodovia,titulo,descricao,pinned,has_img,likes) VALUES
(1,'urgente','Rodovia dos Bandeirantes','Fluxo crítico no sentido interior','Congestionamento acima do esperado após acidente no KM 41.',1,1,8),
(2,'atencao','Rodovia Anhanguera','Pico operacional previsto','Monitoramento indica aumento de 28% no fluxo entre 17h e 20h.',0,0,5),
(3,'concluido','Rodoanel','Liberação total do trecho oeste','Faixas liberadas após conclusão da manutenção.',0,1,4),

(4,'urgente','Sistema Anchieta-Imigrantes','Operação comboio iniciada','Neblina intensa provocou redução operacional na serra.',1,1,11),
(5,'info','Rodovia Ayrton Senna','Fluxo dentro da normalidade','Movimento segue estável no período da manhã.',0,0,3),
(6,'planejado','Rodovia Presidente Dutra','Nova intervenção programada','Equipe iniciará manutenção preventiva no próximo sábado.',0,0,2),

(7,'urgente','Rodovia Castello Branco','Interdição parcial no KM 78','Equipe operacional atuando em acidente com carga pesada.',1,1,9),
(8,'atencao','Rodovia Washington Luís','Aumento de fluxo previsto','Expectativa de tráfego intenso durante feriado.',0,0,4),
(9,'info','Rodovia Raposo Tavares','Fluxo estabilizado','Movimento normalizado após pico da manhã.',0,0,2);

INSERT INTO aviso_curtida (fk_aviso,fk_usuario) VALUES
(1,2),(1,3),(2,1),(2,3),(3,1),
(4,5),(4,6),(5,4),(6,4),(6,5),
(7,8),(7,9),(8,7),(9,7),(9,8);

INSERT INTO aviso_comentario (fk_aviso,fk_usuario,texto) VALUES
(1,2,'Equipe de monitoramento já acionada para acompanhar o trecho.'),
(1,3,'Fluxo começou a estabilizar após liberação parcial da pista.'),
(2,1,'Vamos reforçar monitoramento no horário de pico.'),

(4,5,'Visibilidade segue reduzida na subida da serra.'),
(4,6,'Equipes operacionais já posicionadas nos acessos.'),
(6,4,'Validar impacto operacional antes do início da manutenção.'),

(7,8,'Trânsito fluindo apenas pela faixa da esquerda.'),
(7,9,'Guinchos já foram acionados para retirada da carga.'),
(8,7,'Monitoramento reforçado para o feriado prolongado.');

INSERT INTO mural_chat (fk_usuario,texto) VALUES
(1,'Bom dia equipe, acompanhar situação da Bandeirantes.'),
(2,'Dashboard atualizado com dados do pico da manhã.'),
(3,'Fluxo melhorando após remoção do veículo no acostamento.'),

(4,'Monitorar operação comboio durante toda a madrugada.'),
(5,'Dados da Anchieta já atualizados no painel operacional.'),
(6,'Equipes confirmaram redução de visibilidade na serra.'),

(7,'Equipe de campo deslocada para Castello Branco.'),
(8,'Atualizando indicadores da Washington Luís.'),
(9,'Fluxo estabilizado na Raposo Tavares.');

INSERT INTO preferencia (fk_usuario,intervalo,regiao_padrao,notif_critica,notif_pico,notif_relatorio,dark_mode) VALUES
(1,'30 segundos','SP Capital',1,1,1,1),
(2,'1 minuto','Campinas',1,1,0,0),
(3,'5 minutos','Sorocaba',1,0,0,1),

(4,'30 segundos','Vale do Paraíba',1,1,1,1),
(5,'1 minuto','Guarulhos',1,1,0,0),
(6,'5 minutos','Litoral Sul',1,0,0,1),

(7,'30 segundos','Interior SP',1,1,1,1),
(8,'1 minuto','Ribeirão Preto',1,1,0,0),
(9,'5 minutos','São Carlos',1,0,0,1);

select * from usuario;
SELECT * from obra;

