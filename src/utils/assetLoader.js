export const AssetLoader = {
    images: {},
    
    async loadThemeAssets(themeName) {
        // We can expand this list as more assets are added
        const assets = ['idle', 'run-1', 'run-2', 'duck-1', 'duck-2', 'dead', 'small-obstacle', 'large-obstacle', 'ground', 'background'];
        
        const promises = assets.map(asset => {
            return new Promise(resolve => {
                const img = new Image();
                const key = `${themeName}_${asset}`;
                
                if (this.images[key] !== undefined) {
                    resolve();
                    return;
                }
                
                img.src = `../assets/themes/${themeName}/${asset}.webp`;
                
                img.onload = () => {
                    this.images[key] = img;
                    resolve();
                };
                
                img.onerror = () => {
                    // Try .png as a fallback
                    const fallbackImg = new Image();
                    fallbackImg.src = `../assets/themes/${themeName}/${asset}.png`;
                    fallbackImg.onload = () => {
                        this.images[key] = fallbackImg;
                        resolve();
                    };
                    fallbackImg.onerror = () => {
                        this.images[key] = null;
                        resolve();
                    };
                };
            });
        });
        
        await Promise.all(promises);
    },
    
    getSprite(themeName, asset) {
        return this.images[`${themeName}_${asset}`] || null;
    }
};
