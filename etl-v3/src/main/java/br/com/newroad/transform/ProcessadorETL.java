package br.com.newroad.transform;

import br.com.newroad.extract.FonteArquivos;
import br.com.newroad.extract.FonteLocal;
import br.com.newroad.load.TrafegoRepository;
import br.com.newroad.log.LogErro;
import br.com.newroad.log.LogOperacional;
import br.com.newroad.repository.ServicoLog;
import br.com.newroad.util.ConexaoBancoDados;
import org.apache.poi.openxml4j.opc.OPCPackage;
import org.apache.poi.ooxml.util.SAXHelper;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.util.CellReference;
import org.apache.poi.util.IOUtils;
import org.apache.poi.xssf.eventusermodel.ReadOnlySharedStringsTable;
import org.apache.poi.xssf.eventusermodel.XSSFReader;
import org.apache.poi.xssf.eventusermodel.XSSFSheetXMLHandler;
import org.apache.poi.xssf.usermodel.XSSFComment;
import org.xml.sax.InputSource;
import org.xml.sax.XMLReader;

import java.io.BufferedWriter;
import java.io.File;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.sql.Date;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ProcessadorETL {

    private static final String CLASSE =
            ProcessadorETL.class.getName();

    static {
        IOUtils.setByteArrayMaxOverride(-1);
    }

    // ─────────────────────────────────────────────
    // FORMATTERS
    // ─────────────────────────────────────────────

    private static final DateTimeFormatter FORMATO_BR =
            DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private static final DateTimeFormatter FORMATO_US_SHORT =
            DateTimeFormatter.ofPattern("M/d/yy");

    private static final DateTimeFormatter FORMATO_US =
            DateTimeFormatter.ofPattern("M/d/yyyy");

    private static final DateTimeFormatter FORMATO_US_FULL =
            DateTimeFormatter.ofPattern("MM/dd/yyyy");

    private static final DateTimeFormatter FORMATO_SAIDA =
            DateTimeFormatter.ofPattern("yyyy-MM-dd");

    // ─────────────────────────────────────────────

    private final ServicoLog servicoLog;
    private final TrafegoRepository trafegoRepository;
    private final FonteArquivos fonte;

    // CSVs separados por ano
    private final Map<Integer, BufferedWriter> writersPorAno =
            new HashMap<>();

    private final Map<Integer, File> arquivosCsvPorAno =
            new HashMap<>();

    public ProcessadorETL() throws SQLException {

        this.servicoLog =
                new ServicoLog();

        this.trafegoRepository =
                new TrafegoRepository();

        this.fonte =
                ConexaoBancoDados.criarFonte();
    }

    // ─────────────────────────────────────────────
    // EXECUÇÃO PRINCIPAL
    // ─────────────────────────────────────────────

    public void executar() {

        long inicioGeral =
                System.currentTimeMillis();

        servicoLog.salvar(
                new LogOperacional(
                        CLASSE,
                        "=== INÍCIO ETL ==="
                )
        );

        try {

            // cria pasta temp se não existir
            File pastaTemp = new File("temp");

            if (!pastaTemp.exists()) {
                pastaTemp.mkdirs();
            }

            List<String> arquivos =
                    fonte.listarArquivos();

            if (arquivos.isEmpty()) {

                servicoLog.salvar(
                        new LogOperacional(
                                CLASSE,
                                "Nenhum arquivo encontrado."
                        )
                );

                return;
            }

            int totalArquivos = 0;
            int totalErros = 0;

            // ─────────────────────────────────────
            // PROCESSAMENTO XLSX
            // ─────────────────────────────────────

            for (String identificador : arquivos) {

                String nomeArquivo =
                        fonte.nomeDoArquivo(
                                identificador
                        );

                servicoLog.salvar(
                        new LogOperacional(
                                CLASSE,
                                "Processando: "
                                        + nomeArquivo
                        )
                );

                try {

                    int errosArquivo =
                            processarArquivo(
                                    identificador,
                                    nomeArquivo
                            );

                    totalErros += errosArquivo;
                    totalArquivos++;

                } catch (Exception e) {

                    totalErros++;

                    servicoLog.salvar(
                            new LogErro(
                                    CLASSE,
                                    "Erro arquivo "
                                            + nomeArquivo
                                            + ": "
                                            + e.getMessage(),
                                    e
                            )
                    );
                }
            }

            // ─────────────────────────────────────
            // FECHAR WRITERS
            // ─────────────────────────────────────

            for (BufferedWriter writer :
                    writersPorAno.values()) {

                writer.flush();
                writer.close();
            }

            // ─────────────────────────────────────
            // LOAD DATA POR ANO
            // ─────────────────────────────────────

            int totalInserido = 0;

            for (Map.Entry<Integer, File> entry :
                    arquivosCsvPorAno.entrySet()) {

                Integer ano =
                        entry.getKey();

                File csv =
                        entry.getValue();

                servicoLog.salvar(
                        new LogOperacional(
                                CLASSE,
                                "LOAD DATA ano "
                                        + ano
                        )
                );

                int inseridos =
                        trafegoRepository
                                .carregarArquivoCSV(csv);

                totalInserido += inseridos;

                servicoLog.salvar(
                        new LogOperacional(
                                CLASSE,
                                "Ano "
                                        + ano
                                        + " inseridos: "
                                        + inseridos
                        )
                );
            }

            if (totalInserido > 0) {
                trafegoRepository.atualizarHistoricoRodovia();
                servicoLog.salvar(
                        new LogOperacional(
                                CLASSE,
                                "Processamento histórico concluído."
                        )
                );
            }

            long duracao =
                    System.currentTimeMillis()
                            - inicioGeral;

            servicoLog.salvar(
                    new LogOperacional(
                            CLASSE,
                            String.format(
                                    "FIM ETL | Arquivos: %d | Inseridos: %d | Erros: %d | Tempo: %.2fs",
                                    totalArquivos,
                                    totalInserido,
                                    totalErros,
                                    duracao / 1000.0
                            )
                    )
            );

        } catch (Exception e) {

            servicoLog.salvar(
                    new LogErro(
                            CLASSE,
                            "Erro geral ETL: "
                                    + e.getMessage(),
                            e
                    )
            );

        } finally {

            try {
                trafegoRepository.close();
            } catch (Exception ignored) {
            }

            servicoLog.close();

            // remove CSVs temporários
            for (File csv :
                    arquivosCsvPorAno.values()) {

                if (csv.exists()) {
                    csv.delete();
                }
            }
        }
    }

    // ─────────────────────────────────────────────
    // PROCESSAMENTO XLSX
    // ─────────────────────────────────────────────

    private int processarArquivo(
            String identificador,
            String nomeArquivo
    ) throws Exception {

        int[] errosWrapper =
                new int[1];

        File arquivoTemp = null;

        OPCPackage pkg;

        // LOCAL
        if (fonte instanceof FonteLocal) {

            pkg = OPCPackage.open(
                    new File(identificador)
            );

        } else {

            // REMOTO
            arquivoTemp =
                    File.createTempFile(
                            "artesp_etl_",
                            ".xlsx"
                    );

            try (
                    InputStream is =
                            fonte.abrirArquivo(
                                    identificador
                            );

                    java.io.FileOutputStream fos =
                            new java.io.FileOutputStream(
                                    arquivoTemp
                            )
            ) {

                is.transferTo(fos);
            }

            pkg = OPCPackage.open(arquivoTemp);
        }

        try (OPCPackage pacote = pkg) {

            ReadOnlySharedStringsTable strings =
                    new ReadOnlySharedStringsTable(
                            pacote
                    );

            XSSFReader reader =
                    new XSSFReader(pacote);

            DataFormatter formatter =
                    new DataFormatter();

            String[] valores =
                    new String[18];

            XSSFSheetXMLHandler.SheetContentsHandler handler =
                    new XSSFSheetXMLHandler.SheetContentsHandler() {

                        @Override
                        public void startRow(int rowNum) {

                            Arrays.fill(
                                    valores,
                                    ""
                            );
                        }

                        @Override
                        public void endRow(int rowNum) {

                            if (rowNum == 0) {
                                return;
                            }

                            try {

                                escreverLinhaCsv(
                                        valores,
                                        nomeArquivo
                                );

                            } catch (Exception e) {

                                errosWrapper[0]++;

                                servicoLog.salvar(
                                        new LogErro(
                                                CLASSE,
                                                String.format(
                                                        "[%s] Linha %d: %s",
                                                        nomeArquivo,
                                                        rowNum,
                                                        e.getMessage()
                                                ),
                                                e
                                        )
                                );
                            }
                        }

                        @Override
                        public void cell(
                                String cellReference,
                                String formattedValue,
                                XSSFComment comment
                        ) {

                            int col =
                                    new CellReference(
                                            cellReference
                                    ).getCol();

                            if (col >= 0
                                    && col < valores.length) {

                                valores[col] =
                                        formattedValue == null
                                                ? ""
                                                : formattedValue.trim();
                            }
                        }

                        @Override
                        public void headerFooter(
                                String text,
                                boolean isHeader,
                                String tagName
                        ) {
                        }
                    };

            XMLReader parser =
                    SAXHelper.newXMLReader();

            XSSFReader.SheetIterator sheets =
                    (XSSFReader.SheetIterator)
                            reader.getSheetsData();

            if (!sheets.hasNext()) {

                throw new IllegalStateException(
                        "Nenhuma planilha encontrada."
                );
            }

            parser.setContentHandler(
                    new XSSFSheetXMLHandler(
                            reader.getStylesTable(),
                            null,
                            strings,
                            handler,
                            formatter,
                            false
                    )
            );

            try (
                    InputStream sheetStream =
                            sheets.next()
            ) {

                parser.parse(
                        new InputSource(
                                sheetStream
                        )
                );
            }

        } finally {

            if (arquivoTemp != null
                    && arquivoTemp.exists()) {

                arquivoTemp.delete();
            }
        }

        return errosWrapper[0];
    }

    // ─────────────────────────────────────────────
    // ESCRITA CSV POR ANO
    // ─────────────────────────────────────────────

    private void escreverLinhaCsv(
            String[] valores,
            String arquivoOrigem
    ) throws Exception {

        Date data =
                lerData(valores[0]);

        int ano =
                data.toLocalDate()
                        .getYear();

        BufferedWriter writer =
                writersPorAno.get(ano);

        // cria CSV do ano automaticamente
        if (writer == null) {

            File csvAno =
                    new File(
                            "temp/trafego_"
                                    + ano
                                    + ".csv"
                    );

            writer =
                    new BufferedWriter(
                            Files.newBufferedWriter(
                                    csvAno.toPath(),
                                    StandardCharsets.UTF_8
                            ),
                            1024 * 1024
                    );

            writersPorAno.put(
                    ano,
                    writer
            );

            arquivosCsvPorAno.put(
                    ano,
                    csvAno
            );

            servicoLog.salvar(
                    new LogOperacional(
                            CLASSE,
                            "Criado CSV ano "
                                    + ano
                    )
            );
        }

        int hora =
                (int) lerNumero(valores[1]);

        int leve2 =
                (int) lerNumero(valores[8]);

        int moto2 =
                (int) lerNumero(valores[9]);

        int pesado2 =
                (int) lerNumero(valores[10]);

        int leve3 =
                (int) lerNumero(valores[11]);

        int pesado3 =
                (int) lerNumero(valores[12]);

        int leve4 =
                (int) lerNumero(valores[13]);

        int pesado4 =
                (int) lerNumero(valores[14]);

        int pesado5 =
                (int) lerNumero(valores[15]);

        int pesado6 =
                (int) lerNumero(valores[16]);

        int especial =
                lerNumeroEspecial(valores[17]);

        StringBuilder sb =
                new StringBuilder(256);

        sb.append('"')
                .append(
                        formatarData(data)
                )
                .append('"')
                .append(',');

        sb.append(hora).append(',');

        sb.append(
                escapeCsv(valores[3])
        ).append(',');

        sb.append(
                escapeCsv(valores[4])
        ).append(',');

        sb.append(leve2).append(',');
        sb.append(moto2).append(',');
        sb.append(pesado2).append(',');
        sb.append(leve3).append(',');
        sb.append(pesado3).append(',');
        sb.append(leve4).append(',');
        sb.append(pesado4).append(',');
        sb.append(pesado5).append(',');
        sb.append(pesado6).append(',');
        sb.append(especial).append(',');

        sb.append(
                escapeCsv(arquivoOrigem)
        );

        sb.append("\r\n");

        writer.write(sb.toString());
    }

    // ─────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────

    private String formatarData(Date data) {

        return data
                .toLocalDate()
                .format(FORMATO_SAIDA);
    }

    private Date lerData(String valor) {

        String s =
                valor == null
                        ? ""
                        : valor.trim();

        if (s.isEmpty()) {

            throw new IllegalArgumentException(
                    "DATA vazia"
            );
        }

        // Excel serial date
        try {

            double numericDate =
                    Double.parseDouble(s);

            return new Date(
                    DateUtil.getJavaDate(
                            numericDate
                    ).getTime()
            );

        } catch (NumberFormatException ignored) {
        }

        try {

            return Date.valueOf(
                    LocalDate.parse(
                            s,
                            FORMATO_BR
                    )
            );

        } catch (Exception ignored) {
        }

        try {

            return Date.valueOf(
                    LocalDate.parse(
                            s,
                            FORMATO_US_SHORT
                    )
            );

        } catch (Exception ignored) {
        }

        try {

            return Date.valueOf(
                    LocalDate.parse(
                            s,
                            FORMATO_US
                    )
            );

        } catch (Exception ignored) {
        }

        try {

            return Date.valueOf(
                    LocalDate.parse(
                            s,
                            FORMATO_US_FULL
                    )
            );

        } catch (Exception ignored) {
        }

        throw new IllegalArgumentException(
                "DATA inválida: " + s
        );
    }

    private double lerNumero(String valor) {

        if (valor == null) {
            return 0;
        }

        String s =
                valor.trim();

        if (s.isEmpty()) {
            return 0;
        }

        try {

            return Double.parseDouble(
                    s.replaceAll(
                            "\\s+",
                            ""
                    )
            );

        } catch (NumberFormatException e) {

            return 0;
        }
    }

    private int lerNumeroEspecial(
            String valor
    ) {

        if (valor == null) {
            return 0;
        }

        String s =
                valor.trim();

        if (s.isEmpty()) {
            return 0;
        }

        String soNumero =
                s.split(";")[0].trim();

        if (soNumero.isEmpty()) {
            return 0;
        }

        try {

            return (int)
                    Double.parseDouble(
                            soNumero
                    );

        } catch (NumberFormatException e) {

            return 0;
        }
    }

    private String escapeCsv(
            String valor
    ) {

        if (valor == null) {
            return "\"\"";
        }

        String s = valor
                .replace("\"", "\"\"")
                .replace("\r", " ")
                .replace("\n", " ");

        return '"' + s + '"';
    }
}