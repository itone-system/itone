// let pagina = 1
let totalPaginas = null

$(document).ready(function () {
    conveniaCentroCusto()
    // $("#myTable tr").click(exibeInfoSolicitacao)
    $('[data-toggle="tooltip"]').tooltip()

    // getAprovadoresPendentes()

});

// function getAprovadoresPendentes() {
//   const element = document.getElementById("pendente");
//   const elementName = element.tagName.toLowerCase();
//   console.log(elementName)

//   // const corpo = {
//   //   codigoSolicitacao: codigoSolicitacao
//   // };

//   // fetch(endpoints.AprovarSolicitacao, {
//   //   method: 'POST',
//   //   body: JSON.stringify(corpo),
//   //   headers: {
//   //     Accept: 'application/json',
//   //     'Content-Type': 'application/json'
//   //   }
//   // })
//   //   .then((dados) => {
//   //     return dados.json();
//   //   })
//   //   .then((dados) => {
//   //     if (dados) {
//   //       alert(dados);
//   //     }
//   //     window.location.reload();
//   //   });

// }

function proxPage() {
    $('#prev').attr("disabled", false)
   const pagina = parseInt( $('#pagina').val()) +1
    $('#pagina').val(pagina)
    $('#buscar').submit()
    const paginas = $('#paginas').val();

    if (pagina == paginas ) {
      $('#buscar').submit()

        $(document).ready(function () {
          $('#prox').attr("disabled", true)
      });


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
        let listaCC = []

        dados.forEach(element => {
            if(element.name.substr(0,1) <= 9){
            listaCC.push(element.name)
            listaCC.sort()
        }});

        listaCC.forEach(element => {
            var localCC = document.getElementById('CentroCusto')
            var option = document.createElement('option');
            option.textContent = element;
            localCC.appendChild(option);


    });
})

}

