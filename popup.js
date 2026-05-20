// popup.js — Dino Enhanced extension popup

// ── Theme design tokens (mirrors src/themes/presets.js) ──────────────────────
const THEMES = {
    classic: {
        name: 'Classic',
        bg:           '#f7f7f7',
        surface:      'rgba(255,255,255,0.88)',
        border:       'rgba(0,0,0,0.10)',
        text:         '#535353',
        textMuted:    'rgba(83,83,83,0.6)',
        accent:       '#1a73e8',
        accentSoft:   'rgba(26,115,232,0.12)',
        glow:         'none',
        btnBg:        '#1a73e8',
        btnText:      '#ffffff',
        inputBg:      'rgba(255,255,255,0.98)',
        selectBg:     'rgba(255,255,255,0.95)',
        logoGradient: 'linear-gradient(90deg,#4285f4 25%,#ea4335 25%,#ea4335 50%,#fbbc05 50%,#fbbc05 75%,#34a853 75%)',
    },
    cyberpunk: {
        name: 'Cyberpunk',
        bg:           '#0a0a1a',
        surface:      'rgba(8,8,28,0.88)',
        border:       'rgba(0,255,255,0.28)',
        text:         '#00ffff',
        textMuted:    'rgba(0,255,255,0.5)',
        accent:       '#00ffff',
        accentSoft:   'rgba(0,255,255,0.10)',
        glow:         '0 0 12px rgba(0,255,255,0.4)',
        btnBg:        '#00ffff',
        btnText:      '#0a0a1a',
        inputBg:      'rgba(4,4,20,0.90)',
        selectBg:     'rgba(4,4,20,0.90)',
        logoGradient: 'linear-gradient(90deg,#ff00ff,#00ffff)',
    },
    nature: {
        name: 'Nature',
        bg:           '#dff0e8',
        surface:      'rgba(240,255,245,0.88)',
        border:       'rgba(46,139,87,0.22)',
        text:         '#2E4A2E',
        textMuted:    'rgba(46,74,46,0.55)',
        accent:       '#2E8B57',
        accentSoft:   'rgba(46,139,87,0.14)',
        glow:         'none',
        btnBg:        '#2E8B57',
        btnText:      '#ffffff',
        inputBg:      'rgba(255,255,255,0.92)',
        selectBg:     'rgba(240,255,245,0.95)',
        logoGradient: 'linear-gradient(90deg,#2E8B57,#56ab2f)',
    },
    space: {
        name: 'Space',
        bg:           '#00001a',
        surface:      'rgba(4,4,22,0.88)',
        border:       'rgba(167,139,250,0.22)',
        text:         '#c8d6f0',
        textMuted:    'rgba(200,214,240,0.5)',
        accent:       '#a78bfa',
        accentSoft:   'rgba(167,139,250,0.12)',
        glow:         '0 0 12px rgba(167,139,250,0.35)',
        btnBg:        '#a78bfa',
        btnText:      '#04041a',
        inputBg:      'rgba(2,2,16,0.90)',
        selectBg:     'rgba(4,4,22,0.90)',
        logoGradient: 'linear-gradient(90deg,#a78bfa,#60a5fa)',
    },
    dark: {
        name: 'Dark',
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
    },
};

// ── Apply theme CSS variables to popup ───────────────────────────────────────
function applyTheme(key) {
    const t = THEMES[key] || THEMES.classic;
    const r = document.documentElement;

    r.style.setProperty('--bg',            t.bg);
    r.style.setProperty('--surface',       t.surface);
    r.style.setProperty('--border',        t.border);
    r.style.setProperty('--text',          t.text);
    r.style.setProperty('--text-muted',    t.textMuted);
    r.style.setProperty('--accent',        t.accent);
    r.style.setProperty('--accent-soft',   t.accentSoft);
    r.style.setProperty('--glow',          t.glow);
    r.style.setProperty('--btn-bg',        t.btnBg);
    r.style.setProperty('--btn-text',      t.btnText);
    r.style.setProperty('--input-bg',      t.inputBg);
    r.style.setProperty('--select-bg',     t.selectBg);
    r.style.setProperty('--logo-gradient', t.logoGradient);

    document.body.setAttribute('data-theme', key);

    // Update the theme name chip
    const nameEl = document.getElementById('popup-theme-name');
    if (nameEl) nameEl.textContent = t.name;

    // Tint the slider checked colour via accent
    document.querySelectorAll('input:checked + .slider').forEach(el => {
        el.style.background = t.accent;
    });
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
    const fpsTog       = document.getElementById('popup-fps');
    const hiScoreEl    = document.getElementById('popup-hi-score');
    const openTabBtn   = document.getElementById('open-tab-btn');
    const resetBtn     = document.getElementById('reset-score-btn');

    // ── Load all saved settings ───────────────────────────────────────────
    chrome.storage.local.get(
        ['enhancementsEnabled', 'theme', 'particles', 'audio', 'fps', 'hiScore'],
        (result) => {
            const theme = result.theme || 'classic';

            // Apply theme to popup immediately
            applyTheme(theme);
            themeSelect.value = theme;

            // Toggles
            enhToggle.checked    = result.enhancementsEnabled !== false;
            particlesTog.checked = result.particles !== false;
            audioTog.checked     = result.audio     !== false;
            fpsTog.checked       = result.fps       === true;

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

    // ── FPS ──────────────────────────────────────────────────────────────
    fpsTog.addEventListener('change', (e) => {
        sendToNewTab({ fps: e.target.checked });
    });

    // ── Open new tab ─────────────────────────────────────────────────────
    openTabBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: 'chrome://newtab/' });
    });

    // ── Reset hi-score ───────────────────────────────────────────────────
    resetBtn.addEventListener('click', () => {
        chrome.storage.local.set({ hiScore: 0 }, () => {
            hiScoreEl.textContent = '00000';
            // Flash feedback
            resetBtn.textContent = '✓ Reset!';
            setTimeout(() => { resetBtn.innerHTML = '<span>↺</span> Reset Hi-Score'; }, 1200);
        });
    });

    // ── Live sync: react to changes made in the new tab ──────────────────
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace !== 'local') return;

        if (changes.theme) {
            const key = changes.theme.newValue;
            applyTheme(key);
            themeSelect.value = key;
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
        if (changes.fps !== undefined) {
            fpsTog.checked = !!changes.fps.newValue;
        }
    });
});
