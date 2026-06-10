-- CreateTable
CREATE TABLE `aviso_comentario` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `fk_aviso` INTEGER UNSIGNED NOT NULL,
    `fk_usuario` INTEGER UNSIGNED NOT NULL,
    `texto` TEXT NOT NULL,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_aviso`(`fk_aviso`),
    INDEX `fk_usuario`(`fk_usuario`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `aviso_curtida` (
    `fk_aviso` INTEGER UNSIGNED NOT NULL,
    `fk_usuario` INTEGER UNSIGNED NOT NULL,

    INDEX `fk_usuario`(`fk_usuario`),
    PRIMARY KEY (`fk_aviso`, `fk_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `aviso_mural` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `fk_usuario` INTEGER UNSIGNED NOT NULL,
    `tipo` ENUM('urgente', 'atencao', 'info', 'concluido', 'planejado') NOT NULL,
    `rodovia` VARCHAR(200) NOT NULL,
    `titulo` VARCHAR(200) NOT NULL,
    `descricao` TEXT NULL,
    `pinned` BOOLEAN NULL DEFAULT false,
    `has_img` BOOLEAN NULL DEFAULT false,
    `likes` INTEGER NULL DEFAULT 0,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_usuario`(`fk_usuario`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `empresa` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(120) NOT NULL,
    `cnpj` VARCHAR(20) NULL,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `log_etl` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `nivel_log` VARCHAR(10) NOT NULL,
    `classe_origem` VARCHAR(255) NOT NULL,
    `mensagem` TEXT NOT NULL,
    `exception_stacktrace` MEDIUMTEXT NULL,

    INDEX `idx_nivel_log`(`nivel_log`),
    INDEX `idx_timestamp`(`timestamp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mapa_praca_rodovia` (
    `praca` VARCHAR(120) NOT NULL,
    `rodovia` VARCHAR(120) NOT NULL,

    PRIMARY KEY (`praca`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mural_chat` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `fk_usuario` INTEGER UNSIGNED NOT NULL,
    `texto` TEXT NOT NULL,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_usuario`(`fk_usuario`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `obra` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `rodovia` VARCHAR(200) NOT NULL,
    `descricao` TEXT NULL,
    `status` ENUM('Planejada', 'Em andamento', 'Finalizada', 'Critica') NULL DEFAULT 'Planejada',
    `data_inicio` DATE NOT NULL,
    `data_fim` DATE NULL,
    `impacto_previsto` TINYINT UNSIGNED NULL DEFAULT 0,
    `fk_empresa` INTEGER UNSIGNED NULL,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_empresa`(`fk_empresa`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `preferencia` (
    `fk_usuario` INTEGER UNSIGNED NOT NULL,
    `intervalo` VARCHAR(20) NULL DEFAULT '1 minuto',
    `regiao_padrao` VARCHAR(50) NULL DEFAULT 'SP Region (todas)',
    `notif_critica` BOOLEAN NULL DEFAULT true,
    `notif_pico` BOOLEAN NULL DEFAULT true,
    `notif_relatorio` BOOLEAN NULL DEFAULT true,
    `dark_mode` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`fk_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `registro_trafego` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `data` DATE NOT NULL,
    `hora` TINYINT NOT NULL,
    `praca` VARCHAR(100) NOT NULL,
    `sentido` VARCHAR(50) NOT NULL,
    `leve_eixos_2` INTEGER NOT NULL DEFAULT 0,
    `moto_eixos_2` INTEGER NOT NULL DEFAULT 0,
    `pesado_eixos_2` INTEGER NOT NULL DEFAULT 0,
    `leve_eixos_3` INTEGER NOT NULL DEFAULT 0,
    `pesado_eixos_3` INTEGER NOT NULL DEFAULT 0,
    `leve_eixos_4` INTEGER NOT NULL DEFAULT 0,
    `pesado_eixos_4` INTEGER NOT NULL DEFAULT 0,
    `pesado_eixos_5` INTEGER NOT NULL DEFAULT 0,
    `pesado_eixos_6` INTEGER NOT NULL DEFAULT 0,
    `especial` INTEGER NOT NULL DEFAULT 0,
    `volume_total` INTEGER NULL,
    `arquivo_origem` VARCHAR(255) NOT NULL,

    INDEX `idx_arquivo`(`arquivo_origem`),
    INDEX `idx_data_hora`(`data`, `hora`),
    INDEX `idx_praca_hora`(`praca`, `hora`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trafego_rodovia_historico` (
    `rodovia` VARCHAR(120) NOT NULL,
    `dia_semana` TINYINT NOT NULL,
    `hora` TINYINT NOT NULL,
    `volume_total` DECIMAL(12, 2) NULL,
    `volume_leve` DECIMAL(12, 2) NULL,
    `volume_pesado` DECIMAL(12, 2) NULL,
    `volume_moto` DECIMAL(12, 2) NULL,
    `volume_especial` DECIMAL(12, 2) NULL,

    PRIMARY KEY (`rodovia`, `dia_semana`, `hora`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuario` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(120) NOT NULL,
    `email` VARCHAR(160) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `telefone` VARCHAR(30) NULL,
    `perfil` ENUM('Gestor', 'Analista', 'Operador', 'Suporte') NULL DEFAULT 'Analista',
    `regiao` VARCHAR(50) NULL DEFAULT 'SP Region',
    `avatar` CHAR(2) NULL,
    `cor` CHAR(7) NULL,
    `ultimo_acesso` VARCHAR(40) NULL,
    `role` VARCHAR(60) NULL,
    `is_me` BOOLEAN NULL DEFAULT false,
    `fk_empresa` INTEGER UNSIGNED NULL,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `email`(`email`),
    INDEX `fk_empresa`(`fk_empresa`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `aviso_comentario` ADD CONSTRAINT `aviso_comentario_ibfk_1` FOREIGN KEY (`fk_aviso`) REFERENCES `aviso_mural`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `aviso_comentario` ADD CONSTRAINT `aviso_comentario_ibfk_2` FOREIGN KEY (`fk_usuario`) REFERENCES `usuario`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `aviso_curtida` ADD CONSTRAINT `aviso_curtida_ibfk_1` FOREIGN KEY (`fk_aviso`) REFERENCES `aviso_mural`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `aviso_curtida` ADD CONSTRAINT `aviso_curtida_ibfk_2` FOREIGN KEY (`fk_usuario`) REFERENCES `usuario`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `aviso_mural` ADD CONSTRAINT `aviso_mural_ibfk_1` FOREIGN KEY (`fk_usuario`) REFERENCES `usuario`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mural_chat` ADD CONSTRAINT `mural_chat_ibfk_1` FOREIGN KEY (`fk_usuario`) REFERENCES `usuario`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `obra` ADD CONSTRAINT `obra_ibfk_1` FOREIGN KEY (`fk_empresa`) REFERENCES `empresa`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `preferencia` ADD CONSTRAINT `preferencia_ibfk_1` FOREIGN KEY (`fk_usuario`) REFERENCES `usuario`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `usuario` ADD CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`fk_empresa`) REFERENCES `empresa`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;
