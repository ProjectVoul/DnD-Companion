/*
 * D&D Companion — Character Engine
 * Ruleset: D&D 5e 2014
 *
 * Foundation for the interconnected character model.
 * This module remains independent from the existing UI/app.js.
 */

(() => {
    'use strict';

    const CHARACTER_ENGINE_VERSION = 4;
    const STORAGE_KEY = 'dndCompanionCharacterEngine';

    const ABILITIES = [
        'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'
    ];

    const SKILLS = {
        athletics: 'strength', acrobatics: 'dexterity', sleightOfHand: 'dexterity',
        stealth: 'dexterity', arcana: 'intelligence', history: 'intelligence',
        investigation: 'intelligence', nature: 'intelligence', religion: 'intelligence',
        animalHandling: 'wisdom', insight: 'wisdom', medicine: 'wisdom',
        perception: 'wisdom', survival: 'wisdom', deception: 'charisma',
        intimidation: 'charisma', performance: 'charisma', persuasion: 'charisma'
    };

    const DAMAGE_TYPES = [
        'acid', 'bludgeoning', 'cold', 'fire', 'force', 'lightning', 'necrotic',
        'piercing', 'poison', 'psychic', 'radiant', 'slashing', 'thunder'
    ];

    const EQUIPMENT_TYPES = ['weapon', 'armor', 'shield', 'focus', 'accessory', 'other'];
    const EFFECT_TRACKING_MODES = ['manual', 'reminder', 'automatic'];
    const DURATION_TYPES = ['instant', 'rounds', 'minutes', 'hours', 'days', 'until-rest', 'until-turn', 'until-event', 'permanent'];
    const REST_TYPES = ['short', 'long'];
    const MODIFIER_MODES = ['add', 'subtract', 'multiply', 'set'];
    const EFFECT_TARGETS = [
        ...ABILITIES, 'armorClass', 'speed', 'initiative', 'carryingCapacity',
        'hitPointMaximum', 'spellAttackBonus', 'spellSaveDC',
        'damageResistance', 'damageImmunity', 'damageVulnerability', 'condition'
    ];

    const DEFAULT_CHARACTER = {
        schemaVersion: CHARACTER_ENGINE_VERSION,
        ruleset: '5e-2014',
        identity: {
            name: '', race: '', class: '', subclass: '', level: 1,
            background: '', alignment: '', size: 'Medium', appearance: ''
        },
        abilityScores: {
            strength: 10, dexterity: 10, constitution: 10,
            intelligence: 10, wisdom: 10, charisma: 10
        },
        proficiencies: {
            skills: {}, savingThrows: [], weapons: [], armor: [], tools: [], languages: []
        },
        spellcasting: { ability: null },
        defenses: { resistances: [], immunities: [], vulnerabilities: [] },
        resources: {
            hp: { maximum: 1, current: 1, temporary: 0 },
            hitDice: { current: 1, maximum: 1, die: 'd8' },
            deathSaves: { successes: 0, failures: 0 },
            inspiration: false, abilityUses: {}, spellSlots: {}
        },
        items: [],
        abilities: [],
        spells: [],
        activeEffects: []
    };

    const clone = (value) => JSON.parse(JSON.stringify(value));

    function mergeDefaults(defaultValue, savedValue) {
        if (Array.isArray(defaultValue)) {
            return Array.isArray(savedValue) ? savedValue : clone(defaultValue);
        }
        if (defaultValue && typeof defaultValue === 'object') {
            const result = {};
            const source = savedValue && typeof savedValue === 'object' && !Array.isArray(savedValue)
                ? savedValue
                : {};
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

    function migrateCharacter(saved) {
        const source = saved && typeof saved === 'object' ? clone(saved) : {};

        // v3 accidentally used "abilities" twice in the default object.
        // Preserve an old ability-score object if one exists, while keeping
        // the actual feature/ability list under the separate "abilities" key.
        if (!source.abilityScores) {
            if (source.abilities && !Array.isArray(source.abilities) && typeof source.abilities === 'object') {
                source.abilityScores = source.abilities;
                source.abilities = [];
            } else {
                source.abilityScores = {};
            }
        }

        source.schemaVersion = CHARACTER_ENGINE_VERSION;
        return source;
    }

    function createCharacter(overrides = {}) {
        return mergeDefaults(DEFAULT_CHARACTER, migrateCharacter(overrides));
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
        normalized.schemaVersion = CHARACTER_ENGINE_VERSION;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        return normalized;
    }

    function createItem(overrides = {}) {
        return mergeDefaults({
            id: '', name: '', description: '', quantity: 1, weight: 0, tags: [],
            inventorySection: 'miscellaneous',
            equipment: { type: null, equipped: false },
            mechanics: {}, modifiers: [], effects: [], grants: { abilities: [] }
        }, overrides);
    }

    function createWeaponMechanics(overrides = {}) {
        return mergeDefaults({
            type: 'weapon',
            attack: { type: 'melee', ability: null, proficient: true, bonus: 0 },
            damage: [], properties: []
        }, overrides);
    }

    function createArmorMechanics(overrides = {}) {
        return mergeDefaults({
            type: 'armor', category: 'light', armorClass: 10,
            dexterity: { applies: true, maximum: null },
            strengthRequirement: 0, stealthDisadvantage: false
        }, overrides);
    }

    function createShieldMechanics(overrides = {}) {
        return mergeDefaults({ type: 'shield', armorBonus: 2 }, overrides);
    }

    function createDamageComponent(overrides = {}) {
        return mergeDefaults({
            dice: { count: 0, die: null }, type: 'slashing', ability: null, modifier: 0, source: null
        }, overrides);
    }

    function createModifier(overrides = {}) {
        return mergeDefaults({ id: '', source: null, target: '', mode: 'add', value: 0, condition: null }, overrides);
    }

    function createDuration(overrides = {}) {
        return mergeDefaults({ type: 'instant', value: null, unit: null }, overrides);
    }

    function createEffect(overrides = {}) {
        return mergeDefaults({
            id: '', source: null, target: '', mode: 'add', value: 0, condition: null,
            duration: createDuration(), tracking: { mode: 'manual', reminderIntervalMinutes: 5 }, active: true
        }, overrides);
    }

    function abilityModifier(score) {
        return Math.floor(((Number(score) || 0) - 10) / 2);
    }

    function proficiencyBonus(level) {
        const numericLevel = Math.max(1, Number(level) || 1);
        return 2 + Math.floor((numericLevel - 1) / 4);
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
        (character.activeEffects || []).filter((effect) => effect?.active !== false).forEach((effect) => {
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
        const amount = Number(modifier.value) || 0;
        switch (modifier.mode) {
            case 'subtract': return value - amount;
            case 'multiply': return value * amount;
            case 'set': return amount;
            case 'add':
            default: return value + amount;
        }
    }

    function applyTargetModifiers(baseValue, character, target) {
        return getTargetModifiers(character, target).reduce(applyModifier, baseValue);
    }

    function getEffectiveAbilityScore(character, ability) {
        const base = Number(character.abilityScores?.[ability]) || 0;
        return applyTargetModifiers(base, character, ability);
    }

    function getAbilityModifier(character, ability) {
        return abilityModifier(getEffectiveAbilityScore(character, ability));
    }

    function getSkillModifier(character, skill) {
        const ability = SKILLS[skill];
        if (!ability) return 0;
        const skillData = character.proficiencies?.skills?.[skill] || {};
        const base = getAbilityModifier(character, ability);
        const proficiency = skillData.proficiency ? proficiencyBonus(character.identity.level) : 0;
        const expertise = skillData.expertise ? proficiencyBonus(character.identity.level) : 0;
        return base + proficiency + expertise;
    }

    function getSavingThrowModifier(character, ability) {
        const base = getAbilityModifier(character, ability);
        const proficient = (character.proficiencies?.savingThrows || []).includes(ability);
        return base + (proficient ? proficiencyBonus(character.identity.level) : 0);
    }

    function getCarryingCapacity(character) {
        return getEffectiveAbilityScore(character, 'strength') * 15;
    }

    function getCarriedWeight(character) {
        return (character.items || []).reduce((total, item) => total + ((Number(item.quantity) || 0) * (Number(item.weight) || 0)), 0);
    }

    function getEquippedArmor(character) {
        return (character.items || []).find((item) => item?.equipment?.equipped && item?.mechanics?.type === 'armor') || null;
    }

    function getEquippedShield(character) {
        return (character.items || []).find((item) => item?.equipment?.equipped && item?.mechanics?.type === 'shield') || null;
    }

    function getArmorClass(character) {
        const armor = getEquippedArmor(character);
        const shield = getEquippedShield(character);
        const dex = getAbilityModifier(character, 'dexterity');
        let base;

        if (!armor) {
            base = 10 + dex;
        } else {
            const mechanics = armor.mechanics || {};
            const armorBase = Number(mechanics.armorClass) || 10;
            const category = mechanics.category || 'light';
            if (category === 'heavy') base = armorBase;
            else if (category === 'medium') base = armorBase + Math.min(dex, Number(mechanics.dexterity?.maximum ?? 2));
            else base = armorBase + dex;
        }

        if (shield) base += Number(shield.mechanics?.armorBonus) || 0;
        return applyTargetModifiers(base, character, 'armorClass');
    }

    function getSpeed(character) {
        let speed = Number(character.baseSpeed);
        if (!Number.isFinite(speed)) speed = 30;
        const armor = getEquippedArmor(character);
        const requirement = Number(armor?.mechanics?.strengthRequirement) || 0;
        if (requirement > 0 && getEffectiveAbilityScore(character, 'strength') < requirement) speed -= 10;
        return applyTargetModifiers(speed, character, 'speed');
    }

    function getInitiative(character) {
        return applyTargetModifiers(getAbilityModifier(character, 'dexterity'), character, 'initiative');
    }

    function getSpellcastingAbility(character) {
        return character.spellcasting?.ability || null;
    }

    function getSpellAttackBonus(character) {
        const ability = getSpellcastingAbility(character);
        if (!ability || character.abilityScores?.[ability] === undefined) return null;
        const base = getAbilityModifier(character, ability) + proficiencyBonus(character.identity.level);
        return applyTargetModifiers(base, character, 'spellAttackBonus');
    }

    function getSpellSaveDC(character) {
        const ability = getSpellcastingAbility(character);
        if (!ability || character.abilityScores?.[ability] === undefined) return null;
        const base = 8 + getAbilityModifier(character, ability) + proficiencyBonus(character.identity.level);
        return applyTargetModifiers(base, character, 'spellSaveDC');
    }

    function getPassiveSkill(character, skill) {
        return 10 + getSkillModifier(character, skill);
    }

    function getWeaponAbility(character, item) {
        const mechanics = item?.mechanics || {};
        const attack = mechanics.attack || {};
        const properties = mechanics.properties || [];

        if (properties.includes('finesse')) {
            const configured = attack.ability || character.weaponChoices?.[item.id];
            return configured === 'strength' || configured === 'dexterity' ? configured : null;
        }

        if (ABILITIES.includes(attack.ability)) return attack.ability;
        return attack.type === 'ranged' ? 'dexterity' : 'strength';
    }

    function getWeaponAttackBonus(character, item) {
        if (!item || item.mechanics?.type !== 'weapon') return null;
        const ability = getWeaponAbility(character, item);
        if (!ability) return null;
        const abilityBonus = getAbilityModifier(character, ability);
        const proficient = item.mechanics?.attack?.proficient === true;
        const proficiency = proficient ? proficiencyBonus(character.identity.level) : 0;
        const base = abilityBonus + proficiency + (Number(item.mechanics?.attack?.bonus) || 0);
        return applyTargetModifiers(base, character, 'weaponAttackBonus');
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
            modifier: (Number(damage.modifier) || 0) + (damage.ability == null ? abilityModifierValue : getAbilityModifier(character, damage.ability)),
            source: damage.source || { type: 'item', id: item.id }
        }));
    }

    function getDefenses(character) {
        const result = {
            resistances: [...(character.defenses?.resistances || [])],
            immunities: [...(character.defenses?.immunities || [])],
            vulnerabilities: [...(character.defenses?.vulnerabilities || [])],
            conditions: []
        };
        getAllModifiers(character).forEach((modifier) => {
            if (modifier.target === 'damageResistance' && modifier.value && !result.resistances.includes(modifier.value)) result.resistances.push(modifier.value);
            if (modifier.target === 'damageImmunity' && modifier.value && !result.immunities.includes(modifier.value)) result.immunities.push(modifier.value);
            if (modifier.target === 'damageVulnerability' && modifier.value && !result.vulnerabilities.includes(modifier.value)) result.vulnerabilities.push(modifier.value);
            if (modifier.target === 'condition' && modifier.value && !result.conditions.includes(modifier.value)) result.conditions.push(modifier.value);
        });
        return result;
    }

    function getDerivedData(character) {
        const abilityModifiers = {};
        const skills = {};
        const savingThrows = {};
        ABILITIES.forEach((ability) => {
            abilityModifiers[ability] = getAbilityModifier(character, ability);
            savingThrows[ability] = getSavingThrowModifier(character, ability);
        });
        Object.keys(SKILLS).forEach((skill) => { skills[skill] = getSkillModifier(character, skill); });

        return {
            abilityScores: Object.fromEntries(ABILITIES.map((ability) => [ability, getEffectiveAbilityScore(character, ability)])),
            abilityModifiers,
            proficiencyBonus: proficiencyBonus(character.identity.level),
            skills,
            savingThrows,
            passivePerception: getPassiveSkill(character, 'perception'),
            passiveInsight: getPassiveSkill(character, 'insight'),
            passiveInvestigation: getPassiveSkill(character, 'investigation'),
            armorClass: getArmorClass(character),
            speed: getSpeed(character),
            initiative: getInitiative(character),
            carryingCapacity: getCarryingCapacity(character),
            carriedWeight: getCarriedWeight(character),
            spellAttackBonus: getSpellAttackBonus(character),
            spellSaveDC: getSpellSaveDC(character),
            defenses: getDefenses(character)
        };
    }

    const CharacterCalculator = {
        getAbilityModifier,
        getProficiencyBonus: proficiencyBonus,
        getEffectiveAbilityScore,
        getSkillModifier,
        getSavingThrowModifier,
        getCarryingCapacity,
        getCarriedWeight,
        getEquippedArmor,
        getEquippedShield,
        getArmorClass,
        getSpeed,
        getInitiative,
        getSpellcastingAbility,
        getSpellAttackBonus,
        getSpellSaveDC,
        getWeaponAbility,
        getWeaponAttackBonus,
        getWeaponDamage,
        getDefenses,
        getDerivedData,
        getAllModifiers,
        getTargetModifiers
    };

    const CharacterEngine = {
        version: CHARACTER_ENGINE_VERSION,
        storageKey: STORAGE_KEY,
        defaults: clone(DEFAULT_CHARACTER),
        abilities: [...ABILITIES],
        skills: clone(SKILLS),
        damageTypes: [...DAMAGE_TYPES],
        equipmentTypes: [...EQUIPMENT_TYPES],
        modifierModes: [...MODIFIER_MODES],
        effectTargets: [...EFFECT_TARGETS],
        effectTrackingModes: [...EFFECT_TRACKING_MODES],
        durationTypes: [...DURATION_TYPES],
        restTypes: [...REST_TYPES],
        createCharacter,
        createItem,
        createWeaponMechanics,
        createArmorMechanics,
        createShieldMechanics,
        createDamageComponent,
        createModifier,
        createDuration,
        createEffect,
        loadCharacter,
        saveCharacter,
        calculator: CharacterCalculator
    };

    window.DnDCharacterEngine = CharacterEngine;
})();
