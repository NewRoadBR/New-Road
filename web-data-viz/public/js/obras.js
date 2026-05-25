// ════════════════════════════════════════════════════════════════════
//  PÁGINA: PLANEJAMENTO DE OBRAS  (substitui o bloco equivalente em script.js)
//
//  Cole este bloco inteiro no script.js, substituindo tudo a partir de:
//    "// ════ PÁGINA: OBRAS ════"
//  até o final da função window.excluirObraPage (linha ~785 original).
// ════════════════════════════════════════════════════════════════════

// ── Constantes de status ──────────────────────────────────────────
const OBRA_STATUS = {
    planejada:    { label: 'Planejada',     cls: 'status-planned',   icon: 'fa-calendar'  },
    em_andamento: { label: 'Em andamento',  cls: 'status-ongoing',   icon: 'fa-rotate'    },
    concluida:    { label: 'Concluída',     cls: 'status-completed', icon: 'fa-check'     },
    pausada:      { label: 'Pausada',       cls: 'status-critical',  icon: 'fa-pause'     },
};

const OBRA_REGIOES = ['centro','paulista','norte','sul','leste','oeste'];

// ── Render principal da página ────────────────────────────────────
function renderObrasPage(content) {
    content.innerHTML = `
    <!-- TÍTULO -->
    <div class="page-title">
        <div>
            <h1>Planejamento de Obras</h1>
            <p class="subtitle">Gerencie todas as intervenções viárias de São Paulo</p>
        </div>
        <div style="display:flex;gap:10px;align-items:center;">
            <button class="btn-outline" id="obrasRefreshBtn" title="Atualizar lista">
                <i class="fa-solid fa-rotate-right"></i>
            </button>
            <button class="btn-primary" onclick="abrirModalObra(null)">
                <i class="fa-solid fa-plus"></i> Nova Obra
            </button>
        </div>
    </div>

    <!-- KPIs -->
    <section class="kpi-grid" id="obrasKpiRow" style="margin-bottom:24px;">
        <div class="kpi-card" id="kpiCardAndamento" style="cursor:pointer;" onclick="filtrarObrasPorStatus('em_andamento')">
            <div class="kpi-icon flow"><i class="fa-solid fa-rotate"></i></div>
            <div class="kpi-info">
                <span class="kpi-label">Em andamento</span>
                <span class="kpi-value" id="okpiAndamento"><i class="fa-solid fa-spinner fa-spin" style="font-size:16px;"></i></span>
            </div>
            <div class="kpi-trend neutral" style="font-size:11px;cursor:pointer;">Ver obras</div>
        </div>
        <div class="kpi-card" id="kpiCardPlanejadas" style="cursor:pointer;" onclick="filtrarObrasPorStatus('planejada')">
            <div class="kpi-icon window"><i class="fa-solid fa-calendar"></i></div>
            <div class="kpi-info">
                <span class="kpi-label">Planejadas</span>
                <span class="kpi-value" id="okpiPlanejadas"><i class="fa-solid fa-spinner fa-spin" style="font-size:16px;"></i></span>
            </div>
            <div class="kpi-trend neutral" style="font-size:11px;cursor:pointer;">Ver obras</div>
        </div>
        <div class="kpi-card" id="kpiCardConcluidas" style="cursor:pointer;" onclick="filtrarObrasPorStatus('concluida')">
            <div class="kpi-icon peak"><i class="fa-solid fa-circle-check"></i></div>
            <div class="kpi-info">
                <span class="kpi-label">Concluídas</span>
                <span class="kpi-value" id="okpiConcluidas"><i class="fa-solid fa-spinner fa-spin" style="font-size:16px;"></i></span>
            </div>
            <div class="kpi-trend up"><i class="fa-solid fa-check"></i> Finalizadas</div>
        </div>
        <div class="kpi-card" id="kpiCardPausadas" style="cursor:pointer;" onclick="filtrarObrasPorStatus('pausada')">
            <div class="kpi-icon cong"><i class="fa-solid fa-circle-pause"></i></div>
            <div class="kpi-info">
                <span class="kpi-label">Pausadas</span>
                <span class="kpi-value" id="okpiPausadas"><i class="fa-solid fa-spinner fa-spin" style="font-size:16px;"></i></span>
            </div>
            <div class="kpi-trend down"><i class="fa-solid fa-triangle-exclamation"></i> Atenção</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-icon window"><i class="fa-solid fa-percent"></i></div>
            <div class="kpi-info">
                <span class="kpi-label">Progresso médio</span>
                <span class="kpi-value" id="okpiProgressoMedio"><i class="fa-solid fa-spinner fa-spin" style="font-size:16px;"></i></span>
                <span class="kpi-unit" style="font-size:10px;">geral das obras</span>
            </div>
        </div>
    </section>

    <!-- TABELA -->
    <section class="table-section">
        <div class="section-header" style="padding:20px 20px 0;flex-wrap:wrap;gap:12px;">
            <div>
                <h2>Lista de Obras</h2>
                <p id="obrasCount" style="font-size:12px;color:var(--text-muted);margin:2px 0 0;">Carregando…</p>
            </div>
            <div class="table-controls" style="flex-wrap:wrap;gap:8px;">
                <!-- Filtro região -->
                <select class="filter-select" id="obrasRegiaoFilter" onchange="carregarObrasPage()">
                    <option value="">Todas as regiões</option>
                    ${OBRA_REGIOES.map(r => `<option value="${r}">${r.charAt(0).toUpperCase()+r.slice(1)}</option>`).join('')}
                </select>
                <!-- Filtro status -->
                <select class="filter-select" id="obrasStatusFilter" onchange="carregarObrasPage()">
                    <option value="">Todos os status</option>
                    <option value="em_andamento">Em andamento</option>
                    <option value="planejada">Planejada</option>
                    <option value="concluida">Concluída</option>
                    <option value="pausada">Pausada</option>
                </select>
                <!-- Busca -->
                <div style="position:relative;">
                    <i class="fa-solid fa-magnifying-glass" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--text-muted);font-size:12px;pointer-events:none;"></i>
                    <input
                        class="table-search"
                        style="padding-left:30px;"
                        type="text"
                        placeholder="Buscar obra, região…"
                        id="obrasSearch"
                        oninput="debounceObrasSearch(this.value)"
                    />
                </div>
                <!-- Limpar filtros -->
                <button class="btn-outline" id="btnLimparFiltros" onclick="limparFiltrosObras()" title="Limpar filtros" style="display:none;">
                    <i class="fa-solid fa-xmark"></i> Limpar
                </button>
            </div>
        </div>

        <div class="table-wrapper" style="margin-top:16px;">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Nome da Obra</th>
                        <th>Região</th>
                        <th>Empresa</th>
                        <th>Status</th>
                        <th>Progresso</th>
                        <th>Início</th>
                        <th>Previsão Fim</th>
                        <th style="text-align:center;">Ações</th>
                    </tr>
                </thead>
                <tbody id="obrasPageBody">
                    <tr>
                        <td colspan="9" style="text-align:center;padding:40px;color:var(--text-muted);">
                            <i class="fa-solid fa-spinner fa-spin" style="font-size:20px;margin-bottom:8px;display:block;"></i>
                            Carregando obras…
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Paginação -->
        <div id="obrasPaginacao" style="display:flex;justify-content:space-between;align-items:center;padding:16px 20px;font-size:12px;color:var(--text-muted);border-top:1px solid var(--border);"></div>
    </section>

    <!-- DETALHES INLINE (drawer lateral) -->
    <div id="obraDrawer" class="modal-overlay" onclick="fecharDrawer(event)" style="display:none;"></div>
    <div id="obraDrawerPanel" style="
        position:fixed;top:0;right:-420px;width:420px;height:100vh;
        background:var(--surface);border-left:1px solid var(--border);
        z-index:1200;transition:right .3s cubic-bezier(.4,0,.2,1);
        overflow-y:auto;padding:0;box-shadow:-8px 0 32px rgba(0,0,0,.12);
    "></div>`;

    // Botão refresh
    document.getElementById('obrasRefreshBtn')?.addEventListener('click', async () => {
        const icon = document.querySelector('#obrasRefreshBtn i');
        icon.classList.add('spinning');
        await carregarObrasPage();
        await carregarKPIsObras();
        setTimeout(() => icon.classList.remove('spinning'), 800);
        showToast('Lista atualizada!', 'success');
    });

    carregarKPIsObras();
    carregarObrasPage();
}

// ── KPIs da página de obras ───────────────────────────────────────
async function carregarKPIsObras() {
    try {
        const r = await apiFetch('/api/obras/resumo');
        const set = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val ?? '—';
        };
        set('okpiAndamento',      r.em_andamento  || 0);
        set('okpiPlanejadas',     r.planejadas    || 0);
        set('okpiConcluidas',     r.concluidas    || 0);
        set('okpiPausadas',       r.pausadas      || 0);
        set('okpiProgressoMedio', r.progresso_medio != null ? r.progresso_medio + '%' : '—');
    } catch (e) {
        console.warn('KPIs obras indisponíveis:', e.message);
    }
}

// ── Filtrar por status clicando no KPI ────────────────────────────
window.filtrarObrasPorStatus = function(status) {
    const sel = document.getElementById('obrasStatusFilter');
    if (!sel) return;
    sel.value = status;
    document.getElementById('btnLimparFiltros').style.display = 'inline-flex';
    carregarObrasPage();
};

// ── Limpar filtros ────────────────────────────────────────────────
window.limparFiltrosObras = function() {
    const sf = document.getElementById('obrasStatusFilter');
    const rf = document.getElementById('obrasRegiaoFilter');
    const sb = document.getElementById('obrasSearch');
    if (sf) sf.value = '';
    if (rf) rf.value = '';
    if (sb) sb.value = '';
    document.getElementById('btnLimparFiltros').style.display = 'none';
    carregarObrasPage();
};

// ── Debounce para busca ───────────────────────────────────────────
let _obrasSearchTimer;
window.debounceObrasSearch = function(q) {
    clearTimeout(_obrasSearchTimer);
    _obrasSearchTimer = setTimeout(() => {
        const btn = document.getElementById('btnLimparFiltros');
        if (btn) btn.style.display = q.length > 0 ? 'inline-flex' : 'none';
        carregarObrasPage();
    }, 350);
};

// ── Carregar obras com filtros aplicados ──────────────────────────
async function carregarObrasPage() {
    const status = document.getElementById('obrasStatusFilter')?.value || '';
    const regiao = document.getElementById('obrasRegiaoFilter')?.value || '';
    const busca  = document.getElementById('obrasSearch')?.value.trim() || '';

    // Monta query string
    const params = new URLSearchParams();
    if (regiao) params.set('regiao', regiao);
    if (status) params.set('status', status);
    if (busca)  params.set('busca',  busca);

    const tbody = document.getElementById('obrasPageBody');
    if (tbody) tbody.innerHTML = `
        <tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text-muted);">
            <i class="fa-solid fa-spinner fa-spin"></i> Carregando…
        </td></tr>`;

    try {
        const obras = await apiFetch(`/api/obras?${params.toString()}`);
        obrasCache = obras;
        renderObrasPageBody(obras);

        // Atualiza contador
        const count = document.getElementById('obrasCount');
        if (count) count.textContent = `${obras.length} obra${obras.length !== 1 ? 's' : ''} encontrada${obras.length !== 1 ? 's' : ''}`;

        // Mostra btn limpar se há filtro ativo
        const temFiltro = status || regiao || busca;
        const btn = document.getElementById('btnLimparFiltros');
        if (btn) btn.style.display = temFiltro ? 'inline-flex' : 'none';

    } catch (e) {
        if (tbody) tbody.innerHTML = `
            <tr><td colspan="9" style="color:#ef4444;padding:24px;text-align:center;">
                <i class="fa-solid fa-circle-xmark" style="margin-right:6px;"></i>
                Erro ao carregar obras: ${e.message}
            </td></tr>`;
    }
}

// ── Renderizar linhas da tabela ───────────────────────────────────
function renderObrasPageBody(obras) {
    const tbody = document.getElementById('obrasPageBody');
    if (!tbody) return;

    if (!obras.length) {
        tbody.innerHTML = `
            <tr><td colspan="9" style="text-align:center;padding:48px;color:var(--text-muted);">
                <i class="fa-solid fa-helmet-safety" style="font-size:32px;opacity:.25;display:block;margin-bottom:12px;"></i>
                Nenhuma obra encontrada com os filtros selecionados.
            </td></tr>`;
        return;
    }

    tbody.innerHTML = obras.map((o, idx) => {
        const si      = OBRA_STATUS[o.status] || OBRA_STATUS.planejada;
        const pct     = o.progresso || 0;
        const pctColor = pct >= 75 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#3b82f6';
        const prazoVencendo = _prazoVencendo(o.data_fim, o.status);

        return `
        <tr
            data-id="${o.id}"
            style="cursor:pointer;transition:background .15s;"
            onclick="abrirDrawerObra(${o.id})"
            onmouseenter="this.style.background='var(--hover)'"
            onmouseleave="this.style.background=''"
        >
            <td style="font-size:11px;color:var(--text-muted);font-weight:600;">#${o.id}</td>

            <td>
                <div style="font-weight:600;font-size:13px;margin-bottom:2px;">${_hl(o.nome)}</div>
                ${o.descricao
                    ? `<div style="font-size:11px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220px;">${o.descricao.substring(0,60)}${o.descricao.length>60?'…':''}</div>`
                    : ''}
            </td>

            <td>
                <span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:99px;background:#f1f5f9;font-size:11px;font-weight:600;color:var(--text-secondary);">
                    <i class="fa-solid fa-location-dot" style="font-size:9px;"></i>
                    ${o.regiao ? o.regiao.charAt(0).toUpperCase()+o.regiao.slice(1) : '—'}
                </span>
            </td>

            <td style="font-size:12px;color:var(--text-secondary);">
                ${o.empresa_nome || '<span style="color:var(--text-muted);">—</span>'}
            </td>

            <td>
                <span class="status-pill ${si.cls}">
                    <i class="fa-solid ${si.icon}"></i> ${si.label}
                </span>
            </td>

            <td style="min-width:130px;">
                <div style="display:flex;align-items:center;gap:8px;">
                    <div style="flex:1;height:6px;background:#e2e8f0;border-radius:99px;overflow:hidden;">
                        <div style="width:${pct}%;height:100%;background:${pctColor};border-radius:99px;transition:width .4s;"></div>
                    </div>
                    <span style="font-size:11px;font-weight:700;color:${pctColor};min-width:30px;">${pct}%</span>
                </div>
            </td>

            <td style="font-size:12px;color:var(--text-muted);">${o.data_inicio || '—'}</td>

            <td style="font-size:12px;">
                ${prazoVencendo
                    ? `<span style="color:#ef4444;font-weight:600;">${o.data_fim} <i class="fa-solid fa-triangle-exclamation" style="font-size:10px;"></i></span>`
                    : `<span style="color:var(--text-muted);">${o.data_fim || '—'}</span>`}
            </td>

            <td style="text-align:center;white-space:nowrap;" onclick="event.stopPropagation()">
                <button
                    class="action-btn"
                    title="Ver detalhes"
                    onclick="abrirDrawerObra(${o.id})"
                ><i class="fa-solid fa-eye"></i></button>
                <button
                    class="action-btn"
                    title="Editar"
                    onclick="abrirModalObra(obrasCache.find(x=>x.id===${o.id}))"
                ><i class="fa-solid fa-pen"></i></button>
                <button
                    class="action-btn"
                    title="Excluir"
                    style="color:var(--red);"
                    onclick="excluirObraPage(${o.id},'${o.nome.replace(/'/g,"\\'")}')"
                ><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>`;
    }).join('');
}

// ── Helper: destaca termo buscado ─────────────────────────────────
function _hl(text) {
    const q = document.getElementById('obrasSearch')?.value.trim();
    if (!q || q.length < 2) return text;
    const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi');
    return text.replace(re, '<mark style="background:#fef08a;border-radius:2px;padding:0 1px;">$1</mark>');
}

// ── Helper: verifica se prazo vence em ≤ 14 dias e está em andamento
function _prazoVencendo(dataFim, status) {
    if (!dataFim || status === 'concluida' || status === 'pausada') return false;
    const partes = dataFim.split('/');
    if (partes.length !== 3) return false;
    const dt = new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);
    const diff = (dt - new Date()) / (1000*60*60*24);
    return diff >= 0 && diff <= 14;
}

// ── DRAWER — painel lateral de detalhes ──────────────────────────
window.abrirDrawerObra = function(id) {
    const obra  = obrasCache.find(o => o.id === id);
    const panel = document.getElementById('obraDrawerPanel');
    const over  = document.getElementById('obraDrawer');
    if (!panel || !over) return;

    if (!obra) { showToast('Obra não encontrada no cache.', 'warning'); return; }

    const si       = OBRA_STATUS[obra.status] || OBRA_STATUS.planejada;
    const pct      = obra.progresso || 0;
    const pctColor = pct >= 75 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#3b82f6';

    panel.innerHTML = `
        <div style="padding:24px 24px 12px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:flex-start;">
            <div>
                <p style="font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);margin:0 0 4px;">Detalhes da Obra</p>
                <h3 style="margin:0;font-size:15px;line-height:1.3;">${obra.nome}</h3>
            </div>
            <button onclick="fecharDrawer()" style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:18px;padding:4px;">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <!-- status + progresso -->
        <div style="padding:20px 24px;border-bottom:1px solid var(--border);">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
                <span class="status-pill ${si.cls}"><i class="fa-solid ${si.icon}"></i> ${si.label}</span>
                <span style="font-size:12px;color:var(--text-muted);">ID #${obra.id}</span>
            </div>
            <div style="margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:12px;color:var(--text-muted);">Progresso</span>
                <span style="font-size:14px;font-weight:700;color:${pctColor};">${pct}%</span>
            </div>
            <div style="height:10px;background:#e2e8f0;border-radius:99px;overflow:hidden;">
                <div style="width:${pct}%;height:100%;background:${pctColor};border-radius:99px;"></div>
            </div>
            <!-- slider de progresso rápido -->
            <div style="margin-top:12px;">
                <label style="font-size:11px;color:var(--text-muted);">Atualizar progresso rapidamente</label>
                <div style="display:flex;align-items:center;gap:10px;margin-top:6px;">
                    <input
                        type="range" min="0" max="100" value="${pct}"
                        id="drawerRangeProgresso"
                        style="flex:1;accent-color:${pctColor};"
                        oninput="document.getElementById('drawerRangeVal').textContent=this.value+'%'"
                    />
                    <span id="drawerRangeVal" style="font-size:12px;font-weight:700;min-width:36px;color:${pctColor};">${pct}%</span>
                    <button
                        class="btn-primary"
                        style="padding:6px 12px;font-size:11px;"
                        onclick="salvarProgressoRapido(${obra.id})"
                    >Salvar</button>
                </div>
            </div>
        </div>

        <!-- Informações -->
        <div style="padding:20px 24px;border-bottom:1px solid var(--border);">
            <p style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);margin:0 0 14px;font-weight:600;">Informações</p>
            ${_drawerRow('Região',   obra.regiao ? obra.regiao.charAt(0).toUpperCase()+obra.regiao.slice(1) : '—', 'fa-location-dot')}
            ${_drawerRow('Empresa',  obra.empresa_nome || '—', 'fa-building')}
            ${_drawerRow('Início',   obra.data_inicio  || '—', 'fa-calendar-day')}
            ${_drawerRow('Previsão', obra.data_fim      || '—', 'fa-calendar-check')}
            ${obra.lat && obra.lng
                ? _drawerRow('Coordenadas', `${parseFloat(obra.lat).toFixed(5)}, ${parseFloat(obra.lng).toFixed(5)}`, 'fa-map-pin')
                : _drawerRow('Coordenadas', 'Não informadas', 'fa-map-pin')}
        </div>

        <!-- Descrição -->
        ${obra.descricao ? `
        <div style="padding:20px 24px;border-bottom:1px solid var(--border);">
            <p style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);margin:0 0 10px;font-weight:600;">Descrição</p>
            <p style="font-size:13px;color:var(--text-secondary);line-height:1.6;margin:0;">${obra.descricao}</p>
        </div>` : ''}

        <!-- Ações -->
        <div style="padding:20px 24px;display:flex;gap:10px;flex-wrap:wrap;">
            <button
                class="btn-primary"
                style="flex:1;"
                onclick="fecharDrawer();abrirModalObra(obrasCache.find(x=>x.id===${obra.id}))"
            ><i class="fa-solid fa-pen"></i> Editar obra</button>
            <button
                class="btn-outline"
                style="flex:1;color:var(--red);border-color:var(--red);"
                onclick="fecharDrawer();excluirObraPage(${obra.id},'${obra.nome.replace(/'/g,"\\'")}')"
            ><i class="fa-solid fa-trash"></i> Excluir</button>
        </div>

        ${obra.lat && obra.lng ? `
        <div style="padding:0 24px 24px;">
            <div id="drawerMiniMap" style="height:180px;border-radius:10px;overflow:hidden;border:1px solid var(--border);"></div>
        </div>` : ''}
    `;

    over.style.display = 'block';
    panel.style.right  = '0';

    // Destaca linha na tabela
    document.querySelectorAll('#obrasPageBody tr').forEach(tr => {
        tr.style.background = tr.dataset.id == id ? 'var(--hover)' : '';
    });

    // Mini mapa
    if (obra.lat && obra.lng) {
        setTimeout(() => {
            const miniMap = L.map('drawerMiniMap', {
                center: [obra.lat, obra.lng],
                zoom: 14,
                zoomControl: false,
                attributionControl: false,
                dragging: false,
                scrollWheelZoom: false,
            });
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom:19 }).addTo(miniMap);
            const si2 = OBRA_STATUS[obra.status] || OBRA_STATUS.planejada;
            const hex = { em_andamento:'#3b82f6', concluida:'#10b981', planejada:'#f59e0b', pausada:'#ef4444' }[obra.status] || '#64748b';
            L.circleMarker([obra.lat, obra.lng], { radius:10, fillColor:hex, color:'white', weight:2, fillOpacity:.9 })
                .addTo(miniMap)
                .bindPopup(obra.nome)
                .openPopup();
        }, 150);
    }
};

function _drawerRow(label, value, icon) {
    return `
        <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;">
            <div style="width:28px;height:28px;border-radius:7px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;">
                <i class="fa-solid ${icon}" style="font-size:11px;color:var(--text-muted);"></i>
            </div>
            <div>
                <p style="font-size:10px;color:var(--text-muted);margin:0 0 2px;">${label}</p>
                <p style="font-size:13px;font-weight:500;margin:0;color:var(--text-primary);">${value}</p>
            </div>
        </div>`;
}

window.fecharDrawer = function(e) {
    if (e && e.target !== document.getElementById('obraDrawer')) return;
    const panel = document.getElementById('obraDrawerPanel');
    const over  = document.getElementById('obraDrawer');
    if (panel) panel.style.right = '-420px';
    setTimeout(() => { if (over) over.style.display = 'none'; }, 300);
    document.querySelectorAll('#obrasPageBody tr').forEach(tr => tr.style.background = '');
};

// ── Salvar progresso rápido via PATCH ─────────────────────────────
window.salvarProgressoRapido = async function(id) {
    const val = parseInt(document.getElementById('drawerRangeProgresso')?.value);
    if (isNaN(val)) return;
    // status automático
    const novoStatus = val === 100 ? 'concluida' : val > 0 ? 'em_andamento' : null;
    try {
        await apiFetch(`/api/obras/${id}/progresso`, {
            method: 'PATCH',
            body: JSON.stringify({ progresso: val, status: novoStatus })
        });
        // Atualiza cache local
        const idx = obrasCache.findIndex(o => o.id === id);
        if (idx > -1) {
            obrasCache[idx].progresso = val;
            if (novoStatus) obrasCache[idx].status = novoStatus;
        }
        showToast(`Progresso atualizado para ${val}%!`, 'success');
        fecharDrawer();
        await carregarObrasPage();
        await carregarKPIsObras();
    } catch (e) {
        showToast('Erro ao atualizar progresso: ' + e.message, 'error');
    }
};

// ── Excluir obra ─────────────────────────────────────────────────
window.excluirObraPage = async function(id, nome) {
    if (!confirm(`Tem certeza que deseja excluir a obra "${nome}"?\nEsta ação não pode ser desfeita.`)) return;
    try {
        await apiFetch(`/api/obras/${id}`, { method: 'DELETE' });
        showToast('Obra excluída com sucesso.', 'success');
        await carregarObrasPage();
        await carregarKPIsObras();
    } catch (e) {
        showToast('Erro ao excluir: ' + e.message, 'error');
    }
};