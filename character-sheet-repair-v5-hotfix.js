/* D&D Companion — seeded equipment recovery hotfix */
(() => {
    'use strict';
    const engine = window.DnDCharacterEngine;
    if (!engine || typeof inventoryItems === 'undefined') return;

    const save = () => typeof saveInventory === 'function' && saveInventory();
    let changed = false;

    inventoryItems.forEach(item => {
        const id = String(item?.id || '');
        const name = String(item?.name || '').trim().toLowerCase();
        if (id === 'plate-armor' || name === 'plate armor') {
            item.mechanics = engine.createArmorMechanics({ ...(item.mechanics || {}), category: 'heavy', armorClass: Number(item.mechanics?.armorClass) || 18, strengthRequirement: Number(item.mechanics?.strengthRequirement) || 15, stealthDisadvantage: item.mechanics?.stealthDisadvantage !== false });
            const hasMagicAC = (item.modifiers || []).some(m => m.target === 'armorClass');
            if (!hasMagicAC && (!Array.isArray(item.properties) || item.properties.length === 0)) {
                item.properties = ['Heavy Armor', '+7 AC'];
                item.modifiers = [...(item.modifiers || []), { id: `repair-v5-armor-ac-${item.id || name}`, target: 'armorClass', mode: 'add', value: 7, sourceName: item.name }];
                changed = true;
            }
        }
        if (id === 'bahamut-shield' || name === 'shield of bahamut') {
            const bonus = Number(item.mechanics?.armorBonus) || numberFromProperty(item) || 4;
            item.mechanics = engine.createShieldMechanics({ ...(item.mechanics || {}), armorBonus: bonus });
            if ((!Array.isArray(item.properties) || item.properties.length === 0) && bonus === 4) {
                item.properties = ['+4 AC'];
                changed = true;
            }
        }
        if (id === 'golden-choice-sword' || name === 'sword of the golden choice') {
            const hasDamage = Array.isArray(item.mechanics?.damage) && item.mechanics.damage.length;
            if (!hasDamage) {
                item.mechanics = engine.createWeaponMechanics({ ...(item.mechanics || {}), type: 'weapon', attack: { ...(item.mechanics?.attack || {}), type: 'melee', ability: 'strength', proficient: true, bonus: 0 }, damage: [{ dice: { count: 1, die: 'd8' }, type: 'slashing', ability: 'strength', modifier: 0 }], properties: item.mechanics?.properties || ['versatile'] });
                item.proficiency = { ...(item.proficiency || {}), type: 'martial' };
                item.mechanics.proficiency = { type: 'martial' };
                changed = true;
            }
        }
    });

    if (changed) save();
    if (typeof window.updateDragonBreathUses === 'function') window.updateDragonBreathUses();

    function numberFromProperty(item) {
        for (const property of item?.properties || []) {
            const match = String(property).match(/^\s*\+\s*(\d+)\s*AC\s*$/i);
            if (match) return Number(match[1]);
        }
        return null;
    }
})();
