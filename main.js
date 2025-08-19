// JavaScript principal da plataforma Snake Battle
class SnakePlatform {
    constructor() {
        this.currentUser = null;
        this.snakeGame = null;
        this.matchManager = null;
        this.isInGame = false;
        
        this.init();
    }
    
    // Inicializar plataforma
    init() {
        this.setupEventListeners();
        this.loadUserData();
        this.updateUI();
        this.startWinnersAnimation();
        this.setupTableFilters();
        this.setupRankingTabs();
        this.setupModals();
    }
    
    // Configurar event listeners
    setupEventListeners() {
        // Navegação
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToSection(link.getAttribute('href'));
            });
        });
        
        // Botões de login/registro
        document.getElementById('login-btn').addEventListener('click', () => {
            this.showModal('login-modal');
        });
        
        document.getElementById('register-btn').addEventListener('click', () => {
            this.showModal('register-modal');
        });
        
        // Partida rápida
        document.getElementById('quick-match-btn').addEventListener('click', () => {
            this.startQuickMatch();
        });
        
        // Botões das mesas
        document.querySelectorAll('.btn-join-table').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tableCard = e.target.closest('.table-card');
                const tableValue = tableCard.getAttribute('data-value');
                this.joinTable(parseFloat(tableValue));
            });
        });
        
        // Botões de assistir
        document.querySelectorAll('.btn-watch-game').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showNotification('Funcionalidade de assistir partidas em desenvolvimento!', 'info');
            });
        });
        
        // Sair do jogo
        document.getElementById('leave-game').addEventListener('click', () => {
            this.leaveGame();
        });
        
        // Menu mobile
        document.getElementById('mobile-menu').addEventListener('click', () => {
            this.toggleMobileMenu();
        });
        
        // Scroll suave
        document.addEventListener('scroll', () => {
            this.handleScroll();
        });
    }
    
    // Configurar filtros das mesas
    setupTableFilters() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remover classe active de todos os botões
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                
                // Adicionar classe active ao botão clicado
                e.target.classList.add('active');
                
                // Filtrar mesas
                const filter = e.target.getAttribute('data-filter');
                this.filterTables(filter);
            });
        });
    }
    
    // Filtrar mesas
    filterTables(filter) {
        const tables = document.querySelectorAll('.table-card');
        
        tables.forEach(table => {
            const status = table.getAttribute('data-status');
            
            if (filter === 'all' || status === filter) {
                table.style.display = 'block';
            } else {
                table.style.display = 'none';
            }
        });
    }
    
    // Configurar abas do ranking
    setupRankingTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remover classe active de todas as abas
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                
                // Adicionar classe active à aba clicada
                e.target.classList.add('active');
                
                // Mostrar conteúdo correspondente
                const tab = e.target.getAttribute('data-tab');
                this.showRankingTab(tab);
            });
        });
    }
    
    // Mostrar aba do ranking
    showRankingTab(tab) {
        // Por enquanto, apenas uma aba está implementada
        // Em uma implementação completa, haveria diferentes rankings
        this.showNotification(`Ranking de ${tab} selecionado!`, 'info');
    }
    
    // Configurar modais
    setupModals() {
        // Fechar modais
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.hideModal(modal.id);
            });
        });
        
        // Fechar modal clicando fora
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });
        
        // Alternar entre login e registro
        document.getElementById('show-register').addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal('login-modal');
            this.showModal('register-modal');
        });
        
        document.getElementById('show-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal('register-modal');
            this.showModal('login-modal');
        });
        
        // Formulários
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });
    }
    
    // Carregar dados do usuário
    loadUserData() {
        if (window.userSystem && window.userSystem.isLoggedIn()) {
            this.currentUser = window.userSystem.getCurrentUser();
        }
    }
    
    // Salvar dados do usuário
    saveUserData() {
        // Os dados são salvos automaticamente pelo userSystem
    }
    
    // Atualizar interface
    updateUI() {
        if (this.currentUser) {
            // Usuário logado
            document.getElementById('user-balance').textContent = `R$ ${this.currentUser.balance.toFixed(2)}`;
            document.getElementById('login-btn').style.display = 'none';
            document.getElementById('register-btn').style.display = 'none';
            
            // Mostrar informações do usuário
            const userInfo = document.createElement('div');
            userInfo.className = 'user-info';
            userInfo.innerHTML = `
                <span class="username">${this.currentUser.username}</span>
                <button class="btn-logout" onclick="platform.logout()">Sair</button>
            `;
            
            const headerActions = document.querySelector('.header-actions');
            if (!headerActions.querySelector('.user-info')) {
                headerActions.appendChild(userInfo);
            }
        } else {
            // Usuário não logado
            document.getElementById('user-balance').textContent = 'R$ 0,00';
            document.getElementById('login-btn').style.display = 'block';
            document.getElementById('register-btn').style.display = 'block';
            
            // Remover informações do usuário
            const userInfo = document.querySelector('.user-info');
            if (userInfo) {
                userInfo.remove();
            }
        }
    }
    
    // Navegação
    navigateToSection(sectionId) {
        const section = document.querySelector(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
            
            // Atualizar navegação ativa
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            
            document.querySelector(`[href="${sectionId}"]`).classList.add('active');
        }
    }
    
    // Animação dos vencedores
    startWinnersAnimation() {
        const winnersScroll = document.querySelector('.winners-scroll');
        if (winnersScroll) {
            // Duplicar itens para animação contínua
            const items = winnersScroll.innerHTML;
            winnersScroll.innerHTML = items + items;
        }
    }
    
    // Mostrar modal
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Esconder modal
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }
    
    // Login
    handleLogin() {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        if (!username || !password) {
            this.showNotification('Preencha todos os campos!', 'error');
            return;
        }
        
        const result = window.userSystem.login(username, password);
        
        if (result.error) {
            this.showNotification(result.error, 'error');
            return;
        }
        
        this.currentUser = result.user;
        this.updateUI();
        this.hideModal('login-modal');
        this.showNotification(`Bem-vindo, ${this.currentUser.username}!`, 'success');
    }
    
    // Registro
    handleRegister() {
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        
        if (!username || !email || !password) {
            this.showNotification('Preencha todos os campos!', 'error');
            return;
        }
        
        const result = window.userSystem.createUser(username, email, password);
        
        if (result.error) {
            this.showNotification(result.error, 'error');
            return;
        }
        
        // Fazer login automaticamente
        const loginResult = window.userSystem.login(username, password);
        if (loginResult.success) {
            this.currentUser = loginResult.user;
            this.updateUI();
            this.hideModal('register-modal');
            this.showNotification(`Conta criada com sucesso! Bem-vindo, ${username}!`, 'success');
        }
    }
    
    // Logout
    logout() {
        window.userSystem.logout();
        this.currentUser = null;
        this.updateUI();
        this.showNotification('Logout realizado com sucesso!', 'info');
        
        if (this.isInGame) {
            this.leaveGame();
        }
    }
    
    // Partida rápida
    startQuickMatch() {
        if (!this.currentUser) {
            this.showModal('login-modal');
            this.showNotification('Faça login para jogar!', 'warning');
            return;
        }
        
        // Selecionar mesa aleatória
        const tableValues = [5, 10, 15, 20];
        const randomValue = tableValues[Math.floor(Math.random() * tableValues.length)];
        this.joinTable(randomValue);
    }
    
    // Entrar em mesa
    joinTable(tableValue) {
        if (!this.currentUser) {
            this.showModal('login-modal');
            this.showNotification('Faça login para jogar!', 'warning');
            return;
        }
        
        if (this.currentUser.balance < tableValue) {
            this.showNotification('Saldo insuficiente!', 'error');
            return;
        }
        
        // Debitar valor da mesa
        this.currentUser.balance -= tableValue;
        this.saveUserData();
        this.updateUI();
        
        // Iniciar jogo
        this.startGame(tableValue);
    }
    
    // Iniciar jogo
    startGame(tableValue) {
        this.isInGame = true;
        
        // Mostrar área de jogo
        document.getElementById('game-area').classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Atualizar informações da mesa
        document.getElementById('game-table-value').textContent = tableValue.toFixed(2);
        
        // Inicializar jogo Snake
        this.snakeGame = new SnakeGame('snake-canvas');
        
        // Inicializar gerenciador de partidas
        this.matchManager = new MatchManager();
        this.matchManager.setPlayerGame(this.snakeGame);
        
        // Configurar callbacks
        this.matchManager.setCallbacks({
            onMatchStart: (match) => {
                this.hideGameOverlay();
                this.showNotification('Partida iniciada! Boa sorte!', 'success');
            },
            onRoundEnd: (result) => {
                this.handleRoundEnd(result);
            },
            onMatchEnd: (result) => {
                this.handleMatchEnd(result, tableValue);
            },
            onStateChange: (state) => {
                this.updateGameState(state);
            }
        });
        
        // Configurar callbacks do jogo
        this.snakeGame.setCallbacks({
            onTimeUpdate: (time) => {
                this.updateSurvivalTimer(time);
            }
        });
        
        // Iniciar partida
        this.matchManager.startMatch(tableValue);
        
        // Mostrar overlay de aguardando
        this.showGameOverlay('Procurando Oponente...', 'Aguarde enquanto encontramos outro jogador');
    }
    
    // Sair do jogo
    leaveGame() {
        if (this.matchManager) {
            this.matchManager.leaveMatch();
        }
        
        if (this.snakeGame) {
            this.snakeGame.stopGame();
        }
        
        this.isInGame = false;
        document.getElementById('game-area').classList.remove('active');
        document.body.style.overflow = 'auto';
        
        this.showNotification('Você saiu da partida', 'info');
    }
    
    // Mostrar overlay do jogo
    showGameOverlay(title, message) {
        const overlay = document.getElementById('game-overlay');
        const titleEl = document.getElementById('overlay-title');
        const messageEl = document.getElementById('overlay-message');
        
        titleEl.textContent = title;
        messageEl.textContent = message;
        overlay.classList.remove('hidden');
    }
    
    // Esconder overlay do jogo
    hideGameOverlay() {
        const overlay = document.getElementById('game-overlay');
        overlay.classList.add('hidden');
    }
    
    // Atualizar estado do jogo
    updateGameState(state) {
        const canvas = document.getElementById('snake-canvas');
        
        // Remover classes de estado anteriores
        canvas.classList.remove('game-state-waiting', 'game-state-playing', 'game-state-finished');
        
        switch(state) {
            case 'waiting':
                canvas.classList.add('game-state-waiting');
                break;
            case 'playing':
            case 'round_playing':
                canvas.classList.add('game-state-playing');
                break;
            case 'finished':
                canvas.classList.add('game-state-finished');
                break;
        }
    }
    
    // Atualizar timer de sobrevivência
    updateSurvivalTimer(time) {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        const timerDisplay = document.getElementById('survival-timer');
        
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Lidar com fim de rodada
    handleRoundEnd(result) {
        const roundResultEl = document.getElementById(`round-${result.round}-result`);
        const resultSpan = roundResultEl.querySelector('.result');
        
        resultSpan.textContent = result.result === 'win' ? 'Vitória' : 
                                 result.result === 'lose' ? 'Derrota' : 'Empate';
        resultSpan.className = `result ${result.result}`;
        
        // Atualizar placar
        const matchState = this.matchManager.getMatchState();
        document.getElementById('player1-score').textContent = matchState.playerScore;
        document.getElementById('player2-score').textContent = matchState.opponentScore;
        
        // Mostrar resultado da rodada
        const message = result.result === 'win' ? 
            `Você venceu a rodada ${result.round}! Tempo: ${result.playerStats.survivalTime}s` :
            `Você perdeu a rodada ${result.round}. Tempo: ${result.playerStats.survivalTime}s`;
        
        this.showNotification(message, result.result === 'win' ? 'success' : 'error');
        
        // Mostrar overlay para próxima rodada
        if (result.round < 3) {
            this.showGameOverlay(`Rodada ${result.round + 1}`, 'Prepare-se para a próxima rodada!');
        }
    }
    
    // Lidar com fim de partida
    handleMatchEnd(result, tableValue) {
        const isWinner = result.winner === 'player';
        const prize = isWinner ? tableValue * 2 : 0;
        
        const gameStats = {
            tableValue: tableValue,
            survivalTime: result.rounds[result.rounds.length - 1]?.playerTime || 0,
            opponent: 'Oponente'
        };
        
        if (isWinner) {
            window.userSystem.addVictory(this.currentUser.id, prize, gameStats);
            window.rankingSystem.addPlayerVictory(this.currentUser.username, prize);
            
            this.showGameOverlay('VITÓRIA!', `Você ganhou R$ ${prize.toFixed(2)}!`);
            this.showNotification(`Parabéns! Você ganhou R$ ${prize.toFixed(2)}!`, 'success');
            
            // Efeito visual de vitória
            this.createVictoryEffect();
        } else {
            window.userSystem.addLoss(this.currentUser.id, tableValue, gameStats);
            
            this.showGameOverlay('DERROTA', 'Mais sorte na próxima vez!');
            this.showNotification('Você perdeu a partida. Tente novamente!', 'error');
        }
        
        // Atualizar dados do usuário atual
        this.currentUser = window.userSystem.getCurrentUser();
        this.updateUI();
        
        // Voltar ao menu após 5 segundos
        setTimeout(() => {
            this.leaveGame();
        }, 5000);
    }
    
    // Criar efeito de vitória
    createVictoryEffect() {
        const effect = document.createElement('div');
        effect.className = 'victory-effect';
        effect.textContent = 'VITÓRIA!';
        
        const gameContainer = document.querySelector('.game-canvas-container');
        gameContainer.appendChild(effect);
        
        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        }, 2000);
    }
    
    // Menu mobile
    toggleMobileMenu() {
        const nav = document.querySelector('.nav');
        nav.classList.toggle('mobile-active');
    }
    
    // Lidar com scroll
    handleScroll() {
        const header = document.querySelector('.header');
        
        if (window.scrollY > 100) {
            header.style.background = 'rgba(26, 26, 26, 0.98)';
        } else {
            header.style.background = 'rgba(26, 26, 26, 0.95)';
        }
    }
    
    // Mostrar notificação
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <p>${message}</p>
            </div>
        `;
        
        const container = document.getElementById('notifications');
        container.appendChild(notification);
        
        // Remover após 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
}

// Inicializar plataforma quando a página carregar
let platform;

document.addEventListener('DOMContentLoaded', () => {
    platform = new SnakePlatform();
});

// Funções globais para acesso via HTML
window.platform = platform;

