/* D&D Companion — Character Sheet navigation */
(() => {
    'use strict';

    function fallbackSheet() {
        const app = document.getElementById('app');
        const engine = window.DnDCharacterEngine;
        if (!app || !engine) return false;
        try {
            const c = engine.getLiveCharacter ? engine.getLiveCharacter() : engine.loadCharacter();
            const d = engine.getLiveDerivedData ? engine.getLiveDerivedData() : engine.calculator.getDerivedData(c);
            const esc = v => String(v ?? '').replace(/[&<>\'\"]/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[x]));
            const s = n => (Number(n) >= 0 ? '+' : '') + (Number(n) || 0);
            const a = {strength:'STR',dexterity:'DEX',constitution:'CON',intelligence:'INT',wisdom:'WIS',charisma:'CHA'};
            const abilities = Object.entries(a).map(([k,l]) => `<div class="sheet-detail"><span>${l}</span><strong>${c.abilityScores?.[k] ?? 10} (${s(d.abilityModifiers?.[k])})</strong></div>`).join('');
            const skills = Object.entries(engine.skills || {}).map(([k,ability]) => `<div class="skill-row"><span>${esc(k)} <small>${a[ability] || ''}</small></span><strong>${s(d.skills?.[k])}</strong></div>`).join('');
            app.innerHTML = `<header class="character-sheet-header"><button class="back-button" type="button" onclick="showCharacterHome()">← Character</button><div><h1>Character Sheet</h1><p>5e 2014 · live character data</p></div></header><main class="character-sheet"><section class="sheet-card"><h2>${esc(c.identity?.name || 'Your Character')}</h2><p>${esc(c.identity?.race || '—')} · ${esc(c.identity?.class || '—')} · Level ${Number(c.identity?.level) || 1}</p><p>${esc(c.identity?.alignment || '—')}</p></section><section class="sheet-card"><h2>Hit Points</h2><div class="sheet-detail"><span>HP</span><strong>${c.resources?.hp?.current ?? 0} / ${c.resources?.hp?.maximum ?? 0}</strong></div><div class="sheet-detail"><span>Hit Dice</span><strong>${c.resources?.hitDice?.current ?? 0} / ${c.resources?.hitDice?.maximum ?? 0} ${esc(c.resources?.hitDice?.die || '')}</strong></div></section><section class="sheet-card"><h2>Ability Scores</h2>${abilities}</section><section class="sheet-card"><h2>Skills</h2>${skills}</section><section class="sheet-card"><h2>Combat</h2><div class="sheet-detail"><span>Armor Class</span><strong>${d.armorClass ?? '—'}</strong></div><div class="sheet-detail"><span>Speed</span><strong>${d.speed ?? '—'} ft.</strong></div><div class="sheet-detail"><span>Initiative</span><strong>${s(d.initiative)}</strong></div><div class="sheet-detail"><span>Proficiency</span><strong>${s(d.proficiencyBonus)}</strong></div></section></main>`;
            return true;
        } catch (error) {
            console.error('Fallback Character Sheet failed:', error);
            return false;
        }
    }

    function openSheet() {
        const entry = document.getElementById('character-entry');
        if (!entry) return false;
        const renderer = window.showCharacterSheet;
        if (typeof renderer === 'function') {
            try {
                renderer();
                if (document.querySelector('.character-sheet')) return true;
            } catch (error) {
                console.error('Character Sheet render failed:', error);
            }
        } else {
            console.error('Character Sheet renderer is not available.');
        }
        return fallbackSheet();
    }

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
