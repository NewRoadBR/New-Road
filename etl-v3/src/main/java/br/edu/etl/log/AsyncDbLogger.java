package br.edu.etl.log;

import br.edu.etl.config.Db;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

/**
 * Logger assincrono que persiste logs na tabela log_etl do MySQL.
 *
 * COMO FUNCIONA:
 * Em vez de gravar cada log direto no banco (o que seria um INSERT extra
 * por linha lida e travaria o ETL), os logs vao para uma fila em memoria.
 * Uma thread separada esvazia essa fila em lote a cada 200ms ou quando
 * acumula 100 registros — sem impactar a velocidade do ETL principal.
 *
 * USO:
 *   AsyncDbLogger log = AsyncDbLogger.criar("EXTRACT");
 *   log.info("Lendo arquivo parte1.xlsx");
 *   log.aviso("3 timestamps invalidos ignorados");
 *   log.erro("Falha ao abrir arquivo", excecao);
 *   log.fechar(); // ao final da etapa
 */
public class AsyncDbLogger {

    private static final Logger console = LoggerFactory.getLogger(AsyncDbLogger.class);

    private static final String SQL = """
            INSERT INTO log_etl (data_hora, nivel, etapa, mensagem, detalhe_erro, id_execucao)
            VALUES (?, ?, ?, ?, ?, ?)
            """;

    // ID unico compartilhado por toda a execucao do ETL
    private static final String ID_EXECUCAO = UUID.randomUUID().toString();

    private final String etapa;
    private final BlockingQueue<Entrada> fila = new ArrayBlockingQueue<>(2000);
    private final Thread threadGravacao;
    private volatile boolean ativo = true;

    private AsyncDbLogger(String etapa) {
        this.etapa = etapa;
        this.threadGravacao = new Thread(this::loopGravacao, "log-db-" + etapa);
        this.threadGravacao.setDaemon(true);
        this.threadGravacao.start();
    }

    public static AsyncDbLogger criar(String etapa) {
        return new AsyncDbLogger(etapa);
    }

    public static String idExecucao() {
        return ID_EXECUCAO;
    }

    // ── API publica ───────────────────────────────────────────────

    public void info(String mensagem) {
        console.info("[{}] {}", etapa, mensagem);
        enfileirar("INFO", mensagem, null);
    }

    public void aviso(String mensagem) {
        console.warn("[{}] {}", etapa, mensagem);
        enfileirar("AVISO", mensagem, null);
    }

    public void erro(String mensagem, Throwable t) {
        console.error("[{}] {}", etapa, mensagem, t);
        enfileirar("ERRO", mensagem, t != null ? stackTrace(t) : null);
    }

    public void erro(String mensagem) {
        erro(mensagem, null);
    }

    /** Aguarda a fila esvaziar e encerra a thread de gravacao. */
    public void fechar() {
        ativo = false;
        threadGravacao.interrupt();
        try { threadGravacao.join(5_000); } catch (InterruptedException ignored) {}
    }

    // ── Loop de gravacao em thread separada ───────────────────────

    private void loopGravacao() {
        List<Entrada> lote = new ArrayList<>(100);
        while (ativo || !fila.isEmpty()) {
            try {
                // Espera ate 200ms ou ate ter 100 entradas
                Entrada e = fila.poll(200, java.util.concurrent.TimeUnit.MILLISECONDS);
                if (e != null) {
                    lote.add(e);
                    fila.drainTo(lote, 99); // pega mais ate completar 100
                    gravarLote(lote);
                    lote.clear();
                }
            } catch (InterruptedException ignored) {
                // Quando fechar() e chamado, drena o restante
                fila.drainTo(lote);
                if (!lote.isEmpty()) gravarLote(lote);
                lote.clear();
                break;
            }
        }
        // Garantia final: grava o que sobrou
        fila.drainTo(lote);
        if (!lote.isEmpty()) gravarLote(lote);
    }

    private void gravarLote(List<Entrada> lote) {
        if (lote.isEmpty()) return;
        try (Connection conn = Db.conexao();
             PreparedStatement ps = conn.prepareStatement(SQL)) {
            conn.setAutoCommit(false);
            for (Entrada e : lote) {
                ps.setTimestamp(1, Timestamp.valueOf(e.dataHora));
                ps.setString(2,   e.nivel);
                ps.setString(3,   etapa);
                ps.setString(4,   e.mensagem);
                ps.setString(5,   e.erro);
                ps.setString(6,   ID_EXECUCAO);
                ps.addBatch();
            }
            ps.executeBatch();
            conn.commit();
        } catch (SQLException ex) {
            console.error("Falha ao gravar lote de logs no banco", ex);
        }
    }

    private void enfileirar(String nivel, String mensagem, String erro) {
        if (!fila.offer(new Entrada(LocalDateTime.now(), nivel, mensagem, erro))) {
            console.warn("Fila de log cheia — descartando entrada: {}", mensagem);
        }
    }

    private String stackTrace(Throwable t) {
        StringBuilder sb = new StringBuilder(t.toString()).append("\n");
        for (StackTraceElement el : t.getStackTrace()) {
            sb.append("  at ").append(el).append("\n");
            if (sb.length() > 3000) { sb.append("  ...(truncado)"); break; }
        }
        return sb.toString();
    }

    private record Entrada(LocalDateTime dataHora, String nivel, String mensagem, String erro) {}
}
