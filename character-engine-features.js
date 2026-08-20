/*
 * D&D Companion — Character Features & Proficiencies
 * Ruleset: D&D 5e 2014
 *
 * Features are data, not hard-coded calculator exceptions.
 */

(() => {
    'use strict';

    const engine = window.DnDCharacterEngine;
    if (!engine) {
        console.error('Character Features: Character Engine is not loaded.');
        return;
    }

    // Snapshot the base calculator before this layer replaces any methods.
    const baseCalculator = { ...engine.calculator };
    const ABILITIES = engine.abilities;
    const PROFICIENCY_TYPES = ['skill', 'savingThrow', 'weapon', 'armor', 'tool', 'language'];
    const FEATURE_TYPES = ['class', 'subclass', 'race', 'background', 'feat', 'other'];
    const ACTION_TYPES = ['action', 'bonusAction', 'reaction', 'free', 'passive', 'onHit', 'onDamage', 'onSave', 'triggered'];

    const clone = (value) => JSON.parse(JSON.stringify(value));

    function createProficiency(overrides = {}) {
        return { type: null, value: null, rank: 'proficient', source: null, ...clone(overrides) };
    }

    function createFeature(overrides = {}) {
        return {
            id: '', name: '', type: 'other', source: null, level: 1, active: true,
            description: '', prerequisites: [], choices: [], proficiencies: [], modifiers: [],
            grants: { features: [], spells: [], abilities: [] }, resources: [], actions: [], mechanics: {},
            ...clone(overrides)
        };
    }

    function createFeatureChoice(overrides = {}) {
        return { id: '', label: '', type: 'single', options: [], selected: null, required: true, ...clone(overrides) };
    }

    function createFeatureResource(overrides = {}) {
        return { id: '', name: '', current: 0, maximum: 0, recovery: 'longRest', formula: null, ...clone(overrides) };
    }

    function createFeatureModifier(overrides = {}) {
        return { id: '', source: null, target: '', mode: 'add', value: 0, condition: null, ...clone(overrides) };
    }

    function featureIsActive(feature, character) {
        if (!feature || feature.active === false) return false;
        return (Number(character.identity?.level) || 1) >= (Number(feature.level) || 1);
    }

    function getCharacterFeatures(character) {
        return (character.features || character.abilities || [])
            .filter((feature) => featureIsActive(feature, character));
    }

    function getFeatureProficiencies(character) {
        const result = [];
        getCharacterFeatures(character).forEach((feature) => {
            (feature.proficiencies || []).forEach((proficiency) => {
                if (!PROFICIENCY_TYPES.includes(proficiency.type)) return;
                result.push({
                    ...createProficiency(proficiency),
                    source: proficiency.source || { type: 'feature', id: feature.id, name: feature.name }
                });
            });
        });
        return result;
    }

    function getSkillRank(character, skill) {
        const explicit = character.proficiencies?.skills?.[skill];
        let rank = explicit?.expertise ? 'expertise' : explicit?.proficiency ? 'proficient' : 'none';
        getFeatureProficiencies(character)
            .filter((entry) => entry.type === 'skill' && entry.value === skill)
            .forEach((entry) => {
                if (entry.rank === 'expertise') rank = 'expertise';
                else if (rank === 'none') rank = 'proficient';
            });
        return rank;
    }

    function hasProficiency(character, type, value) {
        if (type === 'skill') return getSkillRank(character, value) !== 'none';
        const base = {
            savingThrow: character.proficiencies?.savingThrows || [],
            weapon: character.proficiencies?.weapons || [],
            armor: character.proficiencies?.armor || [],
            tool: character.proficiencies?.tools || [],
            language: character.proficiencies?.languages || []
        }[type] || [];
        return base.includes(value) || getFeatureProficiencies(character).some((entry) => entry.type === type && entry.value === value);
    }

    function getFeatureModifiers(character) {
        const result = [];
        getCharacterFeatures(character).forEach((feature) => {
            (feature.modifiers || []).forEach((modifier) => {
                result.push({
                    ...createFeatureModifier(modifier),
                    source: modifier.source || { type: 'feature', id: feature.id, name: feature.name },
                    sourceName: modifier.sourceName || feature.name
                });
            });
        });
        return result;
    }

    function isWearingArmor(character) {
        return (character.items || []).some((item) => item?.equipment?.equipped && item?.mechanics?.type === 'armor');
    }

    function hasShield(character) {
        return (character.items || []).some((item) => item?.equipment?.equipped && item?.mechanics?.type === 'shield');
    }

    function conditionIsMet(character, condition) {
        if (!condition) return true;
        switch (condition.type) {
            case 'wearingArmor': return isWearingArmor(character);
            case 'conscious': return character.status?.conscious !== false && !character.status?.unconscious;
            case 'hasShield': return hasShield(character);
            default: return false;
        }
    }

    function resolveModifierValue(character, value) {
        if (typeof value !== 'string') return Number(value) || 0;
        const map = {
            charismaModifier: 'charisma', strengthModifier: 'strength', dexterityModifier: 'dexterity',
            constitutionModifier: 'constitution', intelligenceModifier: 'intelligence', wisdomModifier: 'wisdom'
        };
        return map[value] ? baseCalculator.getAbilityModifier(character, map[value]) : 0;
    }

    function getApplicableFeatureModifiers(character, target = null) {
        return getFeatureModifiers(character).filter((modifier) => {
            if (target && modifier.target !== target) return false;
            return conditionIsMet(character, modifier.condition);
        });
    }

    function withFeatureEffects(character) {
        const derived = clone(character);
        derived.activeEffects = [
            ...(derived.activeEffects || []),
            ...getApplicableFeatureModifiers(character)
                .filter((modifier) => modifier.target !== 'savingThrow' && modifier.target !== 'conditionImmunity')
                .map((modifier) => ({
                    id: modifier.id,
                    name: modifier.sourceName,
                    source: modifier.source,
                    target: modifier.target,
                    mode: modifier.mode,
                    value: resolveModifierValue(character, modifier.value),
                    condition: null,
                    active: true
                }))
        ];
        return derived;
    }

    function getSavingThrowModifier(character, ability) {
        const base = baseCalculator.getAbilityModifier(character, ability);
        const proficient = hasProficiency(character, 'savingThrow', ability);
        let result = base + (proficient ? baseCalculator.getProficiencyBonus(character.identity.level) : 0);
        getApplicableFeatureModifiers(character, 'savingThrow').forEach((modifier) => {
            const amount = resolveModifierValue(character, modifier.value);
            if (modifier.mode === 'subtract') result -= amount;
            else if (modifier.mode === 'set') result = amount;
            else if (modifier.mode === 'multiply') result *= amount;
            else result += amount;
        });
        return result;
    }

    function getSkillModifier(character, skill) {
        const ability = engine.skills[skill];
        if (!ability) return 0;
        const base = baseCalculator.getAbilityModifier(character, ability);
        const rank = getSkillRank(character, skill);
        if (rank === 'expertise') return base + baseCalculator.getProficiencyBonus(character.identity.level) * 2;
        if (rank === 'proficient') return base + baseCalculator.getProficiencyBonus(character.identity.level);
        return base;
    }

    function getArmorClass(character) {
        return baseCalculator.getArmorClass(withFeatureEffects(character));
    }

    function getSpeed(character) {
        return baseCalculator.getSpeed(withFeatureEffects(character));
    }

    function getInitiative(character) {
        return baseCalculator.getInitiative(withFeatureEffects(character));
    }

    function getSpellAttackBonus(character) {
        return baseCalculator.getSpellAttackBonus(withFeatureEffects(character));
    }

    function getSpellSaveDC(character) {
        return baseCalculator.getSpellSaveDC(withFeatureEffects(character));
    }

    function getWeaponAttackBonus(character, item) {
        return baseCalculator.getWeaponAttackBonus(withFeatureEffects(character), item);
    }

    function getWeaponDamage(character, item) {
        const result = baseCalculator.getWeaponDamage(withFeatureEffects(character), item);
        const improved = getCharacterFeatures(character).find((feature) => feature.id === 'improved-divine-smite');
        if (improved && item?.mechanics?.type === 'weapon' && item.mechanics.attack?.type !== 'ranged') {
            result.push({
                dice: { count: 1, die: 'd8' }, type: 'radiant', ability: null, modifier: 0,
                source: { type: 'feature', id: improved.id, name: improved.name }
            });
        }
        return result;
    }

    function getFeatureResources(character) {
        const result = [];
        getCharacterFeatures(character).forEach((feature) => {
            (feature.resources || []).forEach((resource) => {
                const entry = { ...createFeatureResource(resource), source: { type: 'feature', id: feature.id, name: feature.name } };
                if (entry.formula === '1 + charismaModifier') entry.maximum = 1 + Math.max(0, baseCalculator.getAbilityModifier(character, 'charisma'));
                if (entry.formula === '5 * paladinLevel') entry.maximum = 5 * (Number(character.identity?.level) || 0);
                if (entry.formula === 'max(1, charismaModifier)') entry.maximum = Math.max(1, baseCalculator.getAbilityModifier(character, 'charisma'));
                entry.current = Math.min(Number(entry.current) || entry.maximum, entry.maximum);
                result.push(entry);
            });
        });
        return result;
    }

    function getFeatureActions(character) {
        const result = [];
        getCharacterFeatures(character).forEach((feature) => {
            (feature.actions || []).forEach((action) => {
                const normalized = typeof action === 'string' ? { type: action } : { ...action };
                if (!ACTION_TYPES.includes(normalized.type)) return;
                result.push({ ...normalized, source: normalized.source || { type: 'feature', id: feature.id, name: feature.name } });
            });
        });
        return result;
    }

    function getExtraAttacks(character) {
        const feature = getCharacterFeatures(character).find((entry) => entry.id === 'extra-attack');
        return feature?.mechanics?.attacksPerAttackAction || 1;
    }

    function getDerivedData(character) {
        const base = baseCalculator.getDerivedData(withFeatureEffects(character));
        const skills = {};
        Object.keys(engine.skills).forEach((skill) => { skills[skill] = getSkillModifier(character, skill); });
        const savingThrows = {};
        ABILITIES.forEach((ability) => { savingThrows[ability] = getSavingThrowModifier(character, ability); });
        const featureProficiencies = getFeatureProficiencies(character);
        const mergeList = (baseList, type) => [...new Set([...(baseList || []), ...featureProficiencies.filter((entry) => entry.type === type).map((entry) => entry.value)])];

        return {
            ...base,
            skills,
            savingThrows,
            armorClass: getArmorClass(character),
            speed: getSpeed(character),
            initiative: getInitiative(character),
            spellAttackBonus: getSpellAttackBonus(character),
            spellSaveDC: getSpellSaveDC(character),
            weaponAttacksPerAttackAction: getExtraAttacks(character),
            features: getCharacterFeatures(character),
            featureResources: getFeatureResources(character),
            featureActions: getFeatureActions(character),
            featureModifiers: getApplicableFeatureModifiers(character),
            proficiencies: {
                skills: Object.fromEntries(Object.keys(engine.skills).map((skill) => [skill, getSkillRank(character, skill)])),
                savingThrows: ABILITIES.filter((ability) => hasProficiency(character, 'savingThrow', ability)),
                weapons: mergeList(character.proficiencies?.weapons, 'weapon'),
                armor: mergeList(character.proficiencies?.armor, 'armor'),
                tools: mergeList(character.proficiencies?.tools, 'tool'),
                languages: mergeList(character.proficiencies?.languages, 'language')
            }
        };
    }

    const OFFICIAL_5E_2014 = {
        paladin: {
            fightingStyles: {
                defense: createFeature({
                    id: 'fighting-style-defense', name: 'Defense', type: 'class', level: 2,
                    modifiers: [createFeatureModifier({ id: 'defense-ac', target: 'armorClass', mode: 'add', value: 1, condition: { type: 'wearingArmor' } })]
                }),
                dueling: createFeature({
                    id: 'fighting-style-dueling', name: 'Dueling', type: 'class', level: 2,
                    mechanics: { damageBonus: 2, condition: { type: 'oneHandedMeleeWeapon', otherHandFree: true } }
                }),
                protection: createFeature({
                    id: 'fighting-style-protection', name: 'Protection', type: 'class', level: 2,
                    actions: [{ type: 'reaction', requires: ['shield'], effect: 'imposeDisadvantageOnAttackAgainstNearbyAlly' }]
                }),
                greatWeaponFighting: createFeature({
                    id: 'fighting-style-great-weapon-fighting', name: 'Great Weapon Fighting', type: 'class', level: 2,
                    mechanics: { rerollDamageDice: [1, 2], requires: ['twoHanded', 'versatileTwoHanded'] }
                })
            },
            coreFeatures: {
                divineSense: createFeature({
                    id: 'divine-sense', name: 'Divine Sense', type: 'class', level: 1,
                    resources: [createFeatureResource({ id: 'divine-sense', name: 'Divine Sense', recovery: 'longRest', formula: '1 + charismaModifier' })],
                    actions: [{ type: 'action' }]
                }),
                layOnHands: createFeature({
                    id: 'lay-on-hands', name: 'Lay on Hands', type: 'class', level: 1,
                    resources: [createFeatureResource({ id: 'lay-on-hands', name: 'Lay on Hands', recovery: 'longRest', formula: '5 * paladinLevel' })],
                    actions: [{ type: 'action' }],
                    mechanics: { healingPool: '5 * paladinLevel', cureCost: 5 }
                }),
                divineSmite: createFeature({
                    id: 'divine-smite', name: 'Divine Smite', type: 'class', level: 2,
                    actions: [{ type: 'onHit' }],
                    mechanics: { requires: ['meleeWeaponHit', 'spellSlot'], damage: { diceBySlot: { 1: '2d8', 2: '3d8', 3: '4d8', 4: '5d8', 5: '5d8' }, type: 'radiant', undeadOrFiendExtraDie: true } }
                }),
                divineHealth: createFeature({
                    id: 'divine-health', name: 'Divine Health', type: 'class', level: 3,
                    modifiers: [createFeatureModifier({ id: 'disease-immunity', target: 'conditionImmunity', mode: 'add', value: 'disease' })]
                }),
                extraAttack: createFeature({ id: 'extra-attack', name: 'Extra Attack', type: 'class', level: 5, mechanics: { attacksPerAttackAction: 2 } }),
                auraOfProtection: createFeature({
                    id: 'aura-of-protection', name: 'Aura of Protection', type: 'class', level: 6,
                    modifiers: [createFeatureModifier({ id: 'aura-save', target: 'savingThrow', mode: 'add', value: 'charismaModifier', condition: { type: 'conscious', rangeFeet: 10 } })]
                }),
                auraOfCourage: createFeature({
                    id: 'aura-of-courage', name: 'Aura of Courage', type: 'class', level: 10,
                    modifiers: [createFeatureModifier({ id: 'fear-immunity', target: 'conditionImmunity', mode: 'add', value: 'frightened', condition: { type: 'conscious', rangeFeet: 10 } })]
                }),
                improvedDivineSmite: createFeature({
                    id: 'improved-divine-smite', name: 'Improved Divine Smite', type: 'class', level: 11,
                    mechanics: { extraMeleeWeaponDamage: { dice: '1d8', type: 'radiant' } }
                }),
                cleansingTouch: createFeature({
                    id: 'cleansing-touch', name: 'Cleansing Touch', type: 'class', level: 14,
                    resources: [createFeatureResource({ id: 'cleansing-touch', name: 'Cleansing Touch', recovery: 'longRest', formula: 'max(1, charismaModifier)' })],
                    actions: [{ type: 'action' }]
                })
            }
        }
    };

    engine.createProficiency = createProficiency;
    engine.createFeature = createFeature;
    engine.createFeatureChoice = createFeatureChoice;
    engine.createFeatureResource = createFeatureResource;
    engine.createFeatureModifier = createFeatureModifier;
    engine.proficiencyTypes = [...PROFICIENCY_TYPES];
    engine.featureTypes = [...FEATURE_TYPES];
    engine.actionTypes = [...ACTION_TYPES];
    engine.getCharacterFeatures = getCharacterFeatures;
    engine.getFeatureProficiencies = getFeatureProficiencies;
    engine.getFeatureModifiers = getFeatureModifiers;
    engine.getApplicableFeatureModifiers = getApplicableFeatureModifiers;
    engine.getFeatureResources = getFeatureResources;
    engine.getFeatureActions = getFeatureActions;
    engine.hasProficiency = hasProficiency;
    engine.getSkillRank = getSkillRank;
    engine.official5e2014 = OFFICIAL_5E_2014;

    engine.calculator.getSkillModifier = getSkillModifier;
    engine.calculator.getSavingThrowModifier = getSavingThrowModifier;
    engine.calculator.getArmorClass = getArmorClass;
    engine.calculator.getSpeed = getSpeed;
    engine.calculator.getInitiative = getInitiative;
    engine.calculator.getSpellAttackBonus = getSpellAttackBonus;
    engine.calculator.getSpellSaveDC = getSpellSaveDC;
    engine.calculator.getWeaponAttackBonus = getWeaponAttackBonus;
    engine.calculator.getWeaponDamage = getWeaponDamage;
    engine.calculator.getDerivedData = getDerivedData;
})();
