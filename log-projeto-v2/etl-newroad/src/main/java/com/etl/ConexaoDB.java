package com.etl;

import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.util.Properties;

/**
 * Gerencia a conexão JDBC com o MySQL.
 * As configurações são lidas do arquivo database.properties.
 */
public class ConexaoDB {

    private static final Properties props = new Properties();

    static {
        try (InputStream is = ConexaoDB.class
                .getClassLoader()
                .getResourceAsStream("database.properties")) {
            props.load(is);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao carregar database.properties", e);
        }
    }

    public static Connection obterConexao() throws Exception {
        return DriverManager.getConnection(
                props.getProperty("db.url"),
                props.getProperty("db.username"),
                props.getProperty("db.password")
        );
    }

    public static Properties getProps() {
        return props;
    }
}
