/*
=========================================================
LOGOUT
=========================================================
*/

function logout() {
    if (confirm("Tem certeza que deseja sair?")) {
        sessionStorage.clear();
        window.location.href = "../../index.html";
    }
}

window.onload = function () {

    aplicarUsuarioLogadoNaTopbar();

    listarAvisos();

    listarChat();

    setInterval(function () {

        listarChat();

    }, 5000);

};

var avisoEditandoId = null;

function getEmpresaAtualId() {

    return Number(sessionStorage.EMPRESA_ID_USUARIO || 0);

}

function getEmpresaQuery() {

    var empresaId = getEmpresaAtualId();

    if (!Number.isInteger(empresaId) || empresaId <= 0) {
        throw new Error("Sessao sem empresa valida");
    }

    return `empresaId=${empresaId}`;

}

function isGestorAtual() {

    var perfil = (sessionStorage.PERFIL_USUARIO || sessionStorage.ROLE_USUARIO || "").trim();
    return perfil === "Gestor" || /gestor/i.test(perfil);

}

function podeGerenciarAutor(autorId, empresaId) {

    return Number(autorId) === getUsuarioAtualId() ||
        (isGestorAtual() && empresaId > 0 && empresaId === getEmpresaAtualId());

}

function atualizarModoFormularioAviso() {

    var titulo = document.getElementById("tituloFormularioAviso");
    var botao = document.getElementById("btnPublicarAviso");

    if (!titulo || !botao) return;

    if (avisoEditandoId) {
        titulo.textContent = "Editar Aviso";
        botao.textContent = "Salvar Alterações";
        return;
    }

    titulo.textContent = "Novo Aviso";
    botao.textContent = "Publicar Aviso";

}

function getUsuarioAtualId() {

    return Number(sessionStorage.ID_USUARIO || 1);

}

function criarIniciais(nome) {

    if (!nome) return "??";

    return nome
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(function (parte) { return parte.charAt(0).toUpperCase(); })
        .join("")
        .slice(0, 2);

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
    var perfil =
        (sessionStorage.PERFIL_USUARIO || "").trim() ||
        (sessionStorage.ROLE_USUARIO || "").trim();
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

/*
=========================================================
PUBLICAR AVISO
=========================================================
*/

function publicarAviso() {

    var queryEmpresa;

    try {
        queryEmpresa = getEmpresaQuery();
    } catch (erro) {
        alert(erro.message);
        return;
    }

    var payload = {

        fkUsuario: getUsuarioAtualId(),

        tipo:
            inputTipo.value,

        rodovia:
            inputRodovia.value,

        titulo:
            inputTitulo.value,

        descricao:
            inputDescricao.value,

        pinned:
            inputPinned.value

    };

    var rota = avisoEditandoId
        ? `/mural/editar/${avisoEditandoId}?${queryEmpresa}`
        : `/mural/publicar?${queryEmpresa}`;

    var metodo = avisoEditandoId ? "PUT" : "POST";

    fetch(rota, {

        method: metodo,

        headers: {

            "Content-Type":
                "application/json"

        },

        body: JSON.stringify(payload)

    })

    .then(function () {

        limparFormulario();

        listarAvisos();

    });

}

/*
=========================================================
LISTAR AVISOS
=========================================================
*/

function listarAvisos() {
    var queryEmpresa;

    try {
        queryEmpresa = getEmpresaQuery();
    } catch (erro) {
        console.error(erro);
        return;
    }

    fetch(`/mural/listar?${queryEmpresa}`)

    .then(function (resposta) {

        return resposta.json();

    })

    .then(function (dados) {

        renderizarAvisos(dados);

    });

}

/*
=========================================================
RENDER AVISOS
=========================================================
*/

function renderizarAvisos(dados) {

    var feed =
        document.getElementById(
            "feedAvisos"
        );

    feed.innerHTML = "";

    for (
        var i = 0;
        i < dados.length;
        i++
    ) {

        var aviso =
            dados[i];

        var pinnedClass =
            aviso.pinned == 1
            ? "aviso-pinned"
            : "";

        var podeEditarAviso = podeGerenciarAutor(aviso.fkUsuario, Number(aviso.empresaId || 0));

        feed.innerHTML += `

            <div class="aviso-card ${pinnedClass}">

                <div class="aviso-header">

                    <div class="usuario-info">

                        <div
                            class="avatar"
                            style="
                                background:
                                ${aviso.cor};
                            "
                        >

                            ${aviso.avatar}

                        </div>

                        <div>

                            <h3>

                                ${aviso.nome}

                            </h3>

                            <p>

                                ${aviso.role || aviso.perfil || "Operação"}
                                •
                                ${aviso.rodovia}

                            </p>

                        </div>

                    </div>

                    <div class="aviso-badges">

                        <span class="badge ${aviso.tipo}">

                            ${aviso.tipo}

                        </span>

                    </div>

                </div>

                <div class="aviso-titulo">

                    ${aviso.titulo}

                </div>

                <div class="aviso-descricao">

                    ${aviso.descricao}

                </div>

                <div
                    class="comentarios-container"
                    id="comentarios-${aviso.id}"
                >

                </div>

                <div class="novo-comentario">

                    <input
                        type="text"
                        id="inputComentario-${aviso.id}"
                        placeholder="Escreva um comentário..."
                    >

                    <button
                        onclick="comentar(${aviso.id})"
                    >

                        Enviar

                    </button>

                </div>

                <div class="aviso-footer">

                    <div class="aviso-acoes">

                        <button
                            class="btn-acao"
                            onclick="curtir(${aviso.id})"
                        >

                            👍 ${aviso.likes}

                        </button>

                        <button
                            class="btn-acao"
                        >

                            💬 ${aviso.total_comentarios}

                        </button>

                        ${podeEditarAviso ? `
                        <button
                            class="btn-acao secundario"
                            onclick="iniciarEdicaoAviso(${aviso.id})"
                        >

                            Editar

                        </button>
                        ` : ""}

                        ${podeEditarAviso ? `
                        <button
                            class="btn-acao secundario"
                            onclick="fixarAviso(${aviso.id}, ${aviso.pinned == 1 ? 0 : 1})"
                        >
                            ${aviso.pinned == 1 ? "Desafixar" : "Fixar"}
                        </button>
                        ` : ""}

                        <button
                            class="btn-acao"
                            onclick="deletar(${aviso.id})"
                        >

                            🗑️

                        </button>

                    </div>

                    <div class="aviso-data">

                        ${formatarData(
                            aviso.criado_em
                        )}

                    </div>

                </div>

            </div>

        `;

    }

    /*
    ============================================
    AGORA O DOM JÁ EXISTE
    ============================================
    */

    for (
        var j = 0;
        j < dados.length;
        j++
    ) {

        listarComentarios(
            dados[j].id
        );

    }

}

/*
=========================================================
CURTIR
=========================================================
*/

function curtir(idAviso) {

    var queryEmpresa = getEmpresaQuery();

    fetch(`/mural/curtir?${queryEmpresa}`, {

        method: "POST",

        headers: {

            "Content-Type":
                "application/json"

        },

        body: JSON.stringify({

            fkAviso: idAviso,

            fkUsuario: getUsuarioAtualId()

        })

    })

    .then(function () {

        listarAvisos();

    });

}

/*
=========================================================
COMENTAR
=========================================================
*/

function comentar(idAviso) {

    var input =
        document.getElementById(
            `inputComentario-${idAviso}`
        );

    var texto =
        input.value;

    if (!texto) {

        return;

    }

    var queryEmpresa = getEmpresaQuery();

    fetch(`/mural/comentar?${queryEmpresa}`, {

        method: "POST",

        headers: {

            "Content-Type":
                "application/json"

        },

        body: JSON.stringify({

            fkAviso: idAviso,

            fkUsuario: getUsuarioAtualId(),

            texto: texto

        })

    })

    .then(function () {

        input.value = "";

        listarComentarios(idAviso);

        listarAvisos();

    });

}

/*
=========================================================
LISTAR COMENTÁRIOS
=========================================================
*/

function listarComentarios(idAviso) {

    var queryEmpresa = getEmpresaQuery();

    fetch(`/mural/comentarios/${idAviso}?${queryEmpresa}`)

    .then(function (resposta) {

        return resposta.json();

    })

    .then(function (dados) {

        renderizarComentarios(
            idAviso,
            dados
        );

    });

}

/*
=========================================================
RENDER COMENTÁRIOS
=========================================================
*/

function renderizarComentarios(
    idAviso,
    dados
) {

    var container =
        document.getElementById(
            `comentarios-${idAviso}`
        );

    if (!container) {

        return;

    }

    container.innerHTML = "";

    for (
        var i = 0;
        i < dados.length;
        i++
    ) {

        var comentario =
            dados[i];

        container.innerHTML += `

            <div class="comentario-item">

                <strong>

                    ${comentario.nome}

                </strong>

                <p>

                    ${comentario.texto}

                </p>

            </div>

        `;

    }

}

/*
=========================================================
DELETAR
=========================================================
*/

function deletar(id) {

    var confirmar = window.confirm("Deseja realmente excluir este aviso?");
    if (!confirmar) return;

    var queryEmpresa = getEmpresaQuery();

    fetch(`/mural/deletar/${id}?${queryEmpresa}`, {

        method: "DELETE",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify({

            fkUsuario: getUsuarioAtualId()

        })

    })

    .then(function () {

        listarAvisos();

    });

}

/*
=========================================================
CHAT
=========================================================
*/

function listarChat() {

    var queryEmpresa = getEmpresaQuery();

    fetch(`/mural/chat?${queryEmpresa}`)

    .then(function (resposta) {

        return resposta.json();

    })

    .then(function (dados) {

        renderizarChat(dados);

    });

}

function renderizarChat(dados) {

    var chat =
        document.getElementById(
            "chatMensagens"
        );

    chat.innerHTML = "";

    for (
        var i = 0;
        i < dados.length;
        i++
    ) {

        var msg =
            dados[i];

        chat.innerHTML += `

            <div class="chat-msg">

                <strong>

                    ${msg.nome}

                </strong>

                <span>

                    ${msg.texto}

                </span>

            </div>

        `;

    }

}

/*
=========================================================
ENVIAR CHAT
=========================================================
*/

function enviarMensagem() {

    var texto =
        inputChat.value;

    if (!texto) {

        return;

    }

    var queryEmpresa = getEmpresaQuery();

    fetch(`/mural/chat/enviar?${queryEmpresa}`, {

        method: "POST",

        headers: {

            "Content-Type":
                "application/json"

        },

        body: JSON.stringify({

            fkUsuario: getUsuarioAtualId(),

            texto

        })

    })

    .then(function () {

        inputChat.value = "";

        listarChat();

    });

}

/*
=========================================================
UTILS
=========================================================
*/

function limparFormulario() {

    inputTitulo.value = "";

    inputDescricao.value = "";

    inputRodovia.value = "";

    inputPinned.value = "0";

    avisoEditandoId = null;

    atualizarModoFormularioAviso();

}

function iniciarEdicaoAviso(idAviso) {

    var queryEmpresa = getEmpresaQuery();

    fetch(`/mural/listar?${queryEmpresa}`)

    .then(function (resposta) {

        return resposta.json();

    })

    .then(function (dados) {

        var aviso = dados.find(function (item) {
            return Number(item.id) === Number(idAviso);
        });

        if (!aviso) {
            throw new Error("Aviso não encontrado para edição");
        }

        avisoEditandoId = idAviso;
        inputTipo.value = aviso.tipo;
        inputRodovia.value = aviso.rodovia;
        inputTitulo.value = aviso.titulo;
        inputDescricao.value = aviso.descricao || "";
        inputPinned.value = String(aviso.pinned || 0);
        atualizarModoFormularioAviso();
        window.scrollTo({ top: 0, behavior: "smooth" });

    })

    .catch(function (erro) {

        console.error(erro);
        alert(`Não foi possível preparar a edição: ${erro.message}`);

    });

}

function fixarAviso(idAviso, pinned) {

    var queryEmpresa = getEmpresaQuery();

    fetch(`/mural/${idAviso}/pin?${queryEmpresa}`, {

        method: "PUT",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify({

            fkUsuario: getUsuarioAtualId(),
            pinned: pinned

        })

    })

    .then(function () {

        listarAvisos();

    });

}

function formatarData(data) {

    return new Date(data)
        .toLocaleString("pt-BR");

}