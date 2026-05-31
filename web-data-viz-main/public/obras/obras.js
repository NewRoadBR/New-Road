let obras = [];

let obraEditando = null;

/*
=========================================================
CARREGAR OBRAS
=========================================================
*/

async function carregarObras() {

    try {

        const resposta =
            await fetch("/obras");

        obras = await resposta.json();

        renderizarTabela(obras);

        atualizarKPIs();

    } catch (erro) {

        console.error(erro);

    }

}

/*
=========================================================
RENDER TABELA
=========================================================
*/

function renderizarTabela(lista) {

    const tbody =
        document.getElementById("tbodyObras");

    tbody.innerHTML = "";

    lista.forEach(obra => {

        let badgeClass = "";

        if (obra.status === "Planejada") {
            badgeClass = "badge-planejada";
        }

        if (obra.status === "Em andamento") {
            badgeClass = "badge-andamento";
        }

        if (obra.status === "Finalizada") {
            badgeClass = "badge-finalizada";
        }

        tbody.innerHTML += `

            <tr>

                <td>
                    ${obra.rodovia}
                </td>

                <td>
                    ${obra.titulo}
                </td>

                <td>
                    ${obra.tipo || "-"}
                </td>

                <td>

                    <span class="badge ${badgeClass}">

                        ${obra.status}

                    </span>

                </td>

                <td>
                    ${obra.data_inicio}
                </td>

                <td>
                    ${obra.data_fim || "-"}
                </td>

                <td>
                    ${obra.impacto_previsto || 0}%
                </td>

                <td>

                    <div class="acoes">

                        <button
                            class="btn-editar"
                            onclick="editar(${obra.id})"
                        >

                            Editar

                        </button>

                        <button
                            class="btn-excluir"
                            onclick="deletar(${obra.id})"
                        >

                            Excluir

                        </button>

                    </div>

                </td>

            </tr>

        `;

    });

}

/*
=========================================================
KPIs
=========================================================
*/

function atualizarKPIs() {

    const ativas =
        obras.filter(
            obra => obra.status === "Em andamento"
        ).length;

    const planejadas =
        obras.filter(
            obra => obra.status === "Planejada"
        ).length;

    const finalizadas =
        obras.filter(
            obra => obra.status === "Finalizada"
        ).length;

    const impactoMedio = obras.length > 0

        ? (
            obras.reduce((acc, obra) => {

                return acc + Number(
                    obra.impacto_previsto || 0
                );

            }, 0) / obras.length

        ).toFixed(1)

        : 0;

    document.getElementById("kpiAtivas")
        .innerText = ativas;

    document.getElementById("kpiPlanejadas")
        .innerText = planejadas;

    document.getElementById("kpiFinalizadas")
        .innerText = finalizadas;

    document.getElementById("kpiImpacto")
        .innerText = `${impactoMedio}%`;

}

/*
=========================================================
CADASTRAR
=========================================================
*/

async function cadastrar() {

    const body = {

        rodovia:
            document.getElementById("inputRodovia").value,

        titulo:
            document.getElementById("inputTitulo").value,

        descricao:
            document.getElementById("inputDescricao").value,

        tipo:
            document.getElementById("inputTipo").value,

        status:
            document.getElementById("inputStatus").value,

        data_inicio:
            document.getElementById("inputDataInicio").value,

        data_fim:
            document.getElementById("inputDataFim").value,

        hora_inicio:
            document.getElementById("inputHoraInicio").value,

        hora_fim:
            document.getElementById("inputHoraFim").value,

        impacto_previsto:
            document.getElementById("inputImpacto").value,

        fk_empresa: 1

    };

    try {

        if (obraEditando) {

            await atualizar(obraEditando, body);

        } else {

            await fetch("/obras", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(body)

            });

        }

        fecharModal();

        limparFormulario();

        obraEditando = null;

        carregarObras();

    } catch (erro) {

        console.error(erro);

    }

}

/*
=========================================================
EDITAR
=========================================================
*/

async function editar(id) {

    try {

        const resposta =
            await fetch(`/obras/${id}`);

        const obra = await resposta.json();

        obraEditando = id;

        preencherFormulario(obra);

        abrirModal();

    } catch (erro) {

        console.error(erro);

    }

}

/*
=========================================================
ATUALIZAR
=========================================================
*/

async function atualizar(id, body) {

    try {

        await fetch(`/obras/${id}`, {

            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(body)

        });

    } catch (erro) {

        console.error(erro);

    }

}

/*
=========================================================
DELETAR
=========================================================
*/

async function deletar(id) {

    try {

        await fetch(`/obras/${id}`, {

            method: "DELETE"

        });

        carregarObras();

    } catch (erro) {

        console.error(erro);

    }

}

/*
=========================================================
FILTRO
=========================================================
*/

document
    .getElementById("filtroRodovia")
    .addEventListener("change", filtrarRodovia);

async function filtrarRodovia() {

    const rodovia =
        document.getElementById("filtroRodovia").value;

    try {

        let resposta;

        if (rodovia === "") {

            resposta =
                await fetch("/obras");

        } else {

            resposta =
                await fetch(
                    `/obras/rodovia/${rodovia}`
                );

        }

        const resultado =
            await resposta.json();

        renderizarTabela(resultado);

    } catch (erro) {

        console.error(erro);

    }

}

/*
=========================================================
MODAL
=========================================================
*/

function abrirModal() {

    document
        .getElementById("modalObra")
        .style.display = "flex";

}

function fecharModal() {

    document
        .getElementById("modalObra")
        .style.display = "none";

}

/*
=========================================================
FORM
=========================================================
*/

function preencherFormulario(obra) {

    document.getElementById("inputRodovia").value =
        obra.rodovia;

    document.getElementById("inputTitulo").value =
        obra.titulo;

    document.getElementById("inputDescricao").value =
        obra.descricao;

    document.getElementById("inputTipo").value =
        obra.tipo;

    document.getElementById("inputStatus").value =
        obra.status;

    document.getElementById("inputDataInicio").value =
        obra.data_inicio;

    document.getElementById("inputDataFim").value =
        obra.data_fim;

    document.getElementById("inputHoraInicio").value =
        obra.hora_inicio;

    document.getElementById("inputHoraFim").value =
        obra.hora_fim;

    document.getElementById("inputImpacto").value =
        obra.impacto_previsto;

}

function limparFormulario() {

    document.getElementById("inputRodovia").value = "";

    document.getElementById("inputTitulo").value = "";

    document.getElementById("inputDescricao").value = "";

    document.getElementById("inputTipo").value = "";

    document.getElementById("inputStatus").value = "";

    document.getElementById("inputDataInicio").value = "";

    document.getElementById("inputDataFim").value = "";

    document.getElementById("inputHoraInicio").value = "";

    document.getElementById("inputHoraFim").value = "";

    document.getElementById("inputImpacto").value = "";

}

/*
=========================================================
INIT
=========================================================
*/

carregarObras();