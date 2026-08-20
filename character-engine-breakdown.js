/*
 * D&D Companion — Character Engine breakdown layer
 * Ruleset: D&D 5e 2014
 *
 * Derived values remain explainable by source. This layer does not own
 * calculation rules; it asks the calculator for the same base values used
 * by the runtime and only builds presentation-ready breakdowns.
 */

(() => {
    'use strict';

    const engine = window.DnDCharacterEngine;
    if (!engine || !engine.calculator) {
        console.error('Character Engine breakdown: base engine not available.');
        return;
    }

    const calculator = engine.calculator;
    const clone = (value) => JSON.parse(JSON.stringify(value));

    function sourceLabel(source) {
        if (!source) return 'Unknown source';
        return source.name || source.label || source.id || source.type || 'Unknown source';
    }

    function getModifierEntries(character, target) {
        return calculator.getAllModifiers(character)
            .filter((modifier) => modifier.target === target)
            .map((modifier) => ({
                source: modifier.source,
                label: modifier.sourceName || sourceLabel(modifier.source),
                mode: modifier.mode || 'add',
                value: modifier.value,
                condition: modifier.condition || null
            }));
    }

    function applyEntry(value, entry) {
        const amount = Number(entry.value) || 0;
        switch (entry.mode) {
            case 'subtract': return value - amount;
            case 'multiply': return value * amount;
            case 'set': return amount;
            case 'add':
            default: return value + amount;
        }
    }

    function buildBreakdown(base, character, target, baseLabel = 'Base') {
        let running = base;
        const entries = [{
            source: { type: 'base', id: target },
            label: baseLabel,
            mode: 'set',
            value: base,
            result: base
        }];

        getModifierEntries(character, target).forEach((entry) => {
            running = applyEntry(running, entry);
            entries.push({ ...entry, result: running });
        });

        return { total: running, entries };
    }

    function getAbilityScoreBreakdown(character, ability) {
        const base = Number(character.abilityScores?.[ability]) || 0;
        return buildBreakdown(base, character, ability, `Base ${ability}`);
    }

    function getArmorClassBreakdown(character) {
        const armor = calculator.getEquippedArmor(character);
        const shield = calculator.getEquippedShield(character);
        const dex = calculator.getAbilityModifier(character, 'dexterity');
        let base;
        let baseLabel;

        if (!armor) {
            base = 10 + dex;
            baseLabel = `Unarmored: 10 + DEX (${dex >= 0 ? '+' : ''}${dex})`;
        } else {
            const mechanics = armor.mechanics || {};
            const armorBase = Number(mechanics.armorClass) || 10;
            const category = mechanics.category || 'light';

            if (category === 'heavy') {
                base = armorBase;
                baseLabel = `${armor.name || 'Armor'}: ${armorBase}`;
            } else if (category === 'medium') {
                const maximum = Number(mechanics.dexterity?.maximum ?? 2);
                const dexApplied = Math.min(dex, maximum);
                base = armorBase + dexApplied;
                baseLabel = `${armor.name || 'Armor'}: ${armorBase} + DEX (${dexApplied >= 0 ? '+' : ''}${dexApplied})`;
            } else {
                base = armorBase + dex;
                baseLabel = `${armor.name || 'Armor'}: ${armorBase} + DEX (${dex >= 0 ? '+' : ''}${dex})`;
            }
        }

        const entries = [{
            source: { type: armor ? 'item' : 'base', id: armor?.id || 'unarmored' },
            label: baseLabel,
            mode: 'set',
            value: base,
            result: base
        }];
        let running = base;

        if (shield) {
            const value = Number(shield.mechanics?.armorBonus) || 0;
            running += value;
            entries.push({
                source: { type: 'item', id: shield.id, name: shield.name },
                label: shield.name || 'Shield',
                mode: 'add',
                value,
                result: running
            });
        }

        getModifierEntries(character, 'armorClass').forEach((entry) => {
            running = applyEntry(running, entry);
            entries.push({ ...entry, result: running });
        });

        if (calculator.hasDefenseFightingStyle && calculator.hasDefenseFightingStyle(character)) {
            // The rules layer owns the actual +1. If present, it is already
            // included in its AC breakdown; this branch intentionally does
            // not mutate the total to avoid double application.
        }

        return { total: running, entries };
    }

    function getSpellAttackBreakdown(character) {
        const ability = calculator.getSpellcastingAbility(character);
        if (!ability || character.abilityScores?.[ability] === undefined) return { total: null, entries: [] };
        const abilityMod = calculator.getAbilityModifier(character, ability);
        const proficiency = calculator.getProficiencyBonus(character.identity.level);
        return buildBreakdown(
            abilityMod + proficiency,
            character,
            'spellAttackBonus',
            `Spellcasting modifier (${abilityMod >= 0 ? '+' : ''}${abilityMod}) + proficiency (+${proficiency})`
        );
    }

    function getSpellSaveDCBreakdown(character) {
        const ability = calculator.getSpellcastingAbility(character);
        if (!ability || character.abilityScores?.[ability] === undefined) return { total: null, entries: [] };
        const abilityMod = calculator.getAbilityModifier(character, ability);
        const proficiency = calculator.getProficiencyBonus(character.identity.level);
        return buildBreakdown(
            8 + abilityMod + proficiency,
            character,
            'spellSaveDC',
            `8 + spellcasting modifier (${abilityMod >= 0 ? '+' : ''}${abilityMod}) + proficiency (+${proficiency})`
        );
    }

    function getWeaponAttackBreakdown(character, item) {
        if (!item || item.mechanics?.type !== 'weapon') return { total: null, entries: [] };
        const ability = calculator.getWeaponAbility(character, item);
        if (!ability) {
            return {
                total: null,
                entries: [{
                    source: { type: 'item', id: item.id, name: item.name },
                    label: `${item.name || 'Weapon'}: choose STR or DEX for finesse`,
                    mode: 'set',
                    value: null,
                    result: null
                }]
            };
        }

        const abilityMod = calculator.getAbilityModifier(character, ability);
        const proficient = item.mechanics?.attack?.proficient === true;
        const proficiency = proficient ? calculator.getProficiencyBonus(character.identity.level) : 0;
        const explicitBonus = Number(item.mechanics?.attack?.bonus) || 0;
        const base = abilityMod + proficiency + explicitBonus;

        const entries = [{
            source: { type: 'item', id: item.id, name: item.name },
            label: `${item.name || 'Weapon'}: ${ability} modifier + proficiency${explicitBonus ? ' + item bonus' : ''}`,
            mode: 'set',
            value: base,
            result: base
        }];

        let running = base;
        getModifierEntries(character, 'weaponAttackBonus').forEach((entry) => {
            running = applyEntry(running, entry);
            entries.push({ ...entry, result: running });
        });

        return { total: running, entries };
    }

    function getWeaponDamageBreakdown(character, item) {
        const ability = calculator.getWeaponAbility(character, item);
        if (!ability) return [];
        return calculator.getWeaponDamage(character, item).map((damage) => ({
            dice: clone(damage.dice),
            type: damage.type,
            ability: damage.ability,
            modifier: damage.modifier,
            source: damage.source
        }));
    }

    function getDerivedBreakdown(character) {
        return {
            abilities: Object.fromEntries(engine.abilities.map((ability) => [ability, getAbilityScoreBreakdown(character, ability)])),
            armorClass: getArmorClassBreakdown(character),
            spellAttackBonus: getSpellAttackBreakdown(character),
            spellSaveDC: getSpellSaveDCBreakdown(character),
            weapons: (character.items || [])
                .filter((item) => item?.mechanics?.type === 'weapon')
                .map((item) => ({
                    itemId: item.id,
                    name: item.name,
                    attack: getWeaponAttackBreakdown(character, item),
                    damage: getWeaponDamageBreakdown(character, item)
                }))
        };
    }

    calculator.getModifierEntries = getModifierEntries;
    calculator.getAbilityScoreBreakdown = getAbilityScoreBreakdown;
    calculator.getArmorClassBreakdown = getArmorClassBreakdown;
    calculator.getSpellAttackBreakdown = getSpellAttackBreakdown;
    calculator.getSpellSaveDCBreakdown = getSpellSaveDCBreakdown;
    calculator.getWeaponAttackBreakdown = getWeaponAttackBreakdown;
    calculator.getWeaponDamageBreakdown = getWeaponDamageBreakdown;
    calculator.getDerivedBreakdown = getDerivedBreakdown;
    calculator.sourceLabel = sourceLabel;
})();
