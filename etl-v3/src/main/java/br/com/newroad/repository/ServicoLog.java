package br.com.newroad.repository;

import br.com.newroad.log.Log;
import br.com.newroad.util.ConexaoBancoDados;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.*;

/**
 * Repositório responsável pela persistência de eventos de log na tabela
 * {@code log_etl} do MySQL.
 */

public class ServicoLog implements AutoCloseable {

    /** Logger do Logback para saída no console (independente do banco). */
    private static final Logger consoleLog = LoggerFactory.getLogger(ServicoLog.class);

    /** SQL de inserção na tabela de log. */
    private static final String SQL_INSERT =
            "INSERT INTO log_etl (timestamp, nivel_log, classe_origem, mensagem, exception_stacktrace) " +
            "VALUES (?, ?, ?, ?, ?)";

    /** Conexão JDBC dedicada ao log, gerenciada pelo ciclo de vida desta instância. */
    private Connection conexao;

    /**
     * Abre a conexão com o banco dedicada aos logs.
     *
     * @throws SQLException se não for possível conectar
     */
    public ServicoLog() throws SQLException {
        this.conexao = ConexaoBancoDados.obterConexao();

        this.conexao.setAutoCommit(true);
        consoleLog.info("ServicoLog iniciado — conexão de log estabelecida.");
    }

    /**

     */
    public void salvar(Log evento) {
        // 1. Saída no console via Logback
        switch (evento.getNivelLog()) {
            case "ERROR" -> consoleLog.error("{}", evento);
            case "WARN"  -> consoleLog.warn("{}", evento);
            default      -> consoleLog.info("{}", evento);
        }

        // 2. Persistência no banco — falha silenciosa para não interromper o ETL
        if (conexao == null) return;

        try (PreparedStatement ps = conexao.prepareStatement(SQL_INSERT)) {
            ps.setTimestamp(1, Timestamp.valueOf(evento.getTimestamp()));
            ps.setString(2, evento.getNivelLog());
            ps.setString(3, evento.getClasseOrigem());
            ps.setString(4, evento.getMensagem());
            ps.setString(5, evento.getStackTrace());

            ps.executeUpdate();

        } catch (SQLException e) {

            consoleLog.error("Falha ao persistir log no banco: {}", e.getMessage());
        }
    }

    @Override
    public void close() {
        if (conexao != null) {
            try {
                conexao.close();
                consoleLog.info("ServicoLog encerrado — conexão de log fechada.");
            } catch (SQLException e) {
                consoleLog.warn("Erro ao fechar conexão do ServicoLog: {}", e.getMessage());
            }
        }
    }
}
