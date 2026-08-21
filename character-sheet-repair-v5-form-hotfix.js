/* D&D Companion — inventory mechanics form persistence hotfix */
(() => {
    'use strict';
    if (typeof inventoryItems === 'undefined' || typeof saveInventory !== 'function') return;
    const baseSave = window.saveInventoryItemForm;
    if (typeof baseSave !== 'function' || baseSave.__repairV5FormHotfix) return;

    const value = id => document.getElementById(id)?.value ?? '';
    const checked = id => Boolean(document.getElementById(id)?.checked);
    const itemList = () => inventoryItems;

    const wrapped = function (existingId = '') {
        const name = document.querySelector('[id*="inventory-form-name"]')?.value?.trim() || '';
        const mechanics = {
            type: value('repair-mechanics-type'),
            armorAC: value('repair-armor-ac'), armorBonus: value('repair-armor-bonus'), armorCategory: value('repair-armor-category'), armorSTR: value('repair-armor-str'),
            shieldBonus: value('repair-shield-bonus'), weaponAbility: value('repair-weapon-ability'), weaponProf: value('repair-weapon-prof'), weaponAttack: value('repair-weapon-attack'),
            weaponDiceCount: value('repair-weapon-dice-count'), weaponDie: value('repair-weapon-die'), weaponDamageType: value('repair-weapon-damage-type'), stealth: checked('repair-armor-stealth')
        };

        baseSave(existingId);

        let item = existingId ? itemList().find(x => x.id === existingId) : null;
        if (!item && name) {
            const matches = itemList().filter(x => String(x.name || '').trim() === name);
            item = matches[matches.length - 1] || null;
        }
        if (!item || mechanics.type === 'none') return;

        item.equipment = item.equipment || {};
        item.equipment.type = mechanics.type;

        if (mechanics.type === 'armor' && window.DnDCharacterEngine) {
            item.mechanics = window.DnDCharacterEngine.createArmorMechanics({
                ...(item.mechanics || {}), type: 'armor', category: mechanics.armorCategory || 'light', armorClass: Number(mechanics.armorAC) || 10,
                strengthRequirement: Number(mechanics.armorSTR) || 0, stealthDisadvantage: mechanics.stealth
            });
            const bonus = Number(mechanics.armorBonus) || 0;
            item.modifiers = (item.modifiers || []).filter(m => m.id !== `repair-v5-armor-ac-${item.id || item.name}`);
            if (bonus) item.modifiers.push({ id: `repair-v5-armor-ac-${item.id || item.name}`, target: 'armorClass', mode: 'add', value: bonus, sourceName: item.name });
        }

        if (mechanics.type === 'shield' && window.DnDCharacterEngine) {
            item.mechanics = window.DnDCharacterEngine.createShieldMechanics({ ...(item.mechanics || {}), armorBonus: Number(mechanics.shieldBonus) || 2 });
        }

        if (mechanics.type === 'weapon' && window.DnDCharacterEngine) {
            item.proficiency = { ...(item.proficiency || {}), type: mechanics.weaponProf || 'martial' };
            item.mechanics = window.DnDCharacterEngine.createWeaponMechanics({
                ...(item.mechanics || {}), type: 'weapon',
                attack: { ...(item.mechanics?.attack || {}), type: item.mechanics?.attack?.type || 'melee', ability: mechanics.weaponAbility || 'strength', proficient: true, bonus: Number(mechanics.weaponAttack) || 0 },
                damage: [{ dice: { count: Number(mechanics.weaponDiceCount) || 1, die: mechanics.weaponDie || 'd8' }, type: mechanics.weaponDamageType || 'slashing', ability: mechanics.weaponAbility || 'strength', modifier: 0 }],
                properties: item.mechanics?.properties || []
            });
            item.mechanics.proficiency = { type: mechanics.weaponProf || 'martial' };
        }

        saveInventory();
        if (typeof showInventorySection === 'function') showInventorySection(item.location || 'miscellaneous');
    };

    wrapped.__repairV5FormHotfix = true;
    window.saveInventoryItemForm = wrapped;
})();
