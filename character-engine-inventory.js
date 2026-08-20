/* D&D Companion — Character Engine Inventory Bridge | D&D 5e 2014 */
(() => {
    'use strict';

    const engine = window.DnDCharacterEngine;
    if (!engine) return;

    const LEGACY_TAG_TYPES = {
        Armor: 'armor',
        Weapon: 'weapon',
        Shield: 'shield',
        Focus: 'focus',
        Accessory: 'accessory'
    };

    const DAMAGE_TYPES = engine.damageTypes || [
        'acid','bludgeoning','cold','fire','force','lightning','necrotic',
        'piercing','poison','psychic','radiant','slashing','thunder'
    ];

    const ABILITY_LABELS = {
        strength: 'Strength',
        dexterity: 'Dexterity',
        constitution: 'Constitution',
        intelligence: 'Intelligence',
        wisdom: 'Wisdom',
        charisma: 'Charisma'
    };

    const escape = (value) => {
        if (typeof escapeHTML === 'function') return escapeHTML(String(value ?? ''));
        return String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
    };

    function itemTypeFromLegacy(item) {
        if (item?.mechanics?.type) return item.mechanics.type;
        const tag = (item?.tags || []).find((value) => LEGACY_TAG_TYPES[value]);
        return tag ? LEGACY_TAG_TYPES[tag] : null;
    }

    function normalizeItem(item) {
        const normalized = engine.createItem(item || {});
        const type = itemTypeFromLegacy(item);
        normalized.id = item?.id || normalized.id;
        normalized.name = item?.name || normalized.name;
        normalized.description = item?.description || normalized.description;
        normalized.quantity = Number.isFinite(Number(item?.quantity)) ? Number(item.quantity) : 1;
        normalized.weight = item?.weight ?? 0;
        normalized.tags = Array.isArray(item?.tags) ? [...item.tags] : [];
        normalized.inventorySection = item?.location || (item?.equipped ? 'equipment' : 'miscellaneous');
        normalized.equipment = {
            ...(normalized.equipment || {}),
            type: type || normalized.equipment?.type || null,
            equipped: Boolean(item?.equipped)
        };
        normalized.mechanics = normalized.mechanics || {};
        normalized.modifiers = Array.isArray(normalized.modifiers) ? normalized.modifiers : [];
        normalized.effects = Array.isArray(normalized.effects) ? normalized.effects : [];
        return normalized;
    }

    function syncEngineItem(item) {
        if (!item) return;
        const normalized = normalizeItem(item);
        Object.assign(item, normalized);
        item.category = item.category || (item.equipment.type === 'weapon' ? 'weapons' : item.equipment.type);
        item.location = item.inventorySection || item.location;
        item.equipped = Boolean(item.equipment.equipped);
    }

    function selectedType(item) {
        return itemTypeFromLegacy(item) || 'other';
    }

    function mechanicsDefaults(type, item) {
        if (type === 'weapon') {
            const current = item?.mechanics?.type === 'weapon' ? item.mechanics : {};
            return engine.createWeaponMechanics(current);
        }
        if (type === 'armor') {
            const current = item?.mechanics?.type === 'armor' ? item.mechanics : {};
            return engine.createArmorMechanics(current);
        }
        if (type === 'shield') {
            const current = item?.mechanics?.type === 'shield' ? item.mechanics : {};
            return engine.createShieldMechanics(current);
        }
        return {};
    }

    function renderMechanics(type, item) {
        const mechanics = mechanicsDefaults(type, item);

        if (type === 'weapon') {
            const attack = mechanics.attack || {};
            const firstDamage = (mechanics.damage || [])[0] || engine.createDamageComponent({});
            return `
                <div class="engine-item-mechanics" data-type="weapon">
                    <h3>Weapon mechanics</h3>
                    <label>Attack ability
                        <select id="engine-item-attack-ability">
                            ${Object.entries(ABILITY_LABELS).map(([key,label]) => `<option value="${key}" ${attack.ability===key?'selected':''}>${label}</option>`).join('')}
                        </select>
                    </label>
                    <label class="engine-check-row">
                        <input id="engine-item-attack-proficient" type="checkbox" ${attack.proficient ? 'checked' : ''}>
                        Proficient with this weapon
                    </label>
                    <label>Damage dice
                        <div class="engine-inline-fields">
                            <input id="engine-item-damage-count" type="number" min="0" step="1" value="${Number(firstDamage.dice?.count)||0}">
                            <select id="engine-item-damage-die">
                                ${['d4','d6','d8','d10','d12','d20'].map(die => `<option value="${die}" ${firstDamage.dice?.die===die?'selected':''}>${die}</option>`).join('')}
                            </select>
                        </div>
                    </label>
                    <label>Damage type
                        <select id="engine-item-damage-type">
                            ${DAMAGE_TYPES.map(damageType => `<option value="${damageType}" ${firstDamage.type===damageType?'selected':''}>${damageType[0].toUpperCase()+damageType.slice(1)}</option>`).join('')}
                        </select>
                    </label>
                    <label>Damage ability
                        <select id="engine-item-damage-ability">
                            <option value="">None</option>
                            ${Object.entries(ABILITY_LABELS).map(([key,label]) => `<option value="${key}" ${firstDamage.ability===key?'selected':''}>${label}</option>`).join('')}
                        </select>
                    </label>
                    <label>Properties
                        <input id="engine-item-weapon-properties" type="text" value="${escape((mechanics.properties || []).join(', '))}" placeholder="Finesse, Versatile, Heavy, ...">
                    </label>
                </div>`;
        }

        if (type === 'armor') {
            const dex = mechanics.dexterity || {};
            return `
                <div class="engine-item-mechanics" data-type="armor">
                    <h3>Armor mechanics</h3>
                    <label>Base AC
                        <input id="engine-item-armor-ac" type="number" min="0" step="1" value="${Number(mechanics.armorClass)||0}">
                    </label>
                    <label>Dexterity
                        <select id="engine-item-armor-dex-mode">
                            <option value="none" ${!dex.applies?'selected':''}>Doesn't apply</option>
                            <option value="full" ${dex.applies && dex.maximum == null?'selected':''}>Full modifier</option>
                            <option value="capped" ${dex.applies && dex.maximum != null?'selected':''}>Modifier capped</option>
                        </select>
                    </label>
                    <label id="engine-item-armor-dex-cap-row">Maximum DEX bonus
                        <input id="engine-item-armor-dex-cap" type="number" min="0" step="1" value="${dex.maximum ?? ''}" placeholder="e.g. 2">
                    </label>
                    <label>Strength requirement
                        <input id="engine-item-armor-strength" type="number" min="0" step="1" value="${Number(mechanics.strengthRequirement)||0}" placeholder="0 if none">
                    </label>
                    <label class="engine-check-row">
                        <input id="engine-item-armor-stealth" type="checkbox" ${mechanics.stealthDisadvantage ? 'checked' : ''}>
                        Stealth disadvantage
                    </label>
                </div>`;
        }

        if (type === 'shield') {
            return `
                <div class="engine-item-mechanics" data-type="shield">
                    <h3>Shield mechanics</h3>
                    <label>AC bonus
                        <input id="engine-item-shield-ac" type="number" min="0" step="1" value="${Number(mechanics.armorBonus)||0}">
                    </label>
                </div>`;
        }

        return `
            <div class="engine-item-mechanics" data-type="other">
                <h3>Effects & modifiers</h3>
                <p class="engine-item-help">For now, keep complex effects in the item description. The structured modifier/effect editor will be added after the core equipment model is tested.</p>
            </div>`;
    }

    function bindMechanicsType() {
        const typeSelect = document.getElementById('engine-item-type');
        const container = document.getElementById('engine-item-mechanics-container');
        if (!typeSelect || !container) return;

        const refresh = () => {
            const current = window.__engineInventoryEditingItem || null;
            container.innerHTML = renderMechanics(typeSelect.value, current);
            const dexMode = document.getElementById('engine-item-armor-dex-mode');
            const capRow = document.getElementById('engine-item-armor-dex-cap-row');
            const syncDex = () => { if (capRow) capRow.style.display = dexMode?.value === 'capped' ? '' : 'none'; };
            dexMode?.addEventListener('change', syncDex);
            syncDex();
        };
        typeSelect.addEventListener('change', refresh);
        refresh();
    }

    function openEngineInventoryItemForm(existingItem = null) {
        const isEditing = Boolean(existingItem);
        window.__engineInventoryEditingItem = existingItem ? normalizeItem(existingItem) : null;
        const selectedTags = existingItem?.tags || [];
        const form = document.createElement('div');
        form.className = 'inventory-form-overlay';
        form.innerHTML = `
            <div class="inventory-form-modal engine-item-modal">
                <button class="rest-close" onclick="this.closest('.inventory-form-overlay').remove()">×</button>
                <h2>${isEditing ? 'Edit Item' : 'Add Item'}</h2>
                <label>Name<input id="inventory-form-name" type="text" value="${escape(existingItem?.name || '')}" placeholder="Item name"></label>
                <label>Icon<input id="inventory-form-icon" type="text" value="${escape(existingItem?.icon || '📦')}" maxlength="4"></label>
                <label>Description<textarea id="inventory-form-description" placeholder="Describe the item...">${escape(existingItem?.description || '')}</textarea></label>
                <div class="engine-form-grid">
                    <label>Quantity<input id="inventory-form-quantity" type="number" min="0" step="1" value="${existingItem ? existingItem.quantity : 1}"></label>
                    <label>Weight (kg)<input id="inventory-form-weight" type="number" min="0" step="0.01" value="${existingItem?.weight ?? ''}" placeholder="Optional"></label>
                </div>
                <label>Item type
                    <select id="engine-item-type">
                        <option value="other">Other</option>
                        <option value="weapon" ${selectedType(existingItem)==='weapon'?'selected':''}>Weapon</option>
                        <option value="armor" ${selectedType(existingItem)==='armor'?'selected':''}>Armor</option>
                        <option value="shield" ${selectedType(existingItem)==='shield'?'selected':''}>Shield</option>
                        <option value="focus" ${selectedType(existingItem)==='focus'?'selected':''}>Focus</option>
                        <option value="accessory" ${selectedType(existingItem)==='accessory'?'selected':''}>Accessory</option>
                    </select>
                </label>
                <div id="engine-item-mechanics-container"></div>
                <label>Properties (display text)<input id="inventory-form-properties" type="text" value="${escape(existingItem?.properties?.join(', ') || '')}" placeholder="Separate properties with commas"></label>
                <label class="inventory-checkbox-label"><input id="inventory-form-magical" type="checkbox" ${existingItem?.magical?'checked':''}> Magical item</label>
                <div class="inventory-form-tags"><strong>Tags</strong><small>Choose up to 3</small><div class="inventory-tag-options">
                    ${(window.inventoryTags || []).map(tag => `<label><input type="checkbox" value="${escape(tag)}" class="inventory-tag-checkbox" ${selectedTags.includes(tag)?'checked':''} onchange="limitInventoryTags(this)">${escape(tag)}</label>`).join('')}
                </div></div>
                <button class="inventory-form-submit" onclick="saveEngineInventoryItemForm('${escape(existingItem?.id || '')}')">${isEditing ? 'Save Changes' : 'Add Item'}</button>
            </div>`;
        document.body.appendChild(form);
        bindMechanicsType();
    }

    function collectMechanics(type, existingItem) {
        if (type === 'weapon') {
            const ability = document.getElementById('engine-item-attack-ability')?.value || 'strength';
            const proficient = Boolean(document.getElementById('engine-item-attack-proficient')?.checked);
            const count = Math.max(0, Number(document.getElementById('engine-item-damage-count')?.value) || 0);
            const die = document.getElementById('engine-item-damage-die')?.value || 'd8';
            const damageType = document.getElementById('engine-item-damage-type')?.value || 'slashing';
            const damageAbility = document.getElementById('engine-item-damage-ability')?.value || null;
            const properties = (document.getElementById('engine-item-weapon-properties')?.value || '').split(',').map(v=>v.trim()).filter(Boolean);
            return engine.createWeaponMechanics({
                attack: { ability, proficient, bonus: 0 },
                damage: [engine.createDamageComponent({ dice:{count,die}, type:damageType, ability:damageAbility })],
                properties
            });
        }
        if (type === 'armor') {
            const mode = document.getElementById('engine-item-armor-dex-mode')?.value || 'none';
            const cap = document.getElementById('engine-item-armor-dex-cap')?.value;
            return engine.createArmorMechanics({
                armorClass: Math.max(0, Number(document.getElementById('engine-item-armor-ac')?.value) || 0),
                dexterity: { applies: mode !== 'none', maximum: mode === 'capped' ? Math.max(0, Number(cap)||0) : null },
                strengthRequirement: Math.max(0, Number(document.getElementById('engine-item-armor-strength')?.value) || 0),
                stealthDisadvantage: Boolean(document.getElementById('engine-item-armor-stealth')?.checked)
            });
        }
        if (type === 'shield') {
            return engine.createShieldMechanics({ armorBonus: Math.max(0, Number(document.getElementById('engine-item-shield-ac')?.value) || 0) });
        }
        return existingItem?.mechanics || {};
    }

    window.saveEngineInventoryItemForm = function(existingId = '') {
        const nameField = document.getElementById('inventory-form-name');
        const quantityField = document.getElementById('inventory-form-quantity');
        const weightField = document.getElementById('inventory-form-weight');
        if (!nameField || !quantityField || !weightField) return;
        const name = nameField.value.trim();
        const quantity = Number(quantityField.value);
        const weight = weightField.value === '' ? null : Number(weightField.value);
        if (!name) { alert('Please enter an item name.'); return; }
        if (!Number.isFinite(quantity) || quantity < 0) { alert('Quantity must be 0 or greater.'); return; }
        if (weight !== null && (!Number.isFinite(weight) || weight < 0)) { alert('Weight must be 0 or greater.'); return; }

        const existing = existingId ? inventoryItems.find(item => item.id === existingId) : null;
        const type = document.getElementById('engine-item-type')?.value || 'other';
        const tags = Array.from(document.querySelectorAll('.inventory-tag-checkbox:checked')).map(c=>c.value);
        const properties = (document.getElementById('inventory-form-properties')?.value || '').split(',').map(v=>v.trim()).filter(Boolean);
        const item = existing || {
            id: 'item-' + Date.now(),
            quantity: 1,
            equipped: false,
            location: 'miscellaneous',
            category: 'miscellaneous',
            originalLocation: 'miscellaneous'
        };

        const mechanics = collectMechanics(type, existing);
        item.name = name;
        item.icon = document.getElementById('inventory-form-icon')?.value || '📦';
        item.description = document.getElementById('inventory-form-description')?.value.trim() || '';
        item.quantity = Math.floor(quantity);
        item.weight = weight;
        item.properties = properties;
        item.magical = Boolean(document.getElementById('inventory-form-magical')?.checked);
        item.tags = tags;
        item.mechanics = mechanics;
        item.equipment = { type: type === 'other' ? null : type, equipped: Boolean(item.equipped) };
        item.inventorySection = item.location || 'miscellaneous';

        if (type !== 'other') {
            const categoryMap = { weapon:'weapons', armor:'armor', shield:'shield', focus:'focus', accessory:'accessories' };
            item.category = categoryMap[type];
            item.location = item.equipped ? 'equipment' : (item.location === 'equipment' ? 'equipment' : 'miscellaneous');
            item.inventorySection = item.location;
        } else if (!item.equipped) {
            item.category = 'miscellaneous';
            item.location = 'miscellaneous';
            item.inventorySection = 'miscellaneous';
        }

        syncEngineItem(item);
        if (!existing) inventoryItems.push(item);
        saveInventory();
        window.__engineInventoryEditingItem = null;
        document.querySelector('.inventory-form-overlay')?.remove();
        showInventorySection(item.location || 'miscellaneous');
    };

    window.openInventoryItemForm = openEngineInventoryItemForm;
    window.openAddItemForm = () => openEngineInventoryItemForm(null);
    window.openEditItemForm = (itemId) => {
        const item = inventoryItems.find(entry => entry.id === itemId);
        if (item) openEngineInventoryItemForm(item);
    };

    (window.inventoryItems || []).forEach(syncEngineItem);
})();
