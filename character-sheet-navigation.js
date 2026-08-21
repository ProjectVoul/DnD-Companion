/* D&D Companion — Character Sheet navigation */
(() => {
    'use strict';

    function isHome() {
        return Boolean(document.getElementById('character-entry'));
    }

    function showEntryError(error) {
        console.error('Character Sheet navigation failed:', error);
        const entry = document.getElementById('character-entry');
        if (!entry) return;
        entry.setAttribute('aria-busy', 'false');
        entry.classList.remove('character-sheet-loading');
        entry.dataset.sheetError = 'true';
        entry.title = 'Character Sheet unavailable — check console';
    }

    function openSheet() {
        if (!isHome()) return false;

        const entry = document.getElementById('character-entry');
        if (entry) {
            entry.classList.add('character-sheet-loading');
            entry.setAttribute('aria-busy', 'true');
        }

        // Prefer the public entry point exposed by character-sheet.js.
        // It owns the dependency bootstrap and returns a Promise while the
        // rules/renderer are loading.
        if (typeof window.openCharacterSheet === 'function') {
            try {
                Promise.resolve(window.openCharacterSheet()).catch(showEntryError);
                return true;
            } catch (error) {
                showEntryError(error);
                return false;
            }
        }

        // Fallback for a fully loaded sheet where the public bootstrap is
        // unavailable but the renderer itself is present.
        if (typeof window.showCharacterSheet === 'function') {
            try {
                Promise.resolve(window.showCharacterSheet()).catch(showEntryError);
                return true;
            } catch (error) {
                showEntryError(error);
                return false;
            }
        }

        showEntryError(new Error('Character Sheet entry point is not loaded.'));
        return false;
    }

    function bindCharacterEntry() {
        const entry = document.getElementById('character-entry');
        if (!entry || entry.dataset.sheetBound === 'true') return;
        entry.dataset.sheetBound = 'true';
        entry.addEventListener('click', event => {
            if (event.target.closest('button, input, select, a')) return;
            openSheet();
        });
        entry.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openSheet();
            }
        });
    }

    function bind() {
        bindCharacterEntry();
    }

    bind();
    [50, 150, 300, 600, 1000].forEach(delay => setTimeout(bind, delay));
    window.addCharacterSheetShortcut = bind;
})();
