class Bubble {
    constructor(x, y, radius, dx, dy, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.dx = dx;
        this.dy = dy;
        this.color = color;
        this.alpha = 1;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = `${this.color}${Math.floor(this.alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();
        ctx.closePath();
    }

    update(canvas) {
        this.x += this.dx;
        this.y += this.dy;

        // Bounce off walls
        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
            this.dx = -this.dx;
        }
        if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
            this.dy = -this.dy;
        }
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.bubbles = [];
        this.colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];
        this.isPlaying = false;
        this.isPaused = false;
        this.difficulty = 'normal';
        this.theme = 'classic';
        this.scoreElement = document.getElementById('score');
        this.overlay = document.querySelector('.game-overlay');
        this.startScreen = document.querySelector('.start-screen');
        this.howToPlay = document.querySelector('.how-to-play');
        
        this.init();
        this.setupEventListeners();
    }

    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                this.togglePause();
            }
        });
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    }

    setupEventListeners() {
        // Menu buttons
        const startButton = document.getElementById('startButton');
        const difficultyButton = document.getElementById('difficultyButton');
        const themeButton = document.getElementById('themeButton');
        const howToPlayButton = document.getElementById('howToPlayButton');
        const backButton = document.querySelector('.back-button');
        const pauseButton = document.getElementById('pauseButton');

        if (startButton) {
            startButton.addEventListener('click', () => this.startGame());
        }

        if (difficultyButton) {
            difficultyButton.addEventListener('click', () => this.cycleDifficulty());
        }

        if (themeButton) {
            themeButton.addEventListener('click', () => this.cycleTheme());
        }

        if (howToPlayButton) {
            howToPlayButton.addEventListener('click', () => {
                this.startScreen.style.display = 'none';
                this.howToPlay.style.display = 'block';
            });
        }

        if (backButton) {
            backButton.addEventListener('click', () => {
                this.howToPlay.style.display = 'none';
                this.startScreen.style.display = 'block';
            });
        }

        if (pauseButton) {
            pauseButton.addEventListener('click', () => this.togglePause());
        }

        this.canvas.addEventListener('click', (e) => this.handleClick(e));
    }

    cycleDifficulty() {
        const difficulties = ['easy', 'normal', 'hard'];
        const currentIndex = difficulties.indexOf(this.difficulty);
        this.difficulty = difficulties[(currentIndex + 1) % difficulties.length];
        document.getElementById('difficultyButton').textContent = `Difficulty: ${this.difficulty.charAt(0).toUpperCase() + this.difficulty.slice(1)}`;
    }

    cycleTheme() {
        const themes = ['classic', 'neon', 'pastel'];
        const currentIndex = themes.indexOf(this.theme);
        this.theme = themes[(currentIndex + 1) % themes.length];
        document.getElementById('themeButton').textContent = `Theme: ${this.theme.charAt(0).toUpperCase() + this.theme.slice(1)}`;
        this.updateThemeColors();
    }

    updateThemeColors() {
        const themes = {
            classic: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'],
            neon: ['#ff0080', '#00ff00', '#00ffff', '#ff00ff', '#ffff00'],
            pastel: ['#FFB5B5', '#B5FFB5', '#B5B5FF', '#FFB5FF', '#FFFFB5']
        };
        this.colors = themes[this.theme];
    }

    togglePause() {
        if (!this.isPlaying) return;
        
        this.isPaused = !this.isPaused;
        const pauseButton = document.getElementById('pauseButton');
        pauseButton.textContent = this.isPaused ? '▶️' : '⏸️';
        
        if (!this.isPaused) {
            this.animate();
        }
    }

    startGame() {
        console.log('Game started');
        this.isPlaying = true;
        this.isPaused = false;
        this.score = 0;
        this.scoreElement.textContent = this.score;
        this.bubbles = [];
        this.overlay.style.display = 'none';
        this.spawnBubbles();
        this.animate();
    }

    spawnBubbles() {
        if (!this.isPlaying || this.isPaused) return;

        const difficultySettings = {
            easy: { size: [20, 40], speed: 2, interval: 1500 },
            normal: { size: [10, 30], speed: 4, interval: 1000 },
            hard: { size: [5, 20], speed: 6, interval: 500 }
        };

        const settings = difficultySettings[this.difficulty];
        const radius = Math.random() * (settings.size[1] - settings.size[0]) + settings.size[0];
        const x = Math.random() * (this.canvas.width - radius * 2) + radius;
        const y = Math.random() * (this.canvas.height - radius * 2) + radius;
        const dx = (Math.random() - 0.5) * settings.speed;
        const dy = (Math.random() - 0.5) * settings.speed;
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];

        this.bubbles.push(new Bubble(x, y, radius, dx, dy, color));
        console.log('Bubble spawned', this.bubbles.length);

        setTimeout(() => this.spawnBubbles(), settings.interval);
    }

    handleClick(event) {
        if (this.isPaused) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const bubble = this.bubbles[i];
            const distance = Math.sqrt(
                Math.pow(x - bubble.x, 2) + Math.pow(y - bubble.y, 2)
            );

            if (distance < bubble.radius) {
                this.bubbles.splice(i, 1);
                const points = Math.floor(50 / bubble.radius);
                this.score += points;
                this.scoreElement.textContent = this.score;
                this.createPopEffect(bubble.x, bubble.y, bubble.color);
                break;
            }
        }
    }

    createPopEffect(x, y, color) {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const dx = Math.cos(angle) * 2;
            const dy = Math.sin(angle) * 2;
            const particle = new Bubble(x, y, 4, dx, dy, color);
            this.bubbles.push(particle);
            particle.alpha = 0.8;

            const fadeInterval = setInterval(() => {
                particle.alpha -= 0.05;
                if (particle.alpha <= 0) {
                    clearInterval(fadeInterval);
                    const index = this.bubbles.indexOf(particle);
                    if (index > -1) {
                        this.bubbles.splice(index, 1);
                    }
                }
            }, 50);
        }
    }

    animate() {
        if (!this.isPlaying || this.isPaused) return;

        this.ctx.fillStyle = 'rgba(26, 26, 46, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const bubble = this.bubbles[i];
            bubble.update(this.canvas);
            bubble.draw(this.ctx);
        }

        requestAnimationFrame(() => this.animate());
    }
}

// Start the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
    new Game();
});
