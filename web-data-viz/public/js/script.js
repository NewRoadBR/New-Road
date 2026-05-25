/* ═══════════════════════════════════════════════════════════
   NEWROAD — script.js  (versão dinâmica — dados via API)
   Toda leitura/escrita passa por /api/*
   Estrutura: SPA com roteador loadPage()
═══════════════════════════════════════════════════════════ */

// ── CONFIG ───────────────────────────────────────────────
const API = '';          // mesma origem; troque se o back rodar em porta separada
const USUARIO_ID = 1;    // substituir pelo id retornado no login/sessão

// ── ESTADO GLOBAL ────────────────────────────────────────
let map, markersLayer;
let chartFlow, chartDay, chartDonut;
let currentFilter   = 'today';
let obrasCache      = [];   // cache das obras carregadas
let usuariosCache   = [];   // cache dos usuários carregados
let avisosCacheArr  = [];   // cache dos avisos

// Dados fixos de fluxo de tráfego (esses ficam estáticos pois não vêm do BD de obras)
const FLOW_DATA = {
  todayLabels: ['00h','01h','02h','03h','04h','05h','06h','07h','08h','09h','10h','11h','12h','13h','14h','15h','16h','17h','18h','19h','20h','21h','22h','23h'],
  today:  [980,640,430,310,280,520,1850,4200,5100,4600,3800,3500,3900,3700,3600,3800,4300,5200,5400,4100,2900,2100,1600,1200],
  weekLabels: ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'],
  week:   [52400,49800,51200,50600,58100,36200,27400],
  monthLabels: ['01/07','08/07','15/07','22/07','29/07'],
  month:  [48200,51200,52600,49800,47300],
  dailyLabels: ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'],
  daily:  [52000,49800,51400,50200,57800,38400,28200]
};

const CONG_SPEED_DATA = [
  { via:'Av. Paulista',   velocidade:12 },
  { via:'Marginal Tietê', velocidade:28 },
  { via:'Av. Rebouças',   velocidade:48 },
  { via:'Radial Leste',   velocidade:9  },
  { via:'Av. Faria Lima', velocidade:62 },
  { via:'Av. Brigadeiro', velocidade:75 },
];

// ── HTTP HELPER ──────────────────────────────────────────
async function apiFetch(endpoint, opts = {}) {
  const res = await fetch(API + endpoint, {
    headers: { 'Content-Type': 'application/json' },
    ...opts
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg);
  }
  // 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

// ── TOAST ────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;';
    document.body.appendChild(container);
  }
  const colors = { success:'#10b981', error:'#ef4444', info:'#3b82f6', warning:'#f59e0b' };
  const icons  = { success:'fa-check-circle', error:'fa-circle-xmark', info:'fa-circle-info', warning:'fa-triangle-exclamation' };
  const t = document.createElement('div');
  t.style.cssText = `background:#0f172a;color:white;padding:12px 18px;border-radius:10px;font-size:13px;
    display:flex;align-items:center;gap:10px;box-shadow:0 8px 24px rgba(0,0,0,.3);
    border-left:4px solid ${colors[type]||colors.info};min-width:240px;animation:slideIn .3s ease;`;
  t.innerHTML = `<i class="fa-solid ${icons[type]||icons.info}" style="color:${colors[type]||colors.info}"></i>${msg}`;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

// ── INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderDashboardPage(document.getElementById('mainContent'));
  initNotifications();
  initInteractions();
});

function initTimestamp() {
  const update = () => {
    const now = new Date();
    const diaSemana = now.toLocaleDateString('pt-BR', { weekday:'long' });
    const diaFmt = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
    const data = now.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric' });
    const hora = now.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
    const el = document.getElementById('lastUpdate');
    if (el) el.textContent = `${diaFmt} · ${data} · ${hora}`;
  };
  update();
  setInterval(update, 1000);
}

// ════════════════════════════════════════════════════════
//  DASHBOARD
// ════════════════════════════════════════════════════════

function renderDashboardPage(content) {
  [chartFlow, chartDay, chartDonut].forEach(c => { if (c) { c.destroy(); } });
  chartFlow = chartDay = chartDonut = null;
  if (map) { map.remove(); map = null; markersLayer = null; }

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
        <div class="kpi-icon flow"><i class="fa-solid fa-arrow-right-arrow-left"></i></div>
        <div class="kpi-info">
          <span class="kpi-label">Impacto estimado de intervenção</span>
          <span class="kpi-value" id="kpiFlow">—</span>
          <span class="kpi-unit">Evitar intervenções entre 07h–09h e 17h–19h</span>
        </div>
        <div class="kpi-trend down" id="kpiFlowInsight"><i class="fa-solid fa-triangle-exclamation"></i> Impacto</div>
      </div>
      <div class="kpi-card" data-kpi="obras">
        <div class="kpi-icon peak"><i class="fa-solid fa-helmet-safety"></i></div>
        <div class="kpi-info">
          <span class="kpi-label">Obras em andamento</span>
          <span class="kpi-value" id="kpiObrasAndamento">—</span>
          <span class="kpi-unit">intervenções ativas</span>
        </div>
        <div class="kpi-trend neutral"><i class="fa-solid fa-minus"></i> <span id="kpiObrasTrend">carregando</span></div>
      </div>
      <div class="kpi-card" data-kpi="window">
        <div class="kpi-icon window"><i class="fa-solid fa-calendar-check"></i></div>
        <div class="kpi-info">
          <span class="kpi-label">Melhor janela para obras</span>
          <span class="kpi-value" id="kpiWindow">01h–05h</span>
          <span class="kpi-unit">Janela ideal — menor tráfego</span>
        </div>
        <div class="kpi-trend up"><i class="fa-solid fa-check"></i> Recomendado</div>
      </div>
      <div class="kpi-card" data-kpi="cong">
        <div class="kpi-icon window"><i class="fa-solid fa-circle-check"></i></div>
        <div class="kpi-info">
          <span class="kpi-label">Obras concluídas</span>
          <span class="kpi-value" id="kpiObrasConcluidas">—</span>
          <span class="kpi-unit">total de intervenções finalizadas</span>
        </div>
        <div class="kpi-trend up"><i class="fa-solid fa-check"></i> Atualizado</div>
      </div>
    </section>

    <section class="charts-grid">
      <div class="chart-card wide">
        <div class="chart-header">
          <div><h3>Fluxo de Veículos por Horário</h3><p>Volume médio histórico</p></div>
          <div style="display:flex;gap:6px;">
            <button class="btn-chip active" data-chart-filter="today">Hoje</button>
            <button class="btn-chip" data-chart-filter="week">Semana</button>
            <button class="btn-chip" data-chart-filter="month">Mês</button>
          </div>
        </div>
        <div class="chart-body"><canvas id="chartFlow"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="chart-header">
          <div><h3>Congestionamento por Via</h3><p>Velocidade média registrada</p></div>
        </div>
        <div class="chart-body" id="congSpeedChart" style="display:flex;flex-direction:column;gap:10px;justify-content:center;padding:12px 4px;"></div>
      </div>
      <div class="chart-card slim">
        <div class="chart-header">
          <div><h3>Volume por Dia da Semana</h3><p>Média histórica</p></div>
        </div>
        <div class="chart-body"><canvas id="chartDonut"></canvas></div>
      </div>
    </section>

    <section class="table-section">
      <div class="section-header">
        <div><h2>Obras Planejadas e em Andamento</h2><p>Intervenções viárias do banco de dados</p></div>
        <div class="table-controls">
          <input class="table-search" type="text" placeholder="Filtrar obras…" id="tableSearch"/>
          <select class="filter-select" id="tableStatusFilter">
            <option value="">Todos os status</option>
            <option value="em_andamento">Em andamento</option>
            <option value="planejada">Planejada</option>
            <option value="concluida">Concluída</option>
            <option value="pausada">Pausada</option>
          </select>
        </div>
      </div>
      <div class="table-wrapper">
        <table class="data-table" id="obrasTable">
          <thead>
            <tr>
              <th>Nome / Região</th><th>Tipo</th><th>Início</th>
              <th>Progresso</th><th>Status</th><th>Ações</th>
            </tr>
          </thead>
          <tbody id="tableBody"><tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Carregando obras…</td></tr></tbody>
        </table>
      </div>
    </section>

    <!-- MAP -->
    <section class="table-section" style="margin-top:24px;">
      <div class="section-header">
        <div><h2>Mapa de Obras — SP</h2><p>Localização georreferenciada das intervenções</p></div>
      </div>
      <div id="map" style="height:380px;border-radius:12px;overflow:hidden;"></div>
    </section>`;

  initTimestamp();
  initKPIs();
  initCharts();
  initCongSpeedChart();
  carregarObrasParaDashboard();
  initDashboardInteractions();
}

async function initKPIs() {
  try {
    const data = await apiFetch('/api/dashboard');
    const r = data.resumo;
    const andamento = r.em_andamento || 0;
    const concluidas = r.concluidas || 0;
    const total = r.total || 0;

    // Impacto calculado com base na hora atual
    const hour = new Date().getHours();
    const isPeak = [7,8,17,18].includes(hour);
    const impactLabel = isPeak ? 'Alto' : hour >= 9 && hour <= 16 ? 'Médio' : 'Baixo';
    const impactColor = isPeak ? '#ef4444' : hour >= 9 ? '#f59e0b' : '#10b981';

    const kpiFlow = document.getElementById('kpiFlow');
    if (kpiFlow) kpiFlow.innerHTML = `<span style="color:${impactColor};font-size:28px;font-weight:800;">${impactLabel}</span>`;

    const kpiAndamento = document.getElementById('kpiObrasAndamento');
    if (kpiAndamento) kpiAndamento.textContent = andamento;

    const kpiConcluidas = document.getElementById('kpiObrasConcluidas');
    if (kpiConcluidas) kpiConcluidas.textContent = concluidas;

    const trend = document.getElementById('kpiObrasTrend');
    if (trend) trend.textContent = `${total} total cadastradas`;

  } catch (e) {
    console.error('Erro ao carregar KPIs:', e);
  }
}

async function carregarObrasParaDashboard() {
  try {
    const filtroRegiao = document.getElementById('filterRegion')?.value || 'all';
    const obras = await apiFetch(`/api/obras?regiao=${filtroRegiao}`);
    obrasCache = obras;
    renderTable(obras);
    initMap(obras);
  } catch (e) {
    const tbody = document.getElementById('tableBody');
    if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#ef4444;padding:24px;">Erro ao carregar obras: ${e.message}</td></tr>`;
  }
}

// ── TABLE ────────────────────────────────────────────────
function renderTable(obras) {
  const tbody = document.getElementById('tableBody');
  if (!tbody) return;

  if (!obras.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-muted);">Nenhuma obra encontrada.</td></tr>`;
    return;
  }

  const statusInfo = {
    planejada:    { label:'Planejada',    cls:'status-planned',   icon:'fa-calendar' },
    em_andamento: { label:'Em andamento', cls:'status-ongoing',   icon:'fa-rotate'   },
    concluida:    { label:'Concluída',    cls:'status-completed', icon:'fa-check'    },
    pausada:      { label:'Pausada',      cls:'status-critical',  icon:'fa-pause'    }
  };

  tbody.innerHTML = obras.map(obra => {
    const si = statusInfo[obra.status] || statusInfo.planejada;
    const pct = obra.progresso || 0;
    const pctColor = pct >= 75 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#3b82f6';
    return `
      <tr data-id="${obra.id}" style="cursor:pointer;" onclick="focusObra(${obra.id})">
        <td>
          <div class="table-location">
            ${obra.nome}
            <small>${obra.regiao || ''}</small>
          </div>
        </td>
        <td>${obra.descricao ? obra.descricao.substring(0,40) + (obra.descricao.length > 40 ? '…' : '') : '—'}</td>
        <td>${obra.data_inicio || '—'}</td>
        <td>
          <div class="impact-bar">
            <div class="impact-bar-bg">
              <div class="impact-bar-fill" style="width:${pct}%;background:${pctColor};"></div>
            </div>
            <span class="impact-pct" style="color:${pctColor};">${pct}%</span>
          </div>
        </td>
        <td>
          <span class="status-pill ${si.cls}">
            <i class="fa-solid ${si.icon}"></i> ${si.label}
          </span>
        </td>
        <td>
          <button class="action-btn" title="Ver no mapa" onclick="event.stopPropagation();focusObra(${obra.id})">
            <i class="fa-solid fa-location-dot"></i>
          </button>
          <button class="action-btn" title="Editar" onclick="event.stopPropagation();abrirModalEditarObraDash(${obra.id})">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="action-btn" title="Excluir" style="color:var(--red);" onclick="event.stopPropagation();excluirObraDash(${obra.id},'${obra.nome.replace(/'/g,"\\'")}')">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>`;
  }).join('');
}

window.focusObra = function(id) {
  const obra = obrasCache.find(o => o.id === id);
  if (!obra || !map) return;
  if (obra.lat && obra.lng) map.flyTo([obra.lat, obra.lng], 15, { duration:1.2 });
  document.querySelectorAll('#tableBody tr').forEach(tr => {
    tr.style.background = tr.dataset.id == id ? '#eff6ff' : '';
  });
  const row = document.querySelector(`#tableBody tr[data-id="${id}"]`);
  if (row) row.scrollIntoView({ behavior:'smooth', block:'nearest' });
};

window.abrirModalEditarObraDash = function(id) {
  const obra = obrasCache.find(o => o.id === id);
  if (!obra) return;
  abrirModalObra(obra);
};

window.excluirObraDash = async function(id, nome) {
  if (!confirm(`Excluir a obra "${nome}"?`)) return;
  try {
    await apiFetch(`/api/obras/${id}`, { method:'DELETE' });
    showToast('Obra excluída com sucesso.', 'success');
    await carregarObrasParaDashboard();
    await initKPIs();
  } catch (e) {
    showToast('Erro ao excluir: ' + e.message, 'error');
  }
};

// ── MAP ──────────────────────────────────────────────────
function initMap(obras) {
  if (map) { map.remove(); map = null; markersLayer = null; }
  const mapEl = document.getElementById('map');
  if (!mapEl) return;

  map = L.map('map', { center:[-23.5505,-46.6333], zoom:12, attributionControl:false });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom:19 }).addTo(map);
  markersLayer = L.layerGroup().addTo(map);
  renderMapMarkers(obras);
}

const STATUS_COLORS = { em_andamento:'#3b82f6', concluida:'#10b981', planejada:'#f59e0b', pausada:'#ef4444' };

function createMarkerIcon(status) {
  const hex = STATUS_COLORS[status] || '#64748b';
  return L.divIcon({
    className:'',
    html:`<div style="width:30px;height:30px;background:${hex};border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,.25);border:2px solid rgba(255,255,255,.8);">
      <i class="fa-solid fa-helmet-safety" style="transform:rotate(45deg);font-size:11px;color:white;"></i>
    </div>`,
    iconSize:[30,30], iconAnchor:[15,30], popupAnchor:[0,-32]
  });
}

function renderMapMarkers(obras) {
  if (!markersLayer) return;
  markersLayer.clearLayers();
  obras.forEach(obra => {
    if (!obra.lat || !obra.lng) return;
    const icon = createMarkerIcon(obra.status);
    const statusLabel = { em_andamento:'Em andamento', concluida:'Concluída', planejada:'Planejada', pausada:'Pausada' }[obra.status] || obra.status;
    L.marker([obra.lat, obra.lng], { icon })
      .addTo(markersLayer)
      .bindPopup(`<div class="map-popup">
        <p class="popup-title">${obra.nome}</p>
        <div class="popup-row"><span class="popup-label">Região</span><span class="popup-value">${obra.regiao||'—'}</span></div>
        <div class="popup-row"><span class="popup-label">Status</span><span class="popup-value">${statusLabel}</span></div>
        <div class="popup-row"><span class="popup-label">Progresso</span><span class="popup-value">${obra.progresso||0}%</span></div>
        <div class="popup-row"><span class="popup-label">Início</span><span class="popup-value">${obra.data_inicio||'—'}</span></div>
      </div>`, { maxWidth:260, className:'nr-popup' });
  });
}

// ── CHARTS ───────────────────────────────────────────────
function initCharts() {
  Chart.defaults.font.family = "'DM Sans', sans-serif";
  Chart.defaults.color = '#94a3b8';
  buildFlowChart();
  buildDayChart();
}

function buildFlowChart() {
  const ctx = document.getElementById('chartFlow');
  if (!ctx) return;
  const c = ctx.getContext('2d');
  const grad = c.createLinearGradient(0,0,0,220);
  grad.addColorStop(0,'rgba(37,99,235,.2)');
  grad.addColorStop(1,'rgba(37,99,235,0)');
  chartFlow = new Chart(ctx, {
    type:'line',
    data:{
      labels: FLOW_DATA.todayLabels,
      datasets:[{ label:'Veículos/h — Hoje', data: FLOW_DATA.today, borderColor:'#2563eb', backgroundColor:grad, fill:true, tension:.4, pointRadius:0, pointHoverRadius:5, borderWidth:2.5 }]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false}, tooltip:{ backgroundColor:'#0f172a', titleColor:'#94a3b8', bodyColor:'#fff', callbacks:{ label:ctx=>` ${ctx.parsed.y.toLocaleString('pt-BR')} veículos/h` } } },
      scales:{ x:{grid:{display:false},border:{display:false}}, y:{grid:{color:'#f1f5f9'},border:{display:false},ticks:{callback:v=>v>=1000?(v/1000).toFixed(1)+'k':v}} }
    }
  });
}

function buildDayChart() {
  const ctx = document.getElementById('chartDonut');
  if (!ctx) return;
  const vals = FLOW_DATA.daily;
  const minVal = Math.min(...vals);
  chartDonut = new Chart(ctx, {
    type:'bar',
    data:{
      labels: FLOW_DATA.dailyLabels,
      datasets:[{ label:'Veículos/dia', data:vals, backgroundColor:vals.map(v=>v===minVal?'#10b981':v>50000?'#ef4444CC':'#fbbf24CC'), borderRadius:5, borderSkipped:false }]
    },
    options:{
      indexAxis:'y', responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false}, tooltip:{ backgroundColor:'#0f172a', callbacks:{ label:ctx=>` ${ctx.parsed.x.toLocaleString('pt-BR')} veículos`, afterLabel:ctx=>ctx.parsed.x===minVal?'✓ Melhor dia para obras':'' } } },
      scales:{ x:{grid:{color:'#f1f5f9'},border:{display:false},ticks:{callback:v=>(v/1000).toFixed(0)+'k'}}, y:{grid:{display:false},border:{display:false}} }
    }
  });
}

function updateFlowChart(filter) {
  if (!chartFlow) return;
  currentFilter = filter;
  const map = { today:{ labels:FLOW_DATA.todayLabels, data:FLOW_DATA.today, label:'Hoje', cb:ctx=>` ${ctx.parsed.y.toLocaleString('pt-BR')} veículos/h` },
                week: { labels:FLOW_DATA.weekLabels,  data:FLOW_DATA.week,  label:'Semana', cb:ctx=>` ${ctx.parsed.y.toLocaleString('pt-BR')} veículos/dia` },
                month:{ labels:FLOW_DATA.monthLabels, data:FLOW_DATA.month, label:'Mês',   cb:ctx=>` ${ctx.parsed.y.toLocaleString('pt-BR')} veículos/dia` } };
  const d = map[filter];
  if (!d) return;
  chartFlow.data.labels = d.labels;
  chartFlow.data.datasets[0].data  = d.data;
  chartFlow.data.datasets[0].label = `Veículos — ${d.label}`;
  chartFlow.options.plugins.tooltip.callbacks.label = d.cb;
  chartFlow.update();
}

function initCongSpeedChart() {
  const container = document.getElementById('congSpeedChart');
  if (!container) return;
  container.innerHTML = CONG_SPEED_DATA.map(item => {
    const nivel = item.velocidade<=20?{label:'Alto',cor:'#ef4444',bg:'#fee2e2'}:item.velocidade<=50?{label:'Médio',cor:'#f59e0b',bg:'#fef3c7'}:{label:'Baixo',cor:'#10b981',bg:'#d1fae5'};
    const pct = Math.min(100, Math.round((item.velocidade/120)*100));
    return `<div style="display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:9px;background:#f8fafc;">
      <div style="min-width:110px;font-size:11px;font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.via}</div>
      <div style="flex:1;height:8px;background:#e2e8f0;border-radius:99px;overflow:hidden;">
        <div style="width:${pct}%;height:100%;background:${nivel.cor};border-radius:99px;"></div>
      </div>
      <div style="font-size:11px;font-weight:700;color:${nivel.cor};min-width:40px;text-align:right;">${item.velocidade}km/h</div>
      <div style="padding:2px 8px;border-radius:99px;background:${nivel.bg};color:${nivel.cor};font-size:10px;font-weight:700;min-width:44px;text-align:center;">${nivel.label}</div>
    </div>`;
  }).join('');
}

function initDashboardInteractions() {
  document.querySelectorAll('[data-chart-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-chart-filter]').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      updateFlowChart(btn.dataset.chartFilter);
    });
  });

  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      const icon = refreshBtn.querySelector('i');
      icon.classList.add('spinning');
      await carregarObrasParaDashboard();
      await initKPIs();
      setTimeout(()=>icon.classList.remove('spinning'), 900);
      showToast('Dashboard atualizado!', 'success');
    });
  }

  const tableSearch = document.getElementById('tableSearch');
  if (tableSearch) {
    let deb;
    tableSearch.addEventListener('input', e => {
      clearTimeout(deb);
      deb = setTimeout(async () => {
        const q = e.target.value.trim();
        if (q.length > 1) {
          const obras = await apiFetch(`/api/obras?busca=${encodeURIComponent(q)}`).catch(()=>[]);
          renderTable(obras);
          renderMapMarkers(obras);
        } else {
          renderTable(obrasCache);
          renderMapMarkers(obrasCache);
        }
      }, 350);
    });
  }

  const tableStatusFilter = document.getElementById('tableStatusFilter');
  if (tableStatusFilter) {
    tableStatusFilter.addEventListener('change', async e => {
      const status = e.target.value;
      const obras = await apiFetch(`/api/obras${status?'?status='+status:''}`).catch(()=>[]);
      renderTable(obras);
      renderMapMarkers(obras);
    });
  }

  const filterRegion = document.getElementById('filterRegion');
  if (filterRegion) {
    filterRegion.addEventListener('change', async e => {
      const val = e.target.value;
      const obras = await apiFetch(`/api/obras?regiao=${val}`).catch(()=>[]);
      obrasCache = obras;
      renderTable(obras);
      renderMapMarkers(obras);
    });
  }
}

// ════════════════════════════════════════════════════════
//  MODAL OBRA (usado em dashboard e página de obras)
// ════════════════════════════════════════════════════════

function abrirModalObra(obra) {
  // Remove modal anterior se houver
  document.getElementById('obraModal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'obraModal';
  modal.className = 'modal-overlay visible';
  modal.innerHTML = `
    <div class="modal-panel open" style="max-width:560px;">
      <div class="modal-header">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:36px;height:36px;border-radius:10px;background:#dbeafe;display:flex;align-items:center;justify-content:center;">
            <i class="fa-solid fa-helmet-safety" style="color:#2563eb;font-size:15px;"></i>
          </div>
          <div>
            <h3 style="margin:0;" id="obraModalTitle">${obra ? 'Editar Obra' : 'Nova Obra'}</h3>
            <p style="font-size:11px;color:var(--text-muted);margin:0;">Dados persistidos no banco de dados</p>
          </div>
        </div>
        <button class="modal-close" onclick="document.getElementById('obraModal').remove()"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="modal-body">
        <input type="hidden" id="obraModalId" value="${obra?.id||''}">
        <div class="form-row">
          <div class="form-group">
            <label>Nome da obra <span style="color:#dc2626;">*</span></label>
            <input type="text" id="obraMNome" class="form-input" value="${obra?.nome||''}" placeholder="Ex: Recapeamento Av. Paulista">
          </div>
          <div class="form-group">
            <label>Região <span style="color:#dc2626;">*</span></label>
            <select id="obraMRegiao" class="form-input">
              ${['centro','paulista','norte','sul','leste','oeste'].map(r=>`<option value="${r}" ${obra?.regiao===r?'selected':''}>${r.charAt(0).toUpperCase()+r.slice(1)}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Status</label>
            <select id="obraMStatus" class="form-input">
              ${[['planejada','Planejada'],['em_andamento','Em andamento'],['pausada','Pausada'],['concluida','Concluída']].map(([v,l])=>`<option value="${v}" ${obra?.status===v?'selected':''}>${l}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Progresso (%)</label>
            <input type="number" id="obraMProgresso" class="form-input" min="0" max="100" value="${obra?.progresso||0}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Data início</label>
            <input type="date" id="obraMInicio" class="form-input" value="${brToIso(obra?.data_inicio)||''}">
          </div>
          <div class="form-group">
            <label>Data fim</label>
            <input type="date" id="obraMFim" class="form-input" value="${brToIso(obra?.data_fim)||''}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Latitude</label>
            <input type="text" id="obraMlat" class="form-input" value="${obra?.lat||''}" placeholder="-23.5505">
          </div>
          <div class="form-group">
            <label>Longitude</label>
            <input type="text" id="obraMLng" class="form-input" value="${obra?.lng||''}" placeholder="-46.6333">
          </div>
        </div>
        <div class="form-group">
          <label>Descrição</label>
          <textarea id="obraMDesc" class="form-input" rows="3" placeholder="Descrição da intervenção…">${obra?.descricao||''}</textarea>
        </div>
      </div>
      <div class="modal-footer" style="justify-content:flex-end;gap:10px;">
        <button class="btn-outline" onclick="document.getElementById('obraModal').remove()">Cancelar</button>
        <button class="btn-primary" onclick="salvarObraModal()">
          <i class="fa-solid fa-floppy-disk"></i> ${obra ? 'Salvar alterações' : 'Criar obra'}
        </button>
      </div>
    </div>`;
  modal.addEventListener('click', e=>{ if(e.target===modal) modal.remove(); });
  document.body.appendChild(modal);
}

window.salvarObraModal = async function() {
  const id   = document.getElementById('obraModalId')?.value;
  const nome = document.getElementById('obraMNome')?.value.trim();
  if (!nome) { showToast('Informe o nome da obra.', 'warning'); return; }

  const body = {
    nome,
    descricao:   document.getElementById('obraMDesc')?.value.trim(),
    regiao:      document.getElementById('obraMRegiao')?.value,
    status:      document.getElementById('obraMStatus')?.value,
    progresso:   document.getElementById('obraMProgresso')?.value,
    data_inicio: document.getElementById('obraMInicio')?.value,
    data_fim:    document.getElementById('obraMFim')?.value,
    lat:         document.getElementById('obraMlat')?.value,
    lng:         document.getElementById('obraMLng')?.value,
  };

  try {
    if (id) {
      await apiFetch(`/api/obras/${id}`, { method:'PUT', body:JSON.stringify(body) });
      showToast('Obra atualizada com sucesso!', 'success');
    } else {
      await apiFetch('/api/obras', { method:'POST', body:JSON.stringify(body) });
      showToast('Obra cadastrada com sucesso!', 'success');
    }
    document.getElementById('obraModal')?.remove();
    // Recarregar na página correta
    if (document.getElementById('tableBody')) await carregarObrasParaDashboard();
    if (document.getElementById('obrasPageBody')) await carregarObrasPage();
    await initKPIs();
  } catch (e) {
    showToast('Erro ao salvar: ' + e.message, 'error');
  }
};

// ════════════════════════════════════════════════════════
//  PÁGINA: OBRAS
// ════════════════════════════════════════════════════════

function renderObrasPage(content) {
  content.innerHTML = `
    <div class="page-title">
      <div><h1>Planejamento de Obras</h1><p class="subtitle">CRUD completo — dados persistidos no banco</p></div>
      <button class="btn-primary" onclick="abrirModalObra(null)">
        <i class="fa-solid fa-plus"></i> Nova Obra
      </button>
    </div>

    <section class="kpi-grid" id="obrasKpiRow" style="margin-bottom:0;">
      <div class="kpi-card"><div class="kpi-icon flow"><i class="fa-solid fa-rotate"></i></div><div class="kpi-info"><span class="kpi-label">Em andamento</span><span class="kpi-value" id="okpiAndamento">—</span></div></div>
      <div class="kpi-card"><div class="kpi-icon window"><i class="fa-solid fa-calendar"></i></div><div class="kpi-info"><span class="kpi-label">Planejadas</span><span class="kpi-value" id="okpiPlanejadas">—</span></div></div>
      <div class="kpi-card"><div class="kpi-icon peak"><i class="fa-solid fa-check-circle"></i></div><div class="kpi-info"><span class="kpi-label">Concluídas</span><span class="kpi-value" id="okpiConcluidas">—</span></div></div>
      <div class="kpi-card"><div class="kpi-icon cong"><i class="fa-solid fa-pause-circle"></i></div><div class="kpi-info"><span class="kpi-label">Pausadas</span><span class="kpi-value" id="okpiPausadas">—</span></div></div>
    </section>

    <section class="table-section" style="margin-top:24px;">
      <div class="section-header" style="padding:20px 20px 0;">
        <div><h2>Lista de Obras</h2><p>Todas as intervenções cadastradas</p></div>
        <div class="table-controls">
          <select class="filter-select" id="obrasStatusFilter" onchange="carregarObrasPage()">
            <option value="">Todos os status</option>
            <option value="em_andamento">Em andamento</option>
            <option value="planejada">Planejada</option>
            <option value="concluida">Concluída</option>
            <option value="pausada">Pausada</option>
          </select>
          <input class="table-search" type="text" placeholder="Buscar obra…" id="obrasSearch" oninput="buscarObrasPage(this.value)"/>
        </div>
      </div>
      <div class="table-wrapper" style="margin-top:16px;">
        <table class="data-table">
          <thead>
            <tr><th>Nome</th><th>Região</th><th>Status</th><th>Progresso</th><th>Início</th><th>Fim</th><th>Ações</th></tr>
          </thead>
          <tbody id="obrasPageBody">
            <tr><td colspan="7" style="text-align:center;padding:32px;"><i class="fa-solid fa-spinner fa-spin"></i> Carregando…</td></tr>
          </tbody>
        </table>
      </div>
    </section>`;

  carregarObrasPage();
}

async function carregarObrasPage() {
  const status = document.getElementById('obrasStatusFilter')?.value || '';
  const regiao = document.getElementById('filterRegion')?.value || 'all';
  try {
    const obras = await apiFetch(`/api/obras?regiao=${regiao}${status?'&status='+status:''}`);
    obrasCache = obras;
    renderObrasPageBody(obras);
    // KPIs
    const r = await apiFetch('/api/dashboard').then(d=>d.resumo).catch(()=>({em_andamento:0,planejadas:0,concluidas:0,pausadas:0}));
    if (document.getElementById('okpiAndamento'))  document.getElementById('okpiAndamento').textContent  = r.em_andamento||0;
    if (document.getElementById('okpiPlanejadas')) document.getElementById('okpiPlanejadas').textContent = r.planejadas||0;
    if (document.getElementById('okpiConcluidas')) document.getElementById('okpiConcluidas').textContent = r.concluidas||0;
    if (document.getElementById('okpiPausadas'))   document.getElementById('okpiPausadas').textContent   = r.pausadas||0;
  } catch (e) {
    const tbody = document.getElementById('obrasPageBody');
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="color:#ef4444;padding:24px;text-align:center;">Erro: ${e.message}</td></tr>`;
  }
}

window.buscarObrasPage = async function(q) {
  if (q.length < 2) { await carregarObrasPage(); return; }
  const obras = await apiFetch(`/api/obras?busca=${encodeURIComponent(q)}`).catch(()=>[]);
  renderObrasPageBody(obras);
};

function renderObrasPageBody(obras) {
  const tbody = document.getElementById('obrasPageBody');
  if (!tbody) return;
  const statusInfo = {
    planejada:    {label:'Planejada',    cls:'status-planned',   icon:'fa-calendar'},
    em_andamento: {label:'Em andamento', cls:'status-ongoing',   icon:'fa-rotate'  },
    concluida:    {label:'Concluída',    cls:'status-completed', icon:'fa-check'   },
    pausada:      {label:'Pausada',      cls:'status-critical',  icon:'fa-pause'   }
  };
  if (!obras.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted);">Nenhuma obra encontrada.</td></tr>`;
    return;
  }
  tbody.innerHTML = obras.map(o => {
    const si = statusInfo[o.status] || statusInfo.planejada;
    const pct = o.progresso||0;
    const pctColor = pct>=75?'#10b981':pct>=40?'#f59e0b':'#3b82f6';
    return `
      <tr>
        <td style="font-weight:600;">${o.nome}</td>
        <td>${o.regiao||'—'}</td>
        <td><span class="status-pill ${si.cls}"><i class="fa-solid ${si.icon}"></i> ${si.label}</span></td>
        <td>
          <div class="impact-bar">
            <div class="impact-bar-bg"><div class="impact-bar-fill" style="width:${pct}%;background:${pctColor};"></div></div>
            <span class="impact-pct" style="color:${pctColor};">${pct}%</span>
          </div>
        </td>
        <td style="font-size:12px;color:var(--text-muted);">${o.data_inicio||'—'}</td>
        <td style="font-size:12px;color:var(--text-muted);">${o.data_fim||'—'}</td>
        <td>
          <button class="action-btn" title="Editar" onclick="abrirModalObra(obrasCache.find(x=>x.id===${o.id}))"><i class="fa-solid fa-pen"></i></button>
          <button class="action-btn" title="Excluir" style="color:var(--red);" onclick="excluirObraPage(${o.id},'${o.nome.replace(/'/g,"\\'")}')"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>`;
  }).join('');
}

window.excluirObraPage = async function(id, nome) {
  if (!confirm(`Excluir a obra "${nome}"?`)) return;
  try {
    await apiFetch(`/api/obras/${id}`, { method:'DELETE' });
    showToast('Obra excluída.', 'success');
    await carregarObrasPage();
  } catch (e) {
    showToast('Erro: ' + e.message, 'error');
  }
};

// ════════════════════════════════════════════════════════
//  PÁGINA: MURAL DE AVISOS
// ════════════════════════════════════════════════════════

function renderMuralPage(content) {
  content.innerHTML = `
    <div class="page-title">
      <div><h1>Mural de Avisos</h1><p class="subtitle">Comunicados e alertas do sistema</p></div>
      <button class="btn-primary" id="btnNovoAviso">
        <i class="fa-solid fa-plus"></i> Novo Aviso
      </button>
    </div>

    <div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;">
      <button class="btn-chip active" data-aviso-filter="" onclick="muralFiltrar(this,'')">Todos</button>
      <button class="btn-chip" data-aviso-filter="info" onclick="muralFiltrar(this,'info')">Informativo</button>
      <button class="btn-chip" data-aviso-filter="alerta" onclick="muralFiltrar(this,'alerta')">Alerta</button>
      <button class="btn-chip" data-aviso-filter="critico" onclick="muralFiltrar(this,'critico')">Crítico</button>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;" id="muralGrid">
      <div style="text-align:center;padding:40px;color:var(--text-muted);grid-column:1/-1;"><i class="fa-solid fa-spinner fa-spin"></i> Carregando avisos…</div>
    </div>

    <!-- Modal novo aviso -->
    <div class="modal-overlay" id="avisoModalOverlay" onclick="fecharAvisoModal()"></div>
    <div class="modal-panel" id="avisoModal">
      <div class="modal-header">
        <h3 style="margin:0;">Publicar Aviso</h3>
        <button class="modal-close" onclick="fecharAvisoModal()"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-group"><label>Título <span style="color:#dc2626;">*</span></label><input type="text" id="aTitulo" class="form-input" placeholder="Título do aviso"></div>
        <div class="form-group"><label>Mensagem</label><textarea id="aMensagem" class="form-input" rows="4" placeholder="Descreva o aviso…"></textarea></div>
        <div class="form-row">
          <div class="form-group">
            <label>Tipo</label>
            <select id="aTipo" class="form-input">
              <option value="info">Informativo</option>
              <option value="alerta">Alerta</option>
              <option value="critico">Crítico</option>
            </select>
          </div>
        </div>
      </div>
      <div class="modal-footer" style="justify-content:flex-end;gap:10px;">
        <button class="btn-outline" onclick="fecharAvisoModal()">Cancelar</button>
        <button class="btn-primary" onclick="publicarAviso()"><i class="fa-solid fa-paper-plane"></i> Publicar</button>
      </div>
    </div>`;

  document.getElementById('btnNovoAviso')?.addEventListener('click', abrirAvisoModal);
  carregarAvisos('');
}

async function carregarAvisos(tipo) {
  const grid = document.getElementById('muralGrid');
  if (!grid) return;
  try {
    const url = '/api/avisos' + (tipo ? `?tipo=${tipo}` : '');
    avisosCacheArr = await apiFetch(url);
    renderAvisoCards(avisosCacheArr);
  } catch (e) {
    grid.innerHTML = `<div style="color:#ef4444;padding:24px;grid-column:1/-1;text-align:center;">Erro: ${e.message}</div>`;
  }
}

function renderAvisoCards(avisos) {
  const grid = document.getElementById('muralGrid');
  if (!grid) return;
  if (!avisos.length) { grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:40px;">Nenhum aviso encontrado.</p>`; return; }

  const icons   = { info:'fa-circle-info', alerta:'fa-triangle-exclamation', critico:'fa-circle-exclamation' };
  const colors  = { info:'#3b82f6',        alerta:'#f59e0b',                 critico:'#ef4444'               };
  const borders = { info:'#dbeafe',        alerta:'#fef3c7',                 critico:'#fee2e2'               };

  grid.innerHTML = avisos.map(a => {
    const ic  = icons[a.tipo]   || icons.info;
    const cor = colors[a.tipo]  || colors.info;
    const bg  = borders[a.tipo] || borders.info;
    return `
      <div style="background:white;border-radius:12px;border:1px solid ${bg};padding:18px;box-shadow:0 1px 4px rgba(0,0,0,.06);${a.lido?'opacity:.6':''}">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="width:32px;height:32px;border-radius:8px;background:${bg};display:flex;align-items:center;justify-content:center;">
              <i class="fa-solid ${ic}" style="color:${cor};font-size:14px;"></i>
            </div>
            <span style="font-size:10px;font-weight:700;text-transform:uppercase;color:${cor};">${a.tipo}</span>
          </div>
          <div style="display:flex;gap:6px;">
            ${!a.lido ? `<button class="action-btn" title="Marcar como lido" onclick="lerAviso(${a.id})"><i class="fa-solid fa-check"></i></button>` : ''}
            <button class="action-btn" title="Editar" onclick="editarAviso(${a.id})"><i class="fa-solid fa-pen"></i></button>
            <button class="action-btn" title="Excluir" style="color:var(--red);" onclick="deletarAviso(${a.id})"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
        <h4 style="margin:0 0 6px;font-size:14px;font-weight:600;">${a.titulo}</h4>
        <p style="margin:0 0 10px;font-size:12px;color:var(--text-secondary);line-height:1.5;">${a.mensagem||''}</p>
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;color:var(--text-muted);">
          <span>${a.obra_nome ? `<i class="fa-solid fa-helmet-safety"></i> ${a.obra_nome}` : ''}</span>
          <span>${a.criado_em||''}</span>
        </div>
      </div>`;
  }).join('');
}

window.muralFiltrar = function(btn, tipo) {
  document.querySelectorAll('[data-aviso-filter]').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  carregarAvisos(tipo);
};

function abrirAvisoModal() {
  document.getElementById('aTitulo').value   = '';
  document.getElementById('aMensagem').value = '';
  document.getElementById('avisoModal')?.classList.add('open');
  document.getElementById('avisoModalOverlay')?.classList.add('visible');
}
function fecharAvisoModal() {
  document.getElementById('avisoModal')?.classList.remove('open');
  document.getElementById('avisoModalOverlay')?.classList.remove('visible');
}

window.publicarAviso = async function() {
  const titulo   = document.getElementById('aTitulo')?.value.trim();
  const mensagem = document.getElementById('aMensagem')?.value.trim();
  const tipo     = document.getElementById('aTipo')?.value;
  if (!titulo) { showToast('Informe o título do aviso.', 'warning'); return; }
  try {
    await apiFetch('/api/avisos', { method:'POST', body:JSON.stringify({ titulo, mensagem, tipo, fk_usuario:USUARIO_ID }) });
    fecharAvisoModal();
    showToast('Aviso publicado!', 'success');
    await carregarAvisos('');
  } catch (e) {
    showToast('Erro: ' + e.message, 'error');
  }
};

window.lerAviso = async function(id) {
  try {
    await apiFetch(`/api/avisos/${id}/lido`, { method:'PATCH' });
    await carregarAvisos('');
  } catch {}
};

window.editarAviso = function(id) {
  const a = avisosCacheArr.find(x=>x.id===id);
  if (!a) return;
  document.getElementById('aTitulo').value   = a.titulo;
  document.getElementById('aMensagem').value = a.mensagem||'';
  document.getElementById('aTipo').value     = a.tipo;
  // Alterar botão publicar para salvar edição
  const btnPublicar = document.querySelector('#avisoModal .btn-primary');
  if (btnPublicar) {
    btnPublicar.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar';
    btnPublicar.onclick = async () => {
      const body = { titulo:document.getElementById('aTitulo').value.trim(), mensagem:document.getElementById('aMensagem').value.trim(), tipo:document.getElementById('aTipo').value };
      try {
        // Deletar e recriar (API não tem PUT para aviso — pode adicionar depois)
        await apiFetch(`/api/avisos/${id}`, { method:'DELETE' });
        await apiFetch('/api/avisos', { method:'POST', body:JSON.stringify({...body, fk_usuario:USUARIO_ID}) });
        fecharAvisoModal();
        showToast('Aviso atualizado!', 'success');
        await carregarAvisos('');
        // Restaurar botão
        btnPublicar.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Publicar';
        btnPublicar.onclick = publicarAviso;
      } catch (e) { showToast('Erro: '+e.message,'error'); }
    };
  }
  abrirAvisoModal();
};

window.deletarAviso = async function(id) {
  if (!confirm('Excluir este aviso?')) return;
  try {
    await apiFetch(`/api/avisos/${id}`, { method:'DELETE' });
    showToast('Aviso excluído.', 'success');
    await carregarAvisos('');
  } catch (e) {
    showToast('Erro: '+e.message, 'error');
  }
};

// ════════════════════════════════════════════════════════
//  PÁGINA: USUÁRIOS
// ════════════════════════════════════════════════════════

let userModalMode = null;
let userEditId    = null;

function renderUsuariosPage(content) {
  content.innerHTML = `
    <div class="page-title">
      <div><h1>Usuários</h1><p class="subtitle">Gestão de acessos e perfis do sistema</p></div>
      <button class="btn-primary" onclick="openUserModal('add')">
        <i class="fa-solid fa-user-plus"></i> Novo Usuário
      </button>
    </div>

    <section class="kpi-grid" style="margin-bottom:0;">
      <div class="kpi-card"><div class="kpi-icon flow"><i class="fa-solid fa-users"></i></div><div class="kpi-info"><span class="kpi-label">Total</span><span class="kpi-value" id="uKpiTotal">—</span></div></div>
      <div class="kpi-card"><div class="kpi-icon window"><i class="fa-solid fa-circle-check"></i></div><div class="kpi-info"><span class="kpi-label">Ativos</span><span class="kpi-value" id="uKpiAtivos">—</span></div></div>
      <div class="kpi-card"><div class="kpi-icon cong"><i class="fa-solid fa-user-clock"></i></div><div class="kpi-info"><span class="kpi-label">Pendentes</span><span class="kpi-value" id="uKpiPendentes">—</span></div></div>
      <div class="kpi-card"><div class="kpi-icon peak"><i class="fa-solid fa-user-shield"></i></div><div class="kpi-info"><span class="kpi-label">Gestores</span><span class="kpi-value" id="uKpiGestores">—</span></div></div>
    </section>

    <section class="table-section" style="margin-top:24px;">
      <div class="section-header" style="padding:20px 20px 0;">
        <div><h2>Lista de Usuários</h2></div>
        <div class="table-controls">
          <input class="table-search" type="text" placeholder="Buscar usuário…" id="userSearch" oninput="filtrarUsuarios()"/>
        </div>
      </div>
      <div class="table-wrapper" style="margin-top:16px;">
        <table class="data-table">
          <thead>
            <tr><th>Usuário</th><th>E-mail</th><th>Empresa</th><th>Ações</th></tr>
          </thead>
          <tbody id="usersTableBody">
            <tr><td colspan="4" style="text-align:center;padding:32px;"><i class="fa-solid fa-spinner fa-spin"></i></td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Modal -->
    <div class="modal-overlay" id="userModalOverlay" onclick="closeUserModal()"></div>
    <div class="modal-panel" id="userModal">
      <div class="modal-header">
        <div style="display:flex;align-items:center;gap:10px;">
          <div id="modalIconWrap" style="width:36px;height:36px;border-radius:10px;background:#dbeafe;display:flex;align-items:center;justify-content:center;">
            <i class="fa-solid fa-user-plus" style="color:#2563eb;font-size:15px;" id="modalIcon"></i>
          </div>
          <div>
            <h3 id="modalTitle" style="margin:0;">Novo Usuário</h3>
            <p id="modalSubtitle" style="font-size:11px;color:var(--text-muted);margin:0;">Preencha os dados</p>
          </div>
        </div>
        <button class="modal-close" onclick="closeUserModal()"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group">
            <label>Nome completo <span style="color:#dc2626;">*</span></label>
            <input type="text" id="fNome" class="form-input" placeholder="Ex: João Silva">
          </div>
          <div class="form-group">
            <label>E-mail <span style="color:#dc2626;">*</span></label>
            <input type="email" id="fEmail" class="form-input" placeholder="joao@newroad.sp">
          </div>
        </div>
        <div class="form-row" id="passwordRow">
          <div class="form-group">
            <label>Senha <span style="color:#dc2626;">*</span></label>
            <div style="position:relative;">
              <input type="password" id="fSenha" class="form-input" placeholder="Mínimo 6 caracteres" style="padding-right:38px;">
              <button type="button" onclick="togglePasswordVisibility('fSenha','eyeSenha')" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text-muted);">
                <i class="fa-solid fa-eye" id="eyeSenha"></i>
              </button>
            </div>
          </div>
          <div class="form-group">
            <label>ID da Empresa</label>
            <input type="number" id="fEmpresa" class="form-input" value="1">
          </div>
        </div>
      </div>
      <div class="modal-footer" style="justify-content:flex-end;gap:10px;">
        <button class="btn-outline" onclick="closeUserModal()">Cancelar</button>
        <button class="btn-primary" onclick="saveUser()">
          <i class="fa-solid fa-check"></i> <span id="modalSaveLabel">Criar usuário</span>
        </button>
      </div>
    </div>`;

  carregarUsuarios();
}

async function carregarUsuarios() {
  try {
    // Usar rota existente de listagem — se não existir, mostra msg
    const res = await fetch(API + '/api/usuarios/listar');
    if (!res.ok) throw new Error('Rota /api/usuarios/listar não implementada');
    usuariosCache = await res.json();
  } catch {
    // Fallback: carrega pelo menos os dados de contagem do dashboard
    usuariosCache = [];
  }
  renderUsersTable(usuariosCache);
  atualizarKpisUsuarios(usuariosCache);
}

function atualizarKpisUsuarios(users) {
  if (document.getElementById('uKpiTotal'))    document.getElementById('uKpiTotal').textContent    = users.length;
  if (document.getElementById('uKpiAtivos'))   document.getElementById('uKpiAtivos').textContent   = users.filter(u=>u.status==='ativo').length;
  if (document.getElementById('uKpiPendentes'))document.getElementById('uKpiPendentes').textContent= users.filter(u=>u.status==='pendente').length;
  if (document.getElementById('uKpiGestores')) document.getElementById('uKpiGestores').textContent = users.filter(u=>u.perfil==='Gestor').length;
}

window.filtrarUsuarios = function() {
  const q = (document.getElementById('userSearch')?.value||'').toLowerCase();
  const filtered = usuariosCache.filter(u=>(u.nome||'').toLowerCase().includes(q)||(u.email||'').toLowerCase().includes(q));
  renderUsersTable(filtered);
};

function renderUsersTable(users) {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;

  if (!users.length) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:32px;color:var(--text-muted);">
      ${usuariosCache.length===0?'Implemente GET /api/usuarios/listar no backend para listar usuários.':'Nenhum usuário encontrado.'}
    </td></tr>`;
    return;
  }

  const perfilColors = { Gestor:'#2563eb', Analista:'#0d9488', Operador:'#7c3aed' };
  tbody.innerHTML = users.map(u => {
    const pc = perfilColors[u.perfil]||'#64748b';
    const initials = (u.nome||'?').split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase();
    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,${pc},${pc}99);color:white;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;">${initials}</div>
            <div><div style="font-weight:600;font-size:13px;">${u.nome}</div><div style="font-size:11px;color:var(--text-muted);">${u.perfil||''}</div></div>
          </div>
        </td>
        <td style="font-size:13px;">${u.email}</td>
        <td style="font-size:13px;">${u.empresaId||u.fk_empresa||'—'}</td>
        <td>
          <button class="action-btn" title="Excluir" style="color:var(--red);" onclick="excluirUsuario(${u.id},'${(u.nome||'').replace(/'/g,"\\'")}')"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>`;
  }).join('');
}

window.openUserModal = function(mode, id) {
  userModalMode = mode;
  userEditId    = id||null;
  document.getElementById('userModal')?.classList.add('open');
  document.getElementById('userModalOverlay')?.classList.add('visible');
  if (mode === 'add') {
    document.getElementById('modalTitle').textContent     = 'Novo Usuário';
    document.getElementById('modalSubtitle').textContent  = 'Preencha os dados do novo membro';
    document.getElementById('modalSaveLabel').textContent = 'Criar usuário';
    ['fNome','fEmail','fSenha'].forEach(f=>{ const el=document.getElementById(f); if(el) el.value=''; });
    document.getElementById('passwordRow').style.display = '';
  }
};

window.closeUserModal = function() {
  document.getElementById('userModal')?.classList.remove('open');
  document.getElementById('userModalOverlay')?.classList.remove('visible');
};

window.saveUser = async function() {
  const nome    = document.getElementById('fNome')?.value.trim();
  const email   = document.getElementById('fEmail')?.value.trim();
  const senha   = document.getElementById('fSenha')?.value||'';
  const empresa = document.getElementById('fEmpresa')?.value||'1';

  if (!nome||nome.length<3)  { showToast('Nome deve ter ao menos 3 caracteres.','warning'); return; }
  if (!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('Informe um e-mail válido.','warning'); return; }
  if (userModalMode==='add'&&senha.length<6) { showToast('Senha deve ter ao menos 6 caracteres.','warning'); return; }

  try {
    const body = new URLSearchParams({ nomeServer:nome, emailServer:email, senhaServer:senha, idEmpresaVincularServer:empresa });
    const res  = await fetch(API+'/api/usuarios/cadastrar', { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:body.toString() });
    if (!res.ok) throw new Error(await res.text());
    closeUserModal();
    showToast('Usuário cadastrado com sucesso!', 'success');
    await carregarUsuarios();
  } catch (e) {
    showToast('Erro: '+e.message, 'error');
  }
};

window.excluirUsuario = async function(id, nome) {
  if (!confirm(`Excluir o usuário "${nome}"?`)) return;
  showToast('Exclusão de usuário não implementada no backend.', 'info');
};

window.togglePasswordVisibility = function(inputId, iconId) {
  const inp  = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (!inp) return;
  inp.type = inp.type==='password'?'text':'password';
  if (icon) icon.className = inp.type==='password'?'fa-solid fa-eye':'fa-solid fa-eye-slash';
};

// ════════════════════════════════════════════════════════
//  PÁGINA: SETTINGS
// ════════════════════════════════════════════════════════
function renderSettingsPage(content) {
  content.innerHTML = `
    <div class="page-title"><div><h1>Configurações</h1><p class="subtitle">Preferências do sistema</p></div></div>
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:300px;gap:16px;color:var(--text-muted);">
      <i class="fa-solid fa-gear" style="font-size:48px;opacity:.3;"></i>
      <p style="font-size:15px;">Esta seção estará disponível em breve.</p>
    </div>`;
}

// ════════════════════════════════════════════════════════
//  NOTIFICAÇÕES (sino do header) — via API
// ════════════════════════════════════════════════════════

async function initNotifications() {
  try {
    const data = await apiFetch(`/api/notificacoes/${USUARIO_ID}`);
    const badge = document.querySelector('.notif-btn .badge');
    if (badge) badge.textContent = data.nao_lidas > 0 ? data.nao_lidas : '';

    const list = document.getElementById('notifList');
    if (!list) return;

    if (!data.notificacoes.length) { list.innerHTML = `<p style="padding:16px;text-align:center;color:var(--text-muted);">Sem notificações.</p>`; return; }

    const icons  = { critico:'fa-circle-exclamation', alerta:'fa-triangle-exclamation', info:'fa-circle-info' };
    const colors = { critico:'#ef4444', alerta:'#f59e0b', info:'#3b82f6' };

    list.innerHTML = data.notificacoes.map(n => `
      <div class="notif-item ${n.lida?'read':''}">
        <span class="notif-dot" style="background:${colors[n.tipo]||colors.info};"></span>
        <div class="notif-text">
          <p class="notif-title"><i class="fa-solid ${icons[n.tipo]||icons.info}" style="color:${colors[n.tipo]||colors.info};margin-right:5px;"></i>${n.titulo}</p>
          <p class="notif-desc">${n.descricao||''}</p>
          <p class="notif-time">${n.criado_em||''}</p>
        </div>
      </div>`).join('');

    // Botão marcar todas lidas
    const header = document.querySelector('.notif-header');
    if (header && !document.getElementById('btnMarcarLidas')) {
      const btn = document.createElement('button');
      btn.id = 'btnMarcarLidas';
      btn.title = 'Marcar todas como lidas';
      btn.style.cssText = 'background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:13px;';
      btn.innerHTML = '<i class="fa-solid fa-check-double"></i>';
      btn.onclick = async () => {
        await apiFetch(`/api/notificacoes/${USUARIO_ID}/marcar-lidas`, { method:'PATCH' }).catch(()=>{});
        await initNotifications();
      };
      header.appendChild(btn);
    }
  } catch (e) {
    console.warn('Notificações indisponíveis:', e.message);
  }
}

// ════════════════════════════════════════════════════════
//  ROUTER / INTERAÇÕES GLOBAIS
// ════════════════════════════════════════════════════════
function loadPage(page) {
  const content = document.querySelector('.content');
  [chartFlow, chartDay, chartDonut].forEach(c=>{ if(c) c.destroy(); });
  chartFlow = chartDay = chartDonut = null;
  if (map) { map.remove(); map=null; markersLayer=null; }
  content.innerHTML = '';
  content.style.animation = 'none';
  requestAnimationFrame(() => {
    content.style.animation='';
    content.classList.add('page-entering');
    setTimeout(()=>content.classList.remove('page-entering'),400);
  });
  switch (page) {
    case 'dashboard': renderDashboardPage(content); break;
    case 'obras':     renderObrasPage(content);     break;
    case 'mural':     renderMuralPage(content);     break;
    case 'usuarios':  renderUsuariosPage(content);  break;
    case 'settings':  renderSettingsPage(content);  break;
    default:
      content.innerHTML = `<div style="text-align:center;padding:60px;color:var(--text-muted);"><i class="fa-solid fa-wrench" style="font-size:40px;opacity:.3;"></i><p style="margin-top:16px;">Página em construção.</p></div>`;
  }
}

function initInteractions() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      const page = item.dataset.page;
      if (!page) return;
      e.preventDefault();
      loadPage(page);
      document.querySelectorAll('.nav-item').forEach(i=>i.classList.remove('active'));
      item.classList.add('active');
    });
  });

  const notifBtn   = document.getElementById('notifBtn');
  const notifPanel = document.getElementById('notifPanel');
  const overlay    = document.getElementById('overlay');
  const closeNotif = document.getElementById('closeNotif');
  const sidebar    = document.getElementById('sidebar');
  const burger     = document.getElementById('burgerBtn');

  if (notifBtn) notifBtn.addEventListener('click', () => {
    notifPanel.classList.add('open');
    overlay.classList.add('visible');
    initNotifications();
  });
  if (closeNotif) closeNotif.addEventListener('click', () => {
    notifPanel.classList.remove('open');
    overlay.classList.remove('visible');
  });
  if (overlay) overlay.addEventListener('click', () => {
    notifPanel.classList.remove('open');
    overlay.classList.remove('visible');
    sidebar?.classList.remove('mobile-open');
  });
  if (burger) burger.addEventListener('click', () => {
    sidebar?.classList.toggle('mobile-open');
    overlay?.classList.toggle('visible');
  });
}

// ════════════════════════════════════════════════════════
//  UTILS
// ════════════════════════════════════════════════════════
function brToIso(d) {
  if (!d||!d.includes('/')) return d||'';
  const [dd,mm,yyyy] = d.split('/');
  return `${yyyy}-${mm}-${dd}`;
}

function handleExitToLanding() {
  window.location.href = '/';
}