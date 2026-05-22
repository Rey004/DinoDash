import { ThemeManager } from '../themes/themeManager.js';
import { formatPlayTime, formatScore, GameStats } from '../utils/gameStats.js';
import { WidgetManager } from './widgetManager.js';

export const UIManager = {
    scoreLabel: null,
    hiScoreLabel: null,
    menuPanel: null,
    gameOverPanel: null,
    settingsPanel: null,
    profileIcon: null,
    profileInitial: null,
    tooltipEl: null,
    activeTooltipTarget: null,
    tooltipsReady: false,
    
    init() {
        this.scoreLabel = document.getElementById('current-score');
        this.hiScoreLabel = document.getElementById('hi-score');
        this.menuPanel = document.getElementById('native-ui-layer');
        this.settingsPanel = document.getElementById('settings-panel');
        this.profileIcon = document.getElementById('profile-icon');
        this.profileInitial = document.getElementById('profile-initial');
        this.themePanel = document.getElementById('theme-panel');
        this.widgetPanel = document.getElementById('widget-panel');
        this.scoreContainer = document.getElementById('score-container');
        this.canvas = document.getElementById('game-canvas');
        this.startHint = document.getElementById('start-hint');
        this.statsPanel = document.getElementById('game-stats-panel');
        this.statsButton = document.getElementById('stats-button');
        this.favouriteLinksPanel = document.getElementById('favourite-links-panel');
        this.favouriteLinksButton = document.getElementById('favourite-links-button');
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
        const themeButton = document.getElementById('theme-button');
        const widgetButton = document.getElementById('widget-button');
        this.initViewportTooltips();

        settingsButton.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.statsPanel) {
                this.statsPanel.classList.add('hidden');
                this.statsButton?.setAttribute('aria-expanded', 'false');
            }
            this.themePanel.classList.add('hidden');
            themeButton?.setAttribute('aria-expanded', 'false');
            this.widgetPanel.classList.add('hidden');
            widgetButton?.setAttribute('aria-expanded', 'false');
            this.favouriteLinksPanel?.classList.add('hidden');
            this.favouriteLinksButton?.setAttribute('aria-expanded', 'false');
            this.settingsPanel.classList.toggle('hidden');
            settingsButton.setAttribute('aria-expanded', String(!this.settingsPanel.classList.contains('hidden')));
        });

        themeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.statsPanel) {
                this.statsPanel.classList.add('hidden');
                this.statsButton?.setAttribute('aria-expanded', 'false');
            }
            this.settingsPanel.classList.add('hidden');
            settingsButton.setAttribute('aria-expanded', 'false');
            this.widgetPanel.classList.add('hidden');
            widgetButton?.setAttribute('aria-expanded', 'false');
            this.favouriteLinksPanel?.classList.add('hidden');
            this.favouriteLinksButton?.setAttribute('aria-expanded', 'false');
            this.themePanel.classList.toggle('hidden');
            themeButton.setAttribute('aria-expanded', String(!this.themePanel.classList.contains('hidden')));
        });

        widgetButton.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.statsPanel) {
                this.statsPanel.classList.add('hidden');
                this.statsButton?.setAttribute('aria-expanded', 'false');
            }
            this.settingsPanel.classList.add('hidden');
            settingsButton.setAttribute('aria-expanded', 'false');
            this.themePanel.classList.add('hidden');
            themeButton.setAttribute('aria-expanded', 'false');
            this.favouriteLinksPanel?.classList.add('hidden');
            this.favouriteLinksButton?.setAttribute('aria-expanded', 'false');
            this.widgetPanel.classList.toggle('hidden');
            widgetButton.setAttribute('aria-expanded', String(!this.widgetPanel.classList.contains('hidden')));
        });

        if (this.favouriteLinksButton && this.favouriteLinksPanel) {
            this.favouriteLinksButton.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!WidgetManager.isEnabled('favouriteLinks')) return;
                if (this.statsPanel) {
                    this.statsPanel.classList.add('hidden');
                    this.statsButton?.setAttribute('aria-expanded', 'false');
                }
                this.settingsPanel.classList.add('hidden');
                this.themePanel.classList.add('hidden');
                this.widgetPanel.classList.add('hidden');
                settingsButton.setAttribute('aria-expanded', 'false');
                themeButton?.setAttribute('aria-expanded', 'false');
                widgetButton?.setAttribute('aria-expanded', 'false');
                const opening = this.favouriteLinksPanel.classList.contains('hidden');
                this.favouriteLinksPanel.classList.toggle('hidden');
                this.favouriteLinksButton.setAttribute('aria-expanded', String(opening));
            });
        }

        if (this.statsButton && this.statsPanel) {
            this.statsButton.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!WidgetManager.isEnabled('gameStats')) return;
                this.settingsPanel.classList.add('hidden');
                this.themePanel.classList.add('hidden');
                settingsButton.setAttribute('aria-expanded', 'false');
                themeButton?.setAttribute('aria-expanded', 'false');
                this.widgetPanel.classList.add('hidden');
                widgetButton?.setAttribute('aria-expanded', 'false');
                this.favouriteLinksPanel?.classList.add('hidden');
                this.favouriteLinksButton?.setAttribute('aria-expanded', 'false');
                const opening = this.statsPanel.classList.contains('hidden');
                this.statsPanel.classList.toggle('hidden');
                this.statsButton.setAttribute('aria-expanded', String(opening));
                if (opening) this.updateGameStats();
            });
        }

        document.addEventListener('click', (e) => {
            if (!this.settingsPanel.classList.contains('hidden')) {
                const isClickInside = this.settingsPanel.contains(e.target);
                const isSettingsButton = settingsButton.contains(e.target);
                if (!isClickInside && !isSettingsButton) {
                    this.settingsPanel.classList.add('hidden');
                    settingsButton.setAttribute('aria-expanded', 'false');
                }
            }
            if (!this.themePanel.classList.contains('hidden')) {
                const isClickInside = this.themePanel.contains(e.target);
                const isThemeButton = themeButton.contains(e.target);
                if (!isClickInside && !isThemeButton) {
                    this.themePanel.classList.add('hidden');
                    themeButton.setAttribute('aria-expanded', 'false');
                }
            }
            if (!this.widgetPanel.classList.contains('hidden')) {
                const isClickInside = this.widgetPanel.contains(e.target);
                const isWidgetButton = widgetButton.contains(e.target);
                if (!isClickInside && !isWidgetButton) {
                    this.widgetPanel.classList.add('hidden');
                    widgetButton.setAttribute('aria-expanded', 'false');
                }
            }
            if (this.statsPanel && !this.statsPanel.classList.contains('hidden')) {
                const statsWidget = document.getElementById('statistics-widget');
                const isClickInside =
                    this.statsPanel.contains(e.target) || statsWidget?.contains(e.target);
                if (!isClickInside) {
                    this.statsPanel.classList.add('hidden');
                    this.statsButton?.setAttribute('aria-expanded', 'false');
                }
            }
            if (this.favouriteLinksPanel && !this.favouriteLinksPanel.classList.contains('hidden')) {
                const favouriteLinksWidget = document.getElementById('favourite-links-widget');
                // Use composedPath() so the check stays accurate even after render()
                // rebuilds the panel's inner DOM (contains() would return false on
                // detached nodes, incorrectly treating the click as "outside").
                const path = e.composedPath();
                const isClickInside =
                    path.includes(this.favouriteLinksPanel) || path.includes(favouriteLinksWidget);
                if (!isClickInside) {
                    this.favouriteLinksPanel.classList.add('hidden');
                    this.favouriteLinksButton?.setAttribute('aria-expanded', 'false');
                }
            }
        });
        
        const mainToggle = document.getElementById('main-ui-enhancement-toggle');
        if (mainToggle) {
            chrome.storage?.local.get(['enhancementsEnabled'], (result) => {
                mainToggle.checked = result.enhancementsEnabled === true;
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
            settingsButton.setAttribute('aria-expanded', 'false');
        });

        const closeStats = document.getElementById('close-stats');
        if (closeStats && this.statsPanel) {
            closeStats.addEventListener('click', () => {
                this.statsPanel.classList.add('hidden');
                this.statsButton?.setAttribute('aria-expanded', 'false');
            });
        }

        this.showIdleChrome();
        
        document.querySelectorAll('.theme-card').forEach((card) => {
            card.addEventListener('click', async () => {
                const key = card.dataset.themeKey;
                if (!key) return;
                const activeTheme = await ThemeManager.setTheme(key);
                chrome.storage?.local.set({ theme: activeTheme });
                this.setActiveSwatch(activeTheme);
            });
        });

        document.querySelectorAll('.floating-tool-button, #stats-button, #favourite-links-button').forEach((button) => {
            button.addEventListener('keydown', (e) => {
                if (e.key !== 'Enter' && e.key !== ' ') return;
                e.preventDefault();
                button.click();
            });
        });

        const legacyThemeSelect = document.getElementById('theme-select');
        legacyThemeSelect?.addEventListener('change', async (e) => {
            const key = e.target.value;
            await ThemeManager.setTheme(key);
            chrome.storage?.local.set({ theme: key });
        });
        
        document.getElementById('toggle-particles').addEventListener('change', (e) => {
            chrome.storage?.local.set({ particles: e.target.checked });
        });
        
        document.getElementById('toggle-audio').addEventListener('change', (e) => {
            chrome.storage?.local.set({ audio: e.target.checked });
        });
        
    },

    initViewportTooltips() {
        if (this.tooltipsReady) return;
        this.tooltipsReady = true;

        const margin = 12;
        const gap = 8;
        const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

        const ensureTooltip = () => {
            if (this.tooltipEl) return this.tooltipEl;
            this.tooltipEl = document.createElement('div');
            this.tooltipEl.className = 'viewport-tooltip';
            this.tooltipEl.setAttribute('role', 'tooltip');
            document.body.appendChild(this.tooltipEl);
            return this.tooltipEl;
        };

        const positionTooltip = (target) => {
            const tooltip = ensureTooltip();
            const targetRect = target.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const position = target.dataset.tooltipPosition || 'top';
            let left;
            let top;

            if (position === 'left') {
                left = targetRect.left - tooltipRect.width - gap;
                top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
            } else if (position === 'right') {
                left = targetRect.right + gap;
                top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
            } else if (position === 'top-start') {
                left = targetRect.left;
                top = targetRect.top - tooltipRect.height - gap;
            } else {
                left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
                top = targetRect.top - tooltipRect.height - gap;
            }

            if (top < margin) {
                top = targetRect.bottom + gap;
            }
            if (top + tooltipRect.height > viewportHeight - margin) {
                top = targetRect.top - tooltipRect.height - gap;
            }

            const maxLeft = Math.max(margin, viewportWidth - tooltipRect.width - margin);
            const maxTop = Math.max(margin, viewportHeight - tooltipRect.height - margin);
            tooltip.style.left = `${clamp(left, margin, maxLeft)}px`;
            tooltip.style.top = `${clamp(top, margin, maxTop)}px`;
        };

        const showTooltip = (target) => {
            const text = target?.dataset.tooltip;
            if (!text) return;
            const tooltip = ensureTooltip();
            this.activeTooltipTarget = target;
            tooltip.textContent = text;
            positionTooltip(target);
            tooltip.classList.add('is-visible');
        };

        const hideTooltip = () => {
            this.activeTooltipTarget = null;
            this.tooltipEl?.classList.remove('is-visible');
        };

        document.addEventListener('mouseover', (e) => {
            const target = e.target.closest('[data-tooltip]');
            if (!target || target.contains(e.relatedTarget)) return;
            showTooltip(target);
        });

        document.addEventListener('mouseout', (e) => {
            const target = e.target.closest('[data-tooltip]');
            if (!target || target.contains(e.relatedTarget)) return;
            hideTooltip();
        });

        document.addEventListener('focusin', (e) => {
            const target = e.target.closest('[data-tooltip]');
            if (target) showTooltip(target);
        });

        document.addEventListener('focusout', (e) => {
            if (e.target.closest('[data-tooltip]')) hideTooltip();
        });

        document.addEventListener('click', hideTooltip);
        window.addEventListener('resize', () => {
            if (this.activeTooltipTarget) positionTooltip(this.activeTooltipTarget);
        });
        window.addEventListener('scroll', () => {
            if (this.activeTooltipTarget) positionTooltip(this.activeTooltipTarget);
        }, true);
    },
    
    setActiveSwatch(themeKey) {
        const sel = document.getElementById('theme-select');
        if (sel) sel.value = themeKey;
        document.querySelectorAll('.theme-card').forEach((card) => {
            const isActive = card.dataset.themeKey === themeKey;
            card.classList.toggle('is-active', isActive);
            card.setAttribute('aria-pressed', String(isActive));
        });
    },

    updateScore(score) {
        if (this.scoreLabel) {
            this.scoreLabel.textContent = score.toString().padStart(5, '0');
        }
    },

    updateHiScore(score) {
        if (this.hiScoreLabel) {
            this.hiScoreLabel.textContent = score.toString().padStart(5, '0');
        }
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

    setProfileName(profileName = 'User') {
        const cleanName = String(profileName).trim() || 'User';
        const initial = cleanName.charAt(0).toUpperCase();

        if (this.profileInitial) {
            this.profileInitial.textContent = initial;
        }
        if (this.profileIcon) {
            this.profileIcon.dataset.tooltip = cleanName;
            this.profileIcon.setAttribute('aria-label', `${cleanName} profile`);
            this.profileIcon.setAttribute('title', cleanName);
        }
    },
    
    showIdleChrome() {
        if (this.bottomLeftBar) this.bottomLeftBar.style.display = 'flex';
        WidgetManager.setGameActive(false);
    },

    hideOverlays() {
        this.menuPanel.classList.add('hidden');
        this.settingsPanel.classList.add('hidden');
        this.themePanel.classList.add('hidden');
        this.widgetPanel.classList.add('hidden');
        if (this.statsPanel) {
            this.statsPanel.classList.add('hidden');
            this.statsButton?.setAttribute('aria-expanded', 'false');
        }
        if (this.favouriteLinksPanel) {
            this.favouriteLinksPanel.classList.add('hidden');
            this.favouriteLinksButton?.setAttribute('aria-expanded', 'false');
        }
        this.canvas.classList.remove('blurred');
        this.scoreContainer.classList.remove('hidden');
        if (this.bottomLeftBar) this.bottomLeftBar.style.display = 'none';
        WidgetManager.setGameActive(true);
    },

    showGameOver() {
        this.startHint.innerHTML = 'Press <kbd>SPACE</kbd> to restart the game';
        this.menuPanel.classList.remove('hidden');
        this.canvas.classList.add('blurred');
        this.scoreContainer.classList.add('hidden');
        this.showIdleChrome();
    }
};
