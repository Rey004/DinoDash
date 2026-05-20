import { GameState } from '../engine/state.js';
import { Renderer } from '../rendering/renderer.js';
import { emitDust } from '../rendering/particles.js';
import { ThemeManager } from '../themes/themeManager.js';
import { playSound } from '../audio/audioManager.js';
import { AssetLoader } from '../utils/assetLoader.js';

const BLOCK = 47;
const DINO_STAND_WIDTH = 44;
const DINO_STAND_HEIGHT = BLOCK * 2;
const DINO_DUCK_WIDTH = 59;
const DINO_DUCK_HEIGHT = BLOCK;

export const dino = {
    x: 50,
    y: 0,
    width: DINO_STAND_WIDTH,
    height: DINO_STAND_HEIGHT,
    vy: 0,
    isJumping: false,
    isDucking: false,
    hitboxes: [] // Can be refined later
};

export function initDino() {
    resetDino();
}

export function resetDino() {
    GameState.downKeyHeld = false;
    dino.isJumping = false;
    dino.isDucking = false;
    dino.vy = 0;
    dino.width = DINO_STAND_WIDTH;
    dino.height = DINO_STAND_HEIGHT;
    dino.y = GameState.GROUND_Y - dino.height;
}

export function jumpDino() {
    if (dino.isDucking) return;
    if (!dino.isJumping) {
        dino.isJumping = true;
        dino.vy = GameState.JUMP_VELOCITY;
        emitDust(dino.x + dino.width / 2, dino.y + dino.height, 10);
        playSound('jump');
    }
}

export function duckDino() {
    if (!dino.isJumping && !dino.isDucking) {
        dino.isDucking = true;
        dino.width = DINO_DUCK_WIDTH;
        dino.height = DINO_DUCK_HEIGHT;
        dino.y = GameState.GROUND_Y - dino.height;
    } else if (dino.isJumping) {
        dino.vy += GameState.GRAVITY;
    }
}

export function stopDuckDino() {
    if (dino.isDucking) {
        dino.isDucking = false;
        dino.width = DINO_STAND_WIDTH;
        dino.height = DINO_STAND_HEIGHT;
        dino.y = GameState.GROUND_Y - dino.height;
    }
}

export function updateDino(dt) {
    if (dino.isJumping) {
        dino.vy += GameState.GRAVITY * (dt / 16);
        dino.y += dino.vy * (dt / 16);
        
        if (dino.y >= GameState.GROUND_Y - dino.height) {
            dino.y = GameState.GROUND_Y - dino.height;
            dino.isJumping = false;
            dino.vy = 0;
            emitDust(dino.x + dino.width / 2, dino.y + dino.height, 5);
            playSound('land');
            if (GameState.downKeyHeld) {
                duckDino();
            }
        }
    }
}

export function drawDino() {
    const ctx = Renderer.ctx;
    const theme = ThemeManager.current;
    const themeName = ThemeManager.activeThemeName;
    
    let spriteAsset = 'idle';
    if (GameState.currentPhase === 'gameover') {
        spriteAsset = 'dead';
    } else if (dino.isDucking) {
        spriteAsset = Math.floor(performance.now() / 120) % 2 === 0 ? 'duck-1' : 'duck-2';
    } else if (!dino.isJumping && GameState.currentPhase === 'playing') {
        // Alternate running frames based on time
        spriteAsset = Math.floor(performance.now() / 120) % 2 === 0 ? 'run-1' : 'run-2';
    }
    
    const sprite = AssetLoader.getSprite(themeName, spriteAsset);
    
    if (theme.hasGlow) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = theme.dinoColor;
    } else {
        ctx.shadowBlur = 0;
    }
    
    if (sprite) {
        // Draw the sprite larger than the hitbox to make it pop,
        // but keep the bottom aligned to the ground so it doesn't float.
        const scale = 1.5;
        let originalWidth = DINO_STAND_WIDTH;
        let originalHeight = BLOCK;
        if (dino.isDucking) {
            originalWidth = DINO_DUCK_WIDTH;
            originalHeight = BLOCK / 2;
        }
        
        const drawHeight = dino.height * scale;
        const drawWidth = drawHeight * (originalWidth / originalHeight);
        const offsetX = (drawWidth - dino.width) / 2;
        const offsetY = drawHeight - dino.height;
        
        ctx.drawImage(sprite, dino.x - offsetX, dino.y - offsetY, drawWidth, drawHeight);
    } else {
        ctx.fillStyle = theme.dinoColor;
        ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
    }
    
    ctx.shadowBlur = 0; // reset
}
