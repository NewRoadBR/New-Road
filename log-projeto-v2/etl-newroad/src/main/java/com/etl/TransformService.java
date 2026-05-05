package com.etl;

import java.util.Properties;

/**
 * TRANSFORM — Aplica uppercase, prefixo e sufixo ao valor extraído.
 */
public class TransformService {

    private final String prefixo;
    private final String sufixo;

    public TransformService() {
        Properties props = ConexaoDB.getProps();
        this.prefixo = props.getProperty("transform.prefixo", "[ETL]");
        this.sufixo  = props.getProperty("transform.sufixo",  "[OK]");
    }

    public String transformar(String valorOriginal) {
        System.out.println("[TRANSFORM] Transformando: '" + valorOriginal + "'");

        String resultado = prefixo + " " + valorOriginal.toUpperCase() + " " + sufixo;

        System.out.println("[TRANSFORM] Resultado: '" + resultado + "'");
        return resultado;
    }
}
