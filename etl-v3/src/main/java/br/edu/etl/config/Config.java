package br.edu.etl.config;

import java.io.InputStream;
import java.util.Properties;

/**
 * Carrega e expoe as configuracoes do application.properties.
 */
public class Config {

    private static Config instance;
    private final Properties props = new Properties();

    private Config() {
        try (InputStream is = getClass().getClassLoader()
                .getResourceAsStream("application.properties")) {
            if (is == null)
                throw new IllegalStateException("application.properties nao encontrado");
            props.load(is);
        } catch (Exception e) {
            throw new IllegalStateException("Falha ao carregar configuracoes", e);
        }
    }

    public static Config get() {
        if (instance == null) instance = new Config();
        return instance;
    }

    // ── Fonte dos arquivos ────────────────────────────────────────
    /** "local" ou "s3" */
    public String fonte()       { return props.getProperty("etl.fonte", "local").trim().toLowerCase(); }
    public boolean usaS3()      { return "s3".equals(fonte()); }
    public String pastaXlsx()   { return props.getProperty("etl.pasta.xlsx", "xlsx_input"); }
    public String pastaTemp()   { return props.getProperty("etl.pasta.temp", "temp_csv"); }
    public int    minMedicoes() { return Integer.parseInt(props.getProperty("etl.min.medicoes", "5")); }

    // ── S3 ────────────────────────────────────────────────────────
    public String s3Bucket()   { return obrigatorio("s3.bucket"); }
    public String s3Prefixo()  { return props.getProperty("s3.prefixo", ""); }
    public String s3Regiao()   { return props.getProperty("s3.regiao", "us-east-1"); }

    // ── Banco ─────────────────────────────────────────────────────
    public String dbUrl()      { return obrigatorio("db.url"); }
    public String dbUsuario()  { return obrigatorio("db.usuario"); }
    public String dbSenha()    { return obrigatorio("db.senha"); }

    private String obrigatorio(String chave) {
        String v = props.getProperty(chave);
        if (v == null || v.isBlank())
            throw new IllegalStateException("Propriedade obrigatoria nao configurada: " + chave);
        return v.trim();
    }
}
