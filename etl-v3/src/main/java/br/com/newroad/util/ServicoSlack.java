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
        // Carrega a URL do Slack que o entrypoint.sh colocou no database.properties
        try (InputStream input = ServicoSlack.class.getClassLoader().getResourceAsStream("database.properties")) {
            Properties prop = new Properties();
            if (input != null) {
                prop.load(input);
                slackUrl = prop.getProperty("slack.webhook.url");
            }
        } catch (Exception e) {
            System.err.println("Erro ao carregar webhook do Slack: " + e.getMessage());
        }
    }

    public static void enviarAlerta(String texto) {
        if (slackUrl == null || slackUrl.isBlank()) {
            System.err.println("URL do Slack não foi configurada ou está vazia.");
            return;
        }

        // Formata o corpo da requisição no formato JSON que o Slack exige
        String json = "{\"text\": \"" + texto + "\"}";

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(slackUrl))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        // Envia em segundo plano (assíncrono) para não atrasar o seu ETL pesado
        client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenAccept(response -> {
                    if (response.statusCode() != 200) {
                        System.err.println("Erro ao postar no Slack. Status HTTP: " + response.statusCode());
                    }
                })
                .exceptionally(e -> {
                    System.err.println("Falha de rede ao conectar com o Slack: " + e.getMessage());
                    return null;
                });
    }
}