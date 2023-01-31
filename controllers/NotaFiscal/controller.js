const { db } = require('../../config/env');
const ejs = require('ejs')
const sql = require('mssql')
const enviarEmail = require('../../infra/emailAdapter');
const { renderView, renderJson, redirect } = require('../../helpers/render');


paginacaoTotal = 1
paginates = 1
descricaoSalva = ''
fornecedorSalva = ''
solicitanteSalva = ''
centroCustoSalva = '' 
centroCustoExtensoSalva = '' 


module.exports = {

   async insertNotas(req, res) {
   
      const { solicitante, CentroCusto, fornecedor, Descricao, tipoContrato, TipoPagamento, dadosBanc, dataPagamento, deal, Observacao, possuiColaborador, Colaborador, Anexo} = req.body;

      const conexao = await sql.connect(db)

      let result = await conexao.request()

         .input('Solicitante', sql.VarChar, solicitante)
         .input('CentroCusto', sql.VarChar, CentroCusto)
         .input('Fornecedor', sql.VarChar, fornecedor)
         .input('Descricao', sql.VarChar, Descricao)
         .input('TipoContrato', sql.VarChar, tipoContrato)
         .input('TipoPagamento', sql.VarChar, TipoPagamento)
         .input('DadosBanc', sql.VarChar, dadosBanc)
         .input('DataPagamento', sql.VarChar, dataPagamento)
         .input('Deal', sql.Int, deal)
         .input('Observacao', sql.VarChar, Observacao)
         .input('PossuiColaborador', sql.VarChar, possuiColaborador)
         .input('Colaborador', sql.VarChar, Colaborador)
         .input('Anexo', sql.VarChar, Anexo)

         .query('INSERT INTO NotaFiscal (Solicitante, CentroCusto, Fornecedor, Descricao, TipoContrato, TipoPagamento, DadosBanc, DataPagamento, Deal, Observacao, PossuiColaborador, Colaborador, Anexo )    OUTPUT Inserted.Codigo VALUES (@solicitante, @centroCusto, @fornecedor, @Descricao, @tipoContrato, @TipoPagamento, @dadosBanc, @dataPagamento, @deal, @Observacao, @possuiColaborador, @Colaborador, @Anexo)')


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
   ORDER BY Codigo asc
   OFFSET	${offset} ROWS FETCH NEXT ${limite} ROWS ONLY`)

   const obterNFUnica = await conexao.query(`SELECT * FROM	notaFiscal  where Codigo = '${requ.codigoNFUnic}'`)

   const notaUnica = obterNFUnica.recordsets[0]

   const notasRecebidas = obterSolicitacoes.recordsets[0]

   // switch(usuario){
   //    case "1":
   //       var itens  = dados
   //    break
   //    case "2":
   //       var itens  = dados.filter(x=> x.Solicitante === usuarioSolicitante)
   //    break
   //    case "3":
   //       var itens  = dados.filter(x => x.Primeiro_Codigo_CC === centroCustoUsuario.substr(0,1))
   //    break


   // }
   
   const user = request.session.get('user');
   console.log(user)
   const message = await request.session.message();

   dados = obterSolicitacoes.recordsets[0]

   console.log(notaUnica[0].Codigo)


   return renderView('home/notafiscal/DetailNF', {
      dados,
      notaUnica,
      descricaoSalva,
      fornecedorSalva,
      solicitanteSalva,
      centroCustoExtensoSalva,
      retornoUser: user.permissoesNotaFiscal,
      nome: user.nome,
      codigoUsuario: user.codigo

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

      ejs.renderFile('C:\\Users\\18061634\\Documents\\project 2023\\Project\\ADM_WEB\\itone-compras\\views\\paginas\\retornoEmail.ejs',{req}, function(err, data){
         if(err){
             console.log(err);
         }else{

             console.log(data)
           
             var emailFinanceiro = 'wesley.silva@itone.com.br'

             enviarEmail(emailFinanceiro, data)
         }
     })

   return result


},

async Criar(request) {
  // Controller destinado apenas para abrir a página de inserir uma nova solicitação
  const user = request.session.get('user');
  console.log(user)
  const message = await request.session.message();
  return renderView('home/NotaFiscal/CreateNF', { nome: user.nome, message });
//   return renderView('home/NotaFiscal/CreateNF', { nome: user.nome, message });

},

async uploadNF (request, response){
   response.send('Arquivo Recebido')
    
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

}


