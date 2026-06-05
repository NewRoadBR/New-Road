const userBoxTopo = document.getElementById("userBoxTopo");
const avatarTopo = document.getElementById("avatarTopo");
const nomeUsuarioTopo = document.getElementById("nomeUsuarioTopo");
const perfilUsuarioTopo = document.getElementById("perfilUsuarioTopo");
const seloSessaoAtiva = document.getElementById("seloSessaoAtiva");

const cfgAvatar = document.getElementById("cfgAvatar");
const cfgNomeDisplay = document.getElementById("cfgNomeDisplay");
const cfgEmailDisplay = document.getElementById("cfgEmailDisplay");
const cfgNome = document.getElementById("cfgNome");
const cfgEmail = document.getElementById("cfgEmail");
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
let usuarioAtual = null;

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

function aplicarPerfilNaPagina(dados) {
  const nome = (dados?.nome || sessionStorage.NOME_USUARIO || "").trim();
  const email = (dados?.email || sessionStorage.EMAIL_USUARIO || "").trim();
  const perfil =
    (dados?.perfil || sessionStorage.PERFIL_USUARIO || "").trim() ||
    (dados?.role || sessionStorage.ROLE_USUARIO || "").trim();
  const avatar = (dados?.avatar || sessionStorage.AVATAR_USUARIO || "").trim();
  const temSessao = Boolean(nome || email || perfil);

  const iniciais = (avatar || criarIniciais(nome || email)).slice(0, 2).toUpperCase();

  if (cfgAvatar) cfgAvatar.textContent = iniciais;
  if (cfgNomeDisplay) cfgNomeDisplay.textContent = nome || "NewRoad";
  if (cfgNome) cfgNome.value = nome || "";
  if (cfgEmail) cfgEmail.value = email || "";
  if (cfgEmailDisplay) {
    cfgEmailDisplay.textContent = temSessao
      ? [perfil || "Equipe", email].filter(Boolean).join(" · ")
      : "Faça login para personalizar o perfil";
  }
  if (cfgPerfil) cfgPerfil.value = perfil || "—";
  if (cfgUsuarioId) cfgUsuarioId.value = String(dados?.id || idUsuarioSessao);
  if (cfgSessaoPill) cfgSessaoPill.hidden = !temSessao;
}

function sincronizarSessaoUsuario(dados) {
  if (!dados) return;

  usuarioAtual = dados;

  if (dados.id != null) sessionStorage.ID_USUARIO = dados.id;
  if (dados.nome) sessionStorage.NOME_USUARIO = dados.nome;
  if (dados.email) sessionStorage.EMAIL_USUARIO = dados.email;
  if (dados.perfil) sessionStorage.PERFIL_USUARIO = dados.perfil;
  if (dados.role) sessionStorage.ROLE_USUARIO = dados.role;
  if (dados.avatar) sessionStorage.AVATAR_USUARIO = dados.avatar;
  if (dados.empresaId != null) sessionStorage.EMPRESA_ID_USUARIO = dados.empresaId;

  idUsuarioSessao = Number(dados.id || idUsuarioSessao || 1);
}

function obterEmpresaId() {
  const empresaId = Number(sessionStorage.EMPRESA_ID_USUARIO || 1);
  return Number.isInteger(empresaId) && empresaId > 0 ? empresaId : 1;
}

async function carregarPerfilUsuario() {
  const empresaId = obterEmpresaId();

  try {
    const usuario = await requestJson(
      `/usuarios/${idUsuarioSessao}?empresaId=${empresaId}`
    );
    sincronizarSessaoUsuario(usuario);
    aplicarPerfilNaPagina(usuario);
    aplicarUsuarioLogadoNaTopbar();
  } catch (erro) {
    aplicarPerfilNaPagina();
    setStatus(`Perfil não carregado: ${erro.message}`, "erro");
  }
}

async function salvarPerfilUsuario() {
  const nome = (cfgNome?.value || "").trim();
  const email = (cfgEmail?.value || sessionStorage.EMAIL_USUARIO || "").trim();

  if (!nome) throw new Error("Informe o nome.");
  if (!email) throw new Error("E-mail não encontrado na sessão.");

  const payload = {
    nome,
    email,
    telefone: usuarioAtual?.telefone || "",
    perfil: usuarioAtual?.perfil || sessionStorage.PERFIL_USUARIO || "Analista",
    avatar: usuarioAtual?.avatar || sessionStorage.AVATAR_USUARIO || criarIniciais(nome)
  };

  const atualizado = await requestJson(
    `/usuarios/${idUsuarioSessao}?empresaId=${obterEmpresaId()}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }
  );

  sincronizarSessaoUsuario(Object.assign({}, usuarioAtual, atualizado, payload));
  aplicarPerfilNaPagina(atualizado);
  aplicarUsuarioLogadoNaTopbar();
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

    await salvarPerfilUsuario();

    await requestJson(`/preferencias/${idUsuarioSessao}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setStatus("Perfil e preferências salvos com sucesso.", "ok");
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
carregarPerfilUsuario();
carregarPreferencias();
