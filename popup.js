// popup.js — DinoDash extension popup
import { WidgetPrefs } from './shared/widgetPrefs.js';
import { mountWidgetSettings, syncWidgetSettings } from './shared/widgetSettingsUI.js';

// ── Theme design tokens (mirrors src/themes/presets.js) ──────────────────────
const THEMES = {
    dark: {
        name: 'Dark Valley',
        bg:           '#0c0808',
        surface:      'rgba(15,6,6,0.92)',
        border:       'rgba(139,26,26,0.28)',
        text:         '#e0d4d4',
        textMuted:    'rgba(224,212,212,0.5)',
        accent:       '#8b1a1a',
        accentSoft:   'rgba(139,26,26,0.14)',
        glow:         '0 0 14px rgba(139,26,26,0.45)',
        btnBg:        '#8b1a1a',
        btnText:      '#f0e4e4',
        inputBg:      'rgba(10,4,4,0.95)',
        selectBg:     'rgba(18,8,8,0.95)',
        logoGradient: 'linear-gradient(90deg,#8b1a1a,#c0392b,#e0d4d4)',
        logoBg:       '#0f0606',
        logoChar:     '#ffffff',
    },
    mysticForest: {
        name: 'Mystic Forest',
        bg:           '#06130f',
        surface:      'rgba(5,17,13,0.92)',
        border:       'rgba(143,177,130,0.28)',
        text:         '#c7d6b5',
        textMuted:    'rgba(199,214,181,0.56)',
        accent:       '#9fcf8f',
        accentSoft:   'rgba(159,207,143,0.16)',
        glow:         '0 0 14px rgba(143,191,134,0.34)',
        btnBg:        '#8fbf86',
        btnText:      '#06130f',
        inputBg:      'rgba(3,13,10,0.95)',
        selectBg:     'rgba(5,17,13,0.95)',
        logoGradient: 'linear-gradient(90deg,#6f8f72,#9fcf8f,#d9e8a8)',
        logoBg:       '#06130f',
        logoChar:     '#d9e8a8',
    },
};

// ── Apply theme name update to popup ─────────────────────────────────────────
function applyTheme(key) {
    const resolvedKey = THEMES[key] ? key : 'dark';
    const t = THEMES[resolvedKey];

    document.body.setAttribute('data-theme', resolvedKey);

    // Update the theme name chip
    const nameEl = document.getElementById('popup-theme-name');
    if (nameEl) nameEl.textContent = t.name;

    return resolvedKey;
}

// ── Propagate setting change to the open new-tab page ────────────────────────
function sendToNewTab(changes) {
    chrome.storage.local.set(changes);
    // Also message the active new tab if it's our extension page
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
            if (tab.url && (tab.url.includes('src/index.html') || tab.url.startsWith('chrome://newtab'))) {
                chrome.tabs.sendMessage(tab.id, { type: 'settingsChanged', ...changes })
                    .catch(() => {}); // silently ignore if tab isn't listening
            }
        });
    });
}

// ── Main ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const enhToggle    = document.getElementById('enhancement-toggle');
    const themeSelect  = document.getElementById('popup-theme-select');
    const particlesTog = document.getElementById('popup-particles');
    const audioTog     = document.getElementById('popup-audio');
    const messagesTog  = document.getElementById('popup-messages');
    const hiScoreEl    = document.getElementById('popup-hi-score');
    const openTabBtn   = document.getElementById('open-tab-btn');
    const widgetListEl = document.getElementById('popup-widget-list');


    // ── Load all saved settings ───────────────────────────────────────────
    chrome.storage.local.get(
        ['enhancementsEnabled', 'theme', 'particles', 'audio', 'messagesEnabled', 'hiScore', 'widgetPrefs'],
        async (result) => {
            await WidgetPrefs.load();
            mountWidgetSettings(widgetListEl);
            const theme = result.theme || 'dark';

            // Apply theme to popup immediately
            const activeTheme = applyTheme(theme);
            themeSelect.value = activeTheme;

            // Toggles
            enhToggle.checked    = result.enhancementsEnabled === true;
            particlesTog.checked = result.particles !== false;
            audioTog.checked     = result.audio     !== false;
            messagesTog.checked  = result.messagesEnabled  !== false;

            // Hi-score
            if (result.hiScore) {
                hiScoreEl.textContent = result.hiScore.toString().padStart(5, '0');
            } else {
                hiScoreEl.textContent = '00000';
            }

            // Dim sections if enhanced mode is off
            if (!enhToggle.checked) document.body.classList.add('disabled');
        }
    );

    // ── Enhanced mode toggle ──────────────────────────────────────────────
    enhToggle.addEventListener('change', (e) => {
        const enabled = e.target.checked;
        document.body.classList.toggle('disabled', !enabled);
        chrome.storage.local.set({ enhancementsEnabled: enabled });

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (!tab) return;
            const url = tab.url || '';
            if (url.includes('chrome://newtab') || url.includes('chrome://new-tab-page') || url.includes('src/index.html')) {
                chrome.tabs.update(tab.id, { url: enabled ? 'chrome://newtab/' : 'chrome://new-tab-page/' });
            }
        });
    });

    // ── Theme change ─────────────────────────────────────────────────────
    themeSelect.addEventListener('change', (e) => {
        const key = e.target.value;
        applyTheme(key);
        sendToNewTab({ theme: key });
    });

    // ── Particles ────────────────────────────────────────────────────────
    particlesTog.addEventListener('change', (e) => {
        sendToNewTab({ particles: e.target.checked });
    });

    // ── Audio ────────────────────────────────────────────────────────────
    audioTog.addEventListener('change', (e) => {
        sendToNewTab({ audio: e.target.checked });
    });

    // ── Messages ─────────────────────────────────────────────────────────
    messagesTog.addEventListener('change', (e) => {
        sendToNewTab({ messagesEnabled: e.target.checked });
    });

    // ── Open new tab ─────────────────────────────────────────────────────
    openTabBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: 'chrome://newtab/' });
    });



    // ── Live sync: react to changes made in the new tab ──────────────────
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace !== 'local') return;

        if (changes.theme) {
            const key = changes.theme.newValue;
            const activeTheme = applyTheme(key);
            themeSelect.value = activeTheme;
        }
        if (changes.hiScore !== undefined) {
            hiScoreEl.textContent = (changes.hiScore.newValue || 0).toString().padStart(5, '0');
        }
        if (changes.particles !== undefined) {
            particlesTog.checked = changes.particles.newValue !== false;
        }
        if (changes.audio !== undefined) {
            audioTog.checked = changes.audio.newValue !== false;
        }
        if (changes.messagesEnabled !== undefined) {
            messagesTog.checked = changes.messagesEnabled.newValue !== false;
        }
        if (changes.enhancementsEnabled !== undefined) {
            enhToggle.checked = changes.enhancementsEnabled.newValue === true;
            document.body.classList.toggle('disabled', !enhToggle.checked);
        }
        if (changes.widgetPrefs) {
            WidgetPrefs.mergeSaved(changes.widgetPrefs.newValue);
            syncWidgetSettings(widgetListEl);
        }
    });
});
