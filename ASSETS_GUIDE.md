# Dino Enhanced - Assets & Theme Integration Guide

To keep the Chrome extension lightweight, instantly loading, and highly performant (60 FPS), we must be strategic about file formats and how we structure the assets.

## Recommended File Extensions
For a production-grade modern web extension, you should avoid heavy formats like `.png` (unless heavily compressed) or `.gif`.

- **Images:** **`.webp`** (Strongly Recommended). WebP supports transparency like PNG but is typically 25% - 35% smaller in file size. It is natively supported by Chrome.
- **Audio (Optional):** **`.ogg`** or **`.mp3`**. Currently, the game uses a zero-dependency procedural synthesizer (Web Audio API) which costs 0 bytes of storage. If you want custom sound effects per theme, `.ogg` provides the best compression-to-quality ratio for web games.

## Required Assets Per Theme

Whether you use individual files or a single spritesheet, each theme will logically require the following sprites:

### 1. Player (Dino)
- `dino-idle.webp` (Standing still / jumping)
- `dino-run-1.webp` (Running animation frame 1)
- `dino-run-2.webp` (Running animation frame 2)
- `dino-duck-1.webp` (Ducking animation frame 1)
- `dino-duck-2.webp` (Ducking animation frame 2)
- `dino-dead.webp` (Hit / Game over state)

### 2. Obstacles
- `cactus-small.webp` (Can be 1-3 variations of small ground obstacles)
- `cactus-large.webp` (Can be 1-3 variations of large ground obstacles)
- `flyer-1.webp` (Airborne obstacle animation frame 1)
- `flyer-2.webp` (Airborne obstacle animation frame 2)

### 3. Environment
- `ground.webp` (A seamlessly tileable horizontal ground texture)
- `bg-layer-1.webp` (Optional: Far background parallax layer, e.g., distant mountains or city skyline)
- `bg-layer-2.webp` (Optional: Mid-background parallax layer, e.g., closer trees or buildings)
- `cloud.webp` (Background decoration)
- `moon-sun.webp` (Background decoration for day/night phases)
- `star.webp` (Optional, for night themes)

### 4. Effects & Polish
- `particle.webp` (Optional: A small custom sprite for theme-specific particles like leaves, sparks, or snow crystals).
- `speed-lines.webp` (Optional: An overlay that fades in when the game speed gets very high, creating an intense sense of motion).

### 5. Audio (Optional)
- `bgm.ogg` (Optional: A seamless looping background music track tailored to the theme).
- `jump.ogg`, `hit.ogg`, `score.ogg` (Custom sound effects).

---

## File Structure

When you are ready to add assets, please organize them into the `assets/` folder at the root of the project. 

### Option A: Individual Files (Easiest to Create)
If you provide individual images, organize them into folders named exactly after the themes (`classic`, `cyberpunk`, `nature`, `space`, `dark`).

```text
dino-enhanced/
└── assets/
    └── themes/
        ├── cyberpunk/
        │   ├── dino-run-1.webp
        │   ├── dino-run-2.webp
        │   ├── cactus-small.webp
        │   ├── ground.webp
        │   └── ... (other sprites)
        ├── nature/
        │   └── ... 
        └── space/
            └── ... 
```

### Option B: Spritesheet (Best for Performance)
For the absolute best performance and memory usage, combining all the sprites for a theme into a single image (a Spritesheet) is the industry standard for 2D web games. 

```text
dino-enhanced/
└── assets/
    └── themes/
        ├── cyberpunk/
        │   ├── spritesheet.webp
        │   └── data.json (Coordinates mapping where the dino/cactuses are in the image)
        ├── nature/
        │   ├── spritesheet.webp
        │   └── data.json
        └── space/
            ├── spritesheet.webp
            └── data.json
```

**Recommendation:** Start with **Option A** (Individual `.webp` files). Once you provide all the individual images for the themes, I can write a script or automatically stitch them into an optimized spritesheet for the final production build!

## Next Steps
1. Create your `.webp` assets.
2. Place them in the `assets/themes/[theme_name]/` directory.
3. Let me know when they are in place, and I will update the `ThemeManager` and `Renderer` to dynamically load your images instead of drawing the primitive canvas shapes!
