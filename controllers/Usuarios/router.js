const { Router } = require('express');
const { expressAdapter } = require('../../infra/expressAdapter');
const UsuarioController = require('../Usuarios/controller');

const UsuarioRouter = Router();

UsuarioRouter.post('/listar', expressAdapter(UsuarioController.List));
module.exports = UsuarioRouter;
