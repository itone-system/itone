// const SolicitacaoService = require('./service');
const { renderJson } = require('../../helpers/render');
const { db } = require('../../config/env');
const sql = require('mssql');

module.exports = {
  async Create (request) {
    const body = {
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
        values ('${dataDaCompra}', ${valorDaCompra}, ${quantidadeDeParcelas}, '${dataDaPrimeiraParcela}', '${previsaoDeEntrega}', ${codigo},'${metodoDePagamento}', ${comprador})`);

    await conexao.query(`update Solicitacao_Item
        set Status_Compra = 'C'
        where Codigo = ${codigo}`);

    const corpo =
      'Solicitação N° ' + codigo + ' Foi adicionado para itens comprados';

    return renderJson(corpo);
  }
};
