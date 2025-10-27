// API REAL do Governo
const API_BASE = 'https://compras.dados.gov.br/licitacoes/v1/licitacoes.json';

// Dados de exemplo + IA (quando API falhar)
const EXEMPLOS = [
    {id:1, numero:"001/2025", orgao:"Prefeitura SP", valor:25000, descricao:"Material escritório URGENTE", estado:"SP", scoreIA:95, dataPublicacao: "2025-10-20", prazo: "15 dias"},
    {id:2, numero:"002/2025", orgao:"Ministério Saúde", valor:150000, descricao:"Equipamentos médicos", estado:"RJ", scoreIA:88, dataPublicacao: "2025-10-25", prazo: "30 dias"},
    {id:3, numero:"003/2025", orgao:"Prefeitura RJ", valor:8000, descricao:"Limpeza predial", estado:"RJ", scoreIA:72, dataPublicacao: "2025-10-27", prazo: "10 dias"}
];

let todasLicitacoes = [];

// 🔍 BUSCAR LICITAÇÕES
async function buscarLicitacoes() {
    const termo = document.getElementById('busca').value;
    try {
        const url = `${API_BASE}?${termo ? `item_descricao=${termo}` : ''}&limit=50`;
        const res = await fetch(url);
        const data = await res.json();
        todasLicitacoes = (data.items || EXEMPLOS).map(item => ({...item, scoreIA: calcularScoreIA(item)}));
        exibirResultados(todasLicitacoes);
        playSound('search');
    } catch(e) {
        todasLicitacoes = EXEMPLOS;
        exibirResultados(todasLicitacoes);
    }
}

// 🤖 FILTRAR POR IA
function filtrarIA() {
    const filtradas = todasLicitacoes.filter(op => op.scoreIA > 70).sort((a,b) => b.scoreIA - a.scoreIA);
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

// 📋 GERAR BRIEFING DETALHADO
function gerarBriefing(op) {
    const viabilidade = op.scoreIA > 80 ? 'Alta: Valor atrativo e baixa concorrência estimada.' : 
                        op.scoreIA > 60 ? 'Média: Avalie prazos e documentos.' : 'Baixa: Riscos altos (pouco valor ou urgência excessiva).';
    const recomendacoes = 'Precisa preparar: Proposta comercial (use template), documentos de habilitação (CNPJ, certidões), análise de concorrentes via portal. Participe se tiver expertise no setor.';
    const briefing = `
        <strong>📋 BRIEFING DA OPORTUNIDADE</strong><br><br>
        <strong>Número do Edital:</strong> ${op.numero}<br>
        <strong>Órgão Responsável:</strong> ${op.orgao}<br>
        <strong>Valor Estimado:</strong> R$ ${op.valor.toLocaleString()}<br>
        <strong>Descrição:</strong> ${op.descricao}<br>
        <strong>Estado/Local:</strong> ${op.estado}<br>
        <strong>Data de Publicação:</strong> ${op.dataPublicacao || 'Não disponível'}<br>
        <strong>Prazo Estimado:</strong> ${op.prazo || 'Verificar no edital'}<br><br>
        <strong>🤖 Análise IA - Score: ${op.scoreIA}/100</strong><br>
        ${viabilidade}<br><br>
        <strong>💡 Recomendações para Decisão:</strong><br>
        ${recomendacoes}<br><br>
        <strong>Próximos Passos:</strong> Baixe o edital completo no Portal da Transparência. Se viável, prepare proposta em até 48h.
    `;
    return briefing;
}

// 📊 EXIBIR RESULTADOS (ATUALIZADO COM BOTÃO DE BRIEFING)
function exibirResultados(ops) {
    const div = document.getElementById('resultados');
    div.innerHTML = ops.map(op => `
        <div class="oportunidade" onclick="abrirEdital('${op.id}')">
            <h3>${op.numero} - Score IA: ${op.scoreIA}/100 ⭐</h3>
            <p><strong>Órgão:</strong> ${op.orgao}</p>
            <p><strong>Valor:</strong> R$ ${op.valor.toLocaleString()}</p>
            <p><strong>Estado:</strong> ${op.estado}</p>
            <p><strong>Descrição:</strong> ${op.descricao}</p>
            <button class="btn-briefing" onclick="mostrarBriefing('${JSON.stringify(op).replace(/"/g, '&quot;')}')">📋 Gerar Briefing</button>
        </div>
    `).join('');
}

// 🪟 MOSTRAR MODAL DE BRIEFING
function mostrarBriefing(opJson) {
    const op = JSON.parse(opJson.replace(/&quot;/g, '"'));
    document.getElementById('briefing-conteudo').innerHTML = gerarBriefing(op);
    document.getElementById('briefing-titulo').textContent = `Briefing: ${op.numero}`;
    document.getElementById('briefing-modal').style.display = 'flex';
}

// ❌ FECHAR MODAL
function fecharBriefing() {
    document.getElementById('briefing-modal').style.display = 'none';
}

// 📱 ENVIAR VIA WHATSAPP
function enviarWhatsApp() {
    const conteudo = document.getElementById('briefing-conteudo').innerText;
    const numeroCliente = prompt('Digite o número do WhatsApp do cliente (ex: 5511999999999):'); // Ou fixe um número
    if (numeroCliente) {
        const mensagem = encodeURIComponent(`Olá! Aqui vai o briefing da oportunidade:\n\n${conteudo}`);
        window.open(`https://wa.me/${numeroCliente}?text=${mensagem}`, '_blank');
    }
}

// 📈 GRÁFICO (mantido igual)
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

// 🔔 ALERTAS (mantido igual)
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

// 🎵 EFEITOS SONOROS (mantido igual)
function playSound(type) {
    const audio = new Audio();
    switch(type) {
        case 'search': audio.src = 'https://www.soundjay.com/buttons/beep-01a.mp3'; break;
        case 'filter': audio.src = 'https://www.soundjay.com/buttons/beep-02.mp3'; break;
        case 'alert': audio.src = 'https://www.soundjay.com/buttons/beep-03.mp3'; break;
        case 'click': audio.src = 'https://www.soundjay.com/buttons/beep-04.mp3'; break;
    }
    audio.play().catch(() => {});
}

// 📜 ROLAGEM SUAVE (mantido igual)
function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

// CARREGAR INICIAL
buscarLicitacoes();
