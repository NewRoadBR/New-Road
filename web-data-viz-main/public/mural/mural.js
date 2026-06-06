var avisoEditandoId = null;
var avisosCache = [];
var comentariosAbertos = {};
var comentariosCache = {};
var muralTypeFilter = "all";
var muralRodoviaFilter = "all";
var muralSearchTerm = "";

var RODOVIAS = [
  "Rodoanel",
  "Rodovia Adhemar Pereira de Barros",
  "Rodovia Anhanguera",
  "Rodovia Ayrton Senna",
  "Rodovia Castello Branco",
  "Rodovia Dom Pedro I",
  "Rodovia dos Bandeirantes",
  "Rodovia Marechal Rondon",
  "Rodovia Presidente Dutra",
  "Rodovia Raposo Tavares",
  "Rodovia Santos Dumont",
  "Rodovia Washington Luís",
  "Sistema Anchieta-Imigrantes"
];

var MURAL_TYPE_CFG = {
  urgente: { label: "Urgente", cls: "mural-tag-urgente", icon: "fa-triangle-exclamation" },
  atencao: { label: "Atenção", cls: "mural-tag-atencao", icon: "fa-eye" },
  info: { label: "Informativo", cls: "mural-tag-info", icon: "fa-circle-info" },
  concluido: { label: "Concluído", cls: "mural-tag-concluido", icon: "fa-circle-check" },
  planejado: { label: "Planejado", cls: "mural-tag-planejado", icon: "fa-calendar" }
};

window.onload = function () {
  aplicarUsuarioLogadoNaTopbar();
  preencherSelectRodovias();
  listarAvisos();
  listarChat();
  listarUsuariosAtivos();

  setInterval(listarChat, 5000);

  var modal = document.getElementById("muralModal");
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) muralCloseModal();
    });
  }

  var searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      muralSearchTerm = searchInput.value.trim().toLowerCase();
      renderizarAvisos(avisosCache);
    });
  }
};

function preencherSelectRodovias() {
  var selects = [
    document.getElementById("inputRodovia"),
    document.getElementById("mQuickRodovia"),
    document.getElementById("mRegionFilter")
  ];

  RODOVIAS.forEach(function (rodovia) {
    if (selects[0]) {
      var opt = document.createElement("option");
      opt.value = rodovia;
      opt.textContent = rodovia;
      selects[0].appendChild(opt);
    }
    if (selects[1]) {
      var opt2 = document.createElement("option");
      opt2.value = rodovia;
      opt2.textContent = rodovia;
      selects[1].appendChild(opt2);
    }
  });
}

function getEmpresaAtualId() {
  return Number(sessionStorage.EMPRESA_ID_USUARIO || 0);
}

function getEmpresaQuery() {
  var empresaId = getEmpresaAtualId();
  if (!Number.isInteger(empresaId) || empresaId <= 0) {
    throw new Error("Sessao sem empresa valida");
  }
  return "empresaId=" + empresaId;
}

function getUsuarioAtualId() {
  return Number(sessionStorage.ID_USUARIO || 1);
}

function isGestorAtual() {
  var perfil = (sessionStorage.PERFIL_USUARIO || sessionStorage.ROLE_USUARIO || "").trim();
  return perfil === "Gestor" || /gestor/i.test(perfil);
}

function podeGerenciarAutor(autorId, empresaId) {
  return Number(autorId) === getUsuarioAtualId() ||
    (isGestorAtual() && empresaId > 0 && empresaId === getEmpresaAtualId());
}

function criarIniciais(nome) {
  if (!nome) return "??";
  return nome.trim().split(/\s+/).slice(0, 2).map(function (p) {
    return p.charAt(0).toUpperCase();
  }).join("").slice(0, 2);
}

function aplicarUsuarioLogadoNaTopbar() {
  var userBoxTopo = document.getElementById("userBoxTopo");
  if (!userBoxTopo) return;

  var avatarTopo = document.getElementById("avatarTopo");
  var nomeUsuarioTopo = document.getElementById("nomeUsuarioTopo");
  var perfilUsuarioTopo = document.getElementById("perfilUsuarioTopo");
  var seloSessaoAtiva = document.getElementById("seloSessaoAtiva");

  var nome = (sessionStorage.NOME_USUARIO || "").trim();
  var email = (sessionStorage.EMAIL_USUARIO || "").trim();
  var perfil = (sessionStorage.PERFIL_USUARIO || "").trim() || (sessionStorage.ROLE_USUARIO || "").trim();
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

function muralCharCount(input, countId, max) {
  var el = document.getElementById(countId);
  if (el) el.textContent = (input.value || "").length + "/" + max;
}

function muralOpenModal() {
  if (!avisoEditandoId) limparFormulario(false);
  document.getElementById("muralModal").classList.add("open");
  document.getElementById("inputTitulo").focus();
}

function muralCloseModal() {
  document.getElementById("muralModal").classList.remove("open");
  if (avisoEditandoId) {
    avisoEditandoId = null;
    limparFormulario(false);
  }
}

function atualizarModoFormularioAviso() {
  var titulo = document.getElementById("tituloFormularioAviso");
  var botao = document.getElementById("btnPublicarAviso");
  if (!titulo || !botao) return;

  if (avisoEditandoId) {
    titulo.innerHTML = '<i class="fa-solid fa-pen" style="color:var(--brand-blue-light);margin-right:8px;"></i>Editar Aviso';
    botao.innerHTML = '<i class="fa-solid fa-check"></i> Salvar';
    return;
  }

  titulo.innerHTML = '<i class="fa-solid fa-plus" style="color:var(--brand-blue-light);margin-right:8px;"></i>Novo Aviso';
  botao.innerHTML = '<i class="fa-solid fa-bullhorn"></i> Publicar';
}

function muralSetFilter(type, el) {
  muralTypeFilter = type;
  document.querySelectorAll(".mural-chip").forEach(function (c) {
    c.classList.remove("active");
  });
  el.classList.add("active");
  muralApplyFilters();
}

function muralApplyFilters() {
  var sel = document.getElementById("mRegionFilter");
  muralRodoviaFilter = sel ? sel.value : "all";
  renderizarAvisos(avisosCache);
}

function atualizarFiltroRodovias(dados) {
  var sel = document.getElementById("mRegionFilter");
  if (!sel) return;

  var atual = sel.value;
  var rodovias = {};
  dados.forEach(function (a) {
    if (a.rodovia) rodovias[a.rodovia] = true;
  });

  sel.innerHTML = '<option value="all">Todas as rodovias</option>';
  Object.keys(rodovias).sort().forEach(function (r) {
    var opt = document.createElement("option");
    opt.value = r;
    opt.textContent = r;
    sel.appendChild(opt);
  });

  if (atual && (atual === "all" || rodovias[atual])) {
    sel.value = atual;
  }
}

function atualizarStats(dados) {
  var urgente = 0;
  var atencao = 0;
  var concluido = 0;
  var comentarios = 0;

  dados.forEach(function (a) {
    if (a.tipo === "urgente") urgente++;
    if (a.tipo === "atencao") atencao++;
    if (a.tipo === "concluido") concluido++;
    comentarios += Number(a.total_comentarios || 0);
  });

  var el;
  el = document.getElementById("mStatUrgente"); if (el) el.textContent = urgente;
  el = document.getElementById("mStatAtencao"); if (el) el.textContent = atencao;
  el = document.getElementById("mStatResolvido"); if (el) el.textContent = concluido;
  el = document.getElementById("mStatComents"); if (el) el.textContent = comentarios;
}

function formatarTempoRelativo(data) {
  if (!data) return "";
  var diff = Date.now() - new Date(data).getTime();
  var min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return min + " min";
  var h = Math.floor(min / 60);
  if (h < 24) return h + " h";
  var d = Math.floor(h / 24);
  if (d < 7) return d + " d";
  return new Date(data).toLocaleDateString("pt-BR");
}

function publicarAviso() {
  var queryEmpresa;
  try {
    queryEmpresa = getEmpresaQuery();
  } catch (erro) {
    alert(erro.message);
    return;
  }

  var inputTipo = document.getElementById("inputTipo");
  var inputRodovia = document.getElementById("inputRodovia");
  var inputTitulo = document.getElementById("inputTitulo");
  var inputDescricao = document.getElementById("inputDescricao");
  var inputPinned = document.getElementById("inputPinned");

  if (!inputTitulo.value.trim()) {
    alert("Informe o título do aviso.");
    return;
  }

  var payload = {
    fkUsuario: getUsuarioAtualId(),
    tipo: inputTipo.value,
    rodovia: inputRodovia.value,
    titulo: inputTitulo.value.trim(),
    descricao: inputDescricao.value.trim(),
    pinned: inputPinned.value
  };

  var rota = avisoEditandoId
    ? "/mural/editar/" + avisoEditandoId + "?" + queryEmpresa
    : "/mural/publicar?" + queryEmpresa;
  var metodo = avisoEditandoId ? "PUT" : "POST";

  fetch(rota, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).then(function () {
    limparFormulario(true);
    muralCloseModal();
    listarAvisos();
  });
}

function publicarAvisoRapido() {
  var titulo = document.getElementById("mQuickTitle");
  var tipo = document.getElementById("mQuickTipo");
  var rodovia = document.getElementById("mQuickRodovia");

  if (!titulo.value.trim()) {
    alert("Informe o título do aviso rápido.");
    return;
  }

  var queryEmpresa;
  try {
    queryEmpresa = getEmpresaQuery();
  } catch (erro) {
    alert(erro.message);
    return;
  }

  fetch("/mural/publicar?" + queryEmpresa, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fkUsuario: getUsuarioAtualId(),
      tipo: tipo.value,
      rodovia: rodovia.value,
      titulo: titulo.value.trim(),
      descricao: "",
      pinned: "0"
    })
  }).then(function () {
    titulo.value = "";
    muralCharCount(titulo, "mQuickTitleCount", 60);
    listarAvisos();
  });
}

function listarAvisos() {
  var queryEmpresa;
  try {
    queryEmpresa = getEmpresaQuery();
  } catch (erro) {
    console.error(erro);
    return;
  }

  fetch("/mural/listar?" + queryEmpresa)
    .then(function (resposta) { return resposta.json(); })
    .then(function (dados) {
      avisosCache = dados || [];
      atualizarFiltroRodovias(avisosCache);
      atualizarStats(avisosCache);
      renderizarAvisos(avisosCache);
    });
}

function renderizarAvisos(dados) {
  var feed = document.getElementById("feedAvisos");
  if (!feed) return;

  var filtrados = dados.filter(function (a) {
    var tipoOk = muralTypeFilter === "all" || a.tipo === muralTypeFilter;
    var rodoviaOk = muralRodoviaFilter === "all" || a.rodovia === muralRodoviaFilter;
    var buscaOk = !muralSearchTerm ||
      (a.titulo || "").toLowerCase().indexOf(muralSearchTerm) >= 0 ||
      (a.descricao || "").toLowerCase().indexOf(muralSearchTerm) >= 0 ||
      (a.rodovia || "").toLowerCase().indexOf(muralSearchTerm) >= 0 ||
      (a.nome || "").toLowerCase().indexOf(muralSearchTerm) >= 0;
    return tipoOk && rodoviaOk && buscaOk;
  });

  filtrados.sort(function (a, b) {
    var pinA = a.pinned == 1 ? 1 : 0;
    var pinB = b.pinned == 1 ? 1 : 0;
    if (pinB !== pinA) return pinB - pinA;
    return new Date(b.criado_em) - new Date(a.criado_em);
  });

  var fc = document.getElementById("mFeedCount");
  if (fc) {
    fc.textContent = filtrados.length + " aviso" + (filtrados.length !== 1 ? "s" : "") + " encontrado" + (filtrados.length !== 1 ? "s" : "");
  }

  if (!filtrados.length) {
    feed.innerHTML = '<div class="mural-empty"><i class="fa-regular fa-folder-open"></i><p>Nenhum aviso para os filtros selecionados.</p></div>';
    return;
  }

  feed.innerHTML = filtrados.map(function (aviso) {
    return montarCardAviso(aviso);
  }).join("");

  filtrados.forEach(function (aviso) {
    if (comentariosAbertos[aviso.id]) {
      listarComentarios(aviso.id);
    }
  });
}

function montarCardAviso(aviso) {
  var tc = MURAL_TYPE_CFG[aviso.tipo] || MURAL_TYPE_CFG.info;
  var pinned = aviso.pinned == 1;
  var podeEditar = podeGerenciarAutor(aviso.fkUsuario, Number(aviso.empresaId || 0));
  var avatarText = (aviso.avatar || criarIniciais(aviso.nome)).slice(0, 2);
  var cor = aviso.cor || "#2563eb";
  var role = aviso.role || aviso.perfil || "Operação";
  var comentarios = comentariosCache[aviso.id] || [];
  var commentsOpen = Boolean(comentariosAbertos[aviso.id]);

  var commentsHtml = comentarios.map(function (c) {
    return (
      '<div class="mural-comment-item">' +
        '<div class="mural-comment-avatar" style="background:' + (c.cor || "#64748b") + ';">' +
          (c.avatar || criarIniciais(c.nome)) +
        '</div>' +
        '<div class="mural-comment-bubble">' +
          '<div class="mural-comment-author">' + c.nome + '</div>' +
          '<div class="mural-comment-text">' + c.texto + '</div>' +
          '<div class="mural-comment-time">' + formatarTempoRelativo(c.criado_em) + '</div>' +
        '</div>' +
      '</div>'
    );
  }).join("");

  var acoesAdmin = "";
  if (podeEditar) {
    acoesAdmin =
      '<button type="button" class="mural-action" onclick="iniciarEdicaoAviso(' + aviso.id + ')" title="Editar">' +
        '<i class="fa-solid fa-pen"></i>' +
      '</button>' +
      '<button type="button" class="mural-action mural-action-danger" onclick="deletar(' + aviso.id + ')" title="Excluir">' +
        '<i class="fa-solid fa-trash"></i>' +
      '</button>';
  }

  return (
    '<div class="mural-aviso-card ' + (pinned ? "pinned" : "") + '" id="maviso-' + aviso.id + '">' +
      '<div class="mural-aviso-top">' +
        '<div class="mural-aviso-avatar" style="background:' + cor + ';">' + avatarText + '</div>' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="mural-aviso-author">' +
            aviso.nome +
            ' <span class="mural-role-badge">' + role + '</span>' +
            (pinned ? ' <span class="mural-pinned-label"><i class="fa-solid fa-thumbtack"></i> Fixado</span>' : "") +
          '</div>' +
          '<div class="mural-aviso-time">' + formatarTempoRelativo(aviso.criado_em) + '</div>' +
        '</div>' +
        '<div class="mural-aviso-tags">' +
          '<span class="mural-aviso-tag ' + tc.cls + '"><i class="fa-solid ' + tc.icon + '"></i> ' + tc.label + '</span>' +
          '<span class="mural-region-tag"><i class="fa-solid fa-location-dot"></i> ' + (aviso.rodovia || "—") + '</span>' +
        '</div>' +
      '</div>' +
      '<div style="margin-bottom:14px;">' +
        '<div class="mural-aviso-title">' + aviso.titulo + '</div>' +
        '<div class="mural-aviso-desc">' + (aviso.descricao || "") + '</div>' +
      '</div>' +
      '<div class="mural-aviso-footer">' +
        '<button type="button" class="mural-action" onclick="curtir(' + aviso.id + ')">' +
          '<i class="fa-regular fa-heart"></i> <span id="mlike-' + aviso.id + '">' + (aviso.likes || 0) + '</span>' +
        '</button>' +
        '<button type="button" class="mural-action" onclick="toggleComentarios(' + aviso.id + ')">' +
          '<i class="fa-regular fa-comment"></i> <span>' + (aviso.total_comentarios || 0) + ' comentário' + ((aviso.total_comentarios || 0) !== 1 ? "s" : "") + '</span>' +
        '</button>' +
        acoesAdmin +
        (podeEditar ?
          '<button type="button" class="mural-pin-btn ' + (pinned ? "pinned" : "") + '" onclick="fixarAviso(' + aviso.id + ', ' + (pinned ? 0 : 1) + ')" title="' + (pinned ? "Desafixar" : "Fixar aviso") + '">' +
            '<i class="fa-solid fa-thumbtack"></i>' +
          '</button>' : "") +
      '</div>' +
      '<div class="mural-comments ' + (commentsOpen ? "open" : "") + '" id="comentarios-' + aviso.id + '">' +
        commentsHtml +
        '<div class="mural-comment-input-row">' +
          '<input class="mural-comment-input" type="text" placeholder="Comentar…" id="inputComentario-' + aviso.id + '" onkeydown="if(event.key===\'Enter\')comentar(' + aviso.id + ')" />' +
          '<button type="button" class="mural-comment-send" onclick="comentar(' + aviso.id + ')"><i class="fa-solid fa-paper-plane"></i></button>' +
        '</div>' +
      '</div>' +
    '</div>'
  );
}

function toggleComentarios(idAviso) {
  comentariosAbertos[idAviso] = !comentariosAbertos[idAviso];
  var sec = document.getElementById("comentarios-" + idAviso);
  if (sec) sec.classList.toggle("open", comentariosAbertos[idAviso]);
  if (comentariosAbertos[idAviso]) {
    listarComentarios(idAviso);
    setTimeout(function () {
      document.getElementById("inputComentario-" + idAviso).focus();
    }, 100);
  }
}

function curtir(idAviso) {
  var queryEmpresa = getEmpresaQuery();
  fetch("/mural/curtir?" + queryEmpresa, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fkAviso: idAviso, fkUsuario: getUsuarioAtualId() })
  }).then(function () { listarAvisos(); });
}

function comentar(idAviso) {
  var input = document.getElementById("inputComentario-" + idAviso);
  var texto = input ? input.value.trim() : "";
  if (!texto) return;

  var queryEmpresa = getEmpresaQuery();
  fetch("/mural/comentar?" + queryEmpresa, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fkAviso: idAviso, fkUsuario: getUsuarioAtualId(), texto: texto })
  }).then(function () {
    input.value = "";
    comentariosAbertos[idAviso] = true;
    listarComentarios(idAviso);
    listarAvisos();
  });
}

function listarComentarios(idAviso) {
  var queryEmpresa = getEmpresaQuery();
  fetch("/mural/comentarios/" + idAviso + "?" + queryEmpresa)
    .then(function (resposta) { return resposta.json(); })
    .then(function (dados) {
      comentariosCache[idAviso] = dados || [];
      renderizarComentarios(idAviso, dados);
    });
}

function renderizarComentarios(idAviso, dados) {
  var container = document.getElementById("comentarios-" + idAviso);
  if (!container) return;

  var commentsHtml = (dados || []).map(function (c) {
    return (
      '<div class="mural-comment-item">' +
        '<div class="mural-comment-avatar" style="background:' + (c.cor || "#64748b") + ';">' +
          (c.avatar || criarIniciais(c.nome)) +
        '</div>' +
        '<div class="mural-comment-bubble">' +
          '<div class="mural-comment-author">' + c.nome + '</div>' +
          '<div class="mural-comment-text">' + c.texto + '</div>' +
          '<div class="mural-comment-time">' + formatarTempoRelativo(c.criado_em) + '</div>' +
        '</div>' +
      '</div>'
    );
  }).join("");

  container.innerHTML =
    commentsHtml +
    '<div class="mural-comment-input-row">' +
      '<input class="mural-comment-input" type="text" placeholder="Comentar…" id="inputComentario-' + idAviso + '" onkeydown="if(event.key===\'Enter\')comentar(' + idAviso + ')" />' +
      '<button type="button" class="mural-comment-send" onclick="comentar(' + idAviso + ')"><i class="fa-solid fa-paper-plane"></i></button>' +
    '</div>';

  if (comentariosAbertos[idAviso]) {
    container.classList.add("open");
  }
}

function deletar(id) {
  if (!window.confirm("Deseja realmente excluir este aviso?")) return;

  var queryEmpresa = getEmpresaQuery();
  fetch("/mural/deletar/" + id + "?" + queryEmpresa, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fkUsuario: getUsuarioAtualId() })
  }).then(function () { listarAvisos(); });
}

function listarChat() {
  var queryEmpresa = getEmpresaQuery();
  fetch("/mural/chat?" + queryEmpresa)
    .then(function (resposta) { return resposta.json(); })
    .then(function (dados) { renderizarChat(dados); });
}

function renderizarChat(dados) {
  var chat = document.getElementById("chatMensagens");
  if (!chat) return;

  var mensagens = (dados || []).slice().reverse();
  var usuarioId = getUsuarioAtualId();

  chat.innerHTML = mensagens.map(function (msg) {
    var isMe = Number(msg.fkUsuario) === usuarioId;
    var avatar = (msg.avatar || criarIniciais(msg.nome)).slice(0, 2);
    var cor = msg.cor || "#2563eb";

    return (
      '<div class="mural-chat-msg ' + (isMe ? "me" : "") + '">' +
        '<div class="mural-chat-msg-avatar" style="background:' + cor + ';">' + avatar + '</div>' +
        '<div class="mural-chat-bubble">' +
          '<div class="mural-bubble-author">' + msg.nome + '</div>' +
          '<div class="mural-bubble-text">' + msg.texto + '</div>' +
          '<div class="mural-bubble-time">' + formatarTempoRelativo(msg.criado_em) + '</div>' +
        '</div>' +
      '</div>'
    );
  }).join("");

  chat.scrollTop = chat.scrollHeight;
}

function enviarMensagem() {
  var inputChat = document.getElementById("inputChat");
  var texto = inputChat ? inputChat.value.trim() : "";
  if (!texto) return;

  var queryEmpresa = getEmpresaQuery();
  fetch("/mural/chat/enviar?" + queryEmpresa, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fkUsuario: getUsuarioAtualId(), texto: texto })
  }).then(function () {
    inputChat.value = "";
    listarChat();
  });
}

function listarUsuariosAtivos() {
  var container = document.getElementById("muralActiveUsers");
  if (!container) return;

  var queryEmpresa;
  try {
    queryEmpresa = getEmpresaQuery();
  } catch (erro) {
    container.innerHTML = '<p class="mural-au-role">Faça login para ver a equipe.</p>';
    return;
  }

  fetch("/usuarios?" + queryEmpresa)
    .then(function (res) { return res.json(); })
    .then(function (dados) {
      var usuarios = dados || [];
      if (!usuarios.length) {
        container.innerHTML = '<p class="mural-au-role">Nenhum usuário cadastrado.</p>';
        return;
      }

      container.innerHTML = usuarios.slice(0, 8).map(function (u) {
        var perfil = u.perfil || u.role || "Operação";
        var avatar = (u.avatar || criarIniciais(u.nome)).slice(0, 2);
        var cor = u.cor || "#2563eb";
        var isMe = Number(u.id) === getUsuarioAtualId();

        return (
          '<div class="mural-active-row">' +
            '<div class="mural-au-avatar" style="background:' + cor + ';">' + avatar + '</div>' +
            '<div class="mural-au-name">' + u.nome + (isMe ? " (você)" : "") + '</div>' +
            '<div class="mural-au-role">' + perfil + '</div>' +
            (isMe ? '<div class="mural-au-dot"></div>' : '') +
          '</div>'
        );
      }).join("");
    })
    .catch(function () {
      container.innerHTML = '<p class="mural-au-role">Não foi possível carregar a equipe.</p>';
    });
}

function limparFormulario(fecharModal) {
  var inputTitulo = document.getElementById("inputTitulo");
  var inputDescricao = document.getElementById("inputDescricao");
  var inputRodovia = document.getElementById("inputRodovia");
  var inputPinned = document.getElementById("inputPinned");
  var inputTipo = document.getElementById("inputTipo");

  if (inputTitulo) inputTitulo.value = "";
  if (inputDescricao) inputDescricao.value = "";
  if (inputRodovia && inputRodovia.options.length) inputRodovia.selectedIndex = 0;
  if (inputPinned) inputPinned.value = "0";
  if (inputTipo) inputTipo.value = "atencao";

  muralCharCount(inputTitulo || { value: "" }, "mModalTitleCount", 80);
  muralCharCount(inputDescricao || { value: "" }, "mModalDescCount", 400);

  avisoEditandoId = null;
  atualizarModoFormularioAviso();
}

function iniciarEdicaoAviso(idAviso) {
  var aviso = avisosCache.find(function (item) {
    return Number(item.id) === Number(idAviso);
  });

  if (!aviso) {
    alert("Aviso não encontrado para edição.");
    return;
  }

  avisoEditandoId = idAviso;
  document.getElementById("inputTipo").value = aviso.tipo;
  document.getElementById("inputRodovia").value = aviso.rodovia;
  document.getElementById("inputTitulo").value = aviso.titulo;
  document.getElementById("inputDescricao").value = aviso.descricao || "";
  document.getElementById("inputPinned").value = String(aviso.pinned || 0);

  muralCharCount(document.getElementById("inputTitulo"), "mModalTitleCount", 80);
  muralCharCount(document.getElementById("inputDescricao"), "mModalDescCount", 400);
  atualizarModoFormularioAviso();
  muralOpenModal();
}

function fixarAviso(idAviso, pinned) {
  var queryEmpresa = getEmpresaQuery();
  fetch("/mural/" + idAviso + "/pin?" + queryEmpresa, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fkUsuario: getUsuarioAtualId(), pinned: pinned })
  }).then(function () { listarAvisos(); });
}
