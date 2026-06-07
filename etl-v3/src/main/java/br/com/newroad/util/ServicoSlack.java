package br.com.newroad.util;

import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Properties;

public class ServicoSlack {

    private static String slackUrl;

    static {
        try (InputStream input =
                     ServicoSlack.class.getClassLoader()
                             .getResourceAsStream("database.properties")) {

            Properties prop = new Properties();

            if (input != null) {
                prop.load(input);
                slackUrl = prop.getProperty("slack.webhook.url");
            }

        } catch (Exception e) {
            System.err.println(
                    "Erro ao carregar webhook do Slack: "
                            + e.getMessage()
            );
        }
    }

    public static void enviarAlerta(String texto) {

        String tipo = detectarTipo(texto);

        // salva sempre no banco
        ServicoNotificacao.salvar(texto, tipo);

        // se não houver webhook configurado,
        // continua funcionando pelo banco
        if (slackUrl == null || slackUrl.isBlank()) {

            System.err.println(
                    "URL do Slack não foi configurada ou está vazia."
            );

            return;
        }

        try {

            String json =
                    "{\"text\": \"" +
                    texto.replace("\"", "\\\"") +
                    "\"}";

            HttpClient client = HttpClient.newHttpClient();

            HttpRequest request =
                    HttpRequest.newBuilder()
                            .uri(URI.create(slackUrl))
                            .header(
                                    "Content-Type",
                                    "application/json"
                            )
                            .POST(
                                    HttpRequest.BodyPublishers
                                            .ofString(json)
                            )
                            .build();

            client.sendAsync(
                    request,
                    HttpResponse.BodyHandlers.ofString()
            )
                    .thenAccept(response -> {

                        if (response.statusCode() != 200) {

                            System.err.println(
                                    "Erro ao postar no Slack. Status HTTP: "
                                            + response.statusCode()
                            );
                        }
                    })
                    .exceptionally(e -> {

                        System.err.println(
                                "Falha de rede ao conectar com o Slack: "
                                        + e.getMessage()
                        );

                        return null;
                    });

        } catch (Exception e) {

            System.err.println(
                    "Erro ao enviar mensagem Slack: "
                            + e.getMessage()
            );
        }
    }

    private static String detectarTipo(String texto) {

        String msg = texto.toLowerCase();

        if (msg.contains("falhou")
                || msg.contains("erro")
                || msg.contains("❌")) {
            return "error";
        }

        if (msg.contains("sucesso")
                || msg.contains("concluído")
                || msg.contains("concluido")
                || msg.contains("✅")) {
            return "success";
        }

        return "info";
    }
}