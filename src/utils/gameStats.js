const DEFAULT_STATS = {
    gamesPlayed: 0,
    lastScore: 0,
    hiScore: 0,
    totalPlayTimeMs: 0,
    totalDistance: 0,
};

export const GameStats = {
    data: { ...DEFAULT_STATS },

    load() {
        return new Promise((resolve) => {
            if (!chrome.storage?.local) {
                try {
                    const localStats = localStorage.getItem('gameStats');
                    if (localStats) {
                        this.data = { ...DEFAULT_STATS, ...JSON.parse(localStats) };
                    }
                    const localHiScore = localStorage.getItem('hiScore');
                    if (localHiScore) {
                        this.data.hiScore = parseInt(localHiScore, 10) || 0;
                    }
                } catch (e) {
                    console.error("Failed to load gameStats from localStorage:", e);
                }
                resolve(this.data);
                return;
            }
            chrome.storage.local.get(['gameStats', 'hiScore'], (result) => {
                const hasChromeData = result.gameStats !== undefined || result.hiScore !== undefined;
                if (hasChromeData) {
                    this.data = { ...DEFAULT_STATS, ...result.gameStats };
                    if (result.hiScore > (this.data.hiScore || 0)) {
                        this.data.hiScore = result.hiScore;
                    }
                } else {
                    try {
                        const localStats = localStorage.getItem('gameStats');
                        const localHiScore = localStorage.getItem('hiScore');
                        let migrated = false;
                        if (localStats) {
                            this.data = { ...DEFAULT_STATS, ...JSON.parse(localStats) };
                            migrated = true;
                        }
                        if (localHiScore) {
                            this.data.hiScore = parseInt(localHiScore, 10) || 0;
                            migrated = true;
                        }
                        if (migrated) {
                            chrome.storage.local.set({
                                gameStats: this.data,
                                hiScore: this.data.hiScore,
                            });
                        }
                    } catch (e) {
                        console.error("Failed to migrate gameStats from localStorage:", e);
                    }
                }
                resolve(this.data);
            });
        });
    },

    save() {
        if (!chrome.storage?.local) {
            try {
                localStorage.setItem('gameStats', JSON.stringify(this.data));
                localStorage.setItem('hiScore', this.data.hiScore.toString());
            } catch (e) {
                console.error("Failed to save gameStats to localStorage:", e);
            }
            return;
        }
        chrome.storage.local.set({
            gameStats: this.data,
            hiScore: this.data.hiScore,
        });
    },

    recordGameStart() {
        this.data.gamesPlayed += 1;
        this.save();
    },

    recordGameEnd(score, durationMs) {
        this.data.lastScore = score;
        this.data.totalPlayTimeMs += durationMs;
        this.data.totalDistance += score;
        if (score > this.data.hiScore) {
            this.data.hiScore = score;
        }
        this.save();
    },

};

export function formatPlayTime(ms) {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}

export function formatScore(n) {
    return (n || 0).toString().padStart(5, '0');
}
