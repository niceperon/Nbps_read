// Snake Game - Simplified Version
document.addEventListener('DOMContentLoaded', function() {
    console.log('Snake game loading...');
    initGame();
});

// Game variables
let canvas, ctx;
let snake = [];
let food = null;
let direction = { x: 1, y: 0 };
let gameLoop = null;
let score = 0;
let highScore = 0;
let gamePaused = false;
let gameStarted = false;

// Game settings
const GRID_SIZE = 20;
const GAME_SPEED = 150; // ms
const COLORS = {
    background: '#111111',
    grid: '#222222',
    snakeHead: '#ff3333',
    snakeBody: '#cc0000',
    food: '#ff6666',
    text: '#ffffff'
};

// Initialize the game
function initGame() {
    // Get canvas and context
    canvas = document.getElementById('snakeCanvas');
    if (!canvas) {
        console.error('Cannot find snakeCanvas');
        return;
    }
    
    ctx = canvas.getContext('2d');
    
    // Get highscore from localStorage
    highScore = localStorage.getItem('snakeHighScore') || 0;
    updateScore();
    
    // Set up snake starting position
    resetGame(false);
    
    // Draw initial state
    draw();
    
    // Add event listeners
    setupEventListeners();
    
    console.log('Snake game initialized');
}

// Set up event listeners
function setupEventListeners() {
    // Keyboard controls
    document.addEventListener('keydown', handleKeyPress);
    
    // Buttons
    const startBtn = document.getElementById('startSnakeBtn');
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            if (!gameStarted) {
                startGame();
            } else if (gamePaused) {
                resumeGame();
            } else {
                resetGame();
                startGame();
            }
        });
    }
    
    const pauseBtn = document.getElementById('pauseSnakeBtn');
    if (pauseBtn) {
        pauseBtn.addEventListener('click', function() {
            if (gameStarted && !gamePaused) {
                pauseGame();
            }
        });
    }
}

// Reset the game
function resetGame(resetScore = true) {
    // Reset snake to starting position
    const centerX = Math.floor(canvas.width / GRID_SIZE / 2);
    const centerY = Math.floor(canvas.height / GRID_SIZE / 2);
    
    snake = [
        { x: centerX, y: centerY },
        { x: centerX - 1, y: centerY },
        { x: centerX - 2, y: centerY }
    ];
    
    // Reset direction to right
    direction = { x: 1, y: 0 };
    
    // Reset score if needed
    if (resetScore) {
        score = 0;
        updateScore();
    }
    
    // Create food
    createFood();
}

// Create food at random location
function createFood() {
    const maxX = Math.floor(canvas.width / GRID_SIZE);
    const maxY = Math.floor(canvas.height / GRID_SIZE);
    
    // Find a position that's not on the snake
    let foodX, foodY;
    let validPosition = false;
    
    while (!validPosition) {
        foodX = Math.floor(Math.random() * maxX);
        foodY = Math.floor(Math.random() * maxY);
        
        // Check if position is free (not on snake)
        validPosition = true;
        for (let segment of snake) {
            if (segment.x === foodX && segment.y === foodY) {
                validPosition = false;
                break;
            }
        }
    }
    
    food = { x: foodX, y: foodY };
}

// Start game
function startGame() {
    if (gameLoop) clearInterval(gameLoop);
    
    gameStarted = true;
    gamePaused = false;
    updateButtonStates();
    
    // Start game loop
    gameLoop = setInterval(update, GAME_SPEED);
    
    console.log('Game started');
}

// Update game state
function update() {
    if (gamePaused) return;
    
    // Move snake
    moveSnake();
    
    // Check collisions
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    // Check if snake ate food
    if (snake[0].x === food.x && snake[0].y === food.y) {
        eatFood();
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }
    
    // Redraw
    draw();
}

// Move snake in current direction
function moveSnake() {
    // Calculate new head position
    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };
    
    // Add new head to beginning of snake
    snake.unshift(head);
}

// Check for collisions with walls or self
function checkCollision() {
    const head = snake[0];
    const maxX = Math.floor(canvas.width / GRID_SIZE);
    const maxY = Math.floor(canvas.height / GRID_SIZE);
    
    // Check wall collision
    if (head.x < 0 || head.x >= maxX || head.y < 0 || head.y >= maxY) {
        return true;
    }
    
    // Check self collision (start from 1 to skip head)
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
    score += 10;
    updateScore();
    
    // Create new food
    createFood();
    
    // Create eat effect
    createEatEffect();
}

// Create visual effect when eating food
function createEatEffect() {
    const effectDiv = document.createElement('div');
    effectDiv.style.position = 'absolute';
    effectDiv.style.width = '50px';
    effectDiv.style.height = '50px';
    effectDiv.style.borderRadius = '50%';
    effectDiv.style.background = 'radial-gradient(circle, rgba(255,100,100,0.9) 0%, rgba(255,0,0,0.6) 50%, rgba(255,0,0,0) 100%)';
    effectDiv.style.boxShadow = '0 0 20px #ff0000';
    effectDiv.style.pointerEvents = 'none';
    effectDiv.style.zIndex = '100';
    
    // Position at food location
    const rect = canvas.getBoundingClientRect();
    const x = food.x * GRID_SIZE + rect.left + GRID_SIZE/2;
    const y = food.y * GRID_SIZE + rect.top + GRID_SIZE/2;
    
    effectDiv.style.left = `${x - 25}px`;
    effectDiv.style.top = `${y - 25}px`;
    
    // Add to page
    document.body.appendChild(effectDiv);
    
    // Add animation
    effectDiv.animate([
        { transform: 'scale(0.2)', opacity: 1 },
        { transform: 'scale(1.5)', opacity: 0 }
    ], {
        duration: 500,
        easing: 'ease-out'
    });
    
    // Remove after animation
    setTimeout(() => {
        effectDiv.remove();
    }, 500);
}

// Game over
function gameOver() {
    clearInterval(gameLoop);
    gameLoop = null;
    gameStarted = false;
    
    // Update high score if needed
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        updateScore();
    }
    
    // Update button states
    updateButtonStates();
    
    // Draw game over screen
    drawGameOverScreen();
}

// Pause game
function pauseGame() {
    gamePaused = true;
    updateButtonStates();
    drawPauseScreen();
}

// Resume game
function resumeGame() {
    gamePaused = false;
    updateButtonStates();
    draw();
}

// Handle keyboard input
function handleKeyPress(e) {
    // Handle game state keys
    if (e.key === ' ' || e.code === 'Space') {
        if (!gameStarted) {
            startGame();
        } else if (gamePaused) {
            resumeGame();
        }
        e.preventDefault();
        return;
    }
    
    if (e.key === 'p' || e.key === 'P') {
        if (gameStarted && !gamePaused) {
            pauseGame();
        } else if (gamePaused) {
            resumeGame();
        }
        e.preventDefault();
        return;
    }
    
    // Only handle direction keys if game is active
    if (!gameStarted || gamePaused) return;
    
    // Prevent default behavior for arrow keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
        e.preventDefault();
    }
    
    // Calculate new direction (don't allow 180° turns)
    switch(e.key) {
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
    }
}

// Update button states based on game state
function updateButtonStates() {
    const startBtn = document.getElementById('startSnakeBtn');
    const pauseBtn = document.getElementById('pauseSnakeBtn');
    
    if (!startBtn || !pauseBtn) return;
    
    if (!gameStarted) {
        startBtn.innerHTML = '<i class="fas fa-play"></i> Start Game';
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    } else if (gamePaused) {
        startBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    } else {
        startBtn.innerHTML = '<i class="fas fa-redo"></i> Restart';
        startBtn.disabled = false;
        pauseBtn.disabled = false;
    }
}

// Update score display
function updateScore() {
    const scoreElement = document.getElementById('snakeScore');
    const highScoreElement = document.getElementById('snakeHighScore');
    
    if (scoreElement) scoreElement.textContent = score;
    if (highScoreElement) highScoreElement.textContent = highScore;
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background and grid
    drawGrid();
    
    // Draw snake
    drawSnake();
    
    // Draw food
    drawFood();
}

// Draw grid
function drawGrid() {
    // Fill background
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 0.5;
    
    // Vertical lines
    for (let x = 0; x <= canvas.width; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= canvas.height; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Draw snake with glowing effect
function drawSnake() {
    // Draw body segments
    for (let i = snake.length - 1; i > 0; i--) {
        const segment = snake[i];
        const x = segment.x * GRID_SIZE;
        const y = segment.y * GRID_SIZE;
        
        // Draw body with subtle glow
        ctx.shadowColor = 'red';
        ctx.shadowBlur = 5;
        ctx.fillStyle = COLORS.snakeBody;
        ctx.fillRect(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2);
    }
    
    // Draw head with stronger glow
    if (snake.length > 0) {
        const head = snake[0];
        const x = head.x * GRID_SIZE;
        const y = head.y * GRID_SIZE;
        
        ctx.shadowColor = 'red';
        ctx.shadowBlur = 15;
        ctx.fillStyle = COLORS.snakeHead;
        ctx.fillRect(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2);
        
        // Draw eyes
        ctx.shadowBlur = 0;
        
        // Position eyes based on direction
        let eyeX1, eyeY1, eyeX2, eyeY2;
        
        if (direction.x === 0 && direction.y === -1) { // Up
            eyeX1 = x + 6;
            eyeY1 = y + 6;
            eyeX2 = x + GRID_SIZE - 6;
            eyeY2 = y + 6;
        } else if (direction.x === 0 && direction.y === 1) { // Down
            eyeX1 = x + 6;
            eyeY1 = y + GRID_SIZE - 6;
            eyeX2 = x + GRID_SIZE - 6;
            eyeY2 = y + GRID_SIZE - 6;
        } else if (direction.x === -1 && direction.y === 0) { // Left
            eyeX1 = x + 6;
            eyeY1 = y + 6;
            eyeX2 = x + 6;
            eyeY2 = y + GRID_SIZE - 6;
        } else { // Right
            eyeX1 = x + GRID_SIZE - 6;
            eyeY1 = y + 6;
            eyeX2 = x + GRID_SIZE - 6;
            eyeY2 = y + GRID_SIZE - 6;
        }
        
        // Draw white part of eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eyeX1, eyeY1, 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(eyeX2, eyeY2, 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw pupils
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(eyeX1, eyeY1, 1, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(eyeX2, eyeY2, 1, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Reset shadow
    ctx.shadowBlur = 0;
}

// Draw food with glowing effect
function drawFood() {
    if (!food) return;
    
    const x = food.x * GRID_SIZE;
    const y = food.y * GRID_SIZE;
    
    // Create pulsating effect
    const time = Date.now() / 300;
    const pulseFactor = 1 + Math.sin(time) * 0.2;
    const radius = (GRID_SIZE / 2 - 2) * pulseFactor;
    
    // Draw outer glow
    ctx.shadowColor = 'red';
    ctx.shadowBlur = 15;
    
    // Draw food
    ctx.beginPath();
    ctx.arc(x + GRID_SIZE / 2, y + GRID_SIZE / 2, radius, 0, Math.PI * 2);
    
    // Create gradient
    const gradient = ctx.createRadialGradient(
        x + GRID_SIZE / 2, 
        y + GRID_SIZE / 2, 
        radius * 0.2,
        x + GRID_SIZE / 2, 
        y + GRID_SIZE / 2, 
        radius
    );
    gradient.addColorStop(0, '#ffcccc');
    gradient.addColorStop(0.8, COLORS.food);
    gradient.addColorStop(1, '#cc0000');
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw shine
    ctx.beginPath();
    ctx.arc(
        x + GRID_SIZE / 2 - radius * 0.3,
        y + GRID_SIZE / 2 - radius * 0.3,
        radius * 0.2,
        0, 
        Math.PI * 2
    );
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();
    
    // Draw tiny particles orbiting the food
    drawFoodParticles(x, y, radius);
    
    // Reset shadow
    ctx.shadowBlur = 0;
}

// Draw particles orbiting the food
function drawFoodParticles(x, y, radius) {
    const time = Date.now() / 1000;
    const centerX = x + GRID_SIZE / 2;
    const centerY = y + GRID_SIZE / 2;
    
    // Draw 3 particles
    for (let i = 0; i < 3; i++) {
        const angle = time * 1.5 + (i * Math.PI * 2 / 3);
        const distance = radius * 1.5;
        
        const particleX = centerX + Math.cos(angle) * distance;
        const particleY = centerY + Math.sin(angle) * distance;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particleX, particleY, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 100, 100, 0.8)';
        ctx.fill();
    }
}

// Draw game over screen
function drawGameOverScreen() {
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Game over text
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = '#ff0000';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);
    
    // Score
    ctx.font = '24px Arial';
    ctx.fillStyle = COLORS.text;
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
    
    // High score
    ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 50);
    
    // Restart instructions
    ctx.font = '18px Arial';
    ctx.fillText('Press SPACE or click Start to play again', canvas.width / 2, canvas.height / 2 + 100);
}

// Draw pause screen
function drawPauseScreen() {
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Pause text
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = '#ff0000';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2 - 20);
    
    // Resume instructions
    ctx.font = '18px Arial';
    ctx.fillStyle = COLORS.text;
    ctx.fillText('Press SPACE, P or click Resume to continue', canvas.width / 2, canvas.height / 2 + 30);
}

// Export global function that can be called from HTML
window.startSnakeGameGlobal = function() {
    if (!gameStarted) {
        startGame();
    } else if (gamePaused) {
        resumeGame();
    } else {
        resetGame();
        startGame();
    }
};
