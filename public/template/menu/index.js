const body = document.querySelector('body'),
    sidebar = body.querySelector('nav'),
    toggle = body.querySelector(".toggle"),
    searchBtn = body.querySelector(".search-box"),
    modeSwitch = body.querySelector(".toggle-switch"),
    modeText = body.querySelector(".mode-text"),
    mudarDark = body.querySelector("#mudarDark")

toggle.addEventListener("click", () => {
    sidebar.classList.toggle("fechado");
})

$(document).ready(function () {
    if (localStorage.getItem("darkMode") === "true") {
        body.classList.add("dark");
    }
});


// searchBtn.addEventListener("click", () => {
//     sidebar.classList.remove("fechado");
// })

modeSwitch.addEventListener("click", () => {
    body.classList.toggle("dark");
    if (body.classList.contains("dark")) {
        localStorage.setItem("darkMode", "true");
    } else {
        localStorage.setItem("darkMode", "false");
    }



    if (body.classList.contains("dark")) {
        mudarDark.innerHTML = ` <span class="mode-text text " style="color: white;">Light mode</span>`
    } else {
        mudarDark.innerHTML = ` <span class="mode-text text " style="color: black;">Dark mode</span>`
    }
});

var darkModeBtn = document.getElementById("dark-mode-btn");
if (localStorage.getItem("darkMode") === "true") {
    body.classList.add("dark");
}

const paginaHome = () => {
    const codigo = localStorage.getItem('codigo')
    window.location.assign(`/home?codigo=${codigo}`)
}

const paginaAcompanhar = () => {
    const codigo = localStorage.getItem('codigo')
    window.location.assign(`/solicitacoes/listar?codigo=${codigo}`)
}

const paginaNovaSolicitacao = () => {
    window.location.assign(`/criar`)
}

const incluirNota = () => {
    window.location.assign(`/incluirNota`)
}

const buscarNotas = () => {
    window.location.assign(`/buscarNotas`)
}

const sair = () => {
    localStorage.removeItem("dados")
    window.location.assign(`/login`)
}
