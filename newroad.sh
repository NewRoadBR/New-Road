#!/bin/bash

# ============================================================
#  NewRoad - Script de Gerenciamento
# ============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_DIR=~/New-Road

echo -e "${BLUE}"
echo "============================================================"
echo "              NewRoad - Gerenciador de Ambiente"
echo "============================================================"
echo -e "${NC}"

cd $PROJECT_DIR || {
    echo -e "${RED}[ERRO] Diretório do projeto não encontrado.${NC}"
    exit 1
}

# ------------------------------------------------------------
# 0. VERIFICAR DEPENDÊNCIAS
# ------------------------------------------------------------
echo -e "${YELLOW}[0/4] Verificando dependências...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}[ERRO] Docker não encontrado.${NC}"
    exit 1
fi

echo -e "${GREEN}[OK] Docker: $(docker --version)${NC}"

if ! docker compose version &> /dev/null; then
    echo -e "${RED}[ERRO] Docker Compose não encontrado.${NC}"
    exit 1
fi

echo -e "${GREEN}[OK] Docker Compose: $(docker compose version)${NC}"

# ------------------------------------------------------------
# VERIFICAR .env
# ------------------------------------------------------------
if [ ! -f .env ]; then
    echo -e "${RED}[ERRO] Arquivo .env não encontrado.${NC}"
    exit 1
fi

source .env

echo ""

# ------------------------------------------------------------
# 1. ATUALIZAR CÓDIGO
# ------------------------------------------------------------
echo -e "${YELLOW}[1/4] Atualizando código (git pull)...${NC}"

git fetch origin

git reset --hard origin/main

if [ $? -ne 0 ]; then
    echo -e "${RED}[ERRO] Falha ao atualizar código.${NC}"
    exit 1
fi

echo -e "${GREEN}[OK] Código atualizado!${NC}"
echo ""

# ------------------------------------------------------------
# 1. ATUALIZAR CÓDIGO
# ------------------------------------------------------------


# ------------------------------------------------------------
# 2. BUILD E SUBIR MYSQL + WEB
# ------------------------------------------------------------
echo -e "${YELLOW}[2/4] Buildando e subindo containers...${NC}"

echo -e "${YELLOW}→ Derrubando containers antigos...${NC}"
docker compose down -v --remove-orphans

echo -e "${YELLOW}→ Limpando container ETL antigo...${NC}"
docker rm -f etl-newroad >/dev/null 2>&1 || true

echo -e "${YELLOW}→ Rebuildando imagens...${NC}"
docker compose build --no-cache mysql web etl

if [ $? -ne 0 ]; then
    echo -e "${RED}[ERRO] Falha no build.${NC}"
    exit 1
fi

echo -e "${YELLOW}→ Subindo MySQL e Web...${NC}"
docker compose up -d mysql web

if [ $? -ne 0 ]; then
    echo -e "${RED}[ERRO] Falha ao subir containers.${NC}"
    exit 1
fi

echo -e "${GREEN}[OK] Containers iniciados!${NC}"
echo ""

# ------------------------------------------------------------
# AGUARDAR MYSQL
# ------------------------------------------------------------
echo -e "${YELLOW}→ Aguardando MySQL ficar saudável...${NC}"

until docker exec mysql-container mysqladmin ping -h "localhost" -p"${MYSQL_ROOT_PASSWORD}" --silent &> /dev/null
do
    printf "."
    sleep 2
done

echo ""
echo -e "${GREEN}[OK] MySQL pronto!${NC}"
echo ""

# ------------------------------------------------------------
# 3. ETL
# ------------------------------------------------------------
echo -e "${YELLOW}[3/4] Deseja executar o ETL agora? (s/n):${NC} \c"
read RESPOSTA

if [[ "$RESPOSTA" == "s" || "$RESPOSTA" == "S" ]]; then

    echo -e "${YELLOW}→ Buildando imagem do ETL...${NC}"

    docker compose --profile etl build etl

    if [ $? -ne 0 ]; then
        echo -e "${RED}[ERRO] Falha no build do ETL.${NC}"
        exit 1
    fi

    echo -e "${YELLOW}→ Removendo container ETL antigo...${NC}"
    docker rm -f etl-newroad >/dev/null 2>&1 || true

    echo -e "${YELLOW}→ Executando ETL...${NC}"

    docker compose --profile etl run --rm etl

    EXIT_CODE=$?

    echo ""

    if [ $EXIT_CODE -ne 0 ]; then
        echo -e "${RED}[ERRO] ETL finalizou com erro (exit code: $EXIT_CODE).${NC}"
    else
        echo -e "${GREEN}[OK] ETL executado com sucesso!${NC}"
    fi

    echo ""

    # ----------------------------------------------------------
    # VALIDAÇÃO DO ETL
    # ----------------------------------------------------------
    echo -e "${CYAN}============================================================${NC}"
    echo -e "${CYAN}           Validando dados do ETL no banco${NC}"
    echo -e "${CYAN}============================================================${NC}"

    # ----------------------------------------------------------
    # TOTAL DE REGISTROS
    # ----------------------------------------------------------
    echo -e "${YELLOW}→ Total de registros em registro_trafego:${NC}"

    docker exec mysql-container mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" -e \
    "SELECT COUNT(*) AS total_registros FROM newroad_db.registro_trafego;" \
     2>/dev/null

    echo ""

    # ----------------------------------------------------------
    # ÚLTIMOS REGISTROS
    # ----------------------------------------------------------
    echo -e "${YELLOW}→ Últimos 5 registros inseridos:${NC}"

    docker exec mysql-container mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" -e \
    "SELECT * FROM newroad_db.registro_trafego ORDER BY id DESC LIMIT 5;" \
    2>/dev/null

    echo ""

    # ----------------------------------------------------------
    # LOGS DO ETL
    # ----------------------------------------------------------
    echo -e "${YELLOW}→ Logs do ETL:${NC}"

    docker exec mysql-container mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" -e \
    "SELECT * FROM newroad_db.log_etl ORDER BY id DESC LIMIT 10;" \
    2>/dev/null

    echo ""

    echo -e "${CYAN}============================================================${NC}"
    echo -e "${GREEN}[OK] Validação concluída!${NC}"
    echo -e "${CYAN}============================================================${NC}"

else
    echo -e "${YELLOW}[SKIP] ETL não executado.${NC}"
fi

# ------------------------------------------------------------
# 4. STATUS FINAL
# ------------------------------------------------------------
echo ""
echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}              Aplicações em execução${NC}"
echo -e "${BLUE}============================================================${NC}"

docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

echo ""

echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}           Tudo pronto! NewRoad está no ar.${NC}"
echo -e "${GREEN}============================================================${NC}"

echo ""
