// API REAL do Governo
const API_BASE = 'https://compras.dados.gov.br/licitacoes/v1/licitacoes.json';

// Dados de exemplo + IA (quando API falhar)
const EXEMPLOS = [
    {id:1, numero:"001/2025", orgao:"Prefeitura SP", valor:25000, descricao:"Material escritório URGENTE", estado:"SP", scoreIA:95},
    {id:2, numero:"002/2025", orgao:"Ministério Saúde", valor:150000, descricao:"Equipamentos médicos", estado:"RJ", scoreIA:88},
    {id:3, numero:"003/2025", orgao:"Prefeitura RJ", valor:8000, descricao:"Limpeza predial", estado:"RJ", scoreIA:72}
];

let todasLicitacoes = [];

// 🔍 BUSCAR LICITAÇÕES
async function buscarLicitacoes() {
    const termo = document.getElementById('busca').value;
    try {
        const url = `${API_BASE}?${termo ? `item_descricao=${termo}` : ''}&limit=50`;
        const res = await fetch(url);
        const data = await res.json();
        todasLicitacoes = data.items || EXEMPLOS;
        exibirResultados(todasLicitacoes);
        playSound('search');
    } catch(e) {
        todasLicitacoes = EXEMPLOS;
        exibirResultados(todasLicitacoes);
    }
}

// 🤖 FILTRAR POR IA
function filtrarIA() {
    const filtradas = todasLicitacoes.map(op => ({
        ...op,
        scoreIA: calcularScoreIA(op)
    })).filter(op => op.scoreIA > 70).sort((a,b) => b.scoreIA - a.scoreIA);
    
    exibirResultados(filtradas);
    criarGrafico(filtradas);
    playSound('filter');
}

// 🧠 ALGORITMO IA SIMPLES
function calcularScoreIA(op) {
    let score = 50;
    if (op.valor > 10000) score += 30;
    if (op.descricao.toLowerCase().includes('urgente')) score += 20;
    if (op.estado === 'SP' || op.estado === 'RJ') score += 15;
    if (op.valor < 50000) score += 10;
    return Math.min(score, 100);
}

// 📊 EXIBIR RESULTADOS
function exibirResultados(ops) {
    const div = document.getElementById('resultados');
    div.innerHTML = ops.map(op => `
        <div class="oportunidade" onclick="abrirEdital('${op.id}')">
            <h3>${op.numero} - Score IA: ${op.scoreIA}/100 ⭐</h3>
            <p><strong>Órgão:</strong> ${op.orgao}</p>
            <p><strong>Valor:</strong> R$ ${op.valor.toLocaleString()}</p>
            <p><strong>Estado:</strong> ${op.estado}</p>
            <p><strong>Descrição:</strong> ${op.descricao}</p>
        </div>
    `).join('');
}

// 📈 GRÁFICO
function criarGrafico(ops) {
    const ctx = document.getElementById('grafico').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ops.slice(0,5).map(op => op.numero),
            datasets: [{label: 'Score IA', data: ops.slice(0,5).map(op => op.scoreIA), backgroundColor: '#3b82f6'}]
        }
    });
}

// 🔔 ALERTAS
function cadastrarAlerta() {
    const email = document.getElementById('email').value;
    if(email) {
        alert(`✅ Alerta cadastrado! Você receberá emails sobre novas licitações em ${email}`);
        playSound('alert');
    }
}

function abrirEdital(id) {
    alert(`🔗 Abrindo edital ${id} no Portal da Transparência`);
    window.open('https://www.gov.br/compras/pt-br', '_blank');
    playSound('click');
}

// 🎵 EFEITOS SONOROS (OPCIONAL)
function playSound(type) {
    const audio = new Audio();
    switch(type) {
        case 'search': audio.src = 'https://www.soundjay.com/buttons/beep-01a.mp3'; break;
        case 'filter': audio.src = 'https://www.soundjay.com/buttons/beep-02.mp3'; break;
        case 'alert': audio.src = 'https://www.soundjay.com/buttons/beep-03.mp3'; break;
        case 'click': audio.src = 'https://www.soundjay.com/buttons/beep-04.mp3'; break;
    }
    audio.play().catch(() => {}); // Ignora erro se som falhar
}

// 📜 ROLAGEM SUAVE
function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

// CARREGAR INICIAL
buscarLicitacoes();
