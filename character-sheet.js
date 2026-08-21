/* D&D Companion — Character Sheet bootstrap */
(() => {
    'use strict';

    const scripts = [
        'character-engine.js',
        'character-engine-rules.js',
        'character-engine-options-v2.js',
        'character-engine-features.js',
        'character-engine-paladin-2014.js',
        'character-engine-class-sync-v3.js',
        'character-engine-weapon-rules.js',
        'character-engine-live-bridge.js',
        'character-sheet-v3.js',
        'character-sheet-v4-adapter.js'
    ];

    let renderer = null;
    let failed = false;
    let resolveReady;
    const ready = new Promise(resolve => { resolveReady = resolve; });

    // Keep a stable public entry point while the rule engine loads asynchronously.
    window.showCharacterSheet = function (...args) {
        ready.then(() => {
            if (typeof renderer === 'function') return renderer(...args);
            console.error('Character Sheet renderer was not loaded.');
        });
    };

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const existing = document.querySelector(`script[data-character-engine-src="${src}"]`);
            if (existing) {
                if (existing.dataset.loaded === 'true') resolve();
                else existing.addEventListener('load', resolve, { once: true });
                return;
            }

            const script = document.createElement('script');
            script.src = `${src}?v=20260821-sheetfix`;
            script.dataset.characterEngineSrc = src;
            script.addEventListener('load', () => {
                script.dataset.loaded = 'true';
                resolve();
            }, { once: true });
            script.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
            document.body.appendChild(script);
        });
    }

    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = 'character-sheet.css?v=20260821-sheetfix';
    document.head.appendChild(style);

    (async () => {
        try {
            for (const script of scripts) {
                await loadScript(script);
                // v3 is the actual renderer. Capture it before the adapter wraps it.
                if (script === 'character-sheet-v3.js' && typeof window.showCharacterSheet === 'function') {
                    renderer = window.showCharacterSheet;
                }
            }

            if (!renderer && typeof window.showCharacterSheet === 'function') {
                renderer = window.showCharacterSheet;
            }

            if (typeof renderer !== 'function') {
                failed = true;
                console.error('Character Sheet renderer was not found.');
            }
        } catch (error) {
            failed = true;
            console.error('Character Sheet bootstrap failed.', error);
        } finally {
            resolveReady();
        }
    })();

    // Delegated navigation is deliberately independent from the renderer's own binding.
    document.addEventListener('click', event => {
        const target = event.target.closest?.('.character-summary, .character-summary h1, .character-header');
        if (!target || !document.getElementById('app')?.querySelector('.character-summary')) return;
        if (event.target.closest('button, input, select, a')) return;
        event.preventDefault();
        window.showCharacterSheet();
    });
})();
