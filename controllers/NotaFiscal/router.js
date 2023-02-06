const express = require('express')
const notasFiscalRouter = express.Router()
const notas = require('../NotaFiscal/controller')
const { expressAdapter } = require('../../infra/expressAdapter');
const multer = require('multer')



const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null,'U:\\@TI\\Sistemas\\Arquivos-ADM-WEB\\Nota Fiscal')
    },
    filename: function(req, file, cb){
        cb(null,  'DCT-'+ req.params.codigoNF +' '+req.params.nomeArquivo)
       console.log(req.params)
    }
})

const upload = multer({storage})



notasFiscalRouter.post('/insertnotafiscal', notas.insertNotas)
notasFiscalRouter.post('/listarnotas', notas.listarNotas)
notasFiscalRouter.post('/atualizarStatusNota', expressAdapter(notas.atualizarStatusNota))
notasFiscalRouter.get('/incluirNota', expressAdapter(notas.Criar));
notasFiscalRouter.get('/buscarNotas', expressAdapter(notas.listarNotas));
notasFiscalRouter.post('/uploadNF/:codigoNF/:nomeArquivo', upload.single('file'), notas.uploadNF )
notasFiscalRouter.get('/downloadNF/:path',  notas.downloadNF )
notasFiscalRouter.post('/notaUnica',  expressAdapter(notas.notaUnica ))


module.exports = notasFiscalRouter