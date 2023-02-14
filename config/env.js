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
  SECRET,
  PORT,
  DOMAIN
} = process.env;

const port = parseInt(PORT || 5052)
const isProd = ENVIRONMENT !== 'dev'

if (isProd && !DOMAIN) {
  throw new Error('O domínio deve ser informado!')
}

const domain = DOMAIN || (port !== 80 ? `http://localhost:${port}` : 'http://localhost')

module.exports = {
  enviroment: ENVIRONMENT,
  isProd,
  port,
  domain,
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
    age: 3600000
  },
  Keytoken: {
    secret: SECRET
  }
};
