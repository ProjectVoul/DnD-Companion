/*
 * D&D Companion — 5e 2014 rules corrections
 *
 * Small compatibility layer used while the Character Engine is being built.
 * These rules will be folded into the core calculator once the model stabilizes.
 */

(() => {
    'use strict';

    const engine = window.DnDCharacterEngine;
    if (!engine || !engine.calculator) return;

    engine.calculator.getWeaponAbility = function getWeaponAbility(character, item) {
        const mechanics = item?.mechanics || {};
        const properties = mechanics.properties || [];
        const configured = mechanics.attack?.ability;
        const attackType = mechanics.attack?.type || 'melee';

        // 5e 2014: finesse gives the player a choice between STR and DEX;
        // it does not automatically select the higher modifier.
        if (properties.includes('finesse')) {
            if (configured === 'strength' || configured === 'dexterity') return configured;
            return 'strength';
        }

        if (configured) return configured;
        return attackType === 'ranged' ? 'dexterity' : 'strength';
    };
})();
