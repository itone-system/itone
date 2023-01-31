const nodemailer = require('nodemailer');

const { emailProvider } = require('../config/env');

// module.exports = async ({ to, subject = 'fkdflksjflkdjf', text = 'dfkfvjsddfjsdfljk', isHtlm = false}) => {
module.exports = async (body, token) => {


  // const link = `http://localhost:5050/solicitacoes/AprovarSolicitacao?token=${token}`

  // let html = `aprove através deste <a href= "${link}"> link </a> `

  // quando clicar, chamar uma rota que decodifica um token informado anteriormente com os dados da solicitação em questão e envia para a página de aprovação passando os dados da solicitação

  const link = `http://itonerdp06:5051/solicitacoes/:Codigo/edit?token=${token}`;
  const html = `<body style="margin: 0; padding:0; font-family: Arial, Helvetica, sans-serif;" >
    <table border="0" width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td>
                <!---------Header------>
                <table align="center" border="0" width="600px" cellpadding="0" cellspacing="0">
                    <tr>
                        <td align="center" style="padding: 60px 0 50px 0; background-color:#002f71">
                            <img src="https://uploaddeimagens.com.br/images/004/276/696/thumb/logo_branca.png?1672249934" style="width: 150px;">
                        </td>
                    </tr>
                    <!-----Corpo---->
                    <tr>
                        <td bgcolor="#fff" align="center" style="background-color: #ffffff;">
                            <table border="0" width="600px" cellpadding="0" cellspacing="0" style="padding: 30px; color: #313131;" >
                                <tr align="left">
                                    <td>
                                        <center><h3 >Você tem uma solicitação Pendente</h3></center><br></br>

                                        <span>O Wesley informou que a solicitação abaixo está aguardando aprovação</span> <br></br>
                                        <span>Solicitação n° XXX</span><br></br>
                                        <span>Descrição: Licença SAP</span><br></br>
                                    </td>
                                </tr>
                            </table>
                            <table border="0" width="600px" cellpadding="0" cellspacing="0" style="padding: 15px;">

                            </table>
                        </td>
                    </tr>
                    <!-----Footer----->
                    <tr>
                        <td style="padding: 20px; background-color:#002f71;">
                            <table border="0" width="600px" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td width="85%">
                                      <center>  <a href="${link}" style="color:#ffffff; "  type="button">Acessar Plataforma</a></center>


                            </table>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>

    </table>
</body> `;

  const transporter = nodemailer.createTransport({
    service: 'Outlook365',
    auth: {
      user: emailProvider.user,
      pass: emailProvider.pass
    }
  });

  // const mailOptions = {
  //     from: USER,
  //     to: EMAILTEST || to,
  //     subject,
  //     // text: 'Você tem uma solicitação pendente'
  // };

  // if (!isHtlm) {
  //     mailOptions.text = text
  // }else {
  //     mailOptions.html = text
  // }

  const mailOptions = {
    from: emailProvider.user,
    to: emailProvider.fakeEmail || body,
    subject: 'Solicitação de Aprovação',
    text: 'Você tem uma solicitação pendente',
    html
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};
