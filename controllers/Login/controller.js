const { renderView, redirect } = require('../../helpers/render');
const SolicitacaoService = require('./service')

module.exports = {

  async Index (request) {
    const message = await request.session.message();
    return renderView('login/Index', { message });
  },

  async Auth (request) {
    const { usuario, senha } = request;

    const type = 'warning';

    if (!usuario) {
      request.session.message({
        type,
        text: 'Usuário não informado!'
      });
      return redirect('/');
    }

    if (!senha) {
      request.session.message({
        type,
        text: 'Senha não informada!'
      });
      return redirect('/');
    }

    // request.session.set('user', {
    //   name: 'Marcos Soares',
    //   age: 29
    // });

    const user = await SolicitacaoService.verifyUser(usuario, senha)

    if (!user.recordset[0]) {
      request.session.message({
        type,
        text: 'Usuário ou senha inválidos!'
      });
      return redirect('/');
    }

    const dadosUsuario = await SolicitacaoService.obterDadosUser(user.recordset[0].COD_USUARIO)

    request.session.set('user', dadosUsuario.dadosUserSolicitacao );
 


    return redirect('/home');
  },

  async ChangePass (request) {
    // const { usuario, senha } = request;

    // const conexao = await sql.connect(db);
    // const query = `declare
    //     @pwd1 varchar(20),
    //     @pwd2 varbinary(100),
    //     @pwd3 varchar(1)

    //     set @pwd1 = '${senha}'

    //     set @pwd2 = Convert(varbinary(100), pwdEncrypt(@pwd1))

    //     set @pwd3 = 'Y'

    //     update Usuarios
    //     set SENHA = @pwd2, VALIDACAO_SENHA = @pwd3
    //     WHERE LOGIN_USUARIO = '${usuario}'`;

    // const result = await conexao.request()

    //   .query(query);

    // return renderJson({ menssagem: 'Usuário editado com sucesso' });

    request.session.message({
      title: 'Mudança de Senha',
      text: 'Senha alterada com sucesso!',
      type: 'success'
    });

    return redirect('/');
  }
};
