#!/bin/sh
set -e

# Gerando o arquivo database.properties (que seu código Java usa)
cat > /app/database.properties << PROPS
db.url=jdbc:mysql://${DB_HOST:-mysql-container}:${DB_PORT:-3306}/${DB_NAME:-newroad_db}?useSSL=false&serverTimezone=America/Sao_Paulo&allowPublicKeyRetrieval=true&rewriteBatchedStatements=true&allowLoadLocalInfile=true
db.usuario=${DB_USER:-root}
db.senha=${DB_PASSWORD}

etl.tamanho.lote=5000
etl.fonte=${ETL_FONTE:-S3}
etl.s3.bucket=${S3_BUCKET}
etl.s3.prefixo=${S3_PREFIXO:-}
etl.s3.regiao=${S3_REGIAO:-us-east-1}
PROPS

# Dizendo para o Java rodar procurando as configurações no diretório atual primeiro
exec java -cp /app:/app/app.jar br.com.newroad.Main