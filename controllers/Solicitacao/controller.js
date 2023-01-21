
// const SolicitacaoService = require('./service');
const { renderView, renderJson, redirect } = require('../../helpers/render');
const { db } = require('../../config/env');
const sql = require('mssql');
const jwt = require('jsonwebtoken');
// const segredo = process.env.SEGREDO;
const enviarEmail = require('../../infra/emailAdapter')

module.exports = {
  async Listar (request) {
    // const usuario = await SolicitacaoService.obterDadosUser(request.codigo);

    // const retornoUser = {
    //   nome: 'Gustavo Costa',
    //   idade: '27',
    //   permissoes: {
    //     compras: {
    //       // listar: false,
    //       editar: false,
    //       // deletar: false,
    //       comprar: false
    //       // aprovar: false,
    //       // detalhar: true,
    //       // admin: true
    //     }
    //   }
    // };

    // let { pagina = 1, Descricao, Solicitante = retornoUser.nome, statusItem, centroCustoFiltro } = request;

    // const centroCustoNormal = centroCustoFiltro;

    // if (centroCustoFiltro) {
    //   const centroCustoSplit = centroCustoFiltro.split('. ');
    //   centroCustoFiltro = centroCustoSplit[0];
    // }

    // const limite = 10;

    // let offset = 0;

    // if (pagina > 1) {
    //   offset = (pagina * limite) - limite;
    // }

    // const result = await SolicitacaoService.buscarSolicitacoesPorFiltro({
    //   data: {
    //     Descricao,
    //     Solicitante,
    //     statusItem,
    //     centroCustoFiltro
    //   },
    //   pagina: {
    //     limite,
    //     offset
    //   }
    // });

    // const contarSolicitacoes = await result.count('total');

    // const paginas = {
    //   total: Math.ceil(contarSolicitacoes.total / limite),
    //   corrente: pagina
    // };

    // const filtros = {
    //   Descricao,
    //   Solicitante,
    //   statusItem,
    //   centroCustoFiltro: centroCustoNormal
    // };

    // return renderView('home/solicitacoes/Index', { solicitacoes: result.data, paginas, retornoUser: retornoUser.permissoes, filtros, nome: retornoUser.nome });
  },

  async Edit (request) {
    // const retornoUser = {
    //   nome: 'Gustavo Costa',
    //   codigo: 4,
    //   permissoes: {
    //     compras: {
    //       // listar: false,
    //       editar: false,
    //       // deletar: false,
    //       comprar: false,
    //       aprovar: true
    //       // detalhar: true,
    //       // admin: true
    //     }
    //   }
    // };

    // if (request.token) {
    //   const tokenRecebido = request.token;

    //   const dadosDecodificados = jwt.verify(tokenRecebido, segredo);

    //   const solicitacao = await SolicitacaoService.obterServicoPorCodigo(dadosDecodificados.codigo);

    //   return renderView('home/solicitacoes/Detail', { solicitacao, retornoUser: retornoUser.permissoes, nome: retornoUser.nome, codigoUsuario: retornoUser.codigo });
    // }

    // verificar se o usuário tem permissao
    // se nao,
    // redirecionar e exibir messagem de erro
    // redirect().back()
    // verificar se se existe o item no banco

    // const solicitacao = await SolicitacaoService.obterServicoPorCodigo(request.Codigo);

    // let dadosParaViewDeCompra = null;

    // if (solicitacao.Status_Compra == 'C') {
    //   const conexao = await sql.connect(db);
    //   const datas = await conexao.request()
    //     .query(`select FORMAT(dataDaCompra, 'yyyy-MM-dd') as dataCompra, FORMAT(previsaoDeEntrega, 'yyyy-MM-dd') as dataEntrega from Compras where codigo_solicitacao = ${solicitacao.Codigo}`);
    //   dadosParaViewDeCompra = datas.recordset[0];
    // }

    // let dadosParaBotaoAprovar = {
    //   Status: null
    // };

    // const conexao = await sql.connect(db);

    // const status = await conexao.request()
    //   .query(`select Status from Aprovacoes where Codigo_Aprovador = ${retornoUser.codigo} and Codigo_Solicitacao = ${solicitacao.Codigo}`);

    // if (status.recordset[0]) {
    //   dadosParaBotaoAprovar = status.recordset[0];
    // }

    // return renderView('home/solicitacoes/Detail', { solicitacao, retornoUser: retornoUser.permissoes, nome: retornoUser.nome, codigoUsuario: retornoUser.codigo, dadosParaViewDeCompra, dadosParaBotaoAprovar });
  },

  async Create (request) {
    
    const { descricao, quantidade, deal, observacao, solicitante, dataCriacao = new Date(), dataAtualizacao = new Date(), aprovadores, centroCusto } = request

    const user = request.session.get('user');

    const conexao = await sql.connect(db)

    const centroCustoFiltrado = centroCusto.split(". ")

    const centroDeCusto = centroCustoFiltrado[0]

    const statusCompra = 'P'

    let result = await conexao.request()

        .input('descricao', sql.NVarChar, descricao)
        .input('quantidade', sql.Int, quantidade)
        .input('centroCusto', sql.VarChar, centroDeCusto)
        .input('deal', sql.VarChar, deal)
        .input('observacao', sql.VarChar, observacao)
        .input('solicitante', sql.VarChar, solicitante)
        .input('dataCriacao', sql.DateTimeOffset, dataCriacao)
        .input('dataAtualizacao', sql.DateTimeOffset, dataAtualizacao)
        .input('statusCompra', sql.Char, statusCompra)
        .query(`INSERT INTO Solicitacao_Item ( Descricao, Quantidade, Centro_de_Custo,deal, observacao, solicitante, DataCriacao,DataAtualizacao, Status_Compra) OUTPUT Inserted.Codigo VALUES (@descricao, @quantidade, @centroCusto, @deal, @observacao, @solicitante, @dataCriacao, @dataAtualizacao, @statusCompra)`)

    const ordemAprovadores = aprovadores.split(',')

    const codigo = result.recordset[0].Codigo

    for (let index = 0; index < ordemAprovadores.length; index++) {

        let resultado = await conexao.request()
            .query(`INSERT INTO Aprovacoes ( Codigo_Solicitacao, Codigo_Aprovador, Ordem) VALUES (${codigo}, ${ordemAprovadores[index]}, ${index + 1})`)

    }

    let primeiroEmail = await conexao.request()
        .query(`select EMAIL_USUARIO from Usuarios where COD_USUARIO = ${ordemAprovadores[0]}`)

    const token = jwt.sign(
        {
            codigo: codigo,
            aprovador: ordemAprovadores[0],
            Descricao: descricao,
            Quantidade: quantidade,
            Centro_de_Custo: centroDeCusto,
            deal: deal,
            observacao: observacao
        },
        segredo,
        {
            expiresIn: "100d"
        }
    )

    enviarEmail(primeiroEmail.recordset[0].EMAIL_USUARIO, token)

    let corpo = 'Solicitação N° ' + codigo + ' cadastrada com sucesso'

    return renderJson(corpo);

  },

  async Aprovar (request) {
    // const { codigoAprovador, codigoSolicitacao } = request;

    // const conexao = await sql.connect(db);

    // const result = await conexao.request()
    //   .query(`UPDATE Aprovacoes SET Status = 'Y' WHERE Codigo_Aprovador = ${codigoAprovador} and Codigo_Solicitacao = ${codigoSolicitacao}`);

    // const dados = await SolicitacaoService.buscarProximoAprovador(codigoSolicitacao);

    // let aprovador = null;
    // let codigoUsuario = null;

    // if (dados != undefined) {
    //   aprovador = dados.email;
    //   codigoUsuario = dados.codigoUsuario;
    // }

    // const token = jwt.sign(
    //   {
    //     codigo: codigoSolicitacao,
    //     aprovador: codigoUsuario
    //   },
    //   segredo,
    //   {
    //     expiresIn: '100d'
    //   }
    // );

    // if (dados != undefined) {
    //   SolicitacaoService.enviarEmail(aprovador, token);
    // }

    // const corpo = 'Solicitação N° ' + codigoSolicitacao + ' aprovada com sucesso';

    // return renderJson(corpo);
  },

  async Update (request) {
    // const { descricao, motivo, quantidade, centroDeCusto, deal, codigo } = request;

    // const conexao = await sql.connect(db);

    // const result = await conexao.request()
    //   .query(`UPDATE Solicitacao_Item
    //         SET Descricao = '${descricao}', Quantidade = ${quantidade}, Centro_de_Custo = '${centroDeCusto}', Deal = '${deal}', Observacao = '${motivo}'
    //         WHERE Codigo = ${codigo}`);

    // const corpo = 'Solicitação N° ' + codigo + ' Editada com sucesso';

    // return renderJson(corpo);
  },

  async Criar (request) {
    const user = request.session.get('user');
    // const usuario = await SolicitacaoService.obterDadosUser(request.codigo);

    return renderView('home/solicitacoes/Create', { nome: user.nome });
  }
};
