// Snake Game Implementation
let snake = [];
let food = {};
let direction = { x: 0, y: -1 };
let gameInterval;
let gameStarted = false;
let gamePaused = false;
let snakeSpeed = 150; // milliseconds
let snakeScore = 0;
let snakeHighScore = 0;

// Snake game sounds
const snakeSounds = {
    eat: new Audio('sounds/eat.mp3'),
    gameOver: new Audio('sounds/gameover.mp3')
};

// Set volume for the sounds
Object.keys(snakeSounds).forEach(sound => {
    try {
        snakeSounds[sound].volume = 0.3;
    } catch (e) {
        console.log(`Snake sound ${sound} not loaded: ${e}`);
    }
});

// Variable declarations for DOM elements
let canvas, ctx, startBtn, pauseBtn, scoreElement, highScoreElement;

// Grid settings
const gridSize = 20;
let gridWidth, gridHeight;

// Colors
const colors = {
    background: '#111111',
    snake: {
        head: '#ff3333',
        body: '#cc0000',
        outline: '#990000',
        glow: 'rgba(255, 0, 0, 0.4)'
    },
    food: {
        normal: '#ff9999',
        glow: '#ff0000',
        pulse: 'rgba(255, 0, 0, 0.6)'
    },
    grid: '#222222'
};

// Create game over modal
function createGameOverModal() {
    // Check if it already exists
    if (document.getElementById('gameOverModal')) return;
    
    const modal = document.createElement('div');
    modal.id = 'gameOverModal';
    modal.className = 'game-over-modal';
    modal.innerHTML = `
        <h2>Game Over!</h2>
        <p>Your score: <span id="finalScore">0</span></p>
        <p>High score: <span id="finalHighScore">0</span></p>
        <button id="restartBtn">Play Again</button>
    `;
    
    document.querySelector('.snake-game-area').appendChild(modal);
    
    // Add event listener to restart button
    document.getElementById('restartBtn').addEventListener('click', () => {
        modal.style.display = 'none';
        startGame();
    });
    
    // Add hover effect to restart button
    const restartBtn = document.getElementById('restartBtn');
    restartBtn.addEventListener('mouseenter', () => {
        cursorFollower.style.width = '40px';
        cursorFollower.style.height = '40px';
        cursorFollower.style.background = 'rgba(255, 0, 0, 0.8)';
    });
    
    restartBtn.addEventListener('mouseleave', () => {
        cursorFollower.style.width = '30px';
        cursorFollower.style.height = '30px';
        cursorFollower.style.background = 'rgba(255, 0, 0, 0.5)';
    });
}

// Initialize the snake game
function initSnakeGame() {
    console.log('Initializing Snake Game');
    
    // Get DOM elements after ensuring they're loaded
    canvas = document.getElementById('snakeCanvas');
    if (!canvas) {
        console.error('Snake canvas element not found');
        return;
    }
    
    ctx = canvas.getContext('2d');
    startBtn = document.getElementById('startSnakeBtn');
    pauseBtn = document.getElementById('pauseSnakeBtn');
    scoreElement = document.getElementById('snakeScore');
    highScoreElement = document.getElementById('snakeHighScore');
    
    // Calculate grid dimensions
    gridWidth = canvas.width / gridSize;
    gridHeight = canvas.height / gridSize;
    
    // Reset variables
    snake = [
        { x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) }
    ];
    direction = { x: 0, y: -1 }; // Start moving up
    gameStarted = false;
    gamePaused = false;
    snakeScore = 0;
    
    // Update snake high score from localStorage
    snakeHighScore = localStorage.getItem('snakeHighScore') || 0;
    highScoreElement.textContent = snakeHighScore;
    scoreElement.textContent = '0';
    
    // Create game over modal
    createGameOverModal();
    
    // Add event listeners to control buttons
    if (startBtn) {
        // Remove existing event listeners if any (to prevent duplicates)
        const newStartBtn = startBtn.cloneNode(true);
        startBtn.parentNode.replaceChild(newStartBtn, startBtn);
        startBtn = newStartBtn;
        
        startBtn.addEventListener('click', () => {
            console.log('Start button clicked. gameStarted:', gameStarted, 'gamePaused:', gamePaused);
            if (!gameStarted) {
                startGame();
            } else if (gamePaused) {
                resumeGame();
            } else {
                // Reset and restart if already running
                resetGame();
                startGame();
            }
        });
    } else {
        console.error('Start button not found');
    }
    
    if (pauseBtn) {
        // Remove existing event listeners
        const newPauseBtn = pauseBtn.cloneNode(true);
        pauseBtn.parentNode.replaceChild(newPauseBtn, pauseBtn);
        pauseBtn = newPauseBtn;
        
        pauseBtn.addEventListener('click', () => {
            if (gameStarted && !gamePaused) {
                pauseGame();
            }
        });
    } else {
        console.error('Pause button not found');
    }
    
    // Add keyboard controls
    document.removeEventListener('keydown', handleKeyPress); // Remove existing to prevent duplicates
    document.addEventListener('keydown', handleKeyPress);
    
    // Add hover effects to buttons
    const buttons = document.querySelectorAll('.control-btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            if (!button.disabled) {
                cursorFollower.style.width = '40px';
                cursorFollower.style.height = '40px';
                cursorFollower.style.background = 'rgba(255, 0, 0, 0.8)';
            }
        });
        
        button.addEventListener('mouseleave', () => {
            cursorFollower.style.width = '30px';
            cursorFollower.style.height = '30px';
            cursorFollower.style.background = 'rgba(255, 0, 0, 0.5)';
        });
    });
    
    // Create initial food
    createFood();
    
    // Draw the initial grid
    drawGrid();
    drawFood();
    drawSnake();
    
    // Update button states
    updateButtonStates();
    
    console.log('Snake game initialization complete');
}

// Start game
function startGame() {
    console.log('Starting snake game');
    
    // Make sure canvas and ctx are ready
    if (!canvas || !ctx) {
        console.error('Canvas not ready yet');
        // Try to reinitialize
        canvas = document.getElementById('snakeCanvas');
        if (canvas) {
            ctx = canvas.getContext('2d');
            // Recalculate grid dimensions
            gridWidth = canvas.width / gridSize;
            gridHeight = canvas.height / gridSize;
        } else {
            return; // Can't continue without canvas
        }
    }
    
    resetGame();
    gameStarted = true;
    gamePaused = false;
    updateButtonStates();
    
    // Clear any existing interval to be safe
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
    
    // Force first game frame to be drawn immediately
    gameLoop();
    
    // Then set up interval
    gameInterval = setInterval(gameLoop, snakeSpeed);
    console.log('Game interval set with speed:', snakeSpeed);
}

// Reset game
function resetGame() {
    console.log('Resetting game');
    // Reset snake
    snake = [
        { x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) }
    ];
    
    // Reset direction
    direction = { x: 0, y: -1 }; // Start moving up
    
    // Create initial food
    createFood();
    
    // Reset score
    snakeScore = 0;
    scoreElement.textContent = snakeScore;
    
    // Hide game over modal if visible
    const modal = document.getElementById('gameOverModal');
    if (modal) modal.style.display = 'none';
    
    // Clear any existing interval
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
}

// Create food at random position
function createFood() {
    let newFood;
    let validPosition = false;
    
    while (!validPosition) {
        newFood = {
            x: Math.floor(Math.random() * gridWidth),
            y: Math.floor(Math.random() * gridHeight)
        };
        
        // Check if food is not on the snake
        validPosition = !snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    }
    
    food = newFood;
}

// Game loop
function gameLoop() {
    if (gamePaused) return;
    
    // Move snake
    moveSnake();
    
    // Check collision
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    // Check if snake eats food
    if (snake[0].x === food.x && snake[0].y === food.y) {
        eatFood();
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }
    
    // Clear canvas and draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawFood();
    drawSnake();
}

// Move snake
function moveSnake() {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    snake.unshift(head);
}

// Check collision with walls or self
function checkCollision() {
    const head = snake[0];
    
    // Check wall collision
    if (
        head.x < 0 || 
        head.x >= gridWidth || 
        head.y < 0 || 
        head.y >= gridHeight
    ) {
        return true;
    }
    
    // Check self collision (skip the head)
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// Handle food eating
function eatFood() {
    // Increase score
    snakeScore += 10;
    scoreElement.textContent = snakeScore;
    
    // Update high score if needed
    if (snakeScore > snakeHighScore) {
        snakeHighScore = snakeScore;
        highScoreElement.textContent = snakeHighScore;
        localStorage.setItem('snakeHighScore', snakeHighScore);
    }
    
    // Create new food
    createFood();
    
    // Play eat sound
    try {
        snakeSounds.eat.currentTime = 0;
        snakeSounds.eat.play();
    } catch (e) {
        // Silent fail if sound doesn't work
    }
    
    // Increase speed slightly every 5 food items
    if (snakeScore % 50 === 0 && snakeSpeed > 60) {
        snakeSpeed -= 10;
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, snakeSpeed);
    }
    
    // Create eat effect
    createEatEffect();
}

// Draw snake
function drawSnake() {
    // Draw glow effect first (behind the snake)
    snake.forEach((segment, index) => {
        const x = segment.x * gridSize;
        const y = segment.y * gridSize;
        
        // Create a larger glow for the head
        const glowSize = index === 0 ? 8 : 5;
        
        // Draw glow
        ctx.beginPath();
        ctx.fillStyle = colors.snake.glow;
        ctx.shadowColor = 'red';
        ctx.shadowBlur = 15;
        ctx.arc(
            x + gridSize / 2,
            y + gridSize / 2,
            gridSize / 2 + glowSize,
            0,
            Math.PI * 2
        );
        ctx.fill();
    });
    
    // Reset shadow effect
    ctx.shadowBlur = 0;
    
    // Draw the actual snake segments
    snake.forEach((segment, index) => {
        const x = segment.x * gridSize;
        const y = segment.y * gridSize;
        
        // Different color for head
        if (index === 0) {
            ctx.fillStyle = colors.snake.head;
        } else {
            ctx.fillStyle = colors.snake.body;
        }
        
        // Draw segment with rounded corners if it's the head
        if (index === 0) {
            drawRoundedRect(
                x + 1, 
                y + 1, 
                gridSize - 2, 
                gridSize - 2, 
                5
            );
        } else {
            ctx.fillRect(x + 1, y + 1, gridSize - 2, gridSize - 2);
        }
        
        // Draw segment outline
        ctx.strokeStyle = colors.snake.outline;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 1, y + 1, gridSize - 2, gridSize - 2);
        
        // Draw eyes on head
        if (index === 0) {
            drawSnakeEyes(x, y);
        }
    });
}

// Draw rounded rectangle for snake head
function drawRoundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}

// Draw snake eyes
function drawSnakeEyes(x, y) {
    ctx.fillStyle = 'white';
    
    // Based on direction, position eyes appropriately
    let eyeX1, eyeY1, eyeX2, eyeY2;
    
    if (direction.x === 0 && direction.y === -1) {
        // Moving up
        eyeX1 = x + 5;
        eyeY1 = y + 5;
        eyeX2 = x + gridSize - 5;
        eyeY2 = y + 5;
    } else if (direction.x === 0 && direction.y === 1) {
        // Moving down
        eyeX1 = x + 5;
        eyeY1 = y + gridSize - 5;
        eyeX2 = x + gridSize - 5;
        eyeY2 = y + gridSize - 5;
    } else if (direction.x === -1 && direction.y === 0) {
        // Moving left
        eyeX1 = x + 5;
        eyeY1 = y + 5;
        eyeX2 = x + 5;
        eyeY2 = y + gridSize - 5;
    } else if (direction.x === 1 && direction.y === 0) {
        // Moving right
        eyeX1 = x + gridSize - 5;
        eyeY1 = y + 5;
        eyeX2 = x + gridSize - 5;
        eyeY2 = y + gridSize - 5;
    } else {
        // Default (should not happen)
        eyeX1 = x + 5;
        eyeY1 = y + 5;
        eyeX2 = x + gridSize - 5;
        eyeY2 = y + 5;
    }
    
    // Draw eyes
    ctx.beginPath();
    ctx.arc(eyeX1, eyeY1, 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(eyeX2, eyeY2, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw pupils (small black dot)
    ctx.fillStyle = 'black';
    
    ctx.beginPath();
    ctx.arc(eyeX1, eyeY1, 1, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(eyeX2, eyeY2, 1, 0, Math.PI * 2);
    ctx.fill();
}

// Draw food
function drawFood() {
    const x = food.x * gridSize;
    const y = food.y * gridSize;
    const size = gridSize - 6;
    
    // Create a pulsating effect for food
    const time = Date.now() / 200;
    const pulseFactor = 1 + Math.sin(time) * 0.2;
    const adjustedSize = size * pulseFactor;
    
    // Draw outer glow
    ctx.beginPath();
    ctx.arc(
        x + gridSize / 2, 
        y + gridSize / 2, 
        adjustedSize / 1.2 + 5, 
        0, 
        Math.PI * 2
    );
    
    // Create outer glow gradient
    const outerGlow = ctx.createRadialGradient(
        x + gridSize / 2, 
        y + gridSize / 2, 
        adjustedSize / 1.5,
        x + gridSize / 2, 
        y + gridSize / 2, 
        adjustedSize / 1.2 + 5
    );
    
    outerGlow.addColorStop(0, 'rgba(255, 0, 0, 0.5)');
    outerGlow.addColorStop(1, 'rgba(255, 0, 0, 0)');
    
    ctx.fillStyle = outerGlow;
    ctx.fill();
    
    // Draw food glow with shadow
    ctx.beginPath();
    ctx.shadowColor = 'red';
    ctx.shadowBlur = 15;
    ctx.arc(
        x + gridSize / 2, 
        y + gridSize / 2, 
        adjustedSize / 1.2, 
        0, 
        Math.PI * 2
    );
    
    // Create gradient
    const gradient = ctx.createRadialGradient(
        x + gridSize / 2, 
        y + gridSize / 2, 
        adjustedSize / 4,
        x + gridSize / 2, 
        y + gridSize / 2, 
        adjustedSize / 1.2
    );
    
    gradient.addColorStop(0, colors.food.normal);
    gradient.addColorStop(0.7, colors.food.glow);
    gradient.addColorStop(1, colors.food.pulse);
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
    // Draw food outline
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw food shine
    ctx.beginPath();
    ctx.arc(
        x + gridSize / 2 - adjustedSize / 6, 
        y + gridSize / 2 - adjustedSize / 6, 
        adjustedSize / 4, 
        0, 
        Math.PI * 2
    );
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();
    
    // Draw small particles around the food
    drawFoodParticles(x, y, adjustedSize);
}

// Draw particles around the food
function drawFoodParticles(x, y, size) {
    const time = Date.now() / 1000;
    const count = 3 + Math.floor(Math.sin(time) * 2); // 1-5 particles
    
    for (let i = 0; i < count; i++) {
        const angle = (time * 0.5 + i * (Math.PI * 2 / count)) % (Math.PI * 2);
        const distance = size * 0.8 + Math.sin(time * 2 + i) * 5;
        
        const particleX = x + gridSize / 2 + Math.cos(angle) * distance;
        const particleY = y + gridSize / 2 + Math.sin(angle) * distance;
        const particleSize = 2 + Math.sin(time + i) * 1;
        
        ctx.beginPath();
        ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
        
        // Create gradient for particle
        const particleGradient = ctx.createRadialGradient(
            particleX, particleY, 0,
            particleX, particleY, particleSize
        );
        
        particleGradient.addColorStop(0, 'rgba(255, 150, 150, 0.9)');
        particleGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        
        ctx.fillStyle = particleGradient;
        ctx.fill();
    }
}

// Create visual effect when eating food
function createEatEffect() {
    const eatEffect = document.createElement('div');
    eatEffect.className = 'eat-effect';
    eatEffect.style.position = 'absolute';
    eatEffect.style.width = '60px';
    eatEffect.style.height = '60px';
    eatEffect.style.borderRadius = '50%';
    eatEffect.style.background = 'radial-gradient(circle, rgba(255,150,150,0.8) 0%, rgba(255,0,0,0.5) 50%, rgba(255,0,0,0) 100%)';
    eatEffect.style.pointerEvents = 'none';
    eatEffect.style.zIndex = '100';
    eatEffect.style.transform = 'translate(-50%, -50%)';
    eatEffect.style.boxShadow = '0 0 30px rgba(255, 0, 0, 0.8)';
    
    // Position at food location
    const foodPos = {
        x: food.x * gridSize + canvas.offsetLeft + gridSize / 2,
        y: food.y * gridSize + canvas.offsetTop + gridSize / 2
    };
    
    eatEffect.style.left = `${foodPos.x}px`;
    eatEffect.style.top = `${foodPos.y}px`;
    
    // Add animation
    eatEffect.style.animation = 'eatPulse 0.8s forwards';
    
    // Add to DOM
    canvas.parentNode.appendChild(eatEffect);
    
    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes eatPulse {
            0% { transform: translate(-50%, -50%) scale(0.2); opacity: 1; }
            50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.8; }
            100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Remove after animation
    setTimeout(() => {
        eatEffect.remove();
        style.remove();
    }, 800);
    
    // Create additional particle burst
    createParticleBurst(foodPos.x, foodPos.y);
}

// Create particle burst when eating food
function createParticleBurst(x, y) {
    const particleCount = 12;
    
    for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2;
        const speed = 2 + Math.random() * 3;
        const size = 3 + Math.random() * 5;
        const lifetime = 500 + Math.random() * 500;
        
        const particle = document.createElement('div');
        particle.className = 'food-particle';
        particle.style.position = 'absolute';
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.borderRadius = '50%';
        particle.style.backgroundColor = `rgba(255, ${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 50)}, 0.8)`;
        particle.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.5)';
        particle.style.zIndex = '99';
        particle.style.pointerEvents = 'none';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        
        document.body.appendChild(particle);
        
        // Animate the particle
        const dx = Math.cos(angle) * speed;
        const dy = Math.sin(angle) * speed;
        
        let particleX = x;
        let particleY = y;
        let opacity = 1;
        let particleSize = size;
        
        const animate = () => {
            if (opacity <= 0) {
                particle.remove();
                return;
            }
            
            particleX += dx;
            particleY += dy;
            opacity -= 1 / (lifetime / 16);  // 16ms per frame
            particleSize -= size / (lifetime / 16);
            
            particle.style.left = `${particleX}px`;
            particle.style.top = `${particleY}px`;
            particle.style.opacity = opacity;
            particle.style.width = `${Math.max(0, particleSize)}px`;
            particle.style.height = `${Math.max(0, particleSize)}px`;
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
}

// Game over
function gameOver() {
    clearInterval(gameInterval);
    gameStarted = false;
    gamePaused = false;
    updateButtonStates();
    
    // Play game over sound
    try {
        snakeSounds.gameOver.currentTime = 0;
        snakeSounds.gameOver.play();
    } catch (e) {
        // Silent fail if sound doesn't work
    }
    
    // Update game over modal
    const modal = document.getElementById('gameOverModal');
    document.getElementById('finalScore').textContent = snakeScore;
    document.getElementById('finalHighScore').textContent = snakeHighScore;
    modal.style.display = 'block';
}

// Handle keyboard input
function handleKeyPress(e) {
    // Only process keys if game is active
    if (!gameStarted || gamePaused) {
        // Allow space to start/resume
        if (e.key === ' ' || e.code === 'Space') {
            if (!gameStarted) {
                startGame();
            } else if (gamePaused) {
                resumeGame();
            }
        }
        return;
    }
    
    // Prevent default behavior for arrow keys (to avoid scrolling)
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
        e.preventDefault();
    }
    
    // Determine new direction based on key pressed
    // Don't allow 180 degree turns (can't go directly opposite)
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (direction.y !== 1) direction = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (direction.y !== -1) direction = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (direction.x !== 1) direction = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (direction.x !== -1) direction = { x: 1, y: 0 };
            break;
        case 'p':
        case 'P':
            // Toggle pause
            if (gamePaused) {
                resumeGame();
            } else {
                pauseGame();
            }
            break;
    }
}

// Pause game
function pauseGame() {
    gamePaused = true;
    clearInterval(gameInterval);
    updateButtonStates();
    
    // Show pause message
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '24px Arial';
    ctx.fillStyle = '#ff3333';
    ctx.textAlign = 'center';
    ctx.fillText('Game Paused', canvas.width / 2, canvas.height / 2);
    ctx.font = '16px Arial';
    ctx.fillText('Press P or Resume to continue', canvas.width / 2, canvas.height / 2 + 30);
}

// Resume game
function resumeGame() {
    gamePaused = false;
    gameInterval = setInterval(gameLoop, snakeSpeed);
    updateButtonStates();
}

// Update button states based on game state
function updateButtonStates() {
    if (!gameStarted) {
        startBtn.innerHTML = '<i class="fas fa-play"></i> Start Game';
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    } else if (gamePaused) {
        startBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    } else {
        startBtn.innerHTML = '<i class="fas fa-play"></i> Restart';
        startBtn.disabled = false;
        pauseBtn.disabled = false;
    }
}

// Draw functions
function drawGrid() {
    // Draw background
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 0.5;
    
    // Draw vertical lines
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Initialize the snake game when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Snake game script loaded');
    
    // Add direct click handler to the button if we can find it
    const directStartBtn = document.getElementById('startSnakeBtn');
    if (directStartBtn) {
        console.log('Adding direct event listener to snake start button');
        directStartBtn.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default behavior
            console.log('Direct start button click');
            startSnakeGameGlobal();
        });
    }
    
    // Check if the snake game is visible
    const snakeGame = document.getElementById('snakeGame');
    if (snakeGame && snakeGame.style.display !== 'none') {
        console.log('Snake game is visible on load, initializing');
        setTimeout(initSnakeGame, 300);
    }
});

// Global function to start the snake game that can be called from anywhere
function startSnakeGameGlobal() {
    console.log('Starting snake game globally');
    
    // Make sure the game is initialized
    if (!canvas || !ctx) {
        console.log('Need to initialize snake game first');
        initSnakeGame();
        
        // Wait a bit for initialization to complete
        setTimeout(function() {
            if (typeof startGame === 'function') {
                startGame();
            }
        }, 100);
    } else {
        // Game is already initialized, just start it
        if (typeof startGame === 'function') {
            startGame();
        }
    }
}

// Export the global function to window so it can be called from anywhere
window.startSnakeGameGlobal = startSnakeGameGlobal; 