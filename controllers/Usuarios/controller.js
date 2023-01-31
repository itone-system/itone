const { renderJson } = require('../../helpers/render');
const SolicitacaoService = require('./service');

module.exports = {

  async List (request) {
    const user = request.session.get('user');

    const aprovadores = await SolicitacaoService.getAprovadores(user.codigo)

    const codigosAprovadores = aprovadores.recordset[0].COD_APROVADOR.split(',');

    const nomes = await SolicitacaoService.getNameAprovadores(codigosAprovadores)

    return renderJson(nomes);
  }

};
