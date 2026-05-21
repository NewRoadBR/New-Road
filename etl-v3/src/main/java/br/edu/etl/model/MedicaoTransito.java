package br.edu.etl.model;

import java.time.LocalDateTime;

/**
 * Representa uma medicao de transito lida do arquivo XLSX.
 * Os campos com prefixo "calc" sao preenchidos durante o Transform.
 */
public class MedicaoTransito {

    // Campos brutos (vindos do XLSX)
    private String        nomeVia;
    private String        sentido;
    private String        tipoVia;
    private String        regiao;
    private LocalDateTime dataHoraMedicao;
    private int           filaEmMetros;
    private String        trecho;

    // Campos calculados no Transform
    private int     horaDoDia;
    private int     diaDaSemana;
    private boolean fimDeSemana;
    private boolean viaExpressa;
    private String  periodoDoDia;

    public MedicaoTransito() {}

    // ── Getters e Setters ────────────────────────────────────────

    public String        getNomeVia()                    { return nomeVia; }
    public void          setNomeVia(String v)            { this.nomeVia = v != null ? v.trim() : null; }

    public String        getSentido()                    { return sentido; }
    public void          setSentido(String v)            { this.sentido = v != null ? v.trim() : null; }

    public String        getTipoVia()                    { return tipoVia; }
    public void          setTipoVia(String v)            { this.tipoVia = v != null ? v.trim() : null; }

    public String        getRegiao()                     { return regiao; }
    public void          setRegiao(String v)             { this.regiao = v != null ? v.trim() : null; }

    public LocalDateTime getDataHoraMedicao()            { return dataHoraMedicao; }
    public void          setDataHoraMedicao(LocalDateTime v){ this.dataHoraMedicao = v; }

    public int           getFilaEmMetros()               { return filaEmMetros; }
    public void          setFilaEmMetros(int v)          { this.filaEmMetros = v; }

    public String        getTrecho()                     { return trecho; }
    public void          setTrecho(String v)             { this.trecho = v != null ? v.trim() : null; }

    public int           getHoraDoDia()                  { return horaDoDia; }
    public void          setHoraDoDia(int v)             { this.horaDoDia = v; }

    public int           getDiaDaSemana()                { return diaDaSemana; }
    public void          setDiaDaSemana(int v)           { this.diaDaSemana = v; }

    public boolean       isFimDeSemana()                 { return fimDeSemana; }
    public void          setFimDeSemana(boolean v)       { this.fimDeSemana = v; }

    public boolean       isViaExpressa()                 { return viaExpressa; }
    public void          setViaExpressa(boolean v)       { this.viaExpressa = v; }

    public String        getPeriodoDoDia()               { return periodoDoDia; }
    public void          setPeriodoDoDia(String v)       { this.periodoDoDia = v; }

    @Override
    public String toString() {
        return String.format("MedicaoTransito{via='%s', hora=%d, fila=%dm}",
                nomeVia, horaDoDia, filaEmMetros);
    }
}
