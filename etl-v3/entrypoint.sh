#!/bin/sh
set -e
cat > /app/application.properties << PROPS
etl.fonte=${ETL_FONTE:-s3}
s3.bucket=${S3_BUCKET}
s3.prefixo=${S3_PREFIXO:-}
s3.regiao=${S3_REGIAO:-us-east-1}
db.url=jdbc:mysql://${DB_HOST:-mysql-container}:${DB_PORT:-3306}/${DB_NAME:-newroad_db}?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&allowLoadLocalInfile=true
db.usuario=${DB_USER:-root}
db.senha=${DB_PASSWORD}
etl.pasta.temp=/app/temp_csv
etl.min.medicoes=${ETL_MIN_MEDICOES:-5}
PROPS
exec java -jar app.jar