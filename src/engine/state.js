export const GameState = {
    currentPhase: 'menu', // menu, playing, gameover
    score: 0,
    hiScore: 0,
    speed: 6.0,
    distanceMeter: 0,
    canvasWidth: 0,
    canvasHeight: 0,
    isDarkMode: false,
    enhancementsEnabled: true,
    
    // Config
    GRAVITY: 0.6,
    JUMP_VELOCITY: -12.5,
    MIN_JUMP_HEIGHT: 35,
    MAX_SPEED: 13,
    SPEED_INCREMENT: 0.001,
    GROUND_Y: 0, // Calculated dynamically based on canvas
    
    reset() {
        this.score = 0;
        this.speed = 6.0;
        this.distanceMeter = 0;
        this.currentPhase = 'playing';
    }
};
