-- ════════════════════════════════════════════════════════════════
--  NewRoad — Script de banco de dados (schema + seed com mocks)
--  Execute em ordem; recria o banco do zero.
-- ════════════════════════════════════════════════════════════════
SET NAMES utf8mb4;

DROP DATABASE IF EXISTS newroad_db;
CREATE DATABASE newroad_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE newroad_db;

-- ────────────────────────────────────────────────────────────────
--  TABELAS
-- ────────────────────────────────────────────────────────────────

CREATE TABLE empresa (
    id          INT UNSIGNED AUTO_INCREMENT PR"IMARY KEY,
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
    status          ENUM('ativo','inativo','pendente') DEFAULT 'ativo',
    ultimo_acesso   VARCHAR(40),
    role            VARCHAR(60),
    is_me           TINYINT(1) DEFAULT 0,
    fk_empresa      INT UNSIGNED,
    criado_em       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fk_empresa) REFERENCES empresa(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE obra (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    local           VARCHAR(200) NOT NULL,
    bairro          VARCHAR(100),
    tipo            VARCHAR(80),
    data_inicio     DATE,
    duracao         SMALLINT,
    impacto         TINYINT UNSIGNED,
    status          ENUM('planned','ongoing','completed','critical') DEFAULT 'planned',
    lat             DECIMAL(10,7),
    lng             DECIMAL(10,7),
    marcador        ENUM('red','yellow','green') DEFAULT 'yellow',
    urgencia        ENUM('baixa','media','alta','urgente') DEFAULT 'media',
    grau_urgencia   SMALLINT,
    descricao       TEXT,
    criado_em       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE aviso_mural (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    fk_usuario  INT UNSIGNED NOT NULL,
    tipo        ENUM('urgente','atencao','info','concluido','planejado') NOT NULL,
    regiao      VARCHAR(50) NOT NULL,
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

-- ────────────────────────────────────────────────────────────────
--  SEED — dados equivalentes aos mocks em public/js/script.js
-- ────────────────────────────────────────────────────────────────

INSERT INTO empresa (id, nome, cnpj) VALUES
  (1, 'NewRoad SP', '12.345.678/0001-90');

-- Usuários: combinação de MOCK_USERS (página Usuários) + MURAL_USERS (mural).
-- IDs 1..8 batem com MURAL_USERS; senha padrão 'senha123' para testes.
INSERT INTO usuario (id, nome, email, senha, perfil, regiao, avatar, cor, role, is_me, status, ultimo_acesso, fk_empresa) VALUES
  (1, 'Eng. Mateus',       'mateus.silva@newroad.sp',     'senha123', 'Gestor',   'SP Region',  'EM', '#2563eb', 'Gestor SP',           1, 'ativo', 'Hoje, 09:11', 1),
  (2, 'Ana Carvalho',      'ana.carvalho@newroad.sp',     'senha123', 'Analista', 'Zona Norte', 'AC', '#0d9488', 'Técnica de Campo',    0, 'ativo', 'Hoje, 08:45', 1),
  (3, 'Roberto Farias',    'roberto.farias@newroad.sp',   'senha123', 'Analista', 'Zona Norte', 'RF', '#8b5cf6', 'Inspetor Norte',      0, 'ativo', 'Ontem, 17:30', 1),
  (4, 'Lívia Prado',       'livia.prado@newroad.sp',      'senha123', 'Analista', 'Zona Sul',   'LP', '#f59e0b', 'Coord. Sul',          0, 'ativo', '15/07/2025',   1),
  (5, 'Diego Torres',      'diego.torres@newroad.sp',     'senha123', 'Operador', 'Centro',     'DT', '#ef4444', 'Eng. Tráfego',        0, 'ativo', 'Hoje, 07:58',  1),
  (6, 'Camila Santos',     'camila.santos@newroad.sp',    'senha123', 'Analista', 'Zona Leste', 'CS', '#10b981', 'Analista Leste',      0, 'ativo', 'Hoje, 09:02',  1),
  (7, 'Felipe Oliveira',   'felipe.oliveira@newroad.sp',  'senha123', 'Operador', 'Zona Oeste', 'FO', '#f97316', 'Tec. Semáforos',      0, 'ativo', 'Nunca',        1),
  (8, 'Marina Ramos',      'marina.ramos@newroad.sp',     'senha123', 'Analista', 'Pinheiros',  'MR', '#06b6d4', 'Supervisora Oeste',   0, 'ativo', 'Ontem, 14:22', 1);

-- Obras (10 itens equivalentes a OBRAS_CADASTRADAS)
INSERT INTO obra (id, local, bairro, tipo, data_inicio, duracao, impacto, status, lat, lng, marcador, urgencia, grau_urgencia, descricao) VALUES
  (1,  'Av. Paulista, 1578',          'Bela Vista',       'Recapeamento',         '2025-07-10', 18, 72, 'ongoing',   -23.5631, -46.6542, 'red',    'alta',     5,  'Recapeamento total da via com troca de guias'),
  (2,  'R. da Consolação',            'Consolação',       'Galeria de drenagem',  '2025-07-22', 30, 88, 'planned',   -23.5569, -46.6580, 'red',    'urgente',  3,  'Instalação de nova galeria pluvial'),
  (3,  'Av. Ipiranga, 200',           'República',        'Sinalização viária',   '2025-07-05',  5, 28, 'completed', -23.5445, -46.6394, 'green',  'baixa',   15,  'Atualização de faixas e placas de sinalização'),
  (4,  'Viaduto do Chá',              'Centro',           'Estrutural',           '2025-08-01', 45, 91, 'planned',   -23.5461, -46.6370, 'red',    'urgente',  2,  'Reforço estrutural das vigas e pilares'),
  (5,  'Av. Rebouças, 3200',          'Pinheiros',        'Pavimentação',         '2025-07-15', 12, 48, 'ongoing',   -23.5598, -46.6733, 'yellow', 'media',   10,  'Pavimentação de trecho deteriorado'),
  (6,  'Av. Brigadeiro Faria Lima',   'Pinheiros',        'Rede elétrica',        '2025-07-20',  8, 55, 'planned',   -23.5680, -46.6932, 'yellow', 'media',   12,  'Substituição de cabos e postes na via'),
  (7,  'Rua Augusta, 800',            'Cerqueira César',  'Calçada acessível',    '2025-07-08',  6, 18, 'completed', -23.5554, -46.6588, 'green',  'baixa',   20,  'Adequação de calçadas às normas de acessibilidade'),
  (8,  'Av. 9 de Julho',              'Jardins',          'Canalização',          '2025-08-10', 22, 62, 'planned',   -23.5635, -46.6653, 'yellow', 'alta',     7,  'Canalização de córrego e galerias pluviais'),
  (9,  'Av. Radial Leste',            'Brás',             'Recapeamento',         '2025-07-12', 20, 45, 'ongoing',   -23.5420, -46.6080, 'yellow', 'media',   14,  'Recapeamento asfáltico em trecho degradado'),
  (10, 'Tnel. Jânio Quadros',         'Barra Funda',      'Inspeção estrutural',  '2025-07-30',  3, 80, 'planned',   -23.5243, -46.6575, 'red',    'urgente',  4,  'Inspeção e diagnóstico estrutural do túnel');

-- Avisos do mural (8 itens equivalentes a muralAvisos). criado_em escalonado para refletir time relativo
INSERT INTO aviso_mural (id, fk_usuario, tipo, regiao, titulo, descricao, pinned, has_img, likes, criado_em) VALUES
  (1, 2, 'urgente',   'Zona Leste',  'Afundamento crítico na Radial Leste — km 8',
     'Detectado afundamento de aproximadamente 40 cm no pavimento próximo ao viaduto Bresser. Trecho interditado no sentido centro. Aguardando equipe de emergência.',
     1, 1, 7, (NOW() - INTERVAL 8 MINUTE)),
  (2, 5, 'urgente',   'Centro',      'Semáforo apagado no cruzamento Viaduto do Chá × R. Direita',
     'Falha de energia no quadro de controle. Agentes de trânsito já acionados para o local. Previsão de normalização em 2h.',
     0, 0, 4, (NOW() - INTERVAL 22 MINUTE)),
  (3, 3, 'atencao',   'Zona Norte',  'Pico de tráfego 34% acima da média — Marginal Tietê sentido Castelo',
     'Volume registrado às 08h20 excedeu limiar histórico. Recomenda-se ativação do sinal de coordenação verde para fluxo norte–sul na malha de vias paralelas.',
     0, 0, 2, (NOW() - INTERVAL 45 MINUTE)),
  (4, 2, 'info',      'Av. Paulista','Início de obras de recapeamento — Av. Paulista trecho Consolação',
     'As obras programadas terão início amanhã às 01h. Equipamentos já posicionados. Impacto estimado em 72% — desvios sinalizados via app CET SP.',
     0, 0, 9, (NOW() - INTERVAL 2 HOUR)),
  (5, 6, 'atencao',   'Zona Leste',  'Alagamento pontual na R. do Gasômetro após chuva intensa',
     'Lâmina de água de ~15 cm bloqueando faixa da direita. Bomba de recalque ativada. Monitoramento contínuo até normalização.',
     0, 0, 3, (NOW() - INTERVAL 3 HOUR)),
  (6, 8, 'concluido', 'Zona Oeste',  'Obra de galeria de drenagem concluída — Av. Rebouças km 3',
     'Trecho totalmente liberado após 12 dias de obras. Sinalização definitiva implantada. Pavimento em excelente estado.',
     0, 0, 15, (NOW() - INTERVAL 5 HOUR)),
  (7, 1, 'info',      'Zona Sul',    'Relatório semanal de tráfego disponível — semana 27',
     'O relatório consolidado com dados de fluxo, incidentes e obras da semana 27/2025 está disponível no sistema. Destaques: redução de 8% no congestionamento na Zona Sul.',
     0, 0, 6, (NOW() - INTERVAL 8 HOUR)),
  (8, 2, 'planejado', 'Centro',      'Interdição planejada: Viaduto do Chá — inspeção estrutural (01/08)',
     'Na próxima sexta-feira haverá inspeção estrutural completa. Interdição das 22h às 06h. Desvios serão sinalizados com 48h de antecedência.',
     0, 0, 5, (NOW() - INTERVAL 12 HOUR));

-- Comentários do mural
INSERT INTO aviso_comentario (fk_aviso, fk_usuario, texto, criado_em) VALUES
  (1, 3, 'Equipe do Norte confirmou deslocamento. ETA 25 min.', (NOW() - INTERVAL 5 MINUTE)),
  (1, 1, 'Sinalizando desvio pela Av. Celso Garcia. Atualizando mapa.', (NOW() - INTERVAL 2 MINUTE)),
  (2, 7, 'Técnico de semáforos a caminho. Será necessária substituição da placa de controle.', (NOW() - INTERVAL 15 MINUTE)),
  (4, 1, 'Comunicado enviado para a imprensa local. Câmeras monitorando o trecho.', (NOW() - INTERVAL 90 MINUTE)),
  (6, 1, 'Parabéns à equipe! Prazo cumprido com 2 dias de antecedência.', (NOW() - INTERVAL 270 MINUTE));

-- Chat do mural
INSERT INTO mural_chat (fk_usuario, texto, criado_em) VALUES
  (2, 'Bom dia equipe! Situação na Radial Leste está crítica. Todos atualizados?', (NOW() - INTERVAL 30 MINUTE)),
  (3, 'Ciente. Já estou deslocando para o local com a equipe Norte.',              (NOW() - INTERVAL 28 MINUTE)),
  (5, 'Semáforo do Viaduto do Chá também saiu. Felipe, você pode dar uma passada?',(NOW() - INTERVAL 20 MINUTE)),
  (7, 'Estou a 10 min do local!',                                                  (NOW() - INTERVAL 19 MINUTE)),
  (6, 'Alagamento na Zona Leste normalizado.',                                     (NOW() - INTERVAL 5 MINUTE));

-- Preferências default para o usuário 1 (Eng. Mateus)
INSERT INTO preferencia (fk_usuario, intervalo, regiao_padrao, notif_critica, notif_pico, notif_relatorio, dark_mode) VALUES
  (1, '1 minuto', 'SP Region (todas)', 1, 1, 1, 0);
