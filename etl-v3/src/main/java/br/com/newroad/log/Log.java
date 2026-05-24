package br.com.newroad.log;

import java.time.LocalDateTime;


public abstract class Log {

    /** Chave primária gerada pelo banco após persistência. */
    protected Long id;

    /** Momento exato em que o evento de log ocorreu. */
    protected LocalDateTime timestamp;

    /** Nível do log (INFO, ERROR, etc.). Definido pelas subclasses. */
    protected String nivelLog;

    /** Nome totalmente qualificado da classe que originou o evento. */
    protected String classeOrigem;

    /** Mensagem descritiva do evento. */
    protected String mensagem;


    /**
     * Construtor base para ser chamado pelas subclasses via {@code super()}.
     *
     * @param classeOrigem nome da classe que gerou o evento
     * @param mensagem     descrição do evento
     */
    protected Log(String classeOrigem, String mensagem) {
        this.timestamp     = LocalDateTime.now();
        this.classeOrigem  = classeOrigem;
        this.mensagem      = mensagem;
    }

    // ──────────────────────────────────────────────────────────────
    // Método abstrato — cada subclasse define seu nível de log
    // ──────────────────────────────────────────────────────────────

    /**
     * Retorna o nível de log específico desta especialização
     * (ex: "INFO" em LogOperacional, "ERROR" em LogErro).
     *
     * @return string com o nível de log
     */
    public abstract String getNivelLog();

    /**
     * Retorna o stack trace do erro, quando aplicável.
     * Por padrão retorna {@code null}; {@link LogErro} sobrescreve este método.
     *
     * @return stack trace ou null
     */
    public String getStackTrace() {
        return null;
    }

    // ──────────────────────────────────────────────────────────────
    // Getters e Setters
    // ──────────────────────────────────────────────────────────────

    public Long getId()                    { return id; }
    public void setId(Long id)             { this.id = id; }

    public LocalDateTime getTimestamp()    { return timestamp; }

    public String getClasseOrigem()        { return classeOrigem; }

    public String getMensagem()            { return mensagem; }

    @Override
    public String toString() {
        return mensagem;
    }
}
