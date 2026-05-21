package br.edu.etl.s3;

import br.edu.etl.log.AsyncDbLogger;

import java.io.File;
import java.util.Arrays;
import java.util.List;

/**
 * Fonte local: le arquivos .xlsx de uma pasta no disco.
 */
public class FonteLocal implements FonteArquivos {

    private final String caminhoPasta;
    private final AsyncDbLogger log;

    public FonteLocal(String caminhoPasta, AsyncDbLogger log) {
        this.caminhoPasta = caminhoPasta;
        this.log          = log;
    }

    @Override
    public List<File> listarArquivos() {
        File pasta = new File(caminhoPasta);

        if (!pasta.exists() || !pasta.isDirectory())
            throw new IllegalArgumentException(
                    "Pasta nao encontrada: " + pasta.getAbsolutePath() +
                    "\nVerifique etl.pasta.xlsx no application.properties");

        File[] arquivos = pasta.listFiles(f -> f.getName().endsWith(".xlsx"));
        if (arquivos == null || arquivos.length == 0)
            throw new IllegalArgumentException("Nenhum .xlsx encontrado em: " + pasta.getAbsolutePath());

        Arrays.sort(arquivos, (a, b) -> a.getName().compareTo(b.getName()));

        log.info("Fonte LOCAL: " + arquivos.length + " arquivo(s) em " + pasta.getAbsolutePath());
        return Arrays.asList(arquivos);
    }
}
