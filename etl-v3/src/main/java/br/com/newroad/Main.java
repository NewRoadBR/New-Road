package br.com.newroad;

import br.com.newroad.transform.ProcessadorETL;
import br.com.newroad.util.ServicoSlack;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Main {

    private static final Logger log = LoggerFactory.getLogger(Main.class);

    public static void main(String[] args) {
        log.info("Iniciando ETL NEW ROAD... (heap máximo: {} MB)",
                Runtime.getRuntime().maxMemory() / 1_048_576);

        // Alerta 1: Monitora que o container subiu e iniciou o trabalho na nuvem
        ServicoSlack.enviarAlerta(" *ETL NEW ROAD:* O processo de inicialização do ETL foi disparado...");
        try {
            new ProcessadorETL().executar();
            
            // Alerta 2: Sucesso! Notifica que a carga pesada terminou com sucesso
            ServicoSlack.enviarAlerta(" *ETL NEW ROAD concluído com sucesso!* \n📊 O volume bruto de dados já foi importado para o MySQL.");


        } catch (Exception e) {
            log.error("Falha fatal ao inicializar o ETL: {}", e.getMessage(), e);

            // Alerta 3: Se der erro, avisa no Slack
            ServicoSlack.enviarAlerta("❌ *ETL NEW ROAD falhou!* \n⚠️ Erro crítico detectado: `" + e.getMessage() + "`");

            System.exit(1);
        }
    }
}