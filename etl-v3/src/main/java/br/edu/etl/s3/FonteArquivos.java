package br.edu.etl.s3;

import java.io.File;
import java.util.List;

/**
 * Abstrai a origem dos arquivos XLSX.
 * Implementacoes: FonteLocal (pasta no disco) e FonteS3 (bucket S3).
 *
 * O EtlApplication usa apenas esta interface — nao sabe se esta
 * lendo de disco ou da nuvem. A troca e feita via application.properties.
 */
public interface FonteArquivos {

    /**
     * Retorna a lista de arquivos .xlsx prontos para leitura.
     * Para S3, faz o download para uma pasta local temporaria primeiro.
     */
    List<File> listarArquivos() throws Exception;

    /**
     * Limpa recursos apos o processamento (ex: apaga downloads temporarios do S3).
     */
    default void limpar() {}
}
