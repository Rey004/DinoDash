<div align="center">

<img src="assets/brand/logo-dark.webp" alt="DinoDash Logo" width="120" height="120" style="border-radius:24px;" />

# DinoDash

**An advanced, modern reimagining of the classic Chrome Dino offline game — right in your new tab.**

[![Version](https://img.shields.io/badge/version-1.0-crimson?style=flat-square&logo=google-chrome)](manifest.json)
[![Manifest](https://img.shields.io/badge/Manifest-v3-blue?style=flat-square)](manifest.json)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](#)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-yellow?style=flat-square&logo=googlechrome)](https://developer.chrome.com/docs/extensions/)

</div>

---

## What is DinoDash?

**DinoDash** is a Chrome browser extension that completely transforms your **new tab page** into a premium, feature-rich experience. It replaces the default blank new tab with a beautifully themed environment where you can play an **enhanced version of the classic Chrome Dino game**, organize favourite links, browse history with smart analytics, track your scores, manage widgets, and personalize everything — all from a sleek popup interface.

Whether you're waiting for a page to load or just opening a new tab, DinoDash turns that moment into something fun, fast, and useful.

---

## Features

### 🎮 Enhanced Dino Game
- A fully re-engineered version of the classic Chrome offline dinosaur runner
- Smooth physics engine with jump and crouch mechanics
- Procedurally generated obstacles and environment
- Particle effects system for visual flair
- Real-time score display with **high-score persistence**

### 🎨 Multi-Theme Support
Choose from handcrafted themes that transform the entire look & feel:

| Theme | Description |
|-------|-------------|
| 🌑 **Dark Valley** | Deep crimson-dark aesthetic with red accents |
| 🌿 **Mystic Forest** | Lush green tones with an earthy, calm atmosphere |

Themes are applied instantly across the new tab, popup, sidebars, and overlays — no reload needed. Every component (tooltips, scrollbars, tags, panels) reacts to the active theme tokens automatically.

### 🧩 Customizable Widgets
Toggle independent widgets on or off using the tag-based widget manager (popup or new tab settings):

- **Today's Run** — Daily checkpoint quests in the top-right corner
- **Statistics** — In-page stats panel with detailed performance data
- **Enhanced Mode Toggle** — Quick shortcut to enable or disable the enhanced experience
- **Favourite Links** — Foldered bookmark hub with favicons and drag-and-drop organization
- **History Sidebar** — Sliding right-side panel with browsing memory, smart insights, and search

### 🔖 Favourite Links Hub
A bottom-left widget that opens a foldered bookmark panel:
- Create folders, drag links between them, reorder, rename, or delete
- Each link surfaces its favicon for instant recognition
- Designed for the sites you reach for every single session

### 🧠 History Sidebar with Smart Memory
A full-height sidebar that turns Chrome's flat history into something usable.

**History tab**
- Themed search input that filters by page title or URL in real time, with a one-tap clear button
- **Pinned Memory** — star any entry to keep it surfaced across sessions
- Chronological grouping: Today, Yesterday, Past 7 Days, Older Pages
- Each entry has a themed tooltip showing the title, host, date, and time at a glance
- **Type tags** — multi-select category filter using the same tag pattern as the widget manager. Add categories with `+`, remove individual tags with `×`, and the list narrows to whichever categories are active. With nothing selected, every category passes through.

**Analytics tab**
- **Category Distribution** — colored bars per category (Coding, Research, Design, Social, Entertainment, Shopping, Other)
- **Smart Insights** — a narrative summary that pulls real numbers from your data: total pages, unique sites, top category percentage, second-place category, peak time-of-day window, weekend/weekday split, anchor-site share, and focus-vs-casual balance
- **Suggestions** — actionable improvement tips that change with your behavior. Each tip is gated by a real signal (e.g. dominant social use, narrow domain diversity, late-night peak browsing, heavy shopping share) and quotes the actual percentages or hostnames so the advice stays specific

### 📊 Game Statistics
Track your full play history:
- 🏆 All-time High Score
- 🎯 Last Score
- 🎮 Games Played
- 📏 Average Score
- 🌍 Total Distance Traveled
- ⏱️ Total Play Time

### ⚙️ Extension Popup Settings
Click the DinoDash icon in your toolbar to quickly access:
- **Enhanced Mode** toggle — turn the experience on or off with one click
- **Theme Selector** — switch themes without opening the new tab
- **Particle Effects** toggle
- **Sound** toggle
- **FPS Counter** toggle
- **Hi-Score badge** — see your best score at a glance
- **Open New Tab** button — launch DinoDash instantly

### 🔊 Audio System
Immersive sound effects that react to gameplay events. Can be enabled or disabled at any time.

### 🔍 Integrated Search Bar
The new tab includes a **built-in search bar** so you never lose quick access to the web while enjoying the experience.

### 💬 Themed Tooltip System
A unified tooltip layer that follows the active theme. Every interactive control (tabs, filter tags, pin and delete buttons, history entries, favourite links) shows a themed hint on hover or focus, keeping the UI discoverable without cluttering it.

---

## 🚀 Installation Guide

You can install DinoDash directly from the Chrome Web Store:

[**Install DinoDash on Chrome Web Store**](https://chrome.google.com/webstore/detail/placeholder-id) *(Link coming soon)*

Once installed, DinoDash will automatically replace your default new tab page. 🎉

---

## 🎮 How to Play

| Action | Control |
|--------|---------|
| **Jump** | `Space` or `↑` Arrow Key |
| **Start / Restart** | `Space` |
| **Crouch** | `↓` Arrow Key |

- Press `Space` on the menu screen to start the game
- Avoid cacti and other obstacles
- The game speeds up over time — how far can you go?
- Your **high score is saved automatically** across sessions

---

## 🧠 Using the History Sidebar

Open the right-edge handle to slide the **Browsing Memory** sidebar in.

**History tab**
1. **Search** — type to filter live by title or URL; press `Esc` or click the × to clear
2. **Type tags** — tap `+` next to any category to filter by it; tap `×` on an active tag to remove it. Pick as many categories as you want; with none selected, every category is visible
3. **Pin** — star any entry to keep it in the **Pinned Memory** section across sessions
4. **Delete** — remove an entry from Chrome history with confirmation
5. Hover any entry to see its full title, host, date, and visit time in a themed tooltip

**Analytics tab**
- Switch to the Analytics pill to swap the list for a category breakdown, smart narrative summary, and actionable suggestions tied to your real browsing patterns

---

## ⚙️ Using the Popup

Click the **DinoDash icon** in the Chrome toolbar to open the popup panel:

1. **Enhanced Mode** — Master switch to enable or disable the custom new tab. When off, Chrome's default new tab is shown.
2. **Theme** — Pick your preferred visual theme. Changes apply live.
3. **Particles** — Toggle the particle effects during gameplay.
4. **Sound** — Mute or unmute game audio.
5. **Show FPS** — Display a real-time FPS counter on the new tab.
6. **Hi Score** — Your current all-time best score, always visible.
7. **Open New Tab** — Jump straight to the DinoDash experience.

> Settings sync in real-time between the popup and the open new tab page — no refresh needed.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Extension API | Chrome Manifest v3 |
| UI | Vanilla HTML, CSS, JavaScript (ES Modules) |
| Rendering | HTML5 Canvas |
| Storage | `chrome.storage.local` |
| History | `chrome.history` API |
| Fonts | Google Fonts (Inter, JetBrains Mono) |
| Permissions | `storage`, `tabs`, `history` |

### Project Structure

```
dino-enhanced/
├── assets/                 # Brand assets and per-theme sprite folders
├── shared/                 # Cross-context modules (popup + new tab)
│   ├── widgetRegistry.js   # Single source of truth for available widgets
│   ├── widgetPrefs.js      # Storage-backed enable/disable state
│   └── widgetSettingsUI.js # Tag-based widget manager UI
├── src/
│   ├── audio/              # Audio engine
│   ├── engine/             # Game loop, physics, state
│   ├── entities/           # Dino, environment, obstacles
│   ├── rendering/          # Renderer and particle system
│   ├── themes/             # Theme presets and runtime manager
│   ├── ui/                 # Sidebars, panels, history, favourites, quests
│   ├── styles/             # Tokens, base, components, layout
│   └── index.html          # New tab entry point
├── popup.html / popup.js   # Toolbar popup
├── background.js           # Service worker
└── manifest.json
```

---

## 🔐 Permissions Explained

DinoDash requests only what it needs to deliver the new tab experience:

| Permission | Used For |
|------------|---------|
| `storage` | Saving game stats, pinned history, widget prefs, theme choice, and favourite links |
| `tabs` | Opening a new DinoDash tab from the popup's "Open New Tab" button |
| `history` | Reading and removing entries for the History sidebar (search, pin, delete, analytics) |

No data leaves your browser. Everything stays in `chrome.storage.local`.

---

## 🤝 Contributing

Pull requests and suggestions are welcome! If you'd like to add a new theme, widget, or feature:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ by Revanshu

*Keep running. Never stop.*

</div>
