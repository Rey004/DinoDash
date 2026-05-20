import { GameState } from '../engine/state.js';
import { Renderer } from '../rendering/renderer.js';
import { ThemeManager } from '../themes/themeManager.js';
import { dino } from './dino.js';
import { checkAABB } from '../engine/physics.js';
import { randomInt } from '../utils/math.js';
import { playSound } from '../audio/audioManager.js';
import { emitExplosion } from '../rendering/particles.js';
import { AssetLoader } from '../utils/assetLoader.js';

let obstacles = [];
let nextObstacleDist = 0;

export function resetObstacles() {
    obstacles = [];
    nextObstacleDist = 500;
}

export function updateObstacles(dt) {
    // Spawn new
    nextObstacleDist -= GameState.speed * (dt / 16);
    if (nextObstacleDist <= 0) {
        spawnObstacle();
        nextObstacleDist = randomInt(400, 800) / (GameState.speed / 6);
    }
    
    // Move
    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        obs.x -= GameState.speed * (dt / 16);
        
        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
        }
    }
}

function spawnObstacle() {
    const types = [
        { width: 17, height: 35, yOffset: 0, spriteName: 'small-obstacle' }, // Small cactus
        { width: 34, height: 35, yOffset: 0, spriteName: 'small-obstacle' }, // Two small
        { width: 25, height: 50, yOffset: 0, spriteName: 'large-obstacle' }, // Large cactus
        { width: 50, height: 50, yOffset: 0, spriteName: 'large-obstacle' }, // Two large
        { width: 46, height: 40, yOffset: 25, spriteName: null }, // Pterodactyl low
        { width: 46, height: 40, yOffset: 50, spriteName: null }, // Pterodactyl mid
        { width: 46, height: 40, yOffset: 75, spriteName: null }, // Pterodactyl high
    ];
    
    let allowedTypes = types.slice(0, 4); // Only ground early on
    if (GameState.score > 300) {
        allowedTypes = types;
    }
    
    const type = allowedTypes[randomInt(0, allowedTypes.length)];
    
    obstacles.push({
        x: GameState.canvasWidth,
        y: GameState.GROUND_Y - type.height - type.yOffset,
        width: type.width,
        height: type.height,
        spriteName: type.spriteName
    });
}

export function checkCollisions() {
    for (let obs of obstacles) {
        // Shave off a few pixels for forgiveness
        const forgiveness = 4;
        const dinoBox = {
            x: dino.x + forgiveness,
            y: dino.y + forgiveness,
            width: dino.width - forgiveness * 2,
            height: dino.height - forgiveness * 2
        };
        const obsBox = {
            x: obs.x + forgiveness,
            y: obs.y + forgiveness,
            width: obs.width - forgiveness * 2,
            height: obs.height - forgiveness * 2
        };
        
        if (checkAABB(dinoBox, obsBox)) {
            emitExplosion(dino.x + dino.width/2, dino.y + dino.height/2);
            playSound('hit');
            return true;
        }
    }
    return false;
}

export function drawObstacles() {
    const ctx = Renderer.ctx;
    const theme = ThemeManager.current;
    const themeName = ThemeManager.activeThemeName;
    
    ctx.fillStyle = theme.obstacleColor;
    if (theme.hasGlow) {
        ctx.shadowBlur = 8;
        ctx.shadowColor = theme.obstacleColor;
    }
    
    for (let obs of obstacles) {
        let sprite = null;
        if (obs.spriteName) {
            sprite = AssetLoader.getSprite(themeName, obs.spriteName);
        }
        
        if (sprite) {
            const scale = 2.0;
            const drawWidth = obs.width * scale;
            const drawHeight = obs.height * scale;
            const offsetX = (drawWidth - obs.width) / 2;
            const offsetY = drawHeight - obs.height;
            
            ctx.drawImage(sprite, obs.x - offsetX, obs.y - offsetY, drawWidth, drawHeight);
        } else {
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        }
    }
    
    ctx.shadowBlur = 0;
}
