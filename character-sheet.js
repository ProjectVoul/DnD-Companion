/* D&D Companion — Character Sheet bootstrap
 * Loads the rules/data/derived-value layer before the interactive Character Sheet.
 * The public entry point remains window.showCharacterSheet.
 */
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

    let readyResolve;
    let readyReject;
    const ready = new Promise((resolve, reject) => {
        readyResolve = resolve;
        readyReject = reject;
    });

    window.showCharacterSheet = function () {
        ready.then(() => window.showCharacterSheet?.()).catch(error => {
            console.error('Character Sheet bootstrap failed.', error);
        });
    };

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[data-character-engine-src="${src}"]`)) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.dataset.characterEngineSrc = src;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Failed to load ${src}`));
            document.body.appendChild(script);
        });
    }

    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = 'character-sheet.css';
    document.head.appendChild(style);

    (async () => {
        try {
            for (const script of scripts) await loadScript(script);
            readyResolve();
        } catch (error) {
            readyReject(error);
            console.error('Character Sheet bootstrap failed.', error);
        }
    })();
})();
