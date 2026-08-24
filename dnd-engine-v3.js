/* D&D Companion v3 — rules-first character state and modifier engine.
 * The engine is intentionally content-agnostic: official data, optional data and
 * homebrew all enter through the same entity/effect model.
 */
(() => {
  'use strict';

  const D = window.DnDDataV2 || {};
  const KEY = 'dndCompanionCharacterV3';
  const ABILITIES = D.ABILITIES || ['strength','dexterity','constitution','intelligence','wisdom','charisma'];
  const clone = value => JSON.parse(JSON.stringify(value));
  const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const mod = score => Math.floor((num(score) - 10) / 2);
  const pb = level => 2 + Math.floor((Math.max(1, num(level, 1)) - 1) / 4);
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const DEFAULT = {
    schemaVersion: 3,
    ruleset: '5e-2014',
    rules: {
      sources: { phb2014: true, xanathar: true, tasha: true },
      optionalFeatures: {},
      featsEnabled: true,
      multiclassEnabled: true,
      homebrewEnabled: true
    },
    identity: { name:'', race:'', subrace:'', background:'', alignment:'', size:'Medium', speed:30 },
    classes: [],
    abilityScores: Object.fromEntries(ABILITIES.map(a => [a, 10])),
    abilityBonuses: {},
    proficiencies: { skills:{}, savingThrows:[], weapons:[], armor:[], tools:[], languages:[] },
    origin: { race:'', subrace:'', traits:[], customOrigin:false, abilityBonuses:{}, languages:[], proficiencies:[] },
    feats: [],
    items: [],
    spells: [],
    spellcasting: { prepared:{}, known:{}, spellbook:{}, additional:{}, slots:{}, pactSlots:{} },
    abilities: [],
    activeEffects: [],
    conditions: [],
    resistances: [],
    immunities: [],
    vulnerabilities: [],
    resources: {
      hp:{current:1, maximum:1, temporary:0},
      hitDice:{}, deathSaves:{successes:0, failures:0}, inspiration:false,
      spellSlots:{}, pactSlots:{}, class:{}, custom:{}
    },
    notes:''
  };

  function merge(base, extra) {
    if (Array.isArray(base)) return Array.isArray(extra) ? clone(extra) : clone(base);
    if (base && typeof base === 'object') {
      const out = {};
      const e = extra && typeof extra === 'object' && !Array.isArray(extra) ? extra : {};
      Object.keys(base).forEach(k => { out[k] = merge(base[k], e[k]); });
      Object.keys(e).forEach(k => { if (!(k in out)) out[k] = clone(e[k]); });
      return out;
    }
    return extra === undefined ? base : clone(extra);
  }

  function migrate(input) {
    const c = clone(input || {});
    if (!c.classes && c.identity?.class) {
      c.classes = [{ classId:String(c.identity.class).toLowerCase().replace(/\s+/g,'-'), level:num(c.identity.level,1), subclass:c.identity.subclass || '', source:'phb2014' }];
    }
    if (!Array.isArray(c.classes)) c.classes = [];
    c.classes = c.classes.map(x => ({
      classId:x.classId || 'fighter',
      level:clamp(Math.floor(num(x.level,1)),1,20),
      subclass:x.subclass || '', source:x.source || 'phb2014', options:clone(x.options || {}),
      features:clone(x.features || {}), resources:clone(x.resources || {})
    }));
    c.items = Array.isArray(c.items) ? c.items.map((item,i) => ({
      ...clone(item), id:item.id || `item-${i+1}`, quantity:Math.max(0,num(item.quantity,1)),
      equipment:{equipped:false,attuned:false,section:'miscellaneous',...(item.equipment || {})},
      modifiers:clone(item.modifiers || []), effects:clone(item.effects || []), mechanics:clone(item.mechanics || {})
    })) : [];
    c.feats = Array.isArray(c.feats) ? c.feats : [];
    c.spells = Array.isArray(c.spells) ? c.spells : [];
    c.abilities = Array.isArray(c.abilities) ? c.abilities : [];
    c.activeEffects = Array.isArray(c.activeEffects) ? c.activeEffects : [];
    c.conditions = Array.isArray(c.conditions) ? c.conditions : [];
    c.resistances = Array.isArray(c.resistances) ? c.resistances : [];
    c.immunities = Array.isArray(c.immunities) ? c.immunities : [];
    c.vulnerabilities = Array.isArray(c.vulnerabilities) ? c.vulnerabilities : [];
    return merge(DEFAULT, c);
  }

  function create(overrides={}) { return migrate(overrides); }
  function load() {
    try {
      const v = localStorage.getItem(KEY) || localStorage.getItem('dndCompanionCharacterV2');
      return v ? create(JSON.parse(v)) : create();
    } catch (e) { console.warn('D&D Companion v3: load failed', e); return create(); }
  }
  let state = load();
  function save() {
    state = create(state);
    localStorage.setItem(KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('dnd:character-changed'));
    return state;
  }
  function set(path, value) {
    const parts = String(path).split('.'); let o = state;
    parts.slice(0,-1).forEach(k => { if (!o[k] || typeof o[k] !== 'object') o[k] = {}; o = o[k]; });
    o[parts.at(-1)] = clone(value); return save();
  }

  function totalLevel(c=state) { return (c.classes || []).reduce((n,x) => n + num(x.level), 0) || 1; }
  function classLevel(c, id) { return (c.classes || []).filter(x => x.classId === id).reduce((n,x) => n + num(x.level), 0); }
  function classData(id) { return D.CLASSES?.[id] || null; }
  function sourceEnabled(c, source='phb2014') { return source === 'phb2014' || c.rules?.sources?.[source] !== false; }
  function profBonus(c=state) { return pb(totalLevel(c)); }

  function baseAbility(c, ability) { return num(c.abilityScores?.[ability],10); }
  function collectEffects(c) {
    const out = [];
    const add = (effect, source, sourceType) => {
      if (!effect || effect.active === false) return;
      out.push({...clone(effect), source:effect.source || source, sourceType:effect.sourceType || sourceType});
    };
    (c.activeEffects || []).forEach(e => add(e, e.source?.name || e.name || 'Effect', 'effect'));
    (c.items || []).forEach(item => {
      if (item.equipment?.equipped) (item.effects || []).forEach(e => add(e, item.name || 'Item', 'item'));
      if (item.equipment?.equipped) (item.modifiers || []).forEach(m => add({...m, effectType:'modifier'}, item.name || 'Item', 'item'));
    });
    (c.feats || []).forEach(feat => (feat.effects || []).forEach(e => add(e, feat.name || 'Feat', 'feat')));
    (c.abilities || []).forEach(feature => (feature.effects || []).forEach(e => add(e, feature.name || 'Feature', 'feature')));
    (c.origin?.traits || []).forEach(feature => (feature.effects || []).forEach(e => add(e, feature.name || 'Origin trait', 'origin')));
    return out;
  }
  function modifiers(c, target) {
    return collectEffects(c).filter(e => e.target === target || e.effectType === 'modifier' && e.target === target);
  }
  function apply(value, effects) {
    return effects.reduce((v,e) => {
      const n = num(e.value);
      switch (e.mode || 'add') {
        case 'set': return n;
        case 'subtract': return v - n;
        case 'multiply': return v * n;
        case 'min': return Math.max(v,n);
        case 'max': return Math.min(v,n);
        default: return v + n;
      }
    }, value);
  }
  function abilityScore(c,a) { return apply(baseAbility(c,a), modifiers(c,a)); }
  function abilityMod(c,a) { return mod(abilityScore(c,a)); }

  function proficiencyState(c, skillId) {
    return c.proficiencies?.skills?.[skillId] || {};
  }
  function skill(c, skillId) {
    const ability = D.SKILLS?.[skillId]; if (!ability) return 0;
    const p = proficiencyState(c,skillId); let value = abilityMod(c,ability);
    if (p.expertise) value += profBonus(c) * 2;
    else if (p.proficiency) value += profBonus(c);
    return apply(value, modifiers(c,`skill:${skillId}`));
  }
  function saveThrow(c, ability) {
    let value = abilityMod(c,ability);
    if ((c.proficiencies?.savingThrows || []).includes(ability)) value += profBonus(c);
    return apply(value, modifiers(c,`save:${ability}`));
  }

  function equipped(c, predicate) { return (c.items || []).filter(i => i.equipment?.equipped && (!predicate || predicate(i))); }
  function armor(c) { return equipped(c,i => i.mechanics?.type === 'armor')[0] || null; }
  function shield(c) { return equipped(c,i => i.mechanics?.type === 'shield')[0] || null; }
  function hasFeature(c,id) {
    return (c.abilities || []).some(x => x.id === id || x === id) || (c.feats || []).some(x => x.id === id || x === id) || (D.CLASS_FEATURES && Object.values(D.CLASS_FEATURES).some(list => list.some(f => f.id === id && classLevel(c,f.classId || Object.keys(D.CLASS_FEATURES).find(k => D.CLASS_FEATURES[k] === list)) >= f.level)));
  }
  function ac(c=state) {
    const ar=armor(c), sh=shield(c); let value=10+abilityMod(c,'dexterity');
    if (ar) {
      const m=ar.mechanics||{}, base=num(m.armorClass,10), cat=m.category||'light';
      if (cat==='heavy') value=base;
      else if (cat==='medium') value=base+Math.min(abilityMod(c,'dexterity'),num(m.dexterity?.maximum,2));
      else value=base+abilityMod(c,'dexterity');
    }
    if (sh) value += num(sh.mechanics?.armorBonus,2);
    if (!ar && !sh && hasFeature(c,'unarmored-defense-barbarian')) value=10+abilityMod(c,'dexterity')+abilityMod(c,'constitution');
    if (!ar && !sh && hasFeature(c,'unarmored-defense-monk')) value=10+abilityMod(c,'dexterity')+abilityMod(c,'wisdom');
    return apply(value,modifiers(c,'armorClass'));
  }
  function speed(c=state) {
    let value=num(c.identity?.speed,30); const ar=armor(c);
    if (ar && num(ar.mechanics?.strengthRequirement)>abilityScore(c,'strength')) value-=10;
    return apply(value,modifiers(c,'speed'));
  }
  function initiative(c=state) { return apply(abilityMod(c,'dexterity'),modifiers(c,'initiative')); }
  function carryingCapacity(c=state) { return abilityScore(c,'strength')*15; }
  function carriedWeight(c=state) { return (c.items||[]).reduce((n,i)=>n+num(i.weight)*Math.max(0,num(i.quantity,1)),0); }

  const FULL_CASTERS = new Set(['bard','cleric','druid','sorcerer','wizard']);
  const HALF_CASTERS = new Set(['paladin','ranger']);
  const THIRD_CASTERS = new Set(['fighter','rogue']);
  function classCastingType(c,cl) {
    if (FULL_CASTERS.has(cl.classId)) return 'full';
    if (HALF_CASTERS.has(cl.classId)) return 'half';
    if (cl.classId==='artificer') return 'artificer';
    if (THIRD_CASTERS.has(cl.classId)) {
      const sub=cl.subclass||'';
      if ((D.CLASS_RULES?.[cl.classId]?.spellcastingSubclasses || {})[sub]) return 'third';
      if (['eldritch-knight','arcane-trickster'].includes(sub)) return 'third';
    }
    return null;
  }
  function spellcastingProfiles(c=state) {
    return (c.classes||[]).map(cl=>({classId:cl.classId,level:num(cl.level),subclass:cl.subclass||'',ability:classData(cl.classId)?.spell,type:classCastingType(c,cl)})).filter(p=>p.type);
  }
  function spellAbility(c, sourceClass) { return spellcastingProfiles(c).find(p=>!sourceClass || p.classId===sourceClass)?.ability || null; }
  function spellAttack(c=state, sourceClass) { const a=spellAbility(c,sourceClass); return a ? apply(abilityMod(c,a)+profBonus(c),modifiers(c,'spellAttackBonus')) : null; }
  function spellDC(c=state, sourceClass) { const a=spellAbility(c,sourceClass); return a ? apply(8+abilityMod(c,a)+profBonus(c),modifiers(c,'spellSaveDC')) : null; }
  function spellcasterLevel(c=state) {
    return spellcastingProfiles(c).reduce((n,p)=>n+(p.type==='full'?p.level:p.type==='half'?Math.floor(p.level/2):p.type==='third'?Math.floor(p.level/3):Math.ceil(p.level/2)),0);
  }
  const SLOTS = D.SPELL_SLOTS || [];
  function spellSlots(c=state) {
    const level=clamp(spellcasterLevel(c),0,20), row=SLOTS[level] || [];
    const out=Object.fromEntries(row.map((n,i)=>[i+1,n]));
    const warlock=classLevel(c,'warlock');
    if(warlock){
      const count=warlock>=17?4:warlock>=11?3:warlock>=2?2:1;
      const slotLevel=warlock>=17?5:warlock>=11?5:warlock>=9?5:warlock>=7?4:warlock>=5?3:warlock>=3?2:1;
      out.pact={count,level:slotLevel};
    }
    return out;
  }
  function spellList(c, sourceClass) {
    const result=[];
    (c.spells||[]).forEach(s=>{if(!sourceClass || s.sourceClass===sourceClass) result.push(s);});
    (c.spellcasting?.additional?.[sourceClass]||[]).forEach(s=>result.push(s));
    return result;
  }
  function preparedSpells(c, sourceClass) { return c.spellcasting?.prepared?.[sourceClass] || []; }
  function knownSpells(c, sourceClass) { return c.spellcasting?.known?.[sourceClass] || spellList(c,sourceClass); }
  function spellbook(c, sourceClass) { return c.spellcasting?.spellbook?.[sourceClass] || []; }

  function hpMaximum(c=state) {
    let hp=0, first=true;
    (c.classes||[]).forEach(cl=>{const die=num(classData(cl.classId)?.hitDie,8), level=clamp(num(cl.level),0,20); if(!level)return; if(first){hp+=die+(level-1)*(Math.floor(die/2)+1);first=false;} else hp+=level*(Math.floor(die/2)+1);});
    hp += abilityMod(c,'constitution')*totalLevel(c);
    return Math.max(1,apply(hp,modifiers(c,'hitPointMaximum')));
  }
  function hitDice(c=state) { return Object.fromEntries((c.classes||[]).map(cl=>[cl.classId,{die:`d${num(classData(cl.classId)?.hitDie,8)}`,maximum:num(cl.level),current:num(c.resources?.hitDice?.[cl.classId]?.current,cl.level)}])); }
  function extraAttacks(c=state) {
    let attacks=1;
    (c.classes||[]).forEach(cl=>{
      if (['fighter'].includes(cl.classId) && num(cl.level)>=20) attacks=Math.max(attacks,4);
      else if (['fighter'].includes(cl.classId) && num(cl.level)>=11) attacks=Math.max(attacks,3);
      else if (['fighter','barbarian','monk','paladin','ranger'].includes(cl.classId) && num(cl.level)>=5) attacks=Math.max(attacks,2);
    });
    return attacks;
  }

  function itemAttunement(c,item) { return !item.attunementRequired || item.equipment?.attuned; }
  function attunedItems(c=state) { return equipped(c).filter(i=>itemAttunement(c,i)); }
  function magicItemCount(c=state) { return attunedItems(c).filter(i=>i.magic || i.rarity).length; }
  function canUseItem(c,item) {
    if (!item) return false;
    if (!item.equipment?.equipped && item.equipment?.equippedRequired) return false;
    if (item.attunementRequired && !item.equipment?.attuned) return false;
    const req=item.requirements||{};
    if(req.class && !classLevel(c,req.class)) return false;
    if(req.level && totalLevel(c)<num(req.level)) return false;
    if(req.race && c.identity?.race!==req.race) return false;
    return true;
  }

  function conditionState(c,type) { return (c.conditions||[]).find(x => (typeof x==='string'?x:x.id)===type) || null; }
  function hasCondition(c,type) { return !!conditionState(c,type); }
  function hasResistance(c,type) { return (c.resistances||[]).some(x=>(typeof x==='string'?x:x.type)===type); }
  function hasImmunity(c,type) { return (c.immunities||[]).some(x=>(typeof x==='string'?x:x.type)===type); }
  function hasVulnerability(c,type) { return (c.vulnerabilities||[]).some(x=>(typeof x==='string'?x:x.type)===type); }

  function featureSnapshot(c=state) {
    const out=[];
    (c.classes||[]).forEach(cl=>{
      const list=D.CLASS_FEATURES?.[cl.classId]||[];
      list.filter(f=>num(f.level)<=num(cl.level)).forEach(f=>out.push({...clone(f),classId:cl.classId,source:f.source||'phb2014'}));
    });
    (c.abilities||[]).forEach(f=>out.push({...clone(f),source:f.source||'custom'}));
    (c.feats||[]).forEach(f=>out.push({...clone(f),type:'feat',source:f.source||'custom'}));
    return out;
  }

  function summary(c=state) {
    const profiles=spellcastingProfiles(c), hp=hpMaximum(c);
    return {
      level:totalLevel(c), proficiencyBonus:profBonus(c),
      abilities:Object.fromEntries(ABILITIES.map(a=>[a,{score:abilityScore(c,a),modifier:abilityMod(c,a)}])),
      skills:Object.fromEntries(Object.keys(D.SKILLS||{}).map(k=>[k,skill(c,k)])),
      savingThrows:Object.fromEntries(ABILITIES.map(a=>[a,saveThrow(c,a)])),
      ac:ac(c), speed:speed(c), initiative:initiative(c), carryingCapacity:carryingCapacity(c), carriedWeight:carriedWeight(c),
      hpMaximum:hp, hitDice:hitDice(c), extraAttacks:extraAttacks(c),
      spellcastingProfiles:profiles, spellcasterLevel:spellcasterLevel(c), spellSlots:spellSlots(c),
      spellAbility:profiles[0]?.ability||null, spellAttackBonus:profiles[0]?spellAttack(c,profiles[0].classId):null,
      spellSaveDC:profiles[0]?spellDC(c,profiles[0].classId):null,
      features:featureSnapshot(c), conditions:clone(c.conditions||[]), resistances:clone(c.resistances||[]),
      immunities:clone(c.immunities||[]), vulnerabilities:clone(c.vulnerabilities||[]),
      attunedMagicItems:magicItemCount(c)
    };
  }

  function installCompatibility() {
    const previous=window.DnDEngineV2||{};
    const api={...previous,
      version:'3.0-foundation',state:()=>state,getState:()=>state,create,load,save,set,
      totalLevel,classLevel,profBonus,abilityScore,abilityMod,effectiveAbility:abilityScore,
      skill,saveThrow,ac,speed,initiative,carryingCapacity,carrying:carryingCapacity,carriedWeight:carriedWeight,weight:carriedWeight,
      spellcastingProfiles,spellAbility,spellAttack,spellDC,spellcasterLevel,spellSlots,slots:spellSlots,
      hpMaximum,hpMax:hpMaximum,hitDice,extraAttacks,features:featureSnapshot,summary,
      preparedSpells,knownSpells,spellList,spellbook,attunedItems,canUseItem,hasCondition,hasResistance,hasImmunity,hasVulnerability,
      modifiers,collectEffects
    };
    Object.defineProperty(api,'state',{get:()=>state});
    window.DnDEngineV3=api;
    window.DnDEngineV2=api;
  }

  installCompatibility();
})();
