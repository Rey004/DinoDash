const STORAGE_KEY = 'favouriteLinks';

const DEFAULT_DATA = {
    folders: [],
};

let data = structuredClone(DEFAULT_DATA);
let els = {};
let dragLink = null;

function storageGet() {
    return new Promise((resolve) => {
        if (!chrome.storage?.local) {
            resolve(null);
            return;
        }
        chrome.storage.local.get([STORAGE_KEY], (result) => resolve(result[STORAGE_KEY] || null));
    });
}

function save() {
    if (!chrome.storage?.local) return;
    chrome.storage.local.set({ [STORAGE_KEY]: data });
}

function normalizeData(saved) {
    if (!saved || !Array.isArray(saved.folders)) return structuredClone(DEFAULT_DATA);

    // Clear old default folders if they exist to start clean
    const foldersFiltered = saved.folders.filter(folder => {
        const id = String(folder.id || '').toLowerCase();
        return id !== 'socials' && id !== 'coding' && id !== 'tools';
    });

    const sourceFolders = (foldersFiltered.length === 0 && saved.folders.length > 0) ? [] : foldersFiltered;

    const folders = sourceFolders
        .map((folder, index) => ({
            id: sanitizeId(folder.id) || makeId(`folder-${index}`),
            name: sanitizeText(folder.name, 28) || 'Folder',
            open: folder.open !== false,
            links: Array.isArray(folder.links) ? folder.links.map(normalizeLink).filter(Boolean) : [],
        }))
        .filter((folder) => folder.name);
    return { folders };
}

function normalizeLink(link) {
    const url = normalizeUrl(link?.url || '');
    if (!url) return null;
    return {
        id: sanitizeId(link.id) || makeId('link'),
        title: sanitizeText(link.title, 40) || getHost(url),
        url,
    };
}

function sanitizeText(value, maxLength) {
    return String(value || '').trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function sanitizeId(value) {
    return String(value || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 48);
}

function makeId(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function normalizeUrl(rawUrl) {
    const trimmed = String(rawUrl || '').trim();
    if (!trimmed) return '';
    const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    try {
        const url = new URL(candidate);
        if (!['http:', 'https:'].includes(url.protocol)) return '';
        return url.href;
    } catch {
        return '';
    }
}

function getHost(url) {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return url;
    }
}

function nativeFavicon(url) {
    try {
        const { origin } = new URL(url);
        return `${origin}/favicon.ico`;
    } catch {
        return '';
    }
}

function googleFavicon(url) {
    return `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(url)}&sz=64`;
}

function findFolder(folderId) {
    return data.folders.find((folder) => folder.id === folderId);
}

function findLink(linkId) {
    for (const folder of data.folders) {
        const index = folder.links.findIndex((link) => link.id === linkId);
        if (index >= 0) return { folder, index, link: folder.links[index] };
    }
    return null;
}

function renderFolderOptions() {
    els.folderSelect.innerHTML = '';
    for (const folder of data.folders) {
        const option = document.createElement('option');
        option.value = folder.id;
        option.textContent = folder.name;
        els.folderSelect.append(option);
    }
    const hasFolders = data.folders.length > 0;
    els.folderSelect.disabled = !hasFolders;
    els.linkTitle.disabled = !hasFolders;
    els.linkUrl.disabled = !hasFolders;
}

function render() {
    renderFolderOptions();
    els.folders.innerHTML = '';

    if (!data.folders.length) {
        const empty = document.createElement('p');
        empty.className = 'favourite-links__empty';
        empty.textContent = 'Create a folder to start collecting your favourite sites.';
        els.folders.append(empty);
        return;
    }

    for (const folder of data.folders) {
        els.folders.append(renderFolder(folder));
    }
}

function renderFolder(folder) {
    const item = document.createElement('div');
    item.className = `favourite-tree-item${folder.open ? ' is-open' : ''}`;
    item.dataset.folderId = folder.id;

    // ── Row ──────────────────────────────────────────────────────────────────
    const row = document.createElement('div');
    row.className = 'favourite-tree-row';
    row.setAttribute('role', 'button');
    row.setAttribute('aria-expanded', String(folder.open));
    row.addEventListener('click', () => {
        folder.open = !folder.open;
        save();
        render();
    });

    const chevron = document.createElement('span');
    chevron.className = 'favourite-tree-chevron';
    chevron.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 4 10 8 6 12"/></svg>`;

    const folderIcon = document.createElement('span');
    folderIcon.className = 'favourite-tree-icon favourite-tree-icon--folder';
    folderIcon.innerHTML = folderSvg();

    const nameEl = document.createElement('span');
    nameEl.className = 'favourite-tree-name';
    nameEl.textContent = folder.name;

    const countEl = document.createElement('span');
    countEl.className = 'favourite-tree-count';
    countEl.textContent = String(folder.links.length);

    const actions = document.createElement('span');
    actions.className = 'favourite-tree-actions';

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'favourite-tree-action-btn';
    deleteBtn.setAttribute('aria-label', `Delete ${folder.name}`);
    deleteBtn.dataset.tooltip = `Delete ${folder.name}`;
    deleteBtn.innerHTML = removeIcon();
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showConfirm(`Delete folder "<strong>${folder.name}</strong>" and all its links?`, () => {
            data.folders = data.folders.filter((f) => f.id !== folder.id);
            save();
            render();
        });
    });
    actions.append(deleteBtn);

    row.append(chevron, folderIcon, nameEl, countEl, actions);

    // ── Children ─────────────────────────────────────────────────────────────
    const children = document.createElement('div');
    children.className = 'favourite-tree-children';

    // Drag-and-drop: accept drops on the whole item (open or closed)
    item.addEventListener('dragover', (e) => {
        e.preventDefault();
        item.classList.add('is-drop-target');
    });
    item.addEventListener('dragleave', (e) => {
        if (!item.contains(e.relatedTarget)) item.classList.remove('is-drop-target');
    });
    item.addEventListener('drop', (e) => {
        e.preventDefault();
        item.classList.remove('is-drop-target');
        moveDraggedLink(folder.id);
    });

    if (folder.links.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'favourite-links__empty';
        empty.textContent = 'No links yet — add one above.';
        children.append(empty);
    } else {
        for (const link of folder.links) {
            children.append(renderLink(link));
        }
    }

    item.append(row, children);
    return item;
}

function renderLink(link) {
    const row = document.createElement('a');
    row.className = 'favourite-tree-link-row';
    row.href = link.url;
    row.draggable = true;
    row.dataset.linkId = link.id;
    row.dataset.tooltip = link.title || getHost(link.url);
    row.setAttribute('aria-label', `Open ${link.title || getHost(link.url)}`);

    const favicon = document.createElement('img');
    favicon.className = 'favourite-link-favicon';
    favicon.src = nativeFavicon(link.url);
    favicon.alt = '';
    favicon.loading = 'lazy';
    favicon.decoding = 'async';
    favicon.addEventListener('error', () => {
        if (favicon.dataset.fallback === 'google') return;
        favicon.dataset.fallback = 'google';
        favicon.src = googleFavicon(link.url);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'favourite-tree-action-btn';
    deleteBtn.setAttribute('aria-label', `Remove ${link.title || getHost(link.url)}`);
    deleteBtn.innerHTML = removeIcon();
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        showConfirm(`Remove "<strong>${link.title || getHost(link.url)}</strong>"?`, () => {
            const found = findLink(link.id);
            if (!found) return;
            found.folder.links.splice(found.index, 1);
            save();
            render();
        });
    });

    row.append(favicon, deleteBtn);

    row.addEventListener('dragstart', (e) => {
        dragLink = link.id;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', link.id);
    });
    row.addEventListener('dragend', () => {
        dragLink = null;
        document.querySelectorAll('.favourite-tree-item.is-drop-target').forEach((el) => {
            el.classList.remove('is-drop-target');
        });
    });

    return row;
}

function moveDraggedLink(targetFolderId) {
    const linkId = dragLink;
    if (!linkId) return;
    const found = findLink(linkId);
    const targetFolder = findFolder(targetFolderId);
    if (!found || !targetFolder || found.folder.id === targetFolder.id) return;
    found.folder.links.splice(found.index, 1);
    targetFolder.links.push(found.link);
    targetFolder.open = true;
    save();
    render();
}

function removeIcon() {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
}

function folderSvg() {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M.5 3A1.5 1.5 0 0 1 2 1.5h3.164a1.5 1.5 0 0 1 1.055.434l.91.91A1.5 1.5 0 0 0 8.173 3.5H14A1.5 1.5 0 0 1 15.5 5v7A1.5 1.5 0 0 1 14 13.5H2A1.5 1.5 0 0 1 .5 12V3z"/></svg>`;
}

function showConfirm(htmlMessage, onConfirm) {
    // Remove any existing confirmation
    els.panel.querySelector('.favourite-confirm-overlay')?.remove();

    const overlay = document.createElement('div');
    overlay.className = 'favourite-confirm-overlay';
    overlay.innerHTML = `
        <div class="favourite-confirm">
            <p class="favourite-confirm__message">${htmlMessage}</p>
            <div class="favourite-confirm__actions">
                <button type="button" class="favourite-confirm__btn favourite-confirm__cancel">Cancel</button>
                <button type="button" class="favourite-confirm__btn favourite-confirm__delete">Delete</button>
            </div>
        </div>
    `;
    overlay.querySelector('.favourite-confirm__cancel').addEventListener('click', () => overlay.remove());
    overlay.querySelector('.favourite-confirm__delete').addEventListener('click', () => {
        overlay.remove();
        onConfirm();
    });
    // Click on backdrop to cancel
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    els.panel.append(overlay);
}

export async function initFavouriteLinksUI() {
    els = {
        panel: document.getElementById('favourite-links-panel'),
        button: document.getElementById('favourite-links-button'),
        close: document.getElementById('favourite-links-close'),
        folders: document.getElementById('favourite-links-folders'),
        folderForm: document.getElementById('favourite-folder-form'),
        folderName: document.getElementById('favourite-folder-name'),
        linkForm: document.getElementById('favourite-link-form'),
        linkTitle: document.getElementById('favourite-link-title'),
        linkUrl: document.getElementById('favourite-link-url'),
        folderSelect: document.getElementById('favourite-link-folder'),
    };

    if (!els.panel || !els.button || !els.folders) return;

    const saved = await storageGet();
    data = normalizeData(saved);

    // Save cleaned/migrated data to storage immediately if it has changed
    if (saved && Array.isArray(saved.folders) && saved.folders.length !== data.folders.length) {
        save();
    }

    render();

    els.folderForm?.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = sanitizeText(els.folderName.value, 28);
        if (!name) return;
        data.folders.push({ id: makeId('folder'), name, open: true, links: [] });
        els.folderName.value = '';
        save();
        render();
    });

    els.linkForm?.addEventListener('submit', (event) => {
        event.preventDefault();
        const url = normalizeUrl(els.linkUrl.value);
        if (!url) return;
        const folder = findFolder(els.folderSelect.value) || data.folders[0];
        if (!folder) return;
        folder.links.push({
            id: makeId('link'),
            title: sanitizeText(els.linkTitle.value, 40) || getHost(url),
            url,
        });
        folder.open = true;
        els.linkTitle.value = '';
        els.linkUrl.value = '';
        save();
        render();
    });

    els.close?.addEventListener('click', () => {
        els.panel.classList.add('hidden');
        els.button.setAttribute('aria-expanded', 'false');
    });

    chrome.storage?.onChanged.addListener((changes, namespace) => {
        if (namespace !== 'local' || !changes[STORAGE_KEY]) return;
        data = normalizeData(changes[STORAGE_KEY].newValue);
        render();
    });
}
