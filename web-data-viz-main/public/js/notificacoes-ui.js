(function (global) {
  var TIPO_CFG = {
    error: { color: "#ef4444", icon: "fa-triangle-exclamation" },
    success: { color: "#10b981", icon: "fa-circle-check" },
    info: { color: "#3b82f6", icon: "fa-circle-info" }
  };

  function escaparHtml(texto) {
    return String(texto == null ? "" : texto)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function limparMensagem(texto) {
    return String(texto || "")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/[📊⚠️❌✅]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function formatarTempoRelativo(dataIso) {
    if (!dataIso) return "—";

    var data = new Date(dataIso);
    if (isNaN(data.getTime())) return "—";

    var diffMs = Date.now() - data.getTime();
    var diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return "Agora";
    if (diffMin < 60) return "Há " + diffMin + " min";

    var diffHoras = Math.floor(diffMin / 60);
    if (diffHoras < 24) {
      return "Há " + diffHoras + " h";
    }

    var diffDias = Math.floor(diffHoras / 24);
    if (diffDias === 1) return "Ontem";
    if (diffDias < 7) return "Há " + diffDias + " dias";

    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function obterConfigTipo(tipo) {
    return TIPO_CFG[tipo] || TIPO_CFG.info;
  }

  function obterIdUsuario() {
    var id = Number(sessionStorage.ID_USUARIO || 0);
    return id > 0 ? id : 1;
  }

  function renderizarLista(notificacoes, opcoes) {
    var list = document.getElementById("notifList");
    if (!list) return;

    if (opcoes && opcoes.habilitado === false) {
      list.innerHTML =
        '<div class="notif-item notif-item-empty">' +
          '<div class="notif-text">' +
            '<p class="notif-title">Notificações ETL desativadas</p>' +
            '<p class="notif-desc">Ative em Configurações para ver alertas de carga de dados.</p>' +
          '</div>' +
        '</div>';
      return;
    }

    if (!notificacoes.length) {
      list.innerHTML =
        '<div class="notif-item notif-item-empty">' +
          '<div class="notif-text">' +
            '<p class="notif-title">Nenhuma notificação</p>' +
            '<p class="notif-desc">Alertas do ETL aparecerão aqui após cada execução.</p>' +
          '</div>' +
        '</div>';
      return;
    }

    list.innerHTML = notificacoes.map(function (n) {
      var cfg = obterConfigTipo(n.tipo);
      var desc = limparMensagem(n.mensagem);

      return (
        '<div class="notif-item">' +
          '<span class="notif-dot" style="background:' + cfg.color + ';"></span>' +
          '<div class="notif-text">' +
            '<p class="notif-title">' +
              '<i class="fa-solid ' + cfg.icon + '" style="color:' + cfg.color + ';margin-right:5px;"></i>' +
              escaparHtml(n.titulo) +
            '</p>' +
            '<p class="notif-desc">' + escaparHtml(desc) + '</p>' +
            '<p class="notif-time">' + escaparHtml(formatarTempoRelativo(n.dataCriacao)) + '</p>' +
          '</div>' +
        '</div>'
      );
    }).join("");
  }

  function atualizarBadge(notificacoes, habilitado) {
    var badge = document.querySelector(".notif-btn .badge");
    if (!badge) return;

    if (habilitado === false) {
      badge.style.display = "none";
      badge.textContent = "0";
      return;
    }

    var naoLidas = notificacoes.filter(function (n) {
      return !n.visualizada;
    }).length;

    var total = notificacoes.length;
    var count = naoLidas > 0 ? naoLidas : total;

    if (count <= 0) {
      badge.style.display = "none";
      badge.textContent = "0";
      return;
    }

    badge.style.display = "";
    badge.textContent = count > 9 ? "9+" : String(count);
  }

  function normalizarResposta(dados) {
    if (Array.isArray(dados)) {
      return { habilitado: true, notificacoes: dados };
    }

    return {
      habilitado: dados && dados.habilitado !== false,
      notificacoes: Array.isArray(dados && dados.notificacoes) ? dados.notificacoes : []
    };
  }

  function carregarNotificacoes() {
    var list = document.getElementById("notifList");
    if (!list) return Promise.resolve([]);

    var idUsuario = obterIdUsuario();

    return fetch("/notificacoes?limit=20&idUsuario=" + idUsuario)
      .then(function (res) {
        if (!res.ok) throw new Error("Falha ao carregar notificações");
        return res.json();
      })
      .then(function (dados) {
        var payload = normalizarResposta(dados);
        renderizarLista(payload.notificacoes, { habilitado: payload.habilitado });
        atualizarBadge(payload.notificacoes, payload.habilitado);
        return payload.notificacoes;
      })
      .catch(function () {
        renderizarLista([], { habilitado: true });
        atualizarBadge([], true);
        return [];
      });
  }

  global.NewRoadNotificacoes = {
    carregar: carregarNotificacoes,
    renderizarLista: renderizarLista,
    atualizarBadge: atualizarBadge
  };
})(window);
