package school.sptech;

import java.util.Scanner;
import java.util.concurrent.ThreadLocalRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class logProjeto {

    public static String lerCampoObrigatorio(Scanner scanner, String mensagem) {
        String valor;

        do {
            System.out.println(mensagem);
            valor = scanner.nextLine();

            if (valor.trim().isEmpty()) {
                System.out.println("Este campo é obrigatório. Digite novamente\n.");
            }

        } while (valor.trim().isEmpty());

        return valor;
    }

    public static void log(String mensagem) {
        DateTimeFormatter formato = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
        String dataHora = LocalDateTime.now().format(formato);
        System.out.println("[" + dataHora + "] " + mensagem);
    }

    public static void main(String[] args) {

        log("Sistema de cadastro iniciado\n");
        System.out.println("Bem vindo ao sistema de cadastro da NewRoad \n");

        Scanner cadastro = new Scanner(System.in);

        String nomeEmpresa = lerCampoObrigatorio(cadastro, "Insira o nome da sua empresa:");
        log("Nome da empresa informado: " + nomeEmpresa + "\n");

        String cnpjEmpresa = lerCampoObrigatorio(cadastro, "Insira o CNPJ da empresa:");
        while (!cnpjEmpresa.matches("\\d{14}")) {
            System.out.println("CNPJ inválido! Digite novamente:\n");
            cnpjEmpresa = cadastro.nextLine();
        }
        log("CNPJ válido recebido: " + cnpjEmpresa + "\n") ;

        String nomeResponsavel = lerCampoObrigatorio(cadastro, "Insira o nome do responsável:");
        log("Responsável informado: " + nomeResponsavel + "\n");

        String emailResponsavel = lerCampoObrigatorio(cadastro, "Insira o email do responsável:");
        while (!emailResponsavel.contains("@")) {
            System.out.println("Email inválido! Digite novamente:\n");
            emailResponsavel = cadastro.nextLine();
        }
        log("Email válido recebido: " + emailResponsavel);

        Integer senha = ThreadLocalRandom.current().nextInt(100000, 1000000);
        log("Senha temporária gerada\n\n");

        System.out.println("Bem-vindo à NewRoad, " + nomeResponsavel + "!\n" +
                "A empresa " + nomeEmpresa + " de CNPJ " + cnpjEmpresa +
                " foi cadastrada com sucesso no nosso sistema.\n\n" +

                "Seguem suas credenciais de acesso para nossa aplicação:\n\n" +

                "www.gustavootario.com\n" +
                "Email: " + emailResponsavel + "\n" +
                "Senha: " + senha + "\n\n" +

                "Após acessar a aplicação, redefina sua senha.\n\n" +

                "A NewRoad agradece a sua fidelidade!\n");

        log("Cadastro finalizado!");
    }
}
