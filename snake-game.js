// Engine do Jogo Snake
class SnakeGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Configurações do jogo
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        // Estado do jogo
        this.snake = [
            { x: 10, y: 10 }
        ];
        this.food = {};
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameStartTime = null;
        this.survivalTime = 0;
        
        // Callbacks
        this.onGameOver = null;
        this.onScoreChange = null;
        this.onTimeUpdate = null;
        
        // Cores
        this.colors = {
            snake: '#00ff88',
            food: '#ff4757',
            background: '#1a1a1a',
            grid: '#2d2d2d'
        };
        
        this.generateFood();
        this.setupControls();
        this.gameLoop = this.gameLoop.bind(this);
    }
    
    // Configurar controles
    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning || this.gamePaused) return;
            
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    if (this.dy !== 1) {
                        this.dx = 0;
                        this.dy = -1;
                    }
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (this.dy !== -1) {
                        this.dx = 0;
                        this.dy = 1;
                    }
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (this.dx !== 1) {
                        this.dx = -1;
                        this.dy = 0;
                    }
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (this.dx !== -1) {
                        this.dx = 1;
                        this.dy = 0;
                    }
                    break;
                case ' ':
                    this.togglePause();
                    break;
            }
            e.preventDefault();
        });
    }
    
    // Gerar comida
    generateFood() {
        this.food = {
            x: Math.floor(Math.random() * this.tileCount),
            y: Math.floor(Math.random() * this.tileCount)
        };
        
        // Verificar se a comida não está na cobra
        for (let segment of this.snake) {
            if (segment.x === this.food.x && segment.y === this.food.y) {
                this.generateFood();
                return;
            }
        }
    }
    
    // Iniciar jogo
    startGame() {
        this.snake = [{ x: 10, y: 10 }];
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameStartTime = Date.now();
        this.survivalTime = 0;
        
        this.generateFood();
        this.draw();
        this.gameLoop();
        
        if (this.onScoreChange) {
            this.onScoreChange(this.score);
        }
    }
    
    // Pausar/Despausar jogo
    togglePause() {
        this.gamePaused = !this.gamePaused;
        if (!this.gamePaused) {
            this.gameLoop();
        }
    }
    
    // Parar jogo
    stopGame() {
        this.gameRunning = false;
        this.gamePaused = false;
    }
    
    // Loop principal do jogo
    gameLoop() {
        if (!this.gameRunning || this.gamePaused) return;
        
        setTimeout(() => {
            this.clearCanvas();
            this.moveSnake();
            this.drawFood();
            this.drawSnake();
            this.updateTime();
            
            if (this.gameRunning) {
                this.gameLoop();
            }
        }, 150); // Velocidade do jogo
    }
    
    // Limpar canvas
    clearCanvas() {
        // Fundo
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Grid
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
    }
    
    // Mover cobra
    moveSnake() {
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
        
        // Verificar colisão com paredes
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.endGame();
            return;
        }
        
        // Verificar colisão com o próprio corpo
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.endGame();
                return;
            }
        }
        
        this.snake.unshift(head);
        
        // Verificar se comeu a comida
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.generateFood();
            this.createParticleEffect(head.x * this.gridSize, head.y * this.gridSize);
            
            if (this.onScoreChange) {
                this.onScoreChange(this.score);
            }
        } else {
            this.snake.pop();
        }
    }
    
    // Desenhar cobra
    drawSnake() {
        this.ctx.fillStyle = this.colors.snake;
        
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            // Cabeça da cobra com efeito especial
            if (i === 0) {
                this.ctx.fillStyle = this.colors.snake;
                this.ctx.shadowColor = this.colors.snake;
                this.ctx.shadowBlur = 10;
                this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
                this.ctx.shadowBlur = 0;
                
                // Olhos da cobra
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(x + 6, y + 6, 3, 3);
                this.ctx.fillRect(x + 11, y + 6, 3, 3);
            } else {
                // Corpo da cobra
                const alpha = 1 - (i * 0.1);
                this.ctx.fillStyle = this.colors.snake + Math.floor(alpha * 255).toString(16).padStart(2, '0');
                this.ctx.fillRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2);
            }
        }
    }
    
    // Desenhar comida
    drawFood() {
        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;
        
        // Efeito pulsante na comida
        const pulse = Math.sin(Date.now() * 0.005) * 0.2 + 0.8;
        const size = this.gridSize * pulse;
        const offset = (this.gridSize - size) / 2;
        
        this.ctx.fillStyle = this.colors.food;
        this.ctx.shadowColor = this.colors.food;
        this.ctx.shadowBlur = 15;
        this.ctx.fillRect(x + offset, y + offset, size, size);
        this.ctx.shadowBlur = 0;
    }
    
    // Atualizar tempo de sobrevivência
    updateTime() {
        if (this.gameStartTime) {
            this.survivalTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
            
            if (this.onTimeUpdate) {
                this.onTimeUpdate(this.survivalTime);
            }
        }
    }
    
    // Finalizar jogo
    endGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        
        // Efeito visual de game over
        this.ctx.fillStyle = 'rgba(255, 71, 87, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.onGameOver) {
            this.onGameOver({
                score: this.score,
                survivalTime: this.survivalTime,
                snakeLength: this.snake.length
            });
        }
    }
    
    // Criar efeito de partículas
    createParticleEffect(x, y) {
        const particleCount = 8;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = (x + this.canvas.offsetLeft) + 'px';
            particle.style.top = (y + this.canvas.offsetTop) + 'px';
            
            const angle = (i / particleCount) * Math.PI * 2;
            const velocity = 20;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            particle.style.setProperty('--vx', vx + 'px');
            particle.style.setProperty('--vy', vy + 'px');
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1000);
        }
    }
    
    // Desenhar estado inicial
    draw() {
        this.clearCanvas();
        this.drawFood();
        this.drawSnake();
    }
    
    // Obter estatísticas do jogo
    getStats() {
        return {
            score: this.score,
            survivalTime: this.survivalTime,
            snakeLength: this.snake.length,
            isRunning: this.gameRunning,
            isPaused: this.gamePaused
        };
    }
    
    // Definir callbacks
    setCallbacks(callbacks) {
        this.onGameOver = callbacks.onGameOver || null;
        this.onScoreChange = callbacks.onScoreChange || null;
        this.onTimeUpdate = callbacks.onTimeUpdate || null;
    }
}

// Gerenciador de Partidas
class MatchManager {
    constructor() {
        this.currentMatch = null;
        this.playerGame = null;
        this.opponentStats = null;
        this.matchState = 'waiting'; // waiting, playing, finished
        this.currentRound = 1;
        this.maxRounds = 3;
        this.playerScore = 0;
        this.opponentScore = 0;
        this.roundResults = [];
        
        // Callbacks
        this.onMatchStart = null;
        this.onRoundEnd = null;
        this.onMatchEnd = null;
        this.onStateChange = null;
    }
    
    // Iniciar nova partida
    startMatch(tableValue, opponentName = 'Oponente') {
        this.currentMatch = {
            tableValue: tableValue,
            opponentName: opponentName,
            startTime: Date.now()
        };
        
        this.matchState = 'waiting';
        this.currentRound = 1;
        this.playerScore = 0;
        this.opponentScore = 0;
        this.roundResults = [];
        
        // Simular encontrar oponente
        setTimeout(() => {
            this.matchState = 'playing';
            this.startRound();
            
            if (this.onMatchStart) {
                this.onMatchStart(this.currentMatch);
            }
            
            if (this.onStateChange) {
                this.onStateChange(this.matchState);
            }
        }, 2000);
    }
    
    // Iniciar rodada
    startRound() {
        if (!this.playerGame) return;
        
        // Resetar jogo do jogador
        this.playerGame.startGame();
        
        // Simular jogo do oponente
        this.simulateOpponentGame();
        
        if (this.onStateChange) {
            this.onStateChange('round_playing');
        }
    }
    
    // Simular jogo do oponente
    simulateOpponentGame() {
        // Gerar estatísticas aleatórias para o oponente
        const baseTime = 15 + Math.random() * 45; // 15-60 segundos
        const difficulty = Math.random();
        
        this.opponentStats = {
            survivalTime: Math.floor(baseTime * (0.8 + difficulty * 0.4)),
            score: Math.floor(baseTime * 2 * (0.8 + difficulty * 0.4))
        };
    }
    
    // Finalizar rodada
    endRound(playerStats) {
        const playerTime = playerStats.survivalTime;
        const opponentTime = this.opponentStats.survivalTime;
        
        let result;
        if (playerTime > opponentTime) {
            result = 'win';
            this.playerScore++;
        } else if (playerTime < opponentTime) {
            result = 'lose';
            this.opponentScore++;
        } else {
            result = 'draw';
        }
        
        this.roundResults.push({
            round: this.currentRound,
            result: result,
            playerTime: playerTime,
            opponentTime: opponentTime,
            playerScore: playerStats.score,
            opponentScore: this.opponentStats.score
        });
        
        if (this.onRoundEnd) {
            this.onRoundEnd({
                round: this.currentRound,
                result: result,
                playerStats: playerStats,
                opponentStats: this.opponentStats
            });
        }
        
        // Verificar se a partida acabou
        if (this.currentRound >= this.maxRounds || this.playerScore >= 2 || this.opponentScore >= 2) {
            this.endMatch();
        } else {
            this.currentRound++;
            setTimeout(() => {
                this.startRound();
            }, 3000); // Pausa entre rodadas
        }
    }
    
    // Finalizar partida
    endMatch() {
        this.matchState = 'finished';
        
        const matchResult = {
            winner: this.playerScore > this.opponentScore ? 'player' : 'opponent',
            playerScore: this.playerScore,
            opponentScore: this.opponentScore,
            rounds: this.roundResults,
            tableValue: this.currentMatch.tableValue,
            duration: Date.now() - this.currentMatch.startTime
        };
        
        if (this.onMatchEnd) {
            this.onMatchEnd(matchResult);
        }
        
        if (this.onStateChange) {
            this.onStateChange(this.matchState);
        }
    }
    
    // Abandonar partida
    leaveMatch() {
        if (this.playerGame) {
            this.playerGame.stopGame();
        }
        
        this.matchState = 'abandoned';
        this.currentMatch = null;
        
        if (this.onStateChange) {
            this.onStateChange(this.matchState);
        }
    }
    
    // Definir jogo do jogador
    setPlayerGame(game) {
        this.playerGame = game;
        
        // Configurar callback para quando o jogo do jogador terminar
        this.playerGame.setCallbacks({
            onGameOver: (stats) => {
                if (this.matchState === 'playing') {
                    this.endRound(stats);
                }
            },
            onScoreChange: (score) => {
                // Atualizar UI se necessário
            },
            onTimeUpdate: (time) => {
                // Atualizar UI se necessário
            }
        });
    }
    
    // Obter estado atual da partida
    getMatchState() {
        return {
            match: this.currentMatch,
            state: this.matchState,
            currentRound: this.currentRound,
            playerScore: this.playerScore,
            opponentScore: this.opponentScore,
            roundResults: this.roundResults
        };
    }
    
    // Definir callbacks
    setCallbacks(callbacks) {
        this.onMatchStart = callbacks.onMatchStart || null;
        this.onRoundEnd = callbacks.onRoundEnd || null;
        this.onMatchEnd = callbacks.onMatchEnd || null;
        this.onStateChange = callbacks.onStateChange || null;
    }
}

// Exportar classes para uso global
window.SnakeGame = SnakeGame;
window.MatchManager = MatchManager;

