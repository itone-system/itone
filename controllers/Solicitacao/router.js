const express = require('express');
const solicitacaoRouter = express.Router();
const SolicitacaoController = require('../Solicitacao/controller');
const { expressAdapter } = require('../../infra/expressAdapter');

/*
 *  GET / - lista tudo
 *  POST / - criar
 *  PUT /:id - editar um especifico
 *  DELETE /:id - excluir um especifico
 *  PATCH
 */
solicitacaoRouter.get('/listar', expressAdapter(SolicitacaoController.Listar));
solicitacaoRouter.post('/criar', expressAdapter(SolicitacaoController.Create));
solicitacaoRouter.get('/:Codigo/edit', expressAdapter(SolicitacaoController.Edit));
solicitacaoRouter.post('/aprovar', expressAdapter(SolicitacaoController.Aprovar));
solicitacaoRouter.put('/atualizar', expressAdapter(SolicitacaoController.Update));
solicitacaoRouter.get('/criar', expressAdapter(SolicitacaoController.Criar));

module.exports = solicitacaoRouter;
