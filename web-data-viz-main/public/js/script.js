/* ═══════════════════════════════════════════
   NEWROAD — Dashboard JS
   Data, Charts, Map, Interactions
═══════════════════════════════════════════ */

// ── MOCK DATA ──────────────────────────────────────────────


const MOCK_DATA = {
  kpis: {
    flow: 4872,
    peak: "07h–09h / 17h–19h",
    window: "01h–05h",
    congestion: "Zona Leste"
  },

  hourlyFlow: {
    todayLabels: ["00h","01h","02h","03h","04h","05h","06h","07h","08h","09h","10h","11h","12h","13h","14h","15h","16h","17h","18h","19h","20h","21h","22h","23h"],
    today: [980,640,430,310,280,520,1850,4200,5100,4600,3800,3500,3900,3700,3600,3800,4300,5200,5400,4100,2900,2100,1600,1200],

    weekLabels: ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"],
    week: [52400,49800,51200,50600,58100,36200,27400],

    monthLabels: ["01/07","02/07","03/07","04/07","05/07","06/07","07/07","08/07","09/07","10/07","11/07","12/07","13/07","14/07","15/07","16/07","17/07","18/07","19/07","20/07","21/07","22/07","23/07","24/07","25/07","26/07","27/07","28/07","29/07","30/07"],
    month: [48200,46800,50100,47500,53400,35600,26800,49300,48700,51200,52600,50900,55800,37200,28100,47900,49600,51800,50200,54700,36900,27600,48500,50300,52100,49800,56200,38400,29100,47300]
  },

  dailyFlow: {
    labels: ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"],
    values: [52000,49800,51400,50200,57800,38400,28200]
  },

  congestionDistrib: [2, 1, 3],

  obras: [
    { id:1, local:"Av. Paulista, 1578",  bairro:"Bela Vista",    tipo:"Recapeamento",       dataInicio:"2025-07-10", duracao:"18 dias", impacto:72, status:"ongoing",   lat:-23.5631, lng:-46.6542, marcador:"red"    },
    { id:2, local:"R. da Consolação",    bairro:"Consolação",    tipo:"Galeria de drenagem",dataInicio:"2025-07-22", duracao:"30 dias", impacto:88, status:"planned",   lat:-23.5569, lng:-46.6580, marcador:"red"    },
    { id:3, local:"Av. Ipiranga, 200",   bairro:"República",     tipo:"Sinalização viária", dataInicio:"2025-07-05", duracao:"5 dias",  impacto:28, status:"completed", lat:-23.5445, lng:-46.6394, marcador:"green"  },
    { id:4, local:"Viaduto do Chá",      bairro:"Centro",        tipo:"Estrutural",         dataInicio:"2025-08-01", duracao:"45 dias", impacto:91, status:"planned",   lat:-23.5461, lng:-46.6370, marcador:"red"    },
    { id:5, local:"Av. Rebouças, 3200",  bairro:"Pinheiros",     tipo:"Pavimentação",       dataInicio:"2025-07-15", duracao:"12 dias", impacto:48, status:"ongoing",   lat:-23.5598, lng:-46.6733, marcador:"yellow" },
    { id:6, local:"Av. Brigadeiro Faria Lima", bairro:"Pinheiros", tipo:"Rede elétrica",    dataInicio:"2025-07-20", duracao:"8 dias",  impacto:55, status:"planned",   lat:-23.5680, lng:-46.6932, marcador:"yellow" },
    { id:7, local:"Rua Augusta, 800",    bairro:"Cerqueira César", tipo:"Calçada acessível",dataInicio:"2025-07-08", duracao:"6 dias",  impacto:18, status:"completed", lat:-23.5554, lng:-46.6588, marcador:"green"  },
    { id:8, local:"Av. 9 de Julho",      bairro:"Jardins",       tipo:"Canalização",        dataInicio:"2025-08-10", duracao:"22 dias", impacto:62, status:"planned",   lat:-23.5635, lng:-46.6653, marcador:"yellow" },
    { id:9, local:"Av. Radial Leste",    bairro:"Brás",          tipo:"Recapeamento",       dataInicio:"2025-07-12", duracao:"20 dias", impacto:45, status:"ongoing",   lat:-23.5420, lng:-46.6080, marcador:"yellow" },
    { id:10,local:"Tnel. Jânio Quadros", bairro:"Barra Funda",   tipo:"Inspeção estrutural",dataInicio:"2025-07-30", duracao:"3 dias",  impacto:80, status:"planned",   lat:-23.5243, lng:-46.6575, marcador:"red"    },
  ],

  notifications: [
    { id:1, color:"#ef4444", icon:"fa-triangle-exclamation", title:"Cadastro de obra realizado", desc:"A obra 'Viaduto do Chá' foi cadastrada com sucesso no sistema.", time:"Há 5 min"   },
    { id:2, color:"#f59e0b", icon:"fa-chart-bar", title:"Pico detectado — Av. Paulista",  desc:"Volume 18% acima da média histórica para esta hora. Verifique câmeras.",               time:"Há 23 min"  },
    { id:3, color:"#3b82f6", icon:"fa-file-chart-column", title:"Atualização de perfil concluída",    desc:"Seus dados cadastrais foram atualizados com sucesso.",                time:"Há 2 horas" },
    { id:4, color:"#ef4444",  icon:"fa-triangle-exclamation", title:"Alteração em obra existente",    desc:"Modificações relevantes foram realizadas na obra 'Av. Paulista'. Recomenda-se auditoria das alterações.",                time:"Há 25 minutos" },

  ]
};

const REGIOES = [
  { nome: 'Zona Leste', nivel: 'Crítico' },
  { nome: 'Zona Sul', nivel: 'Atenção' },
  { nome: 'Zona Norte', nivel: 'Estável' },
  { nome: 'Zona Oeste', nivel: 'Crítico' },
  { nome: 'Centro', nivel: 'Estável' }
];



// Current chart filter
let currentFilter = 'today';
let activeMarker = null;
let filteredObras = [...MOCK_DATA.obras];
let currentCriticalityFilter = null;
// Charts refs
let chartFlow, chartDay, chartDonut;

// ── INIT ───────────────────────────────────────────────────


document.addEventListener('DOMContentLoaded', () => {
  renderDashboardPage(document.getElementById('mainContent'));
  initNotifications();
  initInteractions();
});

function initTimestamp() {
  const update = () => {
    const now = new Date();
    const diaSemana = now.toLocaleDateString('pt-BR', { weekday: 'long' });
    const diaSemanaFormatado = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
    const data = now.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric' });
    const hora = now.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
    document.getElementById('lastUpdate').textContent = `${diaSemanaFormatado} · ${data} · ${hora}`;
  };
  update();
  setInterval(update, 1000);
}

// ── KPIs ───────────────────────────────────────────────────

function initKPIs() {
  // Impacto estimado de intervenção — baseado na hora atual vs dados históricos
  const hourly = MOCK_DATA.hourlyFlow.today;
  const now = new Date();
  const currentHour = now.getHours();

  // Janelas de pico (07–09 e 17–19) representam 82% do impacto
  const peakHours = [7,8,17,18];
  const isCurrentlyPeak = peakHours.includes(currentHour);

  // Calcular percentual da hora atual em relação ao pico máximo
  const currentVolume = hourly[currentHour];
  const peakMax = Math.max(...hourly);
  const offPeakAvg = Math.round((hourly[1] + hourly[2] + hourly[3]) / 3);

  // Determinar nível de impacto com base na hora atual
  let impactLabel, impactColor, impactIcon;
  if (currentVolume >= peakMax * 0.75 || isCurrentlyPeak) {
    impactLabel = 'Alto';
    impactColor = '#ef4444';
    impactIcon = 'fa-circle-exclamation';
  } else if (currentVolume >= offPeakAvg * 2.5) {
    impactLabel = 'Médio';
    impactColor = '#f59e0b';
    impactIcon = 'fa-triangle-exclamation';
  } else {
    impactLabel = 'Baixo';
    impactColor = '#10b981';
    impactIcon = 'fa-circle-check';
  }

  const kpiFlowEl = document.getElementById('kpiFlow');
  if (kpiFlowEl) {
    kpiFlowEl.innerHTML = `<span style="color:${impactColor};font-size:28px;font-weight:800;">${impactLabel}</span>`;
  }

  // Atualizar o insight com base na hora atual
  const insightEl = document.getElementById('kpiFlowInsight');
  if (insightEl) {
    if (isCurrentlyPeak) {
      insightEl.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i>Impacto`;
      insightEl.className = 'kpi-trend down';
    } else {
      insightEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i>Impacto`;
      insightEl.className = 'kpi-trend down';
    }
  }

  document.getElementById('kpiPeak').textContent   = MOCK_DATA.kpis.peak;
  document.getElementById('kpiWindow').textContent = MOCK_DATA.kpis.window;
  renderKpiCong();
}

function renderKpiCong() {
  const labels = MOCK_DATA.dailyFlow.labels;
  const values = MOCK_DATA.dailyFlow.values;
  const minIdx = values.indexOf(Math.min(...values));
  const el = document.getElementById('kpiCong');
  if (!el) return;
  el.innerHTML =
    `<span style="display:block;font-size:28px;font-weight:800;line-height:1;color:#10b981;">${labels[minIdx]}</span>` +
    `<span style="display:block;font-size:12px;font-weight:500;color:var(--text-muted);line-height:1.4;">${values[minIdx].toLocaleString('pt-BR')} veículos/dia</span>`;
}


function animateCount(id, from, to, duration, format = v => v) {
  const el = document.getElementById(id);
  const start = performance.now();
  const range = to - from;
  const tick = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = format(Math.round(from + range * eased));
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// ── CHARTS ─────────────────────────────────────────────────
// Plugin para desenhar as áreas de destaque (Peak Shading)
const peakAreaPlugin = {
  id: 'peakAreaPlugin',
  beforeDraw: (chart) => {
    const { ctx, chartArea: { top, bottom, left, width }, scales: { x } } = chart;
    
    // Definimos os índices dos horários de pico (baseado no array de labels 00h-23h)
    // Manhã: 07h às 09h | Tarde: 17h às 19h
    const peakZones = [
      { start: 7, end: 9 },
      { start: 17, end: 19 }
    ];

    ctx.save();
    ctx.fillStyle = 'rgba(239, 68, 68, 0.08)'; // Vermelho bem suave, similar à imagem

    peakZones.forEach(zone => {
      const startX = x.getPixelForValue(zone.start);
      const endX = x.getPixelForValue(zone.end);
      ctx.fillRect(startX, top, endX - startX, bottom - top);
    });
    ctx.restore();
  }
};

function initCharts() {
  Chart.defaults.font.family = "'DM Sans', sans-serif";
  Chart.defaults.color = '#94a3b8';

  buildFlowChart();
  buildDonutChart();
}

function buildFlowChart() {
  const ctx = document.getElementById('chartFlow').getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 220);
  grad.addColorStop(0, 'rgba(37,99,235,0.2)');
  grad.addColorStop(1, 'rgba(37,99,235,0)');

  chartFlow = new Chart(ctx, {
    type: 'line',
    data: {
      labels: MOCK_DATA.hourlyFlow.todayLabels,
      datasets: [{
        label: 'Veículos/h — Hoje',
        data: MOCK_DATA.hourlyFlow.today,
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
        
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#94a3b8',
          bodyColor: '#fff',
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: ctx => ` ${ctx.parsed.y.toLocaleString('pt-BR')} veículos/h`
          }
        }
      },
      scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: {
          grid: { color: '#f1f5f9', drawBorder: false },
          border: { display: false },
          ticks: {
            callback: v => v >= 1000 ? (v/1000).toFixed(1)+'k' : v
          }
        }
      }
    }
  });
}

function buildDayChart() {
  const ctx = document.getElementById('chartDay').getContext('2d');
  chartDay = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: MOCK_DATA.dailyFlow.labels,
      datasets: [{
        label: 'Fluxo diário',
        data: MOCK_DATA.dailyFlow.values,
        backgroundColor: MOCK_DATA.dailyFlow.values.map((v, i) => {
          if (i === 4) return '#2563eb';
          return '#dbeafe';
        }),
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          callbacks: {
            label: ctx => ` ${ctx.parsed.y.toLocaleString('pt-BR')} veículos`
          }
        }
      },
      scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: {
          grid: { color: '#f1f5f9' },
          border: { display: false },
          ticks: { callback: v => (v/1000).toFixed(0)+'k' }
        }
      }
    }
  });
}

function updateDonutCenter(filter, dados) {
  const labelEl = document.getElementById('donutLabel');
  const smallEl = labelEl ? labelEl.nextElementSibling : null;
  if (!labelEl) return;

  if (filter) {
    const idx = ['Crítico', 'Atenção', 'Estável'].indexOf(filter);
    const count = dados[idx];
    labelEl.textContent = count;
    if (smallEl) smallEl.textContent = filter;
  } else {
    const criticas = dados[0];
    const total = REGIOES.length;
    labelEl.textContent = criticas + '/' + total;
    if (smallEl) smallEl.textContent = 'Críticas';
  }
}

function buildDonutChart() {
  const ctx = document.getElementById('chartDonut').getContext('2d');
  const labels = MOCK_DATA.dailyFlow.labels;
  const values = MOCK_DATA.dailyFlow.values;
  const minVal = Math.min(...values);

  chartDonut = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Veículos/dia',
        data: values,
        backgroundColor: values.map(v => v === minVal ? '#10b981' : v > 50000 ? '#ef4444CC' : '#fbbf24CC'),
        borderRadius: 5,
        borderSkipped: false
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          callbacks: {
            label: ctx => ` ${ctx.parsed.x.toLocaleString('pt-BR')} veículos`,
            afterLabel: ctx => ctx.parsed.x === minVal ? '✓ Melhor dia para obras' : ''
          }
        }
      },
      scales: {
        x: { grid: { color: '#f1f5f9' }, border: { display: false }, ticks: { callback: v => (v/1000).toFixed(0)+'k' } },
        y: { grid: { display: false }, border: { display: false } }
      }
    }
  });
}

// ── CONGESTIONAMENTO POR VELOCIDADE ───────────────────────
const CONG_SPEED_DATA = [
  { via: 'Av. Paulista',        velocidade: 12 },
  { via: 'Marginal Tietê',      velocidade: 28 },
  { via: 'Av. Rebouças',        velocidade: 48 },
  { via: 'Radial Leste',        velocidade: 9  },
  { via: 'Av. Faria Lima',      velocidade: 62 },
  { via: 'Av. Brigadeiro',      velocidade: 75 },
];

function getCongLevelFromSpeed(speed) {
  if (speed <= 20) return { label: 'Alto',  cor: '#ef4444', bg: '#fee2e2' };
  if (speed <= 50) return { label: 'Médio', cor: '#f59e0b', bg: '#fef3c7' };
  return               { label: 'Baixo', cor: '#10b981', bg: '#d1fae5' };
}

function initCongSpeedChart() {
  const container = document.getElementById('congSpeedChart');
  if (!container) return;
  container.innerHTML = CONG_SPEED_DATA.map(item => {
    const nivel = getCongLevelFromSpeed(item.velocidade);
    const pct = Math.min(100, Math.round((item.velocidade / 120) * 100));
    return `
      <div style="display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:9px;background:#f8fafc;">
        <div style="min-width:110px;font-size:11px;font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.via}</div>
        <div style="flex:1;height:8px;background:#e2e8f0;border-radius:99px;overflow:hidden;min-width:40px;">
          <div style="width:${pct}%;height:100%;background:${nivel.cor};border-radius:99px;"></div>
        </div>
        <div style="font-size:11px;font-weight:700;color:${nivel.cor};min-width:40px;text-align:right;">${item.velocidade}km/h</div>
        <div style="padding:2px 8px;border-radius:99px;background:${nivel.bg};color:${nivel.cor};font-size:10px;font-weight:700;min-width:44px;text-align:center;">${nivel.label}</div>
      </div>`;
  }).join('');
}

function updateFlowChart(filter) {
  currentFilter = filter;

  const dataset = chartFlow.data.datasets[0];
  const labelsMap = {
    today: 'Hoje',
    week:  'Semana',
    month: 'Mês'
  };

  dataset.label = `Veículos — ${labelsMap[filter]}`;

  if (filter === 'today') {
    chartFlow.data.labels = MOCK_DATA.hourlyFlow.todayLabels;
    dataset.data = MOCK_DATA.hourlyFlow.today;

    // Tooltip: veículos/h
    chartFlow.options.plugins.tooltip.callbacks.label =
      ctx => ` ${ctx.parsed.y.toLocaleString('pt-BR')} veículos/h`;

    // Eixo Y: escala por hora
    chartFlow.options.scales.y.ticks.callback =
      v => v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v;

  } else if (filter === 'week') {
    chartFlow.data.labels = MOCK_DATA.hourlyFlow.weekLabels;
    dataset.data = MOCK_DATA.hourlyFlow.week;

    // Tooltip: total por dia
    chartFlow.options.plugins.tooltip.callbacks.label =
      ctx => ` ${ctx.parsed.y.toLocaleString('pt-BR')} veículos no dia`;

    // Eixo Y: escala em dezenas de milhar
    chartFlow.options.scales.y.ticks.callback =
      v => (v / 1000).toFixed(0) + 'k';

  } else if (filter === 'month') {
    chartFlow.data.labels = MOCK_DATA.hourlyFlow.monthLabels;
    dataset.data = MOCK_DATA.hourlyFlow.month;

    // Tooltip: total por dia
    chartFlow.options.plugins.tooltip.callbacks.label =
      ctx => ` ${ctx.parsed.y.toLocaleString('pt-BR')} veículos no dia`;

    // Eixo Y: escala em dezenas de milhar
    chartFlow.options.scales.y.ticks.callback =
      v => (v / 1000).toFixed(0) + 'k';
  }

  chartFlow.update();
}

// ── MAP ────────────────────────────────────────────────────

let map, markersLayer;

function initMap() {
  map = L.map('map', {
    center: [-23.5505, -46.6333],
    zoom: 13,
    zoomControl: true,
    attributionControl: false
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);

  renderMapMarkers(MOCK_DATA.obras);
  addCriticalOverlays();

  // Simulated dynamic update every 30s
  setInterval(() => simulateDynamicUpdate(), 30000);
}

function createMarkerIcon(color) {
  const colors = { green: '#10b981', yellow: '#f59e0b', red: '#ef4444' };
  const hex = colors[color] || '#3b82f6';
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:30px; height:30px;
        background:${hex};
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        display:flex; align-items:center; justify-content:center;
        box-shadow:0 3px 10px rgba(0,0,0,0.25);
        border:2px solid rgba(255,255,255,0.8);
      ">
        <i class="fa-solid fa-helmet-safety" style="
          transform:rotate(45deg);
          font-size:11px; color:white;
        "></i>
      </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -32]
  });
}

function renderMapMarkers(obras) {
  markersLayer.clearLayers();
  obras.forEach(obra => {
    const icon = createMarkerIcon(obra.marcador);
    const marker = L.marker([obra.lat, obra.lng], { icon })
      .addTo(markersLayer)
      .bindPopup(buildPopupHtml(obra), {
        maxWidth: 280,
        className: 'nr-popup'
      });

    marker.on('click', () => {
      highlightTableRow(obra.id);
      filterChartsForLocation(obra);
    });
  });
}

function buildPopupHtml(obra) {
  const impactColor = obra.impacto >= 70 ? 'red' : obra.impacto >= 40 ? 'yellow' : 'green';
  const statusLabel = {
    planned: 'Planejada', ongoing: 'Em andamento', completed: 'Concluída', critical: 'Crítica'
  }[obra.status] || obra.status;

  return `
    <div class="map-popup">
      <p class="popup-title">${obra.local} — ${obra.bairro}</p>
      <div class="popup-row">
        <span class="popup-label">Tipo de obra</span>
        <span class="popup-value">${obra.tipo}</span>
      </div>
      <div class="popup-row">
        <span class="popup-label">Impacto estimado</span>
        <span class="popup-badge badge-${impactColor}">${obra.impacto}%</span>
      </div>
      <div class="popup-row">
        <span class="popup-label">Duração</span>
        <span class="popup-value">${obra.duracao}</span>
      </div>
      <div class="popup-row">
        <span class="popup-label">Início</span>
        <span class="popup-value">${formatDate(obra.dataInicio)}</span>
      </div>
      <div class="popup-row">
        <span class="popup-label">Melhor horário</span>
        <span class="popup-value" style="color:#10b981;">01h–05h</span>
      </div>
      <div class="popup-row">
        <span class="popup-label">Status</span>
        <span class="popup-badge badge-${impactColor}">${statusLabel}</span>
      </div>
    </div>`;
}

function addCriticalOverlays() {
  const criticalZones = [
    { center: [-23.5631, -46.6542], radius: 280, color: '#ef4444' },
    { center: [-23.5461, -46.6370], radius: 350, color: '#ef4444' },
    { center: [-23.5598, -46.6733], radius: 220, color: '#f59e0b' },
  ];

  criticalZones.forEach(z => {
    L.circle(z.center, {
      radius: z.radius,
      color: z.color,
      fillColor: z.color,
      fillOpacity: 0.08,
      weight: 1.5,
      dashArray: '4 4'
    }).addTo(map);
  });
}

function simulateDynamicUpdate() {
  // Slightly randomize one obra's impacto and re-render popup
  MOCK_DATA.obras.forEach(o => {
    o.impacto = Math.min(100, Math.max(5, o.impacto + (Math.random() * 6 - 3) | 0));
  });
  renderMapMarkers(filteredObras);
  updateKpiCong();
}
function updateKpiCong() {
  renderKpiCong();
}

function highlightTableRow(id) {
  document.querySelectorAll('#tableBody tr').forEach(tr => {
    tr.style.background = tr.dataset.id == id ? '#eff6ff' : '';
  });
  const row = document.querySelector(`#tableBody tr[data-id="${id}"]`);
  if (row) row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function filterChartsForLocation(obra) {
  const dataKey = currentFilter === 'today' ? 'today' : currentFilter;
  const multiplier = 1 + (obra.impacto / 100) * 0.4;
  const modifiedData = MOCK_DATA.hourlyFlow[dataKey].map(v =>
    Math.round(v * (0.9 + Math.random() * 0.2 * multiplier))
  );
  chartFlow.data.datasets[0].data = modifiedData;
  chartFlow.update('active');
}

// ── TABLE ──────────────────────────────────────────────────

function initTable() {
  renderTable(MOCK_DATA.obras);
}

function renderTable(obras) {
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = obras.map(obra => {
    const statusInfo = {
      planned:   { label: 'Planejada',    cls: 'status-planned',   icon: 'fa-calendar' },
      ongoing:   { label: 'Em andamento', cls: 'status-ongoing',   icon: 'fa-rotate'   },
      completed: { label: 'Concluída',    cls: 'status-completed', icon: 'fa-check'    },
      critical:  { label: 'Crítica',      cls: 'status-critical',  icon: 'fa-triangle-exclamation' }
    }[obra.status];

    const impactColor = obra.impacto >= 70 ? '#ef4444' : obra.impacto >= 40 ? '#f59e0b' : '#10b981';

    return `
      <tr data-id="${obra.id}" style="cursor:pointer;" onclick="focusObra(${obra.id})">
        <td>
          <div class="table-location">
            ${obra.local}
            <small>${obra.bairro}</small>
          </div>
        </td>
        <td>${obra.tipo}</td>
        <td>${formatDate(obra.dataInicio)}</td>
        <td>${obra.duracao}</td>
        <td>
          <div class="impact-bar">
            <div class="impact-bar-bg">
              <div class="impact-bar-fill" style="width:${obra.impacto}%; background:${impactColor};"></div>
            </div>
            <span class="impact-pct" style="color:${impactColor};">${obra.impacto}%</span>
          </div>
        </td>
        <td>
          <span class="status-pill ${statusInfo.cls}">
            <i class="fa-solid ${statusInfo.icon}"></i>
            ${statusInfo.label}
          </span>
        </td>
        <td>
          <button class="action-btn" title="Ver no mapa" onclick="event.stopPropagation(); focusObra(${obra.id})">
            <i class="fa-solid fa-location-dot"></i>
          </button>
          <button class="action-btn" title="Detalhes">
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </button>
        </td>
      </tr>`;
  }).join('');
}

window.focusObra = function(id) {
  const obra = MOCK_DATA.obras.find(o => o.id === id);
  if (!obra) return;
  map.flyTo([obra.lat, obra.lng], 15, { duration: 1.2 });
  highlightTableRow(id);
  filterChartsForLocation(obra);
};

// ── NOTIFICATIONS ──────────────────────────────────────────

function initNotifications() {
  const list = document.getElementById('notifList');
  list.innerHTML = MOCK_DATA.notifications.map(n => `
    <div class="notif-item">
      <span class="notif-dot" style="background:${n.color};"></span>
      <div class="notif-text">
        <p class="notif-title"><i class="fa-solid ${n.icon}" style="color:${n.color};margin-right:5px;"></i>${n.title}</p>
        <p class="notif-desc">${n.desc}</p>
        <p class="notif-time">${n.time}</p>
      </div>
    </div>`).join('');
}

// ── INTERACTIONS ───────────────────────────────────────────

function initInteractions() {
  aplicarRestricaoNav();
  // Sidebar nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      const page = item.dataset.page;
      if (!page) return;
      e.preventDefault();
      loadPage(page);
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // Notification panel
  const notifBtn = document.getElementById('notifBtn');
  const notifPanel = document.getElementById('notifPanel');
  const overlay = document.getElementById('overlay');
  const closeNotif = document.getElementById('closeNotif');
  const sidebar = document.getElementById('sidebar');

  notifBtn.addEventListener('click', () => {
    notifPanel.classList.add('open');
    overlay.classList.add('visible');
  });

  closeNotif.addEventListener('click', () => {
    notifPanel.classList.remove('open');
    overlay.classList.remove('visible');
  });

  overlay.addEventListener('click', () => {
    notifPanel.classList.remove('open');
    overlay.classList.remove('visible');
    sidebar.classList.remove('mobile-open');
  });

  // Burger menu (mobile)
  const burger = document.getElementById('burgerBtn');
  burger.addEventListener('click', () => {
    sidebar.classList.toggle('mobile-open');
    overlay.classList.toggle('visible');
  });
}

// ── HELPERS ──────────────────────────────────────────────── 

function formatDate(str) {
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}
// ══════════════════════════════════════════════════════════════
//  SPA — PAGE ROUTER
// ══════════════════════════════════════════════════════════════

// ─── API HELPERS ───────────────────────────────────────────────
// Dados que antes eram mocks agora vêm da API. Mantemos os nomes
// originais para não quebrar referências do restante do script.
let MOCK_USERS = [];

function getUsuarioId() {
  return Number(sessionStorage.ID_USUARIO) || 1;
}

function getUsuarioPerfil() {
  return sessionStorage.PERFIL_USUARIO || 'Usuário Padrão';
}

const REGIONAL_PAGES = ['centro','norte','sul','leste','oeste','paulista'];
const ROLE_ACCESS = {
  'Gestor':          ['dashboard','obras','mural','usuarios','settings', ...REGIONAL_PAGES],
  'Analista':        ['dashboard','obras','mural','settings',             ...REGIONAL_PAGES],
  'Operador':        ['dashboard','obras','mural','settings',             ...REGIONAL_PAGES],
  'Usuário Padrão':  ['dashboard','settings',                              ...REGIONAL_PAGES]
};

function paginasPermitidas() {
  return ROLE_ACCESS[getUsuarioPerfil()] || ROLE_ACCESS['Usuário Padrão'];
}

function podeAcessar(page) {
  return paginasPermitidas().indexOf(page) !== -1;
}

function aplicarRestricaoNav() {
  const permitidas = paginasPermitidas();
  document.querySelectorAll('.nav-item[data-page]').forEach(el => {
    const p = el.dataset.page;
    if (!p) return;
    el.style.display = permitidas.indexOf(p) === -1 ? 'none' : '';
  });
}

async function apiFetch(url, options) {
  const r = await fetch(url, Object.assign({
    headers: { 'Content-Type': 'application/json' }
  }, options || {}));
  if (!r.ok && r.status !== 204) {
    const t = await r.text().catch(() => '');
    throw new Error(`API ${url} → ${r.status} ${t}`);
  }
  if (r.status === 204) return null;
  return r.json();
}

async function loadUsers() {
  try {
    MOCK_USERS = await apiFetch('/usuarios') || [];
  } catch (e) {
    console.error('Falha ao carregar usuários:', e);
    MOCK_USERS = [];
  }
}

function loadPage(page) {
  if (!podeAcessar(page)) {
    page = 'dashboard';
  }
  const content = document.querySelector('.content');

  // Destroy charts if leaving dashboard
  [chartFlow, chartDay, chartDonut].forEach(c => { if (c) c.destroy(); });
  chartFlow = chartDay = chartDonut = null;
  if (map) { map.remove(); map = null; markersLayer = null; }

  content.innerHTML = '';
  content.style.animation = 'none';
  requestAnimationFrame(() => {
    content.style.animation = '';
    content.classList.add('page-entering');
    setTimeout(() => content.classList.remove('page-entering'), 400);
  });

  switch (page) {
    case 'dashboard': renderDashboardPage(content); break;
    case 'obras':     renderObrasPage(content);     break;
    case 'mural':     renderMuralPage(content);     break;
    case 'usuarios':  renderUsuariosPage(content);  break;
    case 'settings':  renderSettingsPage(content);  break;
    case 'centro':    renderRegionalDashboard('centro', content); break;
    case 'norte':     renderRegionalDashboard('norte', content); break;
    case 'sul':       renderRegionalDashboard('sul', content); break;
    case 'leste':     renderRegionalDashboard('leste', content); break;
    case 'oeste':     renderRegionalDashboard('oeste', content); break;
    case 'paulista':  renderRegionalDashboard('paulista', content); break;
    default:          renderPlaceholderPage(content, page);
  }
}

function renderDashboardPage(content) {
  content.innerHTML = `
    <div class="page-title">
      <div>
        <h1>Visão Geral — São Paulo</h1>
        <p class="subtitle">Dados atualizados em tempo real · <span id="lastUpdate" style="white-space:nowrap;"></span></p>
      </div>
      <button class="btn-primary" id="refreshBtn">
        <i class="fa-solid fa-rotate-right"></i> Atualizar
      </button>
    </div>

    <section class="kpi-grid">
      <div class="kpi-card" data-kpi="flow">
        <div class="kpi-icon flow"><i class="fa-solid fa-arrow-right-arrow-left"></i></div>
        <div class="kpi-info">
          <span class="kpi-label">Impacto estimado de intervenção</span>
          <span class="kpi-value" id="kpiFlow">—</span>
          <span class="kpi-unit">Evitar intervenções entre 07h–09h e 17h–19h</span>
        </div>
        <div class="kpi-trend down" id="kpiFlowInsight"><i class="fa-solid fa-triangle-exclamation"></i> Impacto 82%</div>
      </div>
      <div class="kpi-card" data-kpi="peak">
        <div class="kpi-icon peak"><i class="fa-solid fa-clock"></i></div>
        <div class="kpi-info">
          <span class="kpi-label">Horário de pico</span>
          <span class="kpi-value" id="kpiPeak">—</span>
          <span class="kpi-unit">Maior congestionamento</span>
        </div>
        <div class="kpi-trend neutral"><i class="fa-solid fa-minus"></i> estável</div>
      </div>
      <div class="kpi-card" data-kpi="window">
        <div class="kpi-icon window"><i class="fa-solid fa-calendar-check"></i></div>
        <div class="kpi-info">
          <span class="kpi-label">Melhor janela</span>
          <span class="kpi-value" id="kpiWindow">—</span>
          <span class="kpi-unit">Janela ideal</span>
        </div>
        <div class="kpi-trend up"><i class="fa-solid fa-check"></i> Recomendado</div>
      </div>
      <div class="kpi-card" data-kpi="cong">
        <div class="kpi-icon window"><i class="fa-solid fa-calendar-check"></i></div>
        <div class="kpi-info">
          <span class="kpi-label">Melhor dia para obras</span>
          <span class="kpi-value" id="kpiCong">—</span>
          <span class="kpi-unit">Menor volume histórico semanal</span>
        </div>
        <div class="kpi-trend up"><i class="fa-solid fa-check"></i> Recomendado</div>
      </div>
    </section>

    <section class="charts-grid">
      <div class="chart-card wide">
        <div class="chart-header">
          <div><h3>Fluxo de Veículos por Horário</h3><p>Volume médio histórico</p></div>
        </div>
        <div class="chart-body"><canvas id="chartFlow"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="chart-header">
          <div><h3>Média de Congestionamento</h3><p>Nível por velocidade média registrada</p></div>
        </div>
        <div class="chart-body" id="congSpeedChart" style="display:flex;flex-direction:column;gap:10px;justify-content:center;padding:12px 4px;">
          <!-- Rendered by JS -->
        </div>
      </div>
      <div class="chart-card slim">
        <div class="chart-header">
          <div><h3>Volume por Dia da Semana</h3><p>Média histórica · Verde = melhor para obras</p></div>
        </div>
        <div class="chart-body"><canvas id="chartDonut"></canvas></div>
      </div>
    </section>


    <section class="table-section">
      <div class="section-header">
        <div><h2>Obras Planejadas e em Andamento</h2><p>Lista de intervenções viárias</p></div>
        <div class="table-controls">
          <input class="table-search" type="text" placeholder="Filtrar obras…" id="tableSearch"/>
        </div>
      </div>
      <div class="table-wrapper">
        <table class="data-table" id="obrasTable">
          <thead>
            <tr>
              <th>Localização</th><th>Tipo de Obra</th><th>Data Início</th>
              <th>Duração</th><th>Impacto</th><th>Status</th><th>Ações</th>
            </tr>
          </thead>
          <tbody id="tableBody"></tbody>
        </table>
      </div>
    </section>`;

  // Re-init all dashboard subsystems
  filteredObras = [...MOCK_DATA.obras];
  currentCriticalityFilter = null;
  initTimestamp();
  initKPIs();
  initCharts();
  initCongSpeedChart();
  initTable();
  initDashboardInteractions();
}

function updateDashboard() {
  if (chartFlow) {
    renderMapMarkers(filteredObras);
    renderTable(filteredObras);
  }
}

function initDashboardInteractions() {
  // Chart filter buttons (Hoje, Semana, Mês)
  document.querySelectorAll('[data-chart-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-chart-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateFlowChart(btn.dataset.chartFilter);
    });
  });

  // Refresh button
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      const icon = refreshBtn.querySelector('i');
      icon.classList.add('spinning');
      setTimeout(() => {
        icon.classList.remove('spinning');
        simulateDynamicUpdate();
        updateKpiCong();
      }, 900);
    });
  }

  // Table search
  const tableSearch = document.getElementById('tableSearch');
  if (tableSearch) {
    tableSearch.addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      filteredObras = MOCK_DATA.obras.filter(o =>
        o.local.toLowerCase().includes(q) ||
        o.bairro.toLowerCase().includes(q) ||
        o.tipo.toLowerCase().includes(q)
      );
      renderTable(filteredObras);
      renderMapMarkers(filteredObras);
    });
  }

  // Region filter — navigate to regional dashboard
  const filterRegion = document.getElementById('filterRegion');
  if (filterRegion) {
    filterRegion.addEventListener('change', e => {
      const val = e.target.value;
      if (val === 'all') {
        // Navigate back to general dashboard
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        const dashNav = document.querySelector('.nav-item[data-page="dashboard"]');
        if (dashNav) dashNav.classList.add('active');
        loadPage('dashboard');
        return;
      }
      // Navigate to regional dashboard
      const regionalPages = ['centro','norte','sul','leste','oeste','paulista'];
      if (regionalPages.includes(val)) {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        loadPage(val);
        filterRegion.value = val;
      }
    });
  }

  // Header search
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      if (q.length < 2) { renderMapMarkers(filteredObras); return; }
      const found = MOCK_DATA.obras.filter(o =>
        o.local.toLowerCase().includes(q) || o.bairro.toLowerCase().includes(q)
      );
      renderMapMarkers(found);
      if (found.length > 0 && map) map.flyTo([found[0].lat, found[0].lng], 15, { duration: 1 });
    });
  }
}

// ── PLACEHOLDER ───────────────────────────────────────────────
function renderPlaceholderPage(content, page) {
  const labels = { traffic:'Análise de Tráfego', obras:'Planejamento de Obras', sim:'Simulações', reports:'Relatórios' };
  content.innerHTML = `
    <div class="page-title"><div><h1>${labels[page] || page}</h1><p class="subtitle">Página em construção</p></div></div>
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:300px;gap:16px;color:var(--text-muted);">
      <i class="fa-solid fa-wrench" style="font-size:48px;opacity:0.3;"></i>
      <p style="font-size:15px;">Esta seção estará disponível em breve.</p>
    </div>`;
}

// ══════════════════════════════════════════════════════════════
//  PÁGINA: USUÁRIOS
// ══════════════════════════════════════════════════════════════
let usersFiltered = [...MOCK_USERS];
let userModalMode = null; // 'add' | 'edit'
let userEditId = null;

async function renderUsuariosPage(content) {
  await loadUsers();
  usersFiltered = [...MOCK_USERS];

  content.innerHTML = `
    <div class="page-title">
      <div>
        <h1>Usuários</h1>
        <p class="subtitle">Gestão de acessos e perfis do sistema</p>
      </div>
      <button class="btn-primary" onclick="openUserModal('add')">
        <i class="fa-solid fa-user-plus"></i> Novo Usuário
      </button>
    </div>

    <!-- Stats row -->
    <section class="kpi-grid" style="margin-bottom:0;">
      <div class="kpi-card">
        <div class="kpi-icon flow"><i class="fa-solid fa-users"></i></div>
        <div class="kpi-info">
          <span class="kpi-label">Total de usuários</span>
          <span class="kpi-value">${MOCK_USERS.length}</span>
          <span class="kpi-unit">cadastrados</span>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon window"><i class="fa-solid fa-circle-check"></i></div>
        <div class="kpi-info">
          <span class="kpi-label">Ativos</span>
          <span class="kpi-value">${MOCK_USERS.filter(u=>u.status==='ativo').length}</span>
          <span class="kpi-unit">com acesso</span>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon cong"><i class="fa-solid fa-user-clock"></i></div>
        <div class="kpi-info">
          <span class="kpi-label">Pendentes</span>
          <span class="kpi-value">${MOCK_USERS.filter(u=>u.status==='pendente').length}</span>
          <span class="kpi-unit">aguardando aprovação</span>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon peak"><i class="fa-solid fa-user-shield"></i></div>
        <div class="kpi-info">
          <span class="kpi-label">Gestores</span>
          <span class="kpi-value">${MOCK_USERS.filter(u=>u.perfil==='Gestor').length}</span>
          <span class="kpi-unit">com acesso total</span>
        </div>
      </div>
    </section>

    <!-- Table -->
    <section class="table-section" style="margin-top:24px;">
      <div class="section-header" style="padding:20px 20px 0;">
        <div><h2>Lista de Usuários</h2><p>Todos os membros cadastrados no sistema</p></div>
        <div class="table-controls">
          <select class="filter-select" id="userFilterPerfil" onchange="filterUsers()">
            <option value="">Todos os perfis</option>
            <option value="Gestor">Gestor</option>
            <option value="Analista">Analista</option>
            <option value="Operador">Operador</option>
          </select>
          <select class="filter-select" id="userFilterStatus" onchange="filterUsers()">
            <option value="">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="pendente">Pendente</option>
          </select>
          <input class="table-search" type="text" placeholder="Buscar usuário…" id="userSearch" oninput="filterUsers()" style="width:180px;"/>
        </div>
      </div>
      <div class="table-wrapper" style="margin-top:16px;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Perfil</th>
              <th>Região</th>
              <th>Último acesso</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody id="usersTableBody"></tbody>
        </table>
      </div>
    </section>

    <!-- MODAL -->
    <div class="modal-overlay" id="userModalOverlay" onclick="closeUserModal()"></div>
    <div class="modal-panel" id="userModal">
      <div class="modal-header">
        <div style="display:flex;align-items:center;gap:10px;">
          <div id="modalIconWrap" style="width:36px;height:36px;border-radius:10px;background:#dbeafe;display:flex;align-items:center;justify-content:center;">
            <i class="fa-solid fa-user-plus" style="color:#2563eb;font-size:15px;" id="modalIcon"></i>
          </div>
          <div>
            <h3 id="modalTitle" style="margin:0;">Novo Usuário</h3>
            <p id="modalSubtitle" style="font-size:11px;color:var(--text-muted);margin:0;">Preencha os dados do novo membro</p>
          </div>
        </div>
        <button class="modal-close" onclick="closeUserModal()"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="modal-body">
        <div id="formErrorBanner" style="display:none;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:10px 14px;font-size:12px;color:#dc2626;display:flex;align-items:center;gap:8px;">
          <i class="fa-solid fa-circle-exclamation"></i>
          <span id="formErrorMsg"></span>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Nome completo <span style="color:#dc2626;">*</span></label>
            <input type="text" id="fNome" class="form-input" placeholder="Ex: João Silva" oninput="clearFieldError('fNome')"/>
            <span class="field-error" id="errNome"></span>
          </div>
          <div class="form-group">
            <label>E-mail <span style="color:#dc2626;">*</span></label>
            <input type="email" id="fEmail" class="form-input" placeholder="joao@newroad.sp" oninput="clearFieldError('fEmail')"/>
            <span class="field-error" id="errEmail"></span>
          </div>
        </div>
        <div class="form-row" id="passwordRow">
          <div class="form-group">
            <label>Senha <span style="color:#dc2626;">*</span></label>
            <div style="position:relative;">
              <input type="password" id="fSenha" class="form-input" placeholder="Mínimo 6 caracteres" style="padding-right:38px;" oninput="clearFieldError('fSenha')"/>
              <button type="button" onclick="togglePasswordVisibility('fSenha','eyeSenha')" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text-muted);padding:0;">
                <i class="fa-solid fa-eye" id="eyeSenha"></i>
              </button>
            </div>
            <span class="field-error" id="errSenha"></span>
          </div>
          <div class="form-group">
            <label>Telefone <span style="color:var(--text-muted);font-weight:400;">(opcional)</span></label>
            <input type="tel" id="fTelefone" class="form-input" placeholder="(11) 9 0000-0000"/>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Perfil de acesso <span style="color:#dc2626;">*</span></label>
            <select id="fPerfil" class="form-input">
              <option value="Gestor">Gestor</option>
              <option value="Analista" selected>Analista</option>
              <option value="Operador">Operador</option>
            </select>
            <span style="font-size:11px;color:var(--text-muted);" id="perfilHint">Acesso de leitura e análise</span>
          </div>
          <div class="form-group">
            <label>Região <span style="color:#dc2626;">*</span></label>
            <select id="fRegiao" class="form-input">
              <option>SP Region</option>
              <option>Zona Norte</option>
              <option>Zona Sul</option>
              <option>Zona Leste</option>
              <option>Zona Oeste</option>
              <option>Centro</option>
              <option>Pinheiros</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Status</label>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <label class="status-radio" id="radio-ativo">
              <input type="radio" name="fStatus" value="ativo" checked onchange="updateStatusRadio()"/>
              <i class="fa-solid fa-circle-check"></i> Ativo
            </label>
            <label class="status-radio" id="radio-pendente">
              <input type="radio" name="fStatus" value="pendente" onchange="updateStatusRadio()"/>
              <i class="fa-solid fa-clock"></i> Pendente
            </label>
            <label class="status-radio" id="radio-inativo">
              <input type="radio" name="fStatus" value="inativo" onchange="updateStatusRadio()"/>
              <i class="fa-solid fa-circle-xmark"></i> Inativo
            </label>
          </div>
        </div>
      </div>
      <div class="modal-footer" style="justify-content:space-between;align-items:center;">
        <span style="font-size:11px;color:var(--text-muted);"><span style="color:#dc2626;">*</span> Campos obrigatórios</span>
        <div style="display:flex;gap:10px;">
          <button class="btn-outline" onclick="closeUserModal()">Cancelar</button>
          <button class="btn-primary" onclick="saveUser()" id="btnSaveUser">
            <i class="fa-solid fa-check"></i> <span id="modalSaveLabel">Criar usuário</span>
          </button>
        </div>
      </div>
    </div>`;

  renderUsersTable();
}

window.filterUsers = function() {
  const q      = (document.getElementById('userSearch')?.value || '').toLowerCase();
  const perfil = document.getElementById('userFilterPerfil')?.value || '';
  const status = document.getElementById('userFilterStatus')?.value || '';
  usersFiltered = MOCK_USERS.filter(u =>
    (!q      || u.nome.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
    (!perfil || u.perfil === perfil) &&
    (!status || u.status === status)
  );
  renderUsersTable();
};

function renderUsersTable() {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;
  const statusCfg = {
    ativo:    { cls:'status-completed', icon:'fa-circle-check',  label:'Ativo'    },
    inativo:  { cls:'status-critical',  icon:'fa-circle-xmark',  label:'Inativo'  },
    pendente: { cls:'status-planned',   icon:'fa-clock',         label:'Pendente' },
  };
  const perfilColors = { Gestor:'#2563eb', Analista:'#0d9488', Operador:'#7c3aed' };

  tbody.innerHTML = usersFiltered.map(u => {
    const sc = statusCfg[u.status] || statusCfg.ativo;
    const pc = perfilColors[u.perfil] || '#64748b';
    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,${pc},${pc}99);color:white;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${u.avatar}</div>
            <div>
              <div style="font-weight:600;font-size:13px;">${u.nome}</div>
              <div style="font-size:11px;color:var(--text-muted);">${u.email}</div>
            </div>
          </div>
        </td>
        <td><span style="display:inline-block;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:600;background:${pc}18;color:${pc};">${u.perfil}</span></td>
        <td style="font-size:13px;">${u.regiao}</td>
        <td style="font-size:12px;color:var(--text-muted);">${u.ultimo}</td>
        <td>
          <span class="status-pill ${sc.cls}">
            <i class="fa-solid ${sc.icon}"></i> ${sc.label}
          </span>
        </td>
        <td>
          <button class="action-btn" title="Editar" onclick="openUserModal('edit',${u.id})"><i class="fa-solid fa-pen"></i></button>
          <button class="action-btn" title="Remover" onclick="removeUser(${u.id})" style="color:var(--red);"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>`;
  }).join('');
}

window.openUserModal = function(mode, id) {
  userModalMode = mode;
  userEditId = id || null;
  // Clear errors
  ['fNome','fEmail','fSenha'].forEach(f => clearFieldError(f));
  const banner = document.getElementById('formErrorBanner');
  if (banner) banner.style.display = 'none';

  document.getElementById('userModal').classList.add('open');
  document.getElementById('userModalOverlay').classList.add('visible');

  if (mode === 'edit' && id) {
    const u = MOCK_USERS.find(x => x.id === id);
    if (!u) return;
    document.getElementById('modalTitle').textContent    = 'Editar Usuário';
    document.getElementById('modalSubtitle').textContent = 'Atualize os dados do membro';
    document.getElementById('modalSaveLabel').textContent = 'Salvar alterações';
    document.getElementById('modalIcon').className       = 'fa-solid fa-user-pen';
    document.getElementById('modalIconWrap').style.background = '#fef3c7';
    document.getElementById('modalIcon').style.color    = '#d97706';
    document.getElementById('fNome').value    = u.nome;
    document.getElementById('fEmail').value   = u.email;
    document.getElementById('fTelefone').value = u.telefone || '';
    document.getElementById('fPerfil').value  = u.perfil;
    document.getElementById('fRegiao').value  = u.regiao;
    // Hide password field on edit
    document.getElementById('passwordRow').style.display = 'none';
    // Set status radio
    const statusVal = u.status || 'ativo';
    const radioEl = document.querySelector(`input[name="fStatus"][value="${statusVal}"]`);
    if (radioEl) { radioEl.checked = true; updateStatusRadio(); }
  } else {
    document.getElementById('modalTitle').textContent    = 'Novo Usuário';
    document.getElementById('modalSubtitle').textContent = 'Preencha os dados do novo membro';
    document.getElementById('modalSaveLabel').textContent = 'Criar usuário';
    document.getElementById('modalIcon').className       = 'fa-solid fa-user-plus';
    document.getElementById('modalIconWrap').style.background = '#dbeafe';
    document.getElementById('modalIcon').style.color    = '#2563eb';
    ['fNome','fEmail','fSenha','fTelefone'].forEach(f => { const el = document.getElementById(f); if(el) el.value = ''; });
    document.getElementById('fPerfil').value = 'Analista';
    document.getElementById('fRegiao').value = 'SP Region';
    document.getElementById('passwordRow').style.display = '';
    const radioEl = document.querySelector('input[name="fStatus"][value="ativo"]');
    if (radioEl) { radioEl.checked = true; updateStatusRadio(); }
  }
  updatePerfilHint();
  document.getElementById('fPerfil').addEventListener('change', updatePerfilHint);
};

window.updatePerfilHint = function() {
  const hints = { Gestor: 'Acesso total ao sistema', Analista: 'Acesso de leitura e análise', Operador: 'Acesso operacional limitado' };
  const el = document.getElementById('perfilHint');
  if (el) el.textContent = hints[document.getElementById('fPerfil')?.value] || '';
};

window.updateStatusRadio = function() {
  const colors = { ativo: '#16a34a', pendente: '#d97706', inativo: '#dc2626' };
  ['ativo','pendente','inativo'].forEach(v => {
    const lbl = document.getElementById(`radio-${v}`);
    const inp = document.querySelector(`input[name="fStatus"][value="${v}"]`);
    if (!lbl || !inp) return;
    if (inp.checked) {
      lbl.style.borderColor = colors[v];
      lbl.style.background  = colors[v] + '12';
      lbl.style.color       = colors[v];
      lbl.style.fontWeight  = '600';
    } else {
      lbl.style.borderColor = '#e2e8f0';
      lbl.style.background  = 'white';
      lbl.style.color       = 'var(--text-secondary)';
      lbl.style.fontWeight  = '500';
    }
  });
};

window.clearFieldError = function(fieldId) {
  const el = document.getElementById(fieldId);
  const err = document.getElementById('err' + fieldId.replace('f','').charAt(0).toUpperCase() + fieldId.replace('f','').slice(1));
  if (el)  { el.style.borderColor = ''; el.style.boxShadow = ''; }
  if (err) err.textContent = '';
};

window.togglePasswordVisibility = function(inputId, iconId) {
  const inp  = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (!inp) return;
  if (inp.type === 'password') { inp.type = 'text';     if(icon) { icon.className = 'fa-solid fa-eye-slash'; } }
  else                         { inp.type = 'password'; if(icon) { icon.className = 'fa-solid fa-eye';       } }
};

window.closeUserModal = function() {
  document.getElementById('userModal')?.classList.remove('open');
  document.getElementById('userModalOverlay')?.classList.remove('visible');
};

window.saveUser = async function() {
  const nome     = document.getElementById('fNome').value.trim();
  const email    = document.getElementById('fEmail').value.trim();
  const telefone = document.getElementById('fTelefone')?.value.trim() || '';
  const perfil   = document.getElementById('fPerfil').value;
  const regiao   = document.getElementById('fRegiao').value;
  const senha    = document.getElementById('fSenha')?.value || '';
  const status   = document.querySelector('input[name="fStatus"]:checked')?.value || 'ativo';

  // --- Validação ---
  let hasError = false;
  const showErr = (fieldId, errId, msg) => {
    const el  = document.getElementById(fieldId);
    const err = document.getElementById(errId);
    if (el)  { el.style.borderColor = '#dc2626'; el.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.1)'; }
    if (err) err.textContent = msg;
    hasError = true;
  };
  // Limpar erros anteriores
  ['fNome','fEmail','fSenha'].forEach(f => clearFieldError(f));
  const banner = document.getElementById('formErrorBanner');
  if (banner) banner.style.display = 'none';

  if (!nome || nome.length < 3)  showErr('fNome',  'errNome',  'Nome deve ter ao menos 3 caracteres.');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) showErr('fEmail', 'errEmail', 'Informe um e-mail válido.');
  // Verificar e-mail duplicado
  const emailExists = MOCK_USERS.some(u => u.email === email && u.id !== userEditId);
  if (!hasError && emailExists) showErr('fEmail', 'errEmail', 'E-mail já cadastrado no sistema.');
  // Senha só obrigatória no cadastro
  if (userModalMode === 'add' && senha.length < 6) showErr('fSenha', 'errSenha', 'Senha deve ter ao menos 6 caracteres.');

  if (hasError) {
    if (banner) {
      banner.style.display = 'flex';
      document.getElementById('formErrorMsg').textContent = 'Corrija os campos destacados antes de continuar.';
    }
    return;
  }

  const initials = nome.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
  const payload  = { nome, email, telefone, perfil, regiao, status, avatar: initials };

  try {
    if (userModalMode === 'add') {
      payload.senha = senha;
      await apiFetch('/usuarios', { method: 'POST', body: JSON.stringify(payload) });
    } else {
      await apiFetch(`/usuarios/${userEditId}`, { method: 'PUT', body: JSON.stringify(payload) });
    }
  } catch (e) {
    if (banner) {
      banner.style.display = 'flex';
      document.getElementById('formErrorMsg').textContent = 'Erro ao salvar. Tente novamente.';
    }
    console.error(e);
    return;
  }

  await loadUsers();
  closeUserModal();
  filterUsers();
  // re-render stats
  document.querySelectorAll('.kpi-value')[0].textContent = MOCK_USERS.length;
  document.querySelectorAll('.kpi-value')[1].textContent = MOCK_USERS.filter(u=>u.status==='ativo').length;
  document.querySelectorAll('.kpi-value')[2].textContent = MOCK_USERS.filter(u=>u.status==='pendente').length;
  document.querySelectorAll('.kpi-value')[3].textContent = MOCK_USERS.filter(u=>u.perfil==='Gestor').length;

  showToast(userModalMode === 'add' ? `Usuário <strong>${nome}</strong> criado com sucesso!` : `Alterações salvas para <strong>${nome}</strong>.`);
};

window.showToast = function(msg) {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#16a34a;"></i> <span>${msg}</span>`;
  toast.style.cssText = 'position:fixed;bottom:28px;right:28px;background:white;border:1px solid #bbf7d0;border-radius:10px;padding:12px 18px;display:flex;align-items:center;gap:10px;font-size:13px;font-weight:500;box-shadow:0 8px 24px rgba(0,0,0,0.12);z-index:9999;opacity:1;transition:opacity 0.4s;';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 3200);
};

window.removeUser = async function(id) {
  if (!confirm('Remover este usuário?')) return;
  try {
    await apiFetch(`/usuarios/${id}`, { method: 'DELETE' });
  } catch (e) {
    console.error(e);
    showToast('Erro ao remover usuário.', 'info');
    return;
  }
  await loadUsers();
  filterUsers();
};

// ══════════════════════════════════════════════════════════════
//  PÁGINA: CONFIGURAÇÕES
// ══════════════════════════════════════════════════════════════
async function renderSettingsPage(content) {
  const idUsuario = getUsuarioId();
  let perfil = null, prefs = null;
  try {
    [perfil, prefs] = await Promise.all([
      apiFetch(`/usuarios/${idUsuario}`),
      apiFetch(`/preferencias/${idUsuario}`)
    ]);
  } catch (e) { console.error('Erro ao carregar preferências:', e); }
  perfil = perfil || { nome: 'Eng. Mateus', email: 'mateus.silva@newroad.sp', regiao: 'SP Region', avatar: 'EM', role: 'Gestor SP' };
  prefs  = prefs  || { intervalo: '1 minuto', regiaoPadrao: 'SP Region (todas)', notifCritica: true, notifPico: true, notifRelatorio: true, darkMode: false };
  window._currentPrefs = prefs;
  window._currentUserProfile = perfil;

  const sel = function (val, opt) { return val === opt ? 'selected' : ''; };
  const chk = function (b) { return b ? 'checked' : ''; };

  content.innerHTML = `
    <div class="page-title">
      <div>
        <h1>Configurações</h1>
        <p class="subtitle">Perfil e preferências do sistema</p>
      </div>
      <button class="btn-primary" onclick="saveSettings()">
        <i class="fa-solid fa-floppy-disk"></i> Salvar
      </button>
    </div>

    <div class="settings-lean">

      <!-- PERFIL -->
      <div class="settings-card">
        <div class="settings-lean-header">
          <div class="settings-lean-avatar">${perfil.avatar || 'EM'}</div>
          <div>
            <p class="settings-lean-name"> ${perfil.nome}</p>
            <p class="settings-lean-role">${perfil.role || perfil.perfil || 'Gestor SP'} · ${perfil.email}</p>
          </div>
          <span class="status-pill status-completed" style="margin-left:auto;font-size:11px;">
            <i class="fa-solid fa-circle-check"></i> 2FA ativa
          </span>
        </div>

        <div class="settings-lean-grid">
          <div class="form-group">
            <label>Nome</label>
            <input type="text" class="form-input" value="${perfil.nome}" id="cfgNome"/>
          </div>
          <div class="form-group">
            <label>E-mail</label>
            <input type="email" class="form-input" value="${perfil.email}" id="cfgEmail"/>
          </div>
          <div class="form-group">
            <label>Região padrão</label>
            <select class="form-input" id="cfgRegiao">
              <option ${sel(prefs.regiaoPadrao, 'SP Region (todas)')}>SP Region (todas)</option>
              <option ${sel(prefs.regiaoPadrao, 'Zona Norte')}>Zona Norte</option>
              <option ${sel(prefs.regiaoPadrao, 'Zona Sul')}>Zona Sul</option>
              <option ${sel(prefs.regiaoPadrao, 'Zona Leste')}>Zona Leste</option>
              <option ${sel(prefs.regiaoPadrao, 'Zona Oeste')}>Zona Oeste</option>
              <option ${sel(prefs.regiaoPadrao, 'Centro')}>Centro</option>
            </select>
          </div>
          <div class="form-group">
            <label>Atualização automática</label>
            <select class="form-input" id="cfgInterval">
              <option ${sel(prefs.intervalo, '30 segundos')}>30 segundos</option>
              <option ${sel(prefs.intervalo, '1 minuto')}>1 minuto</option>
              <option ${sel(prefs.intervalo, '5 minutos')}>5 minutos</option>
              <option ${sel(prefs.intervalo, 'Desativado')}>Desativado</option>
            </select>
          </div>
        </div>
      </div>

      <!-- NOTIFICAÇÕES + PREFERÊNCIAS -->
      <div class="settings-card">
        <p class="settings-lean-section-title"><i class="fa-solid fa-bell"></i> Notificações &amp; Preferências</p>
        <div class="settings-lean-toggles">
          <div class="toggle-row">
            <div><p class="toggle-label">Obras críticas</p><p class="toggle-desc">Impacto ≥ 70%</p></div>
            <label class="toggle-switch"><input type="checkbox" ${chk(prefs.notifCritica)} id="tgCritica"/><span class="toggle-slider"></span></label>
          </div>
          <div class="toggle-row">
            <div><p class="toggle-label">Picos de tráfego</p><p class="toggle-desc">Volume acima da média</p></div>
            <label class="toggle-switch"><input type="checkbox" ${chk(prefs.notifPico)} id="tgPico"/><span class="toggle-slider"></span></label>
          </div>
          <div class="toggle-row">
            <div><p class="toggle-label">Relatórios semanais</p><p class="toggle-desc">Toda segunda-feira</p></div>
            <label class="toggle-switch"><input type="checkbox" ${chk(prefs.notifRelatorio)} id="tgRelatorio"/><span class="toggle-slider"></span></label>
          </div>
          <div class="toggle-row">
            <div><p class="toggle-label">Modo escuro</p><p class="toggle-desc">Tema escuro na interface</p></div>
            <label class="toggle-switch"><input type="checkbox" ${chk(prefs.darkMode)} id="tgDark"/><span class="toggle-slider"></span></label>
          </div>
        </div>
      </div>

      <!-- SISTEMA + SEGURANÇA -->
      <div class="settings-card">
        <p class="settings-lean-section-title"><i class="fa-solid fa-shield-halved"></i> Sistema &amp; Segurança</p>
        <div class="settings-lean-info">
          <div class="settings-info-row"><span>Versão</span><strong style="font-family:'DM Mono',monospace;">v2.4.1</strong></div>
          <div class="settings-info-row"><span>Último acesso</span><strong>Hoje, 09:11 — São Paulo, SP</strong></div>
          <div class="settings-info-row"><span>Sessões ativas</span><strong>1 dispositivo</strong></div>
          <div class="settings-info-row"><span>Suporte</span><strong>suporte@newroad.sp.gov.br</strong></div>
        </div>
        <div style="margin-top:14px;display:flex;gap:8px;">
          <button class="btn-outline" style="font-size:12px;">
            <i class="fa-solid fa-right-from-bracket"></i> Encerrar sessões
          </button>
          <button class="btn-outline" style="font-size:12px;color:var(--red);border-color:var(--red);">
            <i class="fa-solid fa-triangle-exclamation"></i> Revogar acesso
          </button>
        </div>
      </div>

    </div>`;
}

window.saveSettings = async function() {
  const idUsuario = getUsuarioId();
  const nome   = document.getElementById('cfgNome')?.value.trim();
  const email  = document.getElementById('cfgEmail')?.value.trim();
  const profile = window._currentUserProfile || {};

  const prefsPayload = {
    intervalo:       document.getElementById('cfgInterval')?.value || '1 minuto',
    regiaoPadrao:    document.getElementById('cfgRegiao')?.value || 'SP Region (todas)',
    notifCritica:    document.getElementById('tgCritica')?.checked,
    notifPico:       document.getElementById('tgPico')?.checked,
    notifRelatorio:  document.getElementById('tgRelatorio')?.checked,
    darkMode:        document.getElementById('tgDark')?.checked
  };

  const userPayload = {
    nome:     nome  || profile.nome,
    email:    email || profile.email,
    telefone: profile.telefone || '',
    perfil:   profile.perfil   || 'Gestor',
    regiao:   prefsPayload.regiaoPadrao.replace(' (todas)', ''),
    status:   profile.status   || 'ativo',
    avatar:   profile.avatar   || ''
  };

  const btn = document.querySelector('.btn-primary');
  const orig = btn.innerHTML;
  try {
    await Promise.all([
      apiFetch(`/preferencias/${idUsuario}`, { method: 'PUT', body: JSON.stringify(prefsPayload) }),
      apiFetch(`/usuarios/${idUsuario}`,     { method: 'PUT', body: JSON.stringify(userPayload) })
    ]);
    if (nome) document.querySelector('.user-name').textContent = nome.split(' ').slice(0,2).join(' ');
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Salvo!';
    btn.style.background = '#10b981';
  } catch (e) {
    console.error(e);
    btn.innerHTML = '<i class="fa-solid fa-xmark"></i> Erro';
    btn.style.background = '#dc2626';
  }
  setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; }, 2000);
};

// ══════════════════════════════════════════════════════════════
//  REGIONAL DASHBOARDS DATA & RENDERING
// ══════════════════════════════════════════════════════════════

const REGIONAL_DATA = {
  centro: {
    nome: 'Centro',
    cor: '#7c3aed',
    corLight: '#ede9fe',
    icon: 'fa-building-columns',
    descricao: 'Área central histórica · Alto fluxo de pedestres e veículos',
    kpis: {
      horarioCritico: '07h–09h / 11h–14h',
      janelaIdeal: '00h–05h (madrugada)',
      congestionamento: 'Crítico',
      impactoEstimado: 88,
      urgencia: 1,
      fluxoMedio: 6240,
      trend: '+6.1%'
    },
    hourlyFlow: [620,410,290,220,210,490,2100,5800,6900,5400,5200,5800,6400,5900,5100,5300,5900,6800,7100,5200,3800,2600,1900,1400],
    windowData: {
      label: 'Janela Ideal — 00h às 05h',
      score: 94,
      motivo: 'Volume cai 87% durante madrugada. Menor interferência com circulação.'
    },
    congestionamentoHoras: {
      labels: ['00h','04h','08h','12h','16h','20h'],
      values: [12, 8, 91, 78, 83, 45]
    },
    impactSimulation: [
      { cenario: 'Madrugada (00h–05h)', impacto: 6, cor: '#10b981', recomendado: true },
      { cenario: 'Manhã (06h–10h)',     impacto: 91, cor: '#ef4444', recomendado: false },
      { cenario: 'Almoço (11h–14h)',    impacto: 78, cor: '#f59e0b', recomendado: false },
      { cenario: 'Tarde (15h–18h)',     impacto: 83, cor: '#ef4444', recomendado: false },
      { cenario: 'Noite (19h–23h)',     impacto: 45, cor: '#f59e0b', recomendado: false },
    ],
    urgenciaRanking: [
      { local: 'Viaduto do Chá', tipo: 'Estrutural',         urgencia: 1, impacto: 91, dataInicio: '2025-08-01' },
      { local: 'R. da Consolação', tipo: 'Galeria drenagem', urgencia: 2, impacto: 88, dataInicio: '2025-07-22' },
      { local: 'Av. Paulista, 1578', tipo: 'Recapeamento',   urgencia: 3, impacto: 72, dataInicio: '2025-07-10' },
      { local: 'Av. Ipiranga, 200', tipo: 'Sinalização',     urgencia: 4, impacto: 28, dataInicio: '2025-07-05' },
    ],
    obras: MOCK_DATA.obras.filter(o => ['Centro','República','Consolação','Bela Vista','Cerqueira César'].includes(o.bairro))
  },

  norte: {
    nome: 'Zona Norte',
    cor: '#0d9488',
    corLight: '#ccfbf1',
    icon: 'fa-compass',
    descricao: 'Zona Norte · Corredor Marginal Tietê e vias arteriais',
    kpis: {
      horarioCritico: '06h–09h / 17h–19h',
      janelaIdeal: '01h–06h (madrugada)',
      congestionamento: 'Estável',
      impactoEstimado: 54,
      urgencia: 4,
      fluxoMedio: 3980,
      trend: '-2.1%'
    },
    hourlyFlow: [390,260,180,140,160,680,2400,4900,5200,4100,3200,3100,3400,3200,3100,3400,3900,4800,5100,3700,2500,1800,1300,980],
    windowData: {
      label: 'Janela Ideal — 01h às 06h',
      score: 81,
      motivo: 'Menor fluxo noturno com boa visibilidade. Tietê com baixa ocupação.'
    },
    congestionamentoHoras: {
      labels: ['00h','04h','08h','12h','16h','20h'],
      values: [8, 5, 72, 48, 69, 32]
    },
    impactSimulation: [
      { cenario: 'Madrugada (01h–06h)', impacto: 9, cor: '#10b981', recomendado: true },
      { cenario: 'Manhã (06h–09h)',     impacto: 72, cor: '#ef4444', recomendado: false },
      { cenario: 'Almoço (11h–14h)',    impacto: 48, cor: '#f59e0b', recomendado: false },
      { cenario: 'Tarde (17h–19h)',     impacto: 69, cor: '#f59e0b', recomendado: false },
      { cenario: 'Noite (20h–23h)',     impacto: 32, cor: '#10b981', recomendado: false },
    ],
    urgenciaRanking: [
      { local: 'Tnel. Jânio Quadros',  tipo: 'Inspeção estrutural', urgencia: 1, impacto: 80, dataInicio: '2025-07-30' },
      { local: 'Av. Braz Leme',        tipo: 'Pavimentação',        urgencia: 2, impacto: 56, dataInicio: '2025-08-05' },
      { local: 'R. Voluntários da Pátria', tipo: 'Drenagem',        urgencia: 3, impacto: 41, dataInicio: '2025-08-12' },
      { local: 'Av. Santana',          tipo: 'Sinalização',         urgencia: 4, impacto: 22, dataInicio: '2025-08-20' },
    ],
    obras: MOCK_DATA.obras.filter(o => ['Barra Funda','Santana','Casa Verde'].includes(o.bairro))
  },

  sul: {
    nome: 'Zona Sul',
    cor: '#2563eb',
    corLight: '#dbeafe',
    icon: 'fa-map-pin',
    descricao: 'Zona Sul · Vias Interlagos, Marginal Pinheiros e Corredor ABD',
    kpis: {
      horarioCritico: '07h–10h / 17h–20h',
      janelaIdeal: '02h–06h (madrugada)',
      congestionamento: 'Atenção',
      impactoEstimado: 67,
      urgencia: 2,
      fluxoMedio: 5120,
      trend: '+1.8%'
    },
    hourlyFlow: [510,330,240,190,220,810,3100,5600,6200,5100,4100,3900,4400,4200,3900,4200,4800,5900,6400,4600,3100,2200,1600,1100],
    windowData: {
      label: 'Janela Ideal — 02h às 06h',
      score: 78,
      motivo: 'Volume 74% abaixo da média diária. Boa janela para recapeamentos e galerias.'
    },
    congestionamentoHoras: {
      labels: ['00h','04h','08h','12h','16h','20h'],
      values: [11, 7, 84, 63, 87, 52]
    },
    impactSimulation: [
      { cenario: 'Madrugada (02h–06h)', impacto: 11, cor: '#10b981', recomendado: true },
      { cenario: 'Manhã (07h–10h)',     impacto: 84, cor: '#ef4444', recomendado: false },
      { cenario: 'Almoço (11h–14h)',    impacto: 63, cor: '#f59e0b', recomendado: false },
      { cenario: 'Tarde (17h–20h)',     impacto: 87, cor: '#ef4444', recomendado: false },
      { cenario: 'Noite (21h–23h)',     impacto: 52, cor: '#f59e0b', recomendado: false },
    ],
    urgenciaRanking: [
      { local: 'Av. 9 de Julho',       tipo: 'Canalização',     urgencia: 1, impacto: 62, dataInicio: '2025-08-10' },
      { local: 'Av. Rebouças, 3200',   tipo: 'Pavimentação',    urgencia: 2, impacto: 48, dataInicio: '2025-07-15' },
      { local: 'Av. Br. Faria Lima',   tipo: 'Rede elétrica',   urgencia: 3, impacto: 55, dataInicio: '2025-07-20' },
      { local: 'R. Augusta, 800',      tipo: 'Calçada acess.',  urgencia: 4, impacto: 18, dataInicio: '2025-07-08' },
    ],
    obras: MOCK_DATA.obras.filter(o => ['Jardins','Pinheiros'].includes(o.bairro))
  },

  leste: {
    nome: 'Zona Leste',
    cor: '#dc2626',
    corLight: '#fee2e2',
    icon: 'fa-triangle-exclamation',
    descricao: 'Zona Leste · Radial Leste, Via Expressa e Corredor Leste-Oeste',
    kpis: {
      horarioCritico: '06h–10h / 16h–20h',
      janelaIdeal: '01h–05h (madrugada)',
      congestionamento: 'Crítico',
      impactoEstimado: 94,
      urgencia: 1,
      fluxoMedio: 7140,
      trend: '+8.4%'
    },
    hourlyFlow: [740,490,340,260,300,980,3800,7200,8100,6900,5400,5100,5700,5300,5000,5400,6200,7600,8300,6100,4100,2900,2100,1600],
    windowData: {
      label: 'Janela Ideal — 01h às 05h',
      score: 96,
      motivo: 'Única janela com impacto aceitável. Região mais crítica de SP — prioridade máxima.'
    },
    congestionamentoHoras: {
      labels: ['00h','04h','08h','12h','16h','20h'],
      values: [18, 11, 97, 81, 94, 58]
    },
    impactSimulation: [
      { cenario: 'Madrugada (01h–05h)', impacto: 8, cor: '#10b981', recomendado: true },
      { cenario: 'Manhã (06h–10h)',     impacto: 97, cor: '#ef4444', recomendado: false },
      { cenario: 'Almoço (11h–14h)',    impacto: 81, cor: '#ef4444', recomendado: false },
      { cenario: 'Tarde (16h–20h)',     impacto: 94, cor: '#ef4444', recomendado: false },
      { cenario: 'Noite (21h–23h)',     impacto: 58, cor: '#f59e0b', recomendado: false },
    ],
    urgenciaRanking: [
      { local: 'Av. Radial Leste',     tipo: 'Recapeamento',     urgencia: 1, impacto: 94, dataInicio: '2025-07-12' },
      { local: 'Corredor Leste-Oeste', tipo: 'Drenagem',         urgencia: 2, impacto: 87, dataInicio: '2025-07-18' },
      { local: 'Av. Aricanduva',       tipo: 'Pavimentação',     urgencia: 3, impacto: 71, dataInicio: '2025-08-02' },
      { local: 'Vd. Bresser',          tipo: 'Estrutural',       urgencia: 4, impacto: 65, dataInicio: '2025-08-15' },
    ],
    obras: MOCK_DATA.obras.filter(o => ['Brás','Tatuapé','Mooca'].includes(o.bairro))
  },

  oeste: {
    nome: 'Zona Oeste',
    cor: '#ea580c',
    corLight: '#ffedd5',
    icon: 'fa-road',
    descricao: 'Zona Oeste · Marginal Pinheiros, Av. Faria Lima e Raposo Tavares',
    kpis: {
      horarioCritico: '07h–10h / 17h–20h',
      janelaIdeal: '00h–05h (madrugada)',
      congestionamento: 'Crítico',
      impactoEstimado: 82,
      urgencia: 2,
      fluxoMedio: 6380,
      trend: '+3.7%'
    },
    hourlyFlow: [640,420,300,240,270,890,3400,6500,7300,6200,4900,4700,5100,4800,4500,4900,5600,6900,7500,5500,3700,2600,1900,1400],
    windowData: {
      label: 'Janela Ideal — 00h às 05h',
      score: 87,
      motivo: 'Faria Lima e Marginal Pinheiros com volume mínimo. Janela segura para obras de grande porte.'
    },
    congestionamentoHoras: {
      labels: ['00h','04h','08h','12h','16h','20h'],
      values: [14, 9, 89, 71, 88, 49]
    },
    impactSimulation: [
      { cenario: 'Madrugada (00h–05h)', impacto: 7, cor: '#10b981', recomendado: true },
      { cenario: 'Manhã (07h–10h)',     impacto: 89, cor: '#ef4444', recomendado: false },
      { cenario: 'Almoço (11h–14h)',    impacto: 71, cor: '#f59e0b', recomendado: false },
      { cenario: 'Tarde (17h–20h)',     impacto: 88, cor: '#ef4444', recomendado: false },
      { cenario: 'Noite (21h–23h)',     impacto: 49, cor: '#f59e0b', recomendado: false },
    ],
    urgenciaRanking: [
      { local: 'Av. Faria Lima',       tipo: 'Rede elétrica',   urgencia: 1, impacto: 82, dataInicio: '2025-07-20' },
      { local: 'Marginal Pinheiros',   tipo: 'Canalização',     urgencia: 2, impacto: 76, dataInicio: '2025-07-28' },
      { local: 'Av. Raposo Tavares',   tipo: 'Recapeamento',    urgencia: 3, impacto: 58, dataInicio: '2025-08-06' },
      { local: 'Av. Sumaré',           tipo: 'Pavimentação',    urgencia: 4, impacto: 39, dataInicio: '2025-08-18' },
    ],
    obras: MOCK_DATA.obras.filter(o => ['Pinheiros','Barra Funda'].includes(o.bairro))
  },

  paulista: {
    nome: 'Av. Paulista',
    cor: '#dc2626',
    corLight: '#fee2e2',
    icon: 'fa-road',
    descricao: 'Av. Paulista · Corredor mais movimentado de São Paulo — 1,3 milhão de pessoas/dia',
    kpis: {
      horarioCritico: '07h–10h / 17h–20h',
      janelaIdeal: '01h–05h (madrugada)',
      congestionamento: 'Crítico',
      impactoEstimado: 89,
      urgencia: 1,
      fluxoMedio: 7820,
      trend: '+5.2%'
    },
    hourlyFlow: [810,530,380,290,320,1050,4100,7800,8900,7200,5800,5500,6100,5700,5400,5800,6700,8100,8700,6400,4400,3100,2300,1700],
    windowData: {
      label: 'Janela Ideal — 01h às 05h',
      score: 92,
      motivo: 'Único horário com volume abaixo de 10% da média. Via mais crítica da cidade — prioridade máxima para execução noturna.'
    },
    congestionamentoHoras: {
      labels: ['00h','04h','08h','12h','16h','20h'],
      values: [16, 10, 95, 79, 92, 55]
    },
    impactSimulation: [
      { cenario: 'Madrugada (01h–05h)', impacto: 7,  cor: '#10b981', recomendado: true  },
      { cenario: 'Manhã (07h–10h)',     impacto: 95, cor: '#ef4444', recomendado: false },
      { cenario: 'Almoço (11h–14h)',    impacto: 79, cor: '#ef4444', recomendado: false },
      { cenario: 'Tarde (17h–20h)',     impacto: 92, cor: '#ef4444', recomendado: false },
      { cenario: 'Noite (21h–23h)',     impacto: 55, cor: '#f59e0b', recomendado: false },
    ],
    urgenciaRanking: [
      { local: 'Av. Paulista, 1578',   tipo: 'Recapeamento',        urgencia: 1, impacto: 89, dataInicio: '2025-07-10' },
      { local: 'R. da Consolação',     tipo: 'Galeria de drenagem', urgencia: 2, impacto: 88, dataInicio: '2025-07-22' },
      { local: 'Av. 9 de Julho',       tipo: 'Canalização',         urgencia: 3, impacto: 72, dataInicio: '2025-08-10' },
      { local: 'Rua Augusta, 800',     tipo: 'Calçada acessível',   urgencia: 4, impacto: 18, dataInicio: '2025-07-08' },
    ],
    obras: MOCK_DATA.obras.filter(o => ['Bela Vista','Consolação','Cerqueira César','Jardins'].includes(o.bairro))
  }
};

// ── REGION DASHBOARD RENDERER ─────────────────────────────────

function renderRegionalDashboard(regionKey, content) {
  const r = REGIONAL_DATA[regionKey];
  if (!r) return;

  const congCls = { 'Crítico': 'status-critical', 'Atenção': 'status-planned', 'Estável': 'status-completed' }[r.kpis.congestionamento];

  content.innerHTML = `
    <div class="page-title">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="width:42px;height:42px;border-radius:10px;background:${r.cor}18;display:flex;align-items:center;justify-content:center;">
          <i class="fa-solid ${r.icon}" style="color:${r.cor};font-size:18px;"></i>
        </div>
        <div>
          <h1 style="display:flex;align-items:center;gap:10px;">
            ${r.nome}
            <span class="status-pill ${congCls}" style="font-size:12px;">${r.kpis.congestionamento}</span>
          </h1>
          <p class="subtitle">${r.descricao}</p>
        </div>
      </div>
      <div style="display:flex;gap:10px;">
        <button class="btn-primary" id="refreshBtn">
          <i class="fa-solid fa-rotate-right"></i> Atualizar
        </button>
      </div>
    </div>

    <!-- KPI GRID REGIONAL -->
    <section class="kpi-grid">
      <div class="kpi-card" style="border-top:3px solid #ef4444;">
        <div class="kpi-icon" style="background:#fee2e2;"><i class="fa-solid fa-clock" style="color:#ef4444;"></i></div>
        <div class="kpi-info">
          <span class="kpi-label">Horário Crítico</span>
          <span class="kpi-value" style="font-size:16px;">${r.kpis.horarioCritico}</span>
          <span class="kpi-unit">Evitar obras neste período</span>
        </div>
        <div class="kpi-trend down"><i class="fa-solid fa-triangle-exclamation"></i> Crítico</div>
      </div>
      <div class="kpi-card" style="border-top:3px solid #10b981;">
        <div class="kpi-icon window"><i class="fa-solid fa-calendar-check"></i></div>
        <div class="kpi-info">
          <span class="kpi-label">Janela Ideal</span>
          <span class="kpi-value" style="font-size:15px;">${r.kpis.janelaIdeal}</span>
          <span class="kpi-unit">Melhor horário para obras</span>
        </div>
        <div class="kpi-trend up"><i class="fa-solid fa-check"></i> Recomendado</div>
      </div>
      <div class="kpi-card" style="border-top:3px solid #10b981;">
        <div class="kpi-icon" style="background:#d1fae5;"><i class="fa-solid fa-car" style="color:#10b981;"></i></div>
        <div class="kpi-info">
          <span class="kpi-label">Fluxo Médio</span>
          <span class="kpi-value" id="kpiFluxoRegional">—</span>
          <span class="kpi-unit">Veículos/h · Média histórica</span>
        </div>
        <div class="kpi-trend ${r.kpis.trend.startsWith('+') ? 'up' : 'down'}">
          <i class="fa-solid fa-arrow-trend-${r.kpis.trend.startsWith('+') ? 'up' : 'down'}"></i> ${r.kpis.trend} vs. mês anterior
        </div>
      </div>
      <div class="kpi-card" style="border-top:3px solid #10b981;">
        <div class="kpi-icon window"><i class="fa-solid fa-calendar-days"></i></div>
        <div class="kpi-info">
          <span class="kpi-label">Melhor dia para obra</span>
          <span class="kpi-value" id="kpiBestDayRegional" style="font-size:16px;">—</span>
          <span class="kpi-unit">Menor volume histórico semanal</span>
        </div>
        <div class="kpi-trend up"><i class="fa-solid fa-check"></i> Recomendado</div>
      </div>
    </section>

    <!-- CHARTS GRID REGIONAL -->
    <section class="charts-grid">

      <!-- Fluxo por hora -->
      <div class="chart-card wide">
        <div class="chart-header">
          <div>
            <h3>Fluxo de Veículos por Horário — ${r.nome}</h3>
            <p>Volume médio histórico · Áreas vermelhas = horário crítico</p>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="display:inline-flex;align-items:center;gap:5px;font-size:12px;color:var(--text-muted);">
              <span style="width:12px;height:12px;background:rgba(239,68,68,0.15);border-radius:2px;display:inline-block;"></span>Pico crítico
            </span>
            <span style="display:inline-flex;align-items:center;gap:5px;font-size:12px;color:#10b981;">
              <span style="width:12px;height:12px;background:rgba(16,185,129,0.15);border-radius:2px;display:inline-block;"></span>Janela ideal
            </span>
          </div>
        </div>
        <div class="chart-body"><canvas id="chartRegionalFlow"></canvas></div>
      </div>

      <!-- Congestionamento por faixa horária -->
      <div class="chart-card">
        <div class="chart-header">
          <div><h3>Média de Congestionamento</h3><p>Nível por velocidade média registrada</p></div>
        </div>
        <div class="chart-body"><canvas id="chartCong"></canvas></div>
      </div>

      <!-- Score de impacto por janela -->
      <div class="chart-card slim">
        <div class="chart-header">
          <div>
            <h3>Janela Ideal para Obras</h3>
            <p>Impacto ao tráfego por período · Verde = recomendado</p>
          </div>
        </div>
        <div class="chart-body" style="min-height:0;flex:1;display:flex;flex-direction:column;gap:6px;padding:0 2px;">
          <!-- Score row -->
          <div style="display:flex;align-items:center;gap:10px;padding:4px 0 8px;border-bottom:1px solid #f1f5f9;flex-shrink:0;">
            <div style="width:46px;height:46px;border-radius:50%;background:conic-gradient(#10b981 ${r.windowData.score * 3.6}deg, #f1f5f9 0deg);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <div style="width:34px;height:34px;border-radius:50%;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;">
                <span style="font-size:12px;font-weight:800;color:#10b981;line-height:1;">${r.windowData.score}</span>
                <span style="font-size:8px;color:#94a3b8;line-height:1;">score</span>
              </div>
            </div>
            <div style="min-width:0;">
              <div style="font-size:12px;font-weight:700;color:#059669;">✓ ${r.kpis.janelaIdeal}</div>
              <div style="font-size:10px;color:#64748b;margin-top:1px;line-height:1.3;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${r.windowData.motivo}</div>
            </div>
          </div>
          <!-- Períodos visuais -->
          <div style="display:flex;flex-direction:column;gap:4px;flex:1;justify-content:space-around;">
            ${r.impactSimulation.map(p => {
              const textColor = p.recomendado ? '#059669' : (p.impacto >= 70 ? '#dc2626' : '#d97706');
              return `<div style="display:flex;align-items:center;gap:6px;">
                <div style="width:95px;font-size:9px;font-weight:${p.recomendado ? '700' : '500'};color:${textColor};flex-shrink:0;line-height:1.2;">${p.recomendado ? '★ ' : ''}${p.cenario}</div>
                <div style="flex:1;background:#f1f5f9;border-radius:3px;height:14px;position:relative;overflow:hidden;">
                  <div style="width:${p.impacto}%;height:100%;background:${p.cor};opacity:${p.recomendado ? '1' : '0.7'};"></div>
                  <span style="position:absolute;right:4px;top:50%;transform:translateY(-50%);font-size:9px;font-weight:700;color:${p.impacto > 50 ? '#fff' : '#64748b'};">${p.impacto}%</span>
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>
    </section>

   

    <!-- RANKING DE URGÊNCIA -->
    <section class="table-section">
      <div class="section-header">
        <div>
          <h2>Ranking de Urgência — Obras</h2>
          <p>Obras ordenadas por prioridade de execução · ${r.nome}</p>
        </div>
      </div>
      <div class="table-wrapper">
        <table class="data-table" style="min-width:600px;">
          <thead>
            <tr>
              <th style="width:60px;">Prio.</th>
              <th>Localização</th>
              <th>Tipo</th>
              <th style="width:100px;">Início</th>
              <th style="width:120px;">Impacto</th>
              <th style="width:90px;">Urgência</th>
              <th style="width:110px;">Melhor Hora</th>
              <th style="width:80px;">Ação</th>
            </tr>
          </thead>
          <tbody>
            ${r.urgenciaRanking.map(obra => {
              const urgColors = ['#ef4444','#f59e0b','#f59e0b','#10b981'];
              const urgLabels = ['URGENTE','ALTA','MÉDIA','BAIXA'];
              const urgBgs    = ['#fee2e2','#fef3c7','#fef3c7','#d1fae5'];
              const ic = obra.impacto >= 70 ? '#ef4444' : obra.impacto >= 40 ? '#f59e0b' : '#10b981';
              const uc = urgColors[obra.urgencia - 1];
              const ul = urgLabels[obra.urgencia - 1];
              const ub = urgBgs[obra.urgencia - 1];
              const dataStr = obra.dataInicio ? formatDate(obra.dataInicio) : '—';
              const janela = r.kpis.janelaIdeal.replace(' (madrugada)','').replace(' (tarde)','').replace(' (noite)','');
              return `
              <tr>
                <td>
                  <div style="width:32px;height:32px;border-radius:8px;background:${ub};color:${uc};font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;">${obra.urgencia}°</div>
                </td>
                <td>
                  <div style="font-weight:600;font-size:13px;color:var(--text-primary);">${obra.local}</div>
                  <div style="font-size:11px;color:var(--text-muted);margin-top:1px;">${obra.tipo}</div>
                </td>
                <td style="font-size:12px;color:var(--text-secondary);display:none;">${obra.tipo}</td>
                <td style="font-size:12px;color:var(--text-secondary);white-space:nowrap;">${dataStr}</td>
                <td>
                  <div style="display:flex;align-items:center;gap:6px;">
                    <div style="flex:1;height:5px;background:#f1f5f9;border-radius:99px;overflow:hidden;min-width:50px;">
                      <div style="width:${obra.impacto}%;height:100%;background:${ic};border-radius:99px;"></div>
                    </div>
                    <span style="font-size:12px;font-weight:600;color:${ic};min-width:28px;">${obra.impacto}%</span>
                  </div>
                </td>
                <td>
                  <span style="display:inline-block;padding:3px 8px;border-radius:99px;font-size:10px;font-weight:700;background:${ub};color:${uc};white-space:nowrap;">${ul}</span>
                </td>
                <td>
                  <span style="display:inline-flex;align-items:center;gap:4px;color:#059669;font-weight:600;font-size:12px;white-space:nowrap;">
                    <i class="fa-solid fa-moon" style="font-size:10px;"></i>${janela}
                  </span>
                </td>
                <td>
                  <button class="ver-obra-btn" onclick="goToObraPlanning('${obra.local.replace(/'/g, "\\'")}')">
                    <i class="fa-solid fa-helmet-safety"></i> Ver
                  </button>
                </td>
              </tr>`
            }).join('')}
          </tbody>
        </table>
      </div>
    </section>`;

  // Animate KPI
  animateCount('kpiFluxoRegional', 0, r.kpis.fluxoMedio, 900, v => v.toLocaleString('pt-BR'));

  // Melhor dia para obra — menor volume semanal
  const weekLabels = MOCK_DATA.dailyFlow.labels;
  const weekValues = MOCK_DATA.dailyFlow.values;
  const minIdx = weekValues.indexOf(Math.min(...weekValues));
  const bestDayEl = document.getElementById('kpiBestDayRegional');
  if (bestDayEl) {
    bestDayEl.innerHTML =
      `<span style="display:block;font-size:26px;font-weight:800;line-height:1;color:#10b981;">${weekLabels[minIdx]}</span>` +
      `<span style="display:block;font-size:11px;font-weight:500;color:var(--text-muted);line-height:1.4;">${weekValues[minIdx].toLocaleString('pt-BR')} veículos/dia</span>`;
  }

  // Initialize charts
  setTimeout(() => {
    initRegionalCharts(r);
  }, 50);

  // Refresh button
  document.getElementById('refreshBtn')?.addEventListener('click', function() {
    const icon = this.querySelector('i');
    icon.classList.add('spinning');
    setTimeout(() => icon.classList.remove('spinning'), 900);
  });
}

function initRegionalCharts(r) {
  Chart.defaults.font.family = "'DM Sans', sans-serif";
  Chart.defaults.color = '#94a3b8';

  // ── Flow chart with critical/ideal zones ──
  const flowCtx = document.getElementById('chartRegionalFlow')?.getContext('2d');
  if (flowCtx) {
    const flowColor = r.kpis.congestionamento === 'Crítico' ? '#ef4444' : r.kpis.congestionamento === 'Atenção' ? '#f59e0b' : '#10b981';
    const grad = flowCtx.createLinearGradient(0, 0, 0, 220);
    grad.addColorStop(0, `${flowColor}30`);
    grad.addColorStop(1, `${flowColor}00`);

    const criticalZonePlugin = {
      id: 'criticalZone',
      beforeDraw: (chart) => {
        const { ctx, chartArea: { top, bottom }, scales: { x } } = chart;
        ctx.save();
        // Critical zones
        [[6,9],[16,19]].forEach(([s,e]) => {
          ctx.fillStyle = 'rgba(239,68,68,0.10)';
          ctx.fillRect(x.getPixelForValue(s), top, x.getPixelForValue(e) - x.getPixelForValue(s), bottom - top);
        });
        // Ideal window
        ctx.fillStyle = 'rgba(16,185,129,0.08)';
        ctx.fillRect(x.getPixelForValue(0), top, x.getPixelForValue(5) - x.getPixelForValue(0), bottom - top);
        ctx.restore();
      }
    };

    new Chart(flowCtx, {
      type: 'line',
      plugins: [criticalZonePlugin],
      data: {
        labels: ["00h","01h","02h","03h","04h","05h","06h","07h","08h","09h","10h","11h","12h","13h","14h","15h","16h","17h","18h","19h","20h","21h","22h","23h"],
        datasets: [{ label: 'Veículos/h', data: r.hourlyFlow, borderColor: flowColor, backgroundColor: grad, fill: true, tension: 0.4, pointRadius: 0, pointHoverRadius: 5, borderWidth: 2.5 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0f172a', bodyColor: '#fff', callbacks: { label: ctx => ` ${ctx.parsed.y.toLocaleString('pt-BR')} veículos/h` } } },
        scales: {
          x: { grid: { display: false }, border: { display: false } },
          y: { grid: { color: '#f1f5f9' }, border: { display: false }, ticks: { callback: v => v >= 1000 ? (v/1000).toFixed(1)+'k' : v } }
        }
      }
    });
  }

  // ── Congestionamento bar chart ──
  const congCtx = document.getElementById('chartCong')?.getContext('2d');
  if (congCtx) {
    const cd = r.congestionamentoHoras;
    new Chart(congCtx, {
      type: 'bar',
      data: {
        labels: cd.labels,
        datasets: [{
          label: 'Congestionamento (%)',
          data: cd.values,
          backgroundColor: cd.values.map(v => v >= 70 ? '#ef4444' : v >= 40 ? '#f59e0b' : '#10b981'),
          borderRadius: 6, borderSkipped: false
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0f172a', callbacks: { label: ctx => ` ${ctx.parsed.y}% congestionamento` } } },
        scales: {
          x: { grid: { display: false }, border: { display: false } },
          y: { max: 100, grid: { color: '#f1f5f9' }, border: { display: false }, ticks: { callback: v => v+'%' } }
        }
      }
    });
  }

  // ── (Janela score now rendered as inline HTML, no canvas needed) ──

  // ── Impacto por período horizontal bar ──
  const impactCtx = document.getElementById('chartImpact')?.getContext('2d');
  if (impactCtx) {
    new Chart(impactCtx, {
      type: 'bar',
      data: {
        labels: r.impactSimulation.map(i => i.cenario),
        datasets: [{
          label: 'Impacto (%)',
          data: r.impactSimulation.map(i => i.impacto),
          backgroundColor: r.impactSimulation.map(i => i.recomendado ? '#10b981' : i.cor + 'CC'),
          borderRadius: 6, borderSkipped: false,
          borderWidth: r.impactSimulation.map(i => i.recomendado ? 2 : 0),
          borderColor: r.impactSimulation.map(i => i.recomendado ? '#059669' : 'transparent'),
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0f172a', callbacks: { label: ctx => ` ${ctx.parsed.x}% de impacto ao tráfego` } } },
        scales: {
          x: { max: 100, grid: { color: '#f1f5f9' }, border: { display: false }, ticks: { callback: v => v+'%' } },
          y: { grid: { display: false }, border: { display: false } }
        }
      }
    });
  }
}

window.exportRegionalReport = function(regionKey) {
  const r = REGIONAL_DATA[regionKey];
  alert(`Exportando relatório da ${r.nome}...\n\nFuncionalidade disponível na versão Pro.`);
};

// ── BACK BUTTON ─────────────────────────────────────────────
window.handleBackBtn = function() {
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  const dashNav = document.querySelector('.nav-item[data-page="dashboard"]');
  if (dashNav) dashNav.classList.add('active');
  loadPage('dashboard');
};

// ── EXIT TO LANDING PAGE ─────────────────────────────────────
window.handleExitToLanding = function() {
  // In a real app this would navigate to the landing/login page.
  // For the prototype, show a brief confirmation overlay.
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position:fixed;inset:0;background:rgba(15,23,42,0.85);
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    z-index:9999;gap:20px;`;
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:16px;padding:32px 40px;text-align:center;max-width:360px;box-shadow:0 24px 64px rgba(0,0,0,0.25);">
      <div style="width:52px;height:52px;background:#dbeafe;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
        <i class="fa-solid fa-arrow-left" style="color:#2563eb;font-size:20px;"></i>
      </div>
      <h3 style="font-size:18px;font-weight:700;color:#0f172a;margin-bottom:8px;">Sair da plataforma?</h3>
      <p style="font-size:13px;color:#64748b;margin-bottom:24px;line-height:1.5;">Você será redirecionado para a página inicial do NewRoad.</p>
      <div style="display:flex;gap:10px;justify-content:center;">
        <button onclick="this.closest('div').parentElement.parentElement.remove()"
          style="padding:10px 20px;border-radius:8px;border:1px solid #e2e8f0;background:#f8fafc;color:#64748b;font-size:13px;font-weight:600;cursor:pointer;">
          Cancelar
        </button>
       <button onclick="window.location.href = '../index.html';"
      style="padding:10px 20px;border-radius:8px;border:none;background:#2563eb;color:#fff;font-size:13px;font-weight:600;cursor:pointer;">
      <i class="fa-solid fa-arrow-left" style="margin-right:6px;"></i>Confirmar saída
    </button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
};

// ── NAVIGATE TO OBRAS PLANNING ─────────────────────────────────
window.goToObraPlanning = function(localObra) {
  // Navigate to obras page
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  const obrasNav = document.querySelector('.nav-item[data-page="obras"]');
  if (obrasNav) obrasNav.classList.add('active');
  loadPage('obras');

  // After page loads, search for the obra
  setTimeout(() => {
    const searchInput = document.getElementById('obrasTableSearch');
    if (searchInput && localObra) {
      // Use first significant word(s) for a reliable match
      const searchTerm = localObra.split(',')[0].trim();
      searchInput.value = searchTerm;
      window.filterObrasTable();
    }
    // Scroll to table
    const table = document.querySelector('.table-section');
    if (table) table.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 350);
};

// ══════════════════════════════════════════════════════════════
//  OBRAS PLANNING PAGE
// ══════════════════════════════════════════════════════════════

// Obras carregadas via API (GET /obras). Os campos retornam com mesmo shape
// dos antigos mocks para preservar todos os renders/filtros já existentes.
let OBRAS_CADASTRADAS = [];

async function loadObras() {
  try {
    OBRAS_CADASTRADAS = await apiFetch('/obras') || [];
    // Mantém o array do dashboard principal sincronizado (MOCK_DATA.obras
    // é lido por outras telas; duracao precisa virar string "X dias").
    if (window.MOCK_DATA && Array.isArray(window.MOCK_DATA.obras)) {
      window.MOCK_DATA.obras = OBRAS_CADASTRADAS.map(function (o) {
        return Object.assign({}, o, { duracao: o.duracao + ' dias' });
      });
    }
  } catch (e) {
    console.error('Falha ao carregar obras:', e);
    OBRAS_CADASTRADAS = [];
  }
}

// Calendar data — day quality for construction
const CALENDAR_DATA = {
  // day index => { quality: 'green'|'yellow'|'red', clima, eventos, obs }
  1: { quality:'green', clima:'Ensolarado 24°C', eventos:[], obs:'Ótimo dia — baixo fluxo previsto' },
  2: { quality:'green', clima:'Parcialmente nublado 22°C', eventos:[], obs:'Bom dia para obras' },
  3: { quality:'yellow', clima:'Chuva leve 19°C', eventos:[], obs:'Chuva pode atrasar asfalto' },
  4: { quality:'red', clima:'Temporal previsto 17°C', eventos:['Show no Anhembi — 40k pessoas'], obs:'Tráfego intenso, chuva forte' },
  5: { quality:'red', clima:'Nublado 21°C', eventos:['Jogo Corinthians x Flamengo — Morumbi'], obs:'Alta movimentação no entorno' },
  6: { quality:'green', clima:'Ensolarado 26°C', eventos:[], obs:'Fim de semana — baixo fluxo comercial' },
  7: { quality:'green', clima:'Ensolarado 27°C', eventos:[], obs:'Domingo — ótima janela noturna' },
  8: { quality:'yellow', clima:'Nublado 20°C', eventos:['Maratona SP — Rota Centro'], obs:'Algumas vias fechadas' },
  9: { quality:'green', clima:'Ensolarado 25°C', eventos:[], obs:'Bom dia para obras de grande porte' },
  10: { quality:'green', clima:'Ensolarado 23°C', eventos:[], obs:'Janela ideal: 01h–05h' },
  11: { quality:'red', clima:'Chuva 18°C', eventos:['Festival Lollapalooza — dia 1'], obs:'Tráfego crítico + chuva' },
  12: { quality:'red', clima:'Chuva intensa 16°C', eventos:['Festival Lollapalooza — dia 2'], obs:'Evitar obras — alto impacto' },
  13: { quality:'yellow', clima:'Parcialmente nublado 22°C', eventos:['Festival Lollapalooza — dia 3'], obs:'Evento ainda ativo, chuva passando' },
  14: { quality:'green', clima:'Ensolarado 28°C', eventos:[], obs:'Pós-festival — fluxo normalizado' },
  15: { quality:'green', clima:'Ensolarado 26°C', eventos:[], obs:'Ótima janela para pavimentação' },
  16: { quality:'yellow', clima:'Nublado 21°C', eventos:[], obs:'Possibilidade de chuva à tarde' },
  17: { quality:'yellow', clima:'Garoa 20°C', eventos:[], obs:'Umidade pode afetar asfalto' },
  18: { quality:'green', clima:'Ensolarado 24°C', eventos:[], obs:'Bom dia, fluxo normal' },
  19: { quality:'red', clima:'Nublado 22°C', eventos:['Jogo São Paulo FC — Morumbi'], obs:'Região sul com tráfego elevado' },
  20: { quality:'green', clima:'Ensolarado 25°C', eventos:[], obs:'Fim de semana tranquilo' },
  21: { quality:'green', clima:'Ensolarado 27°C', eventos:[], obs:'Ótimo para obras de grande porte' },
  22: { quality:'yellow', clima:'Variável 23°C', eventos:[], obs:'Tráfego normal, possível garoa' },
  23: { quality:'green', clima:'Ensolarado 24°C', eventos:[], obs:'Bom dia — janela: 00h–05h' },
  24: { quality:'green', clima:'Ensolarado 26°C', eventos:[], obs:'Bom dia para obras' },
  25: { quality:'red', clima:'Temporal 15°C', eventos:['Show The Weekend — Allianz Parque'], obs:'Temporal + show — evitar obras' },
  26: { quality:'yellow', clima:'Chuva leve 18°C', eventos:[], obs:'Chuva pela manhã' },
  27: { quality:'green', clima:'Ensolarado 25°C', eventos:[], obs:'Bom dia pós-chuva' },
  28: { quality:'green', clima:'Ensolarado 26°C', eventos:[], obs:'Ótima janela noturna' },
  29: { quality:'yellow', clima:'Nublado 21°C', eventos:[], obs:'Fluxo médio, nublado' },
  30: { quality:'green', clima:'Ensolarado 27°C', eventos:[], obs:'Ótimo para obras — baixo volume' },
  31: { quality:'green', clima:'Ensolarado 28°C', eventos:[], obs:'Excelente janela para pavimentação' },
};

const EXTERNAL_FACTORS = [
  { faIcon:'fa-solid fa-cloud-bolt', iconBg:'#dbeafe', iconColor:'#1d4ed8', name:'Temporal previsto', desc:'Dias 4, 25 — Inviabiliza obras de asfalto', impact:'alto', impactCls:'factor-high' },
  { faIcon:'fa-solid fa-futbol', iconBg:'#fef3c7', iconColor:'#d97706', name:'Jogos de futebol', desc:'Dias 5, 19 — Morumbi e Corinthians Arena', impact:'alto', impactCls:'factor-high' },
  { faIcon:'fa-solid fa-music', iconBg:'#ede9fe', iconColor:'#7c3aed', name:'Shows e festivais', desc:'Dias 4, 11–13, 25 — Centro, Allianz Parque', impact:'médio', impactCls:'factor-medium' },
  { faIcon:'fa-solid fa-person-running', iconBg:'#d1fae5', iconColor:'#059669', name:'Maratona SP', desc:'Dia 8 — Rota pelo Centro histórico', impact:'médio', impactCls:'factor-medium' },
  { faIcon:'fa-solid fa-cloud-rain', iconBg:'#f0f9ff', iconColor:'#0284c7', name:'Chuvas de inverno', desc:'Previsão abaixo da média. Alguns dias afetados', impact:'baixo', impactCls:'factor-low' },
  { faIcon:'fa-solid fa-train-subway', iconBg:'#f8fafc', iconColor:'#475569', name:'Manutenção Metro L4', desc:'Fins de semana — maior uso de superfície', impact:'baixo', impactCls:'factor-low' },
];

let obrasCalendarMonth = 4; // April
let obrasCalendarYear = 2026;
let obrasMiniMap = null;

function getBestDayForRegion() {
  const regionEl = document.getElementById('filterRegion');
  const region = regionEl ? regionEl.value : 'all';

  const monthNames = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const monthLabel = monthNames[obrasCalendarMonth - 1];

  // Find green Sundays in the calendar month — Sundays = col 0 in the grid (Dom)
  const greenSundays = Object.entries(CALENDAR_DATA)
    .filter(([d, data]) => {
      if (data.quality !== 'green') return false;
      const dayNum = parseInt(d);
      const date = new Date(obrasCalendarYear, obrasCalendarMonth - 1, dayNum);
      return date.getDay() === 0; // 0 = Sunday
    })
    .map(([d]) => parseInt(d));

  // Fallback: any green day if no green Sunday found
  const greenDays = Object.entries(CALENDAR_DATA)
    .filter(([d, data]) => data.quality === 'green')
    .map(([d]) => parseInt(d));

  let bestDay;
  if (greenSundays.length) {
    bestDay = Math.min(...greenSundays);
  } else if (greenDays.length) {
    bestDay = Math.min(...greenDays);
  } else {
    bestDay = '—';
  }

  const regionLabels = {
    all: 'Todas as regiões', centro: 'Centro', paulista: 'Av. Paulista',
    norte: 'Zona Norte', sul: 'Zona Sul', leste: 'Zona Leste', oeste: 'Zona Oeste'
  };

  return {
    day: bestDay !== '—' ? `Dom, ${bestDay}/${monthLabel}` : '—',
    region: regionLabels[region] || 'Todas as regiões',
    window: '01h–05h'
  };
}

async function renderObrasPage(content) {
  await loadObras();
  const total = OBRAS_CADASTRADAS.length;
  const emAndamento = OBRAS_CADASTRADAS.filter(o => o.status === 'ongoing').length;
  const criticas = OBRAS_CADASTRADAS.filter(o => o.impacto >= 70 && o.status !== 'completed').length;
  const best = getBestDayForRegion();

  content.innerHTML = `
    <div class="page-title">
      <div>
        <h1>Planejamento de Obras</h1>
        <p class="subtitle">Cadastro, calendário e fatores externos · São Paulo</p>
      </div>
      <button class="btn-primary" onclick="openNewObraForm()">
        <i class="fa-solid fa-plus"></i> Nova Obra
      </button>
    </div>

    <!-- HEADER KPIs - Visão Rápida -->
    <section class="obras-kpi-grid">
      <div class="obras-kpi-card" data-color="blue">
        <div class="obras-kpi-icon" style="background:#dbeafe;color:#1d4ed8;">
          <i class="fa-solid fa-helmet-safety"></i>
        </div>
        <div class="obras-kpi-info">
          <span class="obras-kpi-label">Total Planejadas</span>
          <span class="obras-kpi-value">${total}</span>
          <span class="obras-kpi-sub">obras cadastradas</span>
        </div>
      </div>
      <div class="obras-kpi-card" data-color="amber">
        <div class="obras-kpi-icon" style="background:#fef3c7;color:#d97706;">
          <i class="fa-solid fa-rotate"></i>
        </div>
        <div class="obras-kpi-info">
          <span class="obras-kpi-label">Em Andamento</span>
          <span class="obras-kpi-value">${emAndamento}</span>
          <span class="obras-kpi-sub">obras ativas agora</span>
        </div>
      </div>
      <div class="obras-kpi-card" data-color="red">
        <div class="obras-kpi-icon" style="background:#fee2e2;color:#dc2626;">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <div class="obras-kpi-info">
          <span class="obras-kpi-label">Críticas</span>
          <span class="obras-kpi-value" style="color:#dc2626;">${criticas}</span>
          <span class="obras-kpi-sub">impacto &ge; 70%</span>
        </div>
      </div>
      <div class="obras-kpi-card" data-color="green">
        <div class="obras-kpi-icon" style="background:#d1fae5;color:#059669;">
          <i class="fa-solid fa-calendar-check"></i>
        </div>
        <div class="obras-kpi-info">
          <span class="obras-kpi-label">Melhor Dia</span>
          <span class="obras-kpi-value" style="font-size:14px;">${best.day}</span>
          <span class="obras-kpi-sub">${best.region} · ${best.window}</span>
        </div>
      </div>
    </section>

    <div class="obras-layout">

      <!-- MAIN COLUMN -->
      <div class="obras-main">

        <!-- FORM DE CADASTRO -->
        <div class="register-card" id="obraFormCard" style="display:none;">
          <div class="register-header">
            <h2><i class="fa-solid fa-helmet-safety" style="color:var(--brand-blue);margin-right:8px;"></i>Cadastrar Nova Obra</h2>
            <button class="btn-outline" onclick="closeNewObraForm()"><i class="fa-solid fa-xmark"></i> Fechar</button>
          </div>
          <div class="register-body">
            <div class="form-row">
              <div class="form-group">
                <label>Localização / Endereço</label>
                <input type="text" id="obraLocal" class="form-input" placeholder="Ex: Av. Paulista, 1578"/>
              </div>
              <div class="form-group">
                <label>Bairro / Zona</label>
                <select id="obraBairro" class="form-input">
                  <option>Bela Vista</option><option>Centro</option><option>Consolação</option>
                  <option>Brás</option><option>Pinheiros</option><option>Jardins</option>
                  <option>República</option><option>Barra Funda</option><option>Santana</option>
                  <option>Outro</option>
                </select>
              </div>
            </div>
            <div class="form-row-3">
              <div class="form-group">
                <label>Tipo de Obra</label>
                <select id="obraTipo" class="form-input">
                  <option>Recapeamento</option><option>Pavimentação</option>
                  <option>Galeria de drenagem</option><option>Estrutural</option>
                  <option>Sinalização viária</option><option>Rede elétrica</option>
                  <option>Calçada acessível</option><option>Canalização</option>
                  <option>Inspeção estrutural</option>
                </select>
              </div>
              <div class="form-group">
                <label>Data de Início</label>
                <input type="date" id="obraDataInicio" class="form-input"/>
              </div>
              <div class="form-group">
                <label>Duração (dias)</label>
                <input type="number" id="obraDuracao" class="form-input" placeholder="Ex: 15" min="1"/>
              </div>
            </div>
            <div class="form-row-3">
              <div class="form-group">
                <label>Impacto Estimado (%)</label>
                <input type="number" id="obraImpacto" class="form-input" placeholder="0–100" min="0" max="100"/>
              </div>
              <div class="form-group">
                <label>Status</label>
                <select id="obraStatus" class="form-input">
                  <option value="planned">Planejada</option>
                  <option value="ongoing">Em andamento</option>
                  <option value="completed">Concluída</option>
                </select>
              </div>
              <div class="form-group">
                <label>Grau de Urgência (máx. dias)</label>
                <input type="number" id="obraUrgencia" class="form-input" placeholder="Ex: 30" min="1"/>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Latitude</label>
                <input type="number" id="obraLat" class="form-input" placeholder="-23.5505" step="0.0001"/>
              </div>
              <div class="form-group">
                <label>Longitude</label>
                <input type="number" id="obraLng" class="form-input" placeholder="-46.6333" step="0.0001"/>
              </div>
            </div>
            <div class="form-group">
              <label>Mini Mapa — Selecione a localização</label>
              <div class="mini-map-container" id="obraMiniMap"></div>
              <p style="font-size:11px;color:var(--text-muted);margin-top:4px;"><i class="fa-solid fa-info-circle"></i> Clique no mapa para definir a localização da obra</p>
            </div>
            <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:4px;">
              <button class="btn-outline" onclick="closeNewObraForm()">Cancelar</button>
              <button class="btn-primary" onclick="saveNewObra()">
                <i class="fa-solid fa-floppy-disk"></i> Salvar Obra
              </button>
            </div>
          </div>
        </div>

        <!-- TABLE -->
        <section class="table-section">
          <div class="section-header">
            <div><h2>Obras Planejadas e em Andamento</h2><p>Gerencie todas as intervenções viárias</p></div>
            <div class="table-controls">
              <input class="table-search" type="text" placeholder="Filtrar obras…" id="obrasTableSearch" oninput="filterObrasTable()"/>
              <select class="filter-select" id="obrasStatusFilter" onchange="filterObrasTable()">
                <option value="">Todos os status</option>
                <option value="planned">Planejada</option>
                <option value="ongoing">Em andamento</option>
                <option value="completed">Concluída</option>
              </select>
            </div>
          </div>
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Localização</th><th>Tipo</th><th>Início</th><th>Duração</th>
                  <th>Impacto</th><th>Status</th><th>Urgência (máx.)</th><th>Ações</th>
                </tr>
              </thead>
              <tbody id="obrasTableBody"></tbody>
            </table>
          </div>
        </section>

      </div><!-- end obras-main -->

      <!-- SIDE COLUMN -->
      <div class="obras-side">

        <!-- CALENDAR -->
        <div class="calendar-card">
          <div class="calendar-header">
            <h3><i class="fa-solid fa-calendar-days" style="color:var(--brand-blue);margin-right:6px;"></i>Calendário de Obras</h3>
            <div class="cal-nav">
              <button class="cal-nav-btn" onclick="calNav(-1)"><i class="fa-solid fa-chevron-left"></i></button>
              <button class="cal-nav-btn" onclick="calNav(1)"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
          </div>
          <p class="calendar-month-label" id="calMonthLabel"></p>
          <div class="calendar-grid-wrapper">
            <div class="calendar-grid" id="calGrid">
              <div class="cal-day-header">Dom</div>
              <div class="cal-day-header">Seg</div>
              <div class="cal-day-header">Ter</div>
              <div class="cal-day-header">Qua</div>
              <div class="cal-day-header">Qui</div>
              <div class="cal-day-header">Sex</div>
              <div class="cal-day-header">Sáb</div>
            </div>
          </div>
          <div class="cal-legend">
            <div class="cal-legend-item"><span class="cal-dot cal-dot-green"></span>Indicado</div>
            <div class="cal-legend-item"><span class="cal-dot cal-dot-yellow"></span>Atenção</div>
            <div class="cal-legend-item"><span class="cal-dot cal-dot-red"></span>Evitar</div>
            <div class="cal-legend-item"><span class="cal-dot" style="background:#a855f7;"></span>Evento</div>
          </div>
        </div>

        <!-- EVENT MODAL (inline) -->
        <div class="event-modal-card" id="eventModalCard" style="display:none;">
          <div class="event-modal-header">
            <h4 id="eventModalTitle">Eventos — Dia</h4>
            <button onclick="closeEventModal()" style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:16px;"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div id="eventModalBody"></div>
          <div style="margin-top:10px;padding-top:10px;border-top:1px solid #f1f5f9;">
            <p style="font-size:11px;font-weight:600;color:var(--text-secondary);margin-bottom:6px;">ADICIONAR EVENTO</p>
            <input type="text" id="newEventText" class="form-input" placeholder="Descreva o evento…" style="margin-bottom:6px;"/>
            <button class="btn-primary" style="width:100%;justify-content:center;" onclick="addCalendarEvent()">
              <i class="fa-solid fa-plus"></i> Adicionar
            </button>
          </div>
        </div>


        </div>

      </div><!-- end obras-side -->
    </div>

    <!-- Calendar Tooltip -->
    <div class="cal-tooltip" id="calTooltip"></div>

    <!-- Edit Obra Modal -->
    <div class="edit-obra-overlay" id="editObraModal" style="display:none;" onclick="if(event.target===this)closeEditModal()">
      <div class="modal-card">
        <div class="register-header">
          <h2><i class="fa-solid fa-pen-to-square" style="color:var(--brand-blue);margin-right:8px;"></i>Editar Obra</h2>
          <button class="btn-outline" onclick="closeEditModal()"><i class="fa-solid fa-xmark"></i> Fechar</button>
        </div>
        <div class="register-body" id="editObraBody"></div>
      </div>
    </div>
  `;

  // Init calendar
  renderObrasCalendar();
  // Init table
  renderObrasTable(OBRAS_CADASTRADAS);
  // Init fixed obras map

}


function renderObrasCalendar() {
  const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const label = document.getElementById('calMonthLabel');
  if (label) label.textContent = `${monthNames[obrasCalendarMonth - 1]} ${obrasCalendarYear}`;

  const grid = document.getElementById('calGrid');
  if (!grid) return;

  // Clear existing days (keep headers)
  const headers = grid.querySelectorAll('.cal-day-header');
  grid.innerHTML = '';
  headers.forEach(h => grid.appendChild(h.cloneNode(true)));

  // Days in month
  const firstDay = new Date(obrasCalendarYear, obrasCalendarMonth - 1, 1).getDay();
  const daysInMonth = new Date(obrasCalendarYear, obrasCalendarMonth, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getMonth() + 1 === obrasCalendarMonth && today.getFullYear() === obrasCalendarYear;

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'cal-day empty';
    grid.appendChild(empty);
  }

  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(obrasCalendarYear, obrasCalendarMonth - 1, d);
    const isSunday = date.getDay() === 0;
    const data = CALENDAR_DATA[d] || { quality: isSunday ? 'green' : 'neutral', clima: '—', eventos: [], obs: isSunday ? 'Domingo — Baixo volume histórico' : '' };
    // Sundays default to green if not explicitly set to worse
    const effectiveData = { ...data };
    if (isSunday && (!CALENDAR_DATA[d] || CALENDAR_DATA[d].quality === 'neutral')) {
      effectiveData.quality = 'green';
      if (!effectiveData.obs) effectiveData.obs = 'Domingo — Baixo volume histórico';
    }
    const hasEvents = effectiveData.eventos && effectiveData.eventos.length > 0;
    const div = document.createElement('div');
    div.className = `cal-day day-${effectiveData.quality}${(isCurrentMonth && d === today.getDate()) ? ' today' : ''}${hasEvents ? ' has-events' : ''}${isSunday ? ' cal-sunday' : ''}`;
    div.innerHTML = `${d}${hasEvents ? '<span class="cal-event-dot"></span>' : ''}`;
    div.addEventListener('mouseenter', (e) => showCalTooltip(e, d, effectiveData));
    div.addEventListener('mouseleave', hideCalTooltip);
    div.addEventListener('mousemove', (e) => moveCalTooltip(e));
    div.addEventListener('click', (e) => { hideCalTooltip(); openEventModal(d, effectiveData); });
    grid.appendChild(div);
  }
}

function showCalTooltip(e, day, data) {
  const tooltip = document.getElementById('calTooltip');
  if (!tooltip) return;
  const monthNames = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const qualityLabel = {
    green: 'Indicado para obras',
    yellow: 'Atenção necessária',
    red: 'Evitar obras',
    neutral: 'Dia neutro'
  }[data.quality];
  const qualityColor = { green: '#10b981', yellow: '#f59e0b', red: '#ef4444', neutral: '#94a3b8' }[data.quality];
  const qualityIcon = { green: 'fa-check-circle', yellow: 'fa-exclamation-circle', red: 'fa-ban', neutral: 'fa-calendar' }[data.quality];

  let html = `<div class="cal-tooltip-title" style="color:${qualityColor};">
    <i class="fa-solid ${qualityIcon}" style="margin-right:4px;"></i>${day} ${monthNames[obrasCalendarMonth - 1]} &middot; ${qualityLabel}
  </div>`;
  html += `<div class="cal-tooltip-row"><i class="fa-solid fa-cloud-sun cal-tooltip-icon"></i> ${data.clima.replace(/[^\x00-\x7F]/g, '').trim() || data.clima}</div>`;
  if (data.eventos && data.eventos.length) {
    data.eventos.forEach(ev => {
      html += `<div class="cal-tooltip-row"><i class="fa-solid fa-location-pin cal-tooltip-icon"></i> ${ev}</div>`;
    });
  }
  if (data.obs) html += `<div class="cal-tooltip-row" style="margin-top:6px;opacity:0.75;font-style:italic;">${data.obs}</div>`;
  html += `<div style="margin-top:8px;font-size:10px;color:#94a3b8;border-top:1px solid rgba(255,255,255,0.1);padding-top:6px;"><i class="fa-solid fa-hand-pointer"></i> Clique para gerenciar eventos</div>`;

  tooltip.innerHTML = html;
  tooltip.classList.add('visible');
  moveCalTooltip(e);
}

let currentEventDay = null;

window.openEventModal = function(day, data) {
  currentEventDay = day;
  const modal = document.getElementById('eventModalCard');
  const title = document.getElementById('eventModalTitle');
  const body = document.getElementById('eventModalBody');
  if (!modal) return;

  const monthNames = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  title.textContent = `Eventos — ${day} de ${monthNames[obrasCalendarMonth - 1]}`;

  renderEventModalBody(day, data, body);
  modal.style.display = 'block';
  modal.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

function renderEventModalBody(day, data, body) {
  const events = (data.eventos || []);
  if (events.length === 0) {
    body.innerHTML = `<p style="font-size:12px;color:var(--text-muted);padding:8px 0;">Nenhum evento cadastrado para este dia.</p>`;
  } else {
    body.innerHTML = `<div class="event-list">` + events.map((ev, idx) => `
      <div class="event-list-item">
        <i class="fa-solid fa-calendar-day" style="color:#a855f7;flex-shrink:0;"></i>
        <span>${ev}</span>
        <button class="delete-btn" title="Remover evento" onclick="deleteCalendarEvent(${day}, ${idx})" style="margin-left:auto;">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>`).join('') + `</div>`;
  }
}

window.closeEventModal = function() {
  const modal = document.getElementById('eventModalCard');
  if (modal) modal.style.display = 'none';
  currentEventDay = null;
};

window.addCalendarEvent = function() {
  const input = document.getElementById('newEventText');
  if (!input || !currentEventDay) return;
  const text = input.value.trim();
  if (!text) return;

  if (!CALENDAR_DATA[currentEventDay]) {
    CALENDAR_DATA[currentEventDay] = { quality: 'yellow', clima: '—', eventos: [], obs: '' };
  }
  CALENDAR_DATA[currentEventDay].eventos.push(text);
  input.value = '';

  // Re-render calendar
  renderObrasCalendar();

  // Re-render modal body
  const body = document.getElementById('eventModalBody');
  if (body) renderEventModalBody(currentEventDay, CALENDAR_DATA[currentEventDay], body);
};

window.deleteCalendarEvent = function(day, idx) {
  if (!CALENDAR_DATA[day] || !CALENDAR_DATA[day].eventos) return;
  CALENDAR_DATA[day].eventos.splice(idx, 1);
  renderObrasCalendar();
  const body = document.getElementById('eventModalBody');
  if (body) renderEventModalBody(day, CALENDAR_DATA[day], body);
};

function moveCalTooltip(e) {
  const tooltip = document.getElementById('calTooltip');
  if (!tooltip) return;
  const x = e.clientX + 14;
  const y = e.clientY - 10;
  const tw = tooltip.offsetWidth;
  const vw = window.innerWidth;
  tooltip.style.left = (x + tw > vw ? x - tw - 28 : x) + 'px';
  tooltip.style.top = y + 'px';
}

function hideCalTooltip() {
  const tooltip = document.getElementById('calTooltip');
  if (tooltip) tooltip.classList.remove('visible');
}

window.calNav = function(dir) {
  obrasCalendarMonth += dir;
  if (obrasCalendarMonth > 12) { obrasCalendarMonth = 1; obrasCalendarYear++; }
  if (obrasCalendarMonth < 1) { obrasCalendarMonth = 12; obrasCalendarYear--; }
  renderObrasCalendar();
};

function initObraMiniMap() {
  const container = document.getElementById('obraMiniMap');
  if (!container) return;
  if (obrasMiniMap) { obrasMiniMap.remove(); obrasMiniMap = null; }

  obrasMiniMap = L.map('obraMiniMap', {
    center: [-23.5505, -46.6333],
    zoom: 12,
    zoomControl: true,
    attributionControl: false
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(obrasMiniMap);

  let miniMarker = null;

  obrasMiniMap.on('click', function(e) {
    const { lat, lng } = e.latlng;
    document.getElementById('obraLat').value = lat.toFixed(4);
    document.getElementById('obraLng').value = lng.toFixed(4);
    if (miniMarker) miniMarker.remove();
    miniMarker = L.circleMarker([lat, lng], {
      radius: 8, color: '#2563eb', fillColor: '#2563eb', fillOpacity: 0.8, weight: 2
    }).addTo(obrasMiniMap);
  });

  // Plot existing obras
  OBRAS_CADASTRADAS.forEach(o => {
    L.circleMarker([o.lat, o.lng], {
      radius: 6,
      color: o.marcador === 'red' ? '#ef4444' : o.marcador === 'yellow' ? '#f59e0b' : '#10b981',
      fillColor: o.marcador === 'red' ? '#ef4444' : o.marcador === 'yellow' ? '#f59e0b' : '#10b981',
      fillOpacity: 0.7, weight: 2
    }).addTo(obrasMiniMap).bindTooltip(o.local);
  });
}

window.openNewObraForm = function() {
  const card = document.getElementById('obraFormCard');
  if (card) {
    card.style.display = 'block';
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => initObraMiniMap(), 200);
  }
};

window.closeNewObraForm = function() {
  const card = document.getElementById('obraFormCard');
  if (card) card.style.display = 'none';
};

window.saveNewObra = async function() {
  const local = document.getElementById('obraLocal').value.trim();
  const bairro = document.getElementById('obraBairro').value;
  const tipo = document.getElementById('obraTipo').value;
  const dataInicio = document.getElementById('obraDataInicio').value;
  const duracao = parseInt(document.getElementById('obraDuracao').value) || 7;
  const impacto = parseInt(document.getElementById('obraImpacto').value) || 50;
  const status = document.getElementById('obraStatus').value;
  const urgencia = parseInt(document.getElementById('obraUrgencia').value) || 30;
  const lat = parseFloat(document.getElementById('obraLat').value) || -23.5505;
  const lng = parseFloat(document.getElementById('obraLng').value) || -46.6333;

  if (!local || !dataInicio) { alert('Preencha ao menos a localização e a data de início.'); return; }

  const marcador = impacto >= 70 ? 'red' : impacto >= 40 ? 'yellow' : 'green';
  const urgenciaLabel = urgencia <= 7 ? 'urgente' : urgencia <= 15 ? 'alta' : urgencia <= 30 ? 'media' : 'baixa';

  const payload = {
    local, bairro, tipo, dataInicio,
    duracao, impacto, status, lat, lng, marcador,
    urgencia: urgenciaLabel, grauUrgencia: urgencia, descricao: ''
  };

  try {
    await apiFetch('/obras', { method: 'POST', body: JSON.stringify(payload) });
    await loadObras();
  } catch (e) { console.error(e); alert('Erro ao salvar obra.'); return; }

  closeNewObraForm();
  filterObrasTable();

  const btn = document.querySelector('#obraFormCard .btn-primary');
  if (btn) { btn.innerHTML = '<i class="fa-solid fa-check"></i> Salvo!'; btn.style.background='#10b981'; setTimeout(()=>{btn.innerHTML='<i class="fa-solid fa-floppy-disk"></i> Salvar Obra';btn.style.background='';},2000); }
};

window.filterObrasTable = function() {
  const q = (document.getElementById('obrasTableSearch')?.value || '').toLowerCase();
  const statusF = document.getElementById('obrasStatusFilter')?.value || '';
  const filtered = OBRAS_CADASTRADAS.filter(o =>
    (!q || o.local.toLowerCase().includes(q) || o.bairro.toLowerCase().includes(q) || o.tipo.toLowerCase().includes(q)) &&
    (!statusF || o.status === statusF)
  );
  renderObrasTable(filtered);
};

function renderObrasTable(obras) {
  const tbody = document.getElementById('obrasTableBody');
  if (!tbody) return;

  const statusInfo = {
    planned:   { label:'Planejada',    cls:'status-planned',   icon:'fa-calendar' },
    ongoing:   { label:'Em andamento', cls:'status-ongoing',   icon:'fa-rotate'   },
    completed: { label:'Concluída',    cls:'status-completed', icon:'fa-check'    },
    critical:  { label:'Crítica',      cls:'status-critical',  icon:'fa-triangle-exclamation' }
  };

  const urgColors = { urgente:'#ef4444', alta:'#ea580c', media:'#f59e0b', baixa:'#10b981' };
  const urgLabels = { urgente:'URGENTE', alta:'ALTA', media:'MÉDIA', baixa:'BAIXA' };
  const urgBgs    = { urgente:'#fee2e2', alta:'#ffedd5', media:'#fef3c7', baixa:'#d1fae5' };

  tbody.innerHTML = obras.map(obra => {
    const si = statusInfo[obra.status] || statusInfo.planned;
    const ic = obra.impacto >= 70 ? '#ef4444' : obra.impacto >= 40 ? '#f59e0b' : '#10b981';
    const urg = obra.urgencia || 'media';
    const uc = urgColors[urg]; const ul = urgLabels[urg]; const ub = urgBgs[urg];
    const dias = obra.duracao;
    const diasStr = typeof dias === 'number' ? dias + ' dias' : dias;
    const grauStr = obra.grauUrgencia ? `máx. ${obra.grauUrgencia}d` : '—';

    return `
      <tr data-id="${obra.id}">
        <td><div class="table-location">${obra.local}<small>${obra.bairro}</small></div></td>
        <td style="font-size:12px;">${obra.tipo}</td>
        <td style="font-size:12px;">${formatDate(obra.dataInicio)}</td>
        <td style="font-size:12px;">${diasStr}</td>
        <td>
          <div class="impact-bar">
            <div class="impact-bar-bg"><div class="impact-bar-fill" style="width:${obra.impacto}%;background:${ic};"></div></div>
            <span class="impact-pct" style="color:${ic};">${obra.impacto}%</span>
          </div>
        </td>
        <td>
          <select class="status-change-btn" onchange="changeObraStatus(${obra.id}, this.value)" style="border-color:${ic};">
            <option value="planned"   ${obra.status==='planned'   ?'selected':''}>Planejada</option>
            <option value="ongoing"   ${obra.status==='ongoing'   ?'selected':''}>Em andamento</option>
            <option value="completed" ${obra.status==='completed' ?'selected':''}>Concluída</option>
            <option value="critical"  ${obra.status==='critical'  ?'selected':''}>Crítica</option>
          </select>
        </td>
        <td>
          <span style="display:inline-block;padding:3px 9px;border-radius:99px;font-size:10px;font-weight:700;background:${ub};color:${uc};">${ul}</span>
          <span style="display:block;font-size:10px;color:var(--text-muted);margin-top:2px;">${grauStr}</span>
        </td>
        <td>
          <button class="action-btn" title="Ver no mapa" onclick="focusObraOnMap(${obra.lat},${obra.lng})">
            <i class="fa-solid fa-location-dot"></i>
          </button>
          <button class="action-btn" title="Editar obra" onclick="editObra(${obra.id})" style="color:#2563eb;">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="delete-btn" title="Remover obra" onclick="deleteObra(${obra.id})">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>`;
  }).join('');
}

window.changeObraStatus = async function(id, newStatus) {
  try {
    await apiFetch(`/obras/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) });
  } catch (e) { console.error(e); return; }
  const obra = OBRAS_CADASTRADAS.find(o => o.id === id);
  if (obra) obra.status = newStatus;
  const mo = MOCK_DATA.obras.find(o => o.id === id);
  if (mo) mo.status = newStatus;
};

window.deleteObra = async function(id) {
  if (!confirm('Remover esta obra?')) return;
  try {
    await apiFetch(`/obras/${id}`, { method: 'DELETE' });
    await loadObras();
  } catch (e) { console.error(e); alert('Erro ao remover obra.'); return; }
  filterObrasTable();
};

window.editObra = function(id) {
  const obra = OBRAS_CADASTRADAS.find(o => o.id === id);
  if (!obra) return;

  const modal = document.getElementById('editObraModal');
  const body = document.getElementById('editObraBody');
  if (!modal || !body) return;

  body.innerHTML = `
    <div class="form-row">
      <div class="form-group">
        <label>Localização / Endereço</label>
        <input type="text" id="editLocal" class="form-input" value="${obra.local}"/>
      </div>
      <div class="form-group">
        <label>Bairro / Zona</label>
        <input type="text" id="editBairro" class="form-input" value="${obra.bairro}"/>
      </div>
    </div>
    <div class="form-row-3">
      <div class="form-group">
        <label>Tipo de Obra</label>
        <input type="text" id="editTipo" class="form-input" value="${obra.tipo}"/>
      </div>
      <div class="form-group">
        <label>Data de Início</label>
        <input type="date" id="editDataInicio" class="form-input" value="${obra.dataInicio}"/>
      </div>
      <div class="form-group">
        <label>Duração (dias)</label>
        <input type="number" id="editDuracao" class="form-input" value="${obra.duracao}" min="1"/>
      </div>
    </div>
    <div class="form-row-3">
      <div class="form-group">
        <label>Impacto Estimado (%)</label>
        <input type="number" id="editImpacto" class="form-input" value="${obra.impacto}" min="0" max="100"/>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select id="editStatus" class="form-input">
          <option value="planned" ${obra.status==='planned'?'selected':''}>Planejada</option>
          <option value="ongoing" ${obra.status==='ongoing'?'selected':''}>Em andamento</option>
          <option value="completed" ${obra.status==='completed'?'selected':''}>Concluída</option>
          <option value="critical" ${obra.status==='critical'?'selected':''}>Crítica</option>
        </select>
      </div>
      <div class="form-group">
        <label>Grau de Urgência (máx. dias)</label>
        <input type="number" id="editUrgencia" class="form-input" value="${obra.grauUrgencia || 30}" min="1"/>
      </div>
    </div>
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:8px;">
      <button class="btn-outline" onclick="closeEditModal()">Cancelar</button>
      <button class="btn-primary" onclick="saveEditObra(${id})">
        <i class="fa-solid fa-floppy-disk"></i> Salvar
      </button>
    </div>
  `;

  modal.style.display = 'flex';
};

window.closeEditModal = function() {
  const modal = document.getElementById('editObraModal');
  if (modal) modal.style.display = 'none';
};

window.saveEditObra = async function(id) {
  const obra = OBRAS_CADASTRADAS.find(o => o.id === id);
  if (!obra) return;

  const dados = {
    local:        document.getElementById('editLocal').value.trim() || obra.local,
    bairro:       document.getElementById('editBairro').value.trim() || obra.bairro,
    tipo:         document.getElementById('editTipo').value.trim() || obra.tipo,
    dataInicio:   document.getElementById('editDataInicio').value || obra.dataInicio,
    duracao:      parseInt(document.getElementById('editDuracao').value) || obra.duracao,
    impacto:      parseInt(document.getElementById('editImpacto').value) || obra.impacto,
    status:       document.getElementById('editStatus').value,
    grauUrgencia: parseInt(document.getElementById('editUrgencia').value) || obra.grauUrgencia,
    lat:          obra.lat,
    lng:          obra.lng,
    urgencia:     obra.urgencia,
    descricao:    obra.descricao
  };
  dados.marcador = dados.impacto >= 70 ? 'red' : dados.impacto >= 40 ? 'yellow' : 'green';

  try {
    await apiFetch(`/obras/${id}`, { method: 'PUT', body: JSON.stringify(dados) });
    await loadObras();
  } catch (e) { console.error(e); alert('Erro ao salvar alterações.'); return; }

  closeEditModal();
  filterObrasTable();
};




// ══════════════════════════════════════════════════════════════
//  PÁGINA: MURAL DE AVISOS
// ══════════════════════════════════════════════════════════════

// Usuários do mural (carregados via GET /mural/usuarios)
let MURAL_USERS = [];

async function loadMuralUsers() {
  try {
    const rows = await apiFetch('/mural/usuarios') || [];
    const myId = getUsuarioId();
    MURAL_USERS = rows.map(function (u) {
      return Object.assign({}, u, { isMe: u.id === myId });
    });
  } catch (e) {
    console.error('Falha ao carregar usuários do mural:', e);
    MURAL_USERS = [];
  }
}

let muralAvisos = [];
let muralChatMessages = [];

async function loadMuralAvisos() {
  try {
    const rows = await apiFetch(`/mural/avisos?idUsuario=${getUsuarioId()}`) || [];
    const myId = getUsuarioId();
    muralAvisos = rows.map(function (a) {
      a.time = new Date(a.time);
      a.comments = (a.comments || []).map(function (c) {
        c.time = new Date(c.time);
        if (c.author) c.author.isMe = c.author.id === myId;
        return c;
      });
      if (a.author) a.author.isMe = a.author.id === myId;
      return a;
    });
  } catch (e) {
    console.error('Falha ao carregar avisos do mural:', e);
    muralAvisos = [];
  }
}

async function loadMuralChat() {
  try {
    const rows = await apiFetch('/mural/chat') || [];
    const myId = getUsuarioId();
    muralChatMessages = rows.map(function (m) {
      m.time = new Date(m.time);
      if (m.author) m.author.isMe = m.author.id === myId;
      return m;
    });
  } catch (e) {
    console.error('Falha ao carregar chat:', e);
    muralChatMessages = [];
  }
}

let muralTypeFilter   = 'all';
let muralRegionFilter = 'all';

// ── HELPERS ────────────────────────────────
function muralTimeAgo(date) {
  const diff = Math.floor((Date.now() - date) / 1000);
  if (diff < 60)    return 'Agora';
  if (diff < 3600)  return `Há ${Math.floor(diff/60)} min`;
  if (diff < 86400) return `Há ${Math.floor(diff/3600)}h`;
  return `Há ${Math.floor(diff/86400)} dias`;
}
function muralFmtTime(date) {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

const MURAL_TYPE_CFG = {
  urgente:   { label: 'Urgente',     cls: 'mural-tag-urgente',   icon: 'fa-triangle-exclamation' },
  atencao:   { label: 'Atenção',     cls: 'mural-tag-atencao',   icon: 'fa-eye' },
  info:      { label: 'Informativo', cls: 'mural-tag-info',       icon: 'fa-circle-info' },
  concluido: { label: 'Concluído',   cls: 'mural-tag-concluido', icon: 'fa-circle-check' },
  planejado: { label: 'Planejado',   cls: 'mural-tag-planejado', icon: 'fa-calendar' },
};

// ── RENDER PAGE ────────────────────────────
async function renderMuralPage(content) {
  await Promise.all([loadMuralUsers(), loadMuralAvisos(), loadMuralChat()]);
  content.innerHTML = `
    <!-- MURAL STYLES -->
    <style>
      .mural-stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:4px; }
      .mural-stat-card { background:#fff; border-radius:12px; border:1px solid #f1f5f9; box-shadow:0 1px 3px rgba(0,0,0,.08); padding:16px 18px; display:flex; align-items:center; gap:14px; transition:box-shadow .15s; }
      .mural-stat-card:hover { box-shadow:0 4px 16px rgba(0,0,0,.08); }
      .mural-stat-icon { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
      .mural-stat-value { font-size:22px; font-weight:700; letter-spacing:-.5px; line-height:1; }
      .mural-stat-label { font-size:12px; color:var(--text-muted); margin-top:3px; }

      .mural-filter-bar { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
      .mural-chip { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:99px; font-size:12px; font-weight:600; cursor:pointer; border:1.5px solid #e2e8f0; background:#fff; color:var(--text-secondary); transition:all .15s; font-family:'DM Sans',sans-serif; }
      .mural-chip:hover { border-color:var(--brand-blue); color:var(--brand-blue); }
      .mural-chip.active { background:var(--brand-blue-light); color:#fff; border-color:var(--brand-blue-light); }
      .mural-chip.chip-red.active    { background:var(--red);    border-color:var(--red); }
      .mural-chip.chip-yellow.active { background:var(--yellow); border-color:var(--yellow); }
      .mural-chip.chip-green.active  { background:var(--green);  border-color:var(--green); }
      .mural-chip.chip-blue.active   { background:var(--blue);   border-color:var(--blue); }
      .mural-filter-sep { width:1px; height:24px; background:#e2e8f0; }
      .mural-region-sel { height:36px; border:1.5px solid #e2e8f0; border-radius:9px; padding:0 12px; font-family:'DM Sans',sans-serif; font-size:13px; color:var(--text-primary); background:#fff; outline:none; cursor:pointer; transition:border-color .15s; }
      .mural-region-sel:focus { border-color:var(--brand-blue); }

      .mural-layout { display:grid; grid-template-columns:1fr 360px; gap:20px; align-items:start; }
      @media(max-width:1100px){ .mural-layout { grid-template-columns:1fr; } .mural-right { display:grid; grid-template-columns:1fr 1fr; } }
      @media(max-width:768px) { .mural-stats-row { grid-template-columns:1fr 1fr; } .mural-right { grid-template-columns:1fr; } }
      @media(max-width:500px) { .mural-stats-row { grid-template-columns:1fr; } .mural-form-row { grid-template-columns:1fr; } }

      .mural-section-title { font-size:13px; font-weight:700; display:flex; align-items:center; gap:8px; margin-bottom:4px; }
      .mural-section-title span { font-weight:400; color:var(--text-muted); font-size:12px; }

      .mural-aviso-card { background:#fff; border-radius:12px; border:1px solid #f1f5f9; box-shadow:0 1px 3px rgba(0,0,0,.08); padding:18px 20px; margin-bottom:14px; transition:box-shadow .15s; }
      .mural-aviso-card:hover { box-shadow:0 4px 16px rgba(0,0,0,.08); }
      .mural-aviso-card.pinned { border-left:3px solid var(--brand-blue-light); background:linear-gradient(135deg,#f0f7ff 0%,#fff 60%); }
      @keyframes muralSlideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      .mural-aviso-card { animation:muralSlideUp .3s ease; }

      .mural-aviso-top { display:flex; align-items:flex-start; gap:12px; margin-bottom:12px; }
      .mural-aviso-avatar { width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:#fff; flex-shrink:0; }
      .mural-aviso-author { font-size:13px; font-weight:600; display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
      .mural-role-badge { font-size:10px; font-weight:600; padding:2px 7px; border-radius:99px; background:#f1f5f9; color:var(--text-secondary); }
      .mural-aviso-time { font-size:11px; color:var(--text-muted); margin-top:2px; font-family:'DM Mono',monospace; }
      .mural-aviso-tags { display:flex; gap:6px; align-items:center; flex-wrap:wrap; margin-left:auto; }

      .mural-aviso-tag { font-size:10px; font-weight:600; padding:3px 9px; border-radius:99px; }
      .mural-tag-urgente   { background:var(--red-bg);    color:var(--red); }
      .mural-tag-atencao   { background:var(--yellow-bg); color:#92400e; }
      .mural-tag-info      { background:var(--blue-bg);   color:#1d4ed8; }
      .mural-tag-concluido { background:var(--green-bg);  color:#065f46; }
      .mural-tag-planejado { background:var(--purple-bg); color:#6d28d9; }
      .mural-region-tag { font-size:10px; font-weight:600; padding:3px 9px; border-radius:99px; background:#f1f5f9; color:var(--text-secondary); }
      .mural-pinned-label { display:inline-flex; align-items:center; gap:4px; font-size:10px; font-weight:700; color:var(--brand-blue-light); background:#dbeafe; padding:2px 8px; border-radius:99px; }

      .mural-aviso-title { font-size:14px; font-weight:700; color:var(--text-primary); margin-bottom:5px; }
      .mural-aviso-desc { font-size:13px; color:var(--text-secondary); line-height:1.55; }
      .mural-img-placeholder { width:100%; height:110px; border-radius:8px; background:linear-gradient(135deg,#e8f0fe,#f1f5f9); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; margin-bottom:12px; color:#94a3b8; font-size:12px; }
      .mural-img-placeholder i { font-size:24px; color:#cbd5e1; }

      .mural-aviso-footer { display:flex; align-items:center; gap:12px; padding-top:12px; border-top:1px solid #f1f5f9; }
      .mural-action { display:inline-flex; align-items:center; gap:5px; font-size:12px; font-weight:500; color:var(--text-muted); background:none; border:none; cursor:pointer; padding:5px 8px; border-radius:6px; transition:all .15s; font-family:'DM Sans',sans-serif; }
      .mural-action:hover { background:var(--page-bg); color:var(--text-primary); }
      .mural-action.liked { color:var(--red); }
      @keyframes muralHeartPop { 0%{transform:scale(1)} 50%{transform:scale(1.4)} 100%{transform:scale(1)} }
      .mural-action.liked i { animation:muralHeartPop .3s ease; }
      .mural-pin-btn { margin-left:auto; background:none; border:none; cursor:pointer; color:var(--text-muted); font-size:13px; padding:5px; border-radius:6px; transition:color .15s; }
      .mural-pin-btn.pinned { color:var(--brand-blue-light); }
      .mural-pin-btn:hover { color:var(--brand-blue); }

      .mural-comments { margin-top:12px; padding-top:12px; border-top:1px solid #f1f5f9; display:none; flex-direction:column; gap:8px; }
      .mural-comments.open { display:flex; }
      .mural-comment-item { display:flex; gap:10px; }
      .mural-comment-avatar { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:700; color:#fff; flex-shrink:0; }
      .mural-comment-bubble { background:#f8fafc; border-radius:8px 8px 8px 2px; padding:8px 12px; flex:1; }
      .mural-comment-author { font-size:11px; font-weight:700; margin-bottom:2px; }
      .mural-comment-text { font-size:12px; color:var(--text-secondary); line-height:1.45; }
      .mural-comment-time { font-size:10px; color:var(--text-muted); margin-top:3px; font-family:'DM Mono',monospace; }
      .mural-comment-input-row { display:flex; gap:8px; margin-top:4px; }
      .mural-comment-input { flex:1; height:34px; border:1px solid #e2e8f0; border-radius:8px; padding:0 12px; font-family:'DM Sans',sans-serif; font-size:12px; outline:none; transition:border-color .15s; background:#fff; }
      .mural-comment-input:focus { border-color:var(--brand-blue); }
      .mural-comment-send { width:34px; height:34px; border-radius:8px; border:none; background:var(--brand-blue-light); color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:13px; transition:background .15s; }
      .mural-comment-send:hover { background:var(--brand-blue); }

      /* CHAT */
      .mural-chat-card { background:#fff; border-radius:12px; border:1px solid #f1f5f9; box-shadow:0 1px 3px rgba(0,0,0,.08); display:flex; flex-direction:column; overflow:hidden; }
      .mural-chat-header { padding:14px 16px; border-bottom:1px solid #f1f5f9; display:flex; align-items:center; gap:10px; }
      .mural-chat-header-icon { width:32px; height:32px; border-radius:9px; background:linear-gradient(135deg,var(--brand-blue-light),var(--brand-teal)); display:flex; align-items:center; justify-content:center; font-size:13px; color:#fff; }
      .mural-chat-title { font-size:13px; font-weight:700; }
      .mural-chat-sub { font-size:11px; color:var(--text-muted); }
      .mural-online-dot { width:8px; height:8px; border-radius:50%; background:var(--green); animation:pulse 2s infinite; }
      .mural-chat-messages { height:300px; overflow-y:auto; padding:14px; display:flex; flex-direction:column; gap:10px; background:#fafcff; }
      .mural-chat-msg { display:flex; gap:8px; animation:muralSlideUp .25s ease; }
      .mural-chat-msg.me { flex-direction:row-reverse; }
      .mural-chat-msg-avatar { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:700; color:#fff; flex-shrink:0; }
      .mural-chat-bubble { max-width:220px; padding:8px 12px; border-radius:12px; }
      .mural-chat-msg:not(.me) .mural-chat-bubble { background:#fff; border:1px solid #e2e8f0; border-radius:2px 12px 12px 12px; }
      .mural-chat-msg.me .mural-chat-bubble { background:linear-gradient(135deg,var(--brand-blue-light),var(--brand-teal)); color:#fff; border-radius:12px 2px 12px 12px; }
      .mural-bubble-author { font-size:10px; font-weight:700; margin-bottom:2px; color:var(--text-muted); }
      .mural-chat-msg.me .mural-bubble-author { color:rgba(255,255,255,.7); }
      .mural-bubble-text { font-size:12px; line-height:1.45; }
      .mural-bubble-time { font-size:10px; margin-top:3px; color:var(--text-muted); font-family:'DM Mono',monospace; }
      .mural-chat-msg.me .mural-bubble-time { color:rgba(255,255,255,.6); text-align:right; }
      .mural-chat-typing { display:none; gap:8px; align-items:center; font-size:11px; color:var(--text-muted); padding:4px 14px; }
      .mural-chat-typing.visible { display:flex; }
      .mural-typing-dots { display:flex; gap:3px; }
      .mural-typing-dot { width:5px; height:5px; border-radius:50%; background:var(--text-muted); animation:muralTyping 1.2s infinite; }
      .mural-typing-dot:nth-child(2){animation-delay:.2s} .mural-typing-dot:nth-child(3){animation-delay:.4s}
      @keyframes muralTyping { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-4px)} }
      .mural-chat-input-area { padding:12px 14px; border-top:1px solid #f1f5f9; display:flex; gap:8px; align-items:center; background:#fff; }
      .mural-chat-input { flex:1; height:36px; border:1px solid #e2e8f0; border-radius:9px; padding:0 12px; font-family:'DM Sans',sans-serif; font-size:13px; outline:none; transition:border-color .15s; }
      .mural-chat-input:focus { border-color:var(--brand-blue); }
      .mural-chat-send { width:36px; height:36px; border-radius:9px; border:none; background:linear-gradient(135deg,var(--brand-blue-light),var(--brand-teal)); color:#fff; cursor:pointer; font-size:13px; display:flex; align-items:center; justify-content:center; transition:opacity .15s; }
      .mural-chat-send:hover { opacity:.85; }

      /* QUICK AVISO */
      .mural-quick-card { background:#fff; border-radius:12px; border:1px solid #f1f5f9; box-shadow:0 1px 3px rgba(0,0,0,.08); padding:18px; }
      .mural-quick-title { font-size:13px; font-weight:700; margin-bottom:14px; display:flex; align-items:center; gap:7px; }
      .mural-form-group { margin-bottom:12px; }
      .mural-form-label { font-size:11px; font-weight:600; color:var(--text-secondary); margin-bottom:5px; display:block; letter-spacing:.03em; }
      .mural-form-input, .mural-form-select, .mural-form-textarea { width:100%; border:1px solid #e2e8f0; border-radius:8px; padding:8px 12px; font-family:'DM Sans',sans-serif; font-size:13px; color:var(--text-primary); outline:none; transition:border-color .15s; background:#fff; }
      .mural-form-input:focus,.mural-form-select:focus,.mural-form-textarea:focus { border-color:var(--brand-blue); }
      .mural-form-textarea { resize:vertical; min-height:72px; line-height:1.5; }
      .mural-form-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
      .mural-char-count { font-size:10px; color:var(--text-muted); text-align:right; margin-top:3px; }

      /* ACTIVE USERS */
      .mural-active-card { background:#fff; border-radius:12px; border:1px solid #f1f5f9; box-shadow:0 1px 3px rgba(0,0,0,.08); padding:16px 18px; }
      .mural-active-title { font-size:13px; font-weight:700; margin-bottom:12px; display:flex; align-items:center; gap:7px; }
      .mural-active-row { display:flex; align-items:center; gap:10px; padding:7px 0; border-bottom:1px solid #f8fafc; }
      .mural-active-row:last-child { border-bottom:none; }
      .mural-au-avatar { width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; color:#fff; flex-shrink:0; }
      .mural-au-name { font-size:12px; font-weight:600; flex:1; }
      .mural-au-role { font-size:10px; color:var(--text-muted); }
      .mural-au-dot { width:7px; height:7px; border-radius:50%; background:var(--green); }

      /* MODAL */
      .mural-modal-overlay { position:fixed; inset:0; background:rgba(15,23,42,.5); z-index:9999; display:flex; align-items:center; justify-content:center; padding:20px; opacity:0; pointer-events:none; transition:opacity .2s; }
      .mural-modal-overlay.open { opacity:1; pointer-events:all; }
      .mural-modal-box { background:#fff; border-radius:12px; box-shadow:0 8px 32px rgba(0,0,0,.12); width:100%; max-width:560px; max-height:90vh; overflow-y:auto; transform:translateY(20px); transition:transform .2s; }
      .mural-modal-overlay.open .mural-modal-box { transform:translateY(0); }
      .mural-modal-header { display:flex; align-items:center; justify-content:space-between; padding:20px 24px; border-bottom:1px solid #f1f5f9; }
      .mural-modal-header h3 { font-size:15px; font-weight:700; }
      .mural-modal-close { width:30px; height:30px; border:none; background:#f1f5f9; border-radius:7px; cursor:pointer; font-size:14px; color:var(--text-secondary); display:flex; align-items:center; justify-content:center; }
      .mural-modal-close:hover { background:#e2e8f0; color:var(--text-primary); }
      .mural-modal-body { padding:24px; }
      .mural-modal-footer { padding:16px 24px; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:10px; }
      .mural-btn-secondary { height:36px; padding:0 16px; border:1px solid #e2e8f0; border-radius:8px; background:#fff; color:var(--text-secondary); font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500; cursor:pointer; transition:all .15s; }
      .mural-btn-secondary:hover { border-color:#cbd5e1; color:var(--text-primary); }

      .mural-empty { text-align:center; padding:60px 20px; color:var(--text-muted); }
      .mural-empty i { font-size:40px; margin-bottom:12px; display:block; color:#cbd5e1; }
    </style>

    <!-- STATS ROW -->
    <div class="mural-stats-row">
      <div class="mural-stat-card">
        <div class="mural-stat-icon" style="background:var(--red-bg);color:var(--red);">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <div>
          <div class="mural-stat-value" id="mStatUrgente">3</div>
          <div class="mural-stat-label">Avisos urgentes</div>
        </div>
      </div>
      <div class="mural-stat-card">
        <div class="mural-stat-icon" style="background:var(--yellow-bg);color:var(--yellow);">
          <i class="fa-solid fa-eye"></i>
        </div>
        <div>
          <div class="mural-stat-value" id="mStatAtencao">2</div>
          <div class="mural-stat-label">Atenção necessária</div>
        </div>
      </div>
      <div class="mural-stat-card">
        <div class="mural-stat-icon" style="background:var(--green-bg);color:var(--green);">
          <i class="fa-solid fa-circle-check"></i>
        </div>
        <div>
          <div class="mural-stat-value" id="mStatResolvido">1</div>
          <div class="mural-stat-label">Resolvidos hoje</div>
        </div>
      </div>
      <div class="mural-stat-card">
        <div class="mural-stat-icon" style="background:var(--blue-bg);color:var(--blue);">
          <i class="fa-solid fa-comments"></i>
        </div>
        <div>
          <div class="mural-stat-value" id="mStatComents">28</div>
          <div class="mural-stat-label">Comentários hoje</div>
        </div>
      </div>
    </div>

    <!-- FILTER BAR + NEW BUTTON -->
    <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;">
      <div class="mural-filter-bar">
        <button class="mural-chip active" data-mtype="all" onclick="muralSetFilter('all',this)"><i class="fa-solid fa-th-large"></i> Todos</button>
        <button class="mural-chip chip-red" data-mtype="urgente" onclick="muralSetFilter('urgente',this)"><i class="fa-solid fa-triangle-exclamation"></i> Urgente</button>
        <button class="mural-chip chip-yellow" data-mtype="atencao" onclick="muralSetFilter('atencao',this)"><i class="fa-solid fa-eye"></i> Atenção</button>
        <button class="mural-chip chip-blue" data-mtype="info" onclick="muralSetFilter('info',this)"><i class="fa-solid fa-circle-info"></i> Informativo</button>
        <button class="mural-chip chip-green" data-mtype="concluido" onclick="muralSetFilter('concluido',this)"><i class="fa-solid fa-circle-check"></i> Concluído</button>
        <div class="mural-filter-sep"></div>
        <select class="mural-region-sel" id="mRegionFilter" onchange="muralApplyFilters()">
          <option value="all">Todas as regiões</option>
          <option value="Centro">Centro</option>
          <option value="Av. Paulista">Av. Paulista</option>
          <option value="Zona Norte">Zona Norte</option>
          <option value="Zona Sul">Zona Sul</option>
          <option value="Zona Leste">Zona Leste</option>
          <option value="Zona Oeste">Zona Oeste</option>
        </select>
      </div>
      <button class="btn-primary" onclick="muralOpenModal()">
        <i class="fa-solid fa-plus"></i> Novo Aviso
      </button>
    </div>

    <!-- LAYOUT -->
    <div class="mural-layout">
      <!-- FEED -->
      <div>
        <div class="mural-section-title">
          <i class="fa-solid fa-list-ul" style="color:var(--brand-blue-light);"></i>
          Feed de Avisos
          <span id="mFeedCount">8 avisos encontrados</span>
        </div>
        <div id="muralAvisosList"></div>
      </div>

      <!-- RIGHT PANEL -->
      <div class="mural-right" style="display:flex;flex-direction:column;gap:14px;">

        <!-- CHAT -->
        <div class="mural-chat-card">
          <div class="mural-chat-header">
            <div class="mural-chat-header-icon"><i class="fa-solid fa-comments"></i></div>
            <div style="flex:1;">
              <div class="mural-chat-title">Chat da Equipe</div>
              <div class="mural-chat-sub">Todos os usuários NewRoad</div>
            </div>
            <div class="mural-online-dot"></div>
          </div>
          <div class="mural-chat-messages" id="muralChatMessages"></div>
          <div class="mural-chat-typing" id="muralTyping">
            <div class="mural-typing-dots">
              <div class="mural-typing-dot"></div>
              <div class="mural-typing-dot"></div>
              <div class="mural-typing-dot"></div>
            </div>
            <span id="muralTypingName">Alguém está digitando…</span>
          </div>
          <div class="mural-chat-input-area">
            <input class="mural-chat-input" id="muralChatInput" placeholder="Mensagem para a equipe…" onkeydown="muralChatKey(event)"/>
            <button class="mural-chat-send" onclick="muralSendChat()"><i class="fa-solid fa-paper-plane"></i></button>
          </div>
        </div>

        <!-- QUICK AVISO -->
        <div class="mural-quick-card">
          <div class="mural-quick-title">
            <i class="fa-solid fa-bolt" style="color:var(--yellow);"></i>
            Aviso Rápido
          </div>
          <div class="mural-form-group">
            <label class="mural-form-label">TÍTULO</label>
            <input class="mural-form-input" id="mQuickTitle" placeholder="Ex: Interdição na Paulista…" oninput="muralCharCount(this,'mQuickTitleCount',60)"/>
            <div class="mural-char-count" id="mQuickTitleCount">0/60</div>
          </div>
          <div class="mural-form-row">
            <div class="mural-form-group">
              <label class="mural-form-label">TIPO</label>
              <select class="mural-form-select" id="mQuickTipo">
                <option value="urgente">🔴 Urgente</option>
                <option value="atencao" selected>🟡 Atenção</option>
                <option value="info">🔵 Informativo</option>
              </select>
            </div>
            <div class="mural-form-group">
              <label class="mural-form-label">REGIÃO</label>
              <select class="mural-form-select" id="mQuickRegiao">
                <option>Centro</option><option>Av. Paulista</option><option>Zona Norte</option>
                <option>Zona Sul</option><option>Zona Leste</option><option>Zona Oeste</option>
              </select>
            </div>
          </div>
          <button class="btn-primary" style="width:100%;justify-content:center;" onclick="muralPostQuick()">
            <i class="fa-solid fa-bullhorn"></i> Publicar Aviso
          </button>
        </div>

      </div>
    </div>

    <!-- MODAL -->
    <div class="mural-modal-overlay" id="muralModal">
      <div class="mural-modal-box">
        <div class="mural-modal-header">
          <h3><i class="fa-solid fa-plus" style="color:var(--brand-blue-light);margin-right:8px;"></i>Novo Aviso</h3>
          <button class="mural-modal-close" onclick="muralCloseModal()"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="mural-modal-body">
          <div class="mural-form-group">
            <label class="mural-form-label">TÍTULO DO AVISO *</label>
            <input class="mural-form-input" id="mModalTitle" placeholder="Descreva brevemente o aviso…" oninput="muralCharCount(this,'mModalTitleCount',80)"/>
            <div class="mural-char-count" id="mModalTitleCount">0/80</div>
          </div>
          <div class="mural-form-group">
            <label class="mural-form-label">DESCRIÇÃO</label>
            <textarea class="mural-form-textarea" id="mModalDesc" placeholder="Detalhe o aviso: localização exata, impacto esperado, medidas tomadas…" oninput="muralCharCount(this,'mModalDescCount',400)"></textarea>
            <div class="mural-char-count" id="mModalDescCount">0/400</div>
          </div>
          <div class="mural-form-row">
            <div class="mural-form-group">
              <label class="mural-form-label">TIPO *</label>
              <select class="mural-form-select" id="mModalTipo">
                <option value="urgente">🔴 Urgente</option>
                <option value="atencao" selected>🟡 Atenção</option>
                <option value="info">🔵 Informativo</option>
                <option value="concluido">🟢 Concluído</option>
                <option value="planejado">🟣 Planejado</option>
              </select>
            </div>
            <div class="mural-form-group">
              <label class="mural-form-label">REGIÃO *</label>
              <select class="mural-form-select" id="mModalRegiao">
                <option>Centro</option><option>Av. Paulista</option><option>Zona Norte</option>
                <option>Zona Sul</option><option>Zona Leste</option><option>Zona Oeste</option>
              </select>
            </div>
          </div>
          <div class="mural-form-group">
            <label class="mural-form-label">VIA / LOCALIZAÇÃO</label>
            <input class="mural-form-input" id="mModalLocal" placeholder="Ex: Av. Paulista, 1578 — altura Consolação"/>
          </div>
        </div>
        <div class="mural-modal-footer">
          <button class="mural-btn-secondary" onclick="muralCloseModal()">Cancelar</button>
          <button class="btn-primary" onclick="muralPostAviso()"><i class="fa-solid fa-bullhorn"></i> Publicar</button>
        </div>
      </div>
    </div>
  `;

  // outside-click to close modal
  document.getElementById('muralModal').addEventListener('click', function(e){
    if (e.target === this) muralCloseModal();
  });

  muralRenderAvisos();
  muralRenderChat();
  muralRenderActiveUsers();
  muralUpdateStats();
}

// ── AVISOS RENDER ──
function muralRenderAvisos() {
  const container = document.getElementById('muralAvisosList');
  if (!container) return;

  let filtered = muralAvisos.filter(a => {
    const tOk = muralTypeFilter === 'all' || a.tipo === muralTypeFilter;
    const rOk = muralRegionFilter === 'all' || a.regiao === muralRegionFilter;
    return tOk && rOk;
  });
  filtered.sort((a, b) => (b.pinned - a.pinned) || (b.time - a.time));

  const fc = document.getElementById('mFeedCount');
  if (fc) fc.textContent = `${filtered.length} aviso${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`;

  if (!filtered.length) {
    container.innerHTML = `<div class="mural-empty"><i class="fa-regular fa-folder-open"></i><p>Nenhum aviso para os filtros selecionados.</p></div>`;
    return;
  }
  container.innerHTML = filtered.map(muralRenderCard).join('');
}

function muralRenderCard(a) {
  const tc = MURAL_TYPE_CFG[a.tipo] || MURAL_TYPE_CFG.info;
  const commentsHtml = a.comments.map(c => `
    <div class="mural-comment-item">
      <div class="mural-comment-avatar" style="background:${c.author.color};">${c.author.initials}</div>
      <div class="mural-comment-bubble">
        <div class="mural-comment-author">${c.author.name}</div>
        <div class="mural-comment-text">${c.text}</div>
        <div class="mural-comment-time">${muralTimeAgo(c.time)}</div>
      </div>
    </div>
  `).join('');
  const imgHtml = a.hasImg ? `<div class="mural-img-placeholder"><i class="fa-solid fa-road"></i><span>Imagem do local — câmera CET</span></div>` : '';
  return `
    <div class="mural-aviso-card ${a.pinned ? 'pinned' : ''}" id="maviso-${a.id}">
      <div class="mural-aviso-top">
        <div class="mural-aviso-avatar" style="background:${a.author.color};">${a.author.initials}</div>
        <div style="flex:1;min-width:0;">
          <div class="mural-aviso-author">
            ${a.author.name}
            <span class="mural-role-badge">${a.author.role}</span>
            ${a.pinned ? '<span class="mural-pinned-label"><i class="fa-solid fa-thumbtack"></i> Fixado</span>' : ''}
          </div>
          <div class="mural-aviso-time">${muralTimeAgo(a.time)}</div>
        </div>
        <div class="mural-aviso-tags">
          <span class="mural-aviso-tag ${tc.cls}"><i class="fa-solid ${tc.icon}"></i> ${tc.label}</span>
          <span class="mural-region-tag"><i class="fa-solid fa-location-dot"></i> ${a.regiao}</span>
        </div>
      </div>
      <div style="margin-bottom:14px;">
        ${imgHtml}
        <div class="mural-aviso-title">${a.title}</div>
        <div class="mural-aviso-desc">${a.desc}</div>
      </div>
      <div class="mural-aviso-footer">
        <button class="mural-action ${a.liked?'liked':''}" onclick="muralToggleLike(${a.id})">
          <i class="fa-${a.liked?'solid':'regular'} fa-heart"></i>
          <span id="mlike-${a.id}">${a.likes}</span>
        </button>
        <button class="mural-action" onclick="muralToggleComments(${a.id})">
          <i class="fa-regular fa-comment"></i>
          <span>${a.comments.length} comentário${a.comments.length!==1?'s':''}</span>
        </button>
        <button class="mural-action" onclick="muralShare(${a.id})">
          <i class="fa-solid fa-share-nodes"></i> Compartilhar
        </button>
        <button class="mural-action mural-edit-btn" onclick="muralOpenEdit(${a.id})" title="Editar aviso">
          <i class="fa-solid fa-pen"></i> Editar
        </button>
        <button class="mural-action mural-delete-btn" onclick="muralDeleteAviso(${a.id})" title="Apagar aviso">
          <i class="fa-solid fa-trash"></i>
        </button>
        <button class="mural-pin-btn ${a.pinned?'pinned':''}" onclick="muralTogglePin(${a.id})" title="${a.pinned?'Desafixar':'Fixar aviso'}">
          <i class="fa-solid fa-thumbtack"></i>
        </button>
      </div>
      <div class="mural-comments ${a.commentsOpen?'open':''}" id="mcomments-${a.id}">
        ${commentsHtml}
        <div class="mural-comment-input-row">
          <input class="mural-comment-input" placeholder="Comentar…" id="mcinput-${a.id}" onkeydown="if(event.key==='Enter')muralAddComment(${a.id})"/>
          <button class="mural-comment-send" onclick="muralAddComment(${a.id})"><i class="fa-solid fa-paper-plane"></i></button>
        </div>
      </div>
    </div>
  `;
}

// ── INTERACTIONS ──
function muralSetFilter(type, el) {
  muralTypeFilter = type;
  document.querySelectorAll('.mural-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  muralApplyFilters();
}
function muralApplyFilters() {
  const sel = document.getElementById('mRegionFilter');
  muralRegionFilter = sel ? sel.value : 'all';
  muralRenderAvisos();
}
async function muralToggleLike(id) {
  const a = muralAvisos.find(x => x.id === id);
  if (!a) return;
  let estado;
  try {
    estado = await apiFetch(`/mural/avisos/${id}/curtir`, {
      method: 'POST',
      body: JSON.stringify({ idUsuario: getUsuarioId() })
    });
  } catch (e) { console.error(e); return; }
  a.liked = !!estado.liked;
  a.likes = estado.likes;
  const cnt = document.getElementById(`mlike-${id}`);
  const btn = cnt?.closest('.mural-action');
  if (cnt) cnt.textContent = a.likes;
  if (btn) {
    btn.classList.toggle('liked', a.liked);
    const ico = btn.querySelector('i');
    if (ico) ico.className = `fa-${a.liked?'solid':'regular'} fa-heart`;
  }
  muralUpdateStats();
}
function muralToggleComments(id) {
  const a = muralAvisos.find(x => x.id === id);
  if (!a) return;
  a.commentsOpen = !a.commentsOpen;
  const sec = document.getElementById(`mcomments-${id}`);
  if (sec) sec.classList.toggle('open', a.commentsOpen);
  if (a.commentsOpen) setTimeout(() => document.getElementById(`mcinput-${id}`)?.focus(), 100);
}
async function muralAddComment(id) {
  const input = document.getElementById(`mcinput-${id}`);
  const text = input?.value.trim();
  if (!text) return;
  const a = muralAvisos.find(x => x.id === id);
  if (!a) return;
  try {
    await apiFetch(`/mural/avisos/${id}/comentarios`, {
      method: 'POST',
      body: JSON.stringify({ idUsuario: getUsuarioId(), texto: text })
    });
    await loadMuralAvisos();
  } catch (e) { console.error(e); showToast('Erro ao comentar.', 'info'); return; }
  const updated = muralAvisos.find(x => x.id === id);
  if (updated) updated.commentsOpen = true;
  muralRenderAvisos();
  setTimeout(() => {
    const sec = document.getElementById(`mcomments-${id}`);
    if (sec) sec.classList.add('open');
  }, 50);
  showToast('Comentário adicionado!', 'success');
}
async function muralTogglePin(id) {
  try {
    await apiFetch(`/mural/avisos/${id}/pin`, { method: 'POST' });
    await loadMuralAvisos();
  } catch (e) { console.error(e); return; }
  const a = muralAvisos.find(x => x.id === id);
  muralRenderAvisos();
  showToast(a && a.pinned ? 'Aviso fixado!' : 'Aviso desafixado.', 'info');
}
function muralShare(id) {
  const a = muralAvisos.find(x => x.id === id);
  showToast(`Link do aviso "${(a?.title||'').substring(0,30)}…" copiado!`, 'success');
}

window.muralDeleteAviso = async function(id) {
  const a = muralAvisos.find(x => x.id === id);
  if (!a) return;
  if (!confirm(`Deseja realmente apagar o aviso "${a.title.substring(0,50)}"?`)) return;
  try {
    await apiFetch(`/mural/avisos/${id}`, { method: 'DELETE' });
    await loadMuralAvisos();
  } catch (e) { console.error(e); showToast('Erro ao apagar aviso.', 'info'); return; }
  muralUpdateStats();
  muralRenderAvisos();
  showToast('Aviso apagado.', 'info');
};

window.muralOpenEdit = function(id) {
  const a = muralAvisos.find(x => x.id === id);
  if (!a) return;
  document.getElementById('muralEditModal')?.remove();
  const modal = document.createElement('div');
  modal.id = 'muralEditModal';
  modal.className = 'mural-edit-modal-overlay';
  const regioes = ['Centro','Av. Paulista','Zona Norte','Zona Sul','Zona Leste','Zona Oeste'];
  modal.innerHTML = `
    <div class="mural-edit-modal-card">
      <div class="mural-modal-header" style="margin-bottom:16px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:36px;height:36px;border-radius:10px;background:#dbeafe;display:flex;align-items:center;justify-content:center;">
            <i class="fa-solid fa-pen" style="color:#2563eb;font-size:14px;"></i>
          </div>
          <div>
            <div style="font-weight:700;font-size:15px;color:var(--text-primary);">Editar Aviso</div>
            <div style="font-size:11px;color:var(--text-muted);">Atualize as informações do aviso</div>
          </div>
        </div>
        <button onclick="document.getElementById('muralEditModal').remove()" style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:18px;padding:4px;"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="mural-form-group" style="margin-bottom:12px;">
        <label class="mural-form-label">TITULO *</label>
        <input class="mural-form-input" id="mEditTitle" maxlength="80" style="font-size:13px;padding:10px 12px;"/>
      </div>
      <div class="mural-form-group" style="margin-bottom:12px;">
        <label class="mural-form-label">DESCRICAO</label>
        <textarea class="mural-form-input" id="mEditDesc" rows="3" style="font-size:13px;padding:10px 12px;resize:vertical;"></textarea>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
        <div class="mural-form-group">
          <label class="mural-form-label">TIPO</label>
          <select class="mural-form-select" id="mEditTipo">
            <option value="urgente">Urgente</option>
            <option value="atencao">Atencao</option>
            <option value="info">Informativo</option>
            <option value="concluido">Concluido</option>
            <option value="planejado">Planejado</option>
          </select>
        </div>
        <div class="mural-form-group">
          <label class="mural-form-label">REGIAO</label>
          <select class="mural-form-select" id="mEditRegiao">
            ${regioes.map(r => `<option>${r}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="mural-modal-footer">
        <button class="mural-btn-secondary" onclick="document.getElementById('muralEditModal').remove()">Cancelar</button>
        <button class="btn-primary" onclick="muralSaveEdit(${id})"><i class="fa-solid fa-floppy-disk"></i> Salvar</button>
      </div>
    </div>`;
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
  // Set values after DOM insertion
  document.getElementById('mEditTitle').value = a.title;
  document.getElementById('mEditDesc').value  = a.desc;
  document.getElementById('mEditTipo').value  = a.tipo;
  document.getElementById('mEditRegiao').value= a.regiao;
};

window.muralSaveEdit = async function(id) {
  const title = document.getElementById('mEditTitle')?.value.trim();
  if (!title) { showToast('Informe o titulo do aviso.', 'info'); return; }
  const payload = {
    title,
    desc:   document.getElementById('mEditDesc')?.value.trim() || '',
    tipo:   document.getElementById('mEditTipo')?.value,
    regiao: document.getElementById('mEditRegiao')?.value
  };
  try {
    await apiFetch(`/mural/avisos/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    await loadMuralAvisos();
  } catch (e) { console.error(e); showToast('Erro ao atualizar aviso.', 'info'); return; }
  document.getElementById('muralEditModal')?.remove();
  muralUpdateStats();
  muralRenderAvisos();
  showToast('Aviso atualizado!', 'success');
};

// ── POST ──
function muralOpenModal() {
  document.getElementById('muralModal')?.classList.add('open');
  document.getElementById('mModalTitle')?.focus();
}
function muralCloseModal() {
  document.getElementById('muralModal')?.classList.remove('open');
}
async function muralPostAviso() {
  const title  = document.getElementById('mModalTitle')?.value.trim();
  const desc   = document.getElementById('mModalDesc')?.value.trim();
  const tipo   = document.getElementById('mModalTipo')?.value;
  const regiao = document.getElementById('mModalRegiao')?.value;
  const local  = document.getElementById('mModalLocal')?.value.trim();
  if (!title) { showToast('Informe o título do aviso.', 'info'); return; }
  try {
    await apiFetch('/mural/avisos', {
      method: 'POST',
      body: JSON.stringify({
        idUsuario: getUsuarioId(),
        tipo, regiao, title,
        desc: desc || (local ? `Local: ${local}` : 'Sem descrição adicional.')
      })
    });
    await loadMuralAvisos();
  } catch (e) { console.error(e); showToast('Erro ao publicar aviso.', 'info'); return; }
  muralCloseModal();
  if (document.getElementById('mModalTitle')) document.getElementById('mModalTitle').value = '';
  if (document.getElementById('mModalDesc'))  document.getElementById('mModalDesc').value  = '';
  if (document.getElementById('mModalLocal')) document.getElementById('mModalLocal').value = '';
  muralUpdateStats();
  muralRenderAvisos();
  showToast('Aviso publicado com sucesso!', 'success');
}
async function muralPostQuick() {
  const title  = document.getElementById('mQuickTitle')?.value.trim();
  const tipo   = document.getElementById('mQuickTipo')?.value;
  const regiao = document.getElementById('mQuickRegiao')?.value;
  if (!title) { showToast('Informe o título do aviso rápido.', 'info'); return; }
  try {
    await apiFetch('/mural/avisos', {
      method: 'POST',
      body: JSON.stringify({ idUsuario: getUsuarioId(), tipo, regiao, title, desc: '' })
    });
    await loadMuralAvisos();
  } catch (e) { console.error(e); showToast('Erro ao publicar aviso.', 'info'); return; }
  if (document.getElementById('mQuickTitle')) { document.getElementById('mQuickTitle').value = ''; document.getElementById('mQuickTitleCount').textContent = '0/60'; }
  muralUpdateStats();
  muralRenderAvisos();
  showToast('Aviso rápido publicado!', 'success');
}
function muralUpdateStats() {
  const u = muralAvisos.filter(a => a.tipo === 'urgente').length;
  const at = muralAvisos.filter(a => a.tipo === 'atencao').length;
  const c = muralAvisos.filter(a => a.tipo === 'concluido').length;
  if (document.getElementById('mStatUrgente'))  document.getElementById('mStatUrgente').textContent  = u;
  if (document.getElementById('mStatAtencao'))  document.getElementById('mStatAtencao').textContent  = at;
  if (document.getElementById('mStatResolvido'))document.getElementById('mStatResolvido').textContent = c;
}
function muralCharCount(el, cntId, max) {
  const c = document.getElementById(cntId);
  if (c) c.textContent = `${el.value.length}/${max}`;
}

// ── CHAT ──
function muralRenderChat() {
  const container = document.getElementById('muralChatMessages');
  if (!container) return;
  container.innerHTML = muralChatMessages.map(m => `
    <div class="mural-chat-msg ${m.author.isMe?'me':''}">
      <div class="mural-chat-msg-avatar" style="background:${m.author.color};">${m.author.initials}</div>
      <div class="mural-chat-bubble">
        <div class="mural-bubble-author">${m.author.name}</div>
        <div class="mural-bubble-text">${m.text}</div>
        <div class="mural-bubble-time">${muralFmtTime(m.time)}</div>
      </div>
    </div>
  `).join('');
  container.scrollTop = container.scrollHeight;
}
async function muralSendChat() {
  const input = document.getElementById('muralChatInput');
  const text = input?.value.trim();
  if (!text) return;
  try {
    await apiFetch('/mural/chat', {
      method: 'POST',
      body: JSON.stringify({ idUsuario: getUsuarioId(), texto: text })
    });
    await loadMuralChat();
  } catch (e) { console.error(e); return; }
  if (input) input.value = '';
  muralRenderChat();
}
function muralChatKey(e) { if (e.key === 'Enter') muralSendChat(); }
function muralSimulateReply() {
  const replies = ['Certo, anotado.','Entendido! Estamos verificando.','Ok, atualizando o sistema.','Roger! Já estou no local.','Confirmado. Equipe notificada.'];
  const replyUser = MURAL_USERS[Math.floor(Math.random() * (MURAL_USERS.length-1)) + 1];
  const typingEl = document.getElementById('muralTyping');
  const typingName = document.getElementById('muralTypingName');
  if (typingName) typingName.textContent = `${replyUser.name} está digitando…`;
  if (typingEl) typingEl.classList.add('visible');
  setTimeout(() => {
    if (typingEl) typingEl.classList.remove('visible');
    muralChatMessages.push({ author: replyUser, text: replies[Math.floor(Math.random()*replies.length)], time: new Date() });
    muralRenderChat();
  }, 1800 + Math.random()*1000);
}

// ── ACTIVE USERS ──
function muralRenderActiveUsers() {
  const container = document.getElementById('muralActiveUsers');
  if (!container) return;
  container.innerHTML = MURAL_USERS.map(u => `
    <div class="mural-active-row">
      <div class="mural-au-avatar" style="background:${u.color};">${u.initials}</div>
      <div style="flex:1;">
        <div class="mural-au-name">${u.name} ${u.isMe?'<span style="font-size:10px;color:var(--brand-blue-light);">(você)</span>':''}</div>
        <div class="mural-au-role">${u.role}</div>
      </div>
      <div class="mural-au-dot"></div>
    </div>
  `).join('');
}