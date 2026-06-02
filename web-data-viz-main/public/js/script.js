let rodoviaSelecionada = "Rodovia Anhanguera";
 
let graficoFluxoHorario;
let graficoDiaSemana;
 
function obterEmpresaAtualId() {
 
    return Number(sessionStorage.EMPRESA_ID_USUARIO || 0);
 
}
 
function obterQueryEmpresa() {
 
    var empresaId = obterEmpresaAtualId();
 
    if (!Number.isInteger(empresaId) || empresaId <= 0) {
        throw new Error("Sessao sem empresa valida");
    }
 
    return `empresaId=${empresaId}`;
 
}
 
function obterContextoPorPercentual(valor) {
 
    if (valor >= 70) return { classe: "ruim", label: "Ruim" };
    if (valor >= 40) return { classe: "medio", label: "Médio" };
    return { classe: "bom", label: "Bom" };
 
}
 
function aplicarContextoCard(cardId, contexto) {
 
    var card = document.getElementById(cardId);
    if (!card) return;
 
    card.classList.remove("kpi-bom", "kpi-medio", "kpi-ruim");
    card.classList.add(`kpi-${contexto.classe}`);
 
    var contextoEl = card.querySelector(".kpi-contexto");
    if (!contextoEl) {
        contextoEl = document.createElement("small");
        contextoEl.className = "kpi-contexto";
        card.appendChild(contextoEl);
    }
 
    contextoEl.classList.remove("bom", "medio", "ruim");
    contextoEl.classList.add(contexto.classe);
    contextoEl.textContent = contexto.label;
 
}
 
const userBoxTopo = document.getElementById("userBoxTopo");
const avatarTopo = document.getElementById("avatarTopo");
const nomeUsuarioTopo = document.getElementById("nomeUsuarioTopo");
const perfilUsuarioTopo = document.getElementById("perfilUsuarioTopo");
const seloSessaoAtiva = document.getElementById("seloSessaoAtiva");
 
function criarIniciais(nome) {
 
    if (!nome) return "??";
 
    return nome
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(function (parte) { return parte.charAt(0).toUpperCase(); })
        .join("")
        .slice(0, 2);
 
}
 
function aplicarUsuarioLogadoNaTopbar() {
 
    if (!userBoxTopo) return;
 
    var nome = (sessionStorage.NOME_USUARIO || "").trim();
    var email = (sessionStorage.EMAIL_USUARIO || "").trim();
    var perfil =
        (sessionStorage.PERFIL_USUARIO || "").trim() ||
        (sessionStorage.ROLE_USUARIO || "").trim();
    var avatar = (sessionStorage.AVATAR_USUARIO || "").trim();
 
    var temSessaoAtiva = Boolean(nome || email || perfil || avatar);
 
    if (!temSessaoAtiva) {
 
        userBoxTopo.classList.remove("user-box-logado");
        avatarTopo.textContent = "NR";
        nomeUsuarioTopo.textContent = "NewRoad";
        perfilUsuarioTopo.textContent = "Operacoes";
        perfilUsuarioTopo.removeAttribute("title");
        seloSessaoAtiva.hidden = true;
        return;
 
    }
 
    userBoxTopo.classList.add("user-box-logado");
    avatarTopo.textContent = (avatar || criarIniciais(nome || email)).slice(0, 2).toUpperCase();
    nomeUsuarioTopo.textContent = nome || "Usuario logado";
    perfilUsuarioTopo.textContent = perfil || "Equipe NewRoad";
    perfilUsuarioTopo.title = email;
    seloSessaoAtiva.hidden = false;
 
}
 
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
 
        var fluxo = Number(dados[0].fluxo);
 
        document.getElementById("kpiFluxo").innerText = fluxo;
 
        var fluxoRef = Math.min(Math.max((fluxo / 7000) * 100, 0), 100);
        aplicarContextoCard("cardKpiFluxo", obterContextoPorPercentual(fluxoRef));
 
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
 
        aplicarContextoCard("cardKpiHorarioCritico", { classe: "ruim", label: "Pico" });
 
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
 
        aplicarContextoCard("cardKpiJanelaIdeal", { classe: "bom", label: "Recomendado" });
 
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
 
        aplicarContextoCard("cardKpiMelhorDia", { classe: "bom", label: "Melhor cenário" });
 
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
 
    aplicarContextoCard("cardKpiPressaoOperacional", obterContextoPorPercentual(media));
 
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
 
        var pesado = Number(dados[0].media_pesados);
 
        document.getElementById("kpiPerfilPesado").innerText = pesado;
 
        aplicarContextoCard("cardKpiPerfilPesado", obterContextoPorPercentual(pesado));
 
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
 
    var volumeMax = Math.max.apply(null, volumes);
 
    graficoFluxoHorario = new Chart(ctx, {
 
        type: "line",
 
        data: {
 
            labels,
 
            datasets: [{
 
                label: "Fluxo Médio",
 
                data: volumes,
 
                borderColor: "#f59e0b",
 
                backgroundColor: "rgba(245, 158, 11, 0.15)",
 
                fill: true,
 
                segment: {
                    borderColor: function (contexto) {
                        var valor = contexto.p0.parsed.y;
                        var percentual = volumeMax > 0 ? (valor / volumeMax) * 100 : 0;
                        var nivel = obterContextoPorPercentual(percentual).classe;
                        if (nivel === "ruim") return "#ef4444";
                        if (nivel === "medio") return "#f59e0b";
                        return "#10b981";
                    }
                },
 
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
 
                backgroundColor: volumes.map(function (volume) {
                    var percentual = Math.max.apply(null, volumes) > 0
                        ? (volume / Math.max.apply(null, volumes)) * 100
                        : 0;
                    var nivel = obterContextoPorPercentual(percentual).classe;
                    if (nivel === "ruim") return "#ef4444";
                    if (nivel === "medio") return "#f59e0b";
                    return "#10b981";
                }),
 
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
 
    var queryEmpresa = obterQueryEmpresa();
 
    const resposta = await fetch(
        `/obras/rodovia/${encodeURIComponent(rodoviaSelecionada)}?${queryEmpresa}`
    );
 
    const dados = await resposta.json();
 
    renderizarTabelaObras(dados);
 
}
 
function renderizarTabelaObras(obras) {
 
    const tbody = document.getElementById("tbodyObras");
 
    tbody.innerHTML = "";
 
    obras.forEach(obra => {
 
        var impacto = Number(obra.impacto_previsto || 0);
        var contexto = obterContextoPorPercentual(impacto);
 
        var statusContexto = "medio";
        var status = (obra.status || "").toLowerCase();
        if (status.includes("final")) statusContexto = "bom";
        if (status.includes("andamento")) statusContexto = "medio";
        if (status.includes("planejada")) statusContexto = "ruim";
 
        tbody.innerHTML += `
            <tr>
                <td>${obra.rodovia}</td>
                <td>${obra.descricao || "-"}</td>
                <td><span class="badge ${statusContexto === "bom" ? "green" : statusContexto === "medio" ? "yellow" : "red"}">${obra.status}</span></td>
                <td>${obra.data_inicio}</td>
                <td>${obra.data_fim || "-"}</td>
                <td class="impacto-cell">
                    <div class="impacto-wrap">
                        <div class="impacto-barra">
                            <span class="impacto-fill ${contexto.classe}" style="width:${Math.min(impacto, 100)}%"></span>
                        </div>
                        <strong>${impacto}%</strong>
                    </div>
                </td>
                <td><span class="indicador-pill ${contexto.classe}">${contexto.label}</span></td>
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
LOGOUT
=========================================================
*/

function logout() {
    if (confirm("Tem certeza que deseja sair?")) {
        sessionStorage.clear();
        window.location.href = "../../index.html";
    }
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

aplicarUsuarioLogadoNaTopbar();
iniciarDashboard();