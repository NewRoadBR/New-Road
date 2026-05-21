package br.edu.etl.load;

import br.edu.etl.config.Config;
import br.edu.etl.config.Db;
import br.edu.etl.log.AsyncDbLogger;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.sql.*;
import java.util.*;
import java.util.stream.Collectors;

public class Carregador implements AutoCloseable {

    private final AsyncDbLogger log;
    private final Connection conn;
    private final int minMedicoes;

    // ─────────────────────────────────────────────
    // AGREGACAO EM MEMORIA (STREAMING)
    // ─────────────────────────────────────────────
    private final Map<Key, Stats> agregados = new HashMap<>();

    // ─────────────────────────────────────────────
    // CHAVE DE AGRUPAMENTO
    // ─────────────────────────────────────────────
    private record Key(
            String nomeVia,
            String regiao,
            int viaExpressa,
            int hora,
            String periodo,
            int fimSemana
    ) {}

    // ─────────────────────────────────────────────
    // STATS STREAMING (SEM LISTA)
    // ─────────────────────────────────────────────
    private static class Stats {

        private long count = 0;
        private double mean = 0.0;
        private double m2 = 0.0;

        private int min = Integer.MAX_VALUE;
        private int max = Integer.MIN_VALUE;

        void add(int x) {
            count++;

            double delta = x - mean;
            mean += delta / count;
            double delta2 = x - mean;
            m2 += delta * delta2;

            if (x < min) min = x;
            if (x > max) max = x;
        }

        double media() {
            return mean;
        }

        long count() {
            return count;
        }

        int max() {
            return max == Integer.MIN_VALUE ? 0 : max;
        }

        int min() {
            return min == Integer.MAX_VALUE ? 0 : min;
        }

        double variancia() {
            return count > 1 ? m2 / (count - 1) : 0;
        }

        double desvioPadrao() {
            return Math.sqrt(variancia());
        }

        // aproximação leve (sem armazenar dados)
        double p75Aproximado() {
            return mean + (0.67 * desvioPadrao());
        }
    }

    // ─────────────────────────────────────────────
    public Carregador(AsyncDbLogger log) throws Exception {
        this.log = log;
        this.conn = Db.conexao();
        this.minMedicoes = Config.get().minMedicoes();
        this.conn.setAutoCommit(false);
    }

    // ─────────────────────────────────────────────
    // SCHEMA
    // ─────────────────────────────────────────────
    public void criarTabelas() throws Exception {

        log.info("Criando/verificando tabelas...");

        String sql;

        try (InputStream is = getClass()
                .getClassLoader()
                .getResourceAsStream("schema.sql")) {

            if (is == null) throw new IllegalStateException("schema.sql nao encontrado");

            sql = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }

        try (Statement stmt = conn.createStatement()) {
            for (String s : sql.split(";")) {
                String t = s.trim();
                if (!t.isEmpty() && !t.startsWith("--")) stmt.execute(t);
            }
        }

        conn.commit();
    }

    // ─────────────────────────────────────────────
    // LOAD CSV
    // ─────────────────────────────────────────────
    public void carregarCsv(Path csvPath, String nomeArquivoOrigem) throws SQLException {

        String caminho = csvPath.toAbsolutePath().toString().replace("\\", "/");

        try (Statement stmt = conn.createStatement()) {

            // Garante que o índice não penaliza o LOAD
            stmt.execute(
                    "ALTER TABLE medicao_transito ALTER INDEX idx_medicao_resumo INVISIBLE");

            stmt.execute(String.format("""
                LOAD DATA LOCAL INFILE '%s'
                INTO TABLE medicao_transito
                CHARACTER SET utf8mb4
                FIELDS TERMINATED BY ','
                OPTIONALLY ENCLOSED BY '"'
                LINES TERMINATED BY '\\n'
                (nome_via, sentido, tipo_via, regiao, data_hora_medicao,
                 fila_em_metros, trecho, hora_do_dia, dia_da_semana,
                 fim_de_semana, via_expressa, periodo_do_dia)
                """, caminho));

            conn.commit();
        }
    }

    // ─────────────────────────────────────────────
    // AGREGACAO STREAMING
    // ─────────────────────────────────────────────
    public void agregarDado(
            String nomeVia,
            String regiao,
            int viaExpressa,
            int hora,
            String periodo,
            int fimSemana,
            int fila
    ) {
        Key key = new Key(nomeVia, regiao, viaExpressa, hora, periodo, fimSemana);

        agregados
                .computeIfAbsent(key, k -> new Stats())
                .add(fila);
    }

    // ─────────────────────────────────────────────
    // RESUMO MYSQL (leve)
    // ─────────────────────────────────────────────
    // ─────────────────────────────────────────────
// RESUMO MYSQL — retorna nº de grupos gerados
// ─────────────────────────────────────────────
    public long calcularResumo() throws SQLException {

        log.info("  [3.1] Ativando indice idx_medicao_resumo...");
        try (Statement stmt = conn.createStatement()) {
            stmt.execute(
                    "ALTER TABLE medicao_transito ALTER INDEX idx_medicao_resumo VISIBLE");
        }

        log.info("  [3.2] Configurando sessao MySQL para agregacao...");
        try (Statement stmt = conn.createStatement()) {
            stmt.execute("SET SESSION tmp_table_size      = 536870912");
            stmt.execute("SET SESSION max_heap_table_size = 536870912");
            stmt.execute("SET SESSION sort_buffer_size    = 33554432");
            stmt.execute("ANALYZE TABLE medicao_transito");
        }

        log.info("  [3.3] Contando medicoes brutas...");
        long totalBruto;
        try (Statement stmt = conn.createStatement();
             ResultSet rs   = stmt.executeQuery("SELECT COUNT(*) FROM medicao_transito")) {
            rs.next();
            totalBruto = rs.getLong(1);
        }
        log.info(String.format("  [3.3] Total de medicoes na tabela: %,d", totalBruto));

        log.info("  [3.4] Executando GROUP BY e inserindo no resumo...");
        try (Statement stmt = conn.createStatement()) {
            stmt.execute("""
            INSERT IGNORE INTO resumo_transito_por_horario
                (nome_via, regiao, trecho, via_expressa, hora_do_dia,
                 periodo_do_dia, fim_de_semana,
                 fila_media_metros, fila_maxima_metros, total_medicoes)
            SELECT /*+ INDEX(m idx_medicao_resumo) */
                m.nome_via,
                m.regiao,
                MAX(m.trecho),
                m.via_expressa,
                m.hora_do_dia,
                m.periodo_do_dia,
                m.fim_de_semana,
                ROUND(AVG(m.fila_em_metros), 2),
                MAX(m.fila_em_metros),
                COUNT(*)
            FROM medicao_transito m
            GROUP BY
                m.nome_via, m.regiao, m.via_expressa,
                m.hora_do_dia, m.periodo_do_dia, m.fim_de_semana
            """);
            conn.commit();
        }

        // Conta grupos gerados e extrai algumas estatísticas de sanidade
        long totalGrupos;
        double mediaGeral;
        int maxGlobal;

        try (Statement stmt = conn.createStatement();
             ResultSet rs   = stmt.executeQuery("""
             SELECT COUNT(*),
                    ROUND(AVG(fila_media_metros), 1),
                    MAX(fila_maxima_metros)
             FROM resumo_transito_por_horario
             """)) {
            rs.next();
            totalGrupos = rs.getLong(1);
            mediaGeral  = rs.getDouble(2);
            maxGlobal   = rs.getInt(3);
        }

        log.info(String.format("  [3.5] Grupos gerados    : %,d", totalGrupos));
        log.info(String.format("  [3.5] Fila media geral  : %.1f m", mediaGeral));
        log.info(String.format("  [3.5] Fila maxima global: %,d m", maxGlobal));

        // Top 3 piores combinações — útil para validar se os dados fazem sentido
        log.info("  [3.6] Top 3 piores janelas (maior fila media):");
        try (Statement stmt = conn.createStatement();
             ResultSet rs   = stmt.executeQuery("""
             SELECT nome_via, hora_do_dia, periodo_do_dia, fim_de_semana,
                    ROUND(fila_media_metros) AS media,
                    total_medicoes
             FROM resumo_transito_por_horario
             ORDER BY fila_media_metros DESC
             LIMIT 3
             """)) {
            int rank = 1;
            while (rs.next()) {
                log.info(String.format("         #%d  %-35s  h=%02d  %-12s  %s  media=%,dm  n=%,d",
                        rank++,
                        rs.getString("nome_via"),
                        rs.getInt("hora_do_dia"),
                        rs.getString("periodo_do_dia"),
                        rs.getInt("fim_de_semana") == 1 ? "FDS" : "Util",
                        rs.getInt("media"),
                        rs.getLong("total_medicoes")));
            }
        }

        log.info("  [3.7] Desativando indice e atualizando estatisticas...");
        try (Statement stmt = conn.createStatement()) {
            stmt.execute(
                    "ALTER TABLE medicao_transito ALTER INDEX idx_medicao_resumo INVISIBLE");
            stmt.execute("ANALYZE TABLE resumo_transito_por_horario");
            conn.commit();
        }

        return totalGrupos;
    }

    // ─────────────────────────────────────────────
// RECOMENDAÇÕES — retorna nº de janelas rankeadas
// ─────────────────────────────────────────────
    public long gerarRecomendacoes() throws SQLException {

        log.info("  [4.1] Lendo agregados para ranking em memoria...");
        int totalAgregados  = agregados.size();
        long totalMedicoes  = agregados.values().stream().mapToLong(Stats::count).sum();

        log.info(String.format("  [4.1] Grupos em memoria : %,d", totalAgregados));
        log.info(String.format("  [4.1] Medicoes cobertas : %,d", totalMedicoes));

        log.info(String.format("  [4.2] Aplicando filtro  : >= %d medicoes por janela...", minMedicoes));
        long descartados = agregados.values().stream()
                .filter(s -> s.count() < minMedicoes)
                .count();
        log.info(String.format("  [4.2] Janelas descartadas (abaixo do minimo): %,d", descartados));

        List<Map.Entry<Key, Stats>> ranking = agregados.entrySet()
                .stream()
                .filter(e -> e.getValue().count() >= minMedicoes)
                .sorted(Comparator.comparing(e -> e.getValue().p75Aproximado()))
                .collect(Collectors.toList());

        log.info(String.format("  [4.3] Janelas no ranking: %,d (ordenadas por p75 asc)", ranking.size()));

        if (ranking.isEmpty()) {
            log.aviso("  [4.3] Nenhuma janela passou o filtro — recomendacoes nao geradas.");
            return 0;
        }

        // Estatísticas do ranking para validação
        double melhorP75 = ranking.get(0).getValue().p75Aproximado();
        double piorP75   = ranking.get(ranking.size() - 1).getValue().p75Aproximado();
        log.info(String.format("  [4.3] Melhor janela p75 : %.0f m  (%s h=%02d %s)",
                melhorP75,
                ranking.get(0).getKey().nomeVia(),
                ranking.get(0).getKey().hora(),
                ranking.get(0).getKey().fimSemana() == 1 ? "FDS" : "Util"));
        log.info(String.format("  [4.3] Pior  janela p75  : %.0f m  (%s h=%02d %s)",
                piorP75,
                ranking.get(ranking.size() - 1).getKey().nomeVia(),
                ranking.get(ranking.size() - 1).getKey().hora(),
                ranking.get(ranking.size() - 1).getKey().fimSemana() == 1 ? "FDS" : "Util"));

        log.info("  [4.4] Inserindo recomendacoes no banco em batch...");

        String sql = """
        INSERT INTO recomendacao_obras
        (nome_via, regiao, trecho, via_expressa,
         hora_recomendada, periodo_recomendado, tipo_dia,
         fila_media_esperada_m, fila_garantida_75pct_m,
         total_medicoes, posicao_ranking)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """;

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            int pos       = 1;
            int batchSize = 500;

            for (var e : ranking) {
                Key   k = e.getKey();
                Stats s = e.getValue();

                ps.setString(1, k.nomeVia());
                ps.setString(2, k.regiao());
                ps.setString(3, "N/A");
                ps.setInt   (4, k.viaExpressa());
                ps.setInt   (5, k.hora());
                ps.setString(6, k.periodo());
                ps.setString(7, k.fimSemana() == 1 ? "Fim de semana" : "Dia util");
                ps.setDouble(8, s.media());
                ps.setDouble(9, s.p75Aproximado());
                ps.setLong  (10, s.count());
                ps.setInt   (11, pos++);
                ps.addBatch();

                if (pos % batchSize == 0) {
                    ps.executeBatch();
                    log.info(String.format("  [4.4] Batch enviado: %,d/%,d inseridos",
                            pos - 1, ranking.size()));
                }
            }

            ps.executeBatch(); // flush final
            conn.commit();
        }

        log.info(String.format("  [4.5] %,d recomendacoes persistidas com sucesso.", ranking.size()));

        return ranking.size();
    }

    @Override
    public void close() throws Exception {
        if (conn != null && !conn.isClosed()) conn.close();
    }
}