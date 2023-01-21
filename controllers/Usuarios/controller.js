// const db = require('../../config/connection');
// const sql = require('mssql');
const { renderJson } = require('../../helpers/render');
const SolicitacaoService = require('./service')

module.exports = {

  async List (request) {

    console.log(request)
  
    const { centro_custo } = request;

    const usuarios = await SolicitacaoService.getAprovadores(centro_custo)

    return renderJson(usuarios)
  }

};
