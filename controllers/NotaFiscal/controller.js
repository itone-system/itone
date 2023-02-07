const { db } = require('../../config/env');
const ejs = require('ejs')
const sql = require('mssql')
const enviarEmail = require('../../infra/emailAdapter');
const { renderView, renderJson, redirect } = require('../../helpers/render');
const jwt = require('jsonwebtoken');
const { Keytoken } = require('../../config/env');


paginacaoTotal = 1
paginates = 1
descricaoSalva = ''
fornecedorSalva = ''
solicitanteSalva = ''
centroCustoSalva = ''
centroCustoExtensoSalva = ''

module.exports = {

   async insertNotas(req, res) {

      const { solicitante, CentroCusto, fornecedor, Descricao, tipoContrato, valorNF, dataPagamento, deal, Observacao, possuiColaborador, Colaborador, Anexo, codigoSolicitacao} = req.body;
    console.log(codigoSolicitacao)
      const conexao = await sql.connect(db)

      let result = await conexao.request()

         .input('Solicitante', sql.VarChar, solicitante)
         .input('CentroCusto', sql.VarChar, CentroCusto)
         .input('Fornecedor', sql.VarChar, fornecedor)
         .input('Descricao', sql.VarChar, Descricao)
         .input('TipoContrato', sql.VarChar, tipoContrato)
         .input('valorNF', sql.Float, valorNF)
         .input('DataPagamento', sql.VarChar, dataPagamento)
         .input('Deal', sql.Int, deal)
         .input('Observacao', sql.VarChar, Observacao)
         .input('PossuiColaborador', sql.VarChar, possuiColaborador)
         .input('Colaborador', sql.VarChar, Colaborador)
         .input('Anexo', sql.VarChar, Anexo)

         .query('INSERT INTO NotaFiscal (Solicitante, CentroCusto, Fornecedor, Descricao, TipoContrato, valorNF, DataPagamento, Deal, Observacao, PossuiColaborador, Colaborador, Anexo )    OUTPUT Inserted.Codigo VALUES (@solicitante, @centroCusto, @fornecedor, @Descricao, @tipoContrato, @valorNF, @dataPagamento, @deal, @Observacao, @possuiColaborador, @Colaborador, @Anexo)')


      const codigo = result.recordset[0].Codigo

      // console.log(codigo)

      // var emailFinanceiro = 'wesley.silva@itone.com.br'

      // enviarEmail(emailFinanceiro, html)

      return res.json(codigo);

},

async listarNotas(request, res) {

   //let { pagina, limite = 10, usuario , usuarioSolicitante, centroCustoUsuario, Descricao, Solicitante, centroCustoFiltro, Fornecedor } = request

   let { paginate, limite = 10, Descricao, Fornecedor, Solicitante, CentroCusto, filtroAplicado, codigoNF} = request

   CentroCusto =  CentroCusto == 'Centro de Custo' || CentroCusto == undefined ?  '' : CentroCusto.split('. ')

   const requ = {
       pagina: paginate === 'prox'? 1 : paginate === 'prev'? -1 : 0,
       limite: 10,
       Descricao: Descricao == undefined ? '' : Descricao,
       Fornecedor: Fornecedor == undefined ? '' : Fornecedor,
       Solicitante: Solicitante == undefined ? '' : Solicitante,
       CentroCusto: CentroCusto? CentroCusto[0] : '',
       CentroCustoExtenso: CentroCusto,
       filtroAplicado: request.buscar == undefined ? false : true,
       codigoNFUnic: codigoNF == undefined ? 1 : codigoNF
   }

   console.log(requ)

   const descricaoSalva = requ.Descricao? requ.Descricao : ''
   const fornecedorSalva = requ.Fornecedor? requ.Fornecedor : ''
   const solicitanteSalva = requ.Solicitante? requ.Solicitante : ''
   const centroCustoExtensoSalva = requ.CentroCustoExtenso? requ.CentroCustoExtenso : ''

   condicao = 1

   listacondicoes = {
      Descricao: requ.Descricao,
      Fornecedor: requ.Fornecedor,
      Solicitante: requ.Solicitante,
      CentroCusto: requ.CentroCusto
   }

   condicaoGeral = ''

   for (const [key, value] of Object.entries(listacondicoes)) {
       if(value){
         if(condicao == 1){
            condicaoQueryPart = key != 'CentroCusto'? ` where ${key} like '%${value}%' ` : ` where ${key} = '${value}' `
         }else{
            condicaoQueryPart = key != 'CentroCusto'? `and ${key} like '%${value}%' ` : `and ${key} = '${value}' `
         }
         condicao = condicao+1
         condicaoGeral = condicaoGeral+condicaoQueryPart
      }
   }
      console.log(condicaoGeral)


   if(filtroAplicado){
      requ.pagina  = 1
   }

   const conexao = await sql.connect(db)

   const obterTotalSolicitacoes = await conexao.query(`SELECT COUNT (Codigo) as total FROM notaFiscal ${condicaoGeral}`)

   const totalPaginas = Math.ceil(obterTotalSolicitacoes.recordsets[0][0].total / limite)

   console.log(totalPaginas)

   paginates = paginates+requ.pagina

   if(paginates > totalPaginas){
      paginates = totalPaginas
   } else if(paginates < 0){
      paginates = 1
   }

   limite = Math.min(10, limite);

   let offset = 0

   if (paginates > 1) {
      offset = (paginates * limite) - limite
      console.log(offset)
   }

   const obterSolicitacoes = await conexao.query(`SELECT	left(CentroCusto,1) as [Primeiro_Codigo_CC],

   case when(tipoContrato = 'R') then 'Recorrente'
   when(tipoContrato = 'P') then 'Pagamento Único' end as [Tipo_Contrato],

   case when(tipoContrato = 'B') then 'Boleto'
   when(tipoContrato = 'P') then 'Pix'
   when(tipoContrato = 'T') then 'Transferência'
   when(tipoContrato = 'C') then 'Cartão de crédito'end as [Tipo_Pagamento],
   concat(format(datapagamento,'dd'),'/',format(datapagamento,'MM'),'/',year(datapagamento)) as [Data],
   *
   FROM	notaFiscal  ${condicaoGeral}
   ORDER BY Codigo desc
   OFFSET	${offset} ROWS FETCH NEXT ${limite} ROWS ONLY`)

   const obterNFUnica = await conexao.query(`SELECT * FROM	notaFiscal  where Codigo = '${requ.codigoNFUnic}'`)

   const notaUnica = obterNFUnica.recordsets[0]

   const notasRecebidas = obterSolicitacoes.recordsets[0]


   const user = request.session.get('user');
   console.log(user)
   const message = await request.session.message();

   itens = obterSolicitacoes.recordsets[0]


   switch(user.Perfil){
      case 1:
         var dados  = itens
      break
      case 2:
         var dados  = itens.filter(x=> x.Solicitante === user.nome)
      break
      case 3:
         var dados  = itens.filter(x => x.Primeiro_Codigo_CC === user.departamento.substr(0,1))
      break


   }

   if (request.token) {
      const tokenRecebido = request.token;

      dadosToken = jwt.verify(tokenRecebido, Keytoken.secret);
      // console.log('teste obter serviço', dadosToken);
      let = codigoToken = dadosToken.Codigo
   } else{
      let = codigoToken = ''
   }

   console.log(codigoToken)

   return renderView('home/notafiscal/DetailNF', {
      dados,
      notaUnica,
      descricaoSalva,
      fornecedorSalva,
      solicitanteSalva,
      centroCustoExtensoSalva,
      retornoUser: user.permissoesNotaFiscal,
      nome: user.nome,
      codigoUsuario: user.codigo,
      codigoToken
    });




   // return ({ notasRecebidas, notaUnica, totalPaginas, paginate, descricaoSalva, fornecedorSalva, solicitanteSalva, centroCustoExtensoSalva})

},

async atualizarStatusNota(req, res) {

   const { Codigo, StatusNF, Solicitante, Descricao, Fornecedor} = req;

   const conexao = await sql.connect(db)

   let result = await conexao.request()

      .input('Codigo', sql.Int, Codigo)
      .input('StatusNF', sql.VarChar, StatusNF)
      .query('update NotaFiscal set StatusNF = @StatusNF where Codigo = @Codigo')

      console.log(req.Codigo)

      const token = jwt.sign(
         {
           Codigo,
           Descricao: Descricao
         },
         Keytoken.secret,
         {
           expiresIn: '100d'
         }
       );




       href = 'http://itonerdp06:5051/notafiscal/buscarNotas?token='+token

      ejs.renderFile('C:\\Users\\18061634\\Documents\\Projeto 2023 v1.0\\itone-compras\\views\\home\\NotaFiscal\\retornoEmail.ejs',{req, href}, function(err, data){
         if(err){
             console.log(err);
         }else{

             console.log(data)

             var emailFinanceiro = 'felippe.gangana@itone.com.br'

             const emailOptions = {
               to: emailFinanceiro,
               subject: 'Recebimento de Nota Fiscal',
               content: data,
               isHtlm: true
            }

            enviarEmail(emailOptions);

         }
     })



   return result


},

async Criar(request) {
  // Controller destinado apenas para abrir a página de inserir uma nova solicitação
  const user = request.session.get('user');
  console.log(user)
  const message = await request.session.message();
  const dados = {}
  return renderView('home/NotaFiscal/CreateNF', { nome: user.nome, message, dados });
//   return renderView('home/NotaFiscal/CreateNF', { nome: user.nome, message });

},

async uploadNF (request, response){
   response.send('Arquivo Recebido')

},

async pageInsert (request) {
const {solicitante, descricao, observacao, centroCusto, deal, valor, codigo} = request
const user = request.session.get('user');
const message = await request.session.message();

const dados = {
  solicitante: solicitante,
  descricao: descricao,
  observacao: observacao,
  centroCusto: centroCusto,
  deal: deal,
  valor: valor,
  codigo: codigo
}

return renderView('home/NotaFiscal/CreateNF', { nome: user.nome, message, dados });
},

async downloadNF (request, response){
   response.download('U:\\@TI\\Sistemas\\Arquivos-ADM-WEB\\Nota Fiscal\\'+request.params.path)
},

async notaUnica(request, res) {

   let {codigoNF} = request

   codigoNFInt = codigoNF == undefined? '' : codigoNF

   const conexao = await sql.connect(db)

   const obterNFUnica = await conexao.query(`SELECT * FROM	notaFiscal  where Codigo = '${codigoNFInt}'`)

   const dados = obterNFUnica.recordsets[0]

   // console.log(dados[0].Solicitante)

   return renderJson(dados)

   // return ({ notasRecebidas, notaUnica, totalPaginas, paginate, descricaoSalva, fornecedorSalva, solicitanteSalva, centroCustoExtensoSalva})

},

async downloadNF (request, response){
   response.download('U:\\@TI\\Sistemas\\Arquivos-ADM-WEB\\Nota Fiscal\\'+request.params.path)
},


}


