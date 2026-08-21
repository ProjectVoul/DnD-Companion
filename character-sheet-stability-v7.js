/* D&D Companion — stability hotfix v7
 * Normalizes seeded equipment BEFORE the inventory editor renders, so the
 * editor cannot be populated with legacy 10 AC / magic-bonus values.
 */
(() => {
  'use strict';
  const engine = window.DnDCharacterEngine;
  if (!engine) return;

  function normalizeSeededItem(item) {
    if (!item) return;
    const name = String(item.name || '').trim().toLowerCase();
    const tags = item.tags || [];
    const type = tags.includes('Armor') ? 'armor' : tags.includes('Weapon') ? 'weapon' : tags.includes('Shield') ? 'shield' : item.mechanics?.type || item.equipment?.type;
    item.equipment = item.equipment || {};
    if (type) item.equipment.type = type;

    if (type === 'armor' && name === 'plate armor') {
      item.mechanics = engine.createArmorMechanics({
        ...(item.mechanics || {}),
        type: 'armor', category: 'heavy', armorClass: 18,
        strengthRequirement: 15, stealthDisadvantage: true
      });
      item.modifiers = (item.modifiers || []).filter(m => !String(m.id || '').startsWith('repair-v5-armor-ac-') && !String(m.id || '').startsWith('repair-v6-armor-ac-'));
    }

    if (type === 'shield' && name === 'shield of bahamut') {
      item.mechanics = engine.createShieldMechanics({ ...(item.mechanics || {}), type: 'shield', armorBonus: 4 });
    }

    if (type === 'weapon' && name === 'sword of the golden choice') {
      const old = item.mechanics?.type === 'weapon' ? item.mechanics : {};
      item.mechanics = engine.createWeaponMechanics({
        ...old, type: 'weapon',
        attack: { ...(old.attack || {}), type: 'melee', ability: 'strength', proficient: true, bonus: Number(old.attack?.bonus) || 0 },
        damage: Array.isArray(old.damage) && old.damage.length ? old.damage : [{ dice:{count:1,die:'d8'}, type:'slashing', ability:'strength', modifier:0 }]
      });
      item.proficiency = { ...(item.proficiency || {}), type: item.proficiency?.type || 'martial' };
      item.mechanics.proficiency = { type: item.proficiency.type };
    }
  }

  function normalizeInventory() {
    if (typeof inventoryItems === 'undefined' || !Array.isArray(inventoryItems)) return;
    let changed = false;
    inventoryItems.forEach(item => {
      const before = JSON.stringify([item.mechanics, item.modifiers, item.equipment]);
      normalizeSeededItem(item);
      changed = changed || before !== JSON.stringify([item.mechanics, item.modifiers, item.equipment]);
    });
    if (changed && typeof saveInventory === 'function') saveInventory();
  }

  if (typeof window.openInventoryItemForm === 'function' && !window.openInventoryItemForm.__repairV7) {
    const original = window.openInventoryItemForm;
    const wrapped = function(existingItem = null) {
      if (existingItem) normalizeSeededItem(existingItem);
      normalizeInventory();
      original(existingItem);
    };
    wrapped.__repairV7 = true;
    window.openInventoryItemForm = wrapped;
  }

  normalizeInventory();
})();
