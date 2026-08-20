/*
 * D&D Companion — Character Features & Proficiencies
 * Ruleset: D&D 5e 2014
 *
 * Features are data, not hard-coded calculator exceptions.
 * A feature may grant proficiencies, resources, choices, modifiers,
 * actions or other mechanics. The calculator consumes these definitions.
 */

(() => {
    'use strict';

    const engine = window.DnDCharacterEngine;
    if (!engine) {
        console.error('Character Features: Character Engine is not loaded.');
        return;
    }

    const ABILITIES = engine.abilities;

    const PROFICIENCY_TYPES = [
        'skill',
        'savingThrow',
        'weapon',
        'armor',
        'tool',
        'language'
    ];

    const FEATURE_TYPES = [
        'class',
        'subclass',
        'race',
        'background',
        'feat',
        'other'
    ];

    const ACTION_TYPES = [
        'action',
        'bonusAction',
        'reaction',
        'free',
        'passive',
        'onHit',
        'onDamage',
        'onSave',
        'triggered'
    ];

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function createProficiency(overrides = {}) {
        return {
            type: null,
            value: null,
            rank: 'proficient',
            source: null,
            ...clone(overrides)
        };
    }

    function createFeature(overrides = {}) {
        return {
            id: '',
            name: '',
            type: 'other',
            source: null,
            level: 1,
            active: true,
            description: '',
            prerequisites: [],
            choices: [],
            proficiencies: [],
            modifiers: [],
            grants: {
                features: [],
                spells: [],
                abilities: []
            },
            resources: [],
            actions: [],
            mechanics: {},
            ...clone(overrides)
        };
    }

    function createFeatureChoice(overrides = {}) {
        return {
            id: '',
            label: '',
            type: 'single',
            options: [],
            selected: null,
            required: true,
            ...clone(overrides)
        };
    }

    function createFeatureResource(overrides = {}) {
        return {
            id: '',
            name: '',
            current: 0,
            maximum: 0,
            recovery: 'longRest',
            formula: null,
            ...clone(overrides)
        };
    }

    function createFeatureModifier(overrides = {}) {
        return {
            id: '',
            source: null,
            target: '',
            mode: 'add',
            value: 0,
            condition: null,
            ...clone(overrides)
        };
    }

    function featureIsActive(feature, character) {
        if (!feature || feature.active === false) return false;
        const requiredLevel = Number(feature.level) || 1;
        if ((Number(character.identity?.level) || 1) < requiredLevel) return false;
        return true;
    }

    function getCharacterFeatures(character) {
        return (character.features || character.abilities || [])
            .filter((feature) => featureIsActive(feature, character));
    }

    function getFeatureProficiencies(character) {
        const result = [];

        (character.proficiencies?.skills || {}).forEach?.(() => {});

        getCharacterFeatures(character).forEach((feature) => {
            (feature.proficiencies || []).forEach((proficiency) => {
                if (!PROFICIENCY_TYPES.includes(proficiency.type)) return;
                result.push({
                    ...createProficiency(proficiency),
                    source: proficiency.source || {
                        type: 'feature',
                        id: feature.id,
                        name: feature.name
                    }
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
        if (type === 'savingThrow') return (character.proficiencies?.savingThrows || []).includes(value)
            || getFeatureProficiencies(character).some((entry) => entry.type === type && entry.value === value);
        if (type === 'weapon') return (character.proficiencies?.weapons || []).includes(value)
            || getFeatureProficiencies(character).some((entry) => entry.type === type && entry.value === value);
        if (type === 'armor') return (character.proficiencies?.armor || []).includes(value)
            || getFeatureProficiencies(character).some((entry) => entry.type === type && entry.value === value);
        if (type === 'tool') return (character.proficiencies?.tools || []).includes(value)
            || getFeatureProficiencies(character).some((entry) => entry.type === type && entry.value === value);
        if (type === 'language') return (character.proficiencies?.languages || []).includes(value)
            || getFeatureProficiencies(character).some((entry) => entry.type === type && entry.value === value);
        return false;
    }

    function getFeatureModifiers(character) {
        const modifiers = [];

        getCharacterFeatures(character).forEach((feature) => {
            (feature.modifiers || []).forEach((modifier) => {
                modifiers.push({
                    ...createFeatureModifier(modifier),
                    source: modifier.source || {
                        type: 'feature',
                        id: feature.id,
                        name: feature.name
                    },
                    sourceName: modifier.sourceName || feature.name
                });
            });
        });

        return modifiers;
    }

    function getFeatureResources(character) {
        const resources = [];
        getCharacterFeatures(character).forEach((feature) => {
            (feature.resources || []).forEach((resource) => {
                resources.push({
                    ...createFeatureResource(resource),
                    source: resource.source || {
                        type: 'feature',
                        id: feature.id,
                        name: feature.name
                    }
                });
            });
        });
        return resources;
    }

    function getFeatureActions(character) {
        const actions = [];
        getCharacterFeatures(character).forEach((feature) => {
            (feature.actions || []).forEach((action) => {
                const normalized = typeof action === 'string' ? { type: action } : { ...action };
                if (!ACTION_TYPES.includes(normalized.type)) return;
                actions.push({
                    ...normalized,
                    source: normalized.source || {
                        type: 'feature',
                        id: feature.id,
                        name: feature.name
                    }
                });
            });
        });
        return actions;
    }

    function withFeatureEffects(character) {
        const derived = clone(character);
        derived.activeEffects = [
            ...(derived.activeEffects || []),
            ...getFeatureModifiers(character).map((modifier) => ({
                id: modifier.id,
                name: modifier.sourceName,
                source: modifier.source,
                target: modifier.target,
                mode: modifier.mode,
                value: modifier.value,
                condition: modifier.condition,
                active: true
            }))
        ];
        return derived;
    }

    function getSavingThrowModifier(character, ability) {
        const base = engine.calculator.getAbilityModifier(character, ability);
        const proficient = hasProficiency(character, 'savingThrow', ability);
        return base + (proficient ? engine.calculator.getProficiencyBonus(character.identity.level) : 0);
    }

    function getSkillModifier(character, skill) {
        const ability = engine.skills[skill];
        if (!ability) return 0;
        const base = engine.calculator.getAbilityModifier(character, ability);
        const rank = getSkillRank(character, skill);
        if (rank === 'expertise') return base + engine.calculator.getProficiencyBonus(character.identity.level) * 2;
        if (rank === 'proficient') return base + engine.calculator.getProficiencyBonus(character.identity.level);
        return base;
    }

    function getWeaponAttackBonus(character, item) {
        const derivedCharacter = withFeatureEffects(character);
        return engine.calculator.getWeaponAttackBonus(derivedCharacter, item);
    }

    function getWeaponDamage(character, item) {
        const derivedCharacter = withFeatureEffects(character);
        return engine.calculator.getWeaponDamage(derivedCharacter, item);
    }

    function getArmorClass(character) {
        return engine.calculator.getArmorClass(withFeatureEffects(character));
    }

    function getSpeed(character) {
        return engine.calculator.getSpeed(withFeatureEffects(character));
    }

    function getInitiative(character) {
        return engine.calculator.getInitiative(withFeatureEffects(character));
    }

    function getSpellAttackBonus(character) {
        return engine.calculator.getSpellAttackBonus(withFeatureEffects(character));
    }

    function getSpellSaveDC(character) {
        return engine.calculator.getSpellSaveDC(withFeatureEffects(character));
    }

    function getDerivedData(character) {
        const derivedCharacter = withFeatureEffects(character);
        const base = engine.calculator.getDerivedData(derivedCharacter);

        const skills = {};
        Object.keys(engine.skills).forEach((skill) => {
            skills[skill] = getSkillModifier(character, skill);
        });

        const savingThrows = {};
        ABILITIES.forEach((ability) => {
            savingThrows[ability] = getSavingThrowModifier(character, ability);
        });

        return {
            ...base,
            skills,
            savingThrows,
            armorClass: getArmorClass(character),
            speed: getSpeed(character),
            initiative: getInitiative(character),
            spellAttackBonus: getSpellAttackBonus(character),
            spellSaveDC: getSpellSaveDC(character),
            features: getCharacterFeatures(character),
            featureResources: getFeatureResources(character),
            featureActions: getFeatureActions(character),
            featureModifiers: getFeatureModifiers(character),
            proficiencies: {
                skills: Object.fromEntries(Object.keys(engine.skills).map((skill) => [skill, getSkillRank(character, skill)])),
                savingThrows: ABILITIES.filter((ability) => hasProficiency(character, 'savingThrow', ability)),
                weapons: [...new Set([...(character.proficiencies?.weapons || []), ...getFeatureProficiencies(character).filter((p) => p.type === 'weapon').map((p) => p.value)])],
                armor: [...new Set([...(character.proficiencies?.armor || []), ...getFeatureProficiencies(character).filter((p) => p.type === 'armor').map((p) => p.value)])],
                tools: [...new Set([...(character.proficiencies?.tools || []), ...getFeatureProficiencies(character).filter((p) => p.type === 'tool').map((p) => p.value)])],
                languages: [...new Set([...(character.proficiencies?.languages || []), ...getFeatureProficiencies(character).filter((p) => p.type === 'language').map((p) => p.value)])]
            }
        };
    }

    // Generic rules representation. These are definitions, not special cases
    // inside the calculator. They can be selected/attached to a character.
    const OFFICIAL_5E_2014 = {
        paladin: {
            fightingStyles: {
                defense: createFeature({
                    id: 'fighting-style-defense',
                    name: 'Defense',
                    type: 'class',
                    source: { class: 'paladin', level: 2 },
                    level: 2,
                    modifiers: [createFeatureModifier({
                        id: 'defense-ac', target: 'armorClass', mode: 'add', value: 1,
                        condition: { type: 'wearingArmor' }
                    })]
                }),
                dueling: createFeature({
                    id: 'fighting-style-dueling',
                    name: 'Dueling',
                    type: 'class',
                    source: { class: 'paladin', level: 2 },
                    level: 2,
                    mechanics: { damageBonus: 2, condition: { type: 'oneHandedMeleeWeapon', otherHandFree: true } }
                }),
                protection: createFeature({
                    id: 'fighting-style-protection',
                    name: 'Protection',
                    type: 'class',
                    source: { class: 'paladin', level: 2 },
                    level: 2,
                    actions: [{ type: 'reaction', requires: ['shield'], effect: 'imposeDisadvantageOnAttackAgainstNearbyAlly' }]
                }),
                greatWeaponFighting: createFeature({
                    id: 'fighting-style-great-weapon-fighting',
                    name: 'Great Weapon Fighting',
                    type: 'class',
                    source: { class: 'paladin', level: 2 },
                    level: 2,
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
                    resources: [],
                    actions: [{ type: 'onHit' }],
                    mechanics: { requires: ['meleeWeaponHit', 'spellSlot'], damage: { diceBySlot: { 1: '2d8', 2: '3d8', 3: '4d8', 4: '5d8', 5: '5d8' }, type: 'radiant', undeadOrFiendExtraDie: true } }
                }),
                divineHealth: createFeature({
                    id: 'divine-health', name: 'Divine Health', type: 'class', level: 3,
                    modifiers: [createFeatureModifier({ id: 'disease-immunity', target: 'conditionImmunity', mode: 'add', value: 'disease' })]
                }),
                extraAttack: createFeature({
                    id: 'extra-attack', name: 'Extra Attack', type: 'class', level: 5,
                    mechanics: { attacksPerAttackAction: 2 }
                }),
                auraOfProtection: createFeature({
                    id: 'aura-of-protection', name: 'Aura of Protection', type: 'class', level: 6,
                    modifiers: [createFeatureModifier({
                        id: 'aura-of-protection-save', target: 'savingThrow', mode: 'add', value: 'charismaModifier',
                        condition: { type: 'conscious', rangeFeet: 10 }
                    })]
                }),
                auraOfCourage: createFeature({
                    id: 'aura-of-courage', name: 'Aura of Courage', type: 'class', level: 10,
                    modifiers: [createFeatureModifier({
                        id: 'fear-immunity', target: 'conditionImmunity', mode: 'add', value: 'frightened',
                        condition: { type: 'conscious', rangeFeet: 10 }
                    })]
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
    engine.getFeatureResources = getFeatureResources;
    engine.getFeatureActions = getFeatureActions;
    engine.hasProficiency = hasProficiency;
    engine.getSkillRank = getSkillRank;
    engine.official5e2014 = OFFICIAL_5E_2014;

    // Replace only the derived methods that depend on feature/proficiency data.
    // The underlying calculator remains the single source of truth for formulas.
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
