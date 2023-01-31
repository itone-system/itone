const sql = require('mssql');
const { db } = require('../../config/env');

exports.getAprovadores = async (user) => {

  const conexao = await sql.connect(db);

  const result = await conexao.request().query(`select COD_APROVADOR from Usuarios where COD_USUARIO = ${user}`)

  return result;
};

exports.getNameAprovadores = async (arrayCodigos) => {

  const conexao = await sql.connect(db);

  let nomes = []
  let contador = 0

  for (let index = 0; index < arrayCodigos.length; index++) {
    let resultado = await conexao
      .request()
      .query(
        `select NOME_USUARIO from Usuarios where COD_USUARIO = ${arrayCodigos[index]}`
      );
      nomes[index] = resultado.recordset[0].NOME_USUARIO
      contador++
  }
  nomes[contador] = 'Andrezza Alencar'

  return nomes
}
