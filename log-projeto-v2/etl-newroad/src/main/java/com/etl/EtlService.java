package com.etl;

import java.sql.Connection;
import java.sql.PreparedStatement;

/**
 * Orquestrador do pipeline ETL.
 * Chama Extract → Transform → Load e registra cada etapa em etl_log.
 */
public class EtlService {

    private static final String SQL_LOG =
            "INSERT INTO etl_log (etapa, status, mensagem, registrado_em) " +
            "VALUES (?, ?, ?, NOW())";

    private final ExtractService   extractService   = new ExtractService();
    private final TransformService transformService = new TransformService();
    private final LoadService      loadService      = new LoadService();

    public void executar() {
        try {
            String valorOriginal     = extractService.extrair();
            log("EXTRACT", "SUCESSO", "Valor lido: " + valorOriginal);

            String valorTransformado = transformService.transformar(valorOriginal);
            log("TRANSFORM", "SUCESSO", "Valor transformado: " + valorTransformado);

            loadService.carregar(valorOriginal, valorTransformado);
            log("LOAD", "SUCESSO", "Registro salvo com sucesso");

        } catch (Exception e) {
            log("PIPELINE", "ERRO", e.getMessage());
            throw new RuntimeException("Pipeline ETL falhou", e);
        }
    }

    private void log(String etapa, String status, String mensagem) {
        try (Connection conn = ConexaoDB.obterConexao();
             PreparedStatement stmt = conn.prepareStatement(SQL_LOG)) {

            stmt.setString(1, etapa);
            stmt.setString(2, status);
            stmt.setString(3, mensagem);
            stmt.executeUpdate();

            System.out.println("[LOG] " + etapa + " | " + status + " | " + mensagem);

        } catch (Exception e) {
            System.err.println("[LOG] Falha ao registrar log: " + e.getMessage());
        }
    }
}
