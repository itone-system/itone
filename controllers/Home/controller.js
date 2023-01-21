// const db = require('../../config/connection');
// const sql = require('mssql');
const { renderView } = require('../../helpers/render');
// const SolicitacaoService = require('./service');

module.exports = {

  async Index (request) {
    const user = request.session.get('user');
    console.log('session',user)
    // const usuario = await SolicitacaoService.obterDadosUser(request.codigo);
    return renderView('home/Index', { nome: user.nome });
  }

};
