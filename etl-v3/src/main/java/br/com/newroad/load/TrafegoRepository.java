package br.com.newroad.load;

import br.com.newroad.model.RegistroTrafegoDetalhado;
import br.com.newroad.util.ConexaoBancoDados;

import java.io.File;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.StringJoiner;

/**
 * Repositório de carga em massa na tabela registro_trafego.
 * O CSV intermediário é gerado pelo ProcessadorETL e carregado via
 * LOAD DATA LOCAL INFILE.
 */
public class TrafegoRepository implements AutoCloseable {

    private static final String SQL_LOAD_DATA =
            "LOAD DATA LOCAL INFILE '%s' INTO TABLE registro_trafego " +
                    "FIELDS TERMINATED BY ',' ENCLOSED BY '\"' ESCAPED BY '\\\\' " +
                    "LINES TERMINATED BY '\r\n' " +
                    "(data, hora, praca, sentido, leve_eixos_2, moto_eixos_2, pesado_eixos_2, " +
                    "leve_eixos_3, pesado_eixos_3, leve_eixos_4, pesado_eixos_4, pesado_eixos_5, pesado_eixos_6, especial, arquivo_origem)";

    private final Connection conexao;

    public TrafegoRepository() throws SQLException {
        this.conexao = ConexaoBancoDados.obterConexao();
        this.conexao.setAutoCommit(false);
    }

    public int carregarArquivoCSV(File arquivoCsv) throws SQLException {
        String caminho = arquivoCsv.getAbsolutePath().replace('\\', '/');
        String sql = String.format(SQL_LOAD_DATA, caminho.replace("'", "\\'"));
        try (Statement stmt = conexao.createStatement()) {
            int resultado = stmt.executeUpdate(sql);
            conexao.commit();
            return resultado;
        }
    }

    public void atualizarHistoricoRodovia() throws SQLException {
        try (Statement stmt = conexao.createStatement()) {
            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS trafego_rodovia_historico ("
                    + "rodovia VARCHAR(120) NOT NULL, "
                    + "dia_semana TINYINT NOT NULL, "
                    + "hora TINYINT NOT NULL, "
                    + "volume_total DECIMAL(12,2), "
                    + "volume_leve DECIMAL(12,2), "
                    + "volume_pesado DECIMAL(12,2), "
                    + "volume_moto DECIMAL(12,2), "
                    + "volume_especial DECIMAL(12,2), "
                    + "PRIMARY KEY (rodovia, dia_semana, hora)"
                    + ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

            stmt.executeUpdate("TRUNCATE TABLE trafego_rodovia_historico");

            stmt.executeUpdate(
                    "INSERT INTO trafego_rodovia_historico ("
                            + "rodovia, dia_semana, hora, volume_total, volume_leve, volume_pesado, volume_moto, volume_especial) "
                            + "SELECT m.rodovia, DAYOFWEEK(r.data) AS dia_semana, r.hora, "
                            + "ROUND(AVG(r.volume_total), 2) AS volume_total, "
                            + "ROUND(AVG(COALESCE(r.leve_eixos_2,0) + COALESCE(r.leve_eixos_3,0) + COALESCE(r.leve_eixos_4,0)), 2) AS volume_leve, "
                            + "ROUND(AVG(COALESCE(r.pesado_eixos_2,0) + COALESCE(r.pesado_eixos_3,0) + COALESCE(r.pesado_eixos_4,0) + COALESCE(r.pesado_eixos_5,0) + COALESCE(r.pesado_eixos_6,0)), 2) AS volume_pesado, "
                            + "ROUND(AVG(COALESCE(r.moto_eixos_2,0)), 2) AS volume_moto, "
                            + "ROUND(AVG(COALESCE(r.especial,0)), 2) AS volume_especial "
                            + "FROM registro_trafego r "
                            + "JOIN mapa_praca_rodovia m ON m.praca = r.praca "
                            + "WHERE r.hora BETWEEN 1 AND 23 "
                            + "GROUP BY m.rodovia, DAYOFWEEK(r.data), r.hora");

            conexao.commit();
        }
    }

    public void rollback() {
        try { conexao.rollback(); } catch (SQLException ignored) {}
    }

    @Override
    public void close() throws SQLException {
        if (conexao != null) conexao.close();
    }
}
