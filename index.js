function adicionarNumero(numero) {
    const ipInput = document.getElementById('ip');
    ipInput.value += numero;
}

function adicionarPonto() {
    const ipInput = document.getElementById('ip');
    ipInput.value += '.';
}

function apagarUltimoCaractere() {
    const ipInput = document.getElementById('ip');
    ipInput.value = ipInput.value.slice(0, -1);
}

function calcularIP() {
    const ip = document.getElementById('ip').value;
    const octetos = ip.split('.').map(Number);

    if (octetos.length !== 4 || octetos.some(o => o < 0 || o > 255)) {
        alert('IP inválido');
        return;
    }

    let classe = '';
    if (octetos[0] >= 1 && octetos[0] <= 126) {
        classe = 'A';
    } else if (octetos[0] >= 128 && octetos[0] <= 191) {
        classe = 'B';
    } else if (octetos[0] >= 192 && octetos[0] <= 223) {
        classe = 'C';
    } else {
        classe = 'Fora das classes A, B, C';
    }

    document.getElementById('resultado').innerHTML = `
        <p>Classe: ${classe}</p>
        <p>Endereço de Rede: ${octetos[0]}.${octetos[1]}.0.0</p>
        <p>Endereço de Broadcast: ${octetos[0]}.${octetos[1]}.255.255</p>
        <p>Hosts Válidos: ${(classe === 'A') ? '16,777,214' : (classe === 'B') ? '65,534' : (classe === 'C') ? '254' : 'N/A'}</p>
    `;
}

document.getElementById('ip').addEventListener('keydown', function (e) {
    if (e.key === "Enter") {
        calcularIP();
    } else if (e.key === "Backspace") {
        apagarUltimoCaractere();
    }
});
