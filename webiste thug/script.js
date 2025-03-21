// Game variables
let score = 0;
let clickValue = 1;
let autoClicksPerSecond = 0;
let clickUpgradeCost = 10;
let autoClickerCost = 50;

// Statistics
let stats = {
    totalClicks: 0,
    totalAutoClicks: 0,
    totalClickValue: 0,
    highestScore: 0,
    startTime: Date.now(),
    playTime: 0,
    lastSave: Date.now()
};

// Sound effects
const sounds = {
    click: new Audio('sounds/click.mp3'),
    upgrade: new Audio('sounds/upgrade.mp3'),
    milestone: new Audio('sounds/milestone.mp3')
};

// Background animation variables
let mouseX = 0;
let mouseY = 0;
let backgroundElements = [];
const maxBackgroundElements = 15;

// Preload sounds with empty src to prevent errors if files don't exist
Object.keys(sounds).forEach(sound => {
    try {
        sounds[sound].volume = 0.3;
    } catch (e) {
        console.log(`Sound ${sound} not loaded: ${e}`);
    }
});

// DOM elements
const scoreElement = document.getElementById('score');
const autoClicksElement = document.getElementById('autoClicks');
const clickButton = document.getElementById('clickButton');
const upgradeClickButton = document.getElementById('upgradeClick');
const upgradeAutoButton = document.getElementById('upgradeAuto');
const gameArea = document.getElementById('gameArea');
const cursorFollower = document.getElementById('cursorFollower');

// Initialize cursor follower and track mouse position
document.addEventListener('mousemove', (e) => {
    // Update cursor follower position
    cursorFollower.style.left = `${e.clientX}px`;
    cursorFollower.style.top = `${e.clientY}px`;
    
    // Update mouse position for background animation
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Animate background elements
    animateBackgroundElements();
});

// Cursor effects
document.addEventListener('mousedown', () => {
    cursorFollower.classList.add('active');
});

document.addEventListener('mouseup', () => {
    cursorFollower.classList.remove('active');
});

// Add hover effects
const buttons = document.querySelectorAll('.click-button, .upgrade-btn');
buttons.forEach(button => {
    button.addEventListener('mouseenter', () => {
        cursorFollower.style.width = '50px';
        cursorFollower.style.height = '50px';
        cursorFollower.style.background = 'rgba(255, 0, 0, 0.8)';
    });

    button.addEventListener('mouseleave', () => {
        cursorFollower.style.width = '30px';
        cursorFollower.style.height = '30px';
        cursorFollower.style.background = 'rgba(255, 0, 0, 0.5)';
    });
});

// Update score display
function updateScore() {
    scoreElement.textContent = score;
    autoClicksElement.textContent = autoClicksPerSecond;
    
    // Update button texts with icons
    upgradeClickButton.innerHTML = `<i class="fas fa-hand-pointer"></i> Upgrade Click (Cost: ${clickUpgradeCost})`;
    upgradeAutoButton.innerHTML = `<i class="fas fa-robot"></i> Auto Clicker (Cost: ${autoClickerCost})`;
    
    // Update highest score statistic
    if (score > stats.highestScore) {
        stats.highestScore = score;
    }
    
    // Disable buttons if not enough score
    if (score < clickUpgradeCost) {
        upgradeClickButton.style.opacity = '0.7';
        upgradeClickButton.style.cursor = 'not-allowed';
    } else {
        upgradeClickButton.style.opacity = '1';
        upgradeClickButton.style.cursor = 'pointer';
    }
    
    if (score < autoClickerCost) {
        upgradeAutoButton.style.opacity = '0.7';
        upgradeAutoButton.style.cursor = 'not-allowed';
    } else {
        upgradeAutoButton.style.opacity = '1';
        upgradeAutoButton.style.cursor = 'pointer';
    }
    
    // Check for milestones
    checkMilestones();
    
    // Save game every 10 seconds
    if (Date.now() - stats.lastSave > 10000) {
        saveGame();
        stats.lastSave = Date.now();
    }
}

// Click button handler
clickButton.addEventListener('click', () => {
    incrementScore(clickValue);
    createClickParticles(event);
    animateButton();
    createPulseEffect();
    
    // Update statistics
    stats.totalClicks++;
    stats.totalClickValue += clickValue;
    
    // Play click sound
    try {
        sounds.click.currentTime = 0;
        sounds.click.play();
    } catch (e) {
        // Silent fail if sound doesn't work
    }
});

// Increment score
function incrementScore(value) {
    score += value;
    updateScore();
    
    // Show floating score text
    const scoreText = document.createElement('div');
    scoreText.textContent = `+${value}`;
    scoreText.style.position = 'absolute';
    scoreText.style.color = '#ff3333';
    scoreText.style.fontWeight = 'bold';
    scoreText.style.fontSize = '1.2rem';
    scoreText.style.pointerEvents = 'none';
    scoreText.style.zIndex = '1000';
    
    // Position near click button
    const rect = clickButton.getBoundingClientRect();
    scoreText.style.left = `${rect.left + rect.width / 2 + (Math.random() * 40 - 20)}px`;
    scoreText.style.top = `${rect.top - 20 + (Math.random() * 10)}px`;
    
    // Add animation
    scoreText.style.animation = 'floatUp 1s forwards';
    document.body.appendChild(scoreText);
    
    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatUp {
            0% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(-30px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Remove after animation
    setTimeout(() => {
        scoreText.remove();
        style.remove();
    }, 1000);
}

// Animate button when clicked
function animateButton() {
    clickButton.style.transform = 'scale(0.95)';
    setTimeout(() => {
        clickButton.style.transform = 'scale(1)';
    }, 100);
}

// Create pulse effect when clicking
function createPulseEffect() {
    const pulse = document.createElement('div');
    pulse.style.position = 'absolute';
    pulse.style.width = '180px';
    pulse.style.height = '180px';
    pulse.style.borderRadius = '50%';
    pulse.style.background = 'rgba(255, 0, 0, 0.3)';
    pulse.style.zIndex = '5';
    pulse.style.animation = 'pulse 0.6s forwards';
    pulse.style.pointerEvents = 'none';
    
    const rect = clickButton.getBoundingClientRect();
    pulse.style.left = `${rect.left}px`;
    pulse.style.top = `${rect.top}px`;
    
    document.body.appendChild(pulse);
    
    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); opacity: 0.7; }
            100% { transform: scale(2); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Remove after animation
    setTimeout(() => {
        pulse.remove();
        style.remove();
    }, 600);
    
    // Add image flash effect
    const clickImage = clickButton.querySelector('.click-image');
    if (clickImage) {
        clickImage.style.filter = 'brightness(1.3)';
        setTimeout(() => {
            clickImage.style.filter = 'brightness(1)';
        }, 150);
    }
}

// Upgrade click power
upgradeClickButton.addEventListener('click', () => {
    if (score >= clickUpgradeCost) {
        score -= clickUpgradeCost;
        clickValue += 1;
        clickUpgradeCost = Math.floor(clickUpgradeCost * 1.5);
        updateScore();
        
        // Play upgrade sound
        try {
            sounds.upgrade.currentTime = 0;
            sounds.upgrade.play();
        } catch (e) {
            // Silent fail if sound doesn't work
        }
        
        // Show upgrade effect
        showUpgradeEffect('Click Power +1', upgradeClickButton);
    }
});

// Buy auto-clicker
upgradeAutoButton.addEventListener('click', () => {
    if (score >= autoClickerCost) {
        score -= autoClickerCost;
        autoClicksPerSecond += 1;
        autoClickerCost = Math.floor(autoClickerCost * 1.8);
        updateScore();
        
        // Play upgrade sound
        try {
            sounds.upgrade.currentTime = 0;
            sounds.upgrade.play();
        } catch (e) {
            // Silent fail if sound doesn't work
        }
        
        // Show upgrade effect
        showUpgradeEffect('Auto-Clicker +1', upgradeAutoButton);
    }
});

// Show upgrade effect
function showUpgradeEffect(text, button) {
    const upgradeEffect = document.createElement('div');
    upgradeEffect.textContent = text;
    upgradeEffect.style.position = 'absolute';
    upgradeEffect.style.padding = '5px 10px';
    upgradeEffect.style.background = 'rgba(0, 0, 0, 0.8)';
    upgradeEffect.style.color = '#ff3333';
    upgradeEffect.style.fontWeight = 'bold';
    upgradeEffect.style.borderRadius = '5px';
    upgradeEffect.style.pointerEvents = 'none';
    upgradeEffect.style.zIndex = '1000';
    
    // Position above button
    const rect = button.getBoundingClientRect();
    upgradeEffect.style.left = `${rect.left + rect.width / 2 - 60}px`;
    upgradeEffect.style.top = `${rect.top - 40}px`;
    
    // Add animation
    upgradeEffect.style.animation = 'fadeOut 1.5s forwards';
    document.body.appendChild(upgradeEffect);
    
    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeOut {
            0% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(-20px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Remove after animation
    setTimeout(() => {
        upgradeEffect.remove();
        style.remove();
    }, 1500);
}

// Auto-clicker functionality
setInterval(() => {
    if (autoClicksPerSecond > 0) {
        incrementScore(autoClicksPerSecond);
        simulateButtonClick();
        
        // Update statistics
        stats.totalAutoClicks += autoClicksPerSecond;
    }
    
    // Update play time statistic
    stats.playTime = Math.floor((Date.now() - stats.startTime) / 1000);
}, 1000);

// Simulate button click for auto-clicker
function simulateButtonClick() {
    clickButton.style.transform = 'scale(0.97)';
    setTimeout(() => {
        clickButton.style.transform = 'scale(1)';
    }, 100);
    
    // Add image flash effect
    const clickImage = clickButton.querySelector('.click-image');
    if (clickImage) {
        clickImage.style.filter = 'brightness(1.1)';
        setTimeout(() => {
            clickImage.style.filter = 'brightness(1)';
        }, 100);
    }
    
    // Create mini particles for auto-click
    const rect = clickButton.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 5; i++) {
        createParticle(centerX, centerY, true);
    }
}

// Create particles when clicking
function createClickParticles(event) {
    const rect = clickButton.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 15; i++) {
        createParticle(centerX, centerY, false);
    }
}

// Create individual particle
function createParticle(x, y, isAutoClick) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    
    // Random position
    const offsetX = (Math.random() - 0.5) * (isAutoClick ? 50 : 100);
    const offsetY = (Math.random() - 0.5) * (isAutoClick ? 50 : 100);
    
    // Random size
    const size = Math.random() * (isAutoClick ? 8 : 12) + 3;
    
    // Random color (red tones)
    const red = Math.floor(Math.random() * 56) + 200; // 200-255
    const green = Math.floor(Math.random() * 30); // 0-30
    const blue = Math.floor(Math.random() * 30); // 0-30
    
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${x + offsetX}px`;
    particle.style.top = `${y + offsetY}px`;
    particle.style.background = `rgb(${red}, ${green}, ${blue})`;
    particle.style.zIndex = '1000';
    
    document.body.appendChild(particle);
    
    // Remove particle after animation
    setTimeout(() => {
        particle.remove();
    }, 1000);
}

// Background effects
function createBackgroundEffect() {
    const colors = ['#990000', '#660000', '#ff3333', '#cc0000'];
    const section = document.createElement('section');
    section.id = 'background-container';
    section.style.position = 'absolute';
    section.style.width = '100%';
    section.style.height = '100vh';
    section.style.top = 0;
    section.style.left = 0;
    section.style.zIndex = '-1';
    section.style.overflow = 'hidden';
    document.body.appendChild(section);

    // Create initial background elements
    for (let i = 0; i < maxBackgroundElements; i++) {
        createBackgroundElement(section, colors);
    }
    
    // Store reference to background elements
    backgroundElements = document.querySelectorAll('#background-container > div');
}

// Create a single background element
function createBackgroundElement(container, colors) {
    const block = document.createElement('div');
    block.className = 'bg-element';
    block.style.position = 'absolute';
    
    // Random size between 30px and 100px
    const size = Math.random() * 70 + 30;
    block.style.width = `${size}px`;
    block.style.height = `${size}px`;
    
    // Random shape - circles and squares
    block.style.borderRadius = Math.random() > 0.3 ? '50%' : Math.random() * 20 + '%';
    
    // Random color from our red palette
    block.style.background = colors[Math.floor(Math.random() * colors.length)];
    block.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.5)';
    
    // Random position
    block.style.left = Math.random() * 100 + 'vw';
    block.style.top = Math.random() * 100 + 'vh';
    
    // Set z-index and opacity
    block.style.zIndex = '-1';
    block.style.opacity = '0.05';
    
    // Add transition for smooth movement
    block.style.transition = 'transform 3s ease-out, opacity 2s ease-in-out';
    
    // Set transform scale
    block.style.transform = 'scale(1) translate(0, 0)';
    
    container.appendChild(block);
    return block;
}

// Animate background elements based on mouse position
function animateBackgroundElements() {
    if (!backgroundElements.length) return;
    
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Calculate mouse position as a percentage of the screen
    const mouseXPercent = mouseX / windowWidth;
    const mouseYPercent = mouseY / windowHeight;
    
    backgroundElements.forEach((element, index) => {
        // Different movement factor for each element to create parallax effect
        const moveFactor = 30 + (index % 3) * 20;
        
        // Calculate the offset based on mouse position
        // Elements move in different directions based on their index
        const offsetX = (mouseXPercent - 0.5) * moveFactor * (index % 2 === 0 ? -1 : 1);
        const offsetY = (mouseYPercent - 0.5) * moveFactor * (index % 3 === 0 ? -1 : 1);
        
        // Apply transform with slight delay to create smooth effect
        setTimeout(() => {
            if (element) {
                element.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${1 + Math.abs(mouseXPercent - 0.5) * 0.2})`;
                
                // Adjust opacity based on distance from cursor
                const distX = Math.abs(mouseXPercent - parseInt(element.style.left) / windowWidth);
                const distY = Math.abs(mouseYPercent - parseInt(element.style.top) / windowHeight);
                const dist = Math.sqrt(distX * distX + distY * distY);
                
                // Closer elements are more visible
                element.style.opacity = Math.max(0.05, Math.min(0.2, 0.25 - dist * 0.5));
            }
        }, index * 5);
    });
}

// Create effect where cursor movement leaves a trail
function createCursorTrailEffect() {
    // Add trail element creation on mouse movement
    let lastTrailTime = 0;
    
    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        
        // Only create trail element every 50ms to avoid too many elements
        if (now - lastTrailTime > 50) {
            lastTrailTime = now;
            
            const trail = document.createElement('div');
            trail.className = 'cursor-trail';
            trail.style.position = 'fixed';
            trail.style.width = '8px';
            trail.style.height = '8px';
            trail.style.background = 'rgba(255, 0, 0, 0.5)';
            trail.style.borderRadius = '50%';
            trail.style.pointerEvents = 'none';
            trail.style.zIndex = '9998';
            trail.style.left = `${e.clientX}px`;
            trail.style.top = `${e.clientY}px`;
            trail.style.transition = 'transform 0.5s, opacity 1s';
            trail.style.opacity = '0.7';
            
            document.body.appendChild(trail);
            
            // Animate and remove
            requestAnimationFrame(() => {
                trail.style.transform = 'scale(0.3)';
                trail.style.opacity = '0';
            });
            
            setTimeout(() => {
                trail.remove();
            }, 1000);
        }
    });
}

// Check for milestones
function checkMilestones() {
    const milestones = [
        { score: 100, message: "Great start!" },
        { score: 500, message: "You're getting good!" },
        { score: 1000, message: "Impressive clicking!" },
        { score: 5000, message: "Clicking master!" },
        { score: 10000, message: "Unstoppable clicker!" },
        { score: 50000, message: "Legendary clicker!" },
        { score: 100000, message: "God-tier clicker!" }
    ];
    
    // Check if we've reached a milestone
    for (const milestone of milestones) {
        if (score === milestone.score || 
            (score > milestone.score && score - clickValue < milestone.score) || 
            (score > milestone.score && score - autoClicksPerSecond < milestone.score)) {
            
            // Play milestone sound
            try {
                sounds.milestone.currentTime = 0;
                sounds.milestone.play();
            } catch (e) {
                // Silent fail if sound doesn't work
            }
            
            // Show milestone effect
            showMilestoneEffect(milestone.message);
            break;
        }
    }
}

// Show milestone effect
function showMilestoneEffect(message) {
    // Create milestone banner
    const milestone = document.createElement('div');
    milestone.textContent = `🏆 MILESTONE: ${message} 🏆`;
    milestone.style.position = 'fixed';
    milestone.style.top = '50%';
    milestone.style.left = '50%';
    milestone.style.transform = 'translate(-50%, -50%)';
    milestone.style.background = 'rgba(0, 0, 0, 0.8)';
    milestone.style.color = '#ff3333';
    milestone.style.padding = '20px 30px';
    milestone.style.borderRadius = '10px';
    milestone.style.fontWeight = 'bold';
    milestone.style.fontSize = '1.5rem';
    milestone.style.zIndex = '2000';
    milestone.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.5)';
    milestone.style.textAlign = 'center';
    milestone.style.animation = 'milestonePulse 3s forwards';
    
    document.body.appendChild(milestone);
    
    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes milestonePulse {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
            20% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
            30% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            80% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1.2); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Create fireworks
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            createFirework();
        }, i * 100);
    }
    
    // Remove after animation
    setTimeout(() => {
        milestone.remove();
        style.remove();
    }, 3000);
}

// Create firework effect
function createFirework() {
    const firework = document.createElement('div');
    firework.style.position = 'fixed';
    firework.style.width = '5px';
    firework.style.height = '5px';
    firework.style.borderRadius = '50%';
    firework.style.zIndex = '1999';
    
    // Random position
    const posX = Math.random() * window.innerWidth;
    const posY = window.innerHeight + 10;
    
    // Random target position (where the firework will explode)
    const targetX = Math.random() * window.innerWidth;
    const targetY = Math.random() * (window.innerHeight * 0.7);
    
    // Random color
    const hue = Math.floor(Math.random() * 30) + 350; // Red tones
    
    firework.style.left = `${posX}px`;
    firework.style.top = `${posY}px`;
    firework.style.background = `hsl(${hue}, 100%, 50%)`;
    firework.style.boxShadow = `0 0 10px hsl(${hue}, 100%, 50%)`;
    
    document.body.appendChild(firework);
    
    // Animate firework
    const duration = Math.random() * 500 + 500;
    firework.animate([
        { transform: `translate(0, 0)` },
        { transform: `translate(${targetX - posX}px, ${targetY - posY}px)` }
    ], { duration, fill: 'forwards', easing: 'cubic-bezier(0.42, 0, 0.58, 1)' });
    
    // Create explosion after firework reaches target
    setTimeout(() => {
        firework.remove();
        createExplosion(targetX, targetY, hue);
    }, duration);
}

// Create explosion effect
function createExplosion(x, y, hue) {
    const particles = 30;
    
    for (let i = 0; i < particles; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.width = '3px';
        particle.style.height = '3px';
        particle.style.background = `hsl(${hue}, 100%, 50%)`;
        particle.style.boxShadow = `0 0 6px hsl(${hue}, 100%, 70%)`;
        particle.style.borderRadius = '50%';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.zIndex = '1998';
        
        document.body.appendChild(particle);
        
        // Calculate explosion angle and velocity
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 5 + 3;
        const explosionX = Math.cos(angle) * velocity * 20;
        const explosionY = Math.sin(angle) * velocity * 20;
        
        // Animate particle
        particle.animate([
            { transform: 'translate(0, 0)', opacity: 1 },
            { transform: `translate(${explosionX}px, ${explosionY}px)`, opacity: 0 }
        ], { duration: 1000, fill: 'forwards', easing: 'cubic-bezier(0, 0, 0.2, 1)' });
        
        // Remove particle after animation
        setTimeout(() => {
            particle.remove();
        }, 1000);
    }
}

// Save game to local storage
function saveGame() {
    const saveData = {
        score: score,
        clickValue: clickValue,
        autoClicksPerSecond: autoClicksPerSecond,
        clickUpgradeCost: clickUpgradeCost,
        autoClickerCost: autoClickerCost,
        stats: stats
    };
    
    try {
        localStorage.setItem('clickerGameSave', JSON.stringify(saveData));
        console.log('Game saved!');
    } catch (e) {
        console.error('Could not save game:', e);
    }
}

// Load game from local storage
function loadGame() {
    try {
        const saveData = JSON.parse(localStorage.getItem('clickerGameSave'));
        
        if (saveData) {
            score = saveData.score;
            clickValue = saveData.clickValue;
            autoClicksPerSecond = saveData.autoClicksPerSecond;
            clickUpgradeCost = saveData.clickUpgradeCost;
            autoClickerCost = saveData.autoClickerCost;
            
            // Load stats, but keep current session start time
            const currentStartTime = stats.startTime;
            stats = saveData.stats;
            stats.startTime = currentStartTime;
            
            updateScore();
            return true;
        }
    } catch (e) {
        console.error('Could not load game:', e);
    }
    
    return false;
}

// Create stats display
function createStatsDisplay() {
    // Create stats button
    const statsButton = document.createElement('button');
    statsButton.innerHTML = '<i class="fas fa-chart-bar"></i>';
    statsButton.className = 'stats-button';
    statsButton.style.position = 'fixed';
    statsButton.style.bottom = '20px';
    statsButton.style.right = '20px';
    statsButton.style.backgroundColor = 'rgba(20, 20, 20, 0.8)';
    statsButton.style.color = '#ff3333';
    statsButton.style.border = '1px solid rgba(255, 0, 0, 0.3)';
    statsButton.style.borderRadius = '50%';
    statsButton.style.width = '50px';
    statsButton.style.height = '50px';
    statsButton.style.fontSize = '1.5rem';
    statsButton.style.cursor = 'none';
    statsButton.style.zIndex = '1500';
    statsButton.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.3)';
    
    document.body.appendChild(statsButton);
    
    // Create stats panel (hidden by default)
    const statsPanel = document.createElement('div');
    statsPanel.className = 'stats-panel';
    statsPanel.style.position = 'fixed';
    statsPanel.style.bottom = '80px';
    statsPanel.style.right = '20px';
    statsPanel.style.backgroundColor = 'rgba(20, 20, 20, 0.9)';
    statsPanel.style.color = 'white';
    statsPanel.style.padding = '20px';
    statsPanel.style.borderRadius = '10px';
    statsPanel.style.border = '1px solid rgba(255, 0, 0, 0.3)';
    statsPanel.style.width = '300px';
    statsPanel.style.maxHeight = '400px';
    statsPanel.style.overflowY = 'auto';
    statsPanel.style.display = 'none';
    statsPanel.style.zIndex = '1500';
    statsPanel.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.3)';
    
    document.body.appendChild(statsPanel);
    
    // Toggle stats panel visibility
    statsButton.addEventListener('click', () => {
        if (statsPanel.style.display === 'none') {
            updateStatsPanel();
            statsPanel.style.display = 'block';
            // Add show animation
            statsPanel.style.animation = 'slideIn 0.3s forwards';
        } else {
            statsPanel.style.animation = 'slideOut 0.3s forwards';
            setTimeout(() => {
                statsPanel.style.display = 'none';
            }, 300);
        }
        
        // Add keyframes for animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateY(0); opacity: 1; }
                to { transform: translateY(20px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => {
            style.remove();
        }, 300);
    });
    
    // Update stats panel content
    function updateStatsPanel() {
        // Format time
        const formatTime = (seconds) => {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            return `${hours}h ${minutes}m ${secs}s`;
        };
        
        statsPanel.innerHTML = `
            <h3 style="color: #ff3333; margin-bottom: 15px;">Game Statistics</h3>
            <div style="margin-bottom: 5px;"><i class="fas fa-mouse-pointer"></i> Total Manual Clicks: ${stats.totalClicks}</div>
            <div style="margin-bottom: 5px;"><i class="fas fa-robot"></i> Total Auto Clicks: ${stats.totalAutoClicks}</div>
            <div style="margin-bottom: 5px;"><i class="fas fa-trophy"></i> Highest Score: ${stats.highestScore}</div>
            <div style="margin-bottom: 5px;"><i class="fas fa-hand-pointer"></i> Click Power: ${clickValue}</div>
            <div style="margin-bottom: 5px;"><i class="fas fa-bolt"></i> Auto Clicks/sec: ${autoClicksPerSecond}</div>
            <div style="margin-bottom: 5px;"><i class="fas fa-money-bill-wave"></i> Total Value Earned: ${stats.totalClickValue + stats.totalAutoClicks}</div>
            <div style="margin-bottom: 5px;"><i class="fas fa-clock"></i> Play Time: ${formatTime(stats.playTime)}</div>
            <div style="margin-top: 15px;">
                <button id="resetGameBtn" style="background: #660000; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: none;">Reset Game</button>
            </div>
        `;
        
        // Add reset functionality
        document.getElementById('resetGameBtn').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all progress?')) {
                localStorage.removeItem('clickerGameSave');
                location.reload();
            }
        });
    }
    
    // Update stats every second
    setInterval(updateStatsPanel, 1000);
}

// Initialize
function initGame() {
    createBackgroundEffect();
    createStatsDisplay();
    createCursorTrailEffect();
    createAboutButton();
    
    // Try to load saved game
    const gameLoaded = loadGame();
    if (!gameLoaded) {
        // If no saved game, initialize with defaults
        updateScore();
    }
    
    // Save game when leaving page
    window.addEventListener('beforeunload', saveGame);
    
    // Update HTML title with current score
    setInterval(() => {
        document.title = `Score: ${score} | Cursor Clicker Game`;
    }, 1000);
}

// Create about button and panel
function createAboutButton() {
    // Create about button
    const aboutButton = document.createElement('button');
    aboutButton.innerHTML = '<i class="fas fa-info-circle"></i>';
    aboutButton.className = 'about-button';
    aboutButton.style.position = 'fixed';
    aboutButton.style.bottom = '20px';
    aboutButton.style.left = '20px';
    aboutButton.style.backgroundColor = 'rgba(20, 20, 20, 0.8)';
    aboutButton.style.color = '#ff3333';
    aboutButton.style.border = '1px solid rgba(255, 0, 0, 0.3)';
    aboutButton.style.borderRadius = '50%';
    aboutButton.style.width = '50px';
    aboutButton.style.height = '50px';
    aboutButton.style.fontSize = '1.5rem';
    aboutButton.style.cursor = 'none';
    aboutButton.style.zIndex = '1500';
    aboutButton.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.3)';
    
    document.body.appendChild(aboutButton);
    
    // Create about panel (hidden by default)
    const aboutPanel = document.createElement('div');
    aboutPanel.className = 'about-panel';
    aboutPanel.style.position = 'fixed';
    aboutPanel.style.bottom = '80px';
    aboutPanel.style.left = '20px';
    aboutPanel.style.backgroundColor = 'rgba(20, 20, 20, 0.9)';
    aboutPanel.style.color = 'white';
    aboutPanel.style.padding = '20px';
    aboutPanel.style.borderRadius = '10px';
    aboutPanel.style.border = '1px solid rgba(255, 0, 0, 0.3)';
    aboutPanel.style.width = '300px';
    aboutPanel.style.maxHeight = '400px';
    aboutPanel.style.overflowY = 'auto';
    aboutPanel.style.display = 'none';
    aboutPanel.style.zIndex = '1500';
    aboutPanel.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.3)';
    
    // Set about panel content
    aboutPanel.innerHTML = `
        <h3 style="color: #ff3333; margin-bottom: 15px; text-align: center;">About</h3>
        <div style="margin-bottom: 10px; text-align: center;">Clicker made by Tea Squad for NBPS Gaming</div>
        <div style="margin-bottom: 15px; text-align: center; font-style: italic; color: #ff9999;">More games coming soon!</div>
        <div style="margin-top: 20px; text-align: center;">
            <div style="border-top: 1px solid rgba(255, 0, 0, 0.3); padding-top: 10px;">
                <i class="fas fa-gamepad" style="color: #ff3333; font-size: 1.5rem;"></i>
            </div>
        </div>
    `;
    
    document.body.appendChild(aboutPanel);
    
    // Toggle about panel visibility
    aboutButton.addEventListener('click', () => {
        if (aboutPanel.style.display === 'none') {
            aboutPanel.style.display = 'block';
            // Add show animation
            aboutPanel.style.animation = 'slideInLeft 0.3s forwards';
        } else {
            aboutPanel.style.animation = 'slideOutLeft 0.3s forwards';
            setTimeout(() => {
                aboutPanel.style.display = 'none';
            }, 300);
        }
        
        // Add keyframes for animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInLeft {
                from { transform: translateX(-20px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutLeft {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(-20px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => {
            style.remove();
        }, 300);
    });
}

// Start the game
initGame(); 