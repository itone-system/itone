$(document).ready(function () {

    const status = $("#status").val()

    if (status == 'A') {
        $("#one").addClass("active");
        $("#two").addClass("active");

    }

    if (status == 'P') {
        $("#one").addClass("active");
    }

    if (status == 'C') {
        $("#one").addClass("active");
        $("#three").addClass("active");
        $("#two").addClass("active");
    }


});

function adicionarCampoParcelas() {
    var campoColaborador = document.querySelector('#divParcela')
    campoColaborador.innerHTML = ` 

    <div class="row g-3">
    <div class="col">
        <label for="fname">Quantidade de Parcelas:</label>
        <input id="quantidadeDeParcelas" class="form-control" style="margin-bottom: 10%;" type="number" name="quantidadeDeParcelas">
    </div>
    <div class="col">
         <label for="fname">Data da primeira parcela:</label>
        <input id="dataDaPrimeiraParcela" class="form-control" style="margin-bottom: 10%;" type="date" name="dataDaPrimeiraParcela">
    </div>
</div>
    `

}

function removerCampoParcelas() {
    $("#divParcela").empty()
    // var campoColaborador = document.getElementById('divParcela')
    // campoColaborador.innerHTML = ``
}

const aprovarSolicitacao = () => {
    const codigoUsuario = document.getElementById('codigoUsuario').value
    const codigoSolicitacao = document.getElementById('codigoSolicitacao').value
    console.log(codigoUsuario)
    console.log(codigoSolicitacao)

    const corpo = {
        codigoAprovador: codigoUsuario,
        codigoSolicitacao: codigoSolicitacao
    }

    fetch(endpoints.AprovarSolicitacao, {
        method: 'POST',
        body: JSON.stringify(corpo),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
    }).then(dados => {
        return dados.json()
    }).then(dados => {

        if (dados) {
            alert(dados)
        }
        console.log(dados)
        window.location.reload();

    })
}

const insertCompra = (codigo) => {

    let quantidadeDeParcelas = null
    let dataDaPrimeiraParcela = null

    if (!document.getElementById('quantidadeDeParcelas')) {
        quantidadeDeParcelas = 0
        dataDaPrimeiraParcela = ''

    } else {
        quantidadeDeParcelas = document.getElementById('quantidadeDeParcelas').value
        dataDaPrimeiraParcela = document.getElementById('dataDaPrimeiraParcela').value
    }

    const dataDaCompra = document.getElementById('dataDaCompra').value
    const valorDaCompra = document.getElementById('valorDaCompra').value
    const previsaoDeEntrega = document.getElementById('previsaoDeEntrega').value
    const codigo2 = codigo
    const metodoDePagamento = document.getElementById('metPagamento').value
    const comprador = document.getElementById('comprador').value


    const dados = {
        dataDaCompra: dataDaCompra,
        valorDaCompra: valorDaCompra,
        quantidadeDeParcelas: quantidadeDeParcelas,
        dataDaPrimeiraParcela: dataDaPrimeiraParcela,
        previsaoDeEntrega: previsaoDeEntrega,
        codigo: codigo2,
        metodoDePagamento: metodoDePagamento,
        comprador: comprador

    }
    console.log(dados)

    fetch(endpoints.Comprar, {
        method: 'POST',
        body: JSON.stringify(dados),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
    }).then(dados => {
        return dados.json()
    }).then(dados => {

        if (dados) {
            alert(dados)
        }
        $('#botao-solicitar').attr("hidden", true)
        console.log(dados)
        window.location.reload();

    })

}

const updateSolicitacao = () => {
    const descricao = document.getElementById('descricaoModal').value
    const motivo = document.getElementById('motivoModal').value
    const quantidade = document.getElementById('quantidadeModal').value
    const centroDeCusto = document.getElementById('centroCustoModal').value
    const deal = document.getElementById('dealModal').value
    const codigo = document.getElementById('codigoSolicitacao').value

    const data = {
        descricao: descricao,
        motivo: motivo,
        quantidade: quantidade, 
        centroDeCusto: centroDeCusto,
        deal: deal,
        codigo: codigo
    }

    console.log(data)

    fetch(endpoints.editarSolicitacao, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
    }).then(dados => {
        return dados.json()
    }).then(dados => {

        // clique no botão fechar
        $('#fecharModal').click()

        if (dados) {
            alert(dados)
        }

        window.location.reload();

    })
}

