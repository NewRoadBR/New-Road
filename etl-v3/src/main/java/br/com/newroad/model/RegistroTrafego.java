package br.com.newroad.model;

import java.sql.Date;

public abstract class RegistroTrafego {

    protected Date   data;
    protected int    hora;
    protected String lote;
    protected String praca;
    protected String sentido;

    protected RegistroTrafego() {}

    public Date   getData()                       { return data; }
    public void   setData(Date data)              { this.data = data; }

    public int    getHora()                       { return hora; }
    public void   setHora(int hora)               { this.hora = hora; }

    public String getLote()                       { return lote; }
    public void   setLote(String lote)            { this.lote = lote; }

    public String getPraca()                      { return praca; }
    public void   setPraca(String praca)          { this.praca = praca; }

    public String getSentido()                    { return sentido; }
    public void   setSentido(String sentido)      { this.sentido = sentido; }

}
