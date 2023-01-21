const model = require('../../infra/dbAdapter');
const TableSolicitacao = model('Solicitacao_Item');
const enviarEmail = require('../../infra/enviarEmail');
const db = require('../../config/connection');
const sql = require('mssql');

exports.buscarSolicitacoesPorFiltro = async ({
  data,
  pagina = {}
}) => {
  const { Descricao, Solicitante, statusItem, centroCustoFiltro } = data;

  TableSolicitacao.select('Codigo, Descricao, DataCriacao, FORMAT(DataAtualizacao, \'dd/mm/yyyy\') as DataAtualizacao, Quantidade, Status_Compra, Solicitante');

  if (Descricao) {
    TableSolicitacao.andWhere({
      Descricao: `like ${Descricao}`
    });
  }

  if (Solicitante) {
    TableSolicitacao.andWhere({
      Solicitante: `like ${Solicitante}`
    });
  }

  if (statusItem) {
    TableSolicitacao.andWhere({
      Status_Compra: statusItem
    });
  }

  if (centroCustoFiltro) {
    TableSolicitacao.andWhere({
      Centro_de_Custo: centroCustoFiltro
    });
  }

  TableSolicitacao.orderBy('Codigo');

  if (pagina.limite) {
    TableSolicitacao.paginate(pagina.offset, pagina.limite);
  }

  return await TableSolicitacao.execute();
};

exports.obterServicoPorCodigo = async (Codigo) => {
  TableSolicitacao.select();
  const solicitacao = await TableSolicitacao.andWhere({
    Codigo
  }).execute();

  if (!solicitacao?.data) {
    return null;
  }

  return solicitacao?.data[0];
};

exports.enviarEmail = async (email, token) => {
  enviarEmail(email, token);
};

exports.buscarProximoAprovador = async (codigo) => {
  const conexao = await sql.connect(db);

  const busca = await conexao.request()
    .query(`select top 1
        t1.EMAIL_USUARIO, t1.COD_USUARIO
    from
        Aprovacoes t0
        INNER JOIN Usuarios t1 ON t1.COD_USUARIO = t0.Codigo_Aprovador
    where
        t0.Status = 'N'
        and
        t0.Codigo_Solicitacao = ${codigo}
    order by
        t0.Ordem asc`);

  if (busca.recordsets[0].length == 0) {
    console.log('todos aprovaram');
    const alterarStatus = await conexao.request()
      .query(`update Solicitacao_Item set Aprovado = 'Y' where Codigo = ${codigo}`);

    const alterarStatus2 = await conexao.request().query(`update Solicitacao_Item set Status_Compra = 'A' where Codigo = ${codigo}`);
    return;
  }

  const email = busca.recordset[0].EMAIL_USUARIO;
  console.log('foi aqui', busca.recordset[0]);
  const codigoUsuario = busca.recordset[0].COD_USUARIO;
  console.log('não chegou aqui');

  return {
    email,
    codigoUsuario
  };
};

exports.obterDadosUser = async (codigo) => {
  const conexao = await sql.connect(db);

  const query = await conexao.request().query(`SELECT Usuarios.COD_USUARIO, Usuarios.LOGIN_USUARIO, Usuarios.VALIDACAO_SENHA, Usuarios.NOME_USUARIO, Usuarios.EMAIL_USUARIO, Usuarios.ID_DEPARTAMENTO, Usuarios.Perfil, TIPO_PERMISSAO.PERMISSAO, MODULOS.MODULO
    FROM Usuarios
    LEFT JOIN PERMISSOES ON Usuarios.COD_USUARIO = PERMISSOES.COD_USUARIO
    LEFT JOIN TIPO_PERMISSAO ON TIPO_PERMISSAO.ID = PERMISSOES.COD_PERMISSAO
    LEFT JOIN MODULOS ON MODULOS.ID = PERMISSOES.COD_MODULO
    WHERE Usuarios.COD_USUARIO = ${codigo}`);

  const dadosUserSolicitacao = {};

  if (query.recordset) {
    dadosUserSolicitacao.codigo = query.recordset[0].COD_USUARIO,
    dadosUserSolicitacao.loginUsuario = query.recordset[0].LOGIN_USUARIO,
    dadosUserSolicitacao.nome = query.recordset[0].NOME_USUARIO,
    dadosUserSolicitacao.email = query.recordset[0].EMAIL_USUARIO,
    dadosUserSolicitacao.departamento = query.recordset[0].ID_DEPARTAMENTO,
    dadosUserSolicitacao.Perfil = query.recordset[0].Perfil,
    dadosUserSolicitacao.permissao = '';
    dadosUserSolicitacao.permissoesNotaFiscal = '';
    dadosUserSolicitacao.validacao = query.recordset[0].VALIDACAO_SENHA;

    for (const item of query.recordset) {
      if (item.MODULO == 'COMPRAS') {
        dadosUserSolicitacao.permissao += item.PERMISSAO + ',';
      }

      if (item.MODULO == 'NOTA FISCAL') {
        dadosUserSolicitacao.permissoesNotaFiscal += item.PERMISSAO + ',';
      }
    }
  }
  const dados = {
    dadosUserSolicitacao
  };

  return (dados);
};

exports.inserirSolicitacao = async () => {
  
}
