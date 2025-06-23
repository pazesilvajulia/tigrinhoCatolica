document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos do DOM ---
    const wheel = document.getElementById('wheel');
    const spinButton = document.getElementById('spin-button');
    const messageArea = document.getElementById('message-area');
    const totalPotDisplay = document.getElementById('total-pot');
    const addPlayerButton = document.getElementById('add-player-button');
    const playerNameInput = document.getElementById('player-name');
    const playerBetInput = document.getElementById('player-bet');
    const playerList = document.getElementById('player-list');

    // --- Estado do Jogo ---
    let isSpinning = false;
    let currentRotation = 0;
    let players = [];
    let totalPot = 0;
    const availableColors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
    let assignedColors = [];



    // --- Funções do Jogo ---
    
     //Adiciona um jogador à rodada atual
     
    function addPlayer() {
        if (isSpinning) {
            showMessage('Aguarde a rodada atual terminar.', 'error');
            return;
        }

        const name = playerNameInput.value.trim();
        const bet = parseFloat(playerBetInput.value);

        // Validações
        if (!name || isNaN(bet) || bet <= 0) {
            showMessage('Por favor, insira um nome e uma aposta válida.', 'error');
            return;
        }
        if (availableColors.length === assignedColors.length) {
            showMessage('Número máximo de jogadores atingido para esta rodada.', 'error');
            return;
        }

        // Atribui uma cor disponível
        const color = availableColors[assignedColors.length];

        // Cria o objeto do jogador e adiciona ao array
        const newPlayer = { name, bet, color };
        players.push(newPlayer);
        assignedColors.push(color);

        // Atualiza o estado do jogo
        totalPot += bet;
        updateUI();

        // Limpa os campos de entrada
        playerNameInput.value = '';
        playerBetInput.value = '';
        playerNameInput.focus();
    }

    
     //Atualiza a interface (lista de jogadores, pot, roleta)
     
    function updateUI() {
        // Atualiza o valor do prêmio
        totalPotDisplay.textContent = `R$ ${totalPot.toFixed(2)}`;

        // Atualiza a lista de jogadores
        playerList.innerHTML = '';
        players.forEach(player => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span class="color-dot ${player.color}"></span>
                ${player.name} - R$ ${player.bet.toFixed(2)}
            `;
            playerList.appendChild(listItem);
        });

        // Atualiza a roleta visualmente com as cores dos jogadores
        updateWheelVisuals();
    }

    
     // Gera o gradiente cônico da roleta com base nos jogadores atuais
     
    function updateWheelVisuals() {
        if (players.length === 0) {
            wheel.style.background = '#333';
            return;
        }

        const sliceAngle = 360 / players.length;
        let gradientString = 'conic-gradient(';

        players.forEach((player, index) => {
            const startAngle = index * sliceAngle;
            const endAngle = (index + 1) * sliceAngle;
            const colorVar = `var(--${player.color}-color)`;
            gradientString += `${colorVar} ${startAngle}deg ${endAngle}deg`;
            if (index < players.length - 1) {
                gradientString += ', ';
            }
        });

        gradientString += ')';
        wheel.style.background = gradientString;
    }

    
     //Gira a roleta para determinar o vencedor
     
    function spinWheel() {
        if (isSpinning) return;
        if (players.length < 2) {
            showMessage('São necessários pelo menos 2 jogadores para girar.', 'error');
            return;
        }

        isSpinning = true;
        spinButton.disabled = true;
        addPlayerButton.disabled = true;
        showMessage('Girando...', '');

        // Determina o vencedor aleatoriamente
        const winnerIndex = Math.floor(Math.random() * players.length);
        const winner = players[winnerIndex];

        // Calcula o ângulo para a roleta parar no vencedor
        const sliceAngle = 360 / players.length;
        const targetAngle = (winnerIndex * sliceAngle) + (sliceAngle / 2); // Centro da fatia
        const randomOffset = Math.random() * (sliceAngle * 0.8) - (sliceAngle * 0.4); // Pequeno desvio
        
        const finalRotation = (5 * 360) + (360 - targetAngle) + randomOffset;
        currentRotation += finalRotation;

        wheel.style.transform = `rotate(${currentRotation}deg)`;

        // Aguarda a animação terminar para anunciar o resultado
        setTimeout(() => {
            showMessage(`${winner.name} ganhou R$ ${totalPot.toFixed(2)}!`, 'win');
            resetRound();
        }, 5100); // Um pouco mais que a duração da animação CSS
    }
    
    
     //Mostra uma mensagem na área designada
    function showMessage(msg, type) {
        messageArea.textContent = msg;
        messageArea.className = 'message-area'; // Reseta
        if (type) {
            messageArea.classList.add(type);
        }
    }

    
     //Reseta o jogo para uma nova rodada
     
    function resetRound() {
        isSpinning = false;
        players = [];
        totalPot = 0;
        assignedColors = [];
        
        spinButton.disabled = false;
        addPlayerButton.disabled = false;
        
        updateUI(); // Limpa a UI
    }

    // --- Event Listeners ---
    addPlayerButton.addEventListener('click', addPlayer);
    spinButton.addEventListener('click', spinWheel);

    // Permite adicionar jogador com a tecla "Enter"
    playerBetInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            addPlayer();
        }
    });

    // Inicia a UI
    updateUI();
});