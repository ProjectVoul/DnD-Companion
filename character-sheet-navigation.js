/* D&D Companion — Character Sheet navigation */
(() => {
    'use strict';

    function isHome() {
        return Boolean(document.getElementById('app')?.querySelector('.character-summary'));
    }

    function openSheet() {
        if (typeof window.showCharacterSheet === 'function') {
            window.showCharacterSheet();
            return true;
        }
        return false;
    }

    function bindCharacterName() {
        const title = document.querySelector('.character-summary h1');
        if (!title) return;

        title.classList.add('character-sheet-link');
        title.tabIndex = 0;
        title.setAttribute('role', 'button');
        title.setAttribute('aria-label', 'Open Character Sheet');
        title.title = 'Open Character Sheet';

        title.onclick = event => {
            event.preventDefault();
            event.stopPropagation();
            openSheet();
        };

        title.onkeydown = event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openSheet();
            }
        };
    }

    function bindCharacterHeader() {
        const header = document.querySelector('.character-header');
        if (!header || header.dataset.sheetBound === 'true') return;

        header.dataset.sheetBound = 'true';
        header.addEventListener('click', event => {
            if (event.target.closest('button, input, select, a')) return;
            if (isHome()) openSheet();
        });
    }

    function addShortcut() {
        const app = document.getElementById('app');
        if (!app || isHome()) return;
        const main = app.querySelector('main');
        if (!main || document.querySelector('.global-character-sheet-shortcut')) return;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'global-character-sheet-shortcut';
        button.textContent = '↗ Character Sheet';
        button.addEventListener('click', openSheet);
        main.insertBefore(button, main.firstChild);
    }

    function bind() {
        bindCharacterName();
        bindCharacterHeader();
        addShortcut();
    }

    document.addEventListener('click', event => {
        const title = event.target.closest?.('.character-summary h1');
        if (!title || !isHome()) return;
        event.preventDefault();
        event.stopPropagation();
        openSheet();
    }, true);

    document.addEventListener('keydown', event => {
        const title = event.target.closest?.('.character-summary h1');
        if (!title || !isHome()) return;
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openSheet();
        }
    }, true);

    // The engine is loaded asynchronously by character-sheet.js, so bind now and again after it finishes.
    bind();
    [50, 150, 300, 600, 1000].forEach(delay => setTimeout(bind, delay));

    window.addCharacterSheetShortcut = bind;
})();
