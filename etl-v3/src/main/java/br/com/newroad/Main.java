package br.com.newroad;

import br.com.newroad.transform.ProcessadorETL;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Main {

    private static final Logger log = LoggerFactory.getLogger(Main.class);

    public static void main(String[] args) {
        log.info("Iniciando ETL NEW ROAD... (heap máximo: {} MB)",
                Runtime.getRuntime().maxMemory() / 1_048_576);
        try {
            new ProcessadorETL().executar();
        } catch (Exception e) {
            log.error("Falha fatal ao inicializar o ETL: {}", e.getMessage(), e);
            System.exit(1);
        }
    }
}
