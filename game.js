// ⚡ CYBER SNAKE GAME - CORE LOGIC ⚡

class CyberSnakeGame {
    constructor() {
        // Game Elements
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game State
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameOver = false;
        
        // Game Settings
        this.gridSize = 20;
        this.snakeSpeed = 10; // FPS
        this.lastRenderTime = 0;
        
        // Snake
        this.snake = [
            {x: 10, y: 10}, // Head
            {x: 9, y: 10},  // Body segment 1
            {x: 8, y: 10}   // Body segment 2
        ];
        this.direction = {x: 1, y: 0}; // Moving right
        this.nextDirection = {x: 1, y: 0};
        
        // Food
        this.food = {x: 15, y: 10};
        
        // Score
        this.score = 0;
        this.highScore = localStorage.getItem('cyberSnakeHighScore') || 0;
        this.level = 1;
        
        // Audio
        this.audio = null;
        this.audioEnabled = true;
        
        // Effects
        this.effects = null;
        this.effectsEnabled = true;
        
        // Initialize
        this.init();
    }
    
    init() {
        // Set canvas dimensions
        this.canvas.width = 600;
        this.canvas.height = 400;
        
        // Load high score
        this.updateHighScoreDisplay();
        
        // Initialize audio
        this.initAudio();
        
        // Initialize effects
        this.initEffects();
        
        // Event Listeners
        this.setupEventListeners();
        
        // Start game loop
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    initAudio() {
        try {
            this.audio = new CyberAudio();
            this.audioEnabled = true;
        } catch (error) {
            console.warn('Audio initialization failed:', error);
            this.audioEnabled = false;
        }
    }
    
    initEffects() {
        try {
            this.effects = new CyberEffects(this.canvas);
            this.effectsEnabled = true;
        } catch (error) {
            console.warn('Effects initialization failed:', error);
            this.effectsEnabled = false;
        }
    }
    
    setupEventListeners() {
        // Keyboard Controls
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                    if (this.direction.y === 0) this.nextDirection = {x: 0, y: -1};
                    break;
                case 'ArrowDown':
                    if (this.direction.y === 0) this.nextDirection = {x: 0, y: 1};
                    break;
                case 'ArrowLeft':
                    if (this.direction.x === 0) this.nextDirection = {x: -1, y: 0};
                    break;
                case 'ArrowRight':
                    if (this.direction.x === 0) this.nextDirection = {x: 1, y: 0};
                    break;
                case ' ':
                    this.togglePause();
                    break;
                case 'r':
                case 'R':
                    this.restartGame();
                    break;
                case 'm':
                case 'M':
                    this.toggleMusic();
                    break;
            }
        });
        
        // Button Controls
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.restartGame();
            this.hideGameOver();
        });
        
        // Touch Controls for Mobile
        this.setupTouchControls();
    }
    
    setupTouchControls() {
        let touchStartX = 0;
        let touchStartY = 0;
        
        this.canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            e.preventDefault();
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;
            
            // Determine swipe direction
            if (Math.abs(dx) > Math.abs(dy)) {
                // Horizontal swipe
                if (dx > 0 && this.direction.x === 0) {
                    this.nextDirection = {x: 1, y: 0}; // Right
                } else if (dx < 0 && this.direction.x === 0) {
                    this.nextDirection = {x: -1, y: 0}; // Left
                }
            } else {
                // Vertical swipe
                if (dy > 0 && this.direction.y === 0) {
                    this.nextDirection = {x: 0, y: 1}; // Down
                } else if (dy < 0 && this.direction.y === 0) {
                    this.nextDirection = {x: 0, y: -1}; // Up
                }
            }
            
            e.preventDefault();
        });
    }
    
    gameLoop(currentTime) {
        // Calculate time since last render
        const secondsSinceLastRender = (currentTime - this.lastRenderTime) / 1000;
        
        // Run game update at specified FPS
        if (secondsSinceLastRender >= 1 / this.snakeSpeed) {
            this.lastRenderTime = currentTime;
            
            if (this.gameRunning && !this.gamePaused && !this.gameOver) {
                this.update();
            }
            
            this.render();
        }
        
        // Continue game loop
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    update() {
        // Update direction
        this.direction = {...this.nextDirection};
        
        // Calculate new head position
        const head = {...this.snake[0]};
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.canvas.width / this.gridSize ||
            head.y < 0 || head.y >= this.canvas.height / this.gridSize) {
            this.gameOver = true;
            this.showGameOver();
            return;
        }
        
        // Check self collision
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.gameOver = true;
                this.showGameOver();
                return;
            }
        }
        
        // Add new head to snake
        this.snake.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            // Increase score
            this.score += 10 * this.level;
            this.updateScoreDisplay();
            
            // Play food sound
            if (this.audioEnabled && this.audio) {
                this.audio.playFoodSound();
            }
            
            // Generate new food
            this.generateFood();
            
            // Increase level every 50 points
            if (this.score % 50 === 0) {
                this.level++;
                this.snakeSpeed += 1; // Increase speed
                this.updateLevelDisplay();
                
                // Play level up sound
                if (this.audioEnabled && this.audio) {
                    this.audio.playLevelUpSound();
                }
                
                // Create level up particles
                if (this.effectsEnabled && this.effects) {
                    this.effects.createLevelUpParticles();
                }
            }
            
            // Create food particles
            if (this.effectsEnabled && this.effects) {
                const foodX = this.food.x * this.gridSize + this.gridSize / 2;
                const foodY = this.food.y * this.gridSize + this.gridSize / 2;
                this.effects.createFoodParticles(foodX, foodY, '#ff00ff');
            }
        } else {
            // Remove tail if no food eaten
            this.snake.pop();
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(5, 5, 16, 0.9)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and render effects
        if (this.effectsEnabled && this.effects) {
            this.effects.update();
            this.effects.render();
        }
        
        // Draw grid (cyberpunk style)
        this.drawGrid();
        
        // Draw snake
        this.drawSnake();
        
        // Draw food
        this.drawFood();
        
        // Draw game state text
        this.drawGameState();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(0, 243, 255, 0.1)';
        this.ctx.lineWidth = 0.5;
        
        // Vertical lines
        for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    drawSnake() {
        // Draw snake body
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            
            // Head (different color)
            if (i === 0) {
                this.ctx.fillStyle = '#00f3ff'; // Neon blue head
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = '#00f3ff';
            } else {
                // Body gradient (head to tail)
                const intensity = 1 - (i / this.snake.length) * 0.7;
                this.ctx.fillStyle = `rgba(0, 102, 255, ${intensity})`; // Cyber blue
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = '#0066ff';
            }
            
            // Draw segment with rounded corners
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            const radius = this.gridSize / 2;
            
            this.ctx.beginPath();
            this.ctx.roundRect(x, y, this.gridSize, this.gridSize, radius);
            this.ctx.fill();
            
            // Reset shadow
            this.ctx.shadowBlur = 0;
        }
    }
    
    drawFood() {
        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;
        
        // Glowing apple effect
        this.ctx.fillStyle = '#ff00ff'; // Hot pink
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#ff00ff';
        
        // Draw apple shape
        this.ctx.beginPath();
        this.ctx.arc(x + this.gridSize/2, y + this.gridSize/2, this.gridSize/2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Apple stem
        this.ctx.fillStyle = '#00ff41'; // Matrix green
        this.ctx.fillRect(x + this.gridSize/2 - 1, y - 3, 2, 5);
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
    }
    
    drawGameState() {
        if (!this.gameRunning) {
            this.ctx.fillStyle = 'rgba(0, 243, 255, 0.8)';
            this.ctx.font = '30px Orbitron';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PRESS START', this.canvas.width/2, this.canvas.height/2);
        }
        
        if (this.gamePaused) {
            this.ctx.fillStyle = 'rgba(255, 0, 255, 0.8)';
            this.ctx.font = '30px Orbitron';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width/2, this.canvas.height/2);
        }
    }
    
    generateFood() {
        let newFood;
        let foodOnSnake;
        
        do {
            foodOnSnake = false;
            newFood = {
                x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)),
                y: Math.floor(Math.random() * (this.canvas.height / this.gridSize))
            };
            
            // Check if food is on snake
            for (let segment of this.snake) {
                if (segment.x === newFood.x && segment.y === newFood.y) {
                    foodOnSnake = true;
                    break;
                }
            }
        } while (foodOnSnake);
        
        this.food = newFood;
    }
    
    startGame() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.gamePaused = false;
            this.gameOver = false;
            document.getElementById('startBtn').innerHTML = '<i class="fas fa-play"></i> GAME RUNNING';
        }
    }
    
    togglePause() {
        if (this.gameRunning && !this.gameOver) {
            this.gamePaused = !this.gamePaused;
            document.getElementById('pauseBtn').innerHTML = this.gamePaused ? 
                '<i class="fas fa-play"></i> RESUME' : 
                '<i class="fas fa-pause"></i> PAUSE';
        }
    }
    
    restartGame() {
        // Reset game state
        this.snake = [
            {x: 10, y: 10},
            {x: 9, y: 10},
            {x: 8, y: 10}
        ];
        this.direction = {x: 1, y: 0};
        this.nextDirection = {x: 1, y: 0};
        this.score = 0;
        this.level = 1;
        this.snakeSpeed = 10;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameOver = false;
        
        // Generate new food
        this.generateFood();
        
        // Update displays
        this.updateScoreDisplay();
        this.updateLevelDisplay();
        document.getElementById('startBtn').innerHTML = '<i class="fas fa-play"></i> START GAME';
        document.getElementById('pauseBtn').innerHTML = '<i class="fas fa-pause"></i> PAUSE';
        
        // Hide game over modal if shown
        this.hideGameOver();
    }
    
    toggleMusic() {
        if (this.audio) {
            this.audioEnabled = this.audio.toggle();
            return this.audioEnabled;
        }
        return false;
    }
    
    updateScoreDisplay() {
        const scoreStr = this.score.toString().padStart(4, '0');
        document.getElementById('score').textContent = scoreStr;
        
        // Update high score if needed
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('cyberSnakeHighScore', this.highScore);
            this.updateHighScoreDisplay();
        }
    }
    
    updateHighScoreDisplay() {
        const highScoreStr = this.highScore.toString().padStart(4, '0');
        document.getElementById('highScore').textContent = highScoreStr;
        document.getElementById('modalHighScore').textContent = highScoreStr;
    }
    
    updateLevelDisplay() {
        const levelStr = this.level.toString().padStart(2, '0');
        document.getElementById('level').textContent = levelStr;
    }
    
    showGameOver() {
        document.getElementById('finalScore').textContent = this.score.toString().padStart(4, '0');
        document.getElementById('finalLevel').textContent = this.level.toString().padStart(2, '0');
        document.getElementById('gameOverModal').style.display = 'flex';
        
        // Play game over sound
        if (this.audioEnabled && this.audio) {
            this.audio.playGameOverSound();
        }
    }
    
    hideGameOver() {
        document.getElementById('gameOverModal').style.display = 'none';
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    const game = new CyberSnakeGame();
    
    // Add roundedRect to CanvasRenderingContext2D if not exists
    if (!CanvasRenderingContext2D.prototype.roundRect) {
        CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
            if (width < 2 * radius) radius = width / 2;
            if (height < 2 * radius) radius = height / 2;
            this.beginPath();
            this.moveTo(x + radius, y);
            this.arcTo(x + width, y, x + width, y + height, radius);
            this.arcTo(x + width, y + height, x, y + height, radius);
            this.arcTo(x, y + height, x, y, radius);
            this.arcTo(x, y, x + width, y, radius);
            this.closePath();
            return this;
        };
    }
});