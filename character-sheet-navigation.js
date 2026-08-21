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
        if (!title || title.dataset.sheetBound === 'true') return;

        title.dataset.sheetBound = 'true';
        title.classList.add('character-sheet-link');
        title.tabIndex = 0;
        title.setAttribute('role', 'button');
        title.setAttribute('aria-label', 'Open Character Sheet');
        title.title = 'Open Character Sheet';

        title.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();
            openSheet();
        });

        title.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                event.stopPropagation();
                openSheet();
            }
        });
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

    function bind() {
        bindCharacterName();
        bindCharacterHeader();
    }

    // The character engine loads asynchronously. Binding is idempotent and
    // deliberately uses local element listeners only: no document-level
    // capture listener, so a single user click produces a single open call.
    bind();
    [50, 150, 300, 600, 1000].forEach(delay => setTimeout(bind, delay));

    window.addCharacterSheetShortcut = bind;
})();
