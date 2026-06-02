const userBoxTopo = document.getElementById("userBoxTopo");
const avatarTopo = document.getElementById("avatarTopo");
const nomeUsuarioTopo = document.getElementById("nomeUsuarioTopo");
const perfilUsuarioTopo = document.getElementById("perfilUsuarioTopo");
const seloSessaoAtiva = document.getElementById("seloSessaoAtiva");

const selectIntervalo = document.getElementById("selectIntervalo");
const toggleNotifCritica = document.getElementById("toggleNotifCritica");
const toggleNotifPico = document.getElementById("toggleNotifPico");
const toggleNotifRelatorio = document.getElementById("toggleNotifRelatorio");
const toggleDarkMode = document.getElementById("toggleDarkMode");
const btnSalvarPreferencias = document.getElementById("btnSalvarPreferencias");
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

function setStatus(texto, tipo) {
  statusConfiguracoes.textContent = texto;
  statusConfiguracoes.className = tipo ? tipo : "";
}

function isOn(botao) {
  return botao.getAttribute("aria-pressed") === "true";
}

function setToggleState(botao, ligado) {
  botao.setAttribute("aria-pressed", ligado ? "true" : "false");
  botao.classList.toggle("off", !ligado);
}

function prepararToggles() {
  toggles.forEach((botao) => {
    botao.addEventListener("click", () => {
      setToggleState(botao, !isOn(botao));
    });
  });
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
  try {
    setStatus("Salvando preferências...", "");

    const payload = coletarPayload();

    await requestJson(`/preferencias/${idUsuarioSessao}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setStatus("Preferências salvas com sucesso.", "ok");
  } catch (erro) {
    setStatus(`Falha ao salvar preferências: ${erro.message}`, "erro");
  }
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

btnSalvarPreferencias.addEventListener("click", salvarPreferencias);

aplicarUsuarioLogadoNaTopbar();
prepararToggles();
carregarPreferencias();
