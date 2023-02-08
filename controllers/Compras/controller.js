// const SolicitacaoService = require('./service');
const { renderJson } = require('../../helpers/render');
const { db } = require('../../config/env');
const sql = require('mssql');
const enviarEmail = require('../../infra/emailAdapter');
const produtoAcaminho = require('../../template-email/produto_chegando');
const produtoComprado = require('../../template-email/solicitacao_comprada')
module.exports = {
  async Create(request) {
    const {
      dataDaCompra,
      valorDaCompra,
      quantidadeDeParcelas = 0,
      dataDaPrimeiraParcela = '',
      previsaoDeEntrega,
      codigo,
      metodoDePagamento,
      comprador
    } = request;

    const conexao = await sql.connect(db);

    const inserirCompra = await conexao.query(`
        insert into Compras (dataDaCompra, valorDaCompra, quantidadeDeParcelas, dataDaPrimeiraParcela, previsaoDeEntrega, codigo_solicitacao, metodo_De_Pagamento, id_Comprador )
        values ('${dataDaCompra}', '${valorDaCompra}', ${quantidadeDeParcelas}, '${dataDaPrimeiraParcela}', '${previsaoDeEntrega}', ${codigo},'${metodoDePagamento}', ${comprador})`);

    await conexao.query(`update Solicitacao_Item
        set Status_Compra = 'C'
        where Codigo = ${codigo}`);

    const solicitacao = await conexao.request().query(`select Descricao from Solicitacao_Item where Codigo = ${codigo}`)

    const query = await conexao.request().query(`SELECT usuarios.EMAIL_USUARIO
    FROM usuarios
    INNER Join Solicitacao_Item
    ON Usuarios.NOME_USUARIO = Solicitacao_Item.Solicitante
    WHERE Codigo = ${codigo}`);

    const email = query.recordset[0].EMAIL_USUARIO;
    // buscar email logistica
    const emailOptions = {
      to: email,
      subject: 'Compra Realizada',
      content: produtoComprado({
        descricao: solicitacao.recordset[0].Descricao,
        codigo
      }),
      isHtlm: true
    };

    const emailOptionsLogistica = {
      to: 'logistica@itone.com.br',
      subject: 'Compra a Caminho',
      content: produtoAcaminho({
        descricao: solicitacao.recordset[0].Descricao,
        previsaoDeEntrega,
        codigo
      }),
      isHtlm: true
    }

    enviarEmail(emailOptions);
    enviarEmail(emailOptionsLogistica)
    const corpo =
      'Solicitação N° ' + codigo + ' Foi adicionado para itens comprados';

    return renderJson(corpo);
  }
};
