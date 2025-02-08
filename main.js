// Constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const GRAVITY = 0.5;
const JUMP_FORCE = -10;
const MOVE_SPEED = 5;

// Utility Functions
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Character {
    constructor(name, x, y, color) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 80;
        this.color = color;
        this.health = 1000;
        this.chakra = 1000;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isJumping = false;
        this.isSharinganActive = false;
        this.specialAttackCooldown = 0;
        this.isAttacking = false;
        this.attackDuration = 0;
        this.jumps = 0;
        this.jumpCooldown = 0;
        this.facingRight = true;
        this.attackAnimation = 0;
        this.attackDirection = 1;
    }

    reset() {
        this.health = 1000;
        this.chakra = 1000;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isJumping = false;
        this.isSharinganActive = false;
        this.specialAttackCooldown = 0;
        this.isAttacking = false;
        this.attackDuration = 0;
        this.jumps = 0;
        this.jumpCooldown = 0;
    }

    moveLeft() {
        this.velocityX = -MOVE_SPEED;
        this.facingRight = false;
    }

    moveRight() {
        this.velocityX = MOVE_SPEED;
        this.facingRight = true;
    }

    stopMoving() {
        this.velocityX = 0;
    }

    jump() {
        if (this.jumps < 2 && this.jumpCooldown === 0) {
            this.velocityY = JUMP_FORCE;
            this.jumps++;
            if (this.jumps === 2) {
                this.jumpCooldown = 60; // 1 second at 60 FPS
            }
        }
    }

    attack(opponent, type) {
        if (type === 'basic') {
            this.basicAttack(opponent);
        } else if (type === 'special') {
            this.specialAttack(opponent);
        }
        this.attackAnimation = 10;
        this.attackDirection = this.facingRight ? 1 : -1;
    }

    basicAttack(opponent) {
        if (this.isInRange(opponent) && !this.isAttacking) {
            opponent.takeDamage(10 * (this.isSharinganActive ? 1.5 : 1));
            this.isAttacking = true;
            this.attackDuration = 20;
        }
    }

    specialAttack(opponent) {
        if (this.chakra >= 20 && this.specialAttackCooldown === 0 && this.isInRange(opponent) && !this.isAttacking) {
            opponent.takeDamage(30 * (this.isSharinganActive ? 1.5 : 1));
            this.isAttacking = true;
            this.attackDuration = 30;
            this.chakra -= 20;
            this.specialAttackCooldown = 120;
        }
    }

    activateSharingan() {
        if (this.chakra >= 10) {
            this.isSharinganActive = !this.isSharinganActive;
        }
    }

    useKamui(opponent) {
        if (this.chakra >= 30) {
            this.x = opponent.x + (this.facingRight ? -100 : 100);
            this.chakra -= 30;
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
    }

    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        this.velocityY += GRAVITY;
        
        if (this.y + this.height > CANVAS_HEIGHT) {
            this.y = CANVAS_HEIGHT - this.height;
            this.velocityY = 0;
            this.isJumping = false;
            this.jumps = 0;
        }
        
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > CANVAS_WIDTH) this.x = CANVAS_WIDTH - this.width;
        
        if (this.chakra < 100) {
            this.chakra += 0.1;
        }
        
        if (this.specialAttackCooldown > 0) {
            this.specialAttackCooldown--;
        }
        
        if (this.attackDuration > 0) {
            this.attackDuration--;
        } else {
            this.isAttacking = false;
        }
        
        if (this.jumpCooldown > 0) {
            this.jumpCooldown--;
        }
        
        if (this.isSharinganActive) {
            this.chakra -= 0.2;
            if (this.chakra <= 0) {
                this.isSharinganActive = false;
                this.chakra = 0;
            }
        }

        if (this.attackAnimation > 0) {
            this.attackAnimation--;
        }
    }

    render(ctx) {
        // Body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Head
        ctx.fillStyle = '#FFE4B5';
        ctx.fillRect(this.x + 10, this.y - 20, 30, 30);

        // Eyes
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x + 15, this.y - 15, 8, 5);
        ctx.fillRect(this.x + 27, this.y - 15, 8, 5);

        // Pupils
        ctx.fillStyle = this.isSharinganActive ? 'red' : 'black';
        ctx.fillRect(this.x + 18, this.y - 14, 2, 3);
        ctx.fillRect(this.x + 30, this.y - 14, 2, 3);

        if (this.isSharinganActive) {
            // Sharingan pattern
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.x + 19, this.y - 12.5, 4, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(this.x + 31, this.y - 12.5, 4, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Hands
        ctx.fillStyle = '#FFE4B5';
        ctx.fillRect(this.x - 5, this.y + 30, 10, 20);
        ctx.fillRect(this.x + this.width - 5, this.y + 30, 10, 20);

        // Feet
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x + 5, this.y + this.height - 10, 15, 10);
        ctx.fillRect(this.x + this.width - 20, this.y + this.height - 10, 15, 10);

        // Attack animation
        if (this.attackAnimation > 0) {
            this.renderAttackAnimation(ctx);
        }
    }

    renderAttackAnimation(ctx) {
        const startX = this.x + (this.facingRight ? this.width : 0);
        const startY = this.y + 30;
        const endX = startX + (this.facingRight ? 50 : -50);
        const endY = startY;

        // Glowing effect
        ctx.strokeStyle = this.isAttacking ? 'rgba(255, 255, 0, 0.5)' : 'rgba(255, 165, 0, 0.5)';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Core of the attack
        ctx.strokeStyle = this.isAttacking ? 'yellow' : 'orange';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Particle effect
        for (let i = 0; i < 10; i++) {
            ctx.fillStyle = this.isAttacking ? 'rgba(255, 255, 0, 0.7)' : 'rgba(255, 165, 0, 0.7)';
            ctx.beginPath();
            ctx.arc(
                startX + (endX - startX) * Math.random(),
                startY + (endY - startY) * Math.random() + Math.sin(this.attackAnimation) * 10,
                2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    }

    isColliding(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }

    isInRange(opponent) {
        const range = 100;
        return Math.abs(this.x - opponent.x) < range && Math.abs(this.y - opponent.y) < 50;
    }
}

class AICharacter extends Character {
    constructor(name, x, y, color) {
        super(name, x, y, color);
    }

    update(target) {
        super.update();
        
        if (Math.random() < 0.02) {
            this.attack(target, 'basic');
        }
        
        if (target.x < this.x) {
            this.moveLeft();
        } else if (target.x > this.x) {
            this.moveRight();
        }
        
        if (Math.random() < 0.01 && !this.isJumping) {
            this.jump();
        }
    }
}

class Enemy extends Character {
    constructor(x, y, level) {
        super('Enemy', x, y, `rgb(${randomInt(100, 255)}, 0, 0)`);
        this.level = level;
        this.health = 50 + (level * 10);
        this.damage = 3 + (level * 2);
        this.speed = 2 + (level * 0.5);
    }

    update(target) {
        super.update();
        if (Math.random() < 0.02) {
            this.attack(target, 'basic');
        }
        if (target.x < this.x) {
            this.velocityX = -this.speed;
        } else if (target.x > this.x) {
            this.velocityX = this.speed;
        } else {
            this.velocityX = 0;
        }
    }

    render(ctx) {
        super.render(ctx);
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText(`Lvl ${this.level}`, this.x + 5, this.y - 5);
    }
}

class Particle {
    constructor(x, y, size, speedX, speedY, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speedX = speedX;
        this.speedY = speedY;
        this.color = color;
        this.alpha = 1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= 0.01;
    }

    render(ctx) {
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        
        this.obito = new Character('Obito', 100, 450, '#FF4500');
        this.kakashi = new AICharacter('Kakashi', 600, 450, '#4169E1');
        
        this.gameState = 'start';
        this.winner = null;
        
        this.startScreen = document.getElementById('start-screen');
        this.particles = [];
        this.level = 1;
        this.enemies = [];
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    handleKeyDown(e) {
        if (this.gameState === 'start' && e.key === ' ') {
            this.startGame();
            return;
        }

        if (this.gameState !== 'playing') return;

        switch(e.key) {
            case 'a':
            case 'ArrowLeft':
                this.obito.moveLeft();
                break;
            case 'd':
            case 'ArrowRight':
                this.obito.moveRight();
                break;
            case ' ':
                this.obito.jump();
                break;
            case 'q':
                this.obito.attack(this.kakashi, 'basic');
                break;
            case 'w':
                this.obito.attack(this.kakashi, 'special');
                break;
            case 'e':
                this.obito.useKamui(this.kakashi);
                break;
            case 'r':
                this.obito.activateSharingan();
                break;
        }
    }

    handleKeyUp(e) {
        switch(e.key) {
            case 'a':
            case 'd':
            case 'ArrowLeft':
            case 'ArrowRight':
                this.obito.stopMoving();
                break;
        }
    }

    start() {
        console.log('Game started');
        this.showStartScreen();
        this.render();
    }

    startGame() {
        console.log('Starting game');
        this.hideStartScreen();
        this.gameState = 'playing';
        this.obito.reset();
        this.kakashi.reset();
        this.enemies = [];
        this.level = 1;
        this.startLevel();
        this.gameLoop();
    }

    startLevel() {
        this.enemies = [];
        // const enemyCount = Math.min(this.level + 2, 10);
        // for (let i = ; i < enemyCount; i++) {
        //     this.enemies.push(new Enemy(randomInt(100, CANVAS_WIDTH - 100), 450, Math.ceil(this.level / 2)));
        // }
    }

    showStartScreen() {
        this.startScreen.style.display = 'flex';
    }

    hideStartScreen() {
        this.startScreen.style.display = 'none';
    }

    gameLoop() {
        this.update();
        this.render();
        
        if (this.gameState === 'playing') {
            requestAnimationFrame(() => this.gameLoop());
        }
    }

    update() {
        this.obito.update();
        this.kakashi.update(this.obito);
        this.enemies.forEach(enemy => enemy.update(this.obito));
        
        this.checkCollisions();
        this.checkWinCondition();
        
        // this.enemies = this.enemies.filter(enemy => enemy.health > 0);

        // if (this.enemies.length === 0 || (this.enemies.length < 5 && Math.random() < 0.1)) {
        //     this.spawnEnemy();
        // }

        if (Math.random() < 0.1) {
            this.addParticle();
        }

        this.particles = this.particles.filter(particle => {
            particle.update();
            return particle.alpha > 0;
        });
    }

        spawnEnemy() {
            const newEnemy = new Enemy(
                randomInt(50, CANVAS_WIDTH - 100),
                450,
                Math.ceil(this.level / 1)
            );
            this.enemies.push(newEnemy);
        }

    checkCollisions() {
        if (this.obito.isColliding(this.kakashi)) {
            if (this.obito.isAttacking) {
                this.kakashi.takeDamage(5);
            }
            if (this.kakashi.isAttacking) {
                this.obito.takeDamage(5);
            }
        }
        this.enemies.forEach(enemy => {
            if (this.obito.isColliding(enemy)) {
                if (this.obito.isAttacking) {
                    enemy.takeDamage(10);
                }
                
            }
        });
    }

    checkWinCondition() {
        if (this.obito.health <= 0) {
            this.gameState = 'over';
            this.winner = this.kakashi;
            this.showGameOver();
        } else if (this.kakashi.health <= 0 && this.enemies.every(enemy => enemy.health <= 0)) {
            this.gameState = 'over';
            this.winner = this.obito;
            this.showGameOver();
        }
    }

    showGameOver() {
        console.log('Game Over');
        this.gameState = 'over';
    }

    addParticle() {
        const x = Math.random() * CANVAS_WIDTH;
        const y = Math.random() * CANVAS_HEIGHT;
        const size = Math.random() * 3 + 1;
        const speedX = Math.random() * 2 - 1;
        const speedY = Math.random() * 2 - 1;
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
        this.particles.push(new Particle(x, y, size, speedX, speedY, color));
    }

    renderBackground() {
        // Sky gradient
        const skyGradient = this.ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        skyGradient.addColorStop(0, '#87CEEB');
        skyGradient.addColorStop(1, '#E0F6FF');
        this.ctx.fillStyle = skyGradient;
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Sun
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(CANVAS_WIDTH - 50, 50, 30, 0, Math.PI * 2);
        this.ctx.fill();

        // Clouds
        this.renderCloud(100, 100, 60);
        this.renderCloud(300, 50, 80);
        this.renderCloud(600, 120, 70);

        // Mountains
        this.renderMountain(0, CANVAS_HEIGHT, 300, 200, '#4B5320');
        this.renderMountain(250, CANVAS_HEIGHT, 350, 250, '#3A421A');
        this.renderMountain(500, CANVAS_HEIGHT, 400, 300, '#2E3514');

        // Ground
        const groundGradient = this.ctx.createLinearGradient(0, CANVAS_HEIGHT - 100, 0, CANVAS_HEIGHT);
        groundGradient.addColorStop(0, '#228B22');
        groundGradient.addColorStop(1, '#006400');
        this.ctx.fillStyle = groundGradient;
        this.ctx.fillRect(0, CANVAS_HEIGHT - 100, CANVAS_WIDTH, 100);
    }

    renderCloud(x, y, size) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.beginPath();
        this.ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.35, y - size * 0.2, size * 0.4, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.7, y, size * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
    }

    renderMountain(x, y, width, height, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + width / 2, y - height);
        this.ctx.lineTo(x + width, y);
        this.ctx.closePath();
        this.ctx.fill();
    }

    render() {
        this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        this.renderBackground();
        this.particles.forEach(particle => particle.render(this.ctx));
        this.obito.render(this.ctx);
        this.kakashi.render(this.ctx);
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        this.renderUI();
        
        if (this.gameState === 'over') {
            this.renderGameOver();
        }
    }

    renderUI() {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Obito Health: ${Math.floor(this.obito.health)}`, 10, 20);
        this.ctx.fillText(`Obito Chakra: ${Math.floor(this.obito.chakra)}`, 10, 40);
        this.ctx.fillText(`Kakashi Health: ${Math.floor(this.kakashi.health)}`, CANVAS_WIDTH - 150, 20);
        this.ctx.fillText(`Level: ${this.level}`, CANVAS_WIDTH / 2 - 20, 20);
    }

    renderGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${this.winner.name} Wins!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Press Space to Play Again', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
    }
}

// Initialize the game when the window loads
window.addEventListener('load', () => {
    console.log('Window loaded');
    const game = new Game();
    game.start();
});
