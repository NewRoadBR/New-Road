package br.com.newroad.log;

import java.io.PrintWriter;
import java.io.StringWriter;

public class LogErro extends Log {

    /** Nível fixo desta especialização. */
    private static final String NIVEL = "ERROR";

    /**
     * Stack trace completo da exceção, convertido em String para persistência.
     * Mapeado para a coluna {@code exception_stacktrace} na tabela {@code log_etl}.
     */
    private final String stackTrace;

    /**
     * Nome simples da classe da exceção (ex: "SQLException", "IOException").
     * Incluído no início da mensagem para facilitar filtragens no banco.
     */
    private final String excecaoTipo;

    /**
     * Cria um log de erro a partir de uma exceção capturada.
     *
     * @param classeOrigem classe onde a exceção foi capturada
     * @param mensagem     descrição contextual do erro (linha, operação, etc.)
     * @param excecao      a exceção capturada no bloco catch
     */
    public LogErro(String classeOrigem, String mensagem, Throwable excecao) {
        super(classeOrigem, mensagem);
        this.nivelLog    = NIVEL;
        this.excecaoTipo = excecao.getClass().getSimpleName();
        this.stackTrace  = converterStackTrace(excecao);
    }

    /**
     * Converte o stack trace de uma exceção em String.
     *
     * @param excecao a exceção a ser convertida
     * @return stack trace completo como texto
     */
    private String converterStackTrace(Throwable excecao) {
        StringWriter sw = new StringWriter();
        excecao.printStackTrace(new PrintWriter(sw));
        return sw.toString();
    }

    /**
     * Retorna sempre "ERROR" — nível padrão dos logs de erro.
     */
    @Override
    public String getNivelLog() {
        return NIVEL;
    }

    /**
     * Retorna o stack trace completo como texto para persistência no banco.
     */
    @Override
    public String getStackTrace() {
        return stackTrace;
    }

    public String getExcecaoTipo() {
        return excecaoTipo;
    }

    @Override
    public String toString() {
        return String.format("[%s] %s | %s | [%s] %s",
                NIVEL, getTimestamp(), getClasseOrigem(), excecaoTipo, getMensagem());
    }
}
