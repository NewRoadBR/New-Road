package br.com.newroad.extract;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class FonteLocal implements FonteArquivos {

    private static final Logger log = LoggerFactory.getLogger(FonteLocal.class);

    private final String caminhoPasta;

    public FonteLocal(String caminhoPasta) {
        this.caminhoPasta = caminhoPasta;
    }


    @Override
    public List<String> listarArquivos() {
        File pasta = new File(caminhoPasta);

        if (!pasta.exists() || !pasta.isDirectory()) {
            log.error("Pasta não encontrada ou não é um diretório: {}", caminhoPasta);
            return Collections.emptyList();
        }

        File[] arquivos = pasta.listFiles(
                (dir, nome) -> nome.toLowerCase().endsWith(".xlsx")
        );

        if (arquivos == null || arquivos.length == 0) {
            log.warn("Nenhum arquivo .xlsx encontrado em: {}", caminhoPasta);
            return Collections.emptyList();
        }

        List<String> caminhos = Arrays.stream(arquivos)
                .map(File::getAbsolutePath)
                .sorted()
                .collect(Collectors.toList());

        log.info("{} arquivo(s) .xlsx encontrado(s) em: {}", caminhos.size(), caminhoPasta);
        return caminhos;
    }


    @Override
    public InputStream abrirArquivo(String caminho) throws Exception {
        log.debug("Abrindo arquivo local: {}", caminho);
        return new FileInputStream(caminho);
    }
}
