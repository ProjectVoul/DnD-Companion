/* D&D Companion — Character Engine runtime / migration layer
 * Ruleset: D&D 5e 2014
 * This is the only compatibility layer for legacy localStorage data.
 * It runs once, converts old state into the Character Engine model, then
 * removes the old live-state dependency from the application.
 */
(() => {
  'use strict';
  const e = window.DnDCharacterEngine;
  if (!e) return;

  const MIGRATION_KEY = 'dndCompanionEngineMigrationV1';
  const clone = v => JSON.parse(JSON.stringify(v));
  const num = (v, fallback = 0) => Number.isFinite(Number(v)) ? Number(v) : fallback;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  function safeJSON(key, fallback = null) {
    try { const raw = localStorage.getItem(key); return raw == null ? fallback : JSON.parse(raw); }
    catch (_) { return fallback; }
  }

  const armorBase = {
    'Padded Armor': [11, 'light', 0, false], 'Leather Armor': [11, 'light', 0, false],
    'Studded Leather': [12, 'light', 0, false], 'Hide Armor': [12, 'medium', 0, false],
    'Chain Shirt': [13, 'medium', 0, false], 'Scale Mail': [14, 'medium', 0, true],
    'Breastplate': [14, 'medium', 0, false], 'Half Plate': [15, 'medium', 0, true],
    'Ring Mail': [14, 'heavy', 0, true], 'Chain Mail': [16, 'heavy', 13, true],
    'Splint Armor': [17, 'heavy', 15, true], 'Plate Armor': [18, 'heavy', 15, true]
  };

  function legacyType(item) {
    const mechanicsType = item?.mechanics?.type || item?.equipment?.type;
    if (['weapon','armor','shield','focus','accessory','other'].includes(mechanicsType)) return mechanicsType;
    const tags = item?.tags || [];
    if (tags.includes('Weapon')) return 'weapon';
    if (tags.includes('Armor')) return 'armor';
    if (tags.includes('Shield')) return 'shield';
    if (tags.includes('Focus')) return 'focus';
    if (tags.includes('Accessory')) return 'accessory';
    if (item?.category === 'weapons') return 'weapon';
    if (item?.category === 'armor') return 'armor';
    if (item?.category === 'shield') return 'shield';
    if (item?.category === 'focus') return 'focus';
    if (item?.category === 'accessories') return 'accessory';
    return 'other';
  }

  function propertyAC(item) {
    const hit = (item?.properties || []).map(String).map(x => x.match(/^\s*\+(\d+)\s*AC\s*$/i)).find(Boolean);
    return hit ? Number(hit[1]) : 0;
  }

  function normalizeItem(old) {
    const type = legacyType(old);
    const item = e.createItem({
      id: String(old?.id || `item-${Date.now()}-${Math.random().toString(36).slice(2,7)}`),
      name: String(old?.name || 'Unnamed Item'),
      description: String(old?.description || ''),
      quantity: Math.max(0, Math.floor(num(old?.quantity, 1))),
      weight: Math.max(0, num(old?.weight, 0)),
      tags: Array.isArray(old?.tags) ? [...old.tags] : [],
      inventorySection: old?.location === 'equipment' ? 'equipment' : 'miscellaneous',
      equipment: { type, equipped: old?.equipment?.equipped === true || old?.equipped === true },
      mechanics: {},
      modifiers: Array.isArray(old?.modifiers) ? clone(old.modifiers) : [],
      effects: Array.isArray(old?.effects) ? clone(old.effects) : [],
      grants: { abilities: [] }
    });
    if (old?.icon != null) item.icon = old.icon;
    if (old?.magical != null) item.magical = Boolean(old.magical);
    if (old?.properties) item.properties = [...old.properties];
    if (old?.originalLocation) item.originalLocation = old.originalLocation;
    if (old?.linkedAbility) item.linkedAbility = old.linkedAbility;
    if (old?.proficiency) item.proficiency = clone(old.proficiency);

    if (type === 'armor') {
      const known = armorBase[item.name];
      const oldM = old?.mechanics || {};
      item.mechanics = e.createArmorMechanics({
        ...oldM,
        type: 'armor',
        category: oldM.category || known?.[1] || 'light',
        armorClass: num(oldM.armorClass, known?.[0] || 10),
        dexterity: oldM.dexterity || { applies: (known?.[1] || 'light') !== 'heavy', maximum: (known?.[1] === 'medium') ? 2 : null },
        strengthRequirement: num(oldM.strengthRequirement, known?.[2] || 0),
        stealthDisadvantage: oldM.stealthDisadvantage ?? Boolean(known?.[3])
      });
      const bonus = propertyAC(old);
      if (bonus && !item.modifiers.some(m => m.id === `legacy-ac-${item.id}`)) {
        item.modifiers.push({ id:`legacy-ac-${item.id}`, target:'armorClass', mode:'add', value:bonus, sourceName:item.name });
      }
    } else if (type === 'shield') {
      const oldM = old?.mechanics || {};
      item.mechanics = e.createShieldMechanics({ ...oldM, type:'shield', armorBonus:num(oldM.armorBonus, propertyAC(old) || 2) });
    } else if (type === 'weapon') {
      const oldM = old?.mechanics || {};
      const attack = oldM.attack || {};
      const damage = Array.isArray(oldM.damage) && oldM.damage.length ? oldM.damage : [{ dice:{count:1,die:'d8'}, type:'slashing', ability:'strength', modifier:0 }];
      item.mechanics = e.createWeaponMechanics({
        ...oldM, type:'weapon',
        attack:{ type:attack.type || 'melee', ability:attack.ability || 'strength', proficient:attack.proficient !== false, bonus:num(attack.bonus,0) },
        damage:clone(damage), properties:Array.isArray(oldM.properties) ? [...oldM.properties] : []
      });
      if (old?.proficiency?.type) item.proficiency = clone(old.proficiency);
    } else {
      item.mechanics = { type, ...(old?.mechanics || {}) };
    }
    return item;
  }

  function migrateLegacy() {
    let c = e.loadCharacter();
    const legacyItems = safeJSON('inventoryItems', null);
    const legacyCurrency = safeJSON('inventoryCurrency', null);
    const legacySlots = safeJSON('spellSlots', null);
    const legacyPrepared = safeJSON('preparedSpells', null);
    const legacyAbilities = safeJSON('abilityState', null);
    const hasLegacy = legacyItems || legacyCurrency || legacySlots || legacyPrepared || legacyAbilities || localStorage.getItem('currentHP') !== null;
    if (!hasLegacy && localStorage.getItem(MIGRATION_KEY)) return c;

    if ((!Array.isArray(c.items) || c.items.length === 0) && Array.isArray(legacyItems)) c.items = legacyItems.map(normalizeItem);
    else if (Array.isArray(legacyItems)) {
      const byId = new Map(c.items.map(i => [String(i.id), i]));
      legacyItems.forEach(old => { if (!byId.has(String(old.id))) c.items.push(normalizeItem(old)); });
    }

    c.currency = c.currency || { copper:0, silver:0, gold:0, platinum:0 };
    if (legacyCurrency && typeof legacyCurrency === 'object') {
      ['copper','silver','gold','platinum'].forEach(k => { if (legacyCurrency[k] != null) c.currency[k] = Math.max(0, Math.floor(num(legacyCurrency[k],0))); });
    }

    c.resources = c.resources || {};
    c.resources.hp = c.resources.hp || { maximum:1, current:1, temporary:0 };
    c.resources.deathSaves = c.resources.deathSaves || { successes:0, failures:0 };
    const oldHP = localStorage.getItem('currentHP');
    if (oldHP !== null && Number.isFinite(Number(oldHP))) c.resources.hp.current = Math.max(0, Number(oldHP));

    if (legacySlots && typeof legacySlots === 'object') {
      c.resources.spellSlots = {};
      Object.keys(legacySlots).forEach(level => {
        const s = legacySlots[level]; if (!s) return;
        const maximum = Math.max(0, Math.floor(num(s.maximum,0)));
        if (maximum) c.resources.spellSlots[level] = { maximum, current:clamp(Math.floor(num(s.current,maximum)),0,maximum) };
      });
    }

    if (Array.isArray(legacyPrepared)) c.preparedSpellNames = [...new Set(legacyPrepared.map(String))];
    if (legacyAbilities && typeof legacyAbilities === 'object') c.customAbilityState = clone(legacyAbilities);

    c.ruleState = c.ruleState || {};
    c.ruleState.legacyMigrated = true;
    localStorage.setItem(MIGRATION_KEY, '1');
    return e.saveCharacter(c);
  }

  function hpDie(c) {
    const d = e.characterOptions?.classData?.[c.identity?.class]?.hitDie || c.resources?.hitDice?.die || 'd8';
    return Math.max(1, num(String(d).replace('d',''),8));
  }

  function constitutionModifier(c) { return e.calculator.getAbilityModifier(c,'constitution'); }

  function calculateHPMaximum(c) {
    const level = clamp(Math.floor(num(c.identity?.level,1)),1,20);
    const die = hpDie(c);
    const con = constitutionModifier(c);
    const hp = c.resources.hp;
    if (!hp.manualMaximum) return Math.max(1, die + con + (level - 1) * (Math.floor(die / 2) + 1 + con));
    let total = die + con;
    const rolls = Array.isArray(hp.levelRolls) ? hp.levelRolls : [];
    for (let i=0; i<level-1; i++) {
      const roll = num(rolls[i], Math.floor(die / 2) + 1);
      total += clamp(Math.floor(roll),1,die) + con;
    }
    return Math.max(1,total);
  }

  function normalize(c) {
    c.resources = c.resources || {};
    c.resources.hp = c.resources.hp || {maximum:1,current:1,temporary:0};
    c.resources.hitDice = c.resources.hitDice || {current:1,maximum:1,die:'d8'};
    c.resources.deathSaves = c.resources.deathSaves || {successes:0,failures:0};
    c.resources.hp.levelRolls = Array.isArray(c.resources.hp.levelRolls) ? c.resources.hp.levelRolls : [];
    c.resources.hp.manualMaximum = Boolean(c.resources.hp.manualMaximum);
    const level = clamp(Math.floor(num(c.identity?.level,1)),1,20);
    c.resources.hitDice.maximum = level;
    c.resources.hitDice.die = `d${hpDie(c)}`;
    c.resources.hitDice.current = clamp(Math.floor(num(c.resources.hitDice.current,level)),0,level);
    c.resources.hp.maximum = calculateHPMaximum(c);
    c.resources.hp.current = clamp(num(c.resources.hp.current,c.resources.hp.maximum),0,c.resources.hp.maximum);
    c.resources.hp.temporary = Math.max(0,num(c.resources.hp.temporary,0));
    c.resources.deathSaves.successes = clamp(Math.floor(num(c.resources.deathSaves.successes,0)),0,3);
    c.resources.deathSaves.failures = clamp(Math.floor(num(c.resources.deathSaves.failures,0)),0,3);
    c.currency = c.currency || {copper:0,silver:0,gold:0,platinum:0};
    return c;
  }

  function live() {
    const c = migrateLegacy();
    if (e.syncCharacterRules) e.syncCharacterRules(c);
    return normalize(c);
  }

  function saveLive(c) {
    normalize(c);
    if (e.syncCharacterRules) e.syncCharacterRules(c);
    normalize(c);
    return e.saveCharacter(c);
  }

  function setHP(c,value) { c.resources.hp.current = clamp(Math.floor(num(value,0)),0,c.resources.hp.maximum); return saveLive(c); }
  function changeHP(c,delta) { return setHP(c,num(c.resources.hp.current,0)+num(delta,0)); }
  function setHitDice(c,value) { c.resources.hitDice.current = clamp(Math.floor(num(value,0)),0,c.resources.hitDice.maximum); return saveLive(c); }
  function changeHitDice(c,delta) { return setHitDice(c,num(c.resources.hitDice.current,0)+num(delta,0)); }

  function shortRest(c, diceSpent, rolls) {
    const available = c.resources.hitDice.current;
    const spent = clamp(Math.floor(num(diceSpent,0)),0,available);
    const die = hpDie(c), con = constitutionModifier(c);
    const rollList = Array.isArray(rolls) ? rolls : [];
    let recovered = 0;
    for (let i=0;i<spent;i++) recovered += clamp(Math.floor(num(rollList[i],Math.floor(Math.random()*die)+1)),1,die) + con;
    c.resources.hitDice.current -= spent;
    c.resources.hp.current = clamp(c.resources.hp.current + recovered,0,c.resources.hp.maximum);
    return saveLive(c);
  }

  function longRest(c) {
    c.resources.hp.current = c.resources.hp.maximum;
    c.resources.hp.temporary = 0;
    c.resources.hitDice.current = Math.min(c.resources.hitDice.maximum, c.resources.hitDice.current + Math.max(1,Math.floor(c.resources.hitDice.maximum/2)));
    c.resources.deathSaves = {successes:0,failures:0};
    c.status = c.status || {};
    c.status.concentration = false;
    c.status.conditions = [];
    Object.values(c.resources.spellSlots || {}).forEach(s => { s.current = s.maximum; });
    (e.getFeatureResources ? e.getFeatureResources(c) : []).forEach(r => { if (r.recovery === 'longRest') { const target = c.resourceUses?.[r.id]; if (target) target.current = r.maximum; } });
    return saveLive(c);
  }

  function shortRestWithChoices(c, diceSpent, rolls) { return shortRest(c,diceSpent,rolls); }

  e.getLiveCharacter = live;
  e.saveLiveCharacter = saveLive;
  e.getHitPointMaximum = calculateHPMaximum;
  e.setHP = setHP;
  e.changeHP = changeHP;
  e.setHitDice = setHitDice;
  e.changeHitDice = changeHitDice;
  e.shortRest = shortRestWithChoices;
  e.longRest = longRest;
  e.normalizeCharacter = normalize;
  e.migrateLegacyCharacter = migrateLegacy;
  e.getHPDie = hpDie;
  e.getConstitutionModifier = constitutionModifier;
})();
