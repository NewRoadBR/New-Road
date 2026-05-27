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

cd $PROJECT_DIR

# ------------------------------------------------------------
# 0. VERIFICAR DEPENDÊNCIAS
# ------------------------------------------------------------
echo -e "${YELLOW}[0/4] Verificando dependências...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}  [ERRO] Docker não encontrado. Instale o Docker e tente novamente.${NC}"
    exit 1
fi
echo -e "${GREEN}  [OK] Docker: $(docker --version)${NC}"

if ! docker compose version &> /dev/null; then
    echo -e "${YELLOW}  → Docker Compose não encontrado.${NC}"
    echo -e "${BLUE}  Deseja instalar agora? (s/n):${NC} \c"
    read INSTALAR
    if [[ "$INSTALAR" == "s" || "$INSTALAR" == "S" ]]; then
        sudo apt-get update -qq
        sudo apt-get install docker-compose-plugin -y -qq
        echo -e "${GREEN}  [OK] Docker Compose instalado: $(docker compose version)${NC}"
    else
        echo -e "${RED}  [ERRO] Docker Compose é necessário. Abortando.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}  [OK] Docker Compose: $(docker compose version)${NC}"
fi

echo ""
echo -e "${BLUE}  Deseja atualizar o ambiente do sistema? (s/n):${NC} \c"
read ATUALIZAR
if [[ "$ATUALIZAR" == "s" || "$ATUALIZAR" == "S" ]]; then
    echo -e "${YELLOW}  → Atualizando sistema...${NC}"
    sudo apt-get update -qq && sudo apt-get upgrade -y -qq
    echo -e "${GREEN}  [OK] Sistema atualizado!${NC}"
else
    echo -e "${YELLOW}  [SKIP] Atualização do sistema ignorada.${NC}"
fi

echo ""

# ------------------------------------------------------------
# 1. ATUALIZAR CÓDIGO
# ------------------------------------------------------------
echo -e "${YELLOW}[1/4] Atualizando código (git pull)...${NC}"
git pull
echo -e "${GREEN}[OK]${NC}"
echo ""

# ------------------------------------------------------------
# 2. BUILD E SUBIR CONTAINERS (mysql + web apenas)
# ------------------------------------------------------------
echo -e "${YELLOW}[2/4] Buildando e subindo containers...${NC}"

echo -e "${YELLOW}  → Derrubando containers existentes...${NC}"
docker compose down

echo -e "${YELLOW}  → Rebuild sem cache (garante imagem atualizada)...${NC}"
docker compose build --no-cache mysql web

echo -e "${YELLOW}  → Subindo containers...${NC}"
docker compose up -d mysql web

echo -e "${GREEN}[OK]${NC}"
echo ""

# ------------------------------------------------------------
# 3. ETL
# ------------------------------------------------------------
echo -e "${YELLOW}[3/4] Deseja executar o ETL agora? (s/n):${NC} \c"
read RESPOSTA

if [[ "$RESPOSTA" == "s" || "$RESPOSTA" == "S" ]]; then
    echo -e "${YELLOW}  → Buildando e rodando ETL...${NC}"
    docker compose --profile etl up --build etl
    EXIT_CODE=$?

    if [ $EXIT_CODE -ne 0 ]; then
        echo -e "${RED}  [ERRO] ETL finalizou com erro (exit code: $EXIT_CODE).${NC}"
    else
        echo -e "${GREEN}  [OK] ETL finalizado!${NC}"
    fi

    echo ""

    # ----------------------------------------------------------
    # VALIDAÇÃO DO ETL VIA SELECT NO BANCO
    # ----------------------------------------------------------
    echo -e "${CYAN}============================================================${NC}"
    echo -e "${CYAN}              Validando dados do ETL no banco...${NC}"
    echo -e "${CYAN}============================================================${NC}"

    DB_PASSWORD=$(grep MYSQL_ROOT_PASSWORD .env | cut -d '=' -f2 | tr -d '"\r')

    # Total de registros de tráfego inseridos
    echo -e "${YELLOW}  → registros em transito_sp.registro_trafego:${NC}"
    docker exec mysql-container mysql -uroot -p"${DB_PASSWORD}" -e \
        "SELECT COUNT(*) AS total_registros FROM transito_sp.registro_trafego;" \
        2>/dev/null
    echo ""

    # Últimos 5 registros inseridos
    echo -e "${YELLOW}  → últimos 5 registros inseridos:${NC}"
    docker exec mysql-container mysql -uroot -p"${DB_PASSWORD}" -e \
        "SELECT * FROM transito_sp.registro_trafego ORDER BY id DESC LIMIT 5;" \
        2>/dev/null
    echo ""

    # Log das execuções do ETL
    echo -e "${YELLOW}  → log das execuções do ETL (log_etl):${NC}"
    docker exec mysql-container mysql -uroot -p"${DB_PASSWORD}" -e \
        "SELECT * FROM transito_sp.log_etl ORDER BY id DESC LIMIT 5;" \
        2>/dev/null
    echo ""

    echo -e "${CYAN}============================================================${NC}"
    echo -e "${GREEN}  [OK] Validação concluída!${NC}"
    echo -e "${CYAN}============================================================${NC}"

else
    echo -e "${YELLOW}  [SKIP] ETL não executado.${NC}"
fi

# ------------------------------------------------------------
# RESUMO FINAL
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