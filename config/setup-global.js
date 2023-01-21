module.exports = (app) => {
  app.locals.endpoints = {
    trocarSenha: '/trocar_senha',
    login: '/',
    ListarSolicitacoes: '/listar',
    Comprar: '/compras/',
    NotaFiscal: '/notafiscal',
    ListarNotas: '/listarnotas',
    NovaSolicitacao: '/solicitacoes/criar',
    AtualizarNF: '/atualizarStatusNota',
    ListarUsuarios: '/users/listar',
    ListarItens: '/itens',
    AprovarSolicitacao: '/solicitacoes/aprovar',
    editarSolicitacao: '/solicitacoes/editar'
  };
};
