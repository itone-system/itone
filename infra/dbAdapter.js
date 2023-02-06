const sql = require('mssql');
const { db } = require('../config/env');
let instanceDb = null;

const initDb = async () => {
  if (!instanceDb) {
    instanceDb = await sql.connect(db);
  }
  return instanceDb;
};

module.exports = (table) => {
  let query = null;
  let queryToCount = query;
  let hasWhere = false;
  return {
    select (columns = '*') {
      if (Array.isArray(columns)) {
        columns = columns.join(', ');
      }
      query = `select ${columns} from ${table}`;
      queryToCount = query;
      return this;
    },
    innnerJoin (tableJoin, fieldJoin, fieldTable) {
      query += ` INNER JOIN ${tableJoin} ON ${tableJoin}.${fieldJoin} = ${table}.${fieldTable}`;
      return this
    },
    andWhere (filter) {
      const symbolRegex = /[<>]|like/gm;
      let symbol = '=';

      for (let [key, value] of Object.entries(filter)) {
        if (typeof value === 'string') {
          const findSymbol = value.match(symbolRegex);
          if (findSymbol) {
            symbol = findSymbol.join('');
            value = value.replace(symbol, '');
            value = value.trim();
          }
        }

        if (!hasWhere) {
          if (typeof value === 'string') {
            query += ` where ${key} ${symbol} '${value}'`;
          } else {
            query += ` where ${key} ${symbol} ${value}`;
          }
          hasWhere = true;
        } else {
          if (typeof value === 'string') {
            query += ` and ${key} ${symbol} '${value}'`;
          } else {
            query += ` and ${key} ${symbol} ${value}`;
          }
        }
      }

      queryToCount = query;

      return this;
    },
    orWhere (filter) {
      const symbolRegex = /[<>]|like/gm;
      let symbol = '=';

      for (let [key, value] of Object.entries(filter)) {
        if (typeof value === 'string') {
          const findSymbol = value.match(symbolRegex);
          if (findSymbol) {
            symbol = findSymbol.join('');
            value = value.replace(symbol, '');
            value = value.trim();
          }
        }

        if (!hasWhere) {
          if (typeof value === 'string') {
            query += ` where ${key} ${symbol} '${value}'`;
          } else {
            query += ` where ${key} ${symbol} ${value}`;
          }
          hasWhere = true;
        } else {
          if (typeof value === 'string') {
            query += ` or ${key} ${symbol} '${value}'`;
          } else {
            query += ` or ${key} ${symbol} ${value}`;
          }
        }
      }

      queryToCount = query;

      return this;
    },
    async insert (params = {}, returnField = null) {
      const keys = Object.keys(params);

      if (keys.length === 0) {
        throw new Error('Não é possível fazer inserção sem parâmetros!');
      }

      const values = Object.values(params);

      let query = `INSERT INTO ${table} (`;

      for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        const comma = (index + 1) === keys.length ? ')' : ',';
        query += `${key}${comma}`;
      }

      if (returnField) {
        query += ` OUTPUT Inserted.${returnField}`;
      }

      query += ' VALUES (';

      for (let index = 0; index < values.length; index++) {
        const value = values[index];
        const comma = (index + 1) === values.length ? ')' : ',';
        query += `'${value}'${comma}`;
      }

      const instance = await initDb();
      const result = await instance.query(query);

      if (!returnField) {
        return result?.rowsAffected[0] === 1
      }


      return result?.recordset[0]
    },
    orderBy (byField, sort = 'asc') {
      query += ` ORDER BY ${byField} ${sort}`;
      return this;
    },
    paginate (offset, limit) {
      query += ` OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
      return this;
    },
    async count (alias = 'total', filed = '*') {
      const instance = await initDb();
      const result = await instance.query(`SELECT COUNT (${filed}) as ${alias} FROM ${table}`);
      return result.recordsets[0] ? result.recordsets[0][0] : null;
    },
    async execute () {
      console.log(query)
      const instance = await initDb();
      const result = await instance.query(query);
      query = null;
      hasWhere = false;

      if (!result?.recordsets) {
        return null;
      }

      return {
        data: Array.isArray(result?.recordsets[0]) ? result?.recordsets[0] : result?.recordsets[0][0],
        async count (alias = 'count', fields = '*') {
          const splitQuery = queryToCount.split(/from/);
          const countQuery = `select count(${fields}) as ${alias} from ${splitQuery[1]}`;
          const resultCount = await instance.query(countQuery);
          queryToCount = null;
          return resultCount.recordsets[0][0];
        }
      };
    }
  };
};
