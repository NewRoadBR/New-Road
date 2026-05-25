// controllers/obraController.js
var obraModel = require("../models/obraModel");

// ─── LISTAR — GET /api/obras ──────────────────────────────────────────────────
// Query params: regiao, status, busca, page, limit
async function listar(req, res) {
    try {
        var page  = Math.max(1, parseInt(req.query.page)  || 1);
        var limit = Math.min(200, parseInt(req.query.limit) || 100);

        var filtros = {
            regiao: req.query.regiao || null,
            status: req.query.status || null,
            busca:  req.query.busca  || null,
            limit:  limit,
            offset: (page - 1) * limit
        };

        var obras = await obraModel.listarTodas(filtros);
        return res.status(200).json(obras);
    } catch (erro) {
        console.error("[listar]", erro);
        return res.status(500).json({ erro: erro.message });
    }
}

// ─── BUSCAR POR ID — GET /api/obras/:id ───────────────────────────────────────
async function buscarPorId(req, res) {
    try {
        var resultado = await obraModel.buscarPorId(req.params.id);
        if (!resultado.length) {
            return res.status(404).json({ erro: "Obra não encontrada" });
        }
        return res.status(200).json(resultado[0]);
    } catch (erro) {
        console.error("[buscarPorId]", erro);
        return res.status(500).json({ erro: erro.message });
    }
}

// ─── RESUMO / KPIs — GET /api/obras/resumo ────────────────────────────────────
async function resumo(req, res) {
    try {
        var rows = await obraModel.resumo();
        return res.status(200).json(rows[0] || {});
    } catch (erro) {
        console.error("[resumo]", erro);
        return res.status(500).json({ erro: erro.message });
    }
}

// ─── PARA MAPA — GET /api/obras/mapa?regiao=norte ────────────────────────────
async function paraMapa(req, res) {
    try {
        var obras = await obraModel.paraMapa(req.query.regiao || null);
        return res.status(200).json(obras);
    } catch (erro) {
        console.error("[paraMapa]", erro);
        return res.status(500).json({ erro: erro.message });
    }
}

// ─── CADASTRAR — POST /api/obras ──────────────────────────────────────────────
async function cadastrar(req, res) {
    var { nome, descricao, regiao, status, progresso, data_inicio, data_fim, lat, lng, fk_empresa } = req.body;

    // Validações
    if (!nome || nome.trim().length < 3) {
        return res.status(400).json({ erro: "Nome da obra é obrigatório (mín. 3 caracteres)" });
    }
    var regioes = ["centro","paulista","norte","sul","leste","oeste"];
    if (!regiao || !regioes.includes(regiao)) {
        return res.status(400).json({ erro: `Região inválida. Use: ${regioes.join(", ")}` });
    }
    var statusValidos = ["planejada","em_andamento","pausada","concluida"];
    if (status && !statusValidos.includes(status)) {
        return res.status(400).json({ erro: `Status inválido. Use: ${statusValidos.join(", ")}` });
    }
    if (progresso !== undefined && (progresso < 0 || progresso > 100)) {
        return res.status(400).json({ erro: "Progresso deve estar entre 0 e 100" });
    }
    if ((lat && !lng) || (!lat && lng)) {
        return res.status(400).json({ erro: "Informe latitude e longitude juntas" });
    }

    try {
        var resultado = await obraModel.cadastrar({
            nome: nome.trim(), descricao, regiao, status, progresso,
            data_inicio, data_fim, lat, lng, fk_empresa
        });
        return res.status(201).json({
            id:       resultado.insertId,
            mensagem: "Obra cadastrada com sucesso"
        });
    } catch (erro) {
        console.error("[cadastrar]", erro);
        return res.status(500).json({ erro: erro.sqlMessage || erro.message });
    }
}

// ─── ATUALIZAR — PUT /api/obras/:id ───────────────────────────────────────────
async function atualizar(req, res) {
    var id = req.params.id;

    // Verifica existência
    try {
        var check = await obraModel.buscarPorId(id);
        if (!check.length) return res.status(404).json({ erro: "Obra não encontrada" });
    } catch (e) {
        return res.status(500).json({ erro: e.message });
    }

    var { nome, descricao, regiao, status, progresso, data_inicio, data_fim, lat, lng, fk_empresa } = req.body;

    if (nome !== undefined && nome.trim().length < 3) {
        return res.status(400).json({ erro: "Nome deve ter ao menos 3 caracteres" });
    }
    var regioes = ["centro","paulista","norte","sul","leste","oeste"];
    if (regiao && !regioes.includes(regiao)) {
        return res.status(400).json({ erro: `Região inválida. Use: ${regioes.join(", ")}` });
    }
    if (progresso !== undefined && (progresso < 0 || progresso > 100)) {
        return res.status(400).json({ erro: "Progresso deve estar entre 0 e 100" });
    }

    try {
        await obraModel.atualizar(id, req.body);
        return res.status(200).json({ mensagem: "Obra atualizada com sucesso" });
    } catch (erro) {
        console.error("[atualizar]", erro);
        return res.status(500).json({ erro: erro.sqlMessage || erro.message });
    }
}

// ─── ATUALIZAR PROGRESSO — PATCH /api/obras/:id/progresso ────────────────────
async function atualizarProgresso(req, res) {
    var id         = req.params.id;
    var progresso  = parseInt(req.body.progresso);
    var statusBody = req.body.status || null;

    if (isNaN(progresso) || progresso < 0 || progresso > 100) {
        return res.status(400).json({ erro: "Progresso deve ser um número entre 0 e 100" });
    }

    try {
        var check = await obraModel.buscarPorId(id);
        if (!check.length) return res.status(404).json({ erro: "Obra não encontrada" });

        await obraModel.atualizarProgresso(id, progresso, statusBody);
        return res.status(200).json({ mensagem: "Progresso atualizado com sucesso" });
    } catch (erro) {
        console.error("[atualizarProgresso]", erro);
        return res.status(500).json({ erro: erro.message });
    }
}

// ─── EXCLUIR — DELETE /api/obras/:id ──────────────────────────────────────────
async function excluir(req, res) {
    try {
        var check = await obraModel.buscarPorId(req.params.id);
        if (!check.length) return res.status(404).json({ erro: "Obra não encontrada" });

        await obraModel.excluir(req.params.id);
        return res.status(200).json({ mensagem: "Obra excluída com sucesso" });
    } catch (erro) {
        console.error("[excluir]", erro);
        return res.status(500).json({ erro: erro.message });
    }
}

module.exports = {
    listar,
    buscarPorId,
    resumo,
    paraMapa,
    cadastrar,
    atualizar,
    atualizarProgresso,
    excluir
};
