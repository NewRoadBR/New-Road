# TODO - Ajustes Planejamento de Obras

- [x] Identificar falha ao carregar KPIs na tela de Planejamento de Obras: erro 500 em `GET /api/obras/resumo`.
- [x] Corrigir sintaxe da VIEW `vw_resumo_obras` no `src/database/script-tabelas.sql` (trocar `SUM(status='...')` por `SUM(CASE WHEN ... THEN 1 ELSE 0 END)` ).
- [ ] Corrigir o próximo erro de API: `Unknown column 'o.atualizado_em' in 'field list'` (ou criar a coluna no banco ou remover/ajustar a query do `obraModel.js`).

