let listaErros = [];
let colaborador = '';
let setColaborador = '';
let trueColaborador = false;
let tipoContrato = '';
let dadosPagamento = '';
let arquivoAnexo;
let codigoRetornoNF = '';
let NomeArquivoSemAcento;
let dataAtualConf = '';
let dataAtualConfPadrao = '';
let erroDataMenor = false;
let campos = ["Solicitante",'CentroCusto','Fornecedor' , 'DescServico', 'TipoContrato','valorNF','Deal','Observacao', 'fileInput']




$(document).ready(function () {
    dataAtual()
    const fileInput = document.querySelector("#fileInput");
    const enviarNF = document.querySelector("#enviarNF");
    const downloadArquivoNF = document.getElementById("baixar");
    const dataPag = document.getElementById("DataPagamento")

    fileInput.addEventListener("change", event => {
    const files = event.target.files;
    arquivoAnexo = files[0]
    NomeArquivoSemAcento = fileInput.value.replace('C:\\fakepath\\','').normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    // var NomeArquivoSemAcento = arquivoAnexo.innerText.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    });

    enviarNF.addEventListener("click", function(){

        validarCampos()

    });

    dataPag.addEventListener("change", event => {

        validarCampoData(event.target.value)

        });

    // $('#valorNF').on('input', function() {
    //     formatAsCurrency($(this));
    // });

});

function dataAtual(){
    var data = new Date();
    data.setDate(data.getDate() + 10)
    const dayOfWeek = data.getDay()
    if (dayOfWeek === 6) data.setDate(data.getDate() + 2)

    if (dayOfWeek === 0) data.setDate(data.getDate() + 1)

    var dia = String(data.getDate()).padStart(2, '0');
    var mes = String(data.getMonth()+1).padStart(2, '0');
    var ano = data.getFullYear();
    dataAtualConf = + ano + '-' + mes  + '-' + dia ;
    dataAtualConfPadrao = dia  + '/' + mes  + '/' +  ano  ;
    document.getElementById("DataPagamento").value = dataAtualConf
    document.getElementById("DataPagamento").setAttribute('min', dataAtualConf)

}



function adicionarCampoColaborador(){
    var campoColaborador = document.getElementById('campoColaborador')
    campoColaborador.innerHTML = '<div class="col Colaborador"> <label id="labelColaborador">Colaborador:</label>    <select name="Colaborador" id="Colaborador" class="form-control">      <option selected></option>    </select></div>'
    campos.push('Colaborador')
    trueColaborador = true
    campos.push('Colaborador')  
    conveniaColaborares()

}

function removerCampoColaborador(){
    var campoColaborador = document.getElementById('Colaborador')
    var labelColaborador = document.getElementById('labelColaborador')
    var labelObrColaborador = document.querySelector('.obrigatorio-Colaborador')
    trueColaborador = false

    if(campoColaborador && labelObrColaborador){
    campoColaborador.remove()
    labelColaborador.remove()
    labelObrColaborador.remove()
    campos.splice(campos.indexOf('Colaborador'), 1);
} else{
    campoColaborador.remove()
    labelColaborador.remove()
    campos.splice(campos.indexOf('Colaborador'), 1);

}
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

const conveniaColaborares = () => {

    fetch("https://public-api.convenia.com.br/api/v3/employees", {
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
        let listaColab = []

        dados.forEach(element => {
            listaColab.push(element.name +' ' + element.last_name )
            listaColab.sort()
        });

        listaColab.forEach(element => {
            var localColab = document.getElementById('Colaborador')
            var option = document.createElement('option');
            option.textContent = element;
            localColab.appendChild(option);

    });
})

}

function buscarValoresCampos(){

    var contrato = document.getElementById("TipoContrato").value;

    tipoContrato = contrato.substr(0,1);

    const busca = campos.find(element => element == 'Colaborador')

    if(trueColaborador){
        colaboradorNome =  document.getElementById("Colaborador").value+""
        setColaborador = "Y"
       
    }else if (busca){
        campos.splice(campos.indexOf('Colaborador'),1)
    }

}

function limparCampos(){

    campos.forEach(element => {

        switch(element){
            case 'Solicitante':
                document.getElementById(element).value = 'Wesley'
            break
            case 'DataPagamento':
                document.getElementById(element).value = dataAtualConf
            break
            default:
                document.getElementById(element).value = ''
            break
        }
    });

    alert('Documento Enviado!')
}

async function insertNota() {


    solicitante = document.getElementById("Solicitante").value;
    centroCusto = document.getElementById("CentroCusto").value;
    fornecedor = document.getElementById("Fornecedor").value;
    descServico = document.getElementById("DescServico").value;
    valorNF = document.getElementById("valorNF").value;
    dataPagamento = document.getElementById("DataPagamento").value;
    deal = document.getElementById("Deal").value;
    observacoes = document.getElementById("Observacao").value;
    nomeArquivo = fileInput.value.replace('C:\\fakepath\\','')
    codigoSolicitacao = document.getElementById('codigoSolicitacao').value

    centroCustoSplit = centroCusto.split('. ');
    console.log(centroCustoSplit[0]);

    console.log(colaboradorNome)

        let headersList = {
            "Content-Type": "application/json"
        }

        let bodyContent = JSON.stringify({

            "solicitante": solicitante,
            "CentroCusto": centroCustoSplit[0],
            "fornecedor":fornecedor,
            "Descricao": descServico,
            "tipoContrato":tipoContrato,
            "valorNF":valorNF,
            "dataPagamento":dataPagamento,
            "deal": deal,
            "Observacao": observacoes,
            "possuiColaborador": setColaborador,
            "Colaborador": colaboradorNome,
            "Anexo": NomeArquivoSemAcento,
            "codigoSolicitacao": codigoSolicitacao


        });

         let response =   await fetch(endpoints.NotaFiscal, {
            method: "POST",
            body: bodyContent,
            headers: headersList
        }).then(dados => {
            // console.log(dados)
            return dados.json()
        }).then(dados => {
            codigoRetornoNF = dados
        })

        uploadFile(arquivoAnexo, codigoRetornoNF, NomeArquivoSemAcento)

        limparCampos()
}

function validarCamposBackup() {

    buscarValoresCampos()

    validarCampoData(document.getElementById('DataPagamento').value)


    if(!trueColaborador) { listaErros.splice(listaErros.indexOf('Colaborador'), 1) }

    for (let i = 0; i < campos.length; i++) {

        var camposObr = document.querySelector('.obrigatorio-'+campos[i])

        const busca = lista.find(element => element == campos[i])
        
        if (document.getElementById(campos[i]).value == '' && !busca) {
            
            const campoObrigatorio = campos[i] == 'valorNF' ? document.querySelector('.col-lg-2.' + campos[i]) : document.querySelector('.col.' + campos[i])
            var labelObrigatorio = document.createElement('label')
            labelObrigatorio.setAttribute('ID', 'obrigatorio');
            labelObrigatorio.setAttribute('class','obrigatorio-'+campos[i]);
            labelObrigatorio.textContent = '* Campo obrigatório';
            campoObrigatorio.appendChild(labelObrigatorio)
            listaErros.push(campos[i])
            lista = listaErros
            
        }
       
        else if(camposObr && document.getElementById(campos[i]).value != '')  {
            camposObr.remove()
            
            listaErros.splice(listaErros.indexOf(campos[i]), 1);
            
        }

        const dadosCompleto = {
            Campo: campos[i],
            Buscas: busca,
            ValorCampo: document.getElementById(campos[i]).value,
            listaErros: listaErros

        }
        // console.log(dadosCompleto)

    }

    if(listaErros == '' || listaErros == undefined ){
        this.insertNota()
        
    } 

};

function validarCampos() {
  
    buscarValoresCampos()

    validarCampoData(document.getElementById('DataPagamento').value)

    for (let i = 0; i < campos.length; i++) {

        var camposObr = document.querySelector('.obrigatorio-'+campos[i])

        const busca = listaErros.find(element => element == campos[i])
        
        if (document.getElementById(campos[i]).value == '' && !busca) {
            
            const campoObrigatorio = campos[i] == 'valorNF' ? document.querySelector('.col-lg-2.' + campos[i]) : document.querySelector('.col.' + campos[i])
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

    if(listaErros == '' || listaErros == undefined ){
        this.insertNota()
        
    } 

};

function uploadFile (file, codigoRetornoNF, NomeArquivoSemAcento){
  console.log("Uploading file...");
  const API_ENDPOINT = endpoints.uploadNF+codigoRetornoNF+'/'+NomeArquivoSemAcento;
  const request = new XMLHttpRequest();
  const formData = new FormData();

  request.open("POST", API_ENDPOINT, true);
  request.onreadystatechange = () => {
    if (request.readyState === 4 && request.status === 200) {
      console.log(request.responseText);
    }
  };
  formData.append("file", file);
    request.send(formData);
};

function validarCampoData(valorCampoDataPagamento){

    if(valorCampoDataPagamento < dataAtualConf && !erroDataMenor){
        erroDataMenor = true

        const campoObrigatorio = document.querySelector('.col-6.' + 'DataPagamentoInvalida')
        var labelObrigatorio = document.createElement('label')
        labelObrigatorio.setAttribute('ID', 'obrigatorio');
        labelObrigatorio.setAttribute('class','obrigatorio-DataPagamento');
        labelObrigatorio.textContent = '* Data não pode ser menor que '+ dataAtualConfPadrao;
        campoObrigatorio.appendChild(labelObrigatorio)
        listaErros.push('DataPagamentoInvalida')

    }else if(valorCampoDataPagamento >= dataAtualConf && erroDataMenor){

        var camposObr = document.querySelector('.obrigatorio-DataPagamento')
        camposObr.remove()
        erroDataMenor = false
        listaErros.splice(listaErros.indexOf('DataPagamentoInvalida'), 1);
    }
}

// function formatAsCurrency(input) {
//     let formattedValue = parseFloat(input.val().replace(/,/g, ''))
//       .toFixed(2)
//       .toString()
//       .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

//     input.val(formattedValue);
//   }

 

conveniaCentroCusto()

