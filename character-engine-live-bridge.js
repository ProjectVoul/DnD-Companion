/* D&D Companion — live bridge for legacy home/inventory state */
(() => {
    'use strict';
    const engine = window.DnDCharacterEngine;
    if (!engine) return;

    const legacyArmorBase = {
        'Padded Armor': 11, 'Leather Armor': 11, 'Studded Leather': 12,
        'Hide Armor': 12, 'Chain Shirt': 13, 'Scale Mail': 14,
        'Breastplate': 14, 'Half Plate': 15, 'Ring Mail': 14,
        'Chain Mail': 16, 'Splint Armor': 17, 'Plate Armor': 18
    };

    function legacyBonus(item) {
        const props = Array.isArray(item?.properties) ? item.properties : [];
        for (const prop of props) {
            const match = String(prop).match(/^\s*\+\s*(\d+)\s*AC\s*$/i);
            if (match) return Number(match[1]);
        }
        return 0;
    }

    function normalizeItem(item) {
        if (!item || typeof item !== 'object') return item;
        item.equipment = item.equipment || {};
        const tagType = ({ Armor: 'armor', Weapon: 'weapon', Shield: 'shield', Focus: 'focus', Accessory: 'accessory' })[
            (item.tags || []).find(tag => ['Armor', 'Weapon', 'Shield', 'Focus', 'Accessory'].includes(tag))
        ];
        const type = item.equipment.type || item.mechanics?.type || tagType ||
            ({ armor: 'armor', weapons: 'weapon', shield: 'shield', focus: 'focus', accessories: 'accessory' }[item.category]);
        if (type) item.equipment.type = type;
        if (item.equipped !== undefined) item.equipment.equipped = Boolean(item.equipped);
        if (item.equipment.equipped !== undefined) item.equipped = Boolean(item.equipment.equipped);

        const structured = item.mechanics && Object.keys(item.mechanics).length > 0;
        if (type === 'armor' && !structured) {
            const bonus = legacyBonus(item);
            item.mechanics = engine.createArmorMechanics({
                category: 'heavy',
                armorClass: legacyArmorBase[item.name] || 10,
                strengthRequirement: item.name === 'Plate Armor' ? 15 : 0
            });
            if (bonus) item.modifiers = [...(item.modifiers || []), {
                id: `legacy-ac-${item.id || item.name}`,
                target: 'armorClass', mode: 'add', value: bonus, sourceName: item.name
            }];
        }
        if (type === 'shield' && !structured) {
            item.mechanics = engine.createShieldMechanics({ armorBonus: legacyBonus(item) || 2 });
        }
        if (type === 'weapon' && !structured) {
            item.mechanics = engine.createWeaponMechanics(item.mechanics || {});
        }
        return item;
    }

    function syncSpellSlots(character) {
        try {
            const saved = JSON.parse(localStorage.getItem('spellSlots') || 'null');
            if (!saved) return;
            character.resources.spellSlots = {};
            Object.keys(saved).forEach(level => {
                const slot = saved[level];
                if (!slot || Number(slot.maximum) <= 0) return;
                const maximum = Number(slot.maximum) || 0;
                character.resources.spellSlots[level] = {
                    current: Math.max(0, Math.min(Number(slot.current) || 0, maximum)),
                    maximum
                };
            });
        } catch (_) {}
    }

    function syncCurrentHP(character) {
        const raw = localStorage.getItem('currentHP');
        if (raw === null) return;
        const value = Number(raw);
        if (Number.isFinite(value)) {
            character.resources.hp.current = Math.max(0, Math.min(character.resources.hp.maximum || value, value));
        }
    }

    function getLiveCharacter() {
        const character = engine.loadCharacter();
        const legacyItems = typeof inventoryItems !== 'undefined' && Array.isArray(inventoryItems) ? inventoryItems : null;
        character.items = (legacyItems || character.items || []).map(normalizeItem);
        syncSpellSlots(character);
        if (engine.syncCharacterRules) engine.syncCharacterRules(character);
        syncCurrentHP(character);
        return character;
    }

    engine.getLiveCharacter = getLiveCharacter;
    engine.getLiveDerivedData = () => engine.calculator.getDerivedData(getLiveCharacter());
    engine.getLiveArmorClassBreakdown = () => engine.calculator.getArmorClassBreakdown
        ? engine.calculator.getArmorClassBreakdown(getLiveCharacter())
        : null;
})();
