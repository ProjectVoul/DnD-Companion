/* D&D Companion — Character Sheet navigation */
(() => {
    'use strict';

    function openSheet() {
        if (!document.getElementById('character-entry')) return false;
        const renderer = window.showCharacterSheet;
        if (typeof renderer !== 'function') {
            console.error('Character Sheet renderer is not available.');
            return false;
        }
        try {
            renderer();
            return true;
        } catch (error) {
            console.error('Character Sheet render failed:', error);
            return false;
        }
    }

    // The Character Engine and renderer are loaded synchronously by index.html.
    // There is therefore no async bootstrap, retry loop, or competing entry point.
    document.addEventListener('click', event => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const entry = target.closest('#character-entry');
        if (!entry || target.closest('button, input, select, a')) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        openSheet();
    }, true);

    document.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        const target = event.target;
        if (!(target instanceof Element)) return;
        const entry = target.closest('#character-entry');
        if (!entry) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        openSheet();
    }, true);

    window.addCharacterSheetShortcut = openSheet;
})();
