// Main Menu System
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const mainMenu = document.getElementById('mainMenu');
    const gameContainer = document.getElementById('gameContainer');
    const backToMenuBtn = document.getElementById('backToMenuBtn');
    const aboutMenuBtn = document.getElementById('aboutMenuBtn');
    const gameCards = document.querySelectorAll('.game-card');
    const playButtons = document.querySelectorAll('.play-btn:not([disabled])');
    const cursorFollower = document.getElementById('cursorFollower');
    
    // Menu button hover effects
    const menuButtons = document.querySelectorAll('.menu-btn, .play-btn, #backToMenuBtn');
    menuButtons.forEach(button => {
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
    
    // Game card hover effects
    gameCards.forEach(card => {
        if (!card.classList.contains('coming-soon')) {
            card.addEventListener('mouseenter', () => {
                cursorFollower.style.width = '40px';
                cursorFollower.style.height = '40px';
                cursorFollower.style.background = 'rgba(255, 0, 0, 0.7)';
            });

            card.addEventListener('mouseleave', () => {
                cursorFollower.style.width = '30px';
                cursorFollower.style.height = '30px';
                cursorFollower.style.background = 'rgba(255, 0, 0, 0.5)';
            });
        }
    });
    
    // Play button click events
    playButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const gameCard = btn.closest('.game-card');
            const gameType = gameCard.dataset.game;
            
            showGame(gameType);
        });
    });
    
    // Back to menu button
    backToMenuBtn.addEventListener('click', () => {
        // Save game progress before returning to menu
        if (typeof saveGame === 'function') {
            saveGame();
        }
        
        hideAllGames();
        showMainMenu();
    });
    
    // About menu button
    aboutMenuBtn.addEventListener('click', () => {
        showAboutMenu();
    });
    
    // Show about menu
    function showAboutMenu() {
        // Create modal if it doesn't exist
        let aboutModal = document.getElementById('aboutModal');
        
        if (!aboutModal) {
            aboutModal = document.createElement('div');
            aboutModal.id = 'aboutModal';
            aboutModal.className = 'modal-overlay';
            aboutModal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>About NBPS Gaming Hub</h2>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="about-content">
                            <h3>Created by Tea Squad for NBPS Gaming</h3>
                            <p>This gaming hub features a collection of games developed by the Tea Squad.</p>
                            <p>Currently available:</p>
                            <ul>
                                <li><strong>Cursor Clicker</strong> - An addictive clicking game with upgrades and auto-clickers</li>
                                <li><strong>Snake Game</strong> - Classic snake gameplay with a red and black theme</li>
                            </ul>
                            <p>More games coming soon!</p>
                        </div>
                        <div class="team-info">
                            <h3>About Tea Squad</h3>
                            <p>A passionate team of developers creating fun gaming experiences.</p>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(aboutModal);
            
            // Style the modal
            const style = document.createElement('style');
            style.textContent = `
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                
                .modal-content {
                    background: #1a0000;
                    border: 2px solid #660000;
                    border-radius: 10px;
                    width: 80%;
                    max-width: 600px;
                    box-shadow: 0 0 30px rgba(255, 0, 0, 0.3);
                    transform: translateY(-20px);
                    transition: transform 0.3s ease;
                }
                
                .modal-header {
                    padding: 15px 20px;
                    background: #330000;
                    border-bottom: 1px solid #660000;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .modal-header h2 {
                    color: #ff3333;
                    margin: 0;
                }
                
                .close-modal {
                    background: none;
                    border: none;
                    color: #ff3333;
                    font-size: 1.5rem;
                    cursor: none;
                }
                
                .modal-body {
                    padding: 20px;
                    max-height: 70vh;
                    overflow-y: auto;
                }
                
                .about-content, .team-info {
                    margin-bottom: 20px;
                }
                
                .about-content h3, .team-info h3 {
                    color: #ff3333;
                    border-bottom: 1px solid rgba(255, 0, 0, 0.3);
                    padding-bottom: 8px;
                }
                
                .modal-show {
                    opacity: 1;
                }
                
                .modal-show .modal-content {
                    transform: translateY(0);
                }
            `;
            
            document.head.appendChild(style);
            
            // Close button functionality
            const closeBtn = aboutModal.querySelector('.close-modal');
            closeBtn.addEventListener('click', () => {
                aboutModal.classList.remove('modal-show');
                setTimeout(() => {
                    aboutModal.style.display = 'none';
                }, 300);
            });
            
            // Hover effect for close button
            closeBtn.addEventListener('mouseenter', () => {
                cursorFollower.style.width = '40px';
                cursorFollower.style.height = '40px';
                cursorFollower.style.background = 'rgba(255, 0, 0, 0.8)';
            });
            
            closeBtn.addEventListener('mouseleave', () => {
                cursorFollower.style.width = '30px';
                cursorFollower.style.height = '30px';
                cursorFollower.style.background = 'rgba(255, 0, 0, 0.5)';
            });
        }
        
        // Show the modal
        aboutModal.style.display = 'flex';
        setTimeout(() => {
            aboutModal.classList.add('modal-show');
        }, 10);
    }
    
    // Show specific game
    function showGame(gameType) {
        hideMainMenu();
        
        // Show game container
        gameContainer.style.display = 'block';
        
        // Show specific game based on type
        if (gameType === 'clicker') {
            document.getElementById('clickerGame').style.display = 'block';
            document.getElementById('snakeGame').style.display = 'none';
            
            // Initialize the game if needed
            if (typeof initGame === 'function') {
                // Small delay to ensure DOM is ready
                setTimeout(() => {
                    initGame();
                }, 100);
            }
        } else if (gameType === 'snake') {
            document.getElementById('clickerGame').style.display = 'none';
            document.getElementById('snakeGame').style.display = 'block';
            
            // Initialize snake game if it exists
            if (typeof initGame === 'function') {
                // Give the DOM time to update before initializing
                setTimeout(() => {
                    try {
                        console.log('Menu: Initializing Snake Game');
                        initGame();
                        
                        // Make sure the Start button works
                        const startBtn = document.getElementById('startSnakeBtn');
                        if (startBtn) {
                            startBtn.onclick = function() {
                                if (typeof startGame === 'function') {
                                    startGame();
                                } else if (typeof window.startSnakeGameGlobal === 'function') {
                                    window.startSnakeGameGlobal();
                                }
                            };
                        }
                    } catch (e) {
                        console.error('Error initializing snake game:', e);
                    }
                }, 500); // Longer delay to ensure DOM is ready
            } else {
                console.log('Snake game initialization function not found');
            }
        }
    }
    
    // Hide all games
    function hideAllGames() {
        const games = document.querySelectorAll('.game');
        games.forEach(game => {
            game.style.display = 'none';
        });
        
        gameContainer.style.display = 'none';
    }
    
    // Show main menu
    function showMainMenu() {
        mainMenu.style.display = 'flex';
    }
    
    // Hide main menu
    function hideMainMenu() {
        mainMenu.style.display = 'none';
    }
    
    // Create background animation for menu
    function createMenuBackground() {
        const colors = ['#990000', '#660000', '#ff3333', '#cc0000'];
        const container = document.createElement('div');
        container.className = 'menu-background';
        container.style.position = 'absolute';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.top = '0';
        container.style.left = '0';
        container.style.zIndex = '-1';
        container.style.overflow = 'hidden';
        
        mainMenu.appendChild(container);
        
        // Create animated shapes
        for (let i = 0; i < 20; i++) {
            const shape = document.createElement('div');
            const size = Math.random() * 100 + 50;
            
            shape.style.position = 'absolute';
            shape.style.width = `${size}px`;
            shape.style.height = `${size}px`;
            shape.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            shape.style.opacity = '0.03';
            shape.style.borderRadius = Math.random() > 0.5 ? '50%' : '10%';
            
            // Random position
            shape.style.left = `${Math.random() * 100}vw`;
            shape.style.top = `${Math.random() * 100}vh`;
            
            // Animation
            const duration = Math.random() * 40 + 20;
            const direction = Math.random() > 0.5 ? 1 : -1;
            
            shape.style.animation = `floatAround ${duration}s linear infinite`;
            
            // Add keyframes for floating animation
            const keyframes = document.createElement('style');
            keyframes.innerHTML = `
                @keyframes floatAround {
                    0% {
                        transform: translate(0, 0) rotate(0deg);
                    }
                    33% {
                        transform: translate(${Math.random() * 100 * direction}px, ${Math.random() * 100}px) rotate(${Math.random() * 360}deg);
                    }
                    66% {
                        transform: translate(${Math.random() * -100 * direction}px, ${Math.random() * -100}px) rotate(${Math.random() * 720}deg);
                    }
                    100% {
                        transform: translate(0, 0) rotate(1080deg);
                    }
                }
            `;
            
            document.head.appendChild(keyframes);
            container.appendChild(shape);
        }
    }
    
    // Initialize the menu system
    function initMenuSystem() {
        createMenuBackground();
        
        // Set up click events for game cards
        gameCards.forEach(card => {
            if (!card.classList.contains('coming-soon')) {
                card.addEventListener('click', () => {
                    const gameType = card.dataset.game;
                    showGame(gameType);
                });
            }
        });
    }
    
    // Initialize the menu when the page loads
    initMenuSystem();
}); 