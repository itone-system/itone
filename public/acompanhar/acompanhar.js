// let pagina = 1
let totalPaginas = null

$(document).ready(function () {
    conveniaCentroCusto()
    // $("#myTable tr").click(exibeInfoSolicitacao)
});

function proxPage() {
    $('#prev').attr("disabled", false)
   const pagina = parseInt( $('#pagina').val()) +1
    $('#pagina').val(pagina)
    $('#buscar').submit()
    const paginas = $('#paginas').val();

    if (pagina == paginas) {
        console.log('é igual')
        $('#prox').attr("disabled", true)
    }

}

const prevPage = () => {
    const pagina = parseInt( $('#pagina').val()) -1
    $('#pagina').val(pagina)
    $('#buscar').submit()
     
if (pagina == 0) {
    $('#prev').attr("disabled", true)
}

$('#prox').attr("disabled", false)

}

// function exibeInfoSolicitacao  (event) {
//     event.preventDefault()

//     const tableFields = [
//         "Codigo",
//         "Descricao",
//         "Solicitante",
//         "Quantidade",
//         "DataAtualizacao",
//         "comprador",
//         "Status_Compra"
//     ]

//     const dados = {}

//     let allTds = $(this).children('td')

//     for (let index = 0; index < tableFields.length; index++) {
//         dados[tableFields[index]] = allTds[index].innerText
    
//     }
//     console.log(dados)

//     let modalBody = document.getElementById('modalBody')

//     // $("#openModal").click()

//     $("#detalhamento").click(detalhamento())

// }

// const detalhamento = () => [
//     window.location.assign(`/detalhamento`)
// ]


const conveniaCentroCusto = () => {

    fetch("https://public-api.convenia.com.br/api/v3/companies/cost-centers", {
        method: 'GET', 
        redirect: 'follow',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            "token": "82856aeb-fa11-4918-b2bc-f7a49322f69b"
        }
    }).then(response => {
        return response.json()
    }).then(result => {
        var dados = result.data
                
        dados.forEach(element => {
            var localCC = document.getElementById('CentroCusto') 
            var option = document.createElement('option');
            option.textContent = element.name;
            localCC.appendChild(option);

        });
    })

}

