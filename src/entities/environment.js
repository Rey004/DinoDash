import { GameState } from '../engine/state.js';
import { Renderer } from '../rendering/renderer.js';
import { ThemeManager } from '../themes/themeManager.js';
import { randomInt } from '../utils/math.js';
import { AssetLoader } from '../utils/assetLoader.js';

let backgroundItems = [];
let groundOffsetX = 0;
let bgOffsetX = 0;   // slow parallax scroll for background

export function updateEnvironment(dt) {
    if (GameState.currentPhase === 'playing') {
        groundOffsetX += GameState.speed * (dt / 8);
        bgOffsetX     += GameState.speed * (dt / 8) * 0.20; // 20% of ground speed
    }
    
    // Generate clouds/stars occasionally
    if (Math.random() < 0.01) {
        backgroundItems.push({
            x: GameState.canvasWidth,
            y: randomInt(20, GameState.GROUND_Y - 50),
            width: randomInt(40, 80),
            height: randomInt(15, 30),
            speed: randomInt(1, 3) * 0.1
        });
    }
    
    // Move
    for (let i = backgroundItems.length - 1; i >= 0; i--) {
        let item = backgroundItems[i];
        item.x -= GameState.speed * item.speed * (dt / 16);
        if (item.x + item.width < 0) {
            backgroundItems.splice(i, 1);
        }
    }
}

export function drawEnvironment() {
    const ctx = Renderer.ctx;
    const theme = ThemeManager.current;
    const themeName = ThemeManager.activeThemeName;

    // ── 1. Background layer (scrolls with ground) ──────────────────────────
    const bgSprite = AssetLoader.getSprite(themeName, 'background');

    if (bgSprite && bgSprite.width > 0) {
        // Scale to fill canvas height, keep aspect ratio, then tile horizontally
        const bgScale = GameState.canvasHeight / bgSprite.height;
        const bgW     = bgSprite.width * bgScale;
        const bgOffset = bgOffsetX % bgW;

        let x = -bgOffset;
        while (x < GameState.canvasWidth) {
            ctx.drawImage(bgSprite, x, 0, bgW, GameState.canvasHeight);
            x += bgW;
        }
    }
    // No background sprite → the Renderer.clear() solid fill is already in place

    // ── 2. Ground layer (full scroll speed) ─────────────────────────────────
    const groundSprite = AssetLoader.getSprite(themeName, 'ground');

    if (groundSprite && groundSprite.width > 0) {
        const scale      = GameState.canvasHeight / groundSprite.height;
        const drawWidth  = groundSprite.width * scale;
        const drawHeight = GameState.canvasHeight;
        const offset     = groundOffsetX % drawWidth;

        let x = -offset;
        while (x < GameState.canvasWidth) {
            ctx.drawImage(groundSprite, x, 19, drawWidth, drawHeight);
            x += drawWidth;
        }
    } else {
        // Fallback: simple ground line
        ctx.fillStyle = theme.groundColor;
        ctx.fillRect(0, GameState.GROUND_Y, GameState.canvasWidth, 2);
    }

    // ── 3. Ambient cloud/star items (only when no bg sprite to avoid clutter) ─
    if (!bgSprite) {
        ctx.fillStyle = theme.obstacleColor;
        ctx.globalAlpha = 0.3;

        for (let item of backgroundItems) {
            ctx.beginPath();
            ctx.arc(item.x + 10, item.y + 10, item.height / 2, 0, Math.PI * 2);
            ctx.arc(item.x + item.width - 10, item.y + 10, item.height / 2, 0, Math.PI * 2);
            ctx.fillRect(item.x + 10, item.y + 10 - item.height / 2, item.width - 20, item.height);
            ctx.fill();
        }

        ctx.globalAlpha = 1.0;
    }
}
