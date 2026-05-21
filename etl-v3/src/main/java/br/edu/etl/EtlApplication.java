package br.edu.etl;

import br.edu.etl.config.Config;
import br.edu.etl.config.Db;
import br.edu.etl.extract.LeitorXlsx;
import br.edu.etl.load.Carregador;
import br.edu.etl.log.AsyncDbLogger;
import br.edu.etl.s3.FonteArquivos;
import br.edu.etl.s3.FonteLocal;
import br.edu.etl.s3.FonteS3;

import java.io.BufferedWriter;
import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.time.Duration;
import java.time.Instant;
import java.util.List;


public class EtlApplication {


    public static void main(String[] args) {

        Instant inicio = Instant.now();
        AsyncDbLogger log = AsyncDbLogger.criar("ETL");
        FonteArquivos fonte = null;

        try {
            Config cfg = Config.get();
            Db.init();

            fonte = cfg.usaS3()
                    ? new FonteS3(cfg.s3Bucket(), cfg.s3Prefixo(), cfg.s3Regiao(),
                    cfg.pastaTemp(), log)
                    : new FonteLocal(cfg.pastaXlsx(), log);

            List<File> arquivos = fonte.listarArquivos();

            Path pastaTemp = Paths.get(cfg.pastaTemp());
            Files.createDirectories(pastaTemp);

            long totalBytes = arquivos.stream().mapToLong(File::length).sum();

            log.info("╔══════════════════════════════════════════════╗");
            log.info("║         ETL Transito SP — iniciando          ║");
            log.info("╚══════════════════════════════════════════════╝");
            log.info("ID execucao  : " + AsyncDbLogger.idExecucao());
            log.info("Fonte        : " + (cfg.usaS3() ? "S3 — " + cfg.s3Bucket() : "Local — " + cfg.pastaXlsx()));
            log.info("Arquivos     : " + arquivos.size());
            log.info("Volume total : " + formatarBytes(totalBytes));
            log.info("Min medicoes : " + cfg.minMedicoes() + " (filtro recomendacoes)");
            log.info("──────────────────────────────────────────────");

            LeitorXlsx leitor  = new LeitorXlsx(log);
            long totalLinhas   = 0;
            long totalInvalidas = 0;

            try (Carregador c = new Carregador(log)) {

                c.criarTabelas();

                for (int i = 0; i < arquivos.size(); i++) {

                    File arquivo = arquivos.get(i);
                    long tamanho = arquivo.length();
                    Instant inicioPart = Instant.now();

                    log.info(String.format("┌─ [%d/%d] %s (%.1f MB)",
                            i + 1, arquivos.size(),
                            arquivo.getName(),
                            tamanho / 1_048_576.0));

                    String nomeCsv = arquivo.getName().replace(".xlsx", ".csv");
                    Path   csvPath = pastaTemp.resolve(nomeCsv);

                    long[] resultado; // [validas, invalidas]

                    try (BufferedWriter writer =
                                 Files.newBufferedWriter(csvPath, StandardCharsets.UTF_8)) {
                        resultado = leitor.lerParaCsv(arquivo, writer);
                    }

                    long validas   = resultado[0];
                    long invalidas = resultado[1];
                    totalLinhas   += validas;
                    totalInvalidas += invalidas;

                    log.info(String.format("│  Extração  : %,d válidas | %,d inválidas (%.1f%% aproveitamento)",
                            validas, invalidas,
                            validas == 0 ? 0.0 : validas * 100.0 / (validas + invalidas)));

                    Instant inicioLoad = Instant.now();
                    c.carregarCsv(csvPath, arquivo.getName());
                    long msLoad = Duration.between(inicioLoad, Instant.now()).toMillis();

                    log.info(String.format("│  LOAD DATA : %,d linhas em %s (%.0f linhas/s)",
                            validas, formatarMs(msLoad),
                            msLoad > 0 ? validas * 1000.0 / msLoad : 0));

                    Files.deleteIfExists(csvPath);

                    long msPart = Duration.between(inicioPart, Instant.now()).toMillis();
                    log.info(String.format("└─ Arquivo concluido em %s", formatarMs(msPart)));
                }

                // ── Resumo ──────────────────────────────────────────
                log.info("──────────────────────────────────────────────");
                log.info("ETAPA 3 — Calculando resumo agregado...");
                Instant inicioResumo = Instant.now();

                long totalResumo = c.calcularResumo();

                long msResumo = Duration.between(inicioResumo, Instant.now()).toMillis();
                log.info(String.format("Resumo concluido: %,d grupos | tempo: %s | taxa: %.0f grupos/s",
                        totalResumo, formatarMs(msResumo),
                        msResumo > 0 ? totalResumo * 1000.0 / msResumo : 0));

                // ── Recomendações ────────────────────────────────────
                log.info("──────────────────────────────────────────────");
                log.info("ETAPA 4 — Gerando recomendacoes de obras...");
                Instant inicioRec = Instant.now();

                long totalRec = c.gerarRecomendacoes();

                long msRec = Duration.between(inicioRec, Instant.now()).toMillis();
                log.info(String.format("Recomendacoes concluidas: %,d janelas rankeadas | tempo: %s",
                        totalRec, formatarMs(msRec)));
            }

            Duration duracao = Duration.between(inicio, Instant.now());

            log.info("╔══════════════════════════════════════════════╗");
            log.info("║            ETL concluido com sucesso         ║");
            log.info("╚══════════════════════════════════════════════╝");
            log.info(String.format("Registros válidos   : %,d", totalLinhas));
            log.info(String.format("Registros ignorados : %,d", totalInvalidas));
            log.info(String.format("Tempo total         : %s", formatarDuracao(duracao)));
            log.info(String.format("Throughput médio    : %.0f linhas/s",
                    duracao.toMillis() > 0 ? totalLinhas * 1000.0 / duracao.toMillis() : 0));
            log.info("──────────────────────────────────────────────");

        } catch (Exception e) {
            log.erro("ETL falhou na execucao " + AsyncDbLogger.idExecucao() + ": " + e.getMessage(), e);
            System.exit(1);

        } finally {
            if (fonte != null) fonte.limpar();
            log.fechar();
            Db.fechar();
        }
    }

    // ── Helpers de formatação ──────────────────────────────────────

    private static String formatarBytes(long bytes) {
        if (bytes < 1024)           return bytes + " B";
        if (bytes < 1_048_576)      return String.format("%.1f KB", bytes / 1024.0);
        if (bytes < 1_073_741_824L) return String.format("%.1f MB", bytes / 1_048_576.0);
        return String.format("%.2f GB", bytes / 1_073_741_824.0);
    }

    private static String formatarMs(long ms) {
        if (ms < 1_000)  return ms + "ms";
        if (ms < 60_000) return String.format("%.1fs", ms / 1000.0);
        return String.format("%dm %02ds", ms / 60_000, (ms % 60_000) / 1_000);
    }

    private static String formatarDuracao(Duration d) {
        long min = d.toMinutes();
        long seg = d.toSecondsPart();
        if (min == 0) return seg + "s";
        return min + "min " + seg + "s";
    }


}

