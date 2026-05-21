#!/bin/bash

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
# 1. ATUALIZAR CÓDIGO
# ------------------------------------------------------------
echo -e "${YELLOW}[1/3] Atualizando código (git pull)...${NC}"
git pull
echo -e "${GREEN}[OK]${NC}"
echo ""

# ------------------------------------------------------------
# 2. BUILD E SUBIR CONTAINERS
# ------------------------------------------------------------
echo -e "${YELLOW}[2/3] Buildando e subindo containers...${NC}"
docker compose up -d --build mysql web
echo -e "${GREEN}[OK]${NC}"
echo ""

# ------------------------------------------------------------
# 3. ETL
# ------------------------------------------------------------
echo -e "${YELLOW}[3/3] Deseja executar o ETL agora? (s/n):${NC} \c"
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