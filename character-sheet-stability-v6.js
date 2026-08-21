/* D&D Companion — stability hotfix v6
 * Keeps the existing engine/rest logic, but repairs the Home resource bridge,
 * makes inventory mechanics type-specific, and makes Character Sheet navigation safe.
 */
(() => {
  'use strict';
  const engine = window.DnDCharacterEngine;
  if (!engine) return;

  const esc = v => String(v ?? '').replace(/[&<>\'\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const sign = v => { const n = Number(v) || 0; return n >= 0 ? `+${n}` : `${n}`; };
  const abilities = { strength:'STR', dexterity:'DEX', constitution:'CON', intelligence:'INT', wisdom:'WIS', charisma:'CHA' };
  const skills = {
    athletics:['Athletics','strength'], acrobatics:['Acrobatics','dexterity'], sleightOfHand:['Sleight of Hand','dexterity'],
    stealth:['Stealth','dexterity'], arcana:['Arcana','intelligence'], history:['History','intelligence'], investigation:['Investigation','intelligence'],
    nature:['Nature','intelligence'], religion:['Religion','intelligence'], animalHandling:['Animal Handling','wisdom'], insight:['Insight','wisdom'],
    medicine:['Medicine','wisdom'], perception:['Perception','wisdom'], survival:['Survival','wisdom'], deception:['Deception','charisma'],
    intimidation:['Intimidation','charisma'], performance:['Performance','charisma'], persuasion:['Persuasion','charisma']
  };

  const character = () => {
    const c = engine.getLiveCharacter ? engine.getLiveCharacter() : engine.loadCharacter();
    if (engine.syncCharacterRules) engine.syncCharacterRules(c);
    return c;
  };

  function classHitDie(c) {
    const die = engine.characterOptions?.classData?.[c.identity?.class]?.hitDie || 'd8';
    return String(die);
  }

  function normalizeResources(c) {
    c.resources = c.resources || {};
    c.resources.hp = c.resources.hp || { maximum: 1, current: 1, temporary: 0 };
    c.resources.hitDice = c.resources.hitDice || { current: 1, maximum: 1, die: classHitDie(c) };
    const level = Math.max(1, Math.min(20, Number(c.identity?.level) || 1));
    c.resources.hitDice.maximum = level;
    c.resources.hitDice.die = classHitDie(c);
    const current = Number(c.resources.hitDice.current);
    c.resources.hitDice.current = Number.isFinite(current) ? Math.max(0, Math.min(level, current)) : level;
    return c;
  }

  function syncHome() {
    const entry = document.getElementById('character-entry');
    if (!entry) return;
    const c = normalizeResources(character());
    const d = engine.getLiveDerivedData ? engine.getLiveDerivedData() : engine.calculator.getDerivedData(c);
    const summary = entry.querySelectorAll('.character-summary p');
    if (summary[0]) summary[0].textContent = c.identity?.race === 'Draconide' ? 'Dragonborn' : (c.identity?.race || '—');
    if (summary[1]) summary[1].textContent = `${c.identity?.class || '—'} · Level ${Number(c.identity?.level) || 1}`;
    if (summary[2]) summary[2].textContent = c.identity?.alignment || '—';
    const title = entry.querySelector('.character-summary h1');
    if (title) title.textContent = c.identity?.name || 'Your Character';
    const current = document.getElementById('current-hp');
    const maximum = document.getElementById('maximum-hp');
    if (current) current.textContent = c.resources.hp.current ?? d.hitPoints?.current ?? 0;
    if (maximum) maximum.textContent = c.resources.hp.maximum ?? d.hitPoints?.maximum ?? 0;
    const dice = document.getElementById('hit-dice-value');
    if (dice) dice.textContent = `${c.resources.hitDice.current} / ${c.resources.hitDice.maximum}`;
    engine.saveCharacter(c);
  }

  function patchHomeControls() {
    if (typeof window.changeHP === 'function' && !window.changeHP.__repairV6) {
      const fn = amount => {
        const c = normalizeResources(character());
        const max = Number(c.resources.hp.maximum) || 1;
        c.resources.hp.current = Math.max(0, Math.min(max, Number(c.resources.hp.current) + Number(amount || 0)));
        engine.saveCharacter(c); syncHome();
      };
      fn.__repairV6 = true; window.changeHP = fn;
    }
    if (typeof window.changeHitDice === 'function' && !window.changeHitDice.__repairV6) {
      const fn = amount => {
        const c = normalizeResources(character());
        c.resources.hitDice.current = Math.max(0, Math.min(c.resources.hitDice.maximum, Number(c.resources.hitDice.current) + Number(amount || 0)));
        engine.saveCharacter(c); syncHome();
      };
      fn.__repairV6 = true; window.changeHitDice = fn;
    }
  }

  function itemType(item) {
    const tags = item?.tags || [];
    if (tags.includes('Armor')) return 'armor';
    if (tags.includes('Weapon')) return 'weapon';
    if (tags.includes('Shield')) return 'shield';
    return item?.mechanics?.type || item?.equipment?.type || 'none';
  }

  function explicitAcBonus(item) {
    for (const p of item?.properties || []) {
      const m = String(p).match(/^\s*\+\s*(\d+)\s*AC\s*$/i);
      if (m) return Number(m[1]);
    }
    return null;
  }

  function normalizeItem(item) {
    if (!item || !engine) return;
    item.equipment = item.equipment || {};
    const type = itemType(item);
    if (type !== 'none') item.equipment.type = type;
    if (item.equipped !== undefined) item.equipment.equipped = Boolean(item.equipped);
    if (item.equipment.equipped !== undefined) item.equipped = Boolean(item.equipment.equipped);
    const name = String(item.name || '').trim().toLowerCase();

    const armorDefaults = {
      'padded armor':[11,'light',0,false], 'leather armor':[11,'light',0,false], 'studded leather':[12,'light',0,false],
      'hide armor':[12,'medium',0,false], 'chain shirt':[13,'medium',0,false], 'scale mail':[14,'medium',0,false],
      'breastplate':[14,'medium',0,false], 'half plate':[15,'medium',0,false], 'ring mail':[14,'heavy',0,false],
      'chain mail':[16,'heavy',13,false], 'splint armor':[17,'heavy',15,false], 'plate armor':[18,'heavy',15,true]
    };

    if (type === 'armor') {
      const old = item.mechanics?.type === 'armor' ? item.mechanics : {};
      const d = armorDefaults[name] || [10,'light',0,false];
      const legacyBrokenPlate = name === 'plate armor' && Number(old.armorClass) === 10 && !explicitAcBonus(item);
      const base = legacyBrokenPlate || !Number(old.armorClass) ? d[0] : Number(old.armorClass);
      const bonus = explicitAcBonus(item);
      item.mechanics = engine.createArmorMechanics({ ...old, type:'armor', category:old.category || d[1], armorClass:base, strengthRequirement:Number(old.strengthRequirement) || d[2], stealthDisadvantage:old.stealthDisadvantage ?? d[3] });
      item.modifiers = (item.modifiers || []).filter(m => !String(m.id || '').startsWith(`repair-v5-armor-ac-${item.id || name}`));
      const magic = bonus ?? (legacyBrokenPlate ? 0 : (item.modifiers || []).filter(m => m.target === 'armorClass').reduce((s,m)=>s+Number(m.value||0),0));
      item.modifiers = (item.modifiers || []).filter(m => !String(m.id || '').startsWith(`repair-v6-armor-ac-${item.id || name}`));
      if (magic) item.modifiers.push({ id:`repair-v6-armor-ac-${item.id || name}`, target:'armorClass', mode:'add', value:magic, sourceName:item.name });
    }

    if (type === 'shield') {
      const old = item.mechanics?.type === 'shield' ? item.mechanics : {};
      const bonus = Number(old.armorBonus) || explicitAcBonus(item) || 2;
      item.mechanics = engine.createShieldMechanics({ ...old, type:'shield', armorBonus:bonus });
    }

    if (type === 'weapon') {
      const old = item.mechanics?.type === 'weapon' ? item.mechanics : {};
      const attack = old.attack || {};
      const damage = Array.isArray(old.damage) && old.damage.length ? old.damage : [{ dice:{count:1,die:'d8'}, type:'slashing', ability:'strength', modifier:0 }];
      item.mechanics = engine.createWeaponMechanics({ ...old, type:'weapon', attack:{ ...attack, type:attack.type || 'melee', ability:attack.ability || 'strength', proficient:attack.proficient !== false, bonus:Number(attack.bonus)||0 }, damage, properties:old.properties || [] });
      item.proficiency = { ...(item.proficiency || {}), type:item.proficiency?.type || 'martial' };
      item.mechanics.proficiency = { type:item.proficiency.type };
    }
  }

  function normalizeInventory() {
    if (typeof inventoryItems === 'undefined' || !Array.isArray(inventoryItems)) return;
    let changed = false;
    inventoryItems.forEach(item => { const before = JSON.stringify([item.mechanics,item.modifiers,item.equipment]); normalizeItem(item); if (before !== JSON.stringify([item.mechanics,item.modifiers,item.equipment])) changed = true; });
    if (changed && typeof saveInventory === 'function') saveInventory();
  }

  function labelFor(id) { return document.getElementById(id)?.closest('label') || null; }
  function setupMechanicsForm(modal) {
    const form = modal?.querySelector('[data-repair-v5-form-mechanics]');
    if (!form || form.dataset.repairV6) return;
    const grid = form.querySelector('.repair-mechanics-grid');
    const typeSelect = document.getElementById('repair-mechanics-type');
    if (!grid || !typeSelect) return;
    const groups = {
      armor:{title:'Armor', ids:['repair-armor-ac','repair-armor-bonus','repair-armor-category','repair-armor-str','repair-armor-stealth']},
      shield:{title:'Shield', ids:['repair-shield-bonus']},
      weapon:{title:'Weapon', ids:['repair-weapon-ability','repair-weapon-prof','repair-weapon-attack','repair-weapon-dice-count','repair-weapon-die','repair-weapon-damage-type']}
    };
    const sections = {};
    Object.entries(groups).forEach(([type,group]) => {
      const section = document.createElement('div'); section.className='repair-type-section'; section.dataset.type=type;
      section.innerHTML=`<strong>${group.title}</strong><small>${type==='armor'?'Armor class and armor rules.':type==='shield'?'Shield AC bonus.':'Attack, proficiency and damage.'}</small>`;
      group.ids.forEach(id => { const label=labelFor(id); if(label) section.appendChild(label); });
      grid.appendChild(section); sections[type]=section;
    });
    const hint=document.createElement('small'); hint.className='repair-type-hint'; hint.textContent='Select Armor, Weapon or Shield to configure its rules.'; grid.appendChild(hint);
    const update = () => Object.entries(sections).forEach(([type,section]) => section.hidden = type !== typeSelect.value);
    typeSelect.addEventListener('change', update); update(); form.dataset.repairV6='1';
  }

  function patchInventoryFormUI() {
    if (typeof window.openInventoryItemForm === 'function' && !window.openInventoryItemForm.__repairV6) {
      const original=window.openInventoryItemForm;
      const wrapped=function(existing=null){ original(existing); normalizeInventory(); requestAnimationFrame(()=>setupMechanicsForm(document.querySelector('.inventory-form-modal'))); };
      wrapped.__repairV6=true; window.openInventoryItemForm=wrapped;
    }
    const observer=new MutationObserver(()=>setupMechanicsForm(document.querySelector('.inventory-form-modal')));
    observer.observe(document.body,{childList:true,subtree:true});
  }

  function renderFallbackSheet(error) {
    const app=document.getElementById('app'); if(!app)return;
    const c=normalizeResources(character()); const d=engine.getLiveDerivedData?engine.getLiveDerivedData():engine.calculator.getDerivedData(c);
    const armor=engine.calculator.getEquippedArmor(c), shield=engine.calculator.getEquippedShield(c);
    const weapons=(c.items||[]).filter(i=>i?.equipment?.equipped && i?.mechanics?.type==='weapon');
    const rows=Object.entries(skills).map(([id,[label,ability]])=>{const r=c.proficiencies?.skills?.[id]||{};return `<div class="skill-row"><span>${r.proficiency?'✓':''}${r.expertise?' ★':''}</span><span>${label} <small>${abilities[ability]}</small></span><strong>${sign(d.skills?.[id])}</strong></div>`}).join('');
    app.innerHTML=`<header class="character-sheet-header"><button class="back-button" type="button" onclick="showCharacterHome()">← Character</button><div><h1>Character Sheet</h1><p>5e 2014 · live character data</p></div></header><main class="character-sheet"><section class="sheet-card"><h2>${esc(c.identity?.name||'Your Character')}</h2><p>${esc(c.identity?.race||'—')} · ${esc(c.identity?.class||'—')} · Level ${Number(c.identity?.level)||1}</p><p>${esc(c.identity?.alignment||'—')}</p></section><section class="sheet-card"><h2>Hit Points</h2><strong>${c.resources.hp.current} / ${c.resources.hp.maximum}</strong><div class="sheet-detail"><span>Hit Dice</span><strong>${c.resources.hitDice.current} / ${c.resources.hitDice.maximum} ${esc(c.resources.hitDice.die)}</strong></div></section><section class="sheet-card"><h2>Ability Scores</h2>${Object.entries(abilities).map(([a,l])=>`<div class="sheet-detail"><span>${l}</span><strong>${c.abilityScores?.[a]||10} (${sign(d.abilityModifiers?.[a])})</strong></div>`).join('')}</section><section class="sheet-card"><h2>Skills</h2>${rows}</section><section class="sheet-card"><h2>Combat</h2><div class="sheet-detail"><span>AC</span><strong>${d.armorClass}</strong></div><div class="sheet-detail"><span>Speed</span><strong>${d.speed}</strong></div>${armor?`<div class="sheet-detail"><span>Armor</span><strong>${esc(armor.name)}</strong></div>`:''}${shield?`<div class="sheet-detail"><span>Shield</span><strong>${esc(shield.name)} · +${Number(shield.mechanics?.armorBonus)||0} AC</strong></div>`:''}${weapons.map(i=>{const a=engine.calculator.getWeaponAttackBonus(c,i),dm=engine.calculator.getWeaponDamage(c,i)||[];return `<div class="sheet-detail"><span>${esc(i.name)}</span><strong>Attack ${sign(a)} · ${dm.map(x=>`${x.dice?.count||1}${x.dice?.die||''} ${x.type||''} ${sign(x.modifier)}`).join(' + ')}</strong></div>`}).join('')}</section><section class="sheet-card"><h2>Spellcasting</h2><div class="sheet-detail"><span>Attack</span><strong>${d.spellAttackBonus==null?'—':sign(d.spellAttackBonus)}</strong></div><div class="sheet-detail"><span>Save DC</span><strong>${d.spellSaveDC==null?'—':d.spellSaveDC}</strong></div></section></main>`;
    console.error('Character Sheet renderer failed; fallback rendered.',error);
  }

  function patchCharacterSheet() {
    const original=window.showCharacterSheet;
    if (typeof original !== 'function' || original.__repairV6) return;
    const wrapped=function(){
      normalizeInventory(); normalizeResources(character());
      try { original(); } catch(error) { renderFallbackSheet(error); return; }
      try { if (typeof window.repairSheet==='function') window.repairSheet(); } catch(error) { console.warn('Repair layer after Character Sheet render failed:',error); }
    };
    wrapped.__repairV6=true; window.showCharacterSheet=wrapped;
  }

  function installStyles() {
    if(document.getElementById('repair-v6-style'))return;
    const s=document.createElement('style'); s.id='repair-v6-style'; s.textContent=`
      .repair-type-section{border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:12px;margin-top:10px;display:grid;gap:8px}
      .repair-type-section>strong{font-size:1rem}.repair-type-section>small{opacity:.65}
      .repair-type-section[hidden],.repair-type-hint[hidden]{display:none!important}
    `; document.head.appendChild(s);
  }

  function boot(){
    installStyles(); normalizeInventory(); normalizeResources(character()); patchHomeControls(); patchInventoryFormUI(); patchCharacterSheet(); syncHome();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
