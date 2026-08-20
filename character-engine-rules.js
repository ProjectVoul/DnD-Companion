/*
 * D&D Companion — 5e 2014 rules corrections / combat layer
 *
 * This file deliberately sits on top of character-engine.js.
 * It does not replace the data model; it corrects and extends the
 * calculation rules that are sensitive to 5e 2014 mechanics.
 */

(() => {
    'use strict';

    const engine = window.DnDCharacterEngine;
    if (!engine) {
        console.error('Character Engine rules: base engine not loaded.');
        return;
    }

    const calculator = engine.calculator;

    const ABILITIES = engine.abilities;

    const clone = (value) => JSON.parse(JSON.stringify(value));

    function abilityModifier(score) {
        const numericScore = Number(score) || 0;
        return Math.floor((numericScore - 10) / 2);
    }

    function proficiencyBonus(level) {
        const numericLevel = Math.max(1, Number(level) || 1);
        return 2 + Math.floor((numericLevel - 1) / 4);
    }

    function isActiveEffect(effect) {
        return !!effect && effect.active !== false;
    }

    function getAllModifiers(character) {
        const modifiers = [];

        (character.items || []).forEach((item) => {
            if (!item?.equipment?.equipped) return;

            (item.modifiers || []).forEach((modifier) => {
                modifiers.push({
                    ...modifier,
                    source: modifier.source || { type: 'item', id: item.id },
                    sourceName: modifier.sourceName || item.name || 'Item'
                });
            });
        });

        (character.activeEffects || []).filter(isActiveEffect).forEach((effect) => {
            modifiers.push({
                id: effect.id,
                source: effect.source,
                sourceName: effect.source?.name || effect.name || 'Active Effect',
                target: effect.target,
                mode: effect.mode,
                value: effect.value,
                condition: effect.condition
            });
        });

        return modifiers;
    }

    function getTargetModifiers(character, target) {
        return getAllModifiers(character).filter((modifier) => modifier.target === target);
    }

    function applyModifier(value, modifier) {
        const modifierValue = Number(modifier.value) || 0;

        switch (modifier.mode) {
            case 'subtract':
                return value - modifierValue;
            case 'multiply':
                return value * modifierValue;
            case 'set':
                return modifierValue;
            case 'add':
            default:
                return value + modifierValue;
        }
    }

    function applyTargetModifiers(value, character, target) {
        return getTargetModifiers(character, target).reduce(applyModifier, value);
    }

    function getEffectiveAbilityScore(character, ability) {
        const base = Number(character.abilities?.[ability]) || 0;
        return applyTargetModifiers(base, character, ability);
    }

    function getAbilityModifier(character, ability) {
        return abilityModifier(getEffectiveAbilityScore(character, ability));
    }

    /*
     * Finesse is a player choice, not an automatic "use the higher score" rule.
     * The choice can be stored on the weapon as attack.ability, or in the
     * character's weaponChoices map. If neither exists, we return null so the
     * UI can ask the player instead of silently making a rules decision.
     */
    function getWeaponAbility(character, item) {
        const mechanics = item?.mechanics || {};
        const attack = mechanics.attack || {};
        const properties = mechanics.properties || [];
        const attackType = attack.type || 'melee';

        if (properties.includes('finesse')) {
            const storedChoice = attack.ability || character.weaponChoices?.[item.id];
            if (storedChoice === 'strength' || storedChoice === 'dexterity') {
                return storedChoice;
            }
            return null;
        }

        if (attack.ability && ABILITIES.includes(attack.ability)) {
            return attack.ability;
        }

        return attackType === 'ranged' ? 'dexterity' : 'strength';
    }

    function getWeaponAttackBonus(character, item) {
        if (!item || item.mechanics?.type !== 'weapon') return null;

        const ability = getWeaponAbility(character, item);
        if (!ability) return null;

        const abilityBonus = getAbilityModifier(character, ability);
        const proficient = item.mechanics?.attack?.proficient === true;
        const proficiency = proficient ? proficiencyBonus(character.identity.level) : 0;
        const weaponBonus = Number(item.mechanics?.attack?.bonus) || 0;

        return applyTargetModifiers(
            abilityBonus + proficiency + weaponBonus,
            character,
            'weaponAttackBonus'
        );
    }

    function getWeaponDamage(character, item) {
        if (!item || item.mechanics?.type !== 'weapon') return [];

        const ability = getWeaponAbility(character, item);
        if (!ability) return [];

        const abilityModifierValue = getAbilityModifier(character, ability);

        return (item.mechanics.damage || []).map((damage) => ({
            dice: clone(damage.dice || { count: 0, die: null }),
            type: damage.type,
            ability,
            modifier: (Number(damage.modifier) || 0) + abilityModifierValue,
            source: damage.source || { type: 'item', id: item.id }
        }));
    }

    function hasDefenseFightingStyle(character) {
        const fightingStyle = character.fightingStyle || character.features?.fightingStyle;
        if (typeof fightingStyle === 'string') {
            return fightingStyle.toLowerCase() === 'defense';
        }

        const features = character.features;
        if (Array.isArray(features)) {
            return features.some((feature) => {
                const name = typeof feature === 'string' ? feature : feature?.name;
                return typeof name === 'string' && name.toLowerCase() === 'defense';
            });
        }

        return false;
    }

    function getEquippedArmor(character) {
        return (character.items || []).find((item) =>
            item?.equipment?.equipped && item?.mechanics?.type === 'armor'
        ) || null;
    }

    function getEquippedShield(character) {
        return (character.items || []).find((item) =>
            item?.equipment?.equipped && item?.mechanics?.type === 'shield'
        ) || null;
    }

    /*
     * Standard 5e 2014 armor calculation.
     * Alternative AC formulas are intentionally not guessed here: they will
     * be represented explicitly by the character data model before being
     * enabled. This prevents stacking incompatible AC formulas accidentally.
     */
    function getArmorClassBreakdown(character) {
        const armor = getEquippedArmor(character);
        const shield = getEquippedShield(character);
        const entries = [];

        let baseAC;
        let dexContribution = 0;

        if (!armor) {
            baseAC = 10;
            entries.push({
                source: { type: 'rules', id: 'unarmored-ac' },
                label: 'Unarmored base AC',
                mode: 'set',
                value: 10,
                result: 10
            });

            const dex = getAbilityModifier(character, 'dexterity');
            dexContribution = dex;

            if (dex !== 0) {
                entries.push({
                    source: { type: 'ability', id: 'dexterity' },
                    label: 'Dexterity modifier',
                    mode: 'add',
                    value: dex
                });
            }
        } else {
            const mechanics = armor.mechanics || {};
            baseAC = Number(mechanics.armorClass) || 10;
            const category = mechanics.category || 'light';

            entries.push({
                source: { type: 'item', id: armor.id },
                label: armor.name || 'Armor',
                mode: 'set',
                value: baseAC
            });

            if (category !== 'heavy' && mechanics.dexterity?.applies !== false) {
                const dex = getAbilityModifier(character, 'dexterity');
                const maximum = category === 'medium'
                    ? (mechanics.dexterity?.maximum ?? 2)
                    : null;

                dexContribution = maximum === null
                    ? dex
                    : Math.min(dex, Number(maximum));

                if (dexContribution !== 0) {
                    entries.push({
                        source: { type: 'ability', id: 'dexterity' },
                        label: maximum === null
                            ? 'Dexterity modifier'
                            : 'Dexterity modifier (medium armor cap)',
                        mode: 'add',
                        value: dexContribution
                    });
                }
            }
        }

        let total = baseAC + dexContribution;

        if (shield) {
            const shieldBonus = Number(shield.mechanics?.armorBonus) || 0;
            if (shieldBonus !== 0) {
                entries.push({
                    source: { type: 'item', id: shield.id },
                    label: shield.name || 'Shield',
                    mode: 'add',
                    value: shieldBonus
                });
                total += shieldBonus;
            }
        }

        if (hasDefenseFightingStyle(character) && armor) {
            entries.push({
                source: { type: 'feature', id: 'fighting-style-defense' },
                label: 'Fighting Style: Defense',
                mode: 'add',
                value: 1,
                condition: 'wearing armor'
            });
            total += 1;
        }

        getTargetModifiers(character, 'armorClass').forEach((modifier) => {
            entries.push({
                source: modifier.source,
                label: modifier.sourceName || 'Modifier',
                mode: modifier.mode,
                value: Number(modifier.value) || 0,
                condition: modifier.condition || null
            });
            total = applyModifier(total, modifier);
        });

        let running = 0;
        const breakdown = entries.map((entry) => {
            if (entry.mode === 'set') {
                running = Number(entry.value) || 0;
            } else {
                running = applyModifier(running, entry);
            }
            return { ...entry, result: running };
        });

        return {
            total,
            breakdown,
            armorId: armor?.id || null,
            shieldId: shield?.id || null,
            calculation: armor ? 'standard-armor' : 'unarmored'
        };
    }

    function getArmorClass(character) {
        return getArmorClassBreakdown(character).total;
    }

    function getSpeedBreakdown(character) {
        const entries = [];
        let total = Number(character.baseSpeed);

        if (!Number.isFinite(total)) total = 30;

        entries.push({
            source: { type: 'character', id: 'base-speed' },
            label: 'Base speed',
            mode: 'set',
            value: total
        });

        const armor = getEquippedArmor(character);
        const requirement = Number(armor?.mechanics?.strengthRequirement) || 0;
        const strength = getEffectiveAbilityScore(character, 'strength');

        if (requirement > 0 && strength < requirement) {
            entries.push({
                source: { type: 'rules', id: 'heavy-armor-strength' },
                label: 'Heavy armor Strength requirement',
                mode: 'subtract',
                value: 10,
                condition: `Strength ${strength} < ${requirement}`
            });
        }

        getTargetModifiers(character, 'speed').forEach((modifier) => {
            entries.push({
                source: modifier.source,
                label: modifier.sourceName || 'Speed modifier',
                mode: modifier.mode,
                value: Number(modifier.value) || 0,
                condition: modifier.condition || null
            });
        });

        let running = 0;
        const breakdown = entries.map((entry) => {
            if (entry.mode === 'set') running = Number(entry.value) || 0;
            else running = applyModifier(running, entry);
            return { ...entry, result: running };
        });

        return { total: running, breakdown };
    }

    function getSpeed(character) {
        return getSpeedBreakdown(character).total;
    }

    function getACBreakdown(character) {
        return getArmorClassBreakdown(character);
    }

    calculator.getWeaponAbility = getWeaponAbility;
    calculator.getWeaponAttackBonus = getWeaponAttackBonus;
    calculator.getWeaponDamage = getWeaponDamage;
    calculator.getArmorClassBreakdown = getArmorClassBreakdown;
    calculator.getACBreakdown = getACBreakdown;
    calculator.getArmorClass = getArmorClass;
    calculator.getSpeedBreakdown = getSpeedBreakdown;
    calculator.getSpeed = getSpeed;
    calculator.hasDefenseFightingStyle = hasDefenseFightingStyle;
})();
