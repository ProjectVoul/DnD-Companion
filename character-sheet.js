/* D&D Companion — Character Sheet bootstrap */
(() => {
    'use strict';

    // The engine stays modular: this file only bootstraps the dependencies and
    // exposes one stable Home → Character Sheet entry point.
    const scripts = [
        'character-engine.js',
        'character-sheet-v3.js',
        'character-engine-rules.js',
        'character-engine-options-v2.js',
        'character-engine-features.js',
        'character-engine-paladin-2014.js',
        'character-engine-class-sync-v3.js',
        'character-engine-weapon-rules.js',
        'character-engine-live-bridge.js'
    ];

    let renderer = null;
    let resolveReady;
    const ready = new Promise(resolve => { resolveReady = resolve; });

    function loadScript(src) {
        return new Promise(resolve => {
            const existing = document.querySelector(`script[data-character-engine-src="${src}"]`);
            if (existing) {
                if (existing.dataset.loaded === 'true') {
                    resolve(true);
                } else {
                    existing.addEventListener('load', () => resolve(true), { once: true });
                    existing.addEventListener('error', () => resolve(false), { once: true });
                }
                return;
            }

            const script = document.createElement('script');
            script.src = `${src}?v=20260821-sheetentry6`;
            script.dataset.characterEngineSrc = src;
            script.addEventListener('load', () => {
                script.dataset.loaded = 'true';
                resolve(true);
            }, { once: true });
            script.addEventListener('error', () => {
                console.error(`Character Sheet dependency failed: ${src}`);
                resolve(false);
            }, { once: true });
            document.body.appendChild(script);
        });
    }

    // Stable public entry point. The renderer itself is still supplied by the
    // Character Sheet module; no presentation adapter replaces it afterwards.
    window.openCharacterSheet = function (...args) {
        return ready.then(() => {
            if (typeof renderer === 'function') return renderer(...args);
            console.error('Character Sheet renderer unavailable.');
            return false;
        });
    };

    // Kept as a compatibility alias for any existing code that calls it.
    window.showCharacterSheet = window.openCharacterSheet;

    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = 'character-sheet.css?v=20260821-sheetentry6';
    document.head.appendChild(style);

    (async () => {
        for (const script of scripts) {
            const loaded = await loadScript(script);
            if (!loaded) continue;

            // character-sheet-v3 owns the actual renderer. Later engine modules
            // enrich the same engine; they do not replace the renderer.
            if (script === 'character-sheet-v3.js' && typeof window.showCharacterSheet === 'function' && window.showCharacterSheet !== window.openCharacterSheet) {
                renderer = window.showCharacterSheet;
            }
        }

        if (!renderer && typeof window.showCharacterSheet === 'function' && window.showCharacterSheet !== window.openCharacterSheet) {
            renderer = window.showCharacterSheet;
        }

        if (typeof renderer !== 'function') {
            console.error('Character Sheet renderer was not found after dependency load.');
        }

        resolveReady();
    })();
})();
