const params = new URLSearchParams(window.location.search);
const movieId = params.get("id");
const movieTitle = params.get("title");
const moviePrice = params.get("price");

document.getElementById("movieInfo").innerHTML = `
    <h2>${movieTitle}</h2>
    <p><strong>Valor:</strong> R$ ${moviePrice}</p>
`;

// Mostrar/ocultar métodos
const buttons = document.querySelectorAll(".pay-btn");
const methods = {
    pix: document.getElementById("pixBox"),
    card: document.getElementById("cardBox"),
    boleto: document.getElementById("boletoBox")
};

buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        const method = btn.dataset.method;

        // esconde todas
        Object.values(methods).forEach(box => box.style.display = "none");

        // mostra somente a escolhida
        methods[method].style.display = "block";

        if (method === "pix") gerarQR();
    });
});

// === PIX ===
function gerarQR() {
    const pixString = `Pagamento CineAluguel\nFilme: ${movieTitle}\nValor: R$ ${moviePrice}`;
    const canvas = document.getElementById("qrcode");

    QRCode.toCanvas(canvas, pixString, { width: 200 }, function (error) {
        if (error) console.error(error);
    });

    document.getElementById("pixCode").textContent = pixString;
}

function copyPix() {
    navigator.clipboard.writeText(document.getElementById("pixCode").textContent);
    alert("Código PIX copiado!");
}

// === CARTÃO ===
document.getElementById("cardBox").onsubmit = function (e) {
    e.preventDefault();

    document.getElementById("statusMsg").innerHTML =
        "✔ Pagamento aprovado! Seu filme foi liberado.";
};

// === BOLETO ===
function gerarBoleto() {
    const codigo = "23793.38127 60000.004567 89000.123456 1 999900000" + moviePrice.replace(".", "");

    const win = window.open("", "_blank");
    win.document.write(`
        <h1>Boleto Gerado</h1>
        <p>Filme: <strong>${movieTitle}</strong></p>
        <p>Valor: <strong>R$ ${moviePrice}</strong></p>
        <p><strong>Linha Digitável:</strong></p>
        <p>${codigo}</p>
    `);
}
