import { ThemeManager } from '../themes/themeManager.js';

export const UIManager = {
    scoreLabel: null,
    hiScoreLabel: null,
    fpsLabel: null,
    menuPanel: null,
    gameOverPanel: null,
    settingsPanel: null,
    
    init() {
        this.scoreLabel = document.getElementById('current-score');
        this.hiScoreLabel = document.getElementById('hi-score');
        this.fpsLabel = document.querySelector('#fps-counter span');
        this.menuPanel = document.getElementById('native-ui-layer');
        this.settingsPanel = document.getElementById('settings-panel');
        this.scoreContainer = document.getElementById('score-container');
        this.canvas = document.getElementById('game-canvas');
        this.startHint = document.getElementById('start-hint');
        
        // Initial state
        this.canvas.classList.add('blurred');
        this.scoreContainer.classList.add('hidden');
        
        const searchForm = document.getElementById('search-form');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                // If it's empty, prevent default
                const input = document.getElementById('search-input');
                if (!input.value.trim()) {
                    e.preventDefault();
                }
            });
        }
        
        document.getElementById('settings-button').addEventListener('click', (e) => {
            e.stopPropagation();
            this.settingsPanel.classList.toggle('hidden');
        });
        
        document.addEventListener('click', (e) => {
            if (!this.settingsPanel.classList.contains('hidden')) {
                const isClickInside = this.settingsPanel.contains(e.target);
                const isSettingsButton = document.getElementById('settings-button').contains(e.target);
                if (!isClickInside && !isSettingsButton) {
                    this.settingsPanel.classList.add('hidden');
                }
            }
        });
        
        const mainToggle = document.getElementById('main-ui-enhancement-toggle');
        if (mainToggle) {
            chrome.storage?.local.get(['enhancementsEnabled'], (result) => {
                if (result.enhancementsEnabled !== undefined) {
                    mainToggle.checked = result.enhancementsEnabled;
                }
            });
            
            mainToggle.addEventListener('change', (e) => {
                const enabled = e.target.checked;
                chrome.storage?.local.set({ enhancementsEnabled: enabled }, () => {
                    if (!enabled) {
                        window.location.href = 'chrome://new-tab-page/';
                    }
                });
            });
        }
        
        document.getElementById('close-settings').addEventListener('click', () => {
            this.settingsPanel.classList.add('hidden');
        });
        
        document.getElementById('theme-select').addEventListener('change', (e) => {
            ThemeManager.setTheme(e.target.value);
            chrome.storage?.local.set({ theme: e.target.value });
        });
        
        document.getElementById('toggle-particles').addEventListener('change', (e) => {
            chrome.storage?.local.set({ particles: e.target.checked });
        });
        
        document.getElementById('toggle-audio').addEventListener('change', (e) => {
            chrome.storage?.local.set({ audio: e.target.checked });
        });
        
        document.getElementById('toggle-fps').addEventListener('change', (e) => {
            const fpsCounter = document.getElementById('fps-counter');
            if (e.target.checked) {
                fpsCounter.classList.remove('hidden');
            } else {
                fpsCounter.classList.add('hidden');
            }
        });
    },
    
    setActiveSwatch(themeKey) {
        const sel = document.getElementById('theme-select');
        if (sel) sel.value = themeKey;
    },

    updateScore(score) {
        this.scoreLabel.textContent = score.toString().padStart(5, '0');
    },
    
    updateHiScore(score) {
        this.hiScoreLabel.textContent = score.toString().padStart(5, '0');
    },
    
    updateFPS(dt) {
        if (dt > 0) {
            const fps = Math.round(1000 / dt);
            this.fpsLabel.textContent = fps;
        }
    },
    
    hideOverlays() {
        this.menuPanel.classList.add('hidden');
        this.settingsPanel.classList.add('hidden');
        this.canvas.classList.remove('blurred');
        this.scoreContainer.classList.remove('hidden');
        const mainToggle = document.querySelector('.enhancement-toggle-container');
        if (mainToggle) mainToggle.style.display = 'none';
    },
    
    showGameOver() {
        this.startHint.innerHTML = 'Press <kbd>SPACE</kbd> to restart the game';
        this.menuPanel.classList.remove('hidden');
        this.canvas.classList.add('blurred');
        this.scoreContainer.classList.add('hidden');
        const mainToggle = document.querySelector('.enhancement-toggle-container');
        if (mainToggle) mainToggle.style.display = 'flex';
    }
};
