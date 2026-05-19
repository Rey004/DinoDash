import { GameLoop } from '../engine/gameLoop.js';
import { GameState } from '../engine/state.js';
import { jumpDino, duckDino, stopDuckDino } from '../entities/dino.js';

export function setupInput() {
    window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            if (GameState.currentPhase === 'menu' || GameState.currentPhase === 'gameover') {
                GameLoop.restart();
            } else if (GameState.currentPhase === 'playing') {
                jumpDino();
            }
            e.preventDefault();
        }
        
        if (e.code === 'ArrowDown') {
            if (GameState.currentPhase === 'playing') {
                duckDino();
            }
            e.preventDefault();
        }
        
        if (e.code === 'KeyR' && GameState.currentPhase === 'gameover') {
            GameLoop.restart();
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        if (e.code === 'ArrowDown') {
            if (GameState.currentPhase === 'playing') {
                stopDuckDino();
            }
        }
        
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            // Could implement variable jump height logic here
        }
    });
}
