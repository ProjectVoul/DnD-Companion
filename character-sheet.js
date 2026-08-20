/*
 * D&D Companion — Character Sheet
 * Ruleset: D&D 5e 2014
 *
 * Presentation layer only: reads/writes character base data and asks
 * CharacterCalculator for derived values. It does not duplicate rules.
 */
(() => {
    'use strict';

    const engine = window.DnDCharacterEngine;
    if (!engine) {
        console.error('Character Sheet: Character Engine is unavailable.');
        return;
    }

    const ABILITIES = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    const ABILITY_LABELS = {
        strength: 'STR', dexterity: 'DEX', constitution: 'CON',
        intelligence: 'INT', wisdom: 'WIS', charisma: 'CHA'
    };
    const SKILL_LABELS = {
        athletics: 'Athletics', acrobatics: 'Acrobatics', sleightOfHand: 'Sleight of Hand',
        stealth: 'Stealth', arcana: 'Arcana', history: 'History', investigation: 'Investigation',
        nature: 'Nature', religion: 'Religion', animalHandling: 'Animal Handling', insight: 'Insight',
        medicine: 'Medicine', perception: 'Perception', survival: 'Survival', deception: 'Deception',
        intimidation: 'Intimidation', performance: 'Performance', persuasion: 'Persuasion'
    };
    const SKILL_ABILITY = engine.skills;

    function esc(value) {
        return String(value ?? '').replace(/[&<>'"]/g, char => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
        }[char]));
    }

    function signed(value) {
        const n = Number(value) || 0;
        return n >= 0 ? `+${n}` : `${n}`;
    }

    function mod(value) {
        const n = Number(value) || 0;
        return n >= 0 ? `+${n}` : `${n}`;
    }

    function currentCharacter() {
        return engine.getLiveCharacter ? engine.getLiveCharacter() : engine.loadCharacter();
    }

    function save(character) {
        engine.saveCharacter(character);
    }

    function liveItems(character) {
        if (Array.isArray(character.items) && character.items.length) return character.items;
        if (Array.isArray(window.inventoryItems)) return window.inventoryItems;
        return [];
    }

    function render() {
        const app = document.getElementById('app');
        if (!app) return;

        const character = currentCharacter();
        const derived = engine.getLiveDerivedData
            ? engine.getLiveDerivedData()
            : engine.calculator.getDerivedData(character);
        const items = liveItems(character);
        const equipped = items.filter(item => item?.equipment?.equipped || item?.equipped);
        const hpCurrent = Number(window.currentHP);
        const hpMaximum = Number(window.maximumHP);
        const currentHP = Number.isFinite(hpCurrent) ? hpCurrent : Number(character.resources?.hp?.current) || 0;
        const maximumHP = Number.isFinite(hpMaximum) ? hpMaximum : Number(character.resources?.hp?.maximum) || 0;
        const hitDice = character.resources?.hitDice || { current: 0, maximum: 0, die: 'd8' };
        const death = character.resources?.deathSaves || { successes: 0, failures: 0 };
        const defenses = derived.defenses || { resistances: [], immunities: [], vulnerabilities: [], conditions: [] };

        app.innerHTML = `
            <header class="character-sheet-header">
                <button class="back-button" type="button" onclick="showCharacterHome()">← Character</button>
                <div>
                    <h1>Character Sheet</h1>
                    <p>5e 2014 · live derived values</p>
                </div>
            </header>

            <main class="character-sheet">
                <section class="sheet-column sheet-left">
                    <div class="sheet-card sheet-identity">
                        <h2>Identity</h2>
                        <div class="sheet-form-grid">
                            ${textField('Name', 'identity.name', character.identity.name, 'sheet-name')}
                            ${textField('Race', 'identity.race', character.identity.race)}
                            ${textField('Class', 'identity.class', character.identity.class)}
                            ${textField('Subclass', 'identity.subclass', character.identity.subclass)}
                            ${numberField('Level', 'identity.level', character.identity.level, 1, 20)}
                            ${textField('Background', 'identity.background', character.identity.background)}
                            ${textField('Alignment', 'identity.alignment', character.identity.alignment)}
                            ${textField('Size', 'identity.size', character.identity.size)}
                        </div>
                    </div>

                    <div class="sheet-card">
                        <h2>Ability Scores</h2>
                        <div class="ability-score-grid">
                            ${ABILITIES.map(ability => `
                                <label class="ability-score">
                                    <span>${ABILITY_LABELS[ability]}</span>
                                    <input type="number" min="1" max="30" data-ability="${ability}" value="${Number(character.abilityScores?.[ability]) || 10}">
                                    <strong id="sheet-mod-${ability}">${mod(derived.abilityModifiers[ability])}</strong>
                                </label>
                            `).join('')}
                        </div>
                    </div>

                    <div class="sheet-card">
                        <h2>Saving Throws</h2>
                        <div class="proficiency-list">
                            ${ABILITIES.map(ability => `
                                <label class="proficiency-row">
                                    <input type="checkbox" data-save-proficiency="${ability}" ${character.proficiencies?.savingThrows?.includes(ability) ? 'checked' : ''}>
                                    <span>${ABILITY_LABELS[ability]}</span>
                                    <strong>${signed(derived.savingThrows[ability])}</strong>
                                </label>
                            `).join('')}
                        </div>
                    </div>

                    <div class="sheet-card">
                        <h2>Skills</h2>
                        <div class="proficiency-list">
                            ${Object.keys(SKILL_LABELS).map(skill => {
                                const data = character.proficiencies?.skills?.[skill] || {};
                                return `
                                    <label class="skill-row">
                                        <span class="skill-checks">
                                            <input type="checkbox" data-skill-proficiency="${skill}" ${data.proficiency ? 'checked' : ''} title="Proficient">
                                            <input type="checkbox" data-skill-expertise="${skill}" ${data.expertise ? 'checked' : ''} title="Expertise">
                                        </span>
                                        <span>${SKILL_LABELS[skill]} <small>${ABILITY_LABELS[SKILL_ABILITY[skill]] || ''}</small></span>
                                        <strong>${signed(derived.skills[skill])}</strong>
                                    </label>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </section>

                <section class="sheet-column sheet-center">
                    <div class="sheet-card sheet-core">
                        <div class="sheet-big-stat"><span>HP</span><strong>${currentHP} / ${maximumHP}</strong></div>
                        <div class="sheet-stat-pair"><span>Temporary HP</span><strong>${Number(character.resources?.hp?.temporary) || 0}</strong></div>
                        <div class="sheet-stat-pair"><span>Hit Dice</span><strong>${hitDice.current} / ${hitDice.maximum} ${esc(hitDice.die || '')}</strong></div>
                        <div class="sheet-stat-pair"><span>Speed</span><strong>${derived.speed} ft.</strong></div>
                        <div class="sheet-stat-pair"><span>Initiative</span><strong>${signed(derived.initiative)}</strong></div>
                        <div class="sheet-stat-pair"><span>Passive Perception</span><strong>${derived.passivePerception}</strong></div>
                        <div class="sheet-stat-pair"><span>Passive Insight</span><strong>${derived.passiveInsight}</strong></div>
                        <div class="sheet-stat-pair"><span>Passive Investigation</span><strong>${derived.passiveInvestigation}</strong></div>
                        <div class="sheet-stat-pair"><span>Death Saves</span><strong>${death.successes} / ${death.failures}</strong></div>
                        <div class="sheet-stat-pair"><span>Proficiency Bonus</span><strong>${signed(derived.proficiencyBonus)}</strong></div>
                    </div>

                    <div class="sheet-card">
                        <h2>Defenses</h2>
                        <div class="sheet-detail"><span>Resistances</span><strong>${formatList(defenses.resistances)}</strong></div>
                        <div class="sheet-detail"><span>Immunities</span><strong>${formatList(defenses.immunities)}</strong></div>
                        <div class="sheet-detail"><span>Vulnerabilities</span><strong>${formatList(defenses.vulnerabilities)}</strong></div>
                    </div>

                    <div class="sheet-card">
                        <h2>Spellcasting</h2>
                        <div class="sheet-detail"><span>Ability</span><strong>${esc(character.spellcasting?.ability || '—')}</strong></div>
                        <div class="sheet-detail"><span>Spell Attack</span><strong>${derived.spellAttackBonus == null ? '—' : signed(derived.spellAttackBonus)}</strong></div>
                        <div class="sheet-detail"><span>Save DC</span><strong>${derived.spellSaveDC == null ? '—' : derived.spellSaveDC}</strong></div>
                    </div>
                </section>

                <section class="sheet-column sheet-right">
                    <div class="sheet-card sheet-combat">
                        <h2>Combat</h2>
                        <div class="combat-primary">
                            <div><span>AC</span><strong>${derived.armorClass}</strong></div>
                            <div><span>Speed</span><strong>${derived.speed}</strong></div>
                            <div><span>Initiative</span><strong>${signed(derived.initiative)}</strong></div>
                        </div>
                        <div class="sheet-detail"><span>Carrying Capacity</span><strong>${derived.carryingCapacity} lb</strong></div>
                        <div class="sheet-detail"><span>Carried Weight</span><strong>${derived.carriedWeight} lb</strong></div>
                    </div>

                    <div class="sheet-card">
                        <div class="sheet-card-heading">
                            <h2>Attacks & Equipment</h2>
                            <button type="button" class="sheet-link-button" onclick="openSection('inventory')">Inventory →</button>
                        </div>
                        ${equipped.length ? equipped.map(item => weaponSummary(character, item)).join('') : '<p class="sheet-empty">No equipped items.</p>'}
                    </div>

                    <div class="sheet-card">
                        <h2>Resources</h2>
                        <div class="sheet-detail"><span>Inspiration</span><strong>${character.resources?.inspiration ? 'Yes' : 'No'}</strong></div>
                        <div class="sheet-detail"><span>Hit Dice</span><strong>${hitDice.current} / ${hitDice.maximum}</strong></div>
                    </div>

                    <div class="sheet-card">
                        <h2>Equipment Summary</h2>
                        <div class="sheet-detail"><span>Armor</span><strong>${itemName(engine.calculator.getEquippedArmor(character))}</strong></div>
                        <div class="sheet-detail"><span>Shield</span><strong>${itemName(engine.calculator.getEquippedShield(character))}</strong></div>
                    </div>
                </section>
            </main>
        `;

        bindInputs();
    }

    function textField(label, path, value, extraClass = '') {
        return `<label class="sheet-field ${extraClass}"><span>${label}</span><input type="text" data-character-field="${path}" value="${esc(value)}"></label>`;
    }

    function numberField(label, path, value, min, max) {
        return `<label class="sheet-field"><span>${label}</span><input type="number" data-character-field="${path}" value="${Number(value) || 1}" min="${min}" max="${max}"></label>`;
    }

    function formatList(list) {
        return list?.length ? list.map(esc).join(', ') : '—';
    }

    function itemName(item) {
        return item?.name ? esc(item.name) : '—';
    }

    function weaponSummary(character, item) {
        if (item?.mechanics?.type !== 'weapon') {
            return `<div class="equipped-item"><strong>${esc(item.name || 'Item')}</strong><small>${esc(item.mechanics?.type || item.category || 'Equipment')}</small></div>`;
        }
        const attack = engine.calculator.getWeaponAttackBonus(character, item);
        const damage = engine.calculator.getWeaponDamage(character, item);
        const damageText = damage.length
            ? damage.map(part => `${part.dice?.count || 0}${part.dice?.die || ''} ${part.type || ''} ${signed(part.modifier)}`).join(' + ')
            : '—';
        return `<div class="equipped-item"><div><strong>${esc(item.name || 'Weapon')}</strong><small>${esc(item.mechanics.attack?.type || 'attack')}</small></div><div class="equipped-item-values"><span>Attack ${attack == null ? '—' : signed(attack)}</span><span>${esc(damageText)}</span></div></div>`;
    }

    function setNested(target, path, value) {
        const parts = path.split('.');
        let cursor = target;
        parts.slice(0, -1).forEach(part => {
            if (!cursor[part] || typeof cursor[part] !== 'object') cursor[part] = {};
            cursor = cursor[part];
        });
        cursor[parts[parts.length - 1]] = value;
    }

    function bindInputs() {
        document.querySelectorAll('[data-character-field]').forEach(input => {
            input.addEventListener('input', () => {
                const character = currentCharacter();
                let value = input.value;
                if (input.type === 'number') value = Number(value);
                setNested(character, input.dataset.characterField, value);
                save(character);
                render();
                focusField(input.dataset.characterField);
            });
        });

        document.querySelectorAll('[data-ability]').forEach(input => {
            input.addEventListener('input', () => {
                const character = currentCharacter();
                character.abilityScores[input.dataset.ability] = Number(input.value) || 0;
                save(character);
                render();
                focusAbility(input.dataset.ability);
            });
        });

        document.querySelectorAll('[data-save-proficiency]').forEach(input => {
            input.addEventListener('change', () => {
                const character = currentCharacter();
                const ability = input.dataset.saveProficiency;
                const saves = new Set(character.proficiencies?.savingThrows || []);
                input.checked ? saves.add(ability) : saves.delete(ability);
                character.proficiencies.savingThrows = [...saves];
                save(character);
                render();
            });
        });

        document.querySelectorAll('[data-skill-proficiency]').forEach(input => {
            input.addEventListener('change', () => updateSkillFlag(input.dataset.skillProficiency, 'proficiency', input.checked));
        });
        document.querySelectorAll('[data-skill-expertise]').forEach(input => {
            input.addEventListener('change', () => updateSkillFlag(input.dataset.skillExpertise, 'expertise', input.checked));
        });
    }

    function updateSkillFlag(skill, flag, value) {
        const character = currentCharacter();
        character.proficiencies.skills[skill] = character.proficiencies.skills[skill] || {};
        character.proficiencies.skills[skill][flag] = value;
        // Expertise in 5e presupposes proficiency; enforce that data invariant.
        if (flag === 'expertise' && value) character.proficiencies.skills[skill].proficiency = true;
        save(character);
        render();
    }

    function focusField(path) {
        const input = document.querySelector(`[data-character-field="${CSS.escape(path)}"]`);
        if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
    }

    function focusAbility(ability) {
        const input = document.querySelector(`[data-ability="${CSS.escape(ability)}"]`);
        if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
    }

    window.showCharacterSheet = render;
    window.showCharacterHome = () => window.location.reload();

    window.addEventListener('DOMContentLoaded', () => {
        const heading = document.querySelector('.character-summary h1');
        if (heading) {
            heading.classList.add('character-sheet-link');
            heading.setAttribute('role', 'button');
            heading.setAttribute('tabindex', '0');
            heading.setAttribute('title', 'Open Character Sheet');
            heading.addEventListener('click', render);
            heading.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    render();
                }
            });
        }
    });
})();
