package br.edu.etl.s3;

import br.edu.etl.log.AsyncDbLogger;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request;
import software.amazon.awssdk.services.s3.model.S3Object;

import java.io.File;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

/**
 * Fonte S3: lista e baixa arquivos .xlsx de um bucket para uma pasta temporaria local.
 *
 * Credenciais AWS (em ordem de prioridade):
 *   1. Variaveis de ambiente: AWS_ACCESS_KEY_ID e AWS_SECRET_ACCESS_KEY
 *   2. Arquivo ~/.aws/credentials (criado por "aws configure")
 *   3. IAM Role (se rodando em EC2, ECS ou Lambda)
 *
 * Os arquivos sao baixados um por vez — nao ocupa disco com todos simultaneamente.
 * A pasta temporaria e limpa apos o processamento via limpar().
 */
public class FonteS3 implements FonteArquivos {

    private final String bucket;
    private final String prefixo;
    private final Path   pastaTemp;
    private final AsyncDbLogger log;
    private final S3Client s3;

    private final List<File> baixados = new ArrayList<>();

    public FonteS3(String bucket, String prefixo, String regiao,
                   String pastaTemp, AsyncDbLogger log) {
        this.bucket    = bucket;
        this.prefixo   = prefixo;
        this.pastaTemp = Paths.get(pastaTemp, "s3_download");
        this.log       = log;
        this.s3        = S3Client.builder()
                                 .region(Region.of(regiao))
                                 .build();
    }

    @Override
    public List<File> listarArquivos() throws Exception {
        Files.createDirectories(pastaTemp);

        // Lista os objetos .xlsx no bucket
        List<String> chaves = new ArrayList<>();
        s3.listObjectsV2(ListObjectsV2Request.builder()
                .bucket(bucket)
                .prefix(prefixo)
                .build())
          .contents()
          .stream()
          .filter(o -> o.key().endsWith(".xlsx"))
          .map(S3Object::key)
          .sorted()
          .forEach(chaves::add);

        if (chaves.isEmpty())
            throw new IllegalArgumentException(
                    "Nenhum .xlsx encontrado em s3://" + bucket + "/" + prefixo);

        log.info("Fonte S3: " + chaves.size() + " arquivo(s) em s3://" + bucket + "/" + prefixo);

        // Baixa cada arquivo para a pasta temporaria
        List<File> arquivos = new ArrayList<>();
        for (int i = 0; i < chaves.size(); i++) {
            String chave = chaves.get(i);
            String nomeArquivo = chave.contains("/")
                    ? chave.substring(chave.lastIndexOf('/') + 1)
                    : chave;

            Path destino = pastaTemp.resolve(nomeArquivo);
            log.info(String.format("Baixando [%d/%d] s3://%s/%s...",
                    i + 1, chaves.size(), bucket, chave));

            try (InputStream in  = s3.getObject(r -> r.bucket(bucket).key(chave));
                 OutputStream out = Files.newOutputStream(destino)) {
                in.transferTo(out);
            }

            File arquivo = destino.toFile();
            arquivos.add(arquivo);
            baixados.add(arquivo);
            log.info("Download concluido: " + nomeArquivo +
                    " (" + String.format("%.1f", arquivo.length() / 1_048_576.0) + " MB)");
        }

        return arquivos;
    }

    @Override
    public void limpar() {
        // Remove os arquivos baixados do S3 apos o processamento
        for (File f : baixados) {
            if (f.exists() && f.delete()) {
                log.info("Temp removido: " + f.getName());
            }
        }
        pastaTemp.toFile().delete(); // remove a pasta se estiver vazia
        s3.close();
    }
}
