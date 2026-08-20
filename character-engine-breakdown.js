/*
 * D&D Companion — Character Engine breakdown layer
 * Ruleset: D&D 5e 2014
 *
 * This layer extends the calculator without replacing the existing engine.
 * It makes every derived value explainable by source.
 */

(() => {
    'use strict';

    const engine = window.DnDCharacterEngine;
    if (!engine || !engine.calculator) {
        console.error('Character Engine breakdown: base engine not available.');
        return;
    }

    const clone = (value) => JSON.parse(JSON.stringify(value));

    function sourceLabel(source) {
        if (!source) return 'Unknown source';
        if (source.name) return source.name;
        if (source.label) return source.label;
        if (source.id) return source.id;
        return source.type || 'Unknown source';
    }

    function getModifierEntries(character, target) {
        const entries = [];

        (character.items || []).forEach((item) => {
            if (!item?.equipment?.equipped) return;
            (item.modifiers || []).forEach((modifier) => {
                if (modifier.target !== target) return;
                entries.push({
                    source: modifier.source || { type: 'item', id: item.id, name: item.name },
                    label: item.name || modifier.source?.name || item.id || 'Item',
                    mode: modifier.mode || 'add',
                    value: modifier.value,
                    condition: modifier.condition || null
                });
            });
        });

        (character.activeEffects || []).forEach((effect) => {
            if (effect?.active === false || effect?.target !== target) return;
            entries.push({
                source: effect.source || { type: 'effect', id: effect.id },
                label: effect.source?.name || effect.id || 'Active Effect',
                mode: effect.mode || 'add',
                value: effect.value,
                condition: effect.condition || null,
                duration: clone(effect.duration || null)
            });
        });

        return entries;
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
        const entries = [
            {
                source: { type: 'base', id: target },
                label: baseLabel,
                mode: 'set',
                value: base,
                result: base
            }
        ];

        getModifierEntries(character, target).forEach((entry) => {
            running = applyEntry(running, entry);
            entries.push({ ...entry, result: running });
        });

        return {
            total: running,
            entries
        };
    }

    function getAbilityScoreBreakdown(character, ability) {
        const base = Number(character.abilities?.[ability]) || 0;
        return buildBreakdown(base, character, ability, `Base ${ability}`);
    }

    function getArmorClassBreakdown(character) {
        const armor = engine.calculator.getEquippedArmor
            ? engine.calculator.getEquippedArmor(character)
            : (character.items || []).find((item) => item?.equipment?.equipped && item?.mechanics?.type === 'armor') || null;
        const shield = engine.calculator.getEquippedShield
            ? engine.calculator.getEquippedShield(character)
            : (character.items || []).find((item) => item?.equipment?.equipped && item?.mechanics?.type === 'shield') || null;

        const dex = engine.calculator.getAbilityModifier(character, 'dexterity');
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
                const maximum = mechanics.dexterity?.maximum ?? 2;
                const dexApplied = Math.min(dex, Number(maximum));
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

        return { total: running, entries };
    }

    function getSpellAttackBreakdown(character) {
        const ability = engine.calculator.getSpellcastingAbility(character);
        if (!ability || character.abilities[ability] === undefined) return { total: null, entries: [] };
        const abilityMod = engine.calculator.getAbilityModifier(character, ability);
        const proficiency = engine.calculator.getProficiencyBonus(character.identity.level);
        const base = abilityMod + proficiency;
        const breakdown = buildBreakdown(base, character, 'spellAttackBonus', `Spellcasting modifier (${abilityMod >= 0 ? '+' : ''}${abilityMod}) + proficiency (+${proficiency})`);
        return breakdown;
    }

    function getSpellSaveDCBreakdown(character) {
        const ability = engine.calculator.getSpellcastingAbility(character);
        if (!ability || character.abilities[ability] === undefined) return { total: null, entries: [] };
        const abilityMod = engine.calculator.getAbilityModifier(character, ability);
        const proficiency = engine.calculator.getProficiencyBonus(character.identity.level);
        const base = 8 + abilityMod + proficiency;
        return buildBreakdown(base, character, 'spellSaveDC', `8 + spellcasting modifier (${abilityMod >= 0 ? '+' : ''}${abilityMod}) + proficiency (+${proficiency})`);
    }

    function getWeaponAttackBreakdown(character, item) {
        if (!item || item.mechanics?.type !== 'weapon') return { total: null, entries: [] };
        const ability = engine.calculator.getWeaponAbility(character, item);
        const abilityMod = engine.calculator.getAbilityModifier(character, ability);
        const proficient = item.mechanics?.attack?.proficient !== false;
        const proficiency = proficient ? engine.calculator.getProficiencyBonus(character.identity.level) : 0;
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

    function getDerivedBreakdown(character) {
        return {
            abilities: Object.fromEntries(
                engine.abilities.map((ability) => [ability, getAbilityScoreBreakdown(character, ability)])
            ),
            armorClass: getArmorClassBreakdown(character),
            spellAttackBonus: getSpellAttackBreakdown(character),
            spellSaveDC: getSpellSaveDCBreakdown(character),
            weapons: (character.items || [])
                .filter((item) => item?.mechanics?.type === 'weapon')
                .map((item) => ({
                    itemId: item.id,
                    name: item.name,
                    attack: getWeaponAttackBreakdown(character, item)
                }))
        };
    }

    function getSpellDCBreakdownAlias(character) {
        return getSpellSaveDCBreakdown(character);
    }

    const originalGetWeaponDamage = engine.calculator.getWeaponDamage;

    function getWeaponDamage(character, item) {
        if (!item || item.mechanics?.type !== 'weapon') return [];
        const ability = engine.calculator.getWeaponAbility(character, item);
        const abilityModifier = engine.calculator.getAbilityModifier(character, ability);

        return (item.mechanics.damage || []).map((damage) => {
            const usesAbility = damage.ability !== null && damage.ability !== undefined
                ? damage.ability
                : ability;
            const abilityBonus = damage.ability === null || damage.ability === undefined
                ? abilityModifier
                : engine.calculator.getAbilityModifier(character, damage.ability);

            return {
                dice: clone(damage.dice || { count: 0, die: null }),
                type: damage.type,
                ability: usesAbility,
                modifier: (Number(damage.modifier) || 0) + abilityBonus,
                source: damage.source || { type: 'item', id: item.id }
            };
        });
    }

    engine.calculator.getModifierEntries = getModifierEntries;
    engine.calculator.getAbilityScoreBreakdown = getAbilityScoreBreakdown;
    engine.calculator.getArmorClassBreakdown = getArmorClassBreakdown;
    engine.calculator.getSpellAttackBreakdown = getSpellAttackBreakdown;
    engine.calculator.getSpellSaveDCBreakdown = getSpellSaveDCBreakdown;
    engine.calculator.getWeaponAttackBreakdown = getWeaponAttackBreakdown;
    engine.calculator.getDerivedBreakdown = getDerivedBreakdown;
    engine.calculator.getWeaponDamage = getWeaponDamage;
    engine.calculator.getSpellDCBreakdown = getSpellDCBreakdownAlias;
    engine.calculator.sourceLabel = sourceLabel;

    // Keep the original function reachable for diagnostics while the new
    // implementation is being validated and integrated into the core engine.
    engine.calculator._legacyGetWeaponDamage = originalGetWeaponDamage;
})();
