package br.com.newroad.extract;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.InputStream;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementação de {@link FonteArquivos} para leitura a partir de um bucket AWS S3.
 *
 * Credenciais AWS são resolvidas automaticamente pela cadeia padrão do SDK:
 *   1. Variáveis de ambiente: AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY
 *   2. Arquivo ~/.aws/credentials
 *   3. IAM Role (em instâncias EC2 ou containers ECS/EKS)
 *
 * Configuração necessária em database.properties:
 *   etl.s3.bucket=nome-do-bucket
 *   etl.s3.prefixo=pasta/dentro/do/bucket/   (opcional)
 *   etl.s3.regiao=sa-east-1
 */
public class FonteS3 implements FonteArquivos, AutoCloseable {

    private static final Logger log = LoggerFactory.getLogger(FonteS3.class);

    private final String    bucket;
    private final String    prefixo;
    private final S3Client  s3Client;

    /**
     * @param bucket  nome do bucket S3
     * @param prefixo prefixo (pasta) dentro do bucket; pode ser vazio
     * @param regiao  região AWS, ex: "sa-east-1"
     */
    public FonteS3(String bucket, String prefixo, String regiao) {
        this.bucket   = bucket;
        this.prefixo  = prefixo == null ? "" : prefixo;
        this.s3Client = S3Client.builder()
                .region(Region.of(regiao))
                .build();
        log.info("FonteS3 inicializada — bucket: {}, prefixo: '{}', região: {}",
                bucket, this.prefixo, regiao);
    }

    /**
     * Lista todas as chaves (keys) de objetos .xlsx no bucket/prefixo configurado.
     * Suporta paginação automática para buckets com muitos arquivos.
     */
    @Override
    public List<String> listarArquivos() {
        try {
            ListObjectsV2Request request = ListObjectsV2Request.builder()
                    .bucket(bucket)
                    .prefix(prefixo)
                    .build();

            // Coleta todos os objetos paginados
            List<String> chaves = s3Client.listObjectsV2Paginator(request)
                    .stream()
                    .flatMap(page -> page.contents().stream())
                    .map(S3Object::key)
                    .filter(key -> key.toLowerCase().endsWith(".xlsx"))
                    // Ignora "pastas" (chaves que terminam com /)
                    .filter(key -> !key.endsWith("/"))
                    .sorted()
                    .collect(Collectors.toList());

            if (chaves.isEmpty()) {
                log.warn("Nenhum arquivo .xlsx encontrado no bucket '{}' com prefixo '{}'",
                        bucket, prefixo);
            } else {
                log.info("{} arquivo(s) .xlsx encontrado(s) no S3.", chaves.size());
            }
            return chaves;

        } catch (S3Exception e) {
            log.error("Erro ao listar objetos no S3: {}", e.awsErrorDetails().errorMessage());
            return Collections.emptyList();
        }
    }

    /**
     * Faz o download do objeto S3 e retorna um InputStream para leitura pelo POI.
     *
     * @param chave a chave (key) do objeto no S3
     * @return InputStream com o conteúdo do arquivo .xlsx
     */
    @Override
    public InputStream abrirArquivo(String chave) throws Exception {
        log.debug("Baixando do S3: s3://{}/{}", bucket, chave);
        GetObjectRequest request = GetObjectRequest.builder()
                .bucket(bucket)
                .key(chave)
                .build();
        return s3Client.getObject(request); // ResponseInputStream implementa InputStream
    }

    /** Fecha o cliente S3 ao término do processo. */
    @Override
    public void close() {
        if (s3Client != null) {
            s3Client.close();
            log.info("Cliente S3 encerrado.");
        }
    }
}
