package br.com.newroad.util;

import br.com.newroad.extract.FonteArquivos;
import br.com.newroad.extract.FonteLocal;
import br.com.newroad.extract.FonteS3;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

/**
 * Utilitário central de configuração do ETL.
 * Lê database.properties e expõe conexões JDBC e a fonte de arquivos correta.
 */
public class ConexaoBancoDados {

    private static final Logger log = LoggerFactory.getLogger(ConexaoBancoDados.class);
    private static final Properties props = new Properties();

    static {
        try (InputStream is = ConexaoBancoDados.class
                .getClassLoader().getResourceAsStream("database.properties")) {
            if (is == null)
                throw new IllegalStateException("'database.properties' não encontrado no classpath.");
            props.load(is);
        } catch (IOException e) {
            throw new IllegalStateException("Falha ao carregar database.properties: " + e.getMessage(), e);
        }
    }

    private ConexaoBancoDados() {}

    /** Abre e retorna uma nova conexão JDBC com o MySQL. */
    public static Connection obterConexao() throws SQLException {
        String url = props.getProperty("db.url");
        return DriverManager.getConnection(
                normalizeJdbcUrl(url),
                props.getProperty("db.usuario"),
                props.getProperty("db.senha")
        );
    }

    private static String normalizeJdbcUrl(String url) {
        if (url == null || url.isBlank()) return url;
        if (url.contains("allowLoadLocalInfile=")) {
            return url;
        }
        if (url.contains("?")) {
            return url + "&allowLoadLocalInfile=true";
        }
        return url + "?allowLoadLocalInfile=true";
    }

    /** Tamanho do lote para batch insert. Padrão: 1000. */
    public static int getTamanhoLote() {
        return Integer.parseInt(props.getProperty("etl.tamanho.lote", "1000"));
    }

    /**
     * Fábrica da fonte de arquivos.
     * Lê {@code etl.fonte} e retorna LOCAL ou S3 conforme configurado.
     *
     * @return implementação de {@link FonteArquivos} correta
     */
    public static FonteArquivos criarFonte() {
        String tipo = props.getProperty("etl.fonte", "LOCAL").toUpperCase().trim();
        log.info("Fonte de arquivos configurada: {}", tipo);

        return switch (tipo) {
            case "S3" -> new FonteS3(
                    props.getProperty("etl.s3.bucket"),
                    props.getProperty("etl.s3.prefixo", ""),
                    props.getProperty("etl.s3.regiao", "sa-east-1")
            );
            case "LOCAL" -> new FonteLocal(
                    props.getProperty("etl.local.pasta")
            );
            default -> throw new IllegalArgumentException(
                    "Valor inválido para etl.fonte: '" + tipo + "'. Use LOCAL ou S3.");
        };
    }
}
