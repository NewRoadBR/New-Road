package com.etl;

/**
 * Ponto de entrada do pipeline ETL.
 */
public class EtlApplication {

    public static void main(String[] args) {
        System.out.println("=== INICIANDO PIPELINE ETL ===");
        new EtlService().executar();
        System.out.println("=== PIPELINE ETL FINALIZADO ===");
    }
}
