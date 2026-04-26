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
    { id:1, color:"#ef4444", icon:"fa-triangle-exclamation", title:"Obra crítica — Viaduto do Chá", desc:"Impacto estimado de 91%. Sugerimos horário noturno (01h–05h) para início das obras.", time:"Há 5 min"   },
    { id:2, color:"#f59e0b", icon:"fa-chart-bar", title:"Pico detectado — Av. Paulista",  desc:"Volume 18% acima da média histórica para esta hora. Verifique câmeras.",               time:"Há 23 min"  },
    { id:3, color:"#3b82f6", icon:"fa-file-chart-column", title:"Relatório semanal disponível",    desc:"O relatório de tráfego de 01/07 a 07/07 está pronto para visualização.",                time:"Há 2 horas" },
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
    document.getElementById('lastUpdate').textContent =
      now.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
  };
  update();
  setInterval(update, 1000);
}

// ── KPIs ───────────────────────────────────────────────────

function initKPIs() {
  animateCount('kpiFlow', 0, MOCK_DATA.kpis.flow, 900, v => v.toLocaleString('pt-BR'));
  document.getElementById('kpiPeak').textContent   = MOCK_DATA.kpis.peak;
  document.getElementById('kpiWindow').textContent = MOCK_DATA.kpis.window;
  renderKpiCong();
}

function renderKpiCong() {
  const criticas = REGIOES.filter(r => r.nivel === 'Crítico');
  const el = document.getElementById('kpiCong');
  if (!el) return;
  el.innerHTML =
    `<span style="display:block;font-size:28px;font-weight:800;line-height:1;color:#ef4444;">${criticas.length}</span>` +
    (criticas.length === 0
      ? `<span style="display:block;font-size:12px;font-weight:500;color:var(--text-muted);line-height:1.4;">Nenhuma região crítica</span>`
      : criticas.map(r => `<span style="display:block;font-size:12px;font-weight:500;color:var(--text-muted);line-height:1.4;">${r.nome}</span>`).join('')
    );
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
  buildDayChart();
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

  const categorias = ['Crítico', 'Atenção', 'Estável'];

  const dados = categorias.map(cat =>
    REGIOES.filter(r => r.nivel === cat).length
  );

  chartDonut = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categorias,
      datasets: [{
        data: dados,
        backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
        borderWidth: 0,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',

      onClick: (evt, elements) => {
        if (!elements.length) {
          currentCriticalityFilter = null;
          updateDonutCenter(null, dados);
          updateDashboard();
          return;
        }

        const index = elements[0].index;
        const label = chartDonut.data.labels[index];

        // toggle filtro
        currentCriticalityFilter =
          currentCriticalityFilter === label ? null : label;

        updateDonutCenter(currentCriticalityFilter, dados);
        updateDashboard();
      },

      onHover: (event, elements) => {
        event.native.target.style.cursor =
          elements.length ? 'pointer' : 'default';
      },

      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 14,
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: true,
            font: { size: 11 }
          }
        },

        tooltip: {
          backgroundColor: '#0f172a',
          callbacks: {
            label: function(ctx) {
              const categoria = ctx.label;

              const regioes = REGIOES
                .filter(r => r.nivel === categoria)
                .map(r => r.nome);

              const MAX = 4;
              const lista = regioes.slice(0, MAX);
              const restante = regioes.length - MAX;

              return [
                ` ${regioes.length} regiões`,
                ...lista.map(r => `• ${r}`),
                restante > 0 ? `+ ${restante} mais...` : ''
              ];
            }
          }
        }
      }
    }
  });

  // Init center label
  updateDonutCenter(null, dados);
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

const MOCK_USERS = [
  { id:1,  nome:"Samara Freitas",    email:"samara.freitas@newroad.sp",    perfil:"Gestor",      regiao:"SP Region",    status:"ativo",    ultimo:"Hoje, 09:11",    avatar:"SF" },
  { id:2,  nome:"Giovanna Pina",        email:"giovanna.pina@newroad.sp",   perfil:"Analista",    regiao:"Zona Norte",   status:"ativo",    ultimo:"Hoje, 08:45",    avatar:"AR" },
  { id:3,  nome:"Leandro Almeida",        email:"leandro.almeida@newroad.sp",   perfil:"Operador",    regiao:"Zona Sul",     status:"ativo",    ultimo:"Ontem, 17:30",   avatar:"CM" },
  { id:4,  nome:"Gustavo Henrique",    email:"gustavo.henrique@newroad.sp",    perfil:"Analista",    regiao:"Zona Leste",   status:"inativo",  ultimo:"15/07/2025",     avatar:"PF" },
  { id:5,  nome:"Marcos Lopes",        email:"marcos.lopes@newroad.sp",   perfil:"Operador",    regiao:"Centro",       status:"ativo",    ultimo:"Hoje, 07:58",    avatar:"RA" },
  { id:6,  nome:"Juliana Costa",        email:"juliana.costa@newroad.sp",   perfil:"Gestor",      regiao:"SP Region",    status:"ativo",    ultimo:"Hoje, 09:02",    avatar:"JC" },
  { id:7,  nome:"Felipe Nunes",         email:"felipe.nunes@newroad.sp",    perfil:"Operador",    regiao:"Zona Oeste",   status:"pendente", ultimo:"Nunca",          avatar:"FN" },
  { id:8,  nome:"Mariana Teixeira",     email:"mariana.t@newroad.sp",       perfil:"Analista",    regiao:"Pinheiros",    status:"ativo",    ultimo:"Ontem, 14:22",   avatar:"MT" },
];

function loadPage(page) {
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
        <p class="subtitle">Dados atualizados em tempo real · <span id="lastUpdate"></span></p>
      </div>
      <button class="btn-primary" id="refreshBtn">
        <i class="fa-solid fa-rotate-right"></i> Atualizar
      </button>
    </div>

    <section class="kpi-grid">
      <div class="kpi-card" data-kpi="flow">
        <div class="kpi-icon flow"><i class="fa-solid fa-car"></i></div>
        <div class="kpi-info">
          <span class="kpi-label">Fluxo médio</span>
          <span class="kpi-value" id="kpiFlow">—</span>
          <span class="kpi-unit">Veículos/h</span>
        </div>
        <div class="kpi-trend up"><i class="fa-solid fa-arrow-trend-up"></i> +4.2%</div>
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
        <div class="kpi-icon cong"><i class="fa-solid fa-triangle-exclamation"></i></div>
        <div class="kpi-info">
          <span class="kpi-label">Região crítica</span>
          <span class="kpi-value" id="kpiCong">—</span>
          <span class="kpi-unit">Maior impacto atual</span>
        </div>
        <div class="kpi-trend down"><i class="fa-solid fa-arrow-trend-down"></i> -1.8%</div>
      </div>
    </section>

    <section class="charts-grid">
      <div class="chart-card wide">
        <div class="chart-header">
          <div><h3>Fluxo de Veículos por Horário</h3><p>Volume médio nas últimas 24h</p></div>
          <div class="chart-actions">
            <button class="chart-btn active" data-chart-filter="today">Hoje</button>
            <button class="chart-btn" data-chart-filter="week">Semana</button>
            <button class="chart-btn" data-chart-filter="month">Mês</button>
          </div>
        </div>
        <div class="chart-body"><canvas id="chartFlow"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="chart-header">
          <div><h3>Fluxo por Dia</h3><p>Média semanal</p></div>
        </div>
        <div class="chart-body"><canvas id="chartDay"></canvas></div>
      </div>
      <div class="chart-card slim">
        <div class="chart-header">
          <div><h3>Criticidade por Região</h3><p>Distribuição atual</p></div>
        </div>
        <div class="chart-body donut-wrap">
          <canvas id="chartDonut"></canvas>
          <div class="donut-center">
            <span id="donutLabel">2/5</span>
            <small>Críticas</small>
          </div>
        </div>
      </div>
    </section>

    <section class="map-section">
      <div class="section-header">
        <div><h2>Mapa de Obras e Pontos Críticos</h2><p>São Paulo · Dados em tempo real simulado</p></div>
        <div class="map-legend">
          <span class="legend-item"><span class="dot green"></span>Baixo impacto</span>
          <span class="legend-item"><span class="dot yellow"></span>Médio impacto</span>
          <span class="legend-item"><span class="dot red"></span>Alto impacto</span>
        </div>
      </div>
      <div class="map-container" id="map"></div>
    </section>

    <section class="table-section">
      <div class="section-header">
        <div><h2>Obras Planejadas e em Andamento</h2><p>Lista de intervenções viárias</p></div>
        <div class="table-controls">
          <input class="table-search" type="text" placeholder="Filtrar obras…" id="tableSearch"/>
          <button class="btn-outline"><i class="fa-solid fa-download"></i> Exportar</button>
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
  initMap();
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

  // Day filter
  const filterDay = document.getElementById('filterDay');
  if (filterDay) {
    filterDay.addEventListener('change', e => {
      const val = e.target.value;
      if (val === 'weekend') {
        chartDay.data.datasets[0].backgroundColor = ['#dbeafe','#dbeafe','#dbeafe','#dbeafe','#dbeafe','#2563eb','#2563eb'];
      } else if (val === 'weekday') {
        chartDay.data.datasets[0].backgroundColor = ['#2563eb','#2563eb','#2563eb','#2563eb','#2563eb','#dbeafe','#dbeafe'];
      } else {
        chartDay.data.datasets[0].backgroundColor = MOCK_DATA.dailyFlow.values.map((v, i) => i === 4 ? '#2563eb' : '#dbeafe');
      }
      chartDay.update();
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

function renderUsuariosPage(content) {
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

window.saveUser = function() {
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

  if (userModalMode === 'add') {
    MOCK_USERS.push({ id: Date.now(), nome, email, telefone, perfil, regiao, status, ultimo:'Agora', avatar: initials });
  } else {
    const u = MOCK_USERS.find(x => x.id === userEditId);
    if (u) Object.assign(u, { nome, email, telefone, perfil, regiao, status, avatar: initials });
  }

  closeUserModal();
  filterUsers();
  // re-render stats
  document.querySelectorAll('.kpi-value')[0].textContent = MOCK_USERS.length;
  document.querySelectorAll('.kpi-value')[1].textContent = MOCK_USERS.filter(u=>u.status==='ativo').length;
  document.querySelectorAll('.kpi-value')[2].textContent = MOCK_USERS.filter(u=>u.status==='pendente').length;
  document.querySelectorAll('.kpi-value')[3].textContent = MOCK_USERS.filter(u=>u.perfil==='Gestor').length;

  // Toast de sucesso
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

window.removeUser = function(id) {
  if (!confirm('Remover este usuário?')) return;
  const idx = MOCK_USERS.findIndex(u => u.id === id);
  if (idx > -1) MOCK_USERS.splice(idx, 1);
  filterUsers();
};

// ══════════════════════════════════════════════════════════════
//  PÁGINA: CONFIGURAÇÕES
// ══════════════════════════════════════════════════════════════
function renderSettingsPage(content) {
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
          <div class="settings-lean-avatar">EM</div>
          <div>
            <p class="settings-lean-name">Eng. Mateus Silva</p>
            <p class="settings-lean-role">Gestor SP · mateus.silva@newroad.sp</p>
          </div>
          <span class="status-pill status-completed" style="margin-left:auto;font-size:11px;">
            <i class="fa-solid fa-circle-check"></i> 2FA ativa
          </span>
        </div>

        <div class="settings-lean-grid">
          <div class="form-group">
            <label>Nome</label>
            <input type="text" class="form-input" value="Eng. Mateus Silva" id="cfgNome"/>
          </div>
          <div class="form-group">
            <label>E-mail</label>
            <input type="email" class="form-input" value="mateus.silva@newroad.sp" id="cfgEmail"/>
          </div>
          <div class="form-group">
            <label>Região padrão</label>
            <select class="form-input" id="cfgRegiao">
              <option selected>SP Region (todas)</option>
              <option>Zona Norte</option><option>Zona Sul</option>
              <option>Zona Leste</option><option>Zona Oeste</option><option>Centro</option>
            </select>
          </div>
          <div class="form-group">
            <label>Atualização automática</label>
            <select class="form-input" id="cfgInterval">
              <option>30 segundos</option>
              <option selected>1 minuto</option>
              <option>5 minutos</option>
              <option>Desativado</option>
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
            <label class="toggle-switch"><input type="checkbox" checked id="tgCritica"/><span class="toggle-slider"></span></label>
          </div>
          <div class="toggle-row">
            <div><p class="toggle-label">Picos de tráfego</p><p class="toggle-desc">Volume acima da média</p></div>
            <label class="toggle-switch"><input type="checkbox" checked id="tgPico"/><span class="toggle-slider"></span></label>
          </div>
          <div class="toggle-row">
            <div><p class="toggle-label">Relatórios semanais</p><p class="toggle-desc">Toda segunda-feira</p></div>
            <label class="toggle-switch"><input type="checkbox" checked id="tgRelatorio"/><span class="toggle-slider"></span></label>
          </div>
          <div class="toggle-row">
            <div><p class="toggle-label">Modo escuro</p><p class="toggle-desc">Tema escuro na interface</p></div>
            <label class="toggle-switch"><input type="checkbox" id="tgDark"/><span class="toggle-slider"></span></label>
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

window.saveSettings = function() {
  const nome = document.getElementById('cfgNome')?.value;
  if (nome) {
    document.querySelector('.user-name').textContent = nome.split(' ').slice(0,2).join(' ');
  }
  const btn = document.querySelector('.btn-primary');
  const orig = btn.innerHTML;
  btn.innerHTML = '<i class="fa-solid fa-check"></i> Salvo!';
  btn.style.background = '#10b981';
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
  const urgLabel = ['Urgente', 'Alta', 'Média', 'Baixa'][r.kpis.urgencia - 1] || 'Normal';

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
          <span class="kpi-unit">Veículos/h · Hoje</span>
        </div>
        <div class="kpi-trend ${r.kpis.trend.startsWith('+') ? 'up' : 'down'}">
          <i class="fa-solid fa-arrow-trend-${r.kpis.trend.startsWith('+') ? 'up' : 'down'}"></i> ${r.kpis.trend}
        </div>
      </div>
      <div class="kpi-card" style="border-top:3px solid #f59e0b;">
        <div class="kpi-icon cong"><i class="fa-solid fa-gauge-high"></i></div>
        <div class="kpi-info">
          <span class="kpi-label">Grau de Urgência</span>
          <span class="kpi-value" style="font-size:16px;">${urgLabel}</span>
          <span class="kpi-unit">Prioridade ${r.kpis.urgencia}ª na cidade</span>
        </div>
        <div class="kpi-trend neutral kpi-urgency-tooltip-trigger" style="cursor:help;position:relative;">
          <i class="fa-solid fa-list-ol"></i> Ranking
          <div class="kpi-urgency-tooltip">
            <div class="kpi-urgency-tooltip-title"><i class="fa-solid fa-ranking-star"></i> Ranking de Urgência — SP</div>
            ${Object.entries(REGIONAL_DATA)
              .sort((a,b) => a[1].kpis.urgencia - b[1].kpis.urgencia)
              .map(([k, reg]) => {
                const uLabels = ['Urgente','Alta','Média','Baixa'];
                const uColors = ['#ef4444','#f59e0b','#f59e0b','#10b981'];
                const uIdx = reg.kpis.urgencia - 1;
                const isCurrentRegion = k === regionKey;
                return `<div class="kpi-urgency-row${isCurrentRegion ? ' current' : ''}">
                  <span class="kpi-urgency-pos">${reg.kpis.urgencia}°</span>
                  <span class="kpi-urgency-name">${reg.nome}</span>
                  <span class="kpi-urgency-badge" style="background:${uColors[uIdx]}20;color:${uColors[uIdx]};">${uLabels[uIdx]}</span>
                </div>`;
              }).join('')}
          </div>
        </div>
      </div>
    </section>

    <!-- CHARTS GRID REGIONAL -->
    <section class="charts-grid">

      <!-- Fluxo por hora -->
      <div class="chart-card wide">
        <div class="chart-header">
          <div>
            <h3>Fluxo de Veículos por Horário — ${r.nome}</h3>
            <p>Volume médio nas últimas 24h · Áreas vermelhas = horário crítico</p>
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
          <div><h3>Congestionamento Atual</h3><p>Índice por faixa horária (%)</p></div>
        </div>
        <div class="chart-body"><canvas id="chartCong"></canvas></div>
      </div>

      <!-- Score de impacto por janela -->
      <div class="chart-card slim">
        <div class="chart-header">
          <div>
            <h3 style="display:flex;align-items:center;gap:6px;">
              Janela Ideal
              <span class="window-score-info-icon" title="">
                <i class="fa-solid fa-circle-question" style="font-size:13px;color:var(--text-muted);cursor:help;"></i>
                <div class="window-score-tooltip">
                  <div style="font-weight:700;font-size:12px;margin-bottom:6px;color:#10b981;"><i class="fa-solid fa-circle-check"></i> O que é o Score de Viabilidade?</div>
                  <p style="font-size:11px;line-height:1.5;margin-bottom:6px;">Indica o <strong>quão favorável</strong> é a janela horária recomendada para execução de obras nesta região.</p>
                  <p style="font-size:11px;line-height:1.5;">O score considera: volume de tráfego, fluxo de pedestres, histórico de congestionamento e eventos externos. <strong>Quanto maior, melhor a janela.</strong></p>
                  <div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.1);font-size:10px;color:#94a3b8;">
                    <span style="background:#10b98120;color:#10b981;padding:2px 6px;border-radius:4px;margin-right:4px;">≥ 80</span>Ótimo ·
                    <span style="background:#f59e0b20;color:#f59e0b;padding:2px 6px;border-radius:4px;margin:0 4px;">60–79</span>Bom ·
                    <span style="background:#ef444420;color:#ef4444;padding:2px 6px;border-radius:4px;margin-left:4px;">< 60</span>Restrito
                  </div>
                </div>
              </span>
            </h3>
            <p>${r.windowData.label}</p>
          </div>
        </div>
        <div class="chart-body donut-wrap">
          <canvas id="chartWindow"></canvas>
          <div class="donut-center">
            <span id="windowScore">${r.windowData.score}</span>
            <small>Score</small>
          </div>
        </div>
        <p style="font-size:11px;color:var(--text-muted);padding:8px 14px 12px;font-style:italic;line-height:1.4;">"${r.windowData.motivo}"</p>
      </div>
    </section>

   

    <!-- RANKING DE URGÊNCIA -->
    <section class="table-section">
      <div class="section-header">
        <div>
          <h2>Grau de Urgência — Ranking de Obras</h2>
          <p>Obras ordenadas por prioridade de execução na ${r.nome}</p>
        </div>
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Prioridade</th>
              <th>Localização</th>
              <th>Tipo de Obra</th>
              <th>Data de Início</th>
              <th>Impacto Estimado</th>
              <th>Urgência</th>
              <th>Melhor Horário</th>
              <th>Ações</th>
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
              return `
              <tr>
                <td>
                  <div style="display:flex;align-items:center;gap:8px;">
                    <div style="width:32px;height:32px;border-radius:50%;background:${ub};color:${uc};font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;">${obra.urgencia}°</div>
                  </div>
                </td>
                <td><div class="table-location">${obra.local}<small>${r.nome}</small></div></td>
                <td style="font-size:12px;">${obra.tipo}</td>
                <td style="font-size:12px;color:var(--text-secondary);">
                  <i class="fa-regular fa-calendar" style="margin-right:4px;color:var(--text-muted);"></i>${dataStr}
                </td>
                <td>
                  <div class="impact-bar">
                    <div class="impact-bar-bg">
                      <div class="impact-bar-fill" style="width:${obra.impacto}%;background:${ic};"></div>
                    </div>
                    <span class="impact-pct" style="color:${ic};">${obra.impacto}%</span>
                  </div>
                </td>
                <td>
                  <span style="display:inline-block;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;background:${ub};color:${uc};">${ul}</span>
                </td>
                <td style="color:#10b981;font-weight:600;font-size:13px;">
                  <i class="fa-solid fa-check" style="margin-right:4px;"></i>${r.kpis.janelaIdeal.split(' ')[0]}
                </td>
                <td>
                  <button class="action-btn ver-obra-btn" title="Ver cadastro da obra em Planejamento de Obras" onclick="goToObraPlanning('${obra.local.replace(/'/g, "\\'")}')" style="display:inline-flex;align-items:center;gap:5px;font-size:12px;color:#2563eb;background:#dbeafe;padding:5px 10px;border-radius:6px;border:none;cursor:pointer;font-weight:600;white-space:nowrap;">
                    <i class="fa-solid fa-helmet-safety"></i> Ver obra
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

  // ── Janela score donut ──
  const windowCtx = document.getElementById('chartWindow')?.getContext('2d');
  if (windowCtx) {
    const score = r.windowData.score;
    new Chart(windowCtx, {
      type: 'doughnut',
      data: {
        labels: ['Score', 'Restante'],
        datasets: [{ data: [score, 100 - score], backgroundColor: ['#10b981', '#f1f5f9'], borderWidth: 0, hoverOffset: 0 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '72%',
        plugins: { legend: { display: false }, tooltip: { enabled: false } }
      }
    });
  }

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

// Extended obras data — espelha MOCK_DATA.obras + campos extras
const OBRAS_CADASTRADAS = [
  {
    id:1, local:"Av. Paulista, 1578", bairro:"Bela Vista", tipo:"Recapeamento",
    dataInicio:"2025-07-10", duracao:18, impacto:72, status:"ongoing",
    lat:-23.5631, lng:-46.6542, marcador:"red",
    urgencia:"alta", grauUrgencia:5,
    descricao:"Recapeamento total da via com troca de guias"
  },
  {
    id:2, local:"R. da Consolação", bairro:"Consolação", tipo:"Galeria de drenagem",
    dataInicio:"2025-07-22", duracao:30, impacto:88, status:"planned",
    lat:-23.5569, lng:-46.6580, marcador:"red",
    urgencia:"urgente", grauUrgencia:3,
    descricao:"Instalação de nova galeria pluvial"
  },
  {
    id:3, local:"Av. Ipiranga, 200", bairro:"República", tipo:"Sinalização viária",
    dataInicio:"2025-07-05", duracao:5, impacto:28, status:"completed",
    lat:-23.5445, lng:-46.6394, marcador:"green",
    urgencia:"baixa", grauUrgencia:15,
    descricao:"Atualização de faixas e placas de sinalização"
  },
  {
    id:4, local:"Viaduto do Chá", bairro:"Centro", tipo:"Estrutural",
    dataInicio:"2025-08-01", duracao:45, impacto:91, status:"planned",
    lat:-23.5461, lng:-46.6370, marcador:"red",
    urgencia:"urgente", grauUrgencia:2,
    descricao:"Reforço estrutural das vigas e pilares"
  },
  {
    id:5, local:"Av. Rebouças, 3200", bairro:"Pinheiros", tipo:"Pavimentação",
    dataInicio:"2025-07-15", duracao:12, impacto:48, status:"ongoing",
    lat:-23.5598, lng:-46.6733, marcador:"yellow",
    urgencia:"media", grauUrgencia:10,
    descricao:"Pavimentação de trecho deteriorado"
  },
  {
    id:6, local:"Av. Brigadeiro Faria Lima", bairro:"Pinheiros", tipo:"Rede elétrica",
    dataInicio:"2025-07-20", duracao:8, impacto:55, status:"planned",
    lat:-23.5680, lng:-46.6932, marcador:"yellow",
    urgencia:"media", grauUrgencia:12,
    descricao:"Substituição de cabos e postes na via"
  },
  {
    id:7, local:"Rua Augusta, 800", bairro:"Cerqueira César", tipo:"Calçada acessível",
    dataInicio:"2025-07-08", duracao:6, impacto:18, status:"completed",
    lat:-23.5554, lng:-46.6588, marcador:"green",
    urgencia:"baixa", grauUrgencia:20,
    descricao:"Adequação de calçadas às normas de acessibilidade"
  },
  {
    id:8, local:"Av. 9 de Julho", bairro:"Jardins", tipo:"Canalização",
    dataInicio:"2025-08-10", duracao:22, impacto:62, status:"planned",
    lat:-23.5635, lng:-46.6653, marcador:"yellow",
    urgencia:"alta", grauUrgencia:7,
    descricao:"Canalização de córrego e galerias pluviais"
  },
  {
    id:9, local:"Av. Radial Leste", bairro:"Brás", tipo:"Recapeamento",
    dataInicio:"2025-07-12", duracao:20, impacto:45, status:"ongoing",
    lat:-23.5420, lng:-46.6080, marcador:"yellow",
    urgencia:"media", grauUrgencia:14,
    descricao:"Recapeamento asfáltico em trecho degradado"
  },
  {
    id:10, local:"Tnel. Jânio Quadros", bairro:"Barra Funda", tipo:"Inspeção estrutural",
    dataInicio:"2025-07-30", duracao:3, impacto:80, status:"planned",
    lat:-23.5243, lng:-46.6575, marcador:"red",
    urgencia:"urgente", grauUrgencia:4,
    descricao:"Inspeção e diagnóstico estrutural do túnel"
  },
];

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

  // Find greenest days in CALENDAR_DATA
  const greenDays = Object.entries(CALENDAR_DATA)
    .filter(([d, data]) => data.quality === 'green')
    .map(([d]) => parseInt(d));

  const bestDay = greenDays.length ? Math.min(...greenDays) : '—';
  const monthNames = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const monthLabel = monthNames[obrasCalendarMonth - 1];

  const regionLabels = {
    all: 'Todas as regiões', centro: 'Centro', paulista: 'Av. Paulista',
    norte: 'Zona Norte', sul: 'Zona Sul', leste: 'Zona Leste', oeste: 'Zona Oeste'
  };

  return {
    day: bestDay !== '—' ? `Dia ${bestDay}/${monthLabel}` : '—',
    region: regionLabels[region] || 'Todas as regiões',
    window: '01h–05h'
  };
}

function renderObrasPage(content) {
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

        <!-- FIXED MINI MAP -->
        <div class="obras-minimap-fixed-card">
          <div class="register-header" style="padding:12px 16px;">
            <h3 style="font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px;">
              <i class="fa-solid fa-map-location-dot" style="color:var(--brand-blue);"></i>
              Mapa de Obras
            </h3>
            <span style="font-size:11px;color:var(--text-muted);" id="mapObraCount">${OBRAS_CADASTRADAS.length} obras</span>
          </div>
          <div id="obrasFixedMap" style="height:220px;width:100%;"></div>
        </div>

        <!-- EXTERNAL FACTORS -->
        <div class="factors-card">
          <div class="factors-header">
            <i class="fa-solid fa-globe" style="font-size:16px;color:var(--brand-blue);"></i>
            <div>
              <h3>Fatores Externos</h3>
              <p style="font-size:11px;color:var(--text-muted);">Clima e eventos que impactam o tráfego</p>
            </div>
          </div>
          <div class="factors-list">
            ${EXTERNAL_FACTORS.map(f => `
              <div class="factor-item">
                <div class="factor-icon" style="background:${f.iconBg};font-size:13px;"><i class="${f.faIcon || 'fa-solid fa-circle-info'}" style="color:${f.iconColor || '#64748b'};"></i></div>
                <div class="factor-info">
                  <div class="factor-name">${f.name}</div>
                  <div class="factor-desc">${f.desc}</div>
                </div>
                <span class="factor-badge ${f.impactCls}">${f.impact}</span>
              </div>
            `).join('')}
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
  setTimeout(() => initObrasFixedMap(), 200);
}

let obrasFixedMap = null;
function initObrasFixedMap() {
  const container = document.getElementById('obrasFixedMap');
  if (!container) return;
  if (obrasFixedMap) { obrasFixedMap.remove(); obrasFixedMap = null; }

  obrasFixedMap = L.map('obrasFixedMap', {
    center: [-23.5505, -46.6333],
    zoom: 11,
    zoomControl: false,
    attributionControl: false,
    dragging: true,
    scrollWheelZoom: false
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(obrasFixedMap);

  OBRAS_CADASTRADAS.forEach(o => {
    const col = o.marcador === 'red' ? '#ef4444' : o.marcador === 'yellow' ? '#f59e0b' : '#10b981';
    L.circleMarker([o.lat, o.lng], {
      radius: 7, color: col, fillColor: col, fillOpacity: 0.85, weight: 2
    }).addTo(obrasFixedMap).bindTooltip(`<b>${o.local}</b><br>${o.tipo} · ${o.impacto}% impacto`);
  });

  // Update count
  const countEl = document.getElementById('mapObraCount');
  if (countEl) countEl.textContent = OBRAS_CADASTRADAS.length + ' obras';
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
    const data = CALENDAR_DATA[d] || { quality: 'neutral', clima: '—', eventos: [], obs: '' };
    const hasEvents = data.eventos && data.eventos.length > 0;
    const div = document.createElement('div');
    div.className = `cal-day day-${data.quality}${(isCurrentMonth && d === today.getDate()) ? ' today' : ''}${hasEvents ? ' has-events' : ''}`;
    div.innerHTML = `${d}${hasEvents ? '<span class="cal-event-dot"></span>' : ''}`;
    div.addEventListener('mouseenter', (e) => showCalTooltip(e, d, data));
    div.addEventListener('mouseleave', hideCalTooltip);
    div.addEventListener('mousemove', (e) => moveCalTooltip(e));
    div.addEventListener('click', (e) => { hideCalTooltip(); openEventModal(d, data); });
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

window.saveNewObra = function() {
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

  const newObra = {
    id: Date.now(), local, bairro, tipo, dataInicio,
    duracao, impacto, status, lat, lng, marcador,
    urgencia: urgenciaLabel, grauUrgencia: urgencia
  };

  OBRAS_CADASTRADAS.push(newObra);
  // Also add to global MOCK_DATA.obras for the dashboard
  MOCK_DATA.obras.push({ ...newObra, duracao: duracao + ' dias' });

  closeNewObraForm();
  filterObrasTable();
  setTimeout(() => initObrasFixedMap(), 100);

  // Flash success
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

window.changeObraStatus = function(id, newStatus) {
  const obra = OBRAS_CADASTRADAS.find(o => o.id === id);
  if (obra) {
    obra.status = newStatus;
    // Update MOCK_DATA too
    const mo = MOCK_DATA.obras.find(o => o.id === id);
    if (mo) mo.status = newStatus;
  }
};

window.deleteObra = function(id) {
  if (!confirm('Remover esta obra?')) return;
  const idx = OBRAS_CADASTRADAS.findIndex(o => o.id === id);
  if (idx > -1) OBRAS_CADASTRADAS.splice(idx, 1);
  const midx = MOCK_DATA.obras.findIndex(o => o.id === id);
  if (midx > -1) MOCK_DATA.obras.splice(midx, 1);
  filterObrasTable();
  setTimeout(() => initObrasFixedMap(), 100);
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

window.saveEditObra = function(id) {
  const obra = OBRAS_CADASTRADAS.find(o => o.id === id);
  if (!obra) return;

  obra.local = document.getElementById('editLocal').value.trim() || obra.local;
  obra.bairro = document.getElementById('editBairro').value.trim() || obra.bairro;
  obra.tipo = document.getElementById('editTipo').value.trim() || obra.tipo;
  obra.dataInicio = document.getElementById('editDataInicio').value || obra.dataInicio;
  obra.duracao = parseInt(document.getElementById('editDuracao').value) || obra.duracao;
  obra.impacto = parseInt(document.getElementById('editImpacto').value) || obra.impacto;
  obra.status = document.getElementById('editStatus').value;
  obra.grauUrgencia = parseInt(document.getElementById('editUrgencia').value) || obra.grauUrgencia;
  obra.marcador = obra.impacto >= 70 ? 'red' : obra.impacto >= 40 ? 'yellow' : 'green';

  // Update MOCK_DATA too
  const mo = MOCK_DATA.obras.find(o => o.id === id);
  if (mo) Object.assign(mo, obra, { duracao: obra.duracao + ' dias' });

  closeEditModal();
  filterObrasTable();

  // Refresh fixed map
  setTimeout(() => initObrasFixedMap(), 100);
};

window.focusObraOnMap = function(lat, lng) {
  if (obrasFixedMap) {
    obrasFixedMap.flyTo([lat, lng], 15, { duration: 1 });
    // Scroll map into view
    const mapEl = document.getElementById('obrasFixedMap');
    if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};
