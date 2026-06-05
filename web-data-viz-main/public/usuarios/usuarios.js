let usuarios = [];
let usuariosFiltrados = [];
let usuarioEditandoId = null;

const endpointUsuarios = "/usuarios";

function obterEmpresaAtualId() {
  return Number(sessionStorage.EMPRESA_ID_USUARIO || 0);
}

function obterQueryEmpresa() {
  const empresaId = obterEmpresaAtualId();

  if (!Number.isInteger(empresaId) || empresaId <= 0) {
    return "empresaId=1";
  }

  return `empresaId=${empresaId}`;
}

const tbodyUsuarios = document.getElementById("tbodyUsuarios");
const listaVazia = document.getElementById("listaVazia");
const modalUsuario = document.getElementById("modalUsuario");
const tituloModal = document.getElementById("tituloModal");
const campoSenha = document.getElementById("campoSenha");
const mensagemForm = document.getElementById("mensagemForm");

const filtroBusca = document.getElementById("filtroBusca");
const filtroPerfil = document.getElementById("filtroPerfil");

const inputNome = document.getElementById("inputNome");
const inputEmail = document.getElementById("inputEmail");
const inputSenha = document.getElementById("inputSenha");
const inputTelefone = document.getElementById("inputTelefone");
const inputPerfil = document.getElementById("inputPerfil");
const inputAvatar = document.getElementById("inputAvatar");

const kpiTotalUsuarios = document.getElementById("kpiTotalUsuarios");
const kpiGestores = document.getElementById("kpiGestores");
const kpiAnalistas = document.getElementById("kpiAnalistas");
const kpiOperadores = document.getElementById("kpiOperadores");

const userBoxTopo = document.getElementById("userBoxTopo");
const avatarTopo = document.getElementById("avatarTopo");
const nomeUsuarioTopo = document.getElementById("nomeUsuarioTopo");
const perfilUsuarioTopo = document.getElementById("perfilUsuarioTopo");
const seloSessaoAtiva = document.getElementById("seloSessaoAtiva");

function criarIniciais(nome) {
  if (!nome) return "??";

  const partes = nome
    .trim()
    .split(/\s+/)
    .slice(0, 2);

  return partes
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
}

function normalizarTexto(texto) {
  return (texto || "").toString().toLowerCase().trim();
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

async function requestJson(url, options) {
  const resposta = await fetch(url, options);
  const conteudo = await resposta.text();

  let json = null;
  if (conteudo) {
    try {
      json = JSON.parse(conteudo);
    } catch (erro) {
      json = null;
    }
  }

  if (!resposta.ok) {
    const detalhe =
      (json && (json.erro || json.detalhe || json.message)) ||
      conteudo ||
      `Erro ${resposta.status}`;
    throw new Error(detalhe);
  }

  return json;
}

function abrirModal() {
  atualizarModoModal();
  modalUsuario.style.display = "flex";
}

function fecharModal() {
  usuarioEditandoId = null;
  limparFormulario();
  atualizarModoModal();
  modalUsuario.style.display = "none";
}

function atualizarModoModal() {
  if (usuarioEditandoId) {
    tituloModal.textContent = "Editar Usuario";
    campoSenha.hidden = true;
    return;
  }

  tituloModal.textContent = "Novo Usuario";
  campoSenha.hidden = false;
}

function limparFormulario() {
  inputNome.value = "";
  inputEmail.value = "";
  inputSenha.value = "";
  inputTelefone.value = "";
  inputPerfil.value = "Analista";
  inputAvatar.value = "";
  mensagemForm.hidden = true;
  mensagemForm.textContent = "";
}

function exibirMensagemForm(texto, tipo) {
  mensagemForm.textContent = texto;
  mensagemForm.hidden = false;
  mensagemForm.className = `mensagem-form ${tipo}`;
}

function preencherFormulario(usuario) {
  inputNome.value = usuario.nome || "";
  inputEmail.value = usuario.email || "";
  inputTelefone.value = usuario.telefone || "";
  inputPerfil.value = usuario.perfil || "Analista";
  inputAvatar.value = usuario.avatar || "";
  inputSenha.value = "";
}

function atualizarKPIs() {
  kpiTotalUsuarios.innerText = usuarios.length;
  kpiGestores.innerText = usuarios.filter((u) => u.perfil === "Gestor").length;
  kpiAnalistas.innerText = usuarios.filter((u) => u.perfil === "Analista").length;
  kpiOperadores.innerText = usuarios.filter((u) => u.perfil === "Operador").length;
}

function aplicarFiltros() {
  const busca = normalizarTexto(filtroBusca.value);
  const perfil = normalizarTexto(filtroPerfil.value);

  usuariosFiltrados = usuarios.filter((usuario) => {
    const textoBusca = [usuario.nome, usuario.email, usuario.perfil]
      .map((item) => normalizarTexto(item))
      .join(" ");

    const matchBusca = !busca || textoBusca.includes(busca);
    const matchPerfil = !perfil || normalizarTexto(usuario.perfil) === perfil;

    return matchBusca && matchPerfil;
  });

  renderizarTabela();
}

function renderizarTabela() {
  tbodyUsuarios.innerHTML = "";

  if (usuariosFiltrados.length === 0) {
    listaVazia.hidden = false;
    return;
  }

  listaVazia.hidden = true;

  usuariosFiltrados.forEach((usuario) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>
        <div class="usuario-identidade">
          <div class="usuario-avatar">${usuario.avatar || criarIniciais(usuario.nome)}</div>
          <div>
            <strong>${usuario.nome}</strong>
            <p>${usuario.email}${usuario.telefone ? ` · ${usuario.telefone}` : ""}</p>
          </div>
        </div>
      </td>
      <td>${usuario.perfil || "-"}</td>
      <td>${usuario.ultimo || "-"}</td>
      <td>
        <div class="acoes-linha">
          <button class="btn-editar" data-id="${usuario.id}">Editar</button>
          <button class="btn-excluir" data-id="${usuario.id}">Excluir</button>
        </div>
      </td>
    `;

    tbodyUsuarios.appendChild(tr);
  });
}

async function carregarUsuarios() {
  try {
    const queryEmpresa = obterQueryEmpresa();
    usuarios = await requestJson(`${endpointUsuarios}?${queryEmpresa}`);
    usuariosFiltrados = [...usuarios];

    atualizarKPIs();
    aplicarFiltros();
  } catch (erro) {
    console.error("Erro ao carregar usuarios:", erro);
    exibirMensagemForm(`Nao foi possivel carregar os usuarios: ${erro.message}`, "erro");
  }
}

function validarFormulario() {
  const email = inputEmail.value.trim();

  if (!inputNome.value.trim()) {
    throw new Error("Informe o nome do usuario.");
  }

  if (!email) {
    throw new Error("Informe o email do usuario.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Informe um email válido.");
  }

  if (!usuarioEditandoId) {
    if (!inputSenha.value.trim()) {
      throw new Error("Informe a senha para o novo usuario.");
    }

    if (inputSenha.value.trim().length < 8) {
      throw new Error("A senha deve ter pelo menos 8 caracteres.");
    }
  }
}

function montarPayload() {
  return {
    nome: inputNome.value.trim(),
    email: inputEmail.value.trim(),
    senha: inputSenha.value.trim() || undefined,
    telefone: inputTelefone.value.trim(),
    perfil: inputPerfil.value,
    avatar: inputAvatar.value.trim().toUpperCase() || criarIniciais(inputNome.value)
  };
}

async function salvarUsuario() {
  try {
    validarFormulario();
    const payload = montarPayload();
    const queryEmpresa = obterQueryEmpresa();

    if (usuarioEditandoId) {
      delete payload.senha;

      await requestJson(`${endpointUsuarios}/${usuarioEditandoId}?${queryEmpresa}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      exibirMensagemForm("Usuario atualizado com sucesso.", "sucesso");
    } else {
      await requestJson(`${endpointUsuarios}?${queryEmpresa}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      exibirMensagemForm("Usuario cadastrado com sucesso.", "sucesso");
    }

    await carregarUsuarios();

    setTimeout(() => {
      fecharModal();
    }, 450);
  } catch (erro) {
    console.error("Erro ao salvar usuario:", erro);
    exibirMensagemForm(erro.message || "Falha ao salvar usuario.", "erro");
  }
}

async function editarUsuario(id) {
  try {
    const queryEmpresa = obterQueryEmpresa();
    const usuario = await requestJson(`${endpointUsuarios}/${id}?${queryEmpresa}`);

    usuarioEditandoId = id;
    preencherFormulario(usuario);
    abrirModal();
  } catch (erro) {
    console.error("Erro ao buscar usuario:", erro);
    alert(`Nao foi possivel carregar o usuario: ${erro.message}`);
  }
}

async function excluirUsuario(id) {
  const confirmar = window.confirm("Deseja realmente excluir este usuario?");
  if (!confirmar) return;

  try {
    const queryEmpresa = obterQueryEmpresa();
    await requestJson(`${endpointUsuarios}/${id}?${queryEmpresa}`, { method: "DELETE" });
    await carregarUsuarios();
  } catch (erro) {
    console.error("Erro ao excluir usuario:", erro);
    alert(`Nao foi possivel excluir o usuario: ${erro.message}`);
  }
}

function prepararNovoUsuario() {
  usuarioEditandoId = null;
  limparFormulario();
  abrirModal();
}

function configurarEventos() {
  document.getElementById("btnNovoUsuario").addEventListener("click", prepararNovoUsuario);
  document.getElementById("btnFecharModal").addEventListener("click", fecharModal);
  document.getElementById("btnSalvarUsuario").addEventListener("click", salvarUsuario);

  filtroBusca.addEventListener("input", aplicarFiltros);
  filtroPerfil.addEventListener("change", aplicarFiltros);

  tbodyUsuarios.addEventListener("click", (evento) => {
    const botao = evento.target.closest("button[data-id]");
    if (!botao) return;

    const id = Number(botao.dataset.id);

    if (botao.classList.contains("btn-editar")) {
      editarUsuario(id);
    }

    if (botao.classList.contains("btn-excluir")) {
      excluirUsuario(id);
    }
  });

  modalUsuario.addEventListener("click", (evento) => {
    if (evento.target === modalUsuario) {
      fecharModal();
    }
  });
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
aplicarUsuarioLogadoNaTopbar();
configurarEventos();
carregarUsuarios();
