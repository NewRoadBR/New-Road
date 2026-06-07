(function (global) {
  var PAGINAS = {
    dashboard: { url: "/dashboard/index.html", secao: "principal" },
    obras: { url: "/obras/obras.html", secao: "principal" },
    simulacoes: { url: "/simulacoes/simulacoes.html", secao: "principal" },
    mural: { url: "/mural/mural.html", secao: "gestao" },
    usuarios: { url: "/usuarios/usuarios.html", secao: "gestao" },
    configuracoes: { url: "/configuracoes/configuracoes.html", secao: "gestao" }
  };

  var ACESSO_POR_PERFIL = {
    Gestor: ["dashboard", "obras", "simulacoes", "mural", "usuarios", "configuracoes"],
    Analista: ["dashboard", "obras", "mural", "configuracoes"],
    Operador: ["dashboard", "mural", "configuracoes"]
  };

  var ROTAS_PROTEGIDAS = /\/(dashboard|obras|simulacoes|mural|usuarios|configuracoes)(\/|$)/i;

  function normalizarPerfil(valor) {
    var texto = String(valor || "").trim();
    if (!texto) return null;
    if (/gestor/i.test(texto)) return "Gestor";
    if (/analista/i.test(texto)) return "Analista";
    if (/operador/i.test(texto)) return "Operador";
    return "Analista";
  }

  function obterPerfilAtual() {
    return normalizarPerfil(
      sessionStorage.PERFIL_USUARIO || sessionStorage.ROLE_USUARIO || ""
    );
  }

  function temSessaoAtiva() {
    return Boolean(
      sessionStorage.ID_USUARIO ||
      sessionStorage.EMAIL_USUARIO ||
      sessionStorage.NOME_USUARIO
    );
  }

  function detectarPaginaAtual() {
    var path = (global.location.pathname || "").toLowerCase();

    if (path.indexOf("/dashboard/") !== -1) return "dashboard";
    if (path.indexOf("/obras/") !== -1) return "obras";
    if (path.indexOf("/simulacoes/") !== -1) return "simulacoes";
    if (path.indexOf("/mural/") !== -1) return "mural";
    if (path.indexOf("/usuarios/") !== -1) return "usuarios";
    if (path.indexOf("/configuracoes/") !== -1) return "configuracoes";

    return null;
  }

  function paginasPermitidas(perfil) {
    return ACESSO_POR_PERFIL[perfil] || ACESSO_POR_PERFIL.Analista;
  }

  function podeAcessarPagina(perfil, pagina) {
    if (!pagina) return true;
    return paginasPermitidas(perfil).indexOf(pagina) !== -1;
  }

  function primeiraPaginaPermitida(perfil) {
    var lista = paginasPermitidas(perfil);
    return lista.length ? lista[0] : "dashboard";
  }

  function urlDaPagina(pagina) {
    return (PAGINAS[pagina] && PAGINAS[pagina].url) || PAGINAS.dashboard.url;
  }

  function paginaPorHref(href) {
    var destino = String(href || "").toLowerCase();
    if (destino.indexOf("dashboard") !== -1) return "dashboard";
    if (destino.indexOf("obras") !== -1) return "obras";
    if (destino.indexOf("simulacoes") !== -1) return "simulacoes";
    if (destino.indexOf("mural") !== -1) return "mural";
    if (destino.indexOf("usuarios") !== -1) return "usuarios";
    if (destino.indexOf("configuracoes") !== -1) return "configuracoes";
    return null;
  }

  function redirecionarLogin() {
    global.location.replace("/login.html");
  }

  function guardarPaginaAtual() {
    if (!ROTAS_PROTEGIDAS.test(global.location.pathname || "")) return;

    if (!temSessaoAtiva()) {
      redirecionarLogin();
      return;
    }

    var perfil = obterPerfilAtual();
    if (!perfil) {
      redirecionarLogin();
      return;
    }

    var pagina = detectarPaginaAtual();
    if (pagina && !podeAcessarPagina(perfil, pagina)) {
      global.location.replace(urlDaPagina(primeiraPaginaPermitida(perfil)));
    }
  }

  function ocultarSecoesVazias(nav) {
    var labels = nav.querySelectorAll(".nav-label");

    labels.forEach(function (label) {
      var itens = [];
      var el = label.nextElementSibling;

      while (el && !el.classList.contains("nav-label")) {
        if (el.classList.contains("nav-item")) itens.push(el);
        el = el.nextElementSibling;
      }

      var algumVisivel = itens.some(function (item) {
        return item.style.display !== "none";
      });

      label.style.display = algumVisivel ? "" : "none";
    });
  }

  function aplicarMenuPermissoes() {
    if (!temSessaoAtiva()) return;

    var perfil = obterPerfilAtual();
    if (!perfil) return;

    var permitidas = paginasPermitidas(perfil);
    var nav = document.querySelector(".sidebar-nav");
    if (!nav) return;

    nav.querySelectorAll(".nav-item").forEach(function (link) {
      var pagina = paginaPorHref(link.getAttribute("href"));
      if (!pagina) return;

      if (permitidas.indexOf(pagina) === -1) {
        link.style.display = "none";
        link.setAttribute("aria-hidden", "true");
        link.setAttribute("tabindex", "-1");
      } else {
        link.style.display = "";
        link.removeAttribute("aria-hidden");
        link.removeAttribute("tabindex");
      }
    });

    ocultarSecoesVazias(nav);
  }

  function init() {
    guardarPaginaAtual();

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", aplicarMenuPermissoes);
    } else {
      aplicarMenuPermissoes();
    }
  }

  global.NewRoadAuth = {
    obterPerfilAtual: obterPerfilAtual,
    paginasPermitidas: paginasPermitidas,
    podeAcessarPagina: podeAcessarPagina,
    aplicarMenuPermissoes: aplicarMenuPermissoes,
    guardarPaginaAtual: guardarPaginaAtual,
    urlDaPagina: urlDaPagina,
    ACESSO_POR_PERFIL: ACESSO_POR_PERFIL
  };

  init();
})(window);
