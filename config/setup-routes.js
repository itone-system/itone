const SolicitacaoRouter = require('../controllers/Solicitacao/router');
const ComprasRouter = require('../controllers/Compras/router');
const UsuariosRouter = require('../controllers/Usuarios/router');
const HomeRouter = require('../controllers/Home/router');
const LoginRouter = require('../controllers/Login/router');
const { auth } = require('../middlewares/auth-middleware');

module.exports = (app) => {
  app.use(LoginRouter);
  app.use('/home', auth, HomeRouter);
  app.use('/solicitacoes', auth, SolicitacaoRouter);
  app.use('/users', UsuariosRouter);
  app.use('/compras', ComprasRouter);
};
