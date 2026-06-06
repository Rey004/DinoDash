import { WIDGET_REGISTRY, getDefaultWidgetPrefs, getWidgetDef } from './widgetRegistry.js';

const STORAGE_KEY = 'widgetPrefs';

export const WidgetPrefs = {
    enabled: getDefaultWidgetPrefs(),

    load() {
        return new Promise((resolve) => {
            if (!chrome.storage?.local) {
                try {
                    const local = localStorage.getItem(STORAGE_KEY);
                    if (local) {
                        this.mergeSaved(JSON.parse(local));
                    }
                } catch (e) {
                    console.error("Failed to load widgetPrefs from localStorage:", e);
                }
                resolve(this);
                return;
            }
            chrome.storage.local.get([STORAGE_KEY], (result) => {
                if (result[STORAGE_KEY] !== undefined) {
                    this.mergeSaved(result[STORAGE_KEY]);
                } else {
                    try {
                        const local = localStorage.getItem(STORAGE_KEY);
                        if (local) {
                            const parsed = JSON.parse(local);
                            this.mergeSaved(parsed);
                            chrome.storage.local.set({ [STORAGE_KEY]: { ...this.enabled } });
                        }
                    } catch (e) {
                        console.error("Failed to migrate widgetPrefs from localStorage:", e);
                    }
                }
                resolve(this);
            });
        });
    },

    mergeSaved(saved) {
        const defaults = getDefaultWidgetPrefs();
        this.enabled = { ...defaults };
        if (!saved || typeof saved !== 'object') return;
        for (const w of WIDGET_REGISTRY) {
            if (typeof saved[w.id] === 'boolean') {
                this.enabled[w.id] = saved[w.id];
            }
        }
    },

    save() {
        if (!chrome.storage?.local) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.enabled));
            } catch (e) {
                console.error("Failed to save widgetPrefs to localStorage:", e);
            }
            return;
        }
        chrome.storage.local.set({ [STORAGE_KEY]: { ...this.enabled } });
    },

    isEnabled(id) {
        return this.enabled[id] !== false;
    },

    setEnabled(id, enabled) {
        if (!getWidgetDef(id)) return;
        this.enabled[id] = enabled;
        this.save();
    },
};
