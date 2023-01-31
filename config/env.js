require('dotenv').config();
const {
  USUARIO,
  SENHA,
  DATABASE,
  SERVER,
  USER,
  PASS,
  EMAILTEST,
  SESSION_SECRET,
  ENVIRONMENT,
  SECRET
} = process.env;

module.exports = {
  enviroment: ENVIRONMENT,
  isProd: ENVIRONMENT !== 'dev',
  db: {
    user: USUARIO,
    password: SENHA,
    database: DATABASE,
    server: SERVER,
    options: {
      encrypt: true,
      trustServerCertificate: true
    }
  },
  emailProvider: {
    user: USER,
    pass: PASS,
    fakeEmail: EMAILTEST
  },
  session: {
    key: SESSION_SECRET,
    age: 60000 * 10 // 10 min
  },
  Keytoken: {
    secret: SECRET
  }
};
