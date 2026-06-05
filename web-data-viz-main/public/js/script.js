let rodoviaSelecionada = "Rodovia Anhanguera";
let obrasCadastradas = [];

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

async function executarSeguro(nome, fn) {

    try {
        await fn();
    } catch (erro) {
        console.error(`[dashboard] ${nome}:`, erro);
    }

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

    if (!dados.length) {
        document.getElementById("kpiPressaoOperacional").innerText = "—";
        return;
    }

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

    var tbody = document.getElementById("tbodyObras");
    if (!tbody) return;

    try {

        var queryEmpresa = "empresaId=1";

        try {
            queryEmpresa = obterQueryEmpresa();
        } catch (sessaoErro) {
            console.warn("[dashboard] sessao sem empresa, usando fallback:", sessaoErro.message);
        }

        const resposta = await fetch(`/obras?${queryEmpresa}`);

        if (!resposta.ok) {
            throw new Error(`Erro ${resposta.status}`);
        }

        var dados = await resposta.json();
        obrasCadastradas = Array.isArray(dados) ? dados : [];

        renderizarTabelaObras(obrasCadastradas);
        atualizarContadorObras(obrasCadastradas.length);
        renderizarMapaObras(obrasCadastradas);

    } catch (erro) {

        console.error(erro);
        obrasCadastradas = [];
        renderizarTabelaObras([]);
        renderizarMapaObras([]);

        var msg = erro.message && erro.message.indexOf("empresa") >= 0
            ? "Faça login para visualizar as obras cadastradas."
            : "Não foi possível carregar as obras cadastradas.";

        atualizarContadorObras(0, msg);

    }

}

function atualizarContadorObras(total, mensagem) {

    var el = document.getElementById("obrasTotalCount");
    if (!el) return;

    if (mensagem) {
        el.textContent = mensagem;
        return;
    }

    el.textContent = total + " obra" + (total !== 1 ? "s" : "") + " cadastrada" + (total !== 1 ? "s" : "") + " · todas exibidas abaixo";

}
 
function renderizarTabelaObras(obras) {

    const tbody = document.getElementById("tbodyObras");

    if (!tbody) return;

    tbody.innerHTML = "";

    if (!obras.length) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:32px;">Nenhuma obra cadastrada.</td></tr>';
        return;
    }

    obras.forEach(obra => {
 
        var impacto = Number(obra.impacto_previsto || 0);
        var contexto = obterContextoPorPercentual(impacto);
 
        var statusContexto = "medio";
        var status = (obra.status || "").toLowerCase();
        if (status.includes("final")) statusContexto = "bom";
        if (status.includes("andamento")) statusContexto = "medio";
        if (status.includes("planejada")) statusContexto = "ruim";
 
        tbody.innerHTML += `
            <tr data-obra-id="${obra.id}">
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
MAPA DE OBRAS
=========================================================
*/

var mapaObras = null;
var camadaMarcadoresObras = null;

var RODOVIA_COORDS = {
    "Rodoanel": [-23.450, -46.732],
    "Rodovia Adhemar Pereira de Barros": [-22.728, -47.649],
    "Rodovia Anhanguera": [-23.468, -46.801],
    "Rodovia Ayrton Senna": [-23.425, -46.512],
    "Rodovia Castello Branco": [-23.522, -46.875],
    "Rodovia Dom Pedro I": [-23.348, -46.718],
    "Rodovia dos Bandeirantes": [-23.428, -46.708],
    "Rodovia Marechal Rondon": [-23.558, -46.928],
    "Rodovia Presidente Dutra": [-23.528, -46.615],
    "Rodovia Raposo Tavares": [-23.568, -46.788],
    "Rodovia Santos Dumont": [-23.415, -46.752],
    "Rodovia Washington Luís": [-22.985, -47.142],
    "Sistema Anchieta-Imigrantes": [-23.782, -46.365]
};

function normalizarImpactoObra(valor) {
    var n = Number(valor || 0);
    if (n <= 10) return n * 10;
    return Math.min(n, 100);
}

function obterCorMarcadorObra(obra) {
    var status = (obra.status || "").toLowerCase();
    var impacto = normalizarImpactoObra(obra.impacto_previsto);

    if (status.includes("crit") || impacto >= 70) return "red";
    if (status.includes("andamento") || impacto >= 40) return "yellow";
    if (status.includes("final")) return "green";
    return impacto >= 40 ? "yellow" : "green";
}

function obterCoordenadasObra(obra) {
    if (obra.latitude != null && obra.longitude != null) {
        return [Number(obra.latitude), Number(obra.longitude)];
    }

    var base = RODOVIA_COORDS[obra.rodovia] || [-23.5505, -46.6333];
    var seed = Number(obra.id) || 1;
    var angulo = (seed * 137.508) * Math.PI / 180;
    var raio = 0.012 + (seed % 5) * 0.004;

    return [
        base[0] + Math.cos(angulo) * raio,
        base[1] + Math.sin(angulo) * raio
    ];
}

function formatarDataObra(data) {
    if (!data) return "—";
    var partes = String(data).split("-");
    if (partes.length === 3) return partes[2] + "/" + partes[1] + "/" + partes[0];
    return data;
}

function escaparHtml(texto) {
    return String(texto == null ? "" : texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function montarTooltipObra(obra) {
    var impacto = normalizarImpactoObra(obra.impacto_previsto);
    var cor = obterCorMarcadorObra(obra);

    return (
        '<div class="obra-tooltip">' +
            '<table class="obra-tooltip-table">' +
                "<tr><th>Rodovia</th><td>" + escaparHtml(obra.rodovia || "—") + "</td></tr>" +
                "<tr><th>Descrição</th><td>" + escaparHtml(obra.descricao || "—") + "</td></tr>" +
                "<tr><th>Status</th><td><span class=\"obra-tooltip-badge badge-" + cor + "\">" + escaparHtml(obra.status || "—") + "</span></td></tr>" +
                "<tr><th>Início</th><td>" + escaparHtml(formatarDataObra(obra.data_inicio)) + "</td></tr>" +
                "<tr><th>Fim</th><td>" + escaparHtml(formatarDataObra(obra.data_fim)) + "</td></tr>" +
                "<tr><th>Impacto</th><td><strong>" + impacto + "%</strong></td></tr>" +
            "</table>" +
        "</div>"
    );
}

function montarPopupObra(obra) {
    return montarTooltipObra(obra);
}

function criarIconeMarcadorObra(cor) {
    var cores = { green: "#10b981", yellow: "#f59e0b", red: "#ef4444" };
    var hex = cores[cor] || "#3b82f6";

    return L.divIcon({
        className: "nr-obra-marker",
        html:
            '<div style="' +
                "width:30px;height:30px;background:" + hex + ";" +
                "border-radius:50% 50% 50% 0;transform:rotate(-45deg);" +
                "display:flex;align-items:center;justify-content:center;" +
                "box-shadow:0 3px 10px rgba(0,0,0,0.25);border:2px solid rgba(255,255,255,0.85);" +
            '">' +
                '<i class="fa-solid fa-helmet-safety" style="transform:rotate(45deg);font-size:11px;color:#fff;"></i>' +
            "</div>",
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -32]
    });
}

function destacarLinhaObra(id) {
    document.querySelectorAll("#tbodyObras tr[data-obra-id]").forEach(function (row) {
        row.classList.remove("obra-row-highlight");
    });

    var linha = document.querySelector('#tbodyObras tr[data-obra-id="' + id + '"]');
    if (!linha) return;

    linha.classList.add("obra-row-highlight");
    linha.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function initMapaObras() {
    var mapEl = document.getElementById("map");
    if (!mapEl || typeof L === "undefined") return;

    if (mapaObras) {
        mapaObras.invalidateSize();
        return;
    }

    mapaObras = L.map("map", {
        center: [-23.5505, -46.6333],
        zoom: 10,
        zoomControl: true,
        attributionControl: false
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap &copy; CARTO"
    }).addTo(mapaObras);

    camadaMarcadoresObras = L.layerGroup().addTo(mapaObras);

    window.addEventListener("resize", function () {
        if (mapaObras) mapaObras.invalidateSize();
    });

    setTimeout(function () {
        if (mapaObras) mapaObras.invalidateSize();
    }, 300);
}

function renderizarMapaObras(obras) {
    initMapaObras();

    var contador = document.getElementById("mapObrasCount");
    if (contador) {
        contador.textContent = obras.length
            ? obras.length + " obra" + (obras.length !== 1 ? "s" : "") + " no mapa · clique no marcador para detalhes"
            : "Nenhuma obra cadastrada para exibir no mapa";
    }

    if (!camadaMarcadoresObras) return;

    camadaMarcadoresObras.clearLayers();

    if (!obras.length) return;

    var bounds = [];

    obras.forEach(function (obra) {
        var coords = obterCoordenadasObra(obra);
        var cor = obterCorMarcadorObra(obra);
        var marker = L.marker(coords, { icon: criarIconeMarcadorObra(cor) }).addTo(camadaMarcadoresObras);

        marker.bindPopup(montarPopupObra(obra), {
            maxWidth: 340,
            minWidth: 280,
            className: "nr-popup",
            autoPan: true,
            autoPanPadding: [48, 48],
            closeButton: true
        });

        marker.on("click", function () {
            destacarLinhaObra(obra.id);
        });

        bounds.push(coords);
    });

    if (bounds.length === 1) {
        mapaObras.setView(bounds[0], 11);
    } else if (bounds.length > 1) {
        mapaObras.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
    }

    setTimeout(function () {
        if (mapaObras) mapaObras.invalidateSize();
    }, 200);
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

    initMapaObras();

    await executarSeguro("fluxoMedio", carregarFluxoMedio);
    await executarSeguro("horarioCritico", carregarHorarioCritico);
    await executarSeguro("janelaIdeal", carregarJanelaIdeal);
    await executarSeguro("melhorDia", carregarMelhorDia);
    await executarSeguro("pressaoOperacional", carregarPressaoOperacional);
    await executarSeguro("perfilRodovia", carregarPerfilRodovia);
    await executarSeguro("fluxoHorario", carregarFluxoHorario);
    await executarSeguro("volumeDiaSemana", carregarVolumeDiaSemana);

    await carregarObras();

}

aplicarUsuarioLogadoNaTopbar();
iniciarDashboard();