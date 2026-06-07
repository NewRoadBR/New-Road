package br.com.newroad.util;

import java.sql.Connection;
import java.sql.PreparedStatement;

public class ServicoNotificacao {

    public static void salvar(String mensagem, String tipo) {

        String titulo;

        switch (tipo) {
            case "success":
                titulo = "ETL Concluído";
                break;
            case "error":
                titulo = "ETL Falhou";
                break;
            default:
                titulo = "ETL Iniciado";
        }

        String sql = """
            INSERT INTO notificacoes
            (titulo, mensagem, tipo)
            VALUES (?, ?, ?)
        """;

        try (
            Connection conn = ConexaoBancoDados.obterConexao();
            PreparedStatement ps = conn.prepareStatement(sql)
        ) {

            ps.setString(1, titulo);
            ps.setString(2, mensagem);
            ps.setString(3, tipo);

            ps.executeUpdate();

        } catch (Exception e) {
            System.err.println(
                "Erro ao salvar notificação: " + e.getMessage()
            );
        }
    }
}