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
            if (!item.mechanics?.type) {
                item.mechanics = engine.createArmorMechanics({ category: 'heavy', armorClass: 18, strengthRequirement: 15, stealthDisadvantage: true });
                item.properties = Array.isArray(item.properties) && item.properties.length ? item.properties : ['Heavy Armor', '+7 AC'];
                item.modifiers = (item.modifiers || []).filter(m => m.id !== `repair-v5-armor-ac-${item.id || name}`);
                item.modifiers.push({ id: `repair-v5-armor-ac-${item.id || name}`, target: 'armorClass', mode: 'add', value: 7, sourceName: item.name });
                changed = true;
            }
        }
        if (id === 'bahamut-shield' || name === 'shield of bahamut') {
            if (!item.mechanics?.type) {
                item.mechanics = engine.createShieldMechanics({ armorBonus: 4 });
                item.properties = Array.isArray(item.properties) && item.properties.length ? item.properties : ['+4 AC'];
                changed = true;
            }
        }
        if (id === 'golden-choice-sword' || name === 'sword of the golden choice') {
            if (!item.mechanics?.type) {
                item.mechanics = engine.createWeaponMechanics({
                    type: 'weapon',
                    attack: { type: 'melee', ability: 'strength', proficient: true, bonus: 0 },
                    damage: [{ dice: { count: 1, die: 'd8' }, type: 'slashing', ability: 'strength', modifier: 0 }],
                    properties: ['versatile']
                });
                item.proficiency = { type: 'martial' };
                item.mechanics.proficiency = { type: 'martial' };
                changed = true;
            }
        }
    });

    if (changed) save();
    if (typeof window.updateDragonBreathUses === 'function') window.updateDragonBreathUses();
})();
