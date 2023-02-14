const SolicitacaoService = require('./service');
const SolicitacaoServiceLogin = require('../Login/service');
const { renderView, renderJson, redirect } = require('../../helpers/render');
const jwt = require('jsonwebtoken');
const { db } = require('../../config/env');
const sql = require('mssql');
const enviarEmail = require('../../infra/emailAdapter');
const { Keytoken, domain } = require('../../config/env');
const aprovacaoPendenteTemplate = require('../../template-email/aprovacao_pendente');
const solicitacaoReprovadaTemplate = require('../../template-email/solicitacao_reprovada');
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
    try {
      const user = request.session.get('user');

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

      // const statusPesquisa = await SolicitacaoService.buscarStatus(user.codigo, solicitacao.Codigo)
      // const status = statusPesquisa.data[0].Status
      // console.log(status)
      let status = await conexao
        .request()
        .query(
          `select Status from Aprovacoes where Codigo_Aprovador = '${user.codigo}' and Codigo_Solicitacao = '${solicitacao.Codigo}'`
        );
      let ordem = await SolicitacaoService.verifyAprovador(
        user.codigo,
        solicitacao.Codigo
      );

      if (status.recordset[0]) {
        dadosParaBotaoAprovar = status.recordset[0];
        dadosParaBotaoAprovar.ordem = 0;
      }
      const nota = await SolicitacaoService.verificaNota(solicitacao.Codigo);

      const anexoLink = await SolicitacaoService.verificaArquivoElink(
        solicitacao.Codigo
      );

      return renderView('home/solicitacoes/Detail', {
        solicitacao,
        retornoUser: user.permissaoCompras,
        nome: user.nome,
        codigoUsuario: user.codigo,
        dadosParaViewDeCompra,
        dadosParaBotaoAprovar,
        ordem,
        nota,
        anexoLink
      });
    } catch (error) {
      return redirect('/home');
    }
  },

  async Create(request) {
    const {
      descricao,
      quantidade,
      deal,
      observacao,
      dataCriacao = new Date(),
      dataAtualizacao = new Date(),
      centroCusto,
      arquivo,
      linkk
    } = request;

    try {
      const user = request.session.get('user');

      // if (!descricao) {
      //   return renderJson('1s')
      // }
      // if (!quantidade) {
      //   return renderJson('2s')
      // }
      // if (!deal) {
      //   return renderJson('3s')
      // }
      // if (centroCusto == 'Selecionar...') {
      //   return renderJson('4s')
      // }
      // if (!observacao) {
      //   return renderJson('5s')
      // }
      // if (arquivo == '' && linkk == '' ) {
      //   return renderJson('6s')
      // }
      let CodigoObject = null;

      if (linkk != '') {
        CodigoObject = await SolicitacaoService.create(
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
            Link: linkk
          },
          'Codigo'
        );
      }

      if (arquivo != '') {
        CodigoObject = await SolicitacaoService.create(
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
            anexo: arquivo
          },
          'Codigo'
        );
      }
      const Codigo = CodigoObject.Codigo;

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

      const token = tokenAdapter({
        Codigo,
        aprovador: ordemAprovadores[0],
        id: ordemAprovadores[0],
        router: `/solicitacoes/${Codigo}/edit`
      });

      const link = `${domain}/solicitacoes/${Codigo}/edit?token=${token}`;

      const emailOptions = {
        to: firstEmail.data[0].EMAIL_USUARIO,
        subject: 'Solicitação de Aprovação',
        content: aprovacaoPendenteTemplate({
          link,
          codigoSolicitacao: Codigo,
          descricao
        }),
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
      aprovador: codigoUsuario,
      router: `/solicitacoes/${codigoSolicitacao}/edit`
    });

    const link = `${domain}/solicitacoes/${codigoSolicitacao}/edit?token=${token}`;

    const descricao = await SolicitacaoService.buscarDescricao(
      codigoSolicitacao
    );

    const emailOptions = {
      to: aprovador,
      subject: 'Solicitação de Aprovação',
      content: aprovacaoPendenteTemplate({
        link,
        codigoSolicitacao,
        descricao
      }),
      isHtlm: true
    };

    if (dados != undefined) {
      enviarEmail(emailOptions);
    }

    const corpo =
      'Solicitação N° ' + codigoSolicitacao + ' aprovada com sucesso';

    return renderJson(corpo);
  },

  async Reprovar(request) {
    const { codigoSolicitacao } = request;
    const codigoAprovador = request.session.get('user').codigo;
    const conexao = await sql.connect(db);

    const result = await conexao
      .request()
      .query(
        `UPDATE Aprovacoes SET Status = 'R' WHERE Codigo_Solicitacao = ${codigoSolicitacao}`
      );

    await conexao
      .request()
      .query(
        `update Solicitacao_Item set Status_Compra = 'R' where Codigo = ${codigoSolicitacao}`
      );

    await conexao
      .request()
      .query(
        `update Solicitacao_Item set Reprovador = ${codigoAprovador} where Codigo = ${codigoSolicitacao}`
      );

    const corpo = 'Solicitação N° ' + codigoSolicitacao + ' foi reprovada';
    const email = await SolicitacaoService.buscarEmail(codigoSolicitacao);
    const descricao = await SolicitacaoService.buscarDescricao(codigoSolicitacao)
    const emailOptions = {
      to: email,
      subject: 'Solicitação De Compra reprovada',
      content: solicitacaoReprovadaTemplate({ codigo: codigoSolicitacao, descricao }),
      isHtlm: true
    };

    enviarEmail(emailOptions);

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
  },

  async downloadItem(request, response) {
    response.download(
      'U:\\@TI\\Sistemas\\Arquivos-ADM-WEB\\Itens Compra\\' +
        request.params.path
    );
  },

  async uploadItem(request, response) {
    response.send('Arquivo Recebido');
  }
};
