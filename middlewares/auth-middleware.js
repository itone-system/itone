exports.auth = (request, response, next) => {
  const userInSession = request.session.user;

  if (!userInSession) {
    request.session.flash = {
      text: 'Sessão Expirada',
      type: 'warning',
      title: 'Atenção!'
    };

    return response.redirect('/');
  }
  next();
};
