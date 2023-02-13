const jwt = require('jsonwebtoken');
const { Keytoken } = require('../config/env');

exports.auth = (request, response, next) => {
  const userInSession = request.session.user;
  const query =  new URLSearchParams(request.query).toString()
  const loginRouter = query ? `/?${query}` : '/'

  if (!userInSession) {
    request.session.flash = {
      text: 'Sessão Expirada',
      type: 'warning',
      title: 'Atenção!'
    };
    return response.redirect(loginRouter);
  }

  const { token } = request.query

  if (token) {
    try {
      const user = jwt.verify(token, Keytoken.secret)

      if (user.aprovador != userInSession.codigo) {
        request.session.destroy();
        return response.redirect('/home');
      }
      response.redirect(user.router)
    } catch (error) {
      request.session.destroy();
      return response.redirect(loginRouter);
    }
  }

  next();
};
