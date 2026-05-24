package br.com.newroad.model;

/**
 * Modelo detalhado com os campos de contagem de eixos reais da ARTESP.
 *
 * Mapeamento planilha → Java (camelCase) → SQL (snake_case):
 *
 *   LEVE-EIXOS 2    → leveEixos2    → leve_eixos_2
 *   MOTO-EIXOS 2    → motoEixos2    → moto_eixos_2
 *   PESADO-EIXOS 2  → pesadoEixos2  → pesado_eixos_2
 *   LEVE-EIXOS 3    → leveEixos3    → leve_eixos_3
 *   PESADO-EIXOS 3  → pesadoEixos3  → pesado_eixos_3
 *   LEVE-EIXOS 4    → leveEixos4    → leve_eixos_4
 *   PESADO-EIXOS 4  → pesadoEixos4  → pesado_eixos_4
 *   PESADO-EIXOS 5  → pesadoEixos5  → pesado_eixos_5
 *   PESADO-EIXOS 6  → pesadoEixos6  → pesado_eixos_6
 *   ESPECIAL        → especial       → especial
 */
public class RegistroTrafegoDetalhado extends RegistroTrafego {

    private int leveEixos2;
    private int motoEixos2;
    private int pesadoEixos2;
    private int leveEixos3;
    private int pesadoEixos3;
    private int leveEixos4;
    private int pesadoEixos4;
    private int pesadoEixos5;
    private int pesadoEixos6;
    private int especial;

    /** Calculado pela etapa TRANSFORM — soma de todos os campos acima. */
    private int volumeTotal;

    public RegistroTrafegoDetalhado() { super(); }

    /**
     * TRANSFORM: soma todos os 10 campos de contagem para gerar o volume total.
     * Chamar após preencher todos os setters de contagem.
     */
    public void calcularVolumeTotal() {
        this.volumeTotal =
                leveEixos2  + motoEixos2   + pesadoEixos2 +
                leveEixos3  + pesadoEixos3 +
                leveEixos4  + pesadoEixos4 +
                pesadoEixos5 + pesadoEixos6 +
                especial;
    }

    // ── Getters e Setters ─────────────────────────────────────

    public int getLeveEixos2()              { return leveEixos2; }
    public void setLeveEixos2(int v)        { this.leveEixos2 = v; }

    public int getMotoEixos2()              { return motoEixos2; }
    public void setMotoEixos2(int v)        { this.motoEixos2 = v; }

    public int getPesadoEixos2()            { return pesadoEixos2; }
    public void setPesadoEixos2(int v)      { this.pesadoEixos2 = v; }

    public int getLeveEixos3()              { return leveEixos3; }
    public void setLeveEixos3(int v)        { this.leveEixos3 = v; }

    public int getPesadoEixos3()            { return pesadoEixos3; }
    public void setPesadoEixos3(int v)      { this.pesadoEixos3 = v; }

    public int getLeveEixos4()              { return leveEixos4; }
    public void setLeveEixos4(int v)        { this.leveEixos4 = v; }

    public int getPesadoEixos4()            { return pesadoEixos4; }
    public void setPesadoEixos4(int v)      { this.pesadoEixos4 = v; }

    public int getPesadoEixos5()            { return pesadoEixos5; }
    public void setPesadoEixos5(int v)      { this.pesadoEixos5 = v; }

    public int getPesadoEixos6()            { return pesadoEixos6; }
    public void setPesadoEixos6(int v)      { this.pesadoEixos6 = v; }

    public int getEspecial()                { return especial; }
    public void setEspecial(int v)          { this.especial = v; }

    public int getVolumeTotal()             { return volumeTotal; }
}
