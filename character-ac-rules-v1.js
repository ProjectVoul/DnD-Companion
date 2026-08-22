/*
 * D&D Companion — Armor Class Rules v1
 *
 * Single AC authority for the 5e 2014 character model.
 *
 * The item model historically stored armorClass inconsistently:
 * - some items store the armor's full AC (e.g. 18 for plate);
 * - current custom items may store the contribution above the base 10
 *   (e.g. 8 for plate).
 *
 * This compatibility layer normalizes both representations to an armor
 * contribution, then applies DEX when allowed, shield bonus, and active
 * armor-class modifiers such as Fighting Style: Defense.
 */
(() => {
    'use strict';

    const engine = window.DnDCharacterEngine;
    if (!engine || !engine.calculator) return;

    const ABILITIES = engine.abilities || [
        'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'
    ];

    const previousGetArmorClass = engine.calculator.getArmorClass;

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function getAbilityModifier(character, ability) {
        return engine.calculator.getAbilityModifier(character, ability);
    }

    function normalizeArmorContribution(rawArmorClass) {
        const value = Number(rawArmorClass);
        if (!Number.isFinite(value)) return 0;

        // Backward compatibility: values above 10 are treated as the full
        // armor AC; values 10 or below are treated as the contribution above
        // the base AC 10. This makes 18 and 8 both resolve to +8.
        return value > 10 ? value - 10 : value;
    }

    function wearingArmor(character) {
        return !!(character.items || []).find((item) =>
            item?.equipment?.equipped && item?.mechanics?.type === 'armor'
        );
    }

    function conditionMet(character, condition) {
        if (!condition) return true;
        if (condition.type === 'wearingArmor') return wearingArmor(character);
        if (condition.type === 'conscious') return character.status?.conscious !== false && !character.status?.unconscious;
        if (condition.type === 'hasShield') return !!(character.items || []).find((item) =>
            item?.equipment?.equipped && item?.mechanics?.type === 'shield'
        );
        return true;
    }

    function resolveModifierValue(character, modifier) {
        const value = modifier?.value;
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            const map = {
                strengthModifier: 'strength',
                dexterityModifier: 'dexterity',
                constitutionModifier: 'constitution',
                intelligenceModifier: 'intelligence',
                wisdomModifier: 'wisdom',
                charismaModifier: 'charisma'
            };
            if (map[value]) return getAbilityModifier(character, map[value]);
        }
        return Number(value) || 0;
    }

    function applyModifier(value, character, modifier) {
        if (!conditionMet(character, modifier?.condition)) return value;
        const amount = resolveModifierValue(character, modifier);
        switch (modifier?.mode) {
            case 'subtract': return value - amount;
            case 'multiply': return value * amount;
            case 'set': return amount;
            case 'add':
            default: return value + amount;
        }
    }

    function getArmorClass(character) {
        const armor = (character.items || []).find((item) =>
            item?.equipment?.equipped && item?.mechanics?.type === 'armor'
        ) || null;
        const shield = (character.items || []).find((item) =>
            item?.equipment?.equipped && item?.mechanics?.type === 'shield'
        ) || null;

        let armorContribution = 0;
        let dexterityApplies = true;
        let dexterityMaximum = null;

        if (armor) {
            const mechanics = armor.mechanics || {};
            const category = mechanics.category || 'light';
            armorContribution = normalizeArmorContribution(mechanics.armorClass);

            if (category === 'heavy') {
                dexterityApplies = false;
            } else if (category === 'medium') {
                dexterityMaximum = Number(mechanics.dexterity?.maximum ?? 2);
            }
        }

        let ac = 10 + armorContribution;

        if (dexterityApplies) {
            const dexterityModifier = getAbilityModifier(character, 'dexterity');
            ac += dexterityMaximum == null
                ? dexterityModifier
                : Math.min(dexterityModifier, dexterityMaximum);
        }

        if (shield) {
            ac += Number(shield.mechanics?.armorBonus) || 0;
        }

        // Item modifiers are part of the canonical character model.
        (character.items || []).forEach((item) => {
            if (!item?.equipment?.equipped) return;
            (item.modifiers || [])
                .filter((modifier) => modifier?.target === 'armorClass')
                .forEach((modifier) => { ac = applyModifier(ac, character, modifier); });
        });

        // Feature modifiers (e.g. Paladin Fighting Style: Defense).
        if (typeof engine.getApplicableFeatureModifiers === 'function') {
            engine.getApplicableFeatureModifiers(character)
                .filter((modifier) => modifier?.target === 'armorClass')
                .forEach((modifier) => { ac = applyModifier(ac, character, modifier); });
        }

        // Explicit active effects remain supported.
        (character.activeEffects || [])
            .filter((effect) => effect?.active !== false && effect?.target === 'armorClass')
            .forEach((effect) => { ac = applyModifier(ac, character, effect); });

        return ac;
    }

    engine.calculator.getArmorClass = getArmorClass;
    engine.acRulesVersion = 1;
    engine.acRules = {
        normalizeArmorContribution,
        getArmorClass,
        previousGetArmorClass
    };
})();
