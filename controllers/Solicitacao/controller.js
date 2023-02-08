const SolicitacaoService = require('./service');
const { renderView, renderJson, redirect } = require('../../helpers/render');
const jwt = require('jsonwebtoken');
const { db } = require('../../config/env');
const sql = require('mssql');
const enviarEmail = require('../../infra/emailAdapter');
const { Keytoken, domain } = require('../../config/env');
const aprovacaoPendenteTemplate = require('../../template-email/aprovacao_pendente');
const tokenAdapter = require('../../infra/tokenAdapter');

const model = require('../../infra/dbAdapter');

module.exports = {
  async Listar(request) {
    const user = request.session.get('user');

    let body = ({
      pagina = 1,
      Descricao,
      Solicitante,
      statusItem,
      centroCustoFiltro
    } = request);

    const centroCustoNormal = centroCustoFiltro;

    if (centroCustoFiltro) {
      const centroCustoSplit = centroCustoFiltro.split('. ');
      centroCustoFiltro = centroCustoSplit[0];
    }

    let limite = 10;

    limite = Math.min(10, limite);

    let offset = 0;

    if (pagina > 1) {
      offset = pagina * limite - limite;
    }

    const result = await SolicitacaoService.buscarSolicitacoesPorFiltro({
      data: {
        Descricao,
        Solicitante,
        statusItem,
        centroCustoFiltro,
        User: user
      },
      pagina: {
        limite,
        offset
      }
    });

    const contarSolicitacoes = await result.count('total');

    const paginas = {
      total: Math.ceil(contarSolicitacoes.total / limite),
      corrente: pagina
    };

    const filtros = {
      Descricao: Descricao,
      Solicitante: Solicitante,
      statusItem: statusItem,
      centroCustoFiltro: centroCustoNormal
    };


    return renderView('home/solicitacoes/index', {
      solicitacoes: result.data,
      paginas,
      retornoUser: user.permissaoCompras,
      filtros: filtros,
      nome: user.nome,
      codigoUsuario: user.codigo,
      perfil: user.Perfil
    });
  },

  async Edit(request) {
    const user = request.session.get('user');

    if (request.token) {
      const tokenRecebido = request.token;

      const dadosDecodificados = jwt.verify(tokenRecebido, Keytoken.secret);
      const solicitacao = await SolicitacaoService.obterServicoPorCodigo(
        dadosDecodificados.Codigo
      );

      let dadosParaBotaoAprovar = {
        Status: null
      };

      const conexao = await sql.connect(db);

      let status = await conexao
        .request()
        .query(
          `select Status from Aprovacoes where Codigo_Aprovador = ${user.codigo} and Codigo_Solicitacao = ${solicitacao.Codigo}`
        );

      if (status.recordset[0]) {
        dadosParaBotaoAprovar = status.recordset[0];
      }

      let ordem = await SolicitacaoService.verifyAprovador(user.codigo,solicitacao.Codigo)

      let dadosParaViewDeCompra = null;
      if (solicitacao.Status_Compra == 'C') {
        const conexao = await sql.connect(db);
        let datas = await conexao
          .request()
          .query(
            `select FORMAT(dataDaCompra, 'yyyy-MM-dd') as dataCompra, FORMAT(previsaoDeEntrega, 'yyyy-MM-dd') as dataEntrega from Compras where codigo_solicitacao = ${solicitacao.Codigo}`
          );
        dadosParaViewDeCompra = datas.recordset[0];
      }
      const nota = await SolicitacaoService.verificaNota(solicitacao.Codigo)

      // const dateTime = await SolicitacaoService.verificaData('2023-01-10' , new Date())

      return renderView('home/solicitacoes/Detail', {
        solicitacao,
        retornoUser: user.permissaoCompras,
        nome: user.nome,
        codigoUsuario: user.codigo,
        dadosParaBotaoAprovar,
        dadosParaViewDeCompra,
        ordem,
        nota
        // dateTime
      });
    }

    const solicitacao = await SolicitacaoService.obterServicoPorCodigo(
      request.Codigo
    );

    let dadosParaViewDeCompra = null;

    if (solicitacao.Status_Compra == 'C') {
      const conexao = await sql.connect(db);
      let datas = await conexao
        .request()
        .query(
          `select FORMAT(dataDaCompra, 'yyyy-MM-dd') as dataCompra, FORMAT(previsaoDeEntrega, 'yyyy-MM-dd') as dataEntrega,valorDaCompra as valor from Compras where codigo_solicitacao = ${solicitacao.Codigo}`
        );
      dadosParaViewDeCompra = datas.recordset[0];
    }

    let dadosParaBotaoAprovar = {
      // Status: null,
      ordem: null
    };

    const conexao = await sql.connect(db);

    let status = await conexao
      .request()
      .query(
        `select Status from Aprovacoes where Codigo_Aprovador = ${user.codigo} and Codigo_Solicitacao = ${solicitacao.Codigo}`
      );

    let ordem = await SolicitacaoService.verifyAprovador(user.codigo,solicitacao.Codigo)

    if (status.recordset[0]) {
      dadosParaBotaoAprovar = status.recordset[0];
      dadosParaBotaoAprovar.ordem = 0;
    }
    const nota = await SolicitacaoService.verificaNota(solicitacao.Codigo)

    // const dateTime = await SolicitacaoService.verificaData('2023-01-10' , new Date())
    console.log(dadosParaViewDeCompra);
    return renderView('home/solicitacoes/Detail', {
      solicitacao,
      retornoUser: user.permissaoCompras,
      nome: user.nome,
      codigoUsuario: user.codigo,
      dadosParaViewDeCompra,
      dadosParaBotaoAprovar,
      ordem,
      nota
      // dateTime
    });
  },

  async Create(request) {
    const {
      descricao,
      quantidade,
      deal,
      observacao,
      solicitante,
      dataCriacao = new Date(),
      dataAtualizacao = new Date(),
      centroCusto,
      arquivo,
      linkk
    } = request;

    try {
      const user = request.session.get('user');

      const { Codigo } = await SolicitacaoService.create(
        {
          Descricao: descricao,
          Quantidade: quantidade,
          Centro_de_Custo: centroCusto.split('. ')[0],
          Deal: deal,
          Observacao: observacao,
          Solicitante: user.nome,
          DataCriacao: dataCriacao,
          DataAtualizacao: dataAtualizacao,
          Status_Compra: 'P',
          anexo: arquivo,
          Link: linkk
        },
        'Codigo'
      );
      // salvar no banco o nome do arquivo
      const conexao = await sql.connect(db);

      const aprovadores = await conexao.request().query(
        `(
            SELECT
              CONCAT(
                PRIMEIRO_APROVADOR, ',',
                SEGUNDO_APROVADOR, ',',
                TERCEIRO_APROVADOR
              ) as aprovadores FROM Usuarios
             WHERE TERCEIRO_APROVADOR is not NULL AND SEGUNDO_APROVADOR IS NOT NULL and COD_USUARIO = ${user.codigo}
          )UNION
          (
            SELECT
              CONCAT(
                  PRIMEIRO_APROVADOR, ',',
                SEGUNDO_APROVADOR
              ) as aprovadores FROM Usuarios
            WHERE TERCEIRO_APROVADOR is NULL and SEGUNDO_APROVADOR is not NULL and COD_USUARIO = ${user.codigo}
          )UNION
          (
            SELECT PRIMEIRO_APROVADOR as aprovadores
            FROM Usuarios WHERE SEGUNDO_APROVADOR is NULL and  COD_USUARIO = ${user.codigo}
          )`
      );

      const ordemAprovadores = aprovadores.recordset[0].aprovadores.split(',');
      console.log(ordemAprovadores[0]);
      let contador = 1;

      for (let index = 0; index < ordemAprovadores.length; index++) {
        let resultado = await conexao
          .request()
          .query(
            `INSERT INTO Aprovacoes ( Codigo_Solicitacao, Codigo_Aprovador, Ordem) VALUES (${Codigo}, ${
              ordemAprovadores[index]
            }, ${index + 1})`
          );
        contador++;
      }

      const firstEmail = await model('Usuarios')
        .select('EMAIL_USUARIO')
        .andWhere({
          COD_USUARIO: ordemAprovadores[0]
        })
        .execute();
      console.log(firstEmail);

      const token = tokenAdapter({ Codigo, aprovador: ordemAprovadores[0] });

      const link = `${domain}/solicitacoes/:Codigo/edit?token=${token}`;

      const emailOptions = {
        to: firstEmail.data[0].EMAIL_USUARIO,
        subject: 'Solicitação de Aprovação',
        content: aprovacaoPendenteTemplate({ link, Codigo, descricao }),
        isHtlm: true
      };

      enviarEmail(emailOptions);

      const corpo = {
        codigo: Codigo
      };

      return renderJson(corpo);
    } catch (error) {
      console.log('error ', error);
      request.session.message({
        title: 'Ops!',
        text: error.message,
        type: 'danger'
      });

      return redirect('/solicitacoes/criar');
    }
  },

  async Aprovar(request) {
    const { codigoSolicitacao } = request;
    console.log('olaaaaa',codigoSolicitacao )
    const codigoAprovador = request.session.get('user').codigo;

    const conexao = await sql.connect(db);

    const result = await conexao
      .request()
      .query(
        `UPDATE Aprovacoes SET Status = 'Y' WHERE Codigo_Aprovador = ${codigoAprovador} and Codigo_Solicitacao = ${codigoSolicitacao}`
      );

    const dados = await SolicitacaoService.buscarProximoAprovador(
      codigoSolicitacao
    );

    let aprovador = null;
    let codigoUsuario = null;

    if (dados != undefined) {
      aprovador = dados.email;
      codigoUsuario = dados.codigoUsuario;
    }

    const token = tokenAdapter({
      Codigo: codigoSolicitacao,
      aprovador: codigoUsuario
    });

    const link = `${domain}/solicitacoes/:Codigo/edit?token=${token}`;

    const descricao = await SolicitacaoService.buscarDescricao(codigoSolicitacao)

    const emailOptions = {
      to: aprovador,
      subject: 'Solicitação de Aprovação',
      content: aprovacaoPendenteTemplate({ link, codigoSolicitacao, descricao }),
      isHtlm: true
    };

    if (dados != undefined) {
      enviarEmail(emailOptions);
    }

    const corpo =
      'Solicitação N° ' + codigoSolicitacao + ' aprovada com sucesso';

    return renderJson(corpo);
  },

  async Update(request) {
    const { descricao, motivo, quantidade, centroDeCusto, deal, codigo } =
      request;
    const conexao = await sql.connect(db);

    const result = await conexao.request().query(`UPDATE Solicitacao_Item
            SET Descricao = '${descricao}', Quantidade = ${quantidade}, Centro_de_Custo = '${
      centroDeCusto.split('. ')[0]
    }', Deal = '${deal}', Observacao = '${motivo}'
            WHERE Codigo = ${codigo}`);

    const corpo = 'Solicitação N° ' + codigo + ' Editada com sucesso';

    return renderJson(corpo);
  },

  async Criar(request) {
    // Controller destinado apenas para abrir a página de inserir uma nova solicitação
    const user = request.session.get('user');
    const message = await request.session.message();
    return renderView('home/solicitacoes/Create', { nome: user.nome, message });
  }
};
