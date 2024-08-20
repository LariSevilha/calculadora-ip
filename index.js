function adicionarNumero(numero) {
    const ipInput = document.getElementById('ip');
    ipInput.value += numero;
    ipInput.focus();
}

function adicionarPonto() {
    const ipInput = document.getElementById('ip');
    if (!ipInput.value.endsWith('.')) {
        ipInput.value += '.';
    }
    ipInput.focus();
}

function apagarUltimoCaractere() {
    const ipInput = document.getElementById('ip');
    ipInput.value = ipInput.value.slice(0, -1);
    ipInput.focus();
}

function calcularIP() {
    const ip = document.getElementById('ip').value;
    const octetos = ip.split('.').map(Number);

    if (octetos.length !== 4 || octetos.some(o => o < 0 || o > 255)) {
        alert('IP inválido');
        return;
    }

    const classe = determinarClasse(octetos);
    const redePrivada = verificarRedePrivada(octetos, classe);
    const subnetMask = calcularMascaraSubrede(classe);
    const networkAddress = calcularEnderecoRede(octetos, subnetMask);
    const broadcastAddress = calcularEnderecoBroadcast(octetos, subnetMask);
    const ipInicial = calcularIPInicial(networkAddress);
    const ipFinal = calcularIPFinal(broadcastAddress);

    const tipoRede = redePrivada ? 'Privada' : 'Pública';

    document.getElementById('resultado').innerHTML = `
        <p>Classe: ${classe}</p>
        <p>Endereço de Rede: ${networkAddress.join('.')}</p>
        <p>Endereço de Broadcast: ${broadcastAddress.join('.')}</p>
        <p>IP Inicial: ${ipInicial.join('.')}</p>
        <p>IP Final: ${ipFinal.join('.')}</p>
        <p>Hosts Válidos: ${calcularHostsValidos(classe)}</p>
        <p>Tipo de Rede: ${tipoRede}</p>
        <p>Máscara de Sub-rede: ${subnetMask.join('.')}</p>
        <button onclick="openModal()">Dividir Sub-rede</button>
    `;
}

function determinarClasse(octetos) {
    if (octetos[0] >= 1 && octetos[0] <= 126) {
        return 'A';
    } else if (octetos[0] >= 128 && octetos[0] <= 191) {
        return 'B';
    } else if (octetos[0] >= 192 && octetos[0] <= 223) {
        return 'C';
    } else {
        return 'Fora das classes A, B, C';
    }
}

function verificarRedePrivada(octetos, classe) {
    if (classe === 'A' && octetos[0] === 10) {
        return true;
    } else if (classe === 'B' && octetos[0] === 172 && octetos[1] >= 16 && octetos[1] <= 31) {
        return true;
    } else if (classe === 'C' && octetos[0] === 192 && octetos[1] === 168) {
        return true;
    }
    return false;
}

function calcularMascaraSubrede(classe) {
    switch (classe) {
        case 'A':
            return [255, 0, 0, 0];
        case 'B':
            return [255, 255, 0, 0];
        case 'C':
            return [255, 255, 255, 0];
        default:
            return [0, 0, 0, 0];
    }
}

function calcularEnderecoRede(octetos, subnetMask) {
    return octetos.map((octeto, i) => octeto & subnetMask[i]);
}

function calcularEnderecoBroadcast(octetos, subnetMask) {
    return octetos.map((octeto, i) => octeto | (~subnetMask[i] & 255));
}

function calcularIPInicial(networkAddress) {
    const ipInicial = [...networkAddress];
    ipInicial[3] += 1;
    if (ipInicial[3] > 255) {
        ipInicial[3] = 0;
        ipInicial[2] += 1;
    }
    return ipInicial;
}

function calcularIPFinal(broadcastAddress) {
    const ipFinal = [...broadcastAddress];
    ipFinal[3] -= 1;
    if (ipFinal[3] < 0) {
        ipFinal[3] = 255;
        ipFinal[2] -= 1;
    }
    return ipFinal;
}

function calcularHostsValidos(classe) {
    switch (classe) {
        case 'A':
            return '16,777,214';
        case 'B':
            return '65,534';
        case 'C':
            return '254';
        default:
            return 'N/A';
    }
}

function calcularSubredes() {
    const ip = document.getElementById('ip').value;
    const subnetCount = parseInt(document.getElementById('subnetCount').value);

    if (!subnetCount || subnetCount < 1) {
        alert('Por favor, insira um número válido de sub-redes.');
        return;
    }

    const octetos = ip.split('.').map(Number);
    const classe = determinarClasse(octetos);
    const subnetBits = Math.ceil(Math.log2(subnetCount)); // Quantos bits são necessários para as sub-redes
    const newSubnetMask = calcularNovaMascaraSubrede(classe, subnetBits);

    const hostsPorSubrede = Math.pow(2, 32 - subnetBits - (classe === 'A' ? 8 : classe === 'B' ? 16 : 24)) - 2;
    const increment = 256 / Math.pow(2, subnetBits); // Incremento para o cálculo das sub-redes

    const resultados = [];
    let currentNetworkAddress = calcularEnderecoRede(octetos, newSubnetMask);

    for (let i = 0; i < subnetCount; i++) {
        const broadcastAddress = calcularEnderecoBroadcast(currentNetworkAddress, newSubnetMask);
        const ipInicial = calcularIPInicial(currentNetworkAddress);
        const ipFinal = calcularIPFinal(broadcastAddress);

        resultados.push(`
            <div>
                <p class="s">Sub-rede ${i + 1}</p>
                <p>Endereço de Rede: ${currentNetworkAddress.join('.')}</p>
                <p>Endereço de Broadcast: ${broadcastAddress.join('.')}</p>
                <p>IP Inicial: ${ipInicial.join('.')}</p>
                <p>IP Final: ${ipFinal.join('.')}</p>
                <p>Hosts Válidos: ${hostsPorSubrede}</p>
            </div>
        `);

        // Incrementa o endereço da sub-rede atual para calcular a próxima
        currentNetworkAddress = incrementarEndereco(currentNetworkAddress, increment);
    }

    document.getElementById('resultado').innerHTML = `
        <h3>Sub-redes Divididas</h3>
        ${resultados.join('')}
    `;
    closeModal();
}

function calcularNovaMascaraSubrede(classe, subnetBits) {
    let totalBits = (classe === 'A' ? 8 : classe === 'B' ? 16 : 24) + subnetBits;
    const newMask = [];

    for (let i = 0; i < 4; i++) {
        if (totalBits >= 8) {
            newMask.push(255);
            totalBits -= 8;
        } else if (totalBits > 0) {
            newMask.push(256 - Math.pow(2, 8 - totalBits));
            totalBits = 0;
        } else {
            newMask.push(0);
        }
    }

    return newMask;
}

function incrementarEndereco(endereco, incremento) {
    const novoEndereco = [...endereco];
    let carry = incremento;

    for (let i = 3; i >= 0; i--) {
        novoEndereco[i] += carry;
        if (novoEndereco[i] > 255) {
            carry = Math.floor(novoEndereco[i] / 256);
            novoEndereco[i] %= 256;
        } else {
            carry = 0;
            break;
        }
    }

    return novoEndereco;
}

function openModal() {
    const modal = document.getElementById('subnetModal');
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('subnetModal');
    modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target === document.getElementById('subnetModal')) {
        closeModal();
    }
}
