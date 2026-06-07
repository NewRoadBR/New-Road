(function (global) {
  var STORAGE_KEY = "NR_DARK_MODE";

  function apply(isDark) {
    var root = document.documentElement;

    if (isDark) {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }

    try {
      sessionStorage.setItem(STORAGE_KEY, isDark ? "1" : "0");
    } catch (e) {}

    global.dispatchEvent(
      new CustomEvent("nr-theme-change", { detail: { dark: !!isDark } })
    );
  }

  function isDark() {
    return document.documentElement.getAttribute("data-theme") === "dark";
  }

  function boot() {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") {
        document.documentElement.setAttribute("data-theme", "dark");
      }
    } catch (e) {}
  }

  function getUserId() {
    var id = Number(sessionStorage.ID_USUARIO || 0);
    return id > 0 ? id : 1;
  }

  function syncFromApi() {
    return fetch("/preferencias/" + getUserId())
      .then(function (res) {
        return res.ok ? res.json() : null;
      })
      .then(function (prefs) {
        if (prefs && typeof prefs.darkMode === "boolean") {
          apply(prefs.darkMode);
        }
      })
      .catch(function () {});
  }

  function bindToggle(input) {
    if (!input) return;
    input.addEventListener("change", function () {
      apply(input.checked);
    });
  }

  boot();

  global.NewRoadTheme = {
    apply: apply,
    isDark: isDark,
    boot: boot,
    syncFromApi: syncFromApi,
    bindToggle: bindToggle
  };
})(window);
