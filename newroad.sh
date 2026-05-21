#!/bin/bash

# ============================================================
#  NewRoad - Script de Gerenciamento
# ============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR=~/New-Road

echo -e "${BLUE}"
echo "============================================================"
echo "              NewRoad - Gerenciador de Ambiente"
echo "============================================================"
echo -e "${NC}"

cd $PROJECT_DIR

# ------------------------------------------------------------
# 0. VERIFICAR DEPENDÊNCIAS
# ------------------------------------------------------------
echo -e "${YELLOW}[0/4] Verificando dependências...${NC}"

# Atualizar pacotes do sistema
echo -e "${YELLOW}  → Atualizando pacotes do sistema...${NC}"
sudo apt-get update -qq && sudo apt-get upgrade -y -qq
echo -e "${GREEN}  [OK] Sistema atualizado!${NC}"

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}  [ERRO] Docker não encontrado. Instale o Docker e tente novamente.${NC}"
    exit 1
fi
echo -e "${GREEN}  [OK] Docker: $(docker --version)${NC}"

# Verificar Docker Compose V2
if ! docker compose version &> /dev/null; then
    echo -e "${YELLOW}  → Docker Compose não encontrado. Instalando...${NC}"
    sudo apt-get install docker-compose-plugin -y -qq
    if ! docker compose version &> /dev/null; then
        echo -e "${RED}  [ERRO] Falha ao instalar Docker Compose.${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}  [OK] Docker Compose: $(docker compose version)${NC}"

echo ""

# ------------------------------------------------------------
# 1. ATUALIZAR CÓDIGO
# ------------------------------------------------------------
echo -e "${YELLOW}[1/4] Atualizando código (git pull)...${NC}"
git pull
echo -e "${GREEN}[OK]${NC}"
echo ""

# ------------------------------------------------------------
# 2. BUILD E SUBIR CONTAINERS
# ------------------------------------------------------------
echo -e "${YELLOW}[2/4] Buildando e subindo containers...${NC}"
docker compose up -d --build mysql web
echo -e "${GREEN}[OK]${NC}"
echo ""

# ------------------------------------------------------------
# 3. ETL
# ------------------------------------------------------------
echo -e "${YELLOW}[3/4] Deseja executar o ETL agora? (s/n):${NC} \c"
read RESPOSTA

if [[ "$RESPOSTA" == "s" || "$RESPOSTA" == "S" ]]; then
    echo -e "${YELLOW}Rodando ETL...${NC}"
    docker compose up --build etl
    echo -e "${GREEN}[OK] ETL finalizado!${NC}"
else
    echo -e "${YELLOW}[SKIP] ETL não executado.${NC}"
fi

# ------------------------------------------------------------
# RESUMO
# ------------------------------------------------------------
echo ""
echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}              Aplicações em execução${NC}"
echo -e "${BLUE}============================================================${NC}"
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}              Tudo pronto! NewRoad está no ar.${NC}"
echo -e "${GREEN}============================================================${NC}"
echo ""