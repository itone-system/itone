const sessionAdapter = require('./sessionAdapter');

exports.expressAdapter = (controller) => {
  return async (request, response) => {
    const data = {
      ...request.query,
      ...request.body,
      ...request.params,
      session: sessionAdapter(request)
    };

    const controllerResult = await controller(data);
    return verifyCallback(controllerResult, response);
  };
};

const verifyCallback = (data, response) => {
  if (data.tipo === 'redirect') {
    return response.redirect(data.caminho);
  }

  if (data.tipo === 'render') {
    return response.render(data.caminho, data?.params);
  }

  if (data.tipo === 'json') {
    return response.status(data.statusCode).json(data.corpo);
  }
};
