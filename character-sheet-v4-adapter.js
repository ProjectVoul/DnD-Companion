/* D&D Companion — Character Sheet presentation adapter */
(() => {
    'use strict';

    const original = window.showCharacterSheet;
    if (typeof original !== 'function') return;

    function updatePreparedSpellSummary() {
        const section = document.querySelector('.prepared-spells');
        if (!section) return;

        let prepared = [];
        try {
            const value = JSON.parse(localStorage.getItem('preparedSpells') || '[]');
            prepared = Array.isArray(value) ? value : [];
        } catch (_) {}

        const character = window.DnDCharacterEngine?.getLiveCharacter?.();
        const level = Number(character?.identity?.level) || 1;
        const charisma = window.DnDCharacterEngine?.calculator?.getAbilityModifier?.(character, 'charisma') || 0;
        const limit = character?.identity?.class === 'Paladin'
            ? Math.max(1, charisma + Math.floor(level / 2))
            : null;

        section.innerHTML = `
            <div class="sheet-subheading">
                <strong>Prepared Spells</strong>
                <small>${limit ? `${prepared.length} / ${limit} prepared` : `${prepared.length} prepared`}</small>
            </div>
            <div class="sheet-detail">
                <span>Spell list</span>
                <button class="sheet-link-button" type="button" onclick="openSection('spells')">Open Spells →</button>
            </div>
        `;
    }

    function show() {
        original();
        requestAnimationFrame(updatePreparedSpellSummary);
    }

    window.showCharacterSheet = show;

    const heading = document.querySelector('.character-summary h1');
    if (heading) {
        heading.onclick = show;
        heading.onkeydown = event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                show();
            }
        };
    }
})();
