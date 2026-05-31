let rodoviaSelecionada = "Rodovia Anhanguera";

let graficoFluxoHorario;
let graficoDiaSemana;

/*
=========================================================
FLUXO MÉDIO
=========================================================
*/

async function carregarFluxoMedio() {

    const resposta = await fetch(
        `/dashboard/fluxo-medio/${encodeURIComponent(rodoviaSelecionada)}`
    );

    const dados = await resposta.json();

    if (dados.length > 0) {

        document.getElementById("kpiFluxo").innerText =
            dados[0].fluxo;

    }

}

/*
=========================================================
HORÁRIO CRÍTICO
=========================================================
*/

async function carregarHorarioCritico() {

    const resposta = await fetch(
        `/dashboard/horario-critico/${encodeURIComponent(rodoviaSelecionada)}`
    );

    const dados = await resposta.json();

    if (dados.length > 0) {

        document.getElementById("kpiHorarioCritico").innerText =
            dados[0].periodo;

    }

}

/*
=========================================================
JANELA IDEAL
=========================================================
*/

async function carregarJanelaIdeal() {

    const resposta = await fetch(
        `/dashboard/janela-ideal/${encodeURIComponent(rodoviaSelecionada)}`
    );

    const dados = await resposta.json();

    if (dados.length > 0) {

        document.getElementById("kpiJanelaIdeal").innerText =
            dados[0].periodo;

    }

}

/*
=========================================================
MELHOR DIA
=========================================================
*/

async function carregarMelhorDia() {

    const resposta = await fetch(
        `/dashboard/melhor-dia/${encodeURIComponent(rodoviaSelecionada)}`
    );

    const dados = await resposta.json();

    if (dados.length > 0) {

        const dias = {

            1: "Dom",
            2: "Seg",
            3: "Ter",
            4: "Qua",
            5: "Qui",
            6: "Sex",
            7: "Sáb"

        };

        document.getElementById("kpiMelhorDia").innerText =
            dias[dados[0].dia_semana];

    }

}

/*
=========================================================
PRESSÃO OPERACIONAL
=========================================================
*/

async function carregarPressaoOperacional() {

    const resposta = await fetch(
        `/dashboard/pressao-operacional/${encodeURIComponent(rodoviaSelecionada)}`
    );

    const dados = await resposta.json();

    const media = dados.reduce((acc, item) => {

        return acc + Number(item.pressao_operacional);

    }, 0) / dados.length;

    document.getElementById("kpiPressaoOperacional").innerText =
        `${media.toFixed(0)}%`;

}

/*
=========================================================
PERFIL RODOVIA
=========================================================
*/

async function carregarPerfilRodovia() {

    const resposta = await fetch(
        `/dashboard/perfil-rodovia/${encodeURIComponent(rodoviaSelecionada)}`
    );

    const dados = await resposta.json();

    if (dados.length > 0) {

        document.getElementById("kpiPerfilPesado").innerText =
            dados[0].media_pesados;

    }

}

/*
=========================================================
FLUXO HORÁRIO
=========================================================
*/

async function carregarFluxoHorario() {

    const resposta = await fetch(
        `/dashboard/fluxo-horario/${encodeURIComponent(rodoviaSelecionada)}`
    );

    const dados = await resposta.json();

    const labels = dados.map(item => `${item.hora}h`);

    const volumes = dados.map(item => item.volume);

    atualizarGraficoFluxo(labels, volumes);

}

function atualizarGraficoFluxo(labels, volumes) {

    const ctx = document
        .getElementById("graficoFluxoHorario")
        .getContext("2d");

    if (graficoFluxoHorario) {

        graficoFluxoHorario.destroy();

    }

    graficoFluxoHorario = new Chart(ctx, {

        type: "line",

        data: {

            labels,

            datasets: [{

                label: "Fluxo Médio",

                data: volumes,

                borderWidth: 2,

                tension: 0.3

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false

        }

    });

}

/*
=========================================================
VOLUME DIA SEMANA
=========================================================
*/

async function carregarVolumeDiaSemana() {

    const resposta = await fetch(
        `/dashboard/volume-dia-semana/${encodeURIComponent(rodoviaSelecionada)}`
    );

    const dados = await resposta.json();

    const labels = dados.map(item => item.nome_dia);

    const volumes = dados.map(item => item.volume_total);

    atualizarGraficoDiaSemana(labels, volumes);

}

function atualizarGraficoDiaSemana(labels, volumes) {

    const ctx = document
        .getElementById("graficoDiaSemana")
        .getContext("2d");

    if (graficoDiaSemana) {

        graficoDiaSemana.destroy();

    }

    graficoDiaSemana = new Chart(ctx, {

        type: "bar",

        data: {

            labels,

            datasets: [{

                label: "Volume Médio",

                data: volumes,

                borderWidth: 1

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false

        }

    });

}

/*
=========================================================
OBRAS
=========================================================
*/

async function carregarObras() {

    const resposta = await fetch(
        `/obras/rodovia/${encodeURIComponent(rodoviaSelecionada)}`
    );

    const dados = await resposta.json();

    renderizarTabelaObras(dados);

}

function renderizarTabelaObras(obras) {

    const tbody = document.getElementById("tbodyObras");

    tbody.innerHTML = "";

    obras.forEach(obra => {

        tbody.innerHTML += `
            <tr>
                <td>${obra.titulo}</td>
                <td>${obra.tipo}</td>
                <td>${obra.status}</td>
                <td>${obra.data_inicio}</td>
                <td>${obra.data_fim || "-"}</td>
            </tr>
        `;

    });

}

/*
=========================================================
RODOVIA
=========================================================
*/

async function trocarRodovia() {

    const select = document.getElementById("selectRodovia");

    rodoviaSelecionada = select.value;

    await iniciarDashboard();

}

/*
=========================================================
INIT
=========================================================
*/

async function iniciarDashboard() {

    await carregarFluxoMedio();

    await carregarHorarioCritico();

    await carregarJanelaIdeal();

    await carregarMelhorDia();

    await carregarPressaoOperacional();

    await carregarPerfilRodovia();

    await carregarFluxoHorario();

    await carregarVolumeDiaSemana();

    await carregarObras();

}

iniciarDashboard();