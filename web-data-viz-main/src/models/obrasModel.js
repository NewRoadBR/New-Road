var database = require("../database/config");

var SELECT_OBRA = `
    SELECT
        id,
        local AS rodovia,
        descricao,
        CASE status
            WHEN 'planned' THEN 'Planejada'
            WHEN 'ongoing' THEN 'Em andamento'
            WHEN 'completed' THEN 'Finalizada'
            WHEN 'critical' THEN 'Crítica'
            ELSE status
        END AS status,
        DATE_FORMAT(data_inicio, '%Y-%m-%d') AS data_inicio,
        DATE_FORMAT(DATE_ADD(data_inicio, INTERVAL duracao DAY), '%Y-%m-%d') AS data_fim,
        impacto AS impacto_previsto,
        lat AS latitude,
        lng AS longitude,
        bairro,
        tipo,
        duracao,
        marcador,
        urgencia
    FROM obra
`;

var temFkEmpresaObra = null;

function colunaEmpresaDisponivel() {
    if (temFkEmpresaObra !== null) {
        return Promise.resolve(temFkEmpresaObra);
    }

    return database
        .executar("SHOW COLUMNS FROM obra LIKE 'fk_empresa'")
        .then(function (resultado) {
            temFkEmpresaObra = resultado.length > 0;
            return temFkEmpresaObra;
        });
}

function clausulaEmpresa(temColuna, empresaId) {
    if (temColuna) {
        return {
            sql: " WHERE fk_empresa = ?",
            params: [empresaId]
        };
    }

    return { sql: "", params: [] };
}

function normalizarStatusEntrada(status) {
    var valor = String(status || "").toLowerCase();

    if (valor.includes("planej")) return "planned";
    if (valor.includes("andamento") || valor.includes("ongoing")) return "ongoing";
    if (valor.includes("final") || valor.includes("conclu")) return "completed";
    if (valor.includes("crit")) return "critical";

    return "planned";
}

function calcularDuracao(dataInicio, dataFim) {
    if (!dataInicio || !dataFim) return 1;

    var inicio = new Date(dataInicio);
    var fim = new Date(dataFim);
    var diff = Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24));

    return diff > 0 ? diff : 1;
}

function listar(empresaId) {
    return colunaEmpresaDisponivel().then(function (temColuna) {
        var filtro = clausulaEmpresa(temColuna, empresaId);
        var instrucaoSql = SELECT_OBRA + filtro.sql + " ORDER BY data_inicio DESC;";
        return database.executar(instrucaoSql, filtro.params);
    });
}

function listarPorRodovia(rodovia, empresaId) {
    return colunaEmpresaDisponivel().then(function (temColuna) {
        var filtro = clausulaEmpresa(temColuna, empresaId);
        var whereEmpresa = filtro.sql ? filtro.sql + " AND (" : " WHERE (";
        var instrucaoSql = SELECT_OBRA + whereEmpresa + `
            local LIKE ?
           OR bairro LIKE ?
           OR tipo LIKE ?
           OR descricao LIKE ?
          )
        ORDER BY data_inicio DESC;
        `;

        var params = filtro.params.concat([
            "%" + rodovia + "%",
            "%" + rodovia + "%",
            "%" + rodovia + "%",
            "%" + rodovia + "%"
        ]);

        return database.executar(instrucaoSql, params);
    });
}

function buscarPorId(id, empresaId) {
    return colunaEmpresaDisponivel().then(function (temColuna) {
        var filtro = clausulaEmpresa(temColuna, empresaId);
        var whereExtra = filtro.sql ? filtro.sql + " AND id = ?" : " WHERE id = ?";
        var params = filtro.params.concat([id]);

        if (temColuna) {
            params = [id, empresaId];
            whereExtra = " WHERE id = ? AND fk_empresa = ?";
        }

        var instrucaoSql = SELECT_OBRA + whereExtra + ";";
        return database.executar(instrucaoSql, params);
    });
}

function cadastrar(
    rodovia,
    descricao,
    status,
    dataInicio,
    dataFim,
    impactoPrevisto,
    empresaId
) {
    return colunaEmpresaDisponivel().then(function (temColuna) {
        var impacto = Number(impactoPrevisto || 0);
        var marcador = impacto >= 70 ? "red" : impacto >= 40 ? "yellow" : "green";
        var urgencia = impacto >= 70 ? "alta" : impacto >= 40 ? "media" : "baixa";
        var grauUrgencia = Math.max(1, Math.min(20, Math.round(impacto / 5)));

        var colunas = [
            "local",
            "bairro",
            "tipo",
            "descricao",
            "status",
            "data_inicio",
            "duracao",
            "impacto",
            "lat",
            "lng",
            "marcador",
            "urgencia",
            "grau_urgencia"
        ];
        var valores = [
            rodovia,
            "SP Region",
            "Intervenção viária",
            descricao || "",
            normalizarStatusEntrada(status),
            dataInicio,
            calcularDuracao(dataInicio, dataFim),
            impacto,
            -23.5505,
            -46.6333,
            marcador,
            urgencia,
            grauUrgencia
        ];

        if (temColuna) {
            colunas.push("fk_empresa");
            valores.push(empresaId);
        }

        var placeholders = colunas.map(function () {
            return "?";
        }).join(", ");

        var instrucaoSql = `
            INSERT INTO obra (${colunas.join(", ")})
            VALUES (${placeholders});
        `;

        return database.executar(instrucaoSql, valores);
    });
}

function atualizar(
    id,
    rodovia,
    descricao,
    status,
    dataInicio,
    dataFim,
    impactoPrevisto,
    empresaId
) {
    return colunaEmpresaDisponivel().then(function (temColuna) {
        var impacto = Number(impactoPrevisto || 0);
        var marcador = impacto >= 70 ? "red" : impacto >= 40 ? "yellow" : "green";
        var urgencia = impacto >= 70 ? "alta" : impacto >= 40 ? "media" : "baixa";

        var instrucaoSql = `
            UPDATE obra
            SET
                local = ?,
                descricao = ?,
                status = ?,
                data_inicio = ?,
                duracao = ?,
                impacto = ?,
                marcador = ?,
                urgencia = ?
            WHERE id = ?
        `;
        var params = [
            rodovia,
            descricao || "",
            normalizarStatusEntrada(status),
            dataInicio,
            calcularDuracao(dataInicio, dataFim),
            impacto,
            marcador,
            urgencia,
            id
        ];

        if (temColuna) {
            instrucaoSql += " AND fk_empresa = ?";
            params.push(empresaId);
        }

        instrucaoSql += ";";

        return database.executar(instrucaoSql, params);
    });
}

function deletar(id, empresaId) {
    return colunaEmpresaDisponivel().then(function (temColuna) {
        var instrucaoSql = "DELETE FROM obra WHERE id = ?";
        var params = [id];

        if (temColuna) {
            instrucaoSql += " AND fk_empresa = ?";
            params.push(empresaId);
        }

        instrucaoSql += ";";

        return database.executar(instrucaoSql, params);
    });
}

module.exports = {
    listar,
    listarPorRodovia,
    buscarPorId,
    cadastrar,
    atualizar,
    deletar
};
