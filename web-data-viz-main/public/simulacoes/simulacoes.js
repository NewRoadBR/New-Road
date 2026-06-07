var graficoSimImpacto = null;

var PERIODOS_SIM = [
  { id: "madrugada", label: "Madrugada (00h–05h)", horas: [0, 1, 2, 3, 4, 5] },
  { id: "manha", label: "Manhã (06h–10h)", horas: [6, 7, 8, 9, 10] },
  { id: "almoco", label: "Almoço (11h–14h)", horas: [11, 12, 13, 14] },
  { id: "tarde", label: "Tarde (15h–18h)", horas: [15, 16, 17, 18] },
  { id: "noite", label: "Noite (19h–23h)", horas: [19, 20, 21, 22, 23] }
];

var userBoxTopo = document.getElementById("userBoxTopo");
var avatarTopo = document.getElementById("avatarTopo");
var nomeUsuarioTopo = document.getElementById("nomeUsuarioTopo");
var perfilUsuarioTopo = document.getElementById("perfilUsuarioTopo");
var seloSessaoAtiva = document.getElementById("seloSessaoAtiva");

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
    perfilUsuarioTopo.textContent = "Operações";
    perfilUsuarioTopo.removeAttribute("title");
    seloSessaoAtiva.hidden = true;
    return;
  }

  userBoxTopo.classList.add("user-box-logado");
  avatarTopo.textContent = (avatar || criarIniciais(nome || email)).slice(0, 2).toUpperCase();
  nomeUsuarioTopo.textContent = nome || "Usuário logado";
  perfilUsuarioTopo.textContent = perfil || "Equipe NewRoad";
  perfilUsuarioTopo.title = email;
  seloSessaoAtiva.hidden = false;
}

function obterContextoPorPercentual(valor) {
  if (valor >= 70) return { classe: "ruim", label: "Alto impacto" };
  if (valor >= 40) return { classe: "medio", label: "Impacto moderado" };
  return { classe: "bom", label: "Baixo impacto" };
}

function aplicarContextoCard(cardId, contexto) {
  var card = document.getElementById(cardId);
  if (!card) return;

  card.classList.remove("kpi-bom", "kpi-medio", "kpi-ruim", "sim-kpi-idle");
  card.classList.add("kpi-" + contexto.classe);

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

function limparContextoCards() {
  ["cardSimImpacto", "cardSimJanela", "cardSimRecomendacao"].forEach(function (id) {
    var card = document.getElementById(id);
    if (!card) return;
    card.classList.remove("kpi-bom", "kpi-medio", "kpi-ruim");
    card.classList.add("sim-kpi-idle");
    var contextoEl = card.querySelector(".kpi-contexto");
    if (contextoEl) contextoEl.remove();
  });
}

function obterEstiloChart() {
  var s = getComputedStyle(document.documentElement);
  return {
    grid: s.getPropertyValue("--chart-grid").trim() || "rgba(148,163,184,0.15)",
    text: s.getPropertyValue("--chart-text").trim() || "#94a3b8"
  };
}

function corPorImpacto(impacto) {
  if (impacto >= 70) return "#ef4444";
  if (impacto >= 40) return "#f59e0b";
  return "#10b981";
}

function definirStatusSim(mensagem, tipo, icone) {
  var el = document.getElementById("simStatus");
  if (!el) return;

  var iconClass = icone || (tipo === "ok" ? "fa-circle-check" : tipo === "erro" ? "fa-circle-xmark" : tipo === "aviso" ? "fa-triangle-exclamation" : "fa-circle-info");

  el.innerHTML = '<i class="fa-solid ' + iconClass + '"></i><span>' + mensagem + "</span>";
  el.classList.remove("ok", "erro", "aviso");
  if (tipo) el.classList.add(tipo);
}

function formularioCompleto() {
  var rodovia = document.getElementById("simRodovia").value;
  var tipo = document.getElementById("simTipo").value;
  var periodo = document.getElementById("simPeriodo").value;
  var duracao = Number(document.getElementById("simDuracao").value);

  return Boolean(rodovia && tipo && periodo && duracao >= 1);
}

function atualizarEstadoBotao() {
  var btn = document.getElementById("btnExecutarSimulacao");
  if (btn) btn.disabled = !formularioCompleto();
}

function mediaHoras(volumesPorHora, horas) {
  var total = 0;
  var count = 0;

  horas.forEach(function (hora) {
    if (volumesPorHora[hora] != null) {
      total += Number(volumesPorHora[hora]);
      count += 1;
    }
  });

  return count ? total / count : 0;
}

function calcularCenarios(dadosHorarios, multiplicador) {
  var volumesPorHora = {};
  var maxVol = 0;

  dadosHorarios.forEach(function (item) {
    var vol = Number(item.volume) || 0;
    volumesPorHora[Number(item.hora)] = vol;
    if (vol > maxVol) maxVol = vol;
  });

  if (!maxVol) maxVol = 1;

  return PERIODOS_SIM.map(function (periodo) {
    var media = mediaHoras(volumesPorHora, periodo.horas);
    var impactoBase = Math.round((media / maxVol) * 100);
    var impacto = Math.min(Math.round(impactoBase * multiplicador), 100);
    return {
      id: periodo.id,
      cenario: periodo.label,
      impacto: impacto,
      volumeMedio: Math.round(media),
      cor: corPorImpacto(impacto),
      recomendado: false
    };
  });
}

function marcarRecomendado(cenarios) {
  var melhor = cenarios.reduce(function (acc, item) {
    return item.impacto < acc.impacto ? item : acc;
  }, cenarios[0]);

  cenarios.forEach(function (item) {
    item.recomendado = item.id === melhor.id;
  });

  return melhor;
}

function badgeHtml(texto, tipo) {
  return '<span class="badge ' + tipo + '">' + texto + "</span>";
}

function renderizarTabelaVazia() {
  var tbody = document.getElementById("tbodySimPeriodos");
  var countEl = document.getElementById("simPeriodosCount");
  if (!tbody) return;

  tbody.innerHTML =
    '<tr class="sim-table-empty">' +
      '<td colspan="4">' +
        '<i class="fa-solid fa-table-list"></i>' +
        "Preencha os parâmetros e execute a simulação para ver o detalhamento" +
      "</td>" +
    "</tr>";

  if (countEl) countEl.textContent = "Nenhum cenário calculado ainda";
}

function renderizarTabelaPeriodos(cenarios) {
  var tbody = document.getElementById("tbodySimPeriodos");
  var countEl = document.getElementById("simPeriodosCount");
  if (!tbody) return;

  tbody.innerHTML = cenarios.map(function (item) {
    var ctx = obterContextoPorPercentual(item.impacto);
    var badge = item.recomendado
      ? badgeHtml("Recomendado", "green")
      : badgeHtml(ctx.label, ctx.classe === "ruim" ? "red" : ctx.classe === "medio" ? "yellow" : "green");

    return (
      "<tr>" +
        "<td>" + (item.recomendado ? "★ " : "") + item.cenario + "</td>" +
        "<td><strong>" + item.impacto + "%</strong></td>" +
        "<td>" + item.volumeMedio.toLocaleString("pt-BR") + " veíc/h</td>" +
        "<td>" + badge + "</td>" +
      "</tr>"
    );
  }).join("");

  if (countEl) {
    countEl.textContent = cenarios.length + " cenários analisados para a rodovia selecionada";
  }
}

function limparResultados() {
  var results = document.getElementById("simResults");
  if (results) results.classList.add("sim-results--empty");

  document.getElementById("simImpactoValor").textContent = "—";
  document.getElementById("simJanelaValor").textContent = "—";
  document.getElementById("simRecomendacaoValor").textContent = "—";
  document.getElementById("simRecomendacaoDetalhe").textContent = "Aguardando simulação";

  limparContextoCards();
  renderizarTabelaVazia();

  var canvas = document.getElementById("graficoSimImpacto");
  if (canvas) canvas.hidden = true;

  if (graficoSimImpacto) {
    graficoSimImpacto.destroy();
    graficoSimImpacto = null;
  }

  definirStatusSim(
    "Preencha todos os parâmetros abaixo e clique em <strong>Executar simulação</strong>.",
    null
  );
}

function limparFormulario() {
  document.getElementById("simRodovia").selectedIndex = 0;
  document.getElementById("simTipo").selectedIndex = 0;
  document.getElementById("simPeriodo").selectedIndex = 0;
  document.getElementById("simDuracao").value = "";
  limparResultados();
  atualizarEstadoBotao();
}

function atualizarGraficoSim(cenarios) {
  var canvas = document.getElementById("graficoSimImpacto");
  if (!canvas || typeof Chart === "undefined") return;

  canvas.hidden = false;
  var ctx = canvas.getContext("2d");
  var estilo = obterEstiloChart();

  if (graficoSimImpacto) graficoSimImpacto.destroy();

  graficoSimImpacto = new Chart(ctx, {
    type: "bar",
    data: {
      labels: cenarios.map(function (i) { return i.cenario; }),
      datasets: [{
        label: "Impacto (%)",
        data: cenarios.map(function (i) { return i.impacto; }),
        backgroundColor: cenarios.map(function (i) {
          return i.recomendado ? "#10b981" : i.cor + "CC";
        }),
        borderRadius: 6,
        borderSkipped: false,
        borderWidth: cenarios.map(function (i) { return i.recomendado ? 2 : 0; }),
        borderColor: cenarios.map(function (i) { return i.recomendado ? "#059669" : "transparent"; })
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#0f172a",
          callbacks: {
            label: function (ctx) {
              return " " + ctx.parsed.x + "% de impacto ao tráfego";
            }
          }
        }
      },
      scales: {
        x: {
          max: 100,
          grid: { color: estilo.grid },
          border: { display: false },
          ticks: { color: estilo.text, callback: function (v) { return v + "%"; } }
        },
        y: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: estilo.text }
        }
      }
    }
  });
}

async function executarSimulacao() {
  if (!formularioCompleto()) {
    definirStatusSim("Selecione rodovia, tipo, período e duração antes de simular.", "aviso");
    return;
  }

  var rodovia = document.getElementById("simRodovia").value;
  var periodoId = document.getElementById("simPeriodo").value;
  var multiplicador = Number(document.getElementById("simTipo").value) || 1;
  var duracao = Number(document.getElementById("simDuracao").value);

  var btn = document.getElementById("btnExecutarSimulacao");
  if (btn) btn.disabled = true;

  definirStatusSim("Executando simulação para <strong>" + rodovia + "</strong>…", null, "fa-spinner fa-spin");

  try {
    var resFluxo = await fetch("/dashboard/fluxo-horario/" + encodeURIComponent(rodovia));
    var resJanela = await fetch("/dashboard/janela-ideal/" + encodeURIComponent(rodovia));
    var resMelhorDia = await fetch("/dashboard/melhor-dia/" + encodeURIComponent(rodovia));

    if (!resFluxo.ok) throw new Error("Não foi possível carregar o fluxo horário");

    var dadosHorarios = await resFluxo.json();
    var janela = resJanela.ok ? await resJanela.json() : [];
    var melhorDia = resMelhorDia.ok ? await resMelhorDia.json() : [];

    if (!Array.isArray(dadosHorarios) || !dadosHorarios.length) {
      throw new Error("Sem dados históricos para esta rodovia");
    }

    var results = document.getElementById("simResults");
    if (results) results.classList.remove("sim-results--empty");

    var cenarios = calcularCenarios(dadosHorarios, multiplicador);
    var melhor = marcarRecomendado(cenarios);
    var selecionado = cenarios.find(function (c) { return c.id === periodoId; }) || melhor;

    document.getElementById("simImpactoValor").textContent = selecionado.impacto + "%";
    aplicarContextoCard("cardSimImpacto", obterContextoPorPercentual(selecionado.impacto));

    var janelaTexto = janela.length ? janela[0].periodo : melhor.cenario.replace(/\(.+\)/, "").trim();
    document.getElementById("simJanelaValor").textContent = janelaTexto;
    aplicarContextoCard("cardSimJanela", { classe: "bom", label: "Menor volume" });

    var dias = { 1: "Domingo", 2: "Segunda", 3: "Terça", 4: "Quarta", 5: "Quinta", 6: "Sexta", 7: "Sábado" };
    var diaTexto = melhorDia.length ? dias[melhorDia[0].dia_semana] || "—" : "—";

    var recomendacaoEl = document.getElementById("simRecomendacaoValor");
    var detalheEl = document.getElementById("simRecomendacaoDetalhe");

    if (selecionado.recomendado) {
      recomendacaoEl.textContent = "Período adequado";
      detalheEl.textContent = "Melhor dia: " + diaTexto + " · duração " + duracao + "h";
      aplicarContextoCard("cardSimRecomendacao", { classe: "bom", label: "Aprovado" });
    } else {
      recomendacaoEl.textContent = "Trocar para " + melhor.cenario.split(" (")[0];
      detalheEl.textContent = "Impacto cai de " + selecionado.impacto + "% para " + melhor.impacto + "% · " + diaTexto;
      aplicarContextoCard("cardSimRecomendacao", obterContextoPorPercentual(selecionado.impacto));
    }

    renderizarTabelaPeriodos(cenarios);
    atualizarGraficoSim(cenarios);

    definirStatusSim(
      "Simulação concluída · <strong>" + rodovia + "</strong> · impacto simulado <strong>" + selecionado.impacto + "%</strong> no período selecionado.",
      "ok"
    );
  } catch (erro) {
    definirStatusSim(erro.message || "Erro ao executar simulação.", "erro");
  } finally {
    atualizarEstadoBotao();
  }
}

document.addEventListener("DOMContentLoaded", function () {
  aplicarUsuarioLogadoNaTopbar();

  var btn = document.getElementById("btnExecutarSimulacao");
  var btnLimpar = document.getElementById("btnLimparSimulacao");
  var campos = ["simRodovia", "simTipo", "simPeriodo", "simDuracao"];

  if (btn) btn.addEventListener("click", executarSimulacao);
  if (btnLimpar) btnLimpar.addEventListener("click", limparFormulario);

  campos.forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", atualizarEstadoBotao);
    el.addEventListener("change", atualizarEstadoBotao);
  });

  document.addEventListener("nr-theme-change", function () {
    if (graficoSimImpacto) graficoSimImpacto.update();
  });

  limparResultados();
  atualizarEstadoBotao();
});
