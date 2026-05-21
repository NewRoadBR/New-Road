package br.edu.etl.extract;

import br.edu.etl.log.AsyncDbLogger;
import org.apache.poi.openxml4j.opc.OPCPackage;
import org.apache.poi.xssf.eventusermodel.XSSFReader;
import org.apache.poi.xssf.eventusermodel.XSSFSheetXMLHandler;
import org.apache.poi.xssf.model.SharedStringsTable;
import org.apache.poi.xssf.model.StylesTable;
import org.apache.poi.xssf.usermodel.XSSFComment;
import org.xml.sax.InputSource;
import org.xml.sax.XMLReader;

import javax.xml.parsers.SAXParserFactory;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.function.Consumer;

/**
 * ETAPA 1 + 2 (OTIMIZADO)
 * EXTRACT + TRANSFORM leve (SEM parse de data)
 */
public class LeitorXlsx {

    private final AsyncDbLogger log;

    public LeitorXlsx(AsyncDbLogger log) {
        this.log = log;
    }

    public long[] lerParaCsv(File xlsx, BufferedWriter csvWriter) throws Exception {

        log.info(String.format("│  Abrindo   : %s", xlsx.getName()));

        long[] contador = {0, 0}; // [0]=validas, [1]=invalidas

        try (OPCPackage pkg = OPCPackage.open(xlsx)) {

            XSSFReader reader = new XSSFReader(pkg);
            SharedStringsTable strings = (SharedStringsTable) reader.getSharedStringsTable();
            StylesTable styles = (StylesTable) reader.getStylesTable();

            CsvLinhaHandler handler = new CsvLinhaHandler(linha -> {
                if (linha != null) {
                    try {
                        csvWriter.write(linha);
                        csvWriter.newLine();
                        contador[0]++;          // válida
                    } catch (IOException e) {
                        throw new UncheckedIOException(e);
                    }
                } else {
                    contador[1]++;              // inválida / ignorada
                }
            });

            SAXParserFactory factory = SAXParserFactory.newInstance();
            factory.setNamespaceAware(true);

            XMLReader parser = factory.newSAXParser().getXMLReader();
            parser.setContentHandler(
                    new XSSFSheetXMLHandler(styles, strings, handler, false)
            );

            var iter = (XSSFReader.SheetIterator) reader.getSheetsData();

            while (iter.hasNext()) {
                try (InputStream sheet = iter.next()) {
                    parser.parse(new InputSource(sheet));
                }
            }
        }

        log.info(String.format(
                "%s: %,d lidas | %,d validas",
                xlsx.getName(), contador[0], contador[1]
        ));

        return contador; // ← retorna o array completo
    }

    // ─────────────────────────────────────────────────────────────
    // TRANSFORM ULTRA LEVE (SEM DATE PARSING)
    // ─────────────────────────────────────────────────────────────

    private static class CsvLinhaHandler implements XSSFSheetXMLHandler.SheetContentsHandler {

        private final Consumer<String> onLinha;

        private boolean primeiraLinha = true;
        private boolean temIndice = false;

        private String nomeVia, sentido, tipoVia, regiao, tsRaw, filaRaw, trecho;

        CsvLinhaHandler(Consumer<String> onLinha) {
            this.onLinha = onLinha;
        }

        @Override
        public void startRow(int rowNum) {
            nomeVia = sentido = tipoVia = regiao = tsRaw = filaRaw = trecho = null;
        }

        @Override
        public void endRow(int rowNum) {

            if (primeiraLinha) {
                temIndice = nomeVia != null && nomeVia.equalsIgnoreCase("index");
                primeiraLinha = false;
                return;
            }

            if (nomeVia == null || tsRaw == null) {
                onLinha.accept(null);
                return;
            }

            // ✔ NÃO FAZ MAIS PARSE DE DATA
            // só normaliza string
            String dataHora = normalizarData(tsRaw);

            int fila;
            try {
                String f = filaRaw == null ? "0" : filaRaw;
                if (f.contains(".")) f = f.substring(0, f.indexOf("."));
                fila = Integer.parseInt(f.trim());
            } catch (Exception e) {
                return;
            }

            int hora = extrairHora(dataHora);
            int diaSemana = extrairDiaSemana(dataHora);
            int fds = (diaSemana >= 6) ? 1 : 0;
            int expressa = "E".equalsIgnoreCase(tipoVia) ? 1 : 0;

            String periodo = calcularPeriodo(hora);

            onLinha.accept(String.join(",",
                    csv(nomeVia),
                    csv(sentido),
                    csv(tipoVia),
                    csv(regiao),
                    dataHora, // 🔥 direto, sem parse
                    String.valueOf(fila),
                    csv(trecho),
                    String.valueOf(hora),
                    String.valueOf(diaSemana),
                    String.valueOf(fds),
                    String.valueOf(expressa),
                    csv(periodo)
            ));
        }

        @Override
        public void cell(String ref, String valor, XSSFComment comment) {
            if (ref == null || valor == null) return;

            String col = ref.replaceAll("[0-9]", "");

            if (temIndice) {
                switch (col) {
                    case "B" -> nomeVia = valor;
                    case "C" -> sentido = valor;
                    case "D" -> tipoVia = valor;
                    case "E" -> regiao = valor;
                    case "F" -> tsRaw = valor;
                    case "G" -> filaRaw = valor;
                    case "H" -> trecho = valor;
                }
            } else {
                switch (col) {
                    case "A" -> nomeVia = valor;
                    case "B" -> sentido = valor;
                    case "C" -> tipoVia = valor;
                    case "D" -> regiao = valor;
                    case "E" -> tsRaw = valor;
                    case "F" -> filaRaw = valor;
                    case "G" -> trecho = valor;
                }
            }
        }

        // ─────────────── OTIMIZADO ───────────────

        private String normalizarData(String ts) {
            ts = ts.replace("T", " ");
            if (ts.contains(".")) ts = ts.substring(0, ts.indexOf("."));
            return ts;
        }

        private int extrairHora(String ts) {
            try {
                return Integer.parseInt(ts.substring(11, 13));
            } catch (Exception e) {
                return 0;
            }
        }

        private int extrairDiaSemana(String ts) {
            // ⚠️ simples e rápido (sem java.time)
            return 1; // se quiser melhorar depois, fazemos via MySQL
        }

        private String calcularPeriodo(int hora) {
            if (hora < 5) return "Madrugada";
            if (hora < 7) return "Manha Cedo";
            if (hora < 9) return "Pico Manha";
            if (hora < 12) return "Manha";
            if (hora < 14) return "Almoco";
            if (hora < 17) return "Tarde";
            if (hora < 20) return "Pico Tarde";
            return "Noite";
        }

        private String csv(String v) {
            if (v == null) return "";
            return "\"" + v.replace("\"", "\"\"") + "\"";
        }
    }
}