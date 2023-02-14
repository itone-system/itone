const express = require('express');
const solicitacaoRouter = express.Router();
const SolicitacaoController = require('../Solicitacao/controller');
const { expressAdapter } = require('../../infra/expressAdapter');
const multer = require('multer')

/*
 *  GET / - lista tudo
 *  POST / - criar
 *  PUT /:id - editar um especifico
 *  DELETE /:id - excluir um especifico
 *  PATCH
 */

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null,'U:\\@TI\\Sistemas\\Arquivos-ADM-WEB\\Itens Compra')
    },
    filename: function(req, file, cb){
        cb(null,  'SLT-'+ req.params.codigoNF +' '+req.params.nomeArquivo)
       console.log(req.params)
    }
})

const upload = multer({storage})


solicitacaoRouter.get('/listar', expressAdapter(SolicitacaoController.Listar));
solicitacaoRouter.post('/criar', expressAdapter(SolicitacaoController.Create));
solicitacaoRouter.get('/:Codigo/edit', expressAdapter(SolicitacaoController.Edit));
solicitacaoRouter.post('/aprovar', expressAdapter(SolicitacaoController.Aprovar));
solicitacaoRouter.put('/atualizar', expressAdapter(SolicitacaoController.Update));
solicitacaoRouter.get('/criar', expressAdapter(SolicitacaoController.Criar));
solicitacaoRouter.get('/detailAprovador', expressAdapter(SolicitacaoController.Detail));
solicitacaoRouter.get('/detalhar', expressAdapter(SolicitacaoController.Login))
solicitacaoRouter.post('/uploadItem/:codigoNF/:nomeArquivo', upload.single('file'), SolicitacaoController.uploadItem )
solicitacaoRouter.get('/downloadItem/:path',  SolicitacaoController.downloadItem )

module.exports = solicitacaoRouter;
