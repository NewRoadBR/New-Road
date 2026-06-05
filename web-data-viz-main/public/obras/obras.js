let obras = [];

let obraEditando = null;

const tituloModalObra = document.getElementById("tituloModalObra");
const btnSalvarObra = document.getElementById("btnSalvarObra");

function obterEmpresaAtualId() {

    return Number(sessionStorage.EMPRESA_ID_USUARIO || 0);

}

function obterQueryEmpresa() {

    var empresaId = obterEmpresaAtualId();

    if (!Number.isInteger(empresaId) || empresaId <= 0) {
        empresaId = 1;
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
CARREGAR OBRAS
=========================================================
*/

async function carregarObras() {

    try {

        var queryEmpresa = obterQueryEmpresa();

        const resposta =
            await fetch(`/obras?${queryEmpresa}`);

        if (!resposta.ok) {
            throw new Error(`Erro ${resposta.status}`);
        }

        var dados = await resposta.json();
        obras = Array.isArray(dados) ? dados : [];

        aplicarFiltros();

        atualizarKPIs();

    } catch (erro) {

        console.error(erro);
        obras = [];
        aplicarFiltros();
        atualizarKPIs();

    }

}

async function requestJson(url, options) {

    const resposta = await fetch(url, options);
    const texto = await resposta.text();

    let json = null;

    if (texto) {
        try {
            json = JSON.parse(texto);
        } catch (erro) {
            json = null;
        }
    }

    if (!resposta.ok) {
        throw new Error(
            (json && (json.mensagem || json.erro || json.detalhe || json.message)) ||
            texto ||
            `Erro ${resposta.status}`
        );
    }

    return json;

}

function atualizarModoModal() {

    if (!tituloModalObra || !btnSalvarObra) return;

    if (obraEditando) {
        tituloModalObra.textContent = "Editar Obra";
        btnSalvarObra.textContent = "Salvar Alterações";
        return;
    }

    tituloModalObra.textContent = "Nova Obra";
    btnSalvarObra.textContent = "Salvar Obra";

}

/*
=========================================================
RENDER TABELA
=========================================================
*/

function renderizarTabela(lista) {

    const tbody =
        document.getElementById("tbodyObras");

    tbody.innerHTML = "";

    if (!lista.length) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:32px;">Nenhuma obra encontrada.</td></tr>';
        atualizarContadorLista(0);
        return;
    }

    lista.forEach(obra => {

        var status = (obra.status || "").toLowerCase();
        var badgeClass = "yellow";
        if (status.includes("planejada")) badgeClass = "red";
        if (status.includes("andamento")) badgeClass = "yellow";
        if (status.includes("final")) badgeClass = "green";

        var impacto = Number(obra.impacto_previsto || 0);
        var contexto = obterContextoPorPercentual(impacto);

        tbody.innerHTML += `

            <tr>

                <td>
                    ${obra.rodovia}
                </td>

                <td>
                    ${obra.descricao || "-"}
                </td>

                <td>

                    <span class="badge ${badgeClass}">

                        ${obra.status}

                    </span>

                </td>

                <td>
                    ${obra.data_inicio}
                </td>

                <td>
                    ${obra.data_fim || "-"}
                </td>

                <td>
                    <div class="impacto-wrap">
                        <div class="impacto-barra">
                            <span class="impacto-fill ${contexto.classe}" style="width:${Math.min(impacto, 100)}%"></span>
                        </div>
                        <strong>${impacto}%</strong>
                    </div>
                </td>

                <td>

                    <div class="acoes">

                        <button
                            class="btn-editar"
                            onclick="editar(${obra.id})"
                        >

                            Editar

                        </button>

                        <button
                            class="btn-excluir"
                            onclick="deletar(${obra.id})"
                        >

                            Excluir

                        </button>

                    </div>

                </td>

            </tr>

        `;

    });

    atualizarContadorLista(lista.length);

}

function atualizarContadorLista(visiveis) {

    var el = document.getElementById("obrasListaCount");
    if (!el) return;

    if (visiveis === obras.length) {
        el.textContent = obras.length + " obra" + (obras.length !== 1 ? "s" : "") + " cadastrada" + (obras.length !== 1 ? "s" : "");
        return;
    }

    el.textContent = visiveis + " de " + obras.length + " obras exibidas";

}

function obterListaFiltrada() {

    var rodovia = document.getElementById("filtroRodovia").value;
    var busca = (document.getElementById("searchInput")?.value || "").trim().toLowerCase();

    return obras.filter(function (obra) {
        var rodoviaOk = !rodovia || obra.rodovia === rodovia;
        var buscaOk = !busca ||
            (obra.rodovia || "").toLowerCase().indexOf(busca) >= 0 ||
            (obra.descricao || "").toLowerCase().indexOf(busca) >= 0 ||
            (obra.status || "").toLowerCase().indexOf(busca) >= 0;
        return rodoviaOk && buscaOk;
    });

}

function aplicarFiltros() {

    renderizarTabela(obterListaFiltrada());

}

/*
=========================================================
KPIs
=========================================================
*/

function atualizarKPIs() {

    const total = obras.length;

    const ativas =
        obras.filter(
            obra => obra.status === "Em andamento"
        ).length;

    const planejadas =
        obras.filter(
            obra => obra.status === "Planejada"
        ).length;

    const finalizadas =
        obras.filter(
            obra => obra.status === "Finalizada"
        ).length;

    document.getElementById("kpiTotal")
        .innerText = total;

    document.getElementById("kpiAtivas")
        .innerText = ativas;

    document.getElementById("kpiPlanejadas")
        .innerText = planejadas;

    document.getElementById("kpiFinalizadas")
        .innerText = finalizadas;

    var percentualAtivas = total > 0 ? (ativas / total) * 100 : 0;
    var percentualPlanejadas = total > 0 ? (planejadas / total) * 100 : 0;
    var percentualFinalizadas = total > 0 ? (finalizadas / total) * 100 : 0;

    aplicarContextoCard("cardKpiTotal", { classe: "bom", label: "Total" });
    aplicarContextoCard("cardKpiAtivas", obterContextoPorPercentual(percentualAtivas));
    aplicarContextoCard("cardKpiPlanejadas", obterContextoPorPercentual(percentualPlanejadas));
    aplicarContextoCard("cardKpiFinalizadas", obterContextoPorPercentual(100 - percentualFinalizadas));

}

/*
=========================================================
CADASTRAR
=========================================================
*/

async function cadastrar() {

    const empresaId = obterEmpresaAtualId();

    const body = {

        rodovia:
            document.getElementById("inputRodovia").value,

        descricao:
            document.getElementById("inputDescricao").value,

        status:
            document.getElementById("inputStatus").value,

        data_inicio:
            document.getElementById("inputDataInicio").value,

        data_fim:
            document.getElementById("inputDataFim").value,

        impacto_previsto:
            document.getElementById("inputImpacto").value,

        fk_empresa: empresaId

    };

    try {

        if (obraEditando) {

            await atualizar(obraEditando, body);

        } else {

            var queryEmpresa = obterQueryEmpresa();

            await requestJson(`/obras?${queryEmpresa}`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(body)

            });

        }

        fecharModal();

        await carregarObras();

    } catch (erro) {

        console.error(erro);

        alert(`Não foi possível salvar a obra: ${erro.message}`);

    }

}

/*
=========================================================
EDITAR
=========================================================
*/

async function editar(id) {

    try {

        var queryEmpresa = obterQueryEmpresa();

        const obra = await requestJson(`/obras/${id}?${queryEmpresa}`);

        obraEditando = id;

        atualizarModoModal();

        preencherFormulario(obra);

        abrirModal();

    } catch (erro) {

        console.error(erro);

        alert(`Não foi possível carregar a obra: ${erro.message}`);

    }

}

/*
=========================================================
ATUALIZAR
=========================================================
*/

async function atualizar(id, body) {

    var queryEmpresa = obterQueryEmpresa();

    return requestJson(`/obras/${id}?${queryEmpresa}`, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(body)

    });

}

/*
=========================================================
DELETAR
=========================================================
*/

async function deletar(id) {

    const confirmar = window.confirm("Deseja realmente excluir esta obra?");
    if (!confirmar) return;

    try {

        var queryEmpresa = obterQueryEmpresa();

        await fetch(`/obras/${id}?${queryEmpresa}`, {

            method: "DELETE"

        });

        carregarObras();

    } catch (erro) {

        console.error(erro);

    }

}

/*
=========================================================
FILTRO
=========================================================
*/

document
    .getElementById("filtroRodovia")
    .addEventListener("change", aplicarFiltros);

var searchInputObras = document.getElementById("searchInput");
if (searchInputObras) {
    searchInputObras.addEventListener("input", aplicarFiltros);
}

/*
=========================================================
MODAL
=========================================================
*/

function abrirModal() {

    atualizarModoModal();

    document
        .getElementById("modalObra")
        .style.display = "flex";

}

function fecharModal() {

    obraEditando = null;
    limparFormulario();
    atualizarModoModal();

    document
        .getElementById("modalObra")
        .style.display = "none";

}

function prepararNovaObra() {

    obraEditando = null;
    limparFormulario();
    atualizarModoModal();
    abrirModal();

}

/*
=========================================================
FORM
=========================================================
*/

function preencherFormulario(obra) {

    document.getElementById("inputRodovia").value =
        obra.rodovia;
    document.getElementById("inputDescricao").value =
        obra.descricao;

    document.getElementById("inputStatus").value =
        obra.status;

    document.getElementById("inputDataInicio").value =
        obra.data_inicio;

    document.getElementById("inputDataFim").value =
        obra.data_fim;

    document.getElementById("inputImpacto").value =
        obra.impacto_previsto;

}

function limparFormulario() {

    document.getElementById("inputRodovia").value = "";

    document.getElementById("inputDescricao").value = "";

    document.getElementById("inputStatus").value = "";

    document.getElementById("inputDataInicio").value = "";

    document.getElementById("inputDataFim").value = "";

    document.getElementById("inputImpacto").value = "";

}

/*
=========================================================
INIT
=========================================================
*/

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

carregarObras();

aplicarUsuarioLogadoNaTopbar();