/*
 * D&D Companion — Character Engine foundation
 * Ruleset: D&D 5e 2014
 *
 * This module is intentionally independent from the existing UI/app.js.
 * It provides the first stable data model, persistence helpers and the
 * calculation primitives that later sections will consume.
 */

(() => {
    'use strict';

    const CHARACTER_ENGINE_VERSION = 1;
    const STORAGE_KEY = 'dndCompanionCharacterEngine';

    const DEFAULT_CHARACTER = {
        schemaVersion: CHARACTER_ENGINE_VERSION,
        ruleset: '5e-2014',

        identity: {
            name: '',
            race: '',
            class: '',
            subclass: '',
            level: 1,
            background: '',
            alignment: '',
            size: 'Medium',
            appearance: ''
        },

        abilities: {
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10
        },

        proficiencies: {
            skills: {},
            savingThrows: [],
            weapons: [],
            armor: [],
            tools: [],
            languages: []
        },

        spellcasting: {
            ability: null
        },

        defenses: {
            resistances: [],
            immunities: [],
            vulnerabilities: []
        },

        resources: {
            hp: {
                maximum: 1,
                current: 1,
                temporary: 0
            },
            hitDice: {
                current: 1,
                maximum: 1,
                die: 'd8'
            },
            deathSaves: {
                successes: 0,
                failures: 0
            },
            inspiration: false,
            abilityUses: {},
            spellSlots: {}
        },

        items: [],
        abilities: [],
        spells: [],
        activeEffects: []
    };

    const SKILLS = {
        athletics: 'strength',
        acrobatics: 'dexterity',
        sleightOfHand: 'dexterity',
        stealth: 'dexterity',
        arcana: 'intelligence',
        history: 'intelligence',
        investigation: 'intelligence',
        nature: 'intelligence',
        religion: 'intelligence',
        animalHandling: 'wisdom',
        insight: 'wisdom',
        medicine: 'wisdom',
        perception: 'wisdom',
        survival: 'wisdom',
        deception: 'charisma',
        intimidation: 'charisma',
        performance: 'charisma',
        persuasion: 'charisma'
    };

    const DAMAGE_TYPES = [
        'acid', 'bludgeoning', 'cold', 'fire', 'force', 'lightning',
        'necrotic', 'piercing', 'poison', 'psychic', 'radiant',
        'slashing', 'thunder'
    ];

    const EQUIPMENT_TYPES = [
        'weapon', 'armor', 'shield', 'focus', 'accessory', 'other'
    ];

    const clone = (value) => JSON.parse(JSON.stringify(value));

    function mergeDefaults(defaultValue, savedValue) {
        if (Array.isArray(defaultValue)) {
            return Array.isArray(savedValue) ? savedValue : clone(defaultValue);
        }

        if (defaultValue && typeof defaultValue === 'object') {
            const result = {};
            const source = savedValue && typeof savedValue === 'object' ? savedValue : {};

            Object.keys(defaultValue).forEach((key) => {
                result[key] = mergeDefaults(defaultValue[key], source[key]);
            });

            Object.keys(source).forEach((key) => {
                if (!(key in result)) result[key] = source[key];
            });

            return result;
        }

        return savedValue === undefined ? defaultValue : savedValue;
    }

    function createCharacter(overrides = {}) {
        return mergeDefaults(DEFAULT_CHARACTER, overrides);
    }

    function loadCharacter() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return createCharacter();
            return createCharacter(JSON.parse(raw));
        } catch (error) {
            console.error('Character Engine: failed to load character', error);
            return createCharacter();
        }
    }

    function saveCharacter(character) {
        const normalized = createCharacter(character);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        return normalized;
    }

    function abilityModifier(score) {
        const numericScore = Number(score) || 0;
        return Math.floor((numericScore - 10) / 2);
    }

    function proficiencyBonus(level) {
        const numericLevel = Math.max(1, Number(level) || 1);
        return 2 + Math.floor((numericLevel - 1) / 4);
    }

    function getSkillDefinition(skill) {
        return SKILLS[skill] || null;
    }

    function getSkillModifier(character, skill) {
        const ability = getSkillDefinition(skill);
        if (!ability) return 0;

        const skillData = character.proficiencies.skills?.[skill] || {};
        const base = abilityModifier(character.abilities[ability]);
        const proficiency = skillData.proficiency ? proficiencyBonus(character.identity.level) : 0;
        const expertise = skillData.expertise ? proficiencyBonus(character.identity.level) : 0;

        return base + proficiency + expertise;
    }

    function getSavingThrowModifier(character, ability) {
        const base = abilityModifier(character.abilities[ability]);
        const proficient = character.proficiencies.savingThrows.includes(ability);
        return base + (proficient ? proficiencyBonus(character.identity.level) : 0);
    }

    function getCarryingCapacity(character) {
        return (Number(character.abilities.strength) || 0) * 15;
    }

    function getCarriedWeight(character) {
        return (character.items || []).reduce((total, item) => {
            const quantity = Number(item.quantity) || 0;
            const weight = Number(item.weight) || 0;
            return total + (quantity * weight);
        }, 0);
    }

    function getSpellcastingAbility(character) {
        return character.spellcasting?.ability || null;
    }

    function getSpellAttackBonus(character) {
        const ability = getSpellcastingAbility(character);
        if (!ability || character.abilities[ability] === undefined) return null;
        return abilityModifier(character.abilities[ability]) + proficiencyBonus(character.identity.level);
    }

    function getSpellSaveDC(character) {
        const attack = getSpellAttackBonus(character);
        return attack === null ? null : 8 + attack;
    }

    function getPassiveSkill(character, skill) {
        return 10 + getSkillModifier(character, skill);
    }

    function getDerivedData(character) {
        const abilityModifiers = {};
        Object.keys(character.abilities).forEach((ability) => {
            abilityModifiers[ability] = abilityModifier(character.abilities[ability]);
        });

        const skills = {};
        Object.keys(SKILLS).forEach((skill) => {
            skills[skill] = getSkillModifier(character, skill);
        });

        const savingThrows = {};
        Object.keys(character.abilities).forEach((ability) => {
            savingThrows[ability] = getSavingThrowModifier(character, ability);
        });

        return {
            abilityModifiers,
            proficiencyBonus: proficiencyBonus(character.identity.level),
            skills,
            savingThrows,
            passivePerception: getPassiveSkill(character, 'perception'),
            passiveInsight: getPassiveSkill(character, 'insight'),
            passiveInvestigation: getPassiveSkill(character, 'investigation'),
            carryingCapacity: getCarryingCapacity(character),
            carriedWeight: getCarriedWeight(character),
            spellAttackBonus: getSpellAttackBonus(character),
            spellSaveDC: getSpellSaveDC(character)
        };
    }

    const CharacterCalculator = {
        getAbilityModifier: abilityModifier,
        getProficiencyBonus: proficiencyBonus,
        getSkillModifier,
        getSavingThrowModifier,
        getCarryingCapacity,
        getCarriedWeight,
        getSpellAttackBonus,
        getSpellSaveDC,
        getDerivedData
    };

    const CharacterEngine = {
        version: CHARACTER_ENGINE_VERSION,
        storageKey: STORAGE_KEY,
        defaults: clone(DEFAULT_CHARACTER),
        skills: clone(SKILLS),
        damageTypes: [...DAMAGE_TYPES],
        equipmentTypes: [...EQUIPMENT_TYPES],
        createCharacter,
        loadCharacter,
        saveCharacter,
        calculator: CharacterCalculator
    };

    window.DnDCharacterEngine = CharacterEngine;
})();
