import { ThemeManager } from '../themes/themeManager.js';
import { formatPlayTime, formatScore, GameStats } from '../utils/gameStats.js';

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
        this.statsPanel = document.getElementById('game-stats-panel');
        this.statsButton = document.getElementById('stats-button');
        this.bottomLeftBar = document.getElementById('bottom-left-bar');

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
        
        const settingsButton = document.getElementById('settings-button');

        settingsButton.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.statsPanel) this.statsPanel.classList.add('hidden');
            this.settingsPanel.classList.toggle('hidden');
        });

        if (this.statsButton && this.statsPanel) {
            this.statsButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.settingsPanel.classList.add('hidden');
                this.statsPanel.classList.toggle('hidden');
            });
        }

        document.addEventListener('click', (e) => {
            if (!this.settingsPanel.classList.contains('hidden')) {
                const isClickInside = this.settingsPanel.contains(e.target);
                const isSettingsButton = settingsButton.contains(e.target);
                if (!isClickInside && !isSettingsButton) {
                    this.settingsPanel.classList.add('hidden');
                }
            }
            if (this.statsPanel && !this.statsPanel.classList.contains('hidden')) {
                const isClickInside = this.statsPanel.contains(e.target);
                const isStatsButton = this.statsButton?.contains(e.target);
                if (!isClickInside && !isStatsButton) {
                    this.statsPanel.classList.add('hidden');
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

        const closeStats = document.getElementById('close-stats');
        if (closeStats && this.statsPanel) {
            closeStats.addEventListener('click', () => {
                this.statsPanel.classList.add('hidden');
            });
        }

        this.showIdleChrome();
        
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

    updateGameStats(stats = GameStats.data) {
        const set = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };
        set('stat-hi-score', formatScore(stats.hiScore));
        set('stat-last-score', formatScore(stats.lastScore));
        set('stat-games-played', String(stats.gamesPlayed || 0));
        set('stat-avg-score', formatScore(
            stats.gamesPlayed ? Math.round(stats.totalDistance / stats.gamesPlayed) : 0
        ));
        set('stat-total-distance', formatScore(stats.totalDistance));
        set('stat-play-time', formatPlayTime(stats.totalPlayTimeMs || 0));
    },
    
    updateFPS(dt) {
        if (dt > 0) {
            const fps = Math.round(1000 / dt);
            this.fpsLabel.textContent = fps;
        }
    },
    
    showIdleChrome() {
        if (this.bottomLeftBar) this.bottomLeftBar.style.display = 'flex';
    },

    hideOverlays() {
        this.menuPanel.classList.add('hidden');
        this.settingsPanel.classList.add('hidden');
        if (this.statsPanel) this.statsPanel.classList.add('hidden');
        this.canvas.classList.remove('blurred');
        this.scoreContainer.classList.remove('hidden');
        if (this.bottomLeftBar) this.bottomLeftBar.style.display = 'none';
    },

    showGameOver() {
        this.startHint.innerHTML = 'Press <kbd>SPACE</kbd> to restart the game';
        this.menuPanel.classList.remove('hidden');
        this.canvas.classList.add('blurred');
        this.scoreContainer.classList.add('hidden');
        this.showIdleChrome();
    }
};
