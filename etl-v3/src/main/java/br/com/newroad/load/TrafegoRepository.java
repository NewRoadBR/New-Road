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
                    "(data, hora, lote, praca, sentido, leve_eixos_2, moto_eixos_2, pesado_eixos_2, " +
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

    public void rollback() {
        try { conexao.rollback(); } catch (SQLException ignored) {}
    }

    @Override
    public void close() throws SQLException {
        if (conexao != null) conexao.close();
    }
}
