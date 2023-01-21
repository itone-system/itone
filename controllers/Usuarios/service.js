const sql = require('mssql');
const { db } = require('../../config/env');

exports.getAprovadores = async (centroCusto) => {


  const conexao = await sql.connect(db);

  const result1 = await conexao.request()
    .input('centro_custo', sql.VarChar, centroCusto)
    .query('select * from Usuarios where ID_DEPARTAMENTO like @centro_custo');

  return result1;
};
