package br.com.newroad.log;

/**
 * Especialização de {@link Log} para eventos operacionais normais do ETL.
 *
 * <p>Utilizada em fluxos bem-sucedidos como:
 * <ul>
 *   <li>"Início do processo ETL"</li>
 *   <li>"Lote de 1000 linhas inserido com sucesso"</li>
 *   <li>"Processo ETL finalizado em 4.2 segundos"</li>
 * </ul>
 * </p>
 *
 */
public class LogOperacional extends Log {

    /** Nível fixo desta especialização. */
    private static final String NIVEL = "INFO";

    /**
     * Cria um log operacional para um evento de fluxo normal.
     *
     * @param classeOrigem classe que originou o evento
     * @param mensagem     descrição do evento
     */
    public LogOperacional(String classeOrigem, String mensagem) {
        super(classeOrigem, mensagem);
        this.nivelLog = NIVEL;
    }

    /**
     * Retorna sempre "INFO" — nível padrão dos logs operacionais.
     */
    @Override
    public String getNivelLog() {
        return NIVEL;
    }
}
