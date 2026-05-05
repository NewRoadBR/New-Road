package com.etl;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;

import java.io.InputStream;
import java.util.Properties;

/**
 * EXTRACT — Baixa o Excel do S3 e lê a única célula existente (A1).
 */
public class ExtractService {

    private final String bucket;
    private final String key;
    private final Region region;

    public ExtractService() {
        Properties props = ConexaoDB.getProps();
        this.bucket = props.getProperty("s3.bucket");
        this.key    = props.getProperty("s3.key");
        this.region = Region.of(props.getProperty("s3.region", "us-east-1"));
    }

    public String extrair() throws Exception {
        System.out.printf("[EXTRACT] Baixando s3://%s/%s%n", bucket, key);

        try (S3Client s3           = buildS3Client();
             InputStream s3Stream  = downloadFromS3(s3);
             Workbook workbook     = new XSSFWorkbook(s3Stream)) {

            String valor = lerUnicaCelula(workbook);
            System.out.println("[EXTRACT] Valor lido: '" + valor + "'");
            return valor;
        }
    }

    // ------------------------------------------------------------------ helpers

    private S3Client buildS3Client() {
        return S3Client.builder()
                .region(region)
                .build();
    }

    private InputStream downloadFromS3(S3Client s3) {
        return s3.getObject(GetObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build());
    }

    private String lerUnicaCelula(Workbook workbook) {
        Cell cell = workbook.getSheetAt(0).getRow(0).getCell(0);

        if (cell == null || cell.getCellType() != CellType.STRING) {
            throw new IllegalStateException(
                    "[EXTRACT] Célula A1 ausente ou não é texto.");
        }

        String valor = cell.getStringCellValue().trim();

        if (valor.isEmpty()) {
            throw new IllegalStateException("[EXTRACT] Célula A1 está vazia.");
        }

        return valor;
    }
}