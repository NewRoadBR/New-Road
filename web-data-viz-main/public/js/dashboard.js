const state = {
  rodoviaAtual: 'Rodovia Anhanguera',
  isUpdating: false
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
  pressaoOperacional:
    document.getElementById('pressaoOperacional'),

  perfilLeves:
    document.getElementById('perfilLeves'),

  perfilPesados:
    document.getElementById('perfilPesados'),

  perfilMotos:
    document.getElementById('perfilMotos'),

  perfilEspeciais:
    document.getElementById('perfilEspeciais')

};

// ============================================================
// INSTÂNCIAS CHART
// ============================================================

let chartFlowInstance = null;
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

  const response =
    await fetch(endpoint);

  if (!response.ok) {

    throw new Error(
      `Erro HTTP: ${response.status}`
    );

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
// BOTÃO ATUALIZAR
// ============================================================

const btnAtualizar =
  document.getElementById('btnAtualizar');

if (btnAtualizar) {

  btnAtualizar.addEventListener(
    'click',
    async function () {

      await carregarDashboard();

    }
  );

}

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

  // Evita múltiplas atualizações simultâneas
  if (state.isUpdating) {
    console.warn('Dashboard já está atualizando...');
    return;
  }

  state.isUpdating = true;

  const rodovia =
    state.rodoviaAtual;

  elements.tituloRodovia.innerText =
    rodovia;

  try {

    await Promise.all([

      carregarFluxoMedio(rodovia),

      carregarHorarioCritico(rodovia),

      carregarJanelaIdeal(rodovia),

      carregarMelhorDia(rodovia),

      // carregarImpactoOperacional removido

      carregarPressaoOperacional(rodovia),

      carregarPerfilRodovia(rodovia),

      buildFlowChart(rodovia),

      // buildImpactoChart removido

      buildCongestionamentoChart(rodovia)

    ]);

  } catch (erro) {

    console.error(
      'Erro ao carregar dashboard:',
      erro
    );

  } finally {

    state.isUpdating = false;

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

  elements.horarioCritico.innerText =
    dados[0].periodo || formatarHora(dados[0].hora);

}

// ============================================================
// KPI — JANELA IDEAL
// ============================================================

async function carregarJanelaIdeal(rodovia) {

  const dados = await request(
    `/dashboard/janela-ideal?rodovia=${encodeURIComponent(rodovia)}`
  );

  if (!dados.length) return;

  elements.janelaIdeal.innerText =
    dados[0].periodo || formatarHora(dados[0].hora);

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
// KPI — IMPACTO OPERACIONAL
// ============================================================

// ImpactoOperacional removed
// ============================================================
// KPI — PRESSÃO OPERACIONAL
// ============================================================

async function carregarPressaoOperacional(rodovia) {

  const dados = await request(
    `/dashboard/pressao-operacional?rodovia=${encodeURIComponent(rodovia)}`
  );

  if (!dados.length) return;

  const pressaoMedia =
    dados.reduce(
      (sum, item) => sum + Number(item.pressao_operacional),
      0
    ) / dados.length;

  elements.pressaoOperacional.innerText =
    `${pressaoMedia.toFixed(2)}%`;

}

// ============================================================
// KPI — PERFIL DA RODOVIA
// ============================================================

async function carregarPerfilRodovia(rodovia) {

  const dados = await request(
    `/dashboard/perfil-rodovia?rodovia=${encodeURIComponent(rodovia)}`
  );

  if (!dados.length) return;

  elements.perfilLeves.innerText =
    formatarNumero(dados[0].media_leves);

  elements.perfilPesados.innerText =
    formatarNumero(dados[0].media_pesados);

  elements.perfilMotos.innerText =
    formatarNumero(dados[0].media_motos);

  elements.perfilEspeciais.innerText =
    formatarNumero(dados[0].media_especiais);

}

// ============================================================
// CHART — FLUXO HORÁRIO
// ============================================================

async function buildFlowChart(rodovia) {

  const dados = await request(
    `/dashboard/fluxo-horario?rodovia=${encodeURIComponent(rodovia)}`
  );

  const labels =
    dados.map(item =>
      formatarHora(item.hora)
    );

  const valores =
    dados.map(item =>
      Number(item.volume)
    );

  const canvas =
    document.getElementById(
      'chartFluxoHorario'
    );

  if (!canvas) {

    console.error(
      'Canvas chartFluxoHorario não encontrado'
    );

    return;

  }

  // DESTROI INSTÂNCIA ANTERIOR
  if (chartFlowInstance) {

    chartFlowInstance.destroy();

    chartFlowInstance = null;

  }

  const ctx =
    canvas.getContext('2d');

  // Reseta as dimensões do canvas
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  // LIMPA CANVAS
  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  const grad =
    ctx.createLinearGradient(
      0,
      0,
      0,
      320
    );

  grad.addColorStop(
    0,
    'rgba(37,99,235,0.35)'
  );

  grad.addColorStop(
    1,
    'rgba(37,99,235,0.02)'
  );

  chartFlowInstance =
    new Chart(ctx, {

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

          pointHoverBackgroundColor:
            '#2563eb',

          borderWidth: 2.5

        }]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        animation: false,

        plugins: {

          legend: {

            display: false

          },

          tooltip: {

            backgroundColor:
              '#0f172a',

            titleColor:
              '#94a3b8',

            bodyColor:
              '#fff',

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
// CHART — IMPACTO OPERACIONAL
// ============================================================

async function buildImpactoChart(rodovia) {
  // buildImpactoChart removido
}

// ============================================================
// CHART — CONGESTIONAMENTO
// ============================================================

async function buildCongestionamentoChart(
  rodovia
) {

  const dados = await request(
    `/dashboard/congestionamento?rodovia=${encodeURIComponent(rodovia)}`
  );

  const labels =
    dados.map(item =>
      formatarHora(item.hora)
    );

  const valores =
    dados.map(item =>
      Number(item.congestionamento)
    );

  const canvas =
    document.getElementById(
      'chartCongestionamento'
    );

  if (!canvas) {

    console.error(
      'Canvas chartCongestionamento não encontrado'
    );

    return;

  }

  // DESTROI INSTÂNCIA ANTERIOR
  if (chartCongestionamentoInstance) {

    chartCongestionamentoInstance.destroy();

    chartCongestionamentoInstance = null;

  }

  const ctx =
    canvas.getContext('2d');

  // Reseta as dimensões do canvas
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  // LIMPA CANVAS
  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  chartCongestionamentoInstance =
    new Chart(ctx, {

      type: 'bar',

      data: {

        labels,

        datasets: [{

          label: 'Congestionamento (%)',

          data: valores,

          borderRadius: 8,

          borderSkipped: false,

          backgroundColor:
            valores.map(valor => {

              if (valor >= 80) {

                return '#ef4444';

              }

              if (valor >= 60) {

                return '#f59e0b';

              }

              return '#10b981';

            })

        }]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        animation: false,

        plugins: {

          legend: {

            display: false

          },

          tooltip: {

            backgroundColor:
              '#0f172a',

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

              callback: value =>
                `${value}%`

            }

          }

        }

      }

    });

}

// ============================================================
// AUTO REFRESH
// ============================================================

// Atualiza a cada 5 minutos

setInterval(
  async function () {

    try {

      await carregarDashboard();

    } catch (erro) {

      console.error(
        'Erro no auto refresh:',
        erro
      );

    }

  },
  300000
);

