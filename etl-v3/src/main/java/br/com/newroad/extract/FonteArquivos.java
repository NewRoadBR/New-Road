package br.com.newroad.extract;

import java.io.InputStream;
import java.util.List;

public interface FonteArquivos {


    List<String> listarArquivos();

    InputStream abrirArquivo(String identificador) throws Exception;

    default String nomeDoArquivo(String identificador) {

        int ultimo = Math.max(
                identificador.lastIndexOf('/'),
                identificador.lastIndexOf('\\')
        );
        return ultimo >= 0 ? identificador.substring(ultimo + 1) : identificador;
    }
}
