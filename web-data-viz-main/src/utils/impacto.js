var IMPACTO_CODIGOS = {
  baixo: 1,
  medio: 2,
  alto: 3
};

function removerAcentosImpacto(texto) {
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

function impactoParaCodigo(valor) {
  if (valor == null || valor === "") return IMPACTO_CODIGOS.baixo;

  var texto = removerAcentosImpacto(valor);
  if (texto === "baixo") return IMPACTO_CODIGOS.baixo;
  if (texto === "medio") return IMPACTO_CODIGOS.medio;
  if (texto === "alto") return IMPACTO_CODIGOS.alto;

  var n = Number(valor);
  if (n === IMPACTO_CODIGOS.baixo || n === IMPACTO_CODIGOS.medio || n === IMPACTO_CODIGOS.alto) {
    return n;
  }

  var pct = normalizarImpactoNumerico(valor);
  if (pct >= 70) return IMPACTO_CODIGOS.alto;
  if (pct >= 40) return IMPACTO_CODIGOS.medio;
  return IMPACTO_CODIGOS.baixo;
}

function codigoParaImpacto(valor) {
  var codigo = impactoParaCodigo(valor);
  if (codigo === IMPACTO_CODIGOS.alto) return "alto";
  if (codigo === IMPACTO_CODIGOS.medio) return "medio";
  return "baixo";
}

function formatarObraImpacto(obra) {
  if (!obra || typeof obra !== "object") return obra;
  return Object.assign({}, obra, {
    impacto_previsto: codigoParaImpacto(obra.impacto_previsto)
  });
}

function formatarListaObrasImpacto(lista) {
  if (!Array.isArray(lista)) return lista;
  return lista.map(formatarObraImpacto);
}

module.exports = {
  impactoParaCodigo: impactoParaCodigo,
  codigoParaImpacto: codigoParaImpacto,
  formatarObraImpacto: formatarObraImpacto,
  formatarListaObrasImpacto: formatarListaObrasImpacto
};
