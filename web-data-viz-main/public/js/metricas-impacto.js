(function (global) {
  var ROTULOS = {
    baixo: "Baixo",
    medio: "Médio",
    alto: "Alto"
  };

  function removerAcentos(texto) {
    return String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function normalizarImpactoNumerico(valor) {
    var n = Number(valor);
    if (!Number.isFinite(n) || n < 0) return 0;
    if (n <= 10) return n * 10;
    return Math.min(n, 100);
  }

  function percentualParaNivel(percentual) {
    if (percentual >= 70) return "alto";
    if (percentual >= 40) return "medio";
    return "baixo";
  }

  function resolverNivelImpacto(valor) {
    if (valor == null || valor === "") return "baixo";

    var texto = removerAcentos(valor);
    if (texto === "baixo" || texto === "1") return "baixo";
    if (texto === "medio" || texto === "2") return "medio";
    if (texto === "alto" || texto === "3") return "alto";

    return percentualParaNivel(normalizarImpactoNumerico(valor));
  }

  function obterNivelImpacto(valor) {
    var nivel = resolverNivelImpacto(valor);
    var classe = nivel === "alto" ? "ruim" : nivel === "medio" ? "medio" : "bom";

    return {
      id: nivel,
      label: ROTULOS[nivel],
      classe: classe,
      badge: nivel === "alto" ? "red" : nivel === "medio" ? "yellow" : "green",
      valorGrafico: nivel === "alto" ? 3 : nivel === "medio" ? 2 : 1
    };
  }

  function pillImpactoHtml(valor, extraClass) {
    var nivel = obterNivelImpacto(valor);
    var cls = extraClass ? " " + extraClass : "";
    return (
      '<span class="indicador-pill ' + nivel.classe + cls + '">' + nivel.label + "</span>"
    );
  }

  global.removerAcentos = removerAcentos;
  global.normalizarImpactoNumerico = normalizarImpactoNumerico;
  global.resolverNivelImpacto = resolverNivelImpacto;
  global.obterNivelImpacto = obterNivelImpacto;
  global.pillImpactoHtml = pillImpactoHtml;
  global.obterContextoPorPercentual = function (valor) {
    var nivel = obterNivelImpacto(valor);
    return { classe: nivel.classe, label: nivel.label };
  };
})(window);
