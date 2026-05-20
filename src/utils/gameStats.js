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
                resolve(this.data);
                return;
            }
            chrome.storage.local.get(['gameStats', 'hiScore'], (result) => {
                this.data = { ...DEFAULT_STATS, ...result.gameStats };
                if (result.hiScore > (this.data.hiScore || 0)) {
                    this.data.hiScore = result.hiScore;
                }
                resolve(this.data);
            });
        });
    },

    save() {
        if (!chrome.storage?.local) return;
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
