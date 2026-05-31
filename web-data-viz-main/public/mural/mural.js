window.onload = function () {

    listarAvisos();

    listarChat();

    setInterval(function () {

        listarChat();

    }, 5000);

};

/*
=========================================================
PUBLICAR AVISO
=========================================================
*/

function publicarAviso() {

    var payload = {

        fkUsuario: 1,

        tipo:
            inputTipo.value,

        regiao:
            inputRegiao.value,

        titulo:
            inputTitulo.value,

        descricao:
            inputDescricao.value,

        pinned:
            inputPinned.value

    };

    fetch("/mural/publicar", {

        method: "POST",

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

    fetch("/mural/listar")

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

                                ${aviso.role}
                                •
                                ${aviso.regiao}

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

    fetch("/mural/curtir", {

        method: "POST",

        headers: {

            "Content-Type":
                "application/json"

        },

        body: JSON.stringify({

            fkAviso: idAviso,

            fkUsuario: 1

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

    fetch("/mural/comentar", {

        method: "POST",

        headers: {

            "Content-Type":
                "application/json"

        },

        body: JSON.stringify({

            fkAviso: idAviso,

            fkUsuario: 1,

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

    fetch(`/mural/comentarios/${idAviso}`)

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

    fetch(`/mural/deletar/${id}`, {

        method: "DELETE"

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

    fetch("/mural/chat")

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

    fetch("/mural/chat/enviar", {

        method: "POST",

        headers: {

            "Content-Type":
                "application/json"

        },

        body: JSON.stringify({

            fkUsuario: 1,

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

}

function formatarData(data) {

    return new Date(data)
        .toLocaleString("pt-BR");

}