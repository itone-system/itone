const dadosUser = [];

const TrocarSenha = () => {
  const senha = document.querySelector('#senha').value;
  const confirmacao = document.getElementById('confirmacao').value;
  const usuario = document.getElementById('email').value;

  if (!senha || !confirmacao) {
    alert('É necessário preencher todos os campos');
    return;
  }

  if (senha != confirmacao) {
    alert('As senhas não conferem');
    return;
  }

  const objeto = {
    usuario,
    senha: confirmacao
  };

  fetch(endpoints.trocarSenha, {
    method: 'POST',
    body: JSON.stringify(objeto),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  }).then(dados => {
    console.log(dados);
    return dados.json();
  }).then(dados => {
    console.log(dados.menssagem);
  });
};

const verificarLogin = () => {
  console.log('entrou');
  const email = document.getElementById('email').value;
  const senhaPadrao = document.getElementById('password').value;

  if (!email || !senhaPadrao) {
    alert('É necessário preencher todos os campos');
    return;
  }
  const corpo = {
    usuario: email,
    senha: senhaPadrao
  };

  fetch(endpoints.login, {
    method: 'POST',
    body: JSON.stringify(corpo),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  }).then(dados => {
    return dados.json();
  }).then(dados => {
    if (dados.error) {
      alert('E-mail ou senha inválidos');
      return;
    }

    if (dados.dadosUserSolicitacao.validacao == 'N') {
      click('botaoModal');
      return;
    }
    localStorage.setItem('codigo', dados.dadosUserSolicitacao.codigo);

    const qs = '?' + new URLSearchParams(dados.dadosUserSolicitacao);
    console.log(`/home${qs}`);

    window.location.assign(`/home${qs}`);
  });
};

function click (id) {
  const element = document.getElementById(id);
  if (element.click) { element.click(); } else if (document.createEvent) {
    const eventObj = document.createEvent('MouseEvents');
    eventObj.initEvent('click', true, true);
    element.dispatchEvent(eventObj);
  }
}

document.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    verificarLogin();
  }
});
