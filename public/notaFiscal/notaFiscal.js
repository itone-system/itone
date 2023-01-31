let listaErros = [];
let campos = [];
let colaborador = '';
let setColaborador = '';
let trueColaborador = false;
let tipoContrato = '';
let dadosPagamento = '';
let arquivoAnexo;
let codigoRetornoNF = '' 

$(document).ready(function () {
    dataAtual()
    const fileInput = document.querySelector("#fileInput");
    const enviarNF = document.querySelector("#enviarNF");
    const downloadArquivoNF = document.getElementById("baixar");

    fileInput.addEventListener("change", event => {
    const files = event.target.files;
    arquivoAnexo = files[0]
    });

    enviarNF.addEventListener("click", function(){
        
        validarCampos()
        // codigoNF = 22222
        // uploadFile(arquivoAnexo, codigoNF)
        // nomeArquivo = fileInput.value.replace('C:\\fakepath\\','')
        
    });

   


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
    document.getElementById("DataPagamento").value = dataAtualConf
}



function adicionarCampoColaborador(){
    var campoColaborador = document.getElementById('aprov')
    campoColaborador.innerHTML = '<div class="col Colaborador">    <label id="labelColaborador">Colaborador:</label>    <input name="Colaborador" id="Colaborador" type="text" class="form-control" placeholder="Colaborador" aria-label="First name"> </div>'
    colaborador = document.getElementById("Colaborador").value;
    campos.push('Colaborador')
    trueColaborador = true
    
}

function removerCampoColaborador(){
    var campoColaborador = document.getElementById('Colaborador')
    var labelColaborador = document.getElementById('labelColaborador')
    var labelObrColaborador = document.querySelector('.obrigatorio-Colaborador')

    if(campoColaborador && labelObrColaborador){
    campoColaborador.remove()
    labelColaborador.remove()
    labelObrColaborador.remove()
} else{
    campoColaborador.remove()
    labelColaborador.remove()
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
                
        dados.forEach(element => {
            var localCC = document.getElementById('CentroCusto') 
            var option = document.createElement('option');
            option.textContent = element.name;
            localCC.appendChild(option);

        });
    })

}

function buscarValoresCampos(){

    var contrato = document.getElementById("TipoContrato").value;
    var pagamento = document.getElementById("DadosPagamento").value;


    tipoContrato = contrato.substr(0,1);
    dadosPagamento = pagamento.substr(0,1);

    if(trueColaborador){
        colaborador = document.getElementById("Colaborador").value;
        setColaborador = "Y"
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
    
    buscarValoresCampos()

    solicitante = document.getElementById("Solicitante").value;
    centroCusto = document.getElementById("CentroCusto").value;
    fornecedor = document.getElementById("Fornecedor").value;
    descServico = document.getElementById("DescServico").value;
    dadosBanc = document.getElementById("DadosBanc").value;
    dataPagamento = document.getElementById("DataPagamento").value;
    deal = document.getElementById("Deal").value;
    observacoes = document.getElementById("Observacao").value;
    nomeArquivo = fileInput.value.replace('C:\\fakepath\\','')

    centroCustoSplit = centroCusto.split('. ');
    console.log(centroCustoSplit[0]);


        let headersList = {
            "Content-Type": "application/json"
        }

        let bodyContent = JSON.stringify({

            "solicitante": solicitante,
            "CentroCusto": centroCustoSplit[0],
            "fornecedor":fornecedor,
            "Descricao": descServico, 
            "tipoContrato":tipoContrato, 
            "TipoPagamento":dadosPagamento, 
            "dadosBanc":dadosBanc, 
            "dataPagamento":dataPagamento, 
            "deal": deal,
            "Observacao": observacoes, 
            "possuiColaborador":setColaborador,
            "Colaborador": colaborador,
            "Anexo": nomeArquivo

            
        });

         let response =   await fetch('http://itonerdp06:5053/notafiscal/insertnotafiscal', {
            method: "POST",
            body: bodyContent,
            headers: headersList
        }).then(dados => {
            // console.log(dados)
            return dados.json()
        }).then(dados => {
            codigoRetornoNF = dados
        })

        uploadFile(arquivoAnexo, codigoRetornoNF)
        
        limparCampos()
}

function validarCampos() {

    campos.push("Solicitante",'CentroCusto','Fornecedor' , 'DescServico', 'TipoContrato','DadosPagamento','DadosBanc', 'DataPagamento','Deal','Observacao', 'fileInput')


    for (let i = 0; i < campos.length; i++) {

     
        
        var camposObr = document.querySelector('.obrigatorio-'+campos[i])

        const busca = listaErros.find(element => element == document.getElementById(campos[i]).id)

        if (document.getElementById(campos[i]).value == '' && !busca) {
            
            const campoObrigatorio = document.querySelector('.col.' + campos[i])
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


function uploadFile (file, codigoRetornoNF){
  console.log("Uploading file...");
  const API_ENDPOINT = "http://localhost:5053/notafiscal/uploadNF/"+codigoRetornoNF;
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




conveniaCentroCusto()

