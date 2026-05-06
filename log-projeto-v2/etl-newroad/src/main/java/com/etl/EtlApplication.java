package com.etl;

/**
 * Ponto de entrada do ETL.
 */
public class EtlApplication {

    public static void main(String[] args) {
        System.out.println("=== INICIANDO ETL ===");
        new EtlService().executar();
        System.out.println("=== ETL FINALIZADO ===");
    }
}
