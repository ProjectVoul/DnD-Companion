/* D&D Companion — Character Sheet / Inventory Repair Layer v5
 * Ruleset: D&D 5e 2014
 * Loaded last on repair/stability. This layer deliberately patches the
 * presentation/legacy bridge without replacing the existing engine or rest logic.
 */
(() => {
    'use strict';

    const engine = window.DnDCharacterEngine;
    if (!engine) return;

    const esc = value => String(value ?? '').replace(/[&<>\'\"]/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[char]));
    const sign = value => {
        const n = Number(value) || 0;
        return n >= 0 ? `+${n}` : `${n}`;
    };
    const cap = value => String(value || '').replace(/\b\w/g, x => x.toUpperCase());
    const abilityLabels = { strength: 'STR', dexterity: 'DEX', constitution: 'CON', intelligence: 'INT', wisdom: 'WIS', charisma: 'CHA' };
    const alignments = [
        'Lawful Good', 'Neutral Good', 'Chaotic Good',
        'Lawful Neutral', 'Neutral', 'Chaotic Neutral',
        'Lawful Evil', 'Neutral Evil', 'Chaotic Evil', 'Unaligned'
    ];

    function character() {
        const c = engine.getLiveCharacter ? engine.getLiveCharacter() : engine.loadCharacter();
        if (engine.syncCharacterRules) engine.syncCharacterRules(c);
        return c;
    }

    function inventory() {
        return (typeof inventoryItems !== 'undefined' && Array.isArray(inventoryItems)) ? inventoryItems : [];
    }

    function tagType(item) {
        const tags = item?.tags || [];
        if (tags.includes('Armor')) return 'armor';
        if (tags.includes('Weapon')) return 'weapon';
        if (tags.includes('Shield')) return 'shield';
        if (tags.includes('Focus')) return 'focus';
        return item?.mechanics?.type || item?.equipment?.type || null;
    }

    function numberFromProperty(item, regex) {
        for (const property of item?.properties || []) {
            const match = String(property).match(regex);
            if (match) return Number(match[1]);
        }
        return null;
    }

    function normalizeName(item) {
        return String(item?.name || '').trim().toLowerCase();
    }

    function ensureItemMechanics(item) {
        if (!item || typeof item !== 'object') return item;
        item.equipment = item.equipment || {};
        const type = tagType(item);
        if (type) item.equipment.type = type;
        if (item.equipped !== undefined) item.equipment.equipped = Boolean(item.equipped);
        if (item.equipment.equipped !== undefined) item.equipped = Boolean(item.equipment.equipped);

        const name = normalizeName(item);
        if (type === 'armor') {
            const existing = item.mechanics?.type === 'armor' ? item.mechanics : {};
            const known = {
                'padded armor': [11, 'light', 0],
                'leather armor': [11, 'light', 0],
                'studded leather': [12, 'light', 0],
                'hide armor': [12, 'medium', 0],
                'chain shirt': [13, 'medium', 0],
                'scale mail': [14, 'medium', 0],
                'breastplate': [14, 'medium', 0],
                'half plate': [15, 'medium', 0],
                'ring mail': [14, 'heavy', 0],
                'chain mail': [16, 'heavy', 13],
                'splint armor': [17, 'heavy', 15],
                'plate armor': [18, 'heavy', 15]
            };
            const defaults = known[name] || [10, 'light', 0];
            item.mechanics = engine.createArmorMechanics({
                ...existing,
                category: existing.category || defaults[1],
                armorClass: Number(existing.armorClass) || defaults[0],
                strengthRequirement: Number(existing.strengthRequirement) || defaults[2]
            });
            const bonus = numberFromProperty(item, /^\s*\+\s*(\d+)\s*AC\s*$/i);
            if (bonus !== null && !item.modifiers?.some(m => m.id === `repair-v5-armor-ac-${item.id || name}`)) {
                item.modifiers = [...(item.modifiers || []), {
                    id: `repair-v5-armor-ac-${item.id || name}`,
                    target: 'armorClass', mode: 'add', value: bonus,
                    sourceName: item.name
                }];
            }
        }

        if (type === 'shield') {
            const existing = item.mechanics?.type === 'shield' ? item.mechanics : {};
            const bonus = Number(existing.armorBonus) || numberFromProperty(item, /^\s*\+\s*(\d+)\s*AC\s*$/i) || 2;
            item.mechanics = engine.createShieldMechanics({ ...existing, armorBonus: bonus });
        }

        if (type === 'weapon') {
            const existing = item.mechanics?.type === 'weapon' ? item.mechanics : {};
            const isSword = name.includes('sword') || name.includes('longsword');
            const damage = Array.isArray(existing.damage) && existing.damage.length
                ? existing.damage
                : [{ dice: { count: 1, die: isSword ? 'd8' : 'd8' }, type: 'slashing', ability: 'strength', modifier: 0 }];
            item.mechanics = engine.createWeaponMechanics({
                ...existing,
                type: 'weapon',
                attack: {
                    type: existing.attack?.type || 'melee',
                    ability: existing.attack?.ability || 'strength',
                    proficient: existing.attack?.proficient !== false,
                    bonus: Number(existing.attack?.bonus) || 0
                },
                damage,
                properties: existing.properties || (isSword ? ['versatile'] : [])
            });
            item.proficiency = item.proficiency || { type: 'martial' };
            item.proficiency.type = item.proficiency.type || 'martial';
            item.mechanics.proficiency = item.mechanics.proficiency || { type: item.proficiency.type };
        }

        return item;
    }

    function ensureAllMechanics() {
        let changed = false;
        inventory().forEach(item => {
            const before = JSON.stringify(item.mechanics || null) + JSON.stringify(item.modifiers || []) + JSON.stringify(item.proficiency || null);
            ensureItemMechanics(item);
            const after = JSON.stringify(item.mechanics || null) + JSON.stringify(item.modifiers || []) + JSON.stringify(item.proficiency || null);
            if (before !== after) changed = true;
        });
        if (changed && typeof saveInventory === 'function') saveInventory();
        return changed;
    }

    function applySkillRank(skill, rank) {
        const c = character();
        c.proficiencies = c.proficiencies || {};
        c.proficiencies.skills = c.proficiencies.skills || {};
        const current = c.proficiencies.skills[skill] || {};
        if (rank === 'expertise') {
            c.proficiencies.skills[skill] = { ...current, proficiency: true, expertise: !current.expertise };
        } else {
            const proficient = !current.proficiency;
            c.proficiencies.skills[skill] = { ...current, proficiency: proficient, expertise: proficient ? Boolean(current.expertise) : false };
        }
        if (!c.proficiencies.skills[skill].proficiency && !c.proficiencies.skills[skill].expertise) {
            delete c.proficiencies.skills[skill];
        }
        engine.saveCharacter(c);
        repairSheet();
    }

    function findCard(title) {
        return [...document.querySelectorAll('.sheet-card')].find(card => {
            const heading = card.querySelector('h2');
            return heading && heading.textContent.trim().toLowerCase() === title.toLowerCase();
        }) || null;
    }

    function renderSkills() {
        const card = findCard('Skills');
        if (!card || card.dataset.repairV5 === 'skills') return;
        const c = character();
        const d = engine.getLiveDerivedData ? engine.getLiveDerivedData() : engine.calculator.getDerivedData(c);
        const skills = {
            athletics: ['Athletics', 'strength'], acrobatics: ['Acrobatics', 'dexterity'], sleightOfHand: ['Sleight of Hand', 'dexterity'],
            stealth: ['Stealth', 'dexterity'], arcana: ['Arcana', 'intelligence'], history: ['History', 'intelligence'], investigation: ['Investigation', 'intelligence'],
            nature: ['Nature', 'intelligence'], religion: ['Religion', 'intelligence'], animalHandling: ['Animal Handling', 'wisdom'], insight: ['Insight', 'wisdom'],
            medicine: ['Medicine', 'wisdom'], perception: ['Perception', 'wisdom'], survival: ['Survival', 'wisdom'], deception: ['Deception', 'charisma'],
            intimidation: ['Intimidation', 'charisma'], performance: ['Performance', 'charisma'], persuasion: ['Persuasion', 'charisma']
        };
        const rows = Object.entries(skills).map(([id, [label, ability]]) => {
            const state = c.proficiencies?.skills?.[id] || {};
            const mod = d.skills?.[id] ?? engine.calculator.getSkillModifier(c, id);
            return `<div class="skill-row repair-skill-row"><span class="skill-checks"><button type="button" class="repair-skill-check ${state.proficiency ? 'active' : ''}" data-skill="${id}" data-rank="proficiency" title="Proficiency">${state.proficiency ? '✓' : ''}</button><button type="button" class="repair-skill-check ${state.expertise ? 'active mastery' : ''}" data-skill="${id}" data-rank="expertise" title="Expertise / Mastery">${state.expertise ? '★' : ''}</button></span><span>${label} <small>${abilityLabels[ability]}</small></span><strong>${sign(mod)}</strong></div>`;
        }).join('');
        card.innerHTML = `<h2>Skills</h2><small class="sheet-help">✓ = proficiency · ★ = expertise / mastery</small><div class="proficiency-list">${rows}</div>`;
        card.dataset.repairV5 = 'skills';
        card.querySelectorAll('[data-skill]').forEach(button => {
            button.addEventListener('click', event => {
                event.preventDefault(); event.stopPropagation();
                applySkillRank(button.dataset.skill, button.dataset.rank);
            });
        });
    }

    function renderAlignment() {
        const card = findCard('Identity & Rules');
        if (!card) return;
        const input = card.querySelector('[data-field="identity.alignment"]');
        if (!input || input.dataset.repairV5 === 'alignment') return;
        const select = document.createElement('select');
        select.className = input.className;
        select.dataset.select = 'identity.alignment';
        select.innerHTML = alignments.map(value => `<option value="${esc(value)}">${esc(value)}</option>`).join('');
        select.value = character().identity?.alignment || 'Neutral';
        input.replaceWith(select);
        select.addEventListener('change', () => {
            const c = character(); c.identity.alignment = select.value; engine.saveCharacter(c);
        });
        select.dataset.repairV5 = 'alignment';
    }

    function renderSpellcasting() {
        const card = findCard('Spellcasting');
        if (!card || card.dataset.repairV5 === 'spellcasting') return;
        const c = character();
        const limit = c.identity?.class === 'Paladin' ? Math.max(1, engine.calculator.getAbilityModifier(c, 'charisma') + Math.floor((Number(c.identity.level) || 1) / 2)) : null;
        let prepared = [];
        try { prepared = JSON.parse(localStorage.getItem('preparedSpells') || '[]'); } catch (_) {}
        if (!Array.isArray(prepared)) prepared = [];
        if (!prepared.length && c.identity?.class === 'Paladin') prepared = ['Bless', 'Command', 'Shield of Faith', 'Aid', 'Lesser Restoration'];
        const container = card.querySelector('.prepared-spells');
        if (!container) return;
        const pills = prepared.map(name => `<span class="prepared-spell-pill">${esc(name)}</span>`).join('');
        container.innerHTML = `<div class="sheet-subheading"><strong>Prepared Spells</strong><small>${limit ? `${prepared.length} / ${limit} prepared` : `${prepared.length} prepared`}</small></div>${prepared.length ? `<div class="prepared-spell-list">${pills}</div>` : '<p class="sheet-empty">No prepared spells saved yet.</p>'}`;
        card.dataset.repairV5 = 'spellcasting';
    }

    function renderCombat() {
        const card = findCard('Equipment & Attacks');
        if (!card || card.dataset.repairV5 === 'combat') return;
        ensureAllMechanics();
        const c = character();
        const d = engine.getLiveDerivedData ? engine.getLiveDerivedData() : engine.calculator.getDerivedData(c);
        const armor = engine.calculator.getEquippedArmor(c);
        const shield = engine.calculator.getEquippedShield(c);
        const equippedWeapons = (c.items || []).filter(item => item?.equipment?.equipped && item?.mechanics?.type === 'weapon');
        const modifierBonus = item => (item?.modifiers || []).filter(m => m.target === 'armorClass').reduce((sum, m) => sum + (m.mode === 'subtract' ? -Number(m.value || 0) : Number(m.value || 0)), 0);
        let html = `<div class="sheet-card-heading"><div><h2>Equipment & Attacks</h2><small class="sheet-help">Combat values are calculated from equipped items and character proficiencies.</small></div><button class="sheet-link-button" type="button" onclick="openSection('inventory')">Inventory →</button></div>`;
        if (armor) html += `<div class="combat-equipment-row"><span>Armor</span><div><strong>${esc(armor.name)}</strong><small>${Number(armor.mechanics?.armorClass) || 10} AC base${modifierBonus(armor) ? ` ${sign(modifierBonus(armor))} magic` : ''} · ${cap(armor.mechanics?.category || 'light')}</small></div></div>`;
        else html += `<div class="combat-equipment-row"><span>Armor</span><div><strong>Unarmored</strong><small>10 + DEX</small></div></div>`;
        if (shield) html += `<div class="combat-equipment-row"><span>Shield</span><div><strong>${esc(shield.name)}</strong><small>${sign(shield.mechanics?.armorBonus || 0)} AC</small></div></div>`;
        if (!equippedWeapons.length) html += `<p class="sheet-empty">No equipped weapons.</p>`;
        equippedWeapons.forEach(item => {
            const attack = engine.calculator.getWeaponAttackBonus(c, item);
            const damage = engine.calculator.getWeaponDamage(c, item) || [];
            const prof = engine.resolveWeaponProficiency ? engine.resolveWeaponProficiency(c, item) : { proficient: item.proficiency?.type ? true : false, category: item.proficiency?.type };
            const damageText = damage.map(component => `${Number(component.dice?.count) || 0}${component.dice?.die || ''} ${component.type || ''}${component.modifier ? ` ${sign(component.modifier)}` : ''}`).join(' + ') || 'Damage not configured';
            html += `<div class="weapon-entry repair-weapon-entry"><div><strong>${esc(item.name)}</strong><small>${esc(item.mechanics?.attack?.type || 'melee')} · ${prof.proficient ? `Proficient (${esc(prof.category || 'class')})` : 'Not proficient'}</small></div><div class="equipped-item-values"><b>Attack ${attack == null ? '—' : sign(attack)}</b><span>${esc(damageText)}</span></div></div>`;
        });
        html += `<div class="combat-total-line"><span>Calculated AC</span><strong>${d.armorClass}</strong></div>`;
        card.innerHTML = html;
        card.dataset.repairV5 = 'combat';
    }

    function renderFeatures() {
        const card = findCard('Class & Character Features');
        if (!card || card.dataset.repairV5 === 'features') return;
        const c = character();
        const features = engine.getCharacterFeatures ? engine.getCharacterFeatures(c) : (c.features || []);
        const names = []; const seen = new Set();
        features.forEach(feature => { const name = String(feature?.name || '').trim(); if (name && !seen.has(name)) { seen.add(name); names.push(name); } });
        card.innerHTML = `<div class="sheet-card-heading"><div><h2>Abilities</h2><small class="sheet-help">Class, subclass, racial traits and feats.</small></div><button class="sheet-link-button" type="button" onclick="openSection('abilities')">Abilities →</button></div>${names.length ? `<div class="feature-name-list">${names.map(name => `<div class="feature-name-row">${esc(name)}</div>`).join('')}</div>` : '<p class="sheet-empty">No linked abilities yet.</p>'}`;
        card.dataset.repairV5 = 'features';
    }

    function renderInspiration() {
        const card = findCard('Resources');
        if (!card || card.dataset.repairV5 === 'resources') return;
        const c = character(); const inspired = Boolean(c.resources?.inspiration);
        card.innerHTML = `<div class="sheet-card-heading"><div><h2>Resources</h2><small class="sheet-help">Manual character resource control.</small></div></div><div class="inspiration-control"><span>Inspiration</span><button type="button" class="sheet-resource-toggle ${inspired ? 'active' : ''}" id="repair-inspiration-toggle">${inspired ? 'YES' : 'NO'}</button></div>`;
        card.dataset.repairV5 = 'resources';
        card.querySelector('#repair-inspiration-toggle').addEventListener('click', () => { const next = character(); next.resources.inspiration = !Boolean(next.resources.inspiration); engine.saveCharacter(next); renderInspiration(); });
    }

    function repairSheet() {
        const app = document.getElementById('app');
        if (!app || !app.querySelector('.character-sheet')) return;
        ensureAllMechanics(); renderSkills(); renderAlignment(); renderSpellcasting(); renderCombat(); renderFeatures(); renderInspiration();
    }

    function renderInventoryMechanics(item) {
        if (!item) return;
        ensureItemMechanics(item);
        const details = document.querySelector('.inventory-details');
        if (!details || details.querySelector('[data-repair-v5-mechanics]')) return;
        const type = item.mechanics?.type;
        if (!type) return;
        const block = document.createElement('div'); block.dataset.repairV5Mechanics = 'true';
        let content = '';
        if (type === 'armor') {
            const bonus = (item.modifiers || []).filter(m => m.target === 'armorClass').reduce((sum, m) => sum + Number(m.value || 0), 0);
            content = `<div class="inventory-mechanics-row"><span>Armor Class</span><strong>${Number(item.mechanics.armorClass) || 10}${bonus ? ` ${sign(bonus)} magic` : ''}</strong></div><div class="inventory-mechanics-row"><span>Category</span><strong>${cap(item.mechanics.category)}</strong></div><div class="inventory-mechanics-row"><span>Strength</span><strong>${Number(item.mechanics.strengthRequirement) ? `${item.mechanics.strengthRequirement} required` : '—'}</strong></div><div class="inventory-mechanics-row"><span>Stealth</span><strong>${item.mechanics.stealthDisadvantage ? 'Disadvantage' : 'Normal'}</strong></div>`;
        } else if (type === 'shield') {
            content = `<div class="inventory-mechanics-row"><span>Armor Bonus</span><strong>${sign(item.mechanics.armorBonus || 0)} AC</strong></div>`;
        } else if (type === 'weapon') {
            const c = character(); const attack = engine.calculator.getWeaponAttackBonus(c, item); const damage = engine.calculator.getWeaponDamage(c, item) || [];
            const prof = engine.resolveWeaponProficiency ? engine.resolveWeaponProficiency(c, item) : { proficient: true, category: item.proficiency?.type };
            const damageText = damage.map(x => `${x.dice?.count || 0}${x.dice?.die || ''} ${x.type || ''}${x.modifier ? ` ${sign(x.modifier)}` : ''}`).join(' + ') || '—';
            content = `<div class="inventory-mechanics-row"><span>Attack</span><strong>${attack == null ? '—' : sign(attack)} · ${prof.proficient ? `Proficient (${esc(prof.category || 'class')})` : 'Not proficient'}</strong></div><div class="inventory-mechanics-row"><span>Damage</span><strong>${esc(damageText)}</strong></div><div class="inventory-mechanics-row"><span>Ability</span><strong>${abilityLabels[item.mechanics.attack?.ability] || cap(item.mechanics.attack?.ability || '—')}</strong></div><div class="inventory-mechanics-row"><span>Damage Type</span><strong>${esc(damage[0]?.type || '—')}</strong></div>`;
        }
        block.innerHTML = `<div class="inventory-details-properties"><h2>Rules / Mechanics</h2>${content}</div>`; details.appendChild(block);
    }

    function patchInventoryViews() {
        const originalShowItem = window.showInventoryItem;
        if (typeof originalShowItem === 'function' && !originalShowItem.__repairV5) {
            const wrapped = function (itemId) { ensureAllMechanics(); originalShowItem(itemId); renderInventoryMechanics(inventory().find(x => x.id === itemId)); };
            wrapped.__repairV5 = true; window.showInventoryItem = wrapped;
        }
        const originalShowSection = window.showInventorySection;
        if (typeof originalShowSection === 'function' && !originalShowSection.__repairV5) {
            const wrapped = function (section) { ensureAllMechanics(); originalShowSection(section); };
            wrapped.__repairV5 = true; window.showInventorySection = wrapped;
        }
    }

    function formTypeFromExisting(item) { return tagType(item) || 'none'; }

    function mechanicsFormHTML(item) {
        const mechanics = item?.mechanics || {}; const type = mechanics.type || formTypeFromExisting(item); const attack = mechanics.attack || {}; const damage = mechanics.damage?.[0] || {}; const dice = damage.dice || {};
        const armorBonus = (item?.modifiers || []).filter(m => m.target === 'armorClass').reduce((sum, m) => sum + Number(m.value || 0), 0);
        return `<div class="repair-mechanics-form" data-repair-v5-form-mechanics><strong>Rules / Mechanics</strong><small>These values drive the Character Sheet calculations.</small><label>Type<select id="repair-mechanics-type"><option value="none" ${type === 'none' ? 'selected' : ''}>None</option><option value="armor" ${type === 'armor' ? 'selected' : ''}>Armor</option><option value="weapon" ${type === 'weapon' ? 'selected' : ''}>Weapon</option><option value="shield" ${type === 'shield' ? 'selected' : ''}>Shield</option></select></label><div class="repair-mechanics-grid"><label>Base AC<input id="repair-armor-ac" type="number" min="0" value="${Number(mechanics.armorClass) || 10}"></label><label>Magic AC bonus<input id="repair-armor-bonus" type="number" value="${armorBonus}"></label><label>Armor category<select id="repair-armor-category"><option value="light">Light</option><option value="medium">Medium</option><option value="heavy">Heavy</option></select></label><label>STR requirement<input id="repair-armor-str" type="number" min="0" value="${Number(mechanics.strengthRequirement) || 0}"></label><label>Shield AC bonus<input id="repair-shield-bonus" type="number" value="${Number(mechanics.armorBonus) || 2}"></label><label>Attack ability<select id="repair-weapon-ability"><option value="strength">Strength</option><option value="dexterity">Dexterity</option><option value="charisma">Charisma</option></select></label><label>Proficiency<select id="repair-weapon-prof"><option value="simple">Simple</option><option value="martial">Martial</option></select></label><label>Attack bonus<input id="repair-weapon-attack" type="number" value="${Number(attack.bonus) || 0}"></label><label>Damage dice<input id="repair-weapon-dice-count" type="number" min="0" value="${Number(dice.count) || 1}"></label><label>Die<select id="repair-weapon-die"><option>d4</option><option>d6</option><option>d8</option><option>d10</option><option>d12</option></select></label><label>Damage type<select id="repair-weapon-damage-type">${['slashing','piercing','bludgeoning','acid','cold','fire','force','lightning','necrotic','poison','psychic','radiant','thunder'].map(t => `<option>${t}</option>`).join('')}</select></label></div><label class="repair-mechanics-check"><input id="repair-armor-stealth" type="checkbox" ${mechanics.stealthDisadvantage ? 'checked' : ''}> Stealth disadvantage</label></div>`;
    }

    function readValue(id) { return document.getElementById(id)?.value ?? ''; }

    function applyMechanicsForm(item) {
        const type = readValue('repair-mechanics-type'); if (!item || type === 'none') return;
        item.equipment = item.equipment || {}; item.equipment.type = type;
        if (type === 'armor') {
            item.mechanics = engine.createArmorMechanics({ ...(item.mechanics || {}), type: 'armor', category: readValue('repair-armor-category') || 'light', armorClass: Number(readValue('repair-armor-ac')) || 10, strengthRequirement: Number(readValue('repair-armor-str')) || 0, stealthDisadvantage: Boolean(document.getElementById('repair-armor-stealth')?.checked) });
            const bonus = Number(readValue('repair-armor-bonus')) || 0;
            item.modifiers = (item.modifiers || []).filter(m => m.id !== `repair-v5-armor-ac-${item.id || item.name}`);
            if (bonus) item.modifiers.push({ id: `repair-v5-armor-ac-${item.id || item.name}`, target: 'armorClass', mode: 'add', value: bonus, sourceName: item.name });
        }
        if (type === 'shield') item.mechanics = engine.createShieldMechanics({ ...(item.mechanics || {}), armorBonus: Number(readValue('repair-shield-bonus')) || 2 });
        if (type === 'weapon') {
            const ability = readValue('repair-weapon-ability') || 'strength'; const proficiency = readValue('repair-weapon-prof') || 'martial';
            item.proficiency = { ...(item.proficiency || {}), type: proficiency };
            item.mechanics = engine.createWeaponMechanics({ ...(item.mechanics || {}), type: 'weapon', attack: { ...(item.mechanics?.attack || {}), type: item.mechanics?.attack?.type || 'melee', ability, proficient: true, bonus: Number(readValue('repair-weapon-attack')) || 0 }, damage: [{ dice: { count: Number(readValue('repair-weapon-dice-count')) || 1, die: readValue('repair-weapon-die') || 'd8' }, type: readValue('repair-weapon-damage-type') || 'slashing', ability, modifier: 0 }], properties: item.mechanics?.properties || [] });
            item.mechanics.proficiency = { type: proficiency };
        }
    }

    function patchInventoryForm() {
        const originalOpen = window.openInventoryItemForm;
        if (typeof originalOpen === 'function' && !originalOpen.__repairV5) {
            const wrappedOpen = function (existingItem = null) {
                if (existingItem) ensureItemMechanics(existingItem);
                originalOpen(existingItem);
                const modal = document.querySelector('.inventory-form-modal');
                if (!modal || modal.querySelector('[data-repair-v5-form-mechanics]')) return;
                const magical = modal.querySelector('#inventory-form-magical')?.closest('label'); const holder = document.createElement('div'); holder.innerHTML = mechanicsFormHTML(existingItem || null); const block = holder.firstElementChild;
                if (magical) magical.parentNode.insertBefore(block, magical); else modal.appendChild(block);
                const armor = existingItem?.mechanics || {};
                const armorCategory = document.getElementById('repair-armor-category'); if (armorCategory) armorCategory.value = armor.category || (normalizeName(existingItem).includes('plate') ? 'heavy' : 'light');
                const weaponAbility = document.getElementById('repair-weapon-ability'); if (weaponAbility) weaponAbility.value = armor.attack?.ability || 'strength';
                const weaponProf = document.getElementById('repair-weapon-prof'); if (weaponProf) weaponProf.value = existingItem?.proficiency?.type || 'martial';
                const weaponDie = document.getElementById('repair-weapon-die'); if (weaponDie) weaponDie.value = armor.damage?.[0]?.dice?.die || 'd8';
                const damageType = document.getElementById('repair-weapon-damage-type'); if (damageType) damageType.value = armor.damage?.[0]?.type || 'slashing';
            };
            wrappedOpen.__repairV5 = true; window.openInventoryItemForm = wrappedOpen;
        }
        const originalSave = window.saveInventoryItemForm;
        if (typeof originalSave === 'function' && !originalSave.__repairV5) {
            const wrappedSave = function (existingId = '') {
                const name = document.querySelector('[id*="inventory-form-name"]')?.value?.trim() || '';
                originalSave(existingId);
                let item = existingId ? inventory().find(x => x.id === existingId) : null;
                if (!item && name) { const matches = inventory().filter(x => String(x.name || '').trim() === name); item = matches[matches.length - 1] || null; }
                if (item) { applyMechanicsForm(item); ensureItemMechanics(item); if (typeof saveInventory === 'function') saveInventory(); if (typeof showInventorySection === 'function') showInventorySection(item.location || 'miscellaneous'); }
            };
            wrappedSave.__repairV5 = true; window.saveInventoryItemForm = wrappedSave;
        }
    }

    function syncHome() {
        const entry = document.getElementById('character-entry'); if (!entry) return;
        const c = character(); ensureAllMechanics(); const d = engine.getLiveDerivedData ? engine.getLiveDerivedData() : engine.calculator.getDerivedData(c);
        const name = c.identity?.name || 'Your Character'; const race = c.identity?.race || '—'; const cls = c.identity?.class || '—'; const level = Number(c.identity?.level) || 1; const alignment = c.identity?.alignment || '—';
        const paragraphs = entry.querySelectorAll('.character-summary p'); if (paragraphs[0]) paragraphs[0].textContent = race === 'Draconide' ? 'Dragonborn' : race; if (paragraphs[1]) paragraphs[1].textContent = `${cls} · Level ${level}`; if (paragraphs[2]) paragraphs[2].textContent = alignment;
        const title = entry.querySelector('.character-summary h1'); if (title) title.textContent = name;
        const current = document.getElementById('current-hp'); const maximum = document.getElementById('maximum-hp'); if (current) current.textContent = c.resources?.hp?.current ?? d.hitPoints?.current ?? 0; if (maximum) maximum.textContent = c.resources?.hp?.maximum ?? d.hitPoints?.maximum ?? 0;
        const dice = document.getElementById('hit-dice-value'); if (dice) dice.textContent = `${c.resources?.hitDice?.current ?? 0} / ${c.resources?.hitDice?.maximum ?? 0}`;
        document.documentElement.dataset.dndInspiration = c.resources?.inspiration ? 'YES' : 'NO';
    }

    function patchHomeResources() {
        if (typeof window.changeHP === 'function' && !window.changeHP.__repairV5) {
            const wrapped = function (amount) { const c = character(); const max = Number(c.resources?.hp?.maximum) || 1; const next = Math.max(0, Math.min(max, Number(c.resources?.hp?.current || 0) + Number(amount || 0))); c.resources.hp.current = next; engine.saveCharacter(c); localStorage.setItem('currentHP', String(next)); syncHome(); };
            wrapped.__repairV5 = true; window.changeHP = wrapped;
        }
        if (typeof window.longRest === 'function' && !window.longRest.__repairV5) {
            const original = window.longRest;
            const wrapped = function () { original(); const c = character(); c.resources.hp.maximum = engine.getHitPointMaximum ? engine.getHitPointMaximum(c) : c.resources.hp.maximum; c.resources.hp.current = c.resources.hp.maximum; c.resources.hitDice.current = c.resources.hitDice.maximum; c.resources.deathSaves = { successes: 0, failures: 0 }; engine.saveCharacter(c); localStorage.setItem('currentHP', String(c.resources.hp.current)); syncHome(); };
            wrapped.__repairV5 = true; window.longRest = wrapped;
        }
    }

    function installSheetWrapper() {
        const original = window.showCharacterSheet;
        if (typeof original === 'function' && !original.__repairV5) {
            const wrapped = function () { ensureAllMechanics(); original(); repairSheet(); };
            wrapped.__repairV5 = true; window.showCharacterSheet = wrapped;
        }
    }

    function installObserver() {
        const app = document.getElementById('app'); if (!app || app.__repairV5Observer) return;
        const observer = new MutationObserver(() => { if (app.querySelector('.character-sheet')) requestAnimationFrame(() => repairSheet()); });
        observer.observe(app, { childList: true, subtree: true }); app.__repairV5Observer = observer;
    }

    function installStyles() {
        if (document.getElementById('repair-v5-style')) return;
        const style = document.createElement('style'); style.id = 'repair-v5-style'; style.textContent = `
            .repair-skill-row{min-height:38px}.repair-skill-check{width:24px;height:24px;border:1px solid var(--border);border-radius:50%;background:transparent;color:var(--text-muted);cursor:pointer;font:inherit}.repair-skill-check.active{background:var(--accent);border-color:var(--accent);color:#17130e}.repair-skill-check.mastery.active{background:var(--surface-light);color:var(--accent-light)}
            .repair-mechanics-form{margin:12px 0;padding:14px;background:var(--surface-light);border:1px solid var(--border);border-radius:12px;display:flex;flex-direction:column;gap:9px}.repair-mechanics-form>strong{font-size:13px}.repair-mechanics-form>small{color:var(--text-muted);font-size:10px}.repair-mechanics-form label{display:flex;flex-direction:column;gap:5px;color:var(--text-muted);font-size:10px}.repair-mechanics-form input,.repair-mechanics-form select{box-sizing:border-box;width:100%;padding:9px;background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:8px;font:inherit}.repair-mechanics-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.repair-mechanics-check{display:flex!important;flex-direction:row!important;align-items:center;gap:7px!important}.repair-mechanics-check input{width:auto}.combat-equipment-row{display:flex;justify-content:space-between;gap:14px;padding:11px 0;border-bottom:1px solid var(--border)}.combat-equipment-row>span{color:var(--text-muted);min-width:64px}.combat-equipment-row>div{display:flex;flex-direction:column;gap:3px;text-align:right}.combat-equipment-row small,.repair-weapon-entry small{color:var(--text-muted)}.combat-total-line{display:flex;justify-content:space-between;padding-top:13px;font-size:14px}.feature-name-list{display:flex;flex-direction:column;gap:7px}.feature-name-row{padding:10px 12px;background:var(--surface-light);border:1px solid var(--border);border-radius:9px;font-size:12px}.inspiration-control{display:flex;justify-content:space-between;align-items:center;padding-top:5px}.sheet-resource-toggle{min-width:70px;padding:8px 14px;border:1px solid var(--border);border-radius:999px;background:var(--surface-light);color:var(--text-muted);font:inherit;cursor:pointer}.sheet-resource-toggle.active{background:var(--accent);border-color:var(--accent);color:#17130e}.inventory-mechanics-row{display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px solid var(--border)}.inventory-mechanics-row span{color:var(--text-muted)}.inventory-mechanics-row strong{text-align:right}.prepared-spell-list{display:flex;flex-wrap:wrap;gap:6px}.prepared-spell-pill{padding:6px 9px!important}.sheet-link-button{white-space:nowrap}
            @media(max-width:520px){.repair-mechanics-grid{grid-template-columns:1fr}.combat-equipment-row{align-items:flex-start}.combat-equipment-row>div{text-align:right}}
        `; document.head.appendChild(style);
    }

    function boot() {
        ensureAllMechanics(); installStyles(); patchInventoryViews(); patchInventoryForm(); installSheetWrapper(); installObserver(); patchHomeResources(); syncHome(); repairSheet();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})();
