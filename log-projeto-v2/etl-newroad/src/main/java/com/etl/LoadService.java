package com.etl;

import java.sql.Connection;
import java.sql.PreparedStatement;

/**
 * LOAD — Salva o registro na tabela teste_etl via JDBC.
 */
public class LoadService {

    private static final String SQL =
            "INSERT INTO teste_etl (valor_original, valor_transformado, carregado_em) " +
            "VALUES (?, ?, NOW())";

    public void carregar(String valorOriginal, String valorTransformado) throws Exception {
        System.out.println("[LOAD] Salvando na tabela teste_etl...");

        try (Connection conn = ConexaoDB.obterConexao();
             PreparedStatement stmt = conn.prepareStatement(SQL)) {

            stmt.setString(1, valorOriginal);
            stmt.setString(2, valorTransformado);
            stmt.executeUpdate();

            System.out.println("[LOAD] Registro salvo com sucesso.");
        }
    }
}
