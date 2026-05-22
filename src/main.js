import { GameLoop } from './engine/gameLoop.js';
import { GameState } from './engine/state.js';
import { Renderer } from './rendering/renderer.js';
import { UIManager } from './ui/uiManager.js';
import { ThemeManager } from './themes/themeManager.js';
import { setupInput } from './utils/input.js';
import { initDino } from './entities/dino.js';
import { GameStats } from './utils/gameStats.js';
import { DailyQuests } from './utils/dailyQuests.js';
import { initDailyQuestsUI } from './ui/dailyQuestsUI.js';
import { WidgetManager } from './ui/widgetManager.js';
import { initFavouriteLinksUI } from './ui/favouriteLinksUI.js';

const DEFAULT_THEME = 'dark';
const DEFAULT_PROFILE_NAME = 'User';

function storageGet(keys) {
    return new Promise((resolve) => {
        if (!chrome.storage?.local) {
            resolve({});
            return;
        }
        chrome.storage.local.get(keys, resolve);
    });
}

async function applySavedSettings(result) {
    if (result.enhancementsEnabled !== true) {
        if (chrome.tabs?.getCurrent) {
            chrome.tabs.getCurrent((tab) => {
                if (tab) {
                    chrome.tabs.update(tab.id, { url: 'chrome://new-tab-page/' });
                } else {
                    window.location.href = 'chrome://new-tab-page/';
                }
            });
        } else {
            window.location.href = 'chrome://new-tab-page/';
        }
        return false;
    }

    const profileName = await resolveProfileName(result.profileName);
    UIManager.setProfileName(profileName);

    document.body.style.opacity = '1';

    await GameStats.load();
    GameState.hiScore = Math.max(result.hiScore || 0, GameStats.data.hiScore || 0);
    GameStats.data.hiScore = GameState.hiScore;

    const theme = result.theme || DEFAULT_THEME;
    const activeTheme = await ThemeManager.setTheme(theme);

    UIManager.updateHiScore(GameState.hiScore);
    UIManager.updateGameStats(GameStats.data);
    UIManager.setActiveSwatch(activeTheme);

    const particlesTog = document.getElementById('toggle-particles');
    const audioTog = document.getElementById('toggle-audio');
    if (result.particles !== undefined && particlesTog) {
        particlesTog.checked = result.particles;
    }
    if (result.audio !== undefined && audioTog) {
        audioTog.checked = result.audio;
    }

    return true;
}

function saveProfileName(profileName) {
    return new Promise((resolve) => {
        if (!chrome.storage?.local) {
            resolve();
            return;
        }
        chrome.storage.local.set({ profileName }, resolve);
    });
}

async function resolveProfileName(savedName) {
    const cleanSavedName = sanitizeProfileName(savedName);
    if (cleanSavedName) return cleanSavedName;

    const enteredName = sanitizeProfileName(window.prompt('What name should DinoDash use for your profile?'));
    const profileName = enteredName || DEFAULT_PROFILE_NAME;
    await saveProfileName(profileName);
    return profileName;
}

function sanitizeProfileName(name) {
    return typeof name === 'string'
        ? name.trim().replace(/\s+/g, ' ').slice(0, 40)
        : '';
}

async function init() {
    try {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                GameLoop.stop();
            } else if (GameState.currentPhase === 'playing') {
                GameLoop.start();
            } else {
                GameLoop.start();
            }
        });
        window.addEventListener('themeassetschange', () => {
            if (!document.hidden) {
                GameLoop.start();
            }
        });

        chrome.storage?.onChanged.addListener((changes, namespace) => {
            if (namespace !== 'local') return;

            if (changes.enhancementsEnabled?.newValue === false) {
                chrome.tabs.getCurrent((tab) => {
                    if (tab) chrome.tabs.update(tab.id, { url: 'chrome://new-tab-page/' });
                });
            }

            if (changes.theme) {
                const key = changes.theme.newValue;
                ThemeManager.setTheme(key).then((activeTheme) => {
                    UIManager.setActiveSwatch(activeTheme);
                });
            }

            if (changes.gameStats || changes.hiScore) {
                GameStats.load().then(() => {
                    GameState.hiScore = GameStats.data.hiScore;
                    UIManager.updateHiScore(GameState.hiScore);
                    UIManager.updateGameStats(GameStats.data);
                });
            }

            if (changes.profileName) {
                UIManager.setProfileName(changes.profileName.newValue || DEFAULT_PROFILE_NAME);
            }
        });

        Renderer.init();
        setupInput();

        await WidgetManager.init();
        UIManager.init();
        initDino();

        const result = await storageGet([
            'enhancementsEnabled',
            'hiScore',
            'theme',
            'particles',
            'audio',
            'profileName',
        ]);

        const ready = await applySavedSettings(result);
        if (!ready) return;

        await initFavouriteLinksUI();
        await DailyQuests.load();
        initDailyQuestsUI();

        GameLoop.start();
    } catch (err) {
        console.error('DinoDash init failed:', err);
        document.body.style.opacity = '1';
    }
}

window.addEventListener('load', init);
