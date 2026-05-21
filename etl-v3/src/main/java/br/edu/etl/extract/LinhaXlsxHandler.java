package br.edu.etl.extract;

import br.edu.etl.model.MedicaoTransito;
import org.apache.poi.xssf.eventusermodel.XSSFSheetXMLHandler;
import org.apache.poi.xssf.usermodel.XSSFComment;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.function.Consumer;

/**
 * Handler SAX que converte cada linha do XLSX em um MedicaoTransito.
 *
 * Ordem das colunas (gerada pelo script Python/Colab com index=False):
 *   A=passage | B=direction | C=type | D=region |
 *   E=timestamp | F=jam_size | G=segment
 *
 * Se o Colab exportou COM indice (sem index=False), as colunas ficam:
 *   A=index | B=passage | C=direction | D=type | E=region |
 *   F=timestamp | G=jam_size | H=segment
 *
 * O handler detecta automaticamente qual formato e usado verificando
 * se a celula A do cabecalho e numerica (indice) ou textual (passage).
 */
public class LinhaXlsxHandler implements XSSFSheetXMLHandler.SheetContentsHandler {

    private static final DateTimeFormatter FMT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final Consumer<MedicaoTransito> onLinha;
    private MedicaoTransito atual;
    private boolean primeiraLinha = true;
    private boolean temIndice     = false; // detectado no cabecalho

    public LinhaXlsxHandler(Consumer<MedicaoTransito> onLinha) {
        this.onLinha = onLinha;
    }

    @Override
    public void startRow(int rowNum) {
        atual = new MedicaoTransito();
    }

    @Override
    public void endRow(int rowNum) {
        if (primeiraLinha) {
            primeiraLinha = false;
            return; // pula o cabecalho
        }
        if (atual.getNomeVia() != null && !atual.getNomeVia().isBlank()) {
            onLinha.accept(atual);
        }
    }

    @Override
    public void cell(String ref, String valor, XSSFComment comment) {
        if (valor == null || valor.isBlank() || ref == null) return;

        // Extrai a(s) letra(s) da coluna: "A1" -> "A", "AB12" -> "AB"
        String col = ref.replaceAll("[0-9]", "");

        // No cabecalho: detecta se tem coluna de indice (A = "")
        if (primeiraLinha) {
            if (col.equals("A") && isNumerico(valor)) temIndice = true;
            return;
        }

        // Mapeia coluna -> campo, compensando o deslocamento do indice
        if (temIndice) {
            switch (col) {
                case "B" -> atual.setNomeVia(valor);
                case "C" -> atual.setSentido(valor);
                case "D" -> atual.setTipoVia(valor);
                case "E" -> atual.setRegiao(valor);
                case "F" -> parseTimestamp(valor);
                case "G" -> parseFilaMetros(valor);
                case "H" -> atual.setTrecho(valor);
            }
        } else {
            switch (col) {
                case "A" -> atual.setNomeVia(valor);
                case "B" -> atual.setSentido(valor);
                case "C" -> atual.setTipoVia(valor);
                case "D" -> atual.setRegiao(valor);
                case "E" -> parseTimestamp(valor);
                case "F" -> parseFilaMetros(valor);
                case "G" -> atual.setTrecho(valor);
            }
        }
    }

    private void parseTimestamp(String valor) {
        try {
            // Normaliza: remove o "T" de formato ISO e trunca microssegundos
            String s = valor.replace("T", " ");
            if (s.contains(".")) s = s.substring(0, s.indexOf("."));
            atual.setDataHoraMedicao(LocalDateTime.parse(s, FMT));
        } catch (DateTimeParseException e) {
            // Timestamp invalido — o Transform vai rejeitar esta linha
        }
    }

    private void parseFilaMetros(String valor) {
        try {
            // Pandas pode exportar inteiros como "1500.0" — remove o decimal
            String s = valor.contains(".") ? valor.substring(0, valor.indexOf(".")) : valor;
            atual.setFilaEmMetros(Integer.parseInt(s.trim()));
        } catch (NumberFormatException e) {
            atual.setFilaEmMetros(0);
        }
    }

    private boolean isNumerico(String s) {
        try { Double.parseDouble(s); return true; }
        catch (NumberFormatException e) { return false; }
    }
}
