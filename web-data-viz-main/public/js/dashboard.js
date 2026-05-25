const state = {
  rodoviaAtual: 'Rodovia Anhanguera'
};

// ============================================================
// ELEMENTOS
// ============================================================

const elements = {

  selectRodovia:
    document.getElementById('filterRodovia'),

  tituloRodovia:
    document.getElementById('tituloRodovia'),

  fluxoMedio:
    document.getElementById('fluxoMedio'),

  horarioCritico:
    document.getElementById('horarioCritico'),

  janelaIdeal:
    document.getElementById('janelaIdeal'),

  melhorDia:
    document.getElementById('melhorDia'),

  chartFlow:
    document.getElementById('chartFlow'),

  chartDay:
    document.getElementById('chartDay'),

  chartCongestionamento:
    document.getElementById('chartCongestionamento')

};

// ============================================================
// INSTÂNCIAS CHART
// ============================================================

let chartFlowInstance = null;
let chartDayInstance = null;
let chartCongestionamentoInstance = null;

// ============================================================
// HELPERS
// ============================================================

function formatarNumero(valor) {

  return Number(valor)
    .toLocaleString('pt-BR');

}

function formatarHora(hora) {

  return `${hora}h`;

}

function traduzirDiaSemana(numero) {

  const dias = {
    1: 'Domingo',
    2: 'Segunda',
    3: 'Terça',
    4: 'Quarta',
    5: 'Quinta',
    6: 'Sexta',
    7: 'Sábado'
  };

  return dias[numero] || 'N/A';

}

async function request(endpoint) {

  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(`Erro HTTP: ${response.status}`);
  }

  return response.json();

}

// ============================================================
// EVENTOS
// ============================================================

elements.selectRodovia.addEventListener(
  'change',
  async function () {

    state.rodoviaAtual =
      elements.selectRodovia.value;

    await carregarDashboard();

  }
);

// ============================================================
// INIT
// ============================================================

window.addEventListener(
  'load',
  async function () {

    await carregarDashboard();

  }
);

// ============================================================
// DASHBOARD
// ============================================================

async function carregarDashboard() {

  const rodovia = state.rodoviaAtual;

  elements.tituloRodovia.innerText = rodovia;

  try {

    await Promise.all([

      carregarFluxoMedio(rodovia),

      carregarHorarioCritico(rodovia),

      carregarJanelaIdeal(rodovia),

      carregarMelhorDia(rodovia),

      buildFlowChart(rodovia),

      buildDayChart(rodovia),

      buildCongestionamentoChart(rodovia)

    ]);

  } catch (erro) {

    console.error(
      'Erro ao carregar dashboard:',
      erro
    );

  }

}

// ============================================================
// KPI — FLUXO MÉDIO
// ============================================================

async function carregarFluxoMedio(rodovia) {

  const dados = await request(
    `/dashboard/fluxo-medio?rodovia=${encodeURIComponent(rodovia)}`
  );

  if (!dados.length) return;

  elements.fluxoMedio.innerText =
    formatarNumero(dados[0].fluxo);

}

// ============================================================
// KPI — HORÁRIO CRÍTICO
// ============================================================

async function carregarHorarioCritico(rodovia) {

  const dados = await request(
    `/dashboard/horario-critico?rodovia=${encodeURIComponent(rodovia)}`
  );

  if (!dados.length) return;

  const horas =
    dados.map(item => formatarHora(item.hora));

  elements.horarioCritico.innerText =
    horas.join(' / ');

}

// ============================================================
// KPI — JANELA IDEAL
// ============================================================

async function carregarJanelaIdeal(rodovia) {

  const dados = await request(
    `/dashboard/janela-ideal?rodovia=${encodeURIComponent(rodovia)}`
  );

  if (!dados.length) return;

  const horas =
    dados.map(item => formatarHora(item.hora));

  elements.janelaIdeal.innerText =
    horas.join(' / ');

}

// ============================================================
// KPI — MELHOR DIA
// ============================================================

async function carregarMelhorDia(rodovia) {

  const dados = await request(
    `/dashboard/melhor-dia?rodovia=${encodeURIComponent(rodovia)}`
  );

  if (!dados.length) return;

  elements.melhorDia.innerText =
    traduzirDiaSemana(
      dados[0].dia_semana
    );

}

// ============================================================
// CHART — FLUXO HORÁRIO
// ============================================================

async function buildFlowChart(rodovia) {

  const dados = await request(
    `/dashboard/fluxo-horario?rodovia=${encodeURIComponent(rodovia)}`
  );

  const labels =
    dados.map(item => formatarHora(item.hora));

  const valores =
    dados.map(item => item.volume);

  const ctx =
    elements.chartFlow.getContext('2d');

  const grad =
    ctx.createLinearGradient(0, 0, 0, 320);

  grad.addColorStop(0, 'rgba(37,99,235,0.35)');
  grad.addColorStop(1, 'rgba(37,99,235,0.02)');

  if (chartFlowInstance) {
    chartFlowInstance.destroy();
  }

  chartFlowInstance = new Chart(ctx, {

    type: 'line',

    data: {

      labels,

      datasets: [{

        label: 'Fluxo Médio',

        data: valores,

        borderColor: '#2563eb',

        backgroundColor: grad,

        fill: true,

        tension: 0.4,

        pointRadius: 0,

        pointHoverRadius: 5,

        pointHoverBackgroundColor: '#2563eb',

        borderWidth: 2.5

      }]
    },

    options: {

      responsive: true,

      maintainAspectRatio: false,

      plugins: {

        legend: {
          display: false
        },

        tooltip: {

          backgroundColor: '#0f172a',

          titleColor: '#94a3b8',

          bodyColor: '#fff',

          padding: 10,

          cornerRadius: 8,

          callbacks: {

            label: ctx =>
              ` ${formatarNumero(ctx.parsed.y)} veículos/h`

          }
        }
      },

      scales: {

        x: {

          grid: {
            display: false
          },

          border: {
            display: false
          }
        },

        y: {

          grid: {
            color: '#f1f5f9',
            drawBorder: false
          },

          border: {
            display: false
          },

          ticks: {

            callback: value => {

              if (value >= 1000) {
                return `${(value / 1000).toFixed(1)}k`;
              }

              return value;

            }
          }
        }
      }
    }
  });

}

// ============================================================
// CHART — FLUXO POR DIA
// ============================================================

async function buildDayChart(rodovia) {

  const dados = await request(
    `/dashboard/melhor-dia?rodovia=${encodeURIComponent(rodovia)}`
  );

  const labels =
    dados.map(item =>
      traduzirDiaSemana(item.dia_semana)
    );

  const valores =
    dados.map(item => item.media);

  const menorValor =
    Math.min(...valores);

  const ctx =
    elements.chartDay.getContext('2d');

  if (chartDayInstance) {
    chartDayInstance.destroy();
  }

  chartDayInstance = new Chart(ctx, {

    type: 'bar',

    data: {

      labels,

      datasets: [{

        label: 'Fluxo diário',

        data: valores,

        backgroundColor: valores.map(valor => {

          if (valor === menorValor) {
            return '#2563eb';
          }

          return '#dbeafe';

        }),

        borderRadius: 8,

        borderSkipped: false

      }]
    },

    options: {

      responsive: true,

      maintainAspectRatio: false,

      plugins: {

        legend: {
          display: false
        },

        tooltip: {

          backgroundColor: '#0f172a',

          callbacks: {

            label: ctx =>
              ` ${formatarNumero(ctx.parsed.y)} veículos`

          }
        }
      },

      scales: {

        x: {

          grid: {
            display: false
          },

          border: {
            display: false
          }
        },

        y: {

          grid: {
            color: '#f1f5f9'
          },

          border: {
            display: false
          },

          ticks: {

            callback: value => {

              if (value >= 1000) {
                return `${(value / 1000).toFixed(0)}k`;
              }

              return value;

            }
          }
        }
      }
    }
  });

}

// ============================================================
// CHART — CONGESTIONAMENTO
// ============================================================

async function buildCongestionamentoChart(rodovia) {

  const dados = await request(
    `/dashboard/congestionamento?rodovia=${encodeURIComponent(rodovia)}`
  );

  const labels =
    dados.map(item => formatarHora(item.hora));

  const valores =
    dados.map(item => item.congestionamento);

  const ctx =
    elements.chartCongestionamento.getContext('2d');

  if (chartCongestionamentoInstance) {
    chartCongestionamentoInstance.destroy();
  }

  chartCongestionamentoInstance = new Chart(ctx, {

    type: 'bar',

    data: {

      labels,

      datasets: [{

        label: 'Congestionamento (%)',

        data: valores,

        borderRadius: 8,

        borderSkipped: false,

        backgroundColor: valores.map(valor => {

          if (valor >= 80) {
            return '#dc2626';
          }

          if (valor >= 60) {
            return '#f59e0b';
          }

          return '#16a34a';

        })

      }]
    },

    options: {

      responsive: true,

      maintainAspectRatio: false,

      plugins: {

        legend: {
          display: false
        },

        tooltip: {

          backgroundColor: '#0f172a',

          callbacks: {

            label: ctx =>
              ` ${ctx.parsed.y}%`

          }
        }
      },

      scales: {

        x: {

          grid: {
            display: false
          },

          border: {
            display: false
          }
        },

        y: {

          beginAtZero: true,

          max: 100,

          grid: {
            color: '#f1f5f9'
          },

          border: {
            display: false
          },

          ticks: {

            callback: value => `${value}%`

          }
        }
      }
    }
  });

}

// ============================================================
// AUTO REFRESH
// ============================================================

setInterval(async function () {

  await carregarDashboard();

}, 300000);

