(function () {
  var NOTIFICATIONS = [
    {
      color: "#ef4444",
      icon: "fa-triangle-exclamation",
      title: "Alerta operacional",
      desc: "Revise o planejamento de obras e avisos críticos.",
      time: "Agora"
    },
    {
      color: "#f59e0b",
      icon: "fa-chart-bar",
      title: "Pico de tráfego",
      desc: "Volume acima da média histórica na região SP.",
      time: "Há 20 min"
    },
    {
      color: "#3b82f6",
      icon: "fa-file-chart-column",
      title: "Sistema sincronizado",
      desc: "Dados atualizados com o banco NewRoad.",
      time: "Há 1 hora"
    }
  ];

  function initNotifications() {
    var list = document.getElementById("notifList");
    if (!list) return;

    list.innerHTML = NOTIFICATIONS.map(function (n) {
      return (
        '<div class="notif-item">' +
          '<span class="notif-dot" style="background:' + n.color + ';"></span>' +
          '<div class="notif-text">' +
            '<p class="notif-title"><i class="fa-solid ' + n.icon + '" style="color:' + n.color + ';margin-right:5px;"></i>' + n.title + '</p>' +
            '<p class="notif-desc">' + n.desc + '</p>' +
            '<p class="notif-time">' + n.time + '</p>' +
          '</div>' +
        '</div>'
      );
    }).join("");
  }

  function initInteractions() {
    var notifBtn = document.getElementById("notifBtn");
    var notifPanel = document.getElementById("notifPanel");
    var overlay = document.getElementById("overlay");
    var closeNotif = document.getElementById("closeNotif");
    var sidebar = document.getElementById("sidebar");
    var burger = document.getElementById("burgerBtn");

    function closePanels() {
      if (notifPanel) notifPanel.classList.remove("open");
      if (overlay) overlay.classList.remove("visible");
      if (sidebar) sidebar.classList.remove("mobile-open");
    }

    if (notifBtn && notifPanel && overlay) {
      notifBtn.addEventListener("click", function () {
        notifPanel.classList.add("open");
        overlay.classList.add("visible");
      });
    }

    if (closeNotif) closeNotif.addEventListener("click", closePanels);
    if (overlay) overlay.addEventListener("click", closePanels);

    if (burger && sidebar && overlay) {
      burger.addEventListener("click", function () {
        sidebar.classList.toggle("mobile-open");
        overlay.classList.toggle("visible");
      });
    }
  }

  window.handleExitToLanding = function () {
    var overlayEl = document.createElement("div");
    overlayEl.style.cssText =
      "position:fixed;inset:0;background:rgba(15,23,42,0.85);" +
      "display:flex;flex-direction:column;align-items:center;justify-content:center;" +
      "z-index:9999;gap:20px;";
    overlayEl.innerHTML =
      '<div style="background:#fff;border-radius:16px;padding:32px 40px;text-align:center;max-width:360px;box-shadow:0 24px 64px rgba(0,0,0,0.25);">' +
        '<div style="width:52px;height:52px;background:#dbeafe;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">' +
          '<i class="fa-solid fa-arrow-left" style="color:#2563eb;font-size:20px;"></i>' +
        '</div>' +
        '<h3 style="font-size:18px;font-weight:700;color:#0f172a;margin-bottom:8px;">Sair da plataforma?</h3>' +
        '<p style="font-size:13px;color:#64748b;margin-bottom:24px;line-height:1.5;">Você será redirecionado para a página inicial do NewRoad.</p>' +
        '<div style="display:flex;gap:10px;justify-content:center;">' +
          '<button type="button" id="cancelExitBtn" style="padding:10px 20px;border-radius:8px;border:1px solid #e2e8f0;background:#f8fafc;color:#64748b;font-size:13px;font-weight:600;cursor:pointer;">Cancelar</button>' +
          '<button type="button" id="confirmExitBtn" style="padding:10px 20px;border-radius:8px;border:none;background:#2563eb;color:#fff;font-size:13px;font-weight:600;cursor:pointer;">' +
            '<i class="fa-solid fa-arrow-left" style="margin-right:6px;"></i>Confirmar saída' +
          '</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlayEl);
    overlayEl.querySelector("#cancelExitBtn").addEventListener("click", function () {
      overlayEl.remove();
    });
    overlayEl.querySelector("#confirmExitBtn").addEventListener("click", function () {
      sessionStorage.clear();
      window.location.href = "../index.html";
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    initNotifications();
    initInteractions();
    if (window.NewRoadAuth) NewRoadAuth.aplicarMenuPermissoes();
    if (window.NewRoadTheme) NewRoadTheme.syncFromApi();
  });
})();
