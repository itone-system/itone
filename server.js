const setupRoutes = require('./config/setup-routes');
const setupCors = require('./config/setup-cors');
const setupViews = require('./config/setup-views');
const setupPublic = require('./config/setup-public');
const setupSession = require('./config/setup-session');
const setupGlobal = require('./config/setup-global');
const express = require('express');

const app = express();
setupGlobal(app);
setupCors(app);
setupSession(app);
setupViews(app);
setupPublic(app);
setupRoutes(app);

const port = process.env.PORT || 5050;

app.listen(port, () => {
  console.log(`Aplicação rodando na porta ${port}`);
});
