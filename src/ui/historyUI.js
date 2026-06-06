/* src/ui/historyUI.js */

import { WidgetManager } from './widgetManager.js';

// State Variables
let pinnedHistory = [];
let cachedHistoryItems = []; // In-memory cache for search & rendering

// Tab & Filter States
let activeTab = 'history';
let activeCategories = new Set();       // empty = no category filter (all match)

// Categorization patterns based on domains
const CATEGORY_PATTERNS = {
    coding: [
        'github.com', 'stackoverflow.com', 'npmjs.com', 'localhost', 'developer.mozilla.org',
        'w3schools.com', 'codepen.io', 'repl.it', 'dev.to', 'medium.com', 'chatgpt.com',
        'claude.ai', 'huggingface.co', 'copilot'
    ],
    design: [
        'figma.com', 'dribbble.com', 'behance.net', 'pinterest.com', 'canva.com',
        'unsplash.com', 'adobe.com'
    ],
    entertainment: [
        'youtube.com', 'netflix.com', 'twitch.tv', 'spotify.com', 'soundcloud.com', 'reddit.com'
    ],
    shopping: [
        'amazon.com', 'ebay.com', 'aliexpress.com', 'etsy.com', 'shopify.com', 'target.com', 'walmart.com'
    ],
    social: [
        'twitter.com', 'x.com', 'facebook.com', 'instagram.com', 'linkedin.com', 'discord.com', 'slack.com'
    ],
    research: [
        'google.com', 'wikipedia.org', 'bing.com', 'duckduckgo.com', 'arxiv.org', 'scholar.google.com'
    ]
};

// Meta lookups for categorizations (labels and SVG icons)
const CATEGORY_META = {
    coding: {
        label: 'Coding',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`
    },
    design: {
        label: 'Design',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"/><circle cx="7.5" cy="10.5" r="1.5"/><circle cx="11.5" cy="7.5" r="1.5"/><circle cx="16.5" cy="9.5" r="1.5"/><circle cx="15.5" cy="14.5" r="1.5"/></svg>`
    },
    entertainment: {
        label: 'Entertainment',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`
    },
    shopping: {
        label: 'Shopping',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`
    },
    social: {
        label: 'Social',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`
    },
    research: {
        label: 'Research',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`
    },
    other: {
        label: 'Other',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
    }
};

function getHost(url) {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return url;
    }
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function classifyUrl(url) {
    try {
        const hostname = new URL(url).hostname.toLowerCase();
        for (const [category, domains] of Object.entries(CATEGORY_PATTERNS)) {
            if (domains.some(domain => hostname.includes(domain))) {
                return category;
            }
        }
        return 'other';
    } catch {
        return 'other';
    }
}

// Persisted Pinned Items Handlers
async function loadPinnedHistory() {
    return new Promise((resolve) => {
        if (chrome.storage?.local) {
            chrome.storage.local.get(['pinnedHistory'], (result) => {
                if (result.pinnedHistory !== undefined) {
                    pinnedHistory = result.pinnedHistory || [];
                } else {
                    try {
                        const local = localStorage.getItem('dinoPinnedHistory');
                        if (local) {
                            pinnedHistory = JSON.parse(local);
                            chrome.storage.local.set({ pinnedHistory });
                        } else {
                            pinnedHistory = [];
                        }
                    } catch {
                        pinnedHistory = [];
                    }
                }
                resolve(pinnedHistory);
            });
        } else {
            try {
                pinnedHistory = JSON.parse(localStorage.getItem('dinoPinnedHistory') || '[]');
            } catch {
                pinnedHistory = [];
            }
            resolve(pinnedHistory);
        }
    });
}

function savePinnedHistory() {
    if (chrome.storage?.local) {
        chrome.storage.local.set({ pinnedHistory });
    } else {
        try {
            localStorage.setItem('dinoPinnedHistory', JSON.stringify(pinnedHistory));
        } catch (e) {
            console.error("Failed to save pinnedHistory to localStorage:", e);
        }
    }
}

function isPinned(url) {
    return pinnedHistory.some(it => it.url === url);
}

function togglePin(item) {
    const idx = pinnedHistory.findIndex(it => it.url === item.url);
    if (idx >= 0) {
        pinnedHistory.splice(idx, 1);
    } else {
        pinnedHistory.push({
            url: item.url,
            title: item.title,
            lastVisitTime: item.lastVisitTime
        });
    }
    savePinnedHistory();
    filterAndRenderHistory();
}

// Flat chronological groupings for All mode
function groupHistoryItemsChronologically(items) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const groups = {
        today: [],
        yesterday: [],
        week: [],
        older: []
    };

    for (const item of items) {
        const date = new Date(item.lastVisitTime);
        if (date >= today) {
            groups.today.push(item);
        } else if (date >= yesterday) {
            groups.yesterday.push(item);
        } else if (date >= sevenDaysAgo) {
            groups.week.push(item);
        } else {
            groups.older.push(item);
        }
    }
    return groups;
}

// Render interactive stats graphs
function renderInsights(items) {
    const catList = document.getElementById('insights-categories-list');
    const summaryEl = document.getElementById('insights-summary');
    const suggestionsEl = document.getElementById('insights-suggestions');
    if (!catList || !summaryEl || !suggestionsEl) return;

    if (!items || items.length === 0) {
        const empty = '<div class="history-empty">No insights data available for this range.</div>';
        catList.innerHTML = empty;
        summaryEl.innerHTML = empty;
        suggestionsEl.innerHTML = '';
        return;
    }

    // 1. Category Breakdown
    const catCounts = {};
    let totalCategorized = 0;
    for (const item of items) {
        const cat = classifyUrl(item.url);
        catCounts[cat] = (catCounts[cat] || 0) + 1;
        totalCategorized++;
    }

    const sortedCats = Object.entries(catCounts)
        .map(([cat, count]) => ({
            category: cat,
            count,
            percent: Math.round((count / totalCategorized) * 100)
        }))
        .sort((a, b) => b.count - a.count);

    const catColors = {
        coding: '#2196f3',
        design: '#e040fb',
        entertainment: '#ff5252',
        shopping: '#ff9800',
        social: '#4caf50',
        research: '#009688',
        other: '#9e9e9e'
    };

    let catHtml = '';
    for (const entry of sortedCats) {
        const meta = CATEGORY_META[entry.category] || CATEGORY_META.other;
        const color = catColors[entry.category] || catColors.other;

        catHtml += `
            <div class="insights-category-row">
                <div class="insights-category-meta">
                    <span>${meta.label}</span>
                    <span class="insights-category-percent">${entry.percent}%</span>
                </div>
                <div class="insight-bar-outer">
                    <div class="insight-bar-inner" style="width: ${entry.percent}%; background-color: ${color};"></div>
                </div>
            </div>
        `;
    }
    catList.innerHTML = catHtml;

    // 2. Smart Insights — describe what's happening + improvement suggestions
    const { summaryHtml, suggestionsHtml } = buildSmartInsights(items, sortedCats, totalCategorized);
    summaryEl.innerHTML = summaryHtml;
    suggestionsEl.innerHTML = suggestionsHtml;
}

// Build narrative summary + tailored suggestions from history analytics.
// Every line and suggestion is derived from concrete metrics so the panel
// changes meaningfully as the underlying data shifts.
function buildSmartInsights(items, sortedCats, total) {
    const top = sortedCats[0];
    const topMeta = CATEGORY_META[top.category] || CATEGORY_META.other;
    const second = sortedCats[1];
    const secondMeta = second ? (CATEGORY_META[second.category] || CATEGORY_META.other) : null;

    // Hour-of-day distribution (3-hour blocks).
    const hourBlocks = Array(8).fill(0);
    const blockLabels = ['12–3am', '3–6am', '6–9am', '9am–12pm', '12–3pm', '3–6pm', '6–9pm', '9pm–12am'];
    for (const item of items) {
        const hour = new Date(item.lastVisitTime).getHours();
        hourBlocks[Math.floor(hour / 3)]++;
    }
    const peakIdx = hourBlocks.indexOf(Math.max(...hourBlocks));
    const peakLabel = blockLabels[peakIdx];
    const peakShare = total > 0 ? hourBlocks[peakIdx] / total : 0;
    const isLateNight = peakIdx === 0 || peakIdx === 7;
    const isMorning = peakIdx === 2 || peakIdx === 3;
    const isEvening = peakIdx === 6;

    // Day-of-week spread.
    const dayCounts = Array(7).fill(0);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (const item of items) {
        dayCounts[new Date(item.lastVisitTime).getDay()]++;
    }
    const peakDayIdx = dayCounts.indexOf(Math.max(...dayCounts));
    const peakDay = dayNames[peakDayIdx];
    const weekdayCount = dayCounts[1] + dayCounts[2] + dayCounts[3] + dayCounts[4] + dayCounts[5];
    const weekendCount = dayCounts[0] + dayCounts[6];
    const weekendShare = total > 0 ? weekendCount / total : 0;

    // Domain diversity & top hosts.
    const hostCounts = {};
    for (const item of items) {
        const h = getHost(item.url);
        hostCounts[h] = (hostCounts[h] || 0) + 1;
    }
    const uniqueHosts = Object.keys(hostCounts).length;
    const sortedHosts = Object.entries(hostCounts).sort((a, b) => b[1] - a[1]);
    const topHost = sortedHosts[0]?.[0] || '';
    const topHostCount = sortedHosts[0]?.[1] || 0;
    const topHostShare = total > 0 ? Math.round((topHostCount / total) * 100) : 0;
    const secondHost = sortedHosts[1]?.[0] || '';
    const diversityRatio = total > 0 ? uniqueHosts / total : 0;

    // Category buckets.
    const catShare = (cat) =>
        (sortedCats.find(c => c.category === cat)?.count || 0) / Math.max(total, 1);
    const distractorShare = catShare('entertainment') + catShare('social');
    const focusShare = catShare('coding') + catShare('research') + catShare('design');
    const shoppingShare = catShare('shopping');

    const ratio = focusShare / Math.max(distractorShare, 0.01);

    // ── Narrative summary (data-driven, every line references real metrics)
    const summaryLines = [];

    summaryLines.push(
        `<p class="insights-line"><strong>${total}</strong> pages across <strong>${uniqueHosts}</strong> sites. <strong>${topMeta.label}</strong> leads at <strong>${top.percent}%</strong>${
            second && second.percent >= 10
                ? `, with <strong>${secondMeta.label}</strong> at <strong>${second.percent}%</strong>`
                : ''
        }.</p>`
    );

    // Time-of-day line varies by where the peak lands.
    const peakPct = Math.round(peakShare * 100);
    let peakSentence = `Most active around <strong>${peakLabel}</strong> (<strong>${peakPct}%</strong> of visits)`;
    if (isLateNight) peakSentence += ' — late-night territory.';
    else if (isMorning) peakSentence += ' — a clear morning rhythm.';
    else if (isEvening) peakSentence += ' — evening browsing dominates.';
    else peakSentence += '.';
    summaryLines.push(`<p class="insights-line">${peakSentence}</p>`);

    // Day pattern.
    if (weekendShare >= 0.45 && total >= 15) {
        summaryLines.push(
            `<p class="insights-line">Weekends drive <strong>${Math.round(weekendShare * 100)}%</strong> of activity — peak day is <strong>${peakDay}</strong>.</p>`
        );
    } else if (peakDayIdx >= 1 && peakDayIdx <= 5 && weekdayCount > 0) {
        summaryLines.push(
            `<p class="insights-line"><strong>${peakDay}</strong> is your busiest day this range.</p>`
        );
    }

    // Anchor / diversity description.
    if (topHost && topHostShare >= 25) {
        summaryLines.push(
            `<p class="insights-line"><strong>${escapeHtml(topHost)}</strong> alone is <strong>${topHostShare}%</strong> of your visits — a strong anchor site.</p>`
        );
    } else if (diversityRatio > 0.6) {
        summaryLines.push(
            `<p class="insights-line">Browsing feels exploratory — roughly <strong>${Math.round(diversityRatio * 100)}%</strong> of visits go to a fresh site.</p>`
        );
    } else if (diversityRatio < 0.25 && total >= 10) {
        summaryLines.push(
            `<p class="insights-line">You revisit the same handful of sites — only <strong>${uniqueHosts}</strong> unique domains in <strong>${total}</strong> visits.</p>`
        );
    }

    // Focus vs distractor balance.
    if (focusShare >= 0.5) {
        summaryLines.push(
            `<p class="insights-line">Roughly <strong>${Math.round(focusShare * 100)}%</strong> of your time leans toward focus work.</p>`
        );
    } else if (distractorShare >= 0.5) {
        summaryLines.push(
            `<p class="insights-line"><strong>${Math.round(distractorShare * 100)}%</strong> of visits land on entertainment or social.</p>`
        );
    } else if (focusShare > 0 && distractorShare > 0) {
        summaryLines.push(
            `<p class="insights-line">Focus and casual sit close — <strong>${Math.round(focusShare * 100)}%</strong> focus vs <strong>${Math.round(distractorShare * 100)}%</strong> casual.</p>`
        );
    }

    // ── Suggestions — each tied to a concrete signal so they shift with the data.
    const suggestions = [];

    // Category-specific guidance with the user's actual top category named.
    if (top.category === 'social' && top.percent >= 30) {
        suggestions.push({
            icon: '📵',
            text: `Social leads at ${top.percent}%${topHost ? ` (mostly ${escapeHtml(topHost)})` : ''}. Try opening a research or coding tab first thing to anchor focus.`
        });
    } else if (top.category === 'entertainment' && top.percent >= 30) {
        suggestions.push({
            icon: '⏱️',
            text: `Entertainment is ${top.percent}% of your stack. A 20-minute timer on these sites keeps quick breaks from sliding into hours.`
        });
    } else if (top.category === 'shopping' && top.percent >= 20) {
        suggestions.push({
            icon: '�',
            text: `Shopping is at ${top.percent}%. Consolidating wishlists into one tab can cut repeat browsing.`
        });
    } else if (top.category === 'coding' && top.percent >= 30) {
        suggestions.push({
            icon: '💻',
            text: `Coding leads at ${top.percent}% — strong builder mode. Pin your top dev sites to launch them in one click.`
        });
    } else if (top.category === 'research' && top.percent >= 30) {
        suggestions.push({
            icon: '📚',
            text: `Research dominates at ${top.percent}%. Consider saving recurring queries as pinned items for faster recall.`
        });
    } else if (top.category === 'design' && top.percent >= 25) {
        suggestions.push({
            icon: '🎨',
            text: `Design is at ${top.percent}%. Pin your most-used boards or palettes to skip the search step.`
        });
    }

    // Distractor-vs-focus balance speaks to the actual ratio.
    if (distractorShare >= 0.5) {
        suggestions.push({
            icon: '🎯',
            text: `Casual browsing is ${Math.round(distractorShare * 100)}% vs ${Math.round(focusShare * 100)}% focus. A 25-minute focus block before opening these sites can rebalance.`
        });
    } else if (ratio >= 2.5 && total >= 15) {
        suggestions.push({
            icon: '🚀',
            text: `Focus is roughly ${ratio.toFixed(1)}× your casual time. Strong rhythm — protect it by pinning your top working sites.`
        });
    }

    // Anchor host.
    if (topHostShare >= 40 && topHost) {
        suggestions.push({
            icon: '📌',
            text: `Most of your day flows through ${escapeHtml(topHost)} (${topHostShare}%). Pinning it makes it one click away every session.`
        });
    } else if (topHostShare >= 20 && secondHost && sortedHosts[1][1] >= 3) {
        suggestions.push({
            icon: '🔗',
            text: `${escapeHtml(topHost)} and ${escapeHtml(secondHost)} are your two anchors — bookmarking the pair as a folder speeds up your routine.`
        });
    }

    // Diversity nudges.
    if (diversityRatio < 0.2 && total > 20) {
        suggestions.push({
            icon: '🔍',
            text: `Only ${uniqueHosts} unique sites in ${total} visits — narrow loop. One new source a week can broaden your input.`
        });
    } else if (diversityRatio > 0.7 && total >= 20) {
        suggestions.push({
            icon: '🧭',
            text: `Lots of new sites (${uniqueHosts} unique). A "read later" list can turn scattered tabs into focused sessions.`
        });
    }

    // Time-of-day nudges referencing the actual peak window.
    if (isLateNight && peakShare >= 0.25) {
        suggestions.push({
            icon: '🌙',
            text: `Peak browsing falls in ${peakLabel} (${peakPct}%). A wind-down cutoff can protect tomorrow's focus.`
        });
    } else if (isMorning && focusShare >= 0.4) {
        suggestions.push({
            icon: '☀️',
            text: `Mornings (${peakLabel}) are your sharpest stretch. Block out this window for the deepest work first.`
        });
    } else if (isEvening && distractorShare >= 0.4) {
        suggestions.push({
            icon: '🌆',
            text: `Evenings (${peakLabel}) lean casual — that's fine, but a hard "no new tabs after 10pm" cuts the spillover.`
        });
    }

    // Weekend vs weekday split.
    if (weekendShare >= 0.55 && total >= 15) {
        suggestions.push({
            icon: '📅',
            text: `Weekends carry ${Math.round(weekendShare * 100)}% of activity. If that's casual time, set a Monday "fresh start" tab to reset.`
        });
    } else if (weekendShare <= 0.1 && total >= 20) {
        suggestions.push({
            icon: '🛌',
            text: `Almost all activity is on weekdays — healthy offline weekends. Keep that boundary intact.`
        });
    }

    // Shopping spike.
    if (shoppingShare >= 0.2) {
        suggestions.push({
            icon: '💳',
            text: `Shopping is ${Math.round(shoppingShare * 100)}% of visits. A 24-hour wait rule on cart items often trims impulse buys.`
        });
    }

    // Single-category fallback.
    if (sortedCats.length === 1) {
        suggestions.push({
            icon: '🌱',
            text: `Only ${topMeta.label} showed up in this range. Mixing in research or design sites broadens your input.`
        });
    }

    // Balanced fallback if nothing else fired.
    if (suggestions.length === 0) {
        suggestions.push({
            icon: '✨',
            text: `Browsing looks balanced — ${Math.round(focusShare * 100)}% focus, ${Math.round(distractorShare * 100)}% casual, peak ${peakLabel}. Keep the rhythm.`
        });
    }

    const suggestionsHtml = suggestions
        .slice(0, 4)
        .map(s => `
            <div class="insight-suggestion">
                <span class="insight-suggestion__icon" aria-hidden="true">${s.icon}</span>
                <span class="insight-suggestion__text">${s.text}</span>
            </div>
        `).join('');

    return {
        summaryHtml: summaryLines.join(''),
        suggestionsHtml
    };
}

// Range filter helper removed — no time range filter remains.

export function filterAndRenderHistory() {
    const query = (document.getElementById('history-search-input')?.value || '').toLowerCase().trim();
    let itemsToRender = cachedHistoryItems;

    // Category — match if any active tag matches the item's classified category.
    if (activeCategories.size > 0) {
        itemsToRender = itemsToRender.filter(item => activeCategories.has(classifyUrl(item.url)));
    }

    // Search
    if (query) {
        itemsToRender = itemsToRender.filter(item => {
            return (item.title || '').toLowerCase().includes(query) || (item.url || '').toLowerCase().includes(query);
        });
    }

    updateFilterIndicators(itemsToRender.length);
    renderHistory(itemsToRender);
}

// Reflect active filter counts and clear-button visibility in the UI.
function updateFilterIndicators(visibleCount) {
    const clearBtn = document.getElementById('history-search-clear');
    const input = document.getElementById('history-search-input');
    if (clearBtn && input) {
        clearBtn.classList.toggle('hidden', !input.value);
    }

    // Show match count when any filter is engaged.
    const filtering = !!input?.value || activeCategories.size > 0;
    const filtersEl = document.getElementById('history-filters');
    if (filtersEl) {
        filtersEl.dataset.matchCount = filtering ? String(visibleCount) : '';
        filtersEl.classList.toggle('is-filtering', filtering);
    }
}

export function renderHistory(items) {
    const listContainer = document.getElementById('history-list-container');
    const insightsContainer = document.getElementById('history-insights-container');

    if (!listContainer || !insightsContainer) return;

    // Toggle tab sections visibility
    if (activeTab === 'analytics') {
        listContainer.classList.add('hidden');
        insightsContainer.classList.remove('hidden');
        renderInsights(items);
        return;
    } else {
        listContainer.classList.remove('hidden');
        insightsContainer.classList.add('hidden');
    }

    if (!items || items.length === 0) {
        const filtering = activeCategories.size > 0 || !!document.getElementById('history-search-input')?.value;
        const msg = filtering
            ? 'No matches for the current filters. Try clearing the category or search.'
            : 'No browsing history yet. Visit a few pages and they\'ll show up here.';
        listContainer.innerHTML = `<div class="history-empty">${msg}</div>`;
        return;
    }

    let html = '';

    // Render Pinned section
    if (pinnedHistory.length > 0) {
        html += `
            <div class="history-pinned-section">
                <div class="history-pinned-header" data-tooltip="Pinned pages persist across sessions" data-tooltip-position="left">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 12V4h1v-2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/></svg>
                    Pinned Memory
                </div>
        `;
        for (const item of pinnedHistory) {
            html += renderHistoryItemMarkup(item);
        }
        html += `</div>`;
    }

    const groups = groupHistoryItemsChronologically(items);
    
    const renderGroup = (headerText, list) => {
        if (list.length === 0) return '';
        let groupHtml = `<div class="history-group-header">${headerText}</div>`;
        for (const item of list) {
            groupHtml += renderHistoryItemMarkup(item);
        }
        return groupHtml;
    };

    let listHtml = '';
    listHtml += renderGroup('Today', groups.today);
    listHtml += renderGroup('Yesterday', groups.yesterday);
    listHtml += renderGroup('Past 7 Days', groups.week);
    listHtml += renderGroup('Older Pages', groups.older);

    if (listHtml === '' && pinnedHistory.length === 0) {
        const filtering = activeCategories.size > 0 || !!document.getElementById('history-search-input')?.value;
        const msg = filtering
            ? 'No matches for the current filters. Try clearing the category or search.'
            : 'No history logs matched.';
        listContainer.innerHTML = `<div class="history-empty">${msg}</div>`;
        return;
    } else {
        html += listHtml;
    }

    listContainer.innerHTML = html;

    // Attach listeners
    listContainer.querySelectorAll('.history-delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const url = btn.dataset.url;
            
            const confirmed = window.confirm("Are you sure you want to erase this entry from your browsing memory?");
            if (confirmed) {
                deleteHistoryItem(url);
            }
        });
    });

    listContainer.querySelectorAll('.history-pin-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const url = btn.dataset.url;
            const item = items.find(it => it.url === url) || pinnedHistory.find(it => it.url === url);
            if (item) {
                togglePin(item);
            }
        });
    });
}



function renderHistoryItemMarkup(item) {
    const faviconUrl = `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(item.url)}&sz=32`;
    const titleText = item.title || getHost(item.url);
    const pinned = isPinned(item.url);
    const host = getHost(item.url);
    const visitTime = formatTime(item.lastVisitTime);
    const visitDate = new Date(item.lastVisitTime).toLocaleDateString([], { month: 'short', day: 'numeric' });

    // Compose a rich, themed tooltip describing the entry.
    const itemTooltip = `${titleText} — ${host} · ${visitDate} ${visitTime}`;
    const pinTooltip = pinned ? 'Unpin from memory' : 'Pin to memory';
    const deleteTooltip = `Erase ${host} from history`;

    return `
        <a href="${item.url}" class="history-item" target="_blank" rel="noopener noreferrer" data-url="${item.url}"
           data-tooltip="${escapeHtml(itemTooltip)}" data-tooltip-position="left">
            <img class="history-favicon" src="${faviconUrl}" alt="" loading="lazy" decoding="async">
            <div class="history-meta">
                <div class="history-title">${escapeHtml(titleText)}</div>
                <div class="history-sub">${escapeHtml(host)} · ${visitTime}</div>
            </div>
            
            <!-- Pin Icon button -->
            <button type="button" class="history-pin-btn ${pinned ? 'is-pinned' : ''}" data-url="${item.url}" aria-label="${pinned ? 'Unpin' : 'Pin'}"
                    data-tooltip="${pinTooltip}" data-tooltip-position="left">
                <svg viewBox="0 0 24 24" fill="${pinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
            </button>

            <!-- Delete Icon button -->
            <button type="button" class="history-delete-btn" data-url="${item.url}" aria-label="Delete entry"
                    data-tooltip="${escapeHtml(deleteTooltip)}" data-tooltip-position="left">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
            </button>
        </a>
    `;
}

function checkAndRenderHistoryPermission(callback) {
    if (typeof chrome !== 'undefined' && chrome.permissions) {
        chrome.permissions.contains({ permissions: ['history'] }, (hasIt) => {
            const panel = document.getElementById('history-panel');
            if (!panel) return;

            // Remove any existing permission card
            panel.querySelector('.history-permission-card')?.remove();

            const tabsContainer = panel.querySelector('.history-tabs-container');
            const filtersEl = document.getElementById('history-filters');
            const listContainer = document.getElementById('history-list-container');
            const insightsContainer = document.getElementById('history-insights-container');

            if (!hasIt) {
                // Hide containers
                if (tabsContainer) tabsContainer.classList.add('hidden');
                if (filtersEl) filtersEl.classList.add('hidden');
                if (listContainer) listContainer.classList.add('hidden');
                if (insightsContainer) insightsContainer.classList.add('hidden');

                // Create and append permission card
                const card = document.createElement('div');
                card.className = 'history-permission-card';
                card.innerHTML = `
                    <h3 class="insights-title">History Logs Disabled</h3>
                    <p class="widget-manage__hint">DinoDash needs your permission to read browsing history to display recent pages, pinned items, and category insights.</p>
                    <button class="btn-primary" id="enable-history-btn">Enable History Logs</button>
                `;
                panel.appendChild(card);

                // Bind listener
                const enableBtn = card.querySelector('#enable-history-btn');
                if (enableBtn) {
                    enableBtn.addEventListener('click', () => {
                        chrome.permissions.request({ permissions: ['history'] }, (granted) => {
                            if (granted) {
                                checkAndRenderHistoryPermission(callback);
                            }
                        });
                    });
                }
            } else {
                // Show containers depending on active tab
                if (tabsContainer) tabsContainer.classList.remove('hidden');
                if (filtersEl) {
                    filtersEl.classList.toggle('hidden', activeTab !== 'history');
                }
                if (activeTab === 'analytics') {
                    if (listContainer) listContainer.classList.add('hidden');
                    if (insightsContainer) insightsContainer.classList.remove('hidden');
                } else {
                    if (listContainer) listContainer.classList.remove('hidden');
                    if (insightsContainer) insightsContainer.classList.add('hidden');
                }

                callback();
            }
        });
    } else {
        callback();
    }
}

export function loadHistory() {
    if (chrome.history?.search) {
        try {
            // Fetch default latest history logs
            chrome.history.search({ text: '', maxResults: 150 }, (results) => {
                if (chrome.runtime.lastError) {
                    console.error("Chrome history API runtime error:", chrome.runtime.lastError.message);
                    cachedHistoryItems = [];
                } else {
                    cachedHistoryItems = results || [];
                }
                filterAndRenderHistory();
            });
        } catch (err) {
            console.error("Failed to query chrome.history.search:", err);
            cachedHistoryItems = [];
            filterAndRenderHistory();
        }
    } else {
        console.warn("chrome.history.search is NOT available in this environment.");
        cachedHistoryItems = [];
        filterAndRenderHistory();
    }
}

export function deleteHistoryItem(url) {
    if (chrome.history?.deleteUrl) {
        try {
            chrome.history.deleteUrl({ url }, () => {
                if (chrome.runtime.lastError) {
                    console.error("Failed to delete URL from chrome.history:", chrome.runtime.lastError.message);
                }
                // In-memory cache filtering: completely avoids database queries on delete
                cachedHistoryItems = cachedHistoryItems.filter(it => it.url !== url);
                filterAndRenderHistory();
                window.dispatchEvent(new CustomEvent('dino-history-deleted'));
            });
        } catch (err) {
            console.error("Error calling chrome.history.deleteUrl:", err);
        }
    } else {
        console.warn("chrome.history.deleteUrl is NOT available in this environment.");
    }
}

export function toggleHistoryPanel() {
    const sidebar = document.getElementById('history-panel');
    const tab = document.getElementById('history-sidebar-tab');
    if (!sidebar || !tab) return;
    if (!WidgetManager.isEnabled('historyTab')) return;

    const isOpening = sidebar.classList.contains('hidden') || !sidebar.classList.contains('is-open');

    if (isOpening) {
        // Close other panels
        document.getElementById('settings-panel')?.classList.add('hidden');
        document.getElementById('theme-panel')?.classList.add('hidden');
        document.getElementById('widget-panel')?.classList.add('hidden');
        document.getElementById('game-stats-panel')?.classList.add('hidden');
        document.getElementById('favourite-links-panel')?.classList.add('hidden');

        document.getElementById('settings-button')?.setAttribute('aria-expanded', 'false');
        document.getElementById('theme-button')?.setAttribute('aria-expanded', 'false');
        document.getElementById('widget-button')?.setAttribute('aria-expanded', 'false');
        document.getElementById('stats-button')?.setAttribute('aria-expanded', 'false');
        document.getElementById('favourite-links-button')?.setAttribute('aria-expanded', 'false');

        // Reset Tab state back to default on open
        activeTab = 'history';
        const tabsContainer = document.querySelector('.history-tabs');
        if (tabsContainer) {
            tabsContainer.setAttribute('data-active', 'history');
        }

        // Reset active classes on UI tab buttons
        document.querySelectorAll('.history-tab-btn').forEach(btn => {
            btn.classList.toggle('is-active', btn.dataset.tab === 'history');
        });

        const listContainer = document.getElementById('history-list-container');
        const insightsContainer = document.getElementById('history-insights-container');
        const filtersEl = document.getElementById('history-filters');

        if (insightsContainer) insightsContainer.classList.add('hidden');
        if (listContainer) listContainer.classList.remove('hidden');
        // History view shows filters; analytics hides them.
        if (filtersEl) filtersEl.classList.remove('hidden');

        sidebar.classList.remove('hidden');
        sidebar.offsetHeight;
        sidebar.classList.add('is-open');
        tab.classList.add('is-open');
        tab.setAttribute('aria-expanded', 'true');

        window.dispatchEvent(new CustomEvent('dino-history-opened'));
        
        loadPinnedHistory().then(() => {
            checkAndRenderHistoryPermission(() => {
                loadHistory();
            });
        });
    } else {
        sidebar.classList.remove('is-open');
        tab.classList.remove('is-open');
        tab.setAttribute('aria-expanded', 'false');
        setTimeout(() => {
            if (!sidebar.classList.contains('is-open')) {
                sidebar.classList.add('hidden');
            }
        }, 400);
    }
}

export function initHistoryUI() {
    const tab = document.getElementById('history-sidebar-tab');

    if (!tab) return;

    tab.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleHistoryPanel();
    });

    tab.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleHistoryPanel();
        }
    });

    // Segmented Tab Button toggles
    const tabsContainer = document.querySelector('.history-tabs');
    const tabButtons = document.querySelectorAll('.history-tab-btn');
    const filtersEl = document.getElementById('history-filters');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            tabButtons.forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            activeTab = btn.dataset.tab;
            if (tabsContainer) {
                tabsContainer.setAttribute('data-active', activeTab);
            }
            // Filter bar is only meaningful in the History list view.
            if (filtersEl) {
                filtersEl.classList.toggle('hidden', activeTab !== 'history');
            }
            filterAndRenderHistory();
        });
    });

    // ── Search input
    const searchInput = document.getElementById('history-search-input');
    const searchClear = document.getElementById('history-search-clear');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            filterAndRenderHistory();
        });
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && searchInput.value) {
                e.preventDefault();
                searchInput.value = '';
                filterAndRenderHistory();
            }
        });
    }
    if (searchClear) {
        searchClear.addEventListener('click', (e) => {
            e.stopPropagation();
            if (searchInput) {
                searchInput.value = '';
                searchInput.focus();
            }
            filterAndRenderHistory();
        });
    }

    // ── Time range pills removed.

    // ── Category tags (multi-select; each tag is removable, plus Add and Clear)
    setupCategoryTags();

    // Prefetch pinned items on startup
    loadPinnedHistory();
}

/**
 * Renders the category filter using the widget-manager tag pattern.
 * - Active tags use × to remove.
 * - Available tags use + to add.
 * - Empty active list shows a hint instead of placeholder.
 */
function setupCategoryTags() {
    const container = document.getElementById('history-category-pills');
    if (!container) return;

    const ALL_KEYS = ['coding', 'research', 'design', 'social', 'entertainment', 'shopping', 'other'];

    const renderTagMarkup = () => {
        const active = [...activeCategories];
        const available = ALL_KEYS.filter(k => !activeCategories.has(k));

        const activeTags = active.map(key => {
            const meta = CATEGORY_META[key] || CATEGORY_META.other;
            return `
                <span class="widget-tag widget-tag--active" data-category="${key}">
                    <span class="widget-tag__icon" aria-hidden="true">${meta.icon}</span>
                    <span class="widget-tag__label">${meta.label}</span>
                    <button type="button" class="widget-tag__action widget-tag__action--remove"
                            data-action="remove" data-category="${key}"
                            aria-label="Remove ${meta.label}"
                            data-tooltip="Remove ${meta.label}" data-tooltip-position="top">×</button>
                </span>`;
        }).join('');

        const inactiveTags = available.map(key => {
            const meta = CATEGORY_META[key] || CATEGORY_META.other;
            return `
                <span class="widget-tag widget-tag--inactive" data-category="${key}">
                    <button type="button" class="widget-tag__action widget-tag__action--add"
                            data-action="add" data-category="${key}"
                            aria-label="Add ${meta.label}"
                            data-tooltip="Filter by ${meta.label}" data-tooltip-position="top">+</button>
                    <span class="widget-tag__icon" aria-hidden="true">${meta.icon}</span>
                    <span class="widget-tag__label">${meta.label}</span>
                </span>`;
        }).join('');

        return `
            ${active.length
                ? `<div class="widget-tag-group">
                       <span class="widget-tag-group__label">Filtering</span>
                       <div class="widget-tag-list">${activeTags}</div>
                   </div>`
                : ''}
            ${available.length
                ? `<div class="widget-tag-group">
                       <span class="widget-tag-group__label">${active.length ? 'Available' : 'Filter by category'}</span>
                       <div class="widget-tag-list">${inactiveTags}</div>
                   </div>`
                : ''}
            ${!active.length
                ? '<p class="widget-manage__empty">No filters · showing every category.</p>'
                : ''}
        `;
    };

    const render = () => {
        container.innerHTML = renderTagMarkup();
    };

    // Single delegated handler for add/remove — survives every re-render.
    if (!container.dataset.bound) {
        container.dataset.bound = '1';
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            e.stopPropagation();
            const key = btn.dataset.category;
            if (btn.dataset.action === 'add') {
                activeCategories.add(key);
            } else if (btn.dataset.action === 'remove') {
                activeCategories.delete(key);
            }
            render();
            filterAndRenderHistory();
        });
    }

    render();
}
