$(document).ready(function () {
  const status = $('#status').val();

  if (status == 'A') {
    $('#one').addClass('active');
    $('#two').addClass('active');
  }

  if (status == 'P') {
    $('#one').addClass('active');
  }

  if (status == 'C') {
    $('#one').addClass('active');
    $('#three').addClass('active');
    $('#two').addClass('active');
  }
  conveniaCentroCusto()

  function formatAsCurrency(input) {
    let formattedValue = parseFloat(input.val().replace(/,/g, ''))
      .toFixed(2)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    input.val(formattedValue);
  }

  $('#valorDaCompra').on('input', function() {
    formatAsCurrency($(this));
  });

});

function adicionarCampoParcelas() {
  var campoColaborador = document.querySelector('#divParcela');
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
    `;
}

function removerCampoParcelas() {
  $('#divParcela').empty();
  // var campoColaborador = document.getElementById('divParcela')
  // campoColaborador.innerHTML = ``
}

function aprovarSolicitacao() {
  const codigoSolicitacao = document.getElementById('codigoSolicitacao').value;

  const corpo = {
    codigoSolicitacao: codigoSolicitacao
  };

  fetch(endpoints.AprovarSolicitacao, {
    method: 'POST',
    body: JSON.stringify(corpo),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
    .then((dados) => {
      return dados.json();
    })
    .then((dados) => {
      if (dados) {
        alert(dados);
      }
      window.location.reload();
    });
};

function insertCompra (codigo) {
  let quantidadeDeParcelas = null;
  let dataDaPrimeiraParcela = null;

  if (!document.getElementById('quantidadeDeParcelas')) {
    quantidadeDeParcelas = 0;
    dataDaPrimeiraParcela = '';
  } else {
    quantidadeDeParcelas = document.getElementById(
      'quantidadeDeParcelas'
    ).value;
    dataDaPrimeiraParcela = document.getElementById(
      'dataDaPrimeiraParcela'
    ).value;
  }

  const dataDaCompra = document.getElementById('dataDaCompra').value;
  const valorDaCompra = document.getElementById('valorDaCompra').value;
  const previsaoDeEntrega = document.getElementById('previsaoDeEntrega').value;
  const codigo2 = codigo;
  const metodoDePagamento = document.getElementById('metPagamento').value;
  const comprador = document.getElementById('comprador').value;

  const dados = {
    dataDaCompra: dataDaCompra,
    valorDaCompra: valorDaCompra,
    quantidadeDeParcelas: quantidadeDeParcelas,
    dataDaPrimeiraParcela: dataDaPrimeiraParcela,
    previsaoDeEntrega: previsaoDeEntrega,
    codigo: codigo2,
    metodoDePagamento: metodoDePagamento,
    comprador: comprador
  };

  fetch(endpoints.Comprar, {
    method: 'POST',
    body: JSON.stringify(dados),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
    .then((dados) => {
      return dados.json();
    })
    .then((dados) => {
      if (dados) {
        alert(dados);
      }
      $('#botao-solicitar').attr('hidden', true);
      window.location.reload();
    });
};

function updateSolicitacao(){
  const descricao = document.getElementById('descricaoModal').value;
  const motivo = document.getElementById('motivoModal').value;
  const quantidade = document.getElementById('quantidadeModal').value;
  const centroDeCusto = $('#CentroCustoModal').val();
  const deal = document.getElementById('dealModal').value;
  const codigo = document.getElementById('codigoSolicitacao').value;

  const data = {
    descricao: descricao,
    motivo: motivo,
    quantidade: quantidade,
    centroDeCusto: centroDeCusto,
    deal: deal,
    codigo: codigo
  };


  fetch(endpoints.editarSolicitacao, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
    .then((dados) => {
      return dados.json();
    })
    .then((dados) => {
      // clique no botão fechar
      $('#fecharModal').click();

      if (dados) {
        alert(dados);
      }

      window.location.reload();
    });
};

function conveniaCentroCusto() {
  fetch('https://public-api.convenia.com.br/api/v3/companies/cost-centers', {
    method: 'GET',
    redirect: 'follow',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      token: '82856aeb-fa11-4918-b2bc-f7a49322f69b'
    }
  })
    .then((response) => {
      return response.json();
    })
    .then((result) => {
      var dados = result.data;

      dados.forEach((element) => {
        var localCC = document.getElementById('CentroCustoModal');
        var option = document.createElement('option');
        option.textContent = element.name;
        localCC.appendChild(option);
      });
    });
};

function addAnex() {
  // const select = document.getElementById("metPagamento");

  $('#metPagamento').change(function () {
    var selectedOption = $(this).val();
    if (selectedOption === 'Boleto' && $('#file-input').length == 0) {
      $('#anexo').after('<input type="file" id="file-input">');
    } else {
      // $('#file-input').remove();
      removeAnex();
    }
  });
}

function removeAnex() {
  // $('#anexo').empty();
  document.getElementById('file-input').remove();
}


function downloadNF(){

  baixar = document.getElementById('baixar')

  // var codigoNF = document.getElementById("NumeroSolicitacaoModal").value;
  const codigo = document.getElementById('codigoSolicitacao').value;

  var arquivo = 'DCT-'+codigo+' '+document.getElementById('NomeAnexo').innerText

  baixar.href = 'http://localhost:5051/notafiscal/downloadNF/'+arquivo
}
