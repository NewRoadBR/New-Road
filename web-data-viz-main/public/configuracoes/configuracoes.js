const userBoxTopo = document.getElementById("userBoxTopo");
const avatarTopo = document.getElementById("avatarTopo");
const nomeUsuarioTopo = document.getElementById("nomeUsuarioTopo");
const perfilUsuarioTopo = document.getElementById("perfilUsuarioTopo");
const seloSessaoAtiva = document.getElementById("seloSessaoAtiva");

const cfgAvatar = document.getElementById("cfgAvatar");
const cfgNomeDisplay = document.getElementById("cfgNomeDisplay");
const cfgEmailDisplay = document.getElementById("cfgEmailDisplay");
const cfgSessaoPill = document.getElementById("cfgSessaoPill");
const cfgPerfil = document.getElementById("cfgPerfil");
const cfgUsuarioId = document.getElementById("cfgUsuarioId");

const selectIntervalo = document.getElementById("selectIntervalo");
const toggleNotifCritica = document.getElementById("toggleNotifCritica");
const toggleNotifPico = document.getElementById("toggleNotifPico");
const toggleNotifRelatorio = document.getElementById("toggleNotifRelatorio");
const toggleDarkMode = document.getElementById("toggleDarkMode");
const btnSalvarPreferencias = document.getElementById("btnSalvarPreferencias");
const btnEncerrarSessao = document.getElementById("btnEncerrarSessao");
const statusConfiguracoes = document.getElementById("statusConfiguracoes");

const toggles = [
  toggleNotifCritica,
  toggleNotifPico,
  toggleNotifRelatorio,
  toggleDarkMode
];

let idUsuarioSessao = Number(sessionStorage.ID_USUARIO || 1);

function criarIniciais(nome) {
  if (!nome) return "??";

  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
}

function aplicarUsuarioLogadoNaTopbar() {
  const nome = (sessionStorage.NOME_USUARIO || "").trim();
  const email = (sessionStorage.EMAIL_USUARIO || "").trim();
  const perfil =
    (sessionStorage.PERFIL_USUARIO || "").trim() ||
    (sessionStorage.ROLE_USUARIO || "").trim();
  const avatar = (sessionStorage.AVATAR_USUARIO || "").trim();

  const temSessaoAtiva = Boolean(nome || email || perfil || avatar);

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

function aplicarPerfilNaPagina() {
  const nome = (sessionStorage.NOME_USUARIO || "").trim();
  const email = (sessionStorage.EMAIL_USUARIO || "").trim();
  const perfil =
    (sessionStorage.PERFIL_USUARIO || "").trim() ||
    (sessionStorage.ROLE_USUARIO || "").trim();
  const avatar = (sessionStorage.AVATAR_USUARIO || "").trim();
  const temSessao = Boolean(nome || email || perfil);

  const iniciais = (avatar || criarIniciais(nome || email)).slice(0, 2).toUpperCase();

  if (cfgAvatar) cfgAvatar.textContent = iniciais;
  if (cfgNomeDisplay) cfgNomeDisplay.textContent = nome || "NewRoad";
  if (cfgEmailDisplay) {
    cfgEmailDisplay.textContent = temSessao
      ? [perfil || "Equipe", email].filter(Boolean).join(" · ")
      : "Faça login para personalizar o perfil";
  }
  if (cfgPerfil) cfgPerfil.value = perfil || "—";
  if (cfgUsuarioId) cfgUsuarioId.value = String(idUsuarioSessao);
  if (cfgSessaoPill) cfgSessaoPill.hidden = !temSessao;
}

function setStatus(texto, tipo) {
  statusConfiguracoes.textContent = texto;
  statusConfiguracoes.className = tipo ? "cfg-status " + tipo : "cfg-status";
}

function isOn(input) {
  return Boolean(input && input.checked);
}

function setToggleState(input, ligado) {
  if (input) input.checked = Boolean(ligado);
}

function preencherFormulario(preferencias) {
  selectIntervalo.value = preferencias.intervalo || "1 minuto";
  setToggleState(toggleNotifCritica, Boolean(preferencias.notifCritica));
  setToggleState(toggleNotifPico, Boolean(preferencias.notifPico));
  setToggleState(toggleNotifRelatorio, Boolean(preferencias.notifRelatorio));
  setToggleState(toggleDarkMode, Boolean(preferencias.darkMode));
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
    throw new Error((json && (json.erro || json.detalhe || json.message)) || texto || `Erro ${resposta.status}`);
  }

  return json;
}

async function carregarPreferencias() {
  try {
    const preferencias = await requestJson(`/preferencias/${idUsuarioSessao}`);
    preencherFormulario(preferencias);

    if (!sessionStorage.ID_USUARIO) {
      setStatus("Sessão não encontrada. Editando preferências do usuário padrão (ID 1).", "");
    } else {
      setStatus("Preferências carregadas.", "ok");
    }
  } catch (erro) {
    setStatus(`Falha ao carregar preferências: ${erro.message}`, "erro");
  }
}

function coletarPayload() {
  return {
    intervalo: selectIntervalo.value,
    notifCritica: isOn(toggleNotifCritica),
    notifPico: isOn(toggleNotifPico),
    notifRelatorio: isOn(toggleNotifRelatorio),
    darkMode: isOn(toggleDarkMode)
  };
}

async function salvarPreferencias() {
  const btnOriginal = btnSalvarPreferencias.innerHTML;

  try {
    setStatus("Salvando preferências...", "");
    btnSalvarPreferencias.disabled = true;

    const payload = coletarPayload();

    await requestJson(`/preferencias/${idUsuarioSessao}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setStatus("Preferências salvas com sucesso.", "ok");
    btnSalvarPreferencias.innerHTML = '<i class="fa-solid fa-check"></i> Salvo!';
    btnSalvarPreferencias.style.background = "#10b981";

    setTimeout(function () {
      btnSalvarPreferencias.innerHTML = btnOriginal;
      btnSalvarPreferencias.style.background = "";
    }, 2000);
  } catch (erro) {
    setStatus(`Falha ao salvar preferências: ${erro.message}`, "erro");
  } finally {
    btnSalvarPreferencias.disabled = false;
  }
}

function encerrarSessao() {
  if (!confirm("Deseja encerrar a sessão atual?")) return;
  sessionStorage.clear();
  window.location.href = "../index.html";
}

btnSalvarPreferencias.addEventListener("click", salvarPreferencias);
btnEncerrarSessao.addEventListener("click", encerrarSessao);

aplicarUsuarioLogadoNaTopbar();
aplicarPerfilNaPagina();
carregarPreferencias();
