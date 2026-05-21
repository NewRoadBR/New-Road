package br.edu.etl.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

import java.sql.Connection;
import java.sql.SQLException;

/**
 * Pool de conexoes MySQL (HikariCP).
 * allowLoadLocalInfile=true na URL e obrigatorio para LOAD DATA LOCAL INFILE.
 */
public class Db {

    private static HikariDataSource pool;

    public static void init() {
        Config cfg = Config.get();
        HikariConfig hc = new HikariConfig();
        hc.setJdbcUrl(cfg.dbUrl());
        hc.setUsername(cfg.dbUsuario());
        hc.setPassword(cfg.dbSenha());
        hc.setMaximumPoolSize(5);
        hc.setMinimumIdle(2);
        hc.setConnectionTimeout(30_000);
        hc.setPoolName("ETL-Pool");
        pool = new HikariDataSource(hc);
    }

    public static Connection conexao() throws SQLException {
        if (pool == null) throw new IllegalStateException("Db.init() nao foi chamado");
        return pool.getConnection();
    }

    public static void fechar() {
        if (pool != null && !pool.isClosed()) pool.close();
    }
}
