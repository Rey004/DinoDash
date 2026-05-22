/**
 * Central registry for new-tab widgets.
 * Add an entry here to expose a widget in settings/popup and wire show/hide.
 */
export const WIDGET_REGISTRY = [
    {
        id: 'dailyQuests',
        label: "Today's Run",
        description: 'Daily checkpoint quests in the top-right corner',
        defaultEnabled: true,
        elementIds: ['daily-quests-widget'],
        hideDuringPlay: true,
    },
    {
        id: 'gameStats',
        label: 'Statistics',
        description: 'Game stats shortcut and panel on the new tab',
        defaultEnabled: true,
        elementIds: ['statistics-widget'],
        hideDuringPlay: true,
    },
    {
        id: 'enhancedModeToggle',
        label: 'Enhanced Mode',
        description: 'Shortcut for turning the enhanced new-tab experience on or off',
        defaultEnabled: true,
        elementIds: ['enhancement-toggle-widget'],
        hideDuringPlay: true,
    },
    {
        id: 'favouriteLinks',
        label: 'Favourite Links',
        description: 'Foldered bookmark hub with favicons and drag-and-drop organization',
        defaultEnabled: true,
        elementIds: ['favourite-links-widget'],
        closeElementIds: ['favourite-links-panel'],
        hideDuringPlay: true,
    },
];

export function getWidgetDef(id) {
    return WIDGET_REGISTRY.find((w) => w.id === id);
}

export function getDefaultWidgetPrefs() {
    return Object.fromEntries(WIDGET_REGISTRY.map((w) => [w.id, w.defaultEnabled]));
}
