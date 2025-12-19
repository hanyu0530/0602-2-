// 遊戲常量
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const MAX_LEVEL = 3; // 新增：最大等級限制

// 獲取畫布和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// 遊戲狀態
let score = 0;
let gameOver = false;
let gameStarted = false;
let knowledgePoints = 0;
let level = 1;
let levelProgress = 0;
let powerUps = [];
let isAnswering = false;
let currentQuestion = null;
let questionTimer = 0;
let particles = []; // 新增：粒子陣列

// UI 動畫狀態
let lastScore = 0;
let scoreAnimationTimer = 0;
let lastKnowledgePoints = 0;
let knowledgeAnimationTimer = 0;
let lastLevel = 1;
let levelAnimationTimer = 0;

// 背景星星
const stars = Array.from({ length: 200 }, () => ({
    x: Math.random() * CANVAS_WIDTH,
    y: Math.random() * CANVAS_HEIGHT,
    size: Math.random() * 2 + 1,
    speed: Math.random() * 2 + 1,
    brightness: Math.random() * 0.5 + 0.5
}));

// 教育科技知識點
const knowledgeItems = [
    { name: "數位學習設計", points: 5, color: '#4CAF50', speed: 2, health: 1, isCorrect: true },
    { name: "科技融入教學", points: 5, color: '#2196F3', speed: 3, health: 1, isCorrect: true },
    { name: "學習分析", points: 5, color: '#9C27B0', speed: 2, health: 2, isCorrect: true },
    { name: "互動式教材", points: 5, color: '#FF9800', speed: 4, health: 1, isCorrect: true },
    { name: "AR/VR教育", points: 5, color: '#E91E63', speed: 2, health: 3, isCorrect: true },
    { name: "死記硬背", points: -5, color: '#FF0000', speed: 3, health: 1, isCorrect: false },
    { name: "填鴨式教學", points: -5, color: '#FF0000', speed: 4, health: 1, isCorrect: false },
    { name: "機械式學習", points: -5, color: '#FF0000', speed: 2, health: 2, isCorrect: false },
    { name: "被動學習", points: -5, color: '#FF0000', speed: 3, health: 1, isCorrect: false },
    { name: "單向灌輸", points: -5, color: '#FF0000', speed: 2, health: 2, isCorrect: false }
];

// 特殊道具
const powerUpTypes = [
    { 
        name: "加速器", 
        color: '#00ff00', 
        effect: "speed", 
        duration: 5000,
        description: "提升飛船移動速度"
    },
    { 
        name: "護盾", 
        color: '#0000ff', 
        effect: "shield", 
        duration: 3000,
        description: "暫時無敵"
    },
    { 
        name: "雙倍分數", 
        color: '#ffff00', 
        effect: "doubleScore", 
        duration: 5000,
        description: "得分翻倍"
    },
    { 
        name: "散射", 
        color: '#ff00ff', 
        effect: "spreadShot", 
        duration: 4000,
        description: "發射多發子彈"
    },
   
];

// 教育科技問題庫
const questions = [
    {
        question: "數位學習相較於傳統教學模式，其核心特性為何？",
        options: ["以面對面互動為主", "藉由資訊科技促進自主與彈性學習", "完全依賴教師指導", "不需任何教學規劃"],
        correct: 1
    },
    {
        question: "在教學設計理論中，課程設計的核心目的主要在於？",
        options: ["提高學生標準化測驗成績", "系統化規劃教學活動以提升學習成效", "精簡教師教學時間與負擔", "增加作業以加強練習"],
        correct: 1
    },
    {
        question: "下列何者不屬於教育科技的應用範疇？",
        options: ["數位教學內容開發", "教學管理與學習分析平台建置", "傳統粉筆黑板授課方式", "線上學習系統與互動模組設計"],
        correct: 2
    },
    {
        question: "相較於傳統教材，數位教材的主要優勢為何？",
        options: ["可完全取代教師授課", "具高互動性與多媒體整合能力", "製作過程不需專業知識", "完全不需網路或設備支援"],
        correct: 1
    },
    {
        question: "教育研究的目的是什麼？",
        options: ["增加學校收入", "提高教師工資", "改進教育實踐", "減少學生數量"],
        correct: 2
    }
];

// 粒子類別
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 5 + 2; // 粒子大小
        this.speedX = (Math.random() - 0.5) * 5; // 水平速度
        this.speedY = (Math.random() - 0.5) * 5; // 垂直速度
        this.alpha = 1; // 透明度
        this.gravity = 0.1; // 重力效果
        this.friction = 0.98; // 摩擦力
    }

    update() {
        this.speedX *= this.friction;
        this.speedY *= this.friction;
        this.speedY += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= 0.02; // 透明度隨時間降低
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 玩家飛船類
class Spaceship {
    constructor() {
        this.width = 50;
        this.height = 50;
        this.x = CANVAS_WIDTH / 2 - this.width / 2;
        this.y = CANVAS_HEIGHT - this.height - 20;
        this.speed = 5;
        this.color = '#00ff00';
        this.lastShootTime = 0;
        this.engineGlow = 0;
        this.engineGlowDirection = 1;
        this.shield = false;
        this.shieldTime = 0;
        this.speedBoost = false;
        this.speedBoostTime = 0;
        this.doubleScore = false;
        this.doubleScoreTime = 0;
        this.spreadShot = false;
        this.spreadShotTime = 0;
        this.slowTime = false;
        this.slowTimeTime = 0;
        this.level = 1; // 新增：飛船等級
        this.upgradeAnimation = 0; // 新增：升級動畫計時器
    }

    draw() {
        // 引擎光效
        this.engineGlow += 0.1 * this.engineGlowDirection;
        if (this.engineGlow >= 1) this.engineGlowDirection = -1;
        if (this.engineGlow <= 0) this.engineGlowDirection = 1;

        // 根據等級調整飛船樣式
        let spaceshipColor = '#00ff00'; // 等級1顏色
        let engineColor = '#00ff00';
        let spaceshipSize = 50;
        if (this.level === 2) { spaceshipColor = '#00ffff'; engineColor = '#00ffff'; spaceshipSize = 55; }
        else if (this.level === 3) { spaceshipColor = '#ffff00'; engineColor = '#ffff00'; spaceshipSize = 60; }
        else if (this.level === 4) { spaceshipColor = '#ff00ff'; engineColor = '#ff00ff'; spaceshipSize = 65; }
        else if (this.level >= 5) { spaceshipColor = '#ff0000'; engineColor = '#ff0000'; spaceshipSize = 70; }

        // 繪製引擎噴射效果 (使用當前等級的引擎顏色)
        const gradient = ctx.createLinearGradient(
            this.x + spaceshipSize/2, this.y + spaceshipSize,
            this.x + spaceshipSize/2, this.y + spaceshipSize + 40
        );
        gradient.addColorStop(0, `rgba(${parseInt(engineColor.slice(1, 3), 16)}, ${parseInt(engineColor.slice(3, 5), 16)}, ${parseInt(engineColor.slice(5, 7), 16)}, ${0.8 + this.engineGlow * 0.2})`);
        gradient.addColorStop(0.5, `rgba(255, 255, 0, ${0.5 + this.engineGlow * 0.3})`); // 黃色部分不隨等級變
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(this.x + spaceshipSize/2 - 15, this.y + spaceshipSize);
        ctx.lineTo(this.x + spaceshipSize/2 + 15, this.y + spaceshipSize);
        ctx.lineTo(this.x + spaceshipSize/2, this.y + spaceshipSize + 40);
        ctx.closePath();
        ctx.fill();

        // 飛船主體
        ctx.save();
        ctx.translate(this.x + spaceshipSize/2, this.y + spaceshipSize/2);
        
        // 飛船外層光暈
        const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, spaceshipSize/2);
        glowGradient.addColorStop(0, `${spaceshipColor}33`);
        glowGradient.addColorStop(1, `${spaceshipColor}00`);
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(0, 0, spaceshipSize/2, 0, Math.PI * 2);
        ctx.fill();

        // 飛船主體 (使用當前等級的顏色)
        ctx.fillStyle = spaceshipColor;
        ctx.beginPath();
        ctx.moveTo(0, -spaceshipSize/2);
        ctx.lineTo(spaceshipSize/2, spaceshipSize/2);
        ctx.lineTo(-spaceshipSize/2, spaceshipSize/2);
        ctx.closePath();
        ctx.fill();

        // 飛船裝飾線條 (大小隨等級變化)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -spaceshipSize/2);
        ctx.lineTo(0, spaceshipSize/2);
        ctx.stroke();

        // 飛船標誌 (大小隨等級變化)
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${14 + (this.level - 1) * 2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('TKU', 0, 0);

        // 護盾效果 (大小隨等級變化)
        if (this.shield) {
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, spaceshipSize/2 + 5, 0, Math.PI * 2);
            ctx.stroke();
        }

        // 升級動畫效果 (簡單的閃爍)
        if (this.upgradeAnimation > 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, '+ (this.upgradeAnimation % 10 > 5 ? 0.5 : 0) +')';
            ctx.beginPath();
            ctx.arc(0, 0, spaceshipSize/2 + 10, 0, Math.PI * 2);
            ctx.fill();
            this.upgradeAnimation--;
        }

        ctx.restore();
    }

    move(dx, dy) {
        this.x = Math.max(0, Math.min(CANVAS_WIDTH - this.width, this.x + dx));
        this.y = Math.max(0, Math.min(CANVAS_HEIGHT - this.height, this.y + dy));
    }

    shoot() {
        const currentTime = Date.now();
        if (currentTime - this.lastShootTime >= 300) {
            this.lastShootTime = currentTime;
            const bullets = [];
            
            if (this.spreadShot) {
                // 散射模式
                for (let i = -2; i <= 2; i++) {
                    const bullet = new Bullet(this.x + this.width / 2 - 2.5, this.y);
                    bullet.angle = i * 15; // 散射角度
                    bullets.push(bullet);
                }
            } else {
                // 普通射擊
                bullets.push(new Bullet(this.x + this.width / 2 - 2.5, this.y));
            }
            
            return bullets;
        }
        return null;
    }

    updateEffects() {
        const currentTime = Date.now();
        if (this.shield && currentTime > this.shieldTime) {
            this.shield = false;
        }
        if (this.speedBoost && currentTime > this.speedBoostTime) {
            this.speedBoost = false;
        }
        if (this.doubleScore && currentTime > this.doubleScoreTime) {
            this.doubleScore = false;
        }
        if (this.spreadShot && currentTime > this.spreadShotTime) {
            this.spreadShot = false;
        }
        if (this.slowTime && currentTime > this.slowTimeTime) {
            this.slowTime = false;
        }
    }
}

// 子彈類
class Bullet {
    constructor(x, y) {
        this.width = 5;
        this.height = 15;
        this.x = x;
        this.y = y;
        this.speed = 7;
        this.angle = 0; // 子彈角度
        this.trail = [];
        this.color = '#ffff00'; // 恢復：子彈顏色屬性 (默認玩家子彈為黃色)
        this.directionY = -1; // 恢復：垂直移動方向 (-1 向上)
        this.isBossBullet = false; // 移除：是否為 Boss 子彈標記
    }

    draw() {
        // 繪製子彈拖尾效果
        this.trail.push({ x: this.x + this.width/2, y: this.y + this.height });
        if (this.trail.length > 5) this.trail.shift(); // 恢復：原來的拖尾長度控制

        // 繪製拖尾
        ctx.beginPath();
        ctx.moveTo(this.trail[0].x, this.trail[0].y);
        for (let i = 1; i < this.trail.length; i++) {
            ctx.lineTo(this.trail[i].x, this.trail[i].y);
        }
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)'; // 恢復：原來的樣式
        ctx.lineWidth = 2; // 恢復：原來的線寬
        ctx.stroke();

        // 繪製子彈 (使用子彈的顏色屬性)
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, '#ffff00');
        gradient.addColorStop(1, '#ff8800');
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    move() {
        // 根據角度計算移動 (恢復到只向上移動)
        const radians = this.angle * Math.PI / 180;
        this.x += Math.sin(radians) * this.speed;
        this.y -= Math.cos(radians) * this.speed; // 向上移動
    }

    isOffScreen() {
        // 恢復到只判斷是否超出上方邊界
        return this.y < 0;
    }
}

// 敵人類
class Enemy {
    constructor() {
        const type = Math.floor(Math.random() * knowledgeItems.length);
        this.width = 80;
        this.height = 80;
        this.x = Math.random() * (CANVAS_WIDTH - this.width);
        this.y = -this.height;
        this.speed = knowledgeItems[type].speed * 1.5; // 加快速度
        this.health = knowledgeItems[type].health;
        this.type = type;
        this.rotation = 0;
        this.movementPattern = Math.random() < 0.3 ? 'zigzag' : 'straight';
        this.zigzagOffset = 0;
        this.zigzagSpeed = 0.05;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.rotation);
        
        // 背景光暈
        const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width/2);
        const itemColor = knowledgeItems[this.type].color;
        glowGradient.addColorStop(0, `${itemColor}33`);
        glowGradient.addColorStop(1, `${itemColor}00`);
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.width/2, 0, Math.PI * 2);
        ctx.fill();

        // 背景面板
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.beginPath();
        ctx.roundRect(-this.width/2, -this.height/2, this.width, this.height, 10);
        ctx.fill();
        
        // 邊框效果
        ctx.strokeStyle = knowledgeItems[this.type].color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(-this.width/2, -this.height/2, this.width, this.height, 10);
        ctx.stroke();

        // 錯誤選項警告標誌
        if (!knowledgeItems[this.type].isCorrect) {
            // 警告標誌背景
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.arc(0, -this.height/2 + 20, 15, 0, Math.PI * 2);
            ctx.fill();
            
            // 警告標誌文字
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('!', 0, -this.height/2 + 20);
        }

        // 文字效果
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 文字陰影
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // 文字換行處理
        const text = knowledgeItems[this.type].name;
        const words = text.split('');
        let line = '';
        let y = -10;
        
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i];
            const metrics = ctx.measureText(testLine);
            if (metrics.width > this.width - 20) {
                ctx.fillText(line, 0, y);
                line = words[i];
                y += 25;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, 0, y);
        
        // 重置陰影
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        ctx.restore();
    }

    move() {
        if (this.movementPattern === 'zigzag') {
            this.zigzagOffset += this.zigzagSpeed;
            this.x += Math.sin(this.zigzagOffset) * 3;
        }
        this.y += this.speed;
        this.rotation += 0.02;
    }

    isOffScreen() {
        return this.y > CANVAS_HEIGHT;
    }

    checkCollision(bullet) {
        return (
            this.x < bullet.x + bullet.width &&
            this.x + this.width > bullet.x &&
            this.y < bullet.y + bullet.height &&
            this.y + this.height > bullet.y
        );
    }
}

// 道具類
class PowerUp {
    constructor() {
        this.width = 30;
        this.height = 30;
        this.x = Math.random() * (CANVAS_WIDTH - this.width);
        this.y = -this.height;
        this.speed = 3; // 加快速度
        this.type = Math.floor(Math.random() * powerUpTypes.length);
        this.rotation = 0;
        this.glowAlpha = 0;
        this.glowDirection = 1;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.rotation);
        
        // 更新光芒透明度
        this.glowAlpha += this.glowDirection * 0.03;
        if (this.glowAlpha > 0.8 || this.glowAlpha < 0.2) {
            this.glowDirection *= -1;
        }

        // 繪製光芒效果
        const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width);
        const itemColor = powerUpTypes[this.type].color;
        const baseColorRGB = ctx.createLinearGradient(0, -this.height/2, 0, this.height/2);
        baseColorRGB.addColorStop(0, `${itemColor}`);
        baseColorRGB.addColorStop(1, `${itemColor}80`); // 底部稍微透明

        glowGradient.addColorStop(0, `${itemColor}${Math.floor(this.glowAlpha * 255).toString(16).padStart(2, '0')}`);
        glowGradient.addColorStop(1, `${itemColor}00`);
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.width, 0, Math.PI * 2);
        ctx.fill();

        // 繪製道具主體 (菱形漸變)
        const diamondGradient = ctx.createLinearGradient(-this.width/2, 0, this.width/2, 0);
        diamondGradient.addColorStop(0, `${itemColor}80`); // 左側半透明
        diamondGradient.addColorStop(0.5, `${itemColor}`); // 中心不透明
        diamondGradient.addColorStop(1, `${itemColor}80`); // 右側半透明

        ctx.fillStyle = diamondGradient;
        ctx.beginPath();
        ctx.moveTo(0, -this.height/2); // 頂部
        ctx.lineTo(this.width/2, 0); // 右側
        ctx.lineTo(0, this.height/2); // 底部
        ctx.lineTo(-this.width/2, 0); // 左側
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    move() {
        this.y += this.speed;
        this.rotation += 0.02;
    }

    isOffScreen() {
        return this.y > CANVAS_HEIGHT;
    }

    checkCollision(spaceship) {
        return (
            this.x < spaceship.x + spaceship.width &&
            this.x + this.width > spaceship.x &&
            this.y < spaceship.y + spaceship.height &&
            this.y + this.height > spaceship.y
        );
    }
}

// 創建遊戲對象
const player = new Spaceship();
let bullets = [];
let enemies = [];
let enemySpawnTimer = 0;
let powerUpSpawnTimer = 0;

// 初始化 MediaPipe Hands
const hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});

hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.5
});

// 設置攝像頭
const video = document.getElementById('videoElement');
const camera = new Camera(video, {
    onFrame: async () => {
        await hands.send({image: video});
    },
    width: 320,
    height: 240
});
camera.start();

// 新增：當前食指位置和停留時間
let currentFingerPosition = null;
let hoverStartTime = null;
let hoveredOptionIndex = -1;

// 修改手勢識別結果處理
hands.onResults((results) => {
    if (!gameStarted) return;
    
    if (results.multiHandLandmarks) {
        const landmarks = results.multiHandLandmarks[0];
        if (landmarks) {
            const wrist = landmarks[0];
            const x = (1 - wrist.x) * CANVAS_WIDTH;
            const y = wrist.y * CANVAS_HEIGHT;
            
            const dx = (x - player.x) / 10;
            const dy = (y - player.y) / 10;
            player.move(dx, dy);

            const indexFinger = landmarks[8];
            const middleFinger = landmarks[12];
            const ringFinger = landmarks[16];
            const pinkyFinger = landmarks[20];

            const isIndexBent = indexFinger.y > landmarks[6].y;
            const isMiddleBent = middleFinger.y > landmarks[10].y;
            const isRingBent = ringFinger.y > landmarks[14].y;
            const isPinkyBent = pinkyFinger.y > landmarks[18].y;

            // 更新食指位置
            currentFingerPosition = {
                x: (1 - indexFinger.x) * CANVAS_WIDTH,
                y: indexFinger.y * CANVAS_HEIGHT
            };

            // 如果正在回答問題，檢查食指是否指向某個選項
            if (isAnswering && currentFingerPosition) {
                const { x, y } = currentFingerPosition;
                let foundOption = false;
                
                currentQuestion.options.forEach((option, index) => {
                    const optionY = CANVAS_HEIGHT/2 - 50 + index * 50;
                    if (y >= optionY - 20 && y <= optionY + 20 &&
                        x >= CANVAS_WIDTH/2 - 250 && x <= CANVAS_WIDTH/2 + 250) {
                        foundOption = true;
                        if (hoveredOptionIndex !== index) {
                            // 如果指向了新的選項，重置計時器
                            hoverStartTime = Date.now();
                            hoveredOptionIndex = index;
                        } else {
                            // 如果持續指向同一個選項，檢查停留時間
                            const hoverDuration = Date.now() - hoverStartTime;
                            if (hoverDuration >= 2000) { // 2秒
                                handleAnswer(index);
                                hoverStartTime = null;
                                hoveredOptionIndex = -1;
                            }
                        }
                    }
                });
                
                if (!foundOption) {
                    // 如果沒有指向任何選項，重置計時器
                    hoverStartTime = null;
                    hoveredOptionIndex = -1;
                }
            }

            if (isIndexBent && isMiddleBent && isRingBent && isPinkyBent) {
                const newBullets = player.shoot();
                if (newBullets) {
                    bullets.push(...newBullets);
                }
            }
        }
    }
});

// 繪製背景
function drawBackground() {
    // 繪製漸變背景
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#000033');
    gradient.addColorStop(1, '#000066');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 更新和繪製星星
    stars.forEach(star => {
        star.y += star.speed;
        if (star.y > CANVAS_HEIGHT) {
            star.y = 0;
            star.x = Math.random() * CANVAS_WIDTH;
        }
        ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // 繪製網格效果
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < CANVAS_WIDTH; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, CANVAS_HEIGHT);
        ctx.stroke();
    }
    for (let i = 0; i < CANVAS_HEIGHT; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(CANVAS_WIDTH, i);
        ctx.stroke();
    }
}

// 繪製UI
function drawUI() {
    // 繪製半透明背景面板
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 200, 180);

    // 繪製分數
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('分數', 20, 40);

    // 分數更新動畫
    if (scoreAnimationTimer > 0) {
        ctx.fillStyle = `rgba(0, 255, 0, ${scoreAnimationTimer / 20})`; // 綠色閃爍
        ctx.font = 'bold 28px Arial';
        scoreAnimationTimer--;
    } else {
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 24px Arial';
    }
    ctx.fillText(score.toString(), 100, 40);

    // 繪製知識點
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('知識點', 20, 70);

    // 知識點更新動畫
    if (knowledgeAnimationTimer > 0) {
        ctx.fillStyle = `rgba(0, 255, 255, ${knowledgeAnimationTimer / 20})`; // 青色閃爍
         ctx.font = 'bold 28px Arial';
        knowledgeAnimationTimer--;
    } else {
        ctx.fillStyle = '#00ffff';
         ctx.font = 'bold 24px Arial';
    }
    ctx.fillText(knowledgePoints.toString(), 100, 70);

    // 繪製等級
    ctx.fillStyle = '#ffffff';
     ctx.font = 'bold 24px Arial';
    ctx.fillText('等級', 20, 100);

    // 等級更新動畫
    if (levelAnimationTimer > 0) {
        ctx.fillStyle = `rgba(255, 255, 0, ${levelAnimationTimer / 20})`; // 黃色閃爍
         ctx.font = 'bold 28px Arial';
        levelAnimationTimer--;
    } else {
        ctx.fillStyle = '#ffff00';
         ctx.font = 'bold 24px Arial';
    }
    ctx.fillText(level.toString(), 100, 100);

    // 進度條
    ctx.fillStyle = '#ffffff';
    ctx.fillText('進度', 20, 130);
    const progressWidth = 150;
    const progress = levelProgress / (level * 10);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(100, 115, progressWidth, 15);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(100, 115, progressWidth * progress, 15);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${levelProgress}/${level * 10}`, 260, 130);

    // 繪製當前效果
    let effectY = 160;
    if (player.shield) {
        ctx.fillStyle = '#00ffff';
        ctx.fillText('護盾啟動中', 20, effectY);
        effectY += 30;
    }
    if (player.doubleScore) {
        ctx.fillStyle = '#ffff00';
        ctx.fillText('雙倍分數', 20, effectY);
        effectY += 30;
    }
    if (player.speedBoost) {
        ctx.fillStyle = '#00ff00';
        ctx.fillText('速度提升', 20, effectY);
    }
}

// 繪製問題界面
function drawQuestion() {
    if (!currentQuestion) return;

    // 繪製半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 繪製問題框
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(CANVAS_WIDTH/2 - 300, CANVAS_HEIGHT/2 - 200, 600, 400);

    // 繪製問題
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('升級問題', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 - 150);
    
    ctx.font = '20px Arial';
    ctx.fillText(currentQuestion.question, CANVAS_WIDTH/2, CANVAS_HEIGHT/2 - 100);

    // 繪製選項
    ctx.font = '18px Arial';
    currentQuestion.options.forEach((option, index) => {
        const y = CANVAS_HEIGHT/2 - 50 + index * 50;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(CANVAS_WIDTH/2 - 250, y - 20, 500, 40);
        
        // 如果當前選項被指向，顯示進度條
        if (index === hoveredOptionIndex && hoverStartTime) {
            const progress = Math.min((Date.now() - hoverStartTime) / 2000, 1);
            ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
            ctx.fillRect(CANVAS_WIDTH/2 - 250, y - 20, 500 * progress, 40);
        }
        
        ctx.fillStyle = '#ffffff';
        ctx.fillText(option, CANVAS_WIDTH/2, y + 5);
    });

    // 繪製倒計時
    const timeLeft = Math.ceil((10000 - questionTimer) / 1000);
    ctx.fillStyle = timeLeft <= 3 ? '#ff0000' : '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`剩餘時間: ${timeLeft}秒`, CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 150);

    // 繪製食指指示器
    if (currentFingerPosition) {
        const { x, y } = currentFingerPosition;
        
        // 繪製外圈
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 繪製內圈
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
    }
}

// 遊戲主循環
function gameLoop() {
    if (!gameStarted) {
        drawBackground();
        requestAnimationFrame(gameLoop);
        return;
    }

    if (gameOver) {
        // 如果遊戲結束，只繪製背景和結算畫面
        drawBackground();
        showGameSummary();
        requestAnimationFrame(gameLoop);
        return;
    }

    // 清空畫布
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 繪製背景
    drawBackground();

    // 更新玩家效果
    player.updateEffects();

    // 更新和繪製玩家子彈
    bullets = bullets.filter(bullet => {
        bullet.move();
        bullet.draw();
        return !bullet.isOffScreen();
    });

    // 生成敵人
    enemies = enemies.filter(enemy => {
       enemy.move();
        // 在敵人繪製之前更新粒子，這樣粒子會在敵人下方
        // particles = particles.filter(particle => {
        //     particle.update();
        //     particle.draw();
        //     return particle.alpha > 0.1;
        // });
        
        enemy.draw();
        
        for (let i = bullets.length - 1; i >= 0; i--) {
            if (enemy.checkCollision(bullets[i])) {
                enemy.health--;
                 // 新增：在子彈擊中敵人時創建火花粒子
                 const impactX = bullets[i].x + bullets[i].width/2;
                 const impactY = bullets[i].y + bullets[i].height/2;
                 const particleColor = knowledgeItems[enemy.type].color;
                 for(let j = 0; j < 10; j++) { // 創建10個火花粒子
                      // 使用更快的速度和更短的生命週期來模擬火花
                     const sparkSpeedX = (Math.random() - 0.5) * 10;
                     const sparkSpeedY = (Math.random() - 0.5) * 10;
                     const spark = new Particle(impactX, impactY, '#ffff00'); // 火花顏色為黃色
                     spark.speedX = sparkSpeedX;
                     spark.speedY = sparkSpeedY;
                     spark.gravity = 0; // 火花不受重力影響
                     spark.friction = 0.95; // 輕微摩擦力
                     spark.alpha = 0.8; // 初始透明度
                     spark.size = Math.random() * 3 + 1; // 火花粒子較小
                     particles.push(spark);
                 }

                bullets.splice(i, 1);
                if (enemy.health <= 0) {
                    const points = knowledgeItems[enemy.type].points;
                    const isCorrect = knowledgeItems[enemy.type].isCorrect;
                    const finalPoints = player.doubleScore ? points * 2 : points;
                    
                    score += finalPoints;
                    if (isCorrect) {
                        knowledgePoints += Math.abs(points);
                        levelProgress += 1;
                        
                        // 檢查是否需要顯示問題
                        if (levelProgress >= level * 10 && !isAnswering) {
                            isAnswering = true;
                            currentQuestion = questions[Math.floor(Math.random() * questions.length)];
                            questionTimer = 0;
                        }
                    } else {
                        showMessage('錯誤選項！', '#FF0000');
                    }
                    
                    // 新增：創建粒子
                    const particleColor = knowledgeItems[enemy.type].color;
                    for(let j = 0; j < 20; j++) { // 創建20個粒子
                        particles.push(new Particle(enemy.x + enemy.width/2, enemy.y + enemy.height/2, particleColor));
                    }
                    
                    return false; // 敵人被摧毀
                }
                break;
            }
        }
        
        return !enemy.isOffScreen();
    });

    // 生成敵人
    enemySpawnTimer++;
    if (enemySpawnTimer >= Math.max(30, 60 - level * 5)) {
        enemies.push(spawnEnemy());
        enemySpawnTimer = 0;
    }

    // 生成道具
    powerUpSpawnTimer++;
    if (powerUpSpawnTimer >= 300) {
        powerUps.push(new PowerUp());
        powerUpSpawnTimer = 0;
    }

    // 更新和繪製道具 (道具可以在 Boss 戰時保留)
    powerUps = powerUps.filter(powerUp => {
       powerUp.move();
       powerUp.draw();
        
        if (powerUp.checkCollision(player)) {
            applyPowerUp(powerUp.type);
            return false;
        }
        
        return !powerUp.isOffScreen();
    });

    // 更新和繪製粒子
    particles = particles.filter(particle => {
        particle.update();
        particle.draw();
        return particle.alpha > 0.1; // 移除透明度過低的粒子
    });

    // 更新分數、知識點、等級並觸發動畫
    if (score !== lastScore) {
        scoreAnimationTimer = 20; // 設置動畫持續時間 (幀)
        lastScore = score;
    }
    if (knowledgePoints !== lastKnowledgePoints) {
        knowledgeAnimationTimer = 20;
        lastKnowledgePoints = knowledgePoints;
    }
    if (level !== lastLevel) {
        levelAnimationTimer = 20;
        lastLevel = level;
    }

    // 繪製UI
    drawUI();

    // 繪製飛船
    player.draw();

    // 繪製問題界面
    if (isAnswering) {
        drawQuestion();
    }

    requestAnimationFrame(gameLoop);
}

// 顯示消息
function showMessage(text, color) {
    const message = {
        text: text,
        color: color,
        time: 0
    };
    
    function drawMessage() {
        if (message.time < 100) {
            ctx.fillStyle = message.color;
            ctx.globalAlpha = 1 - message.time / 100;
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(message.text, CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
            ctx.globalAlpha = 1;
            message.time++;
            requestAnimationFrame(drawMessage);
        }
    }
    
    drawMessage();
}

// 處理答案
function handleAnswer(selectedIndex) {
    isAnswering = false;
    if (selectedIndex === currentQuestion.correct) {
        // 檢查是否達到最大等級
        if (level < MAX_LEVEL) { 
            level++;
            player.level = level; // 更新飛船等級視覺
            player.upgradeAnimation = 30; // 觸發升級動畫
            levelProgress = 0; // 重置進度
            showMessage('答對了！等級提升！', '#00ff00');
        } else {
            // 達到最大等級，遊戲結束
            gameOver = true;
            // showGameSummary(); // 在 gameLoop 中處理顯示
        }
    } else {
        showMessage('答錯了！', '#ff0000');
    }
    currentQuestion = null;
}

// 新增：遊戲結算畫面
function showGameSummary() {
    // 繪製半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 繪製結算框
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(CANVAS_WIDTH/2 - 300, CANVAS_HEIGHT/2 - 200, 600, 400);

    // 繪製標題
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('遊戲結束！', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 - 150);

    // 繪製統計數據
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`最終分數：${score}`, CANVAS_WIDTH/2, CANVAS_HEIGHT/2 - 80);
    ctx.fillText(`知識點：${knowledgePoints}`, CANVAS_WIDTH/2, CANVAS_HEIGHT/2 - 40);
    ctx.fillText(`達到等級：${level}`, CANVAS_WIDTH/2, CANVAS_HEIGHT/2);

    // 繪製重新開始按鈕
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(CANVAS_WIDTH/2 - 100, CANVAS_HEIGHT/2 + 50, 200, 50);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('重新開始', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 80);
}

// 新增 HTML 元素的點擊事件處理
const gameTitleElement = document.getElementById('gameTitle');
const startButtonElement = gameTitleElement.querySelector('p'); // "點擊開始遊戲"文字是 <p> 標籤

startButtonElement.addEventListener('click', () => {
    if (!gameStarted) {
        gameStarted = true;
        // 添加淡出動畫到開始畫面
        gameTitleElement.style.opacity = '0';
        gameTitleElement.style.transition = 'opacity 1s ease-out';
        // 在動畫結束後隱藏元素
        gameTitleElement.addEventListener('transitionend', () => {
            gameTitleElement.style.display = 'none';
        }, { once: true });
        
        // 顯示遊戲信息面板 (如果需要)
        // document.getElementById('gameInfo').style.display = 'block';
    }
});

// 應用道具效果
function applyPowerUp(type) {
    const currentTime = Date.now();
    switch (powerUpTypes[type].effect) {
        case 'speed':
            player.speedBoost = true;
            player.speedBoostTime = currentTime + powerUpTypes[type].duration;
            showMessage('速度提升！', '#00ff00');
            break;
        case 'shield':
            player.shield = true;
            player.shieldTime = currentTime + powerUpTypes[type].duration;
            showMessage('護盾啟動！', '#0000ff');
            break;
        case 'doubleScore':
            player.doubleScore = true;
            player.doubleScoreTime = currentTime + powerUpTypes[type].duration;
            showMessage('雙倍分數！', '#ffff00');
            break;
        case 'spreadShot':
            player.spreadShot = true;
            player.spreadShotTime = currentTime + powerUpTypes[type].duration;
            showMessage('散射模式！', '#ff00ff');
            break;
        case 'slowTime':
            player.slowTime = true;
            player.slowTimeTime = currentTime + powerUpTypes[type].duration;
            showMessage('時間緩慢！', '#00ffff');
            break;
    }
}

// 修改敵人生成邏輯
function spawnEnemy() {
    const enemy = new Enemy();
    if (player.slowTime) {
        enemy.speed *= 0.5;
    }
    return enemy;
}

gameLoop(); 