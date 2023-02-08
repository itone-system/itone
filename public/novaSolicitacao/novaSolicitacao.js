let arquivoAnexo;

$(document).ready(function () {
  conveniaCentroCusto();
  // $('#addAprovador').click();
  // const enviarSolicitacao = document.querySelector('#botao-solicitar');
  listar();
  const fileInput = document.querySelector('#fileInput');

  fileInput.addEventListener('change', (event) => {
    const files = event.target.files;
    arquivoAnexo = files[0];
  });

  // enviarSolicitacao.addEventListener('click', function () {
  //   validarCampos();
  // });
});

const Enviardados = {
  codigo: 0,
  arraySolicitacao: [],
  arrayNomes: [],
  descricao: '',
  quantidade: '',
  centroCusto: '',
  indexNome: 0,
  indexEmail: 0,
  arrayEmails: [],
  listaErros: [],
  listaUsuarios: []
};

const listar = () => {
  fetch(endpoints.ListarUsuarios, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
    .then((dados) => {
      console.log(dados);
      return dados.json();
    })
    .then((dados) => {
      const nomes = dados;
      let container = document.getElementById('aprov');

      for (let i = 0; i < nomes.length; i++) {
        let input = document.createElement('input');
        let br = document.createElement('br');
        input.type = 'text';
        input.className = 'form-control';
        input.readOnly = true;
        input.value = nomes[i];
        input.style.fontSize = '12px';
        container.appendChild(input);
        container.appendChild(br);
      }
      // Enviardados.arrayNomes = data.recordsets[0];

      // criarCamposAprovacao();
    });
};

const insert = () => {
  var listaUsuarios = retonarCodigo();

  const descricao = document.getElementById('Descricao').value;
  const quantidade = document.getElementById('Quantidade').value;
  const centroCusto = document.getElementById('CentroCusto').value;
  const deal = document.getElementById('Deal').value;
  const observacao = document.getElementById('Observações').value;
  const solicitante = document.getElementById('nomeUser').value;
  const arquivo = document
    .querySelector('#fileInput')
    .value.replace('C:\\fakepath\\', '');

  let bodyContent = {
    descricao: descricao,
    quantidade: quantidade,
    centroCusto: centroCusto,
    deal: deal,
    observacao: observacao,
    solicitante: solicitante,
    aprovadores: listaUsuarios,
    dataCriacao: new Date(),
    dataAtualizacao: new Date(),
    arquivo: arquivo
  };

  fetch(endpoints.NovaSolicitacao, {
    method: 'POST',
    body: JSON.stringify(bodyContent),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
    .then((dados) => {
      console.log(dados);
      return dados.json();
    })
    .then((dados) => {
      let data = dados;

      uploadFile(arquivoAnexo, data.codigo);

      limparCampos();

      // $("#aprovacao").empty();
      const text =
        ' Solicitação N° ' + data.codigo + ' cadastrada com sucesso ';
      alert(text);

      window.location.reload();
    });
};

const limparCampos = () => {
  document.getElementById('Descricao').value = '';
  document.getElementById('Quantidade').value = '';
  document.getElementById('CentroCusto').value = '';
  document.getElementById('Deal').value = '';
  document.getElementById('Observações').value = '';
};

const criarCamposAprovacao = () => {
  let adicionar = document.getElementById('aprov');

  var div = document.createElement('div');
  div.setAttribute('class', 'row g-3');

  var div1 = document.createElement('div');
  div1.setAttribute('class', 'row g-3 text');

  var coluna1 = document.createElement('div');
  coluna1.setAttribute('class', 'col');
  coluna1.setAttribute('class', 'nomeAprovador');

  var coluna2 = document.createElement('div');
  coluna2.setAttribute('class', 'col');
  coluna2.setAttribute('class', 'email');

  var inputEmail = document.createElement('input');
  inputEmail.setAttribute('class', 'emailText');
  inputEmail.classList.add('form-control');
  inputEmail.setAttribute('placeholder', 'E-mail');
  inputEmail.setAttribute('id', 'E-mail' + Enviardados.indexEmail);
  inputEmail.textContent = 'E-mail';

  Enviardados.arrayEmails.push(Enviardados.indexEmail);
  Enviardados.indexEmail++;

  var inputOrdem = document.createElement('select');
  inputOrdem.setAttribute('class', 'form-control');
  inputOrdem.classList.add('emailText');
  inputOrdem.setAttribute('id', 'NomeAprovador' + Enviardados.indexNome);
  inputOrdem.setAttribute('onchange', 'incluirEmail()');
  inputOrdem.textContent = 'Nome';
  Enviardados.indexNome++;

  inputOrdem.innerHTML = '<option selected>Selecionar...</option>';

  adicionar.appendChild(div);
  div.appendChild(div1);
  div1.appendChild(coluna1);
  div1.appendChild(coluna2);
  coluna2.appendChild(inputEmail);
  coluna1.appendChild(inputOrdem);

  for (let i = 0; i < Enviardados.arrayNomes.length; i++) {
    var option = document.createElement('option');
    option.textContent = Enviardados.arrayNomes[i].NOME_USUARIO;
    inputOrdem.appendChild(option);
  }
};

const incluirEmail = () => {
  for (let i = 0; i < Enviardados.arrayEmails.length; i++) {
    var inputEmail = document.getElementById('E-mail' + i);
    var inputapr = document.getElementById('NomeAprovador' + i);

    for (let i = 0; i < Enviardados.arrayNomes.length; i++) {
      if (inputapr.value == Enviardados.arrayNomes[i].NOME_USUARIO) {
        inputEmail.value = Enviardados.arrayNomes[i].EMAIL_USUARIO;
      }
    }
  }
};

const removerEmail = () => {
  var tamanhoCampo = Enviardados.arrayEmails.length - 1;

  var valorCampo = Enviardados.arrayEmails[tamanhoCampo];

  if (tamanhoCampo != 0) {
    var inputEmail = document.getElementById('E-mail' + valorCampo);
    var inputNome = document.getElementById('NomeAprovador' + valorCampo);

    Enviardados.arrayEmails.pop();
    inputEmail.remove();
    inputNome.remove();
  }
};

const validarCampos = () => {
  retonarCodigo();
  const descricao = document.getElementById('Descricao').value;
  const quantidade = document.getElementById('Quantidade').value;
  const centroCusto = document.getElementById('CentroCusto').value;
  const deal = document.getElementById('Deal').value;
  const observacao = document.getElementById('Observações').value;

  var campos = ['Descricao', 'Quantidade', 'Deal', 'Observações'];

  for (let i = 0; i < campos.length; i++) {
    var camposObr = document.querySelector('.obrigatorio-' + campos[i]);

    const busca = Enviardados.listaErros.find(
      (element) => element === document.getElementById(campos[i]).id
    );

    if (document.getElementById(campos[i]).value == '' && !busca) {
      const campoObrigatorio = document.querySelector('.col.' + campos[i]);
      var labelObrigatorio = document.createElement('label');
      labelObrigatorio.setAttribute('id', 'obrigatorio');
      labelObrigatorio.setAttribute('class', 'obrigatorio-' + campos[i]);
      labelObrigatorio.textContent = '* Campo obrigatório';
      campoObrigatorio.appendChild(labelObrigatorio);
      Enviardados.listaErros.push(campos[i]);
    } else if (camposObr && document.getElementById(campos[i]).value != '') {
      camposObr.remove();
      console.log(camposObr);
      Enviardados.listaErros.splice(listaErros.indexOf(campos[i]), 1);
    }
  }

  if (Enviardados.listaErros == '') insert();
};







function validarCampos() {

  buscarValoresCampos()

  if(!trueColaborador) { listaErros.splice(listaErros.indexOf('Colaborador'), 1) }

  campos.push("Solicitante",'CentroCusto','Fornecedor' , 'DescServico', 'TipoContrato','valorNF','Deal','Observacao', 'fileInput')

  for (let i = 0; i < campos.length; i++) {

      var camposObr = document.querySelector('.obrigatorio-'+campos[i])

      const busca = listaErros.find(element => element == document.getElementById(campos[i]).id)

      if (document.getElementById(campos[i]).value == '' && !busca) {

          const campoObrigatorio = document.querySelector('.' + campos[i])
          var labelObrigatorio = document.createElement('label')
          labelObrigatorio.setAttribute('ID', 'obrigatorio');
          labelObrigatorio.setAttribute('class','obrigatorio-'+campos[i]);
          labelObrigatorio.textContent = '* Campo obrigatório';
          campoObrigatorio.appendChild(labelObrigatorio)
          listaErros.push(campos[i])

      }

      else if(camposObr && document.getElementById(campos[i]).value != '')  {
          camposObr.remove()

          listaErros.splice(listaErros.indexOf(campos[i]), 1);

      }

  }
  console.log(listaErros)
  if(listaErros == '' || listaErros == undefined ){
      this.insertNota()

  }

};








const retonarCodigo = () => {
  var listaUsuarios = [];
  const emailSelecionado = document.querySelectorAll('.email');

  for (let i = 0; i < emailSelecionado.length; i++) {
    var inputEmail = document.getElementById('E-mail' + i);

    for (let i = 0; i < Enviardados.arrayNomes.length; i++) {
      if (Enviardados.arrayNomes[i].EMAIL_USUARIO == inputEmail.value) {
        listaUsuarios.push(Enviardados.arrayNomes[i].COD_USUARIO);
      }
    }
  }
  return listaUsuarios.toString();
};

const conveniaCentroCusto = () => {
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
      let listaCC = [];

      dados.forEach((element) => {
        if (element.name.substr(0, 1) <= 9) {
          listaCC.push(element.name);
          listaCC.sort();
        }
      });

      listaCC.forEach((element) => {
        var localCC = document.getElementById('CentroCusto');
        var option = document.createElement('option');
        option.textContent = element;
        localCC.appendChild(option);
      });
    });
};

function uploadFile(file, codigoRetornoNF) {
  console.log('Uploading file...');
  const API_ENDPOINT =
    'http://localhost:5052/notafiscal/uploadNF/' + codigoRetornoNF;
  const request = new XMLHttpRequest();
  const formData = new FormData();

  request.open('POST', API_ENDPOINT, true);
  request.onreadystatechange = () => {
    if (request.readyState === 4 && request.status === 200) {
      console.log(request.responseText);
    }
  };
  formData.append('file', file);
  request.send(formData);
}
