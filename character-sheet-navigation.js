/* D&D Companion — Character Sheet navigation */
(() => {
    'use strict';

    let opening = false;

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
        opening = false;
    }

    function markOpening() {
        const entry = document.getElementById('character-entry');
        if (!entry) return;
        entry.classList.add('character-sheet-loading');
        entry.setAttribute('aria-busy', 'true');
        delete entry.dataset.sheetError;
    }

    function invokeSheet(attempt = 0) {
        if (!isHome()) {
            opening = false;
            return false;
        }

        const entryPoint =
            typeof window.openCharacterSheet === 'function'
                ? window.openCharacterSheet
                : typeof window.showCharacterSheet === 'function'
                    ? window.showCharacterSheet
                    : null;

        if (!entryPoint) {
            if (attempt < 40) {
                setTimeout(() => invokeSheet(attempt + 1), 100);
                return true;
            }
            showEntryError(new Error('Character Sheet entry point did not become available.'));
            return false;
        }

        try {
            Promise.resolve(entryPoint())
                .then(result => {
                    // The bootstrap can legitimately return false while its
                    // renderer is still settling. Retry instead of requiring
                    // the player to tap the character repeatedly.
                    if (result === false && attempt < 40 && isHome()) {
                        setTimeout(() => invokeSheet(attempt + 1), 100);
                        return;
                    }
                    if (result === false && isHome()) {
                        showEntryError(new Error('Character Sheet renderer unavailable.'));
                        return;
                    }
                    opening = false;
                })
                .catch(showEntryError);
            return true;
        } catch (error) {
            showEntryError(error);
            return false;
        }
    }

    function openSheet() {
        if (!isHome()) return false;
        if (opening) return true;

        opening = true;
        markOpening();
        return invokeSheet();
    }

    // Event delegation is intentional: the Home view can be recreated by
    // navigation code, so binding directly to one header node is fragile.
    // This listener survives DOM replacement and works for every fresh Home.
    document.addEventListener('click', event => {
        const target = event.target;
        if (!(target instanceof Element)) return;

        const entry = target.closest('#character-entry');
        if (!entry) return;
        if (target.closest('button, input, select, a')) return;

        event.preventDefault();
        openSheet();
    }, true);

    document.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;

        const target = event.target;
        if (!(target instanceof Element)) return;
        const entry = target.closest('#character-entry');
        if (!entry) return;

        event.preventDefault();
        openSheet();
    }, true);

    // Keep the public helper for any other section that wants to expose the
    // Character Sheet shortcut. It does not depend on a particular DOM node.
    window.addCharacterSheetShortcut = openSheet;
})();
