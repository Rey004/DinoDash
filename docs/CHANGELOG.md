# Changelog

All notable changes to **DinoDash** will be documented here.

---

## v1.1.0

This release improves onboarding privacy by making the browsing history permission optional, and introduces a complete dashboard-style redesign for the extension popup.

### What's new

#### 🧠 Optional History Permission (Onboarding & Privacy)
- Moved the `history` permission from mandatory to optional. This removes the *"Read and change your browsing history"* warning when installing the extension from the Chrome Web Store.
- Designed and implemented a themed permission request screen inside the History Sidebar. Users can easily grant the history permission with a single click if they wish to use history logs, search, and analytics widgets.
- Retained the `tabs` permission under permissions to keep Enhanced Mode tab auto-reloads functioning seamlessly.

#### ⚙️ Popup Dashboard Redesign
- Redesigned the extension popup into a wide 3-column horizontal layout (`660px` x `350px`) to match the premium retro-cinematic monochrome aesthetic of the DinoDash landing page.
- Columns are divided into: Controls (toggles for game audio, particles, messages), Widget Manager (expanded tag-list settings), and Profile (scores, theme settings, support buttons).
- Decoupled the popup theme from runtime tab updates, securing the high-contrast retro-cinematic look.

#### 📁 Storage Migration & System Optimization
- Migrated data layers for favourite links, game stats, pinned history, and widget preferences to `chrome.storage.local` with automatic migration from `localStorage` on load and fallback support outside of the extension sandbox.
- Scaled and updated all brand PNG icons (`16x16`, `24x24`, `32x32`, `48x48`, `128x128`) from the updated `logo-dark.webp` asset.

---

## v1.0.0

The first stable release. DinoDash launches as a complete new-tab experience built around the classic Dino runner, with widgets, themes, smart history, and analytics.

### What's new

#### 🎮 Game
- A polished take on the classic Dino runner, with smoother movement, particle effects, and a high-score that sticks
- Crouch and jump support, with the world speeding up the further you run

#### 🎨 Themes
- Two starter themes — **Dark Valley** and **Mystic Forest**
- Switch themes anywhere — the new tab, panels, sidebars, and tooltips all update together
- No reload needed

#### 🧩 Widgets
- A widget manager with a tag-style picker for turning features on or off
- Five widgets included out of the box: Today's Run, Statistics, Enhanced Mode, Favourite Links, and History Sidebar

#### ✅ Today's Run
- Quick daily checkpoints in the top-right corner
- Add or remove your own, tick them off as you go
- Resets every day, collapses out of the way when you don't need it

#### ⭐ Favourite Links
- A foldered shortcut hub for the sites you reach for every session
- Drag and drop to reorder, rename folders, and delete with a confirmation

#### 🧠 History Sidebar
- A sliding panel for browsing your recent history
- Live search by title or URL
- Pin important pages to keep them surfaced across sessions
- Pages grouped by Today, Yesterday, Past 7 Days, and Older
- A category tag filter to narrow by type — Coding, Research, Design, Social, Entertainment, Shopping, and more

#### 📊 Analytics
- A Category Distribution bar chart that shows where your attention goes
- **Smart Insights** that read your habits in plain language and update with your actual numbers
- **Suggestions** that respond to your patterns — focus tips, anchor-site nudges, time-of-day reminders, weekend trends, and more

#### 🏆 Game Stats
- Track your high score, last score, games played, average score, total distance, and total play time

#### ⚙️ Popup
- Toggle the experience on or off in one click
- Switch themes, mute audio, hide particles, and show an FPS counter
- See your high score at a glance and open a fresh DinoDash tab anytime

#### 🔊 Audio
- Subtle sound effects that react to gameplay, with an easy mute switch

#### 💬 Tooltips
- Themed hover hints across every interactive surface so the UI explains itself without getting in the way

### Privacy

- Everything stays on your device
- No accounts, no tracking, no telemetry

---

*Future versions will be listed here as they ship.*
