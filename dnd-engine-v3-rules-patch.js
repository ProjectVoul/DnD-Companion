/* v3 rules correction layer. This is intentionally small and will be folded into dnd-engine-v3.js after the data migration pass. */
(() => {
  'use strict';
  const E=window.DnDEngineV3||window.DnDEngineV2;
  const D=window.DnDDataV2||{};
  if(!E)return;
  const clone=v=>JSON.parse(JSON.stringify(v));
  const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
  const FULL=new Set(['bard','cleric','druid','sorcerer','wizard']);
  const HALF=new Set(['paladin','ranger']);
  const THIRD=new Set(['fighter','rogue']);
  const castingType=cl=>{
    const configured=D.SPELLCASTING?.casterType?.[cl.classId];
    if(configured)return configured;
    if(FULL.has(cl.classId))return'full';
    if(HALF.has(cl.classId))return'half';
    if(cl.classId==='artificer')return'artificer';
    if(THIRD.has(cl.classId)){
      const sub=D.SPELLCASTING?.spellcastingSubclasses?.[cl.classId]?.[cl.subclass]||D.CLASS_RULES?.[cl.classId]?.spellcastingSubclasses?.[cl.subclass];
      if(sub)return sub;
      if(['eldritch-knight','arcane-trickster'].includes(cl.subclass))return'third';
    }
    return null;
  };
  const profiles=c=>(c.classes||[]).map(cl=>({classId:cl.classId,level:num(cl.level),subclass:cl.subclass||'',ability:D.CLASSES?.[cl.classId]?.spell||null,type:castingType(cl)})).filter(p=>p.type);
  const spellcasterLevel=c=>profiles(c).reduce((n,p)=>n+(p.type==='full'?p.level:p.type==='half'?Math.floor(p.level/2):p.type==='third'?Math.floor(p.level/3):p.type==='artificer'?Math.ceil(p.level/2):0),0);
  const spellAbility=(c,sourceClass)=>profiles(c).find(p=>!sourceClass||p.classId===sourceClass)?.ability||null;
  const spellAttack=(c,sourceClass)=>{const a=spellAbility(c,sourceClass);return a?E.abilityMod(c,a)+E.profBonus(c):null;};
  const spellDC=(c,sourceClass)=>{const a=spellAbility(c,sourceClass);return a?8+E.abilityMod(c,a)+E.profBonus(c):null;};
  const spellSlots=c=>{
    const row=(D.SPELL_SLOTS||[])[Math.min(20,spellcasterLevel(c))]||[];
    const out=Object.fromEntries(row.map((n,i)=>[i+1,n]));
    const w=(c.classes||[]).filter(x=>x.classId==='warlock').reduce((n,x)=>n+num(x.level),0);
    if(w){const p=D.SPELLCASTING?.pactSlots?.[Math.min(20,w)];if(p)out.pact={count:p.slots,level:p.level};}
    return out;
  };
  const requiresAttunement=i=>!!(i?.attunementRequired||i?.requiresAttunement||i?.attunement?.required);
  const itemUsable=(c,i)=>!requiresAttunement(i)||!!i.equipment?.attuned;
  const collectEffects=c=>{
    const out=[];const add=(e,s,t)=>{if(e&&e.active!==false)out.push({...clone(e),source:e.source||s,sourceType:e.sourceType||t});};
    (c.activeEffects||[]).forEach(e=>add(e,e.source?.name||e.name||'Effect','effect'));
    (c.items||[]).forEach(i=>{if(i.equipment?.equipped&&itemUsable(c,i)){(i.effects||[]).forEach(e=>add(e,i.name||'Item','item'));(i.modifiers||[]).forEach(m=>add({...m,effectType:'modifier'},i.name||'Item','item'));}});
    (c.feats||[]).forEach(f=>(f.effects||[]).forEach(e=>add(e,f.name||'Feat','feat')));
    (c.abilities||[]).forEach(f=>(f.effects||[]).forEach(e=>add(e,f.name||'Feature','feature')));
    (c.origin?.traits||[]).forEach(f=>(f.effects||[]).forEach(e=>add(e,f.name||'Origin trait','origin')));
    return out;
  };
  const modifiers=(c,target)=>collectEffects(c).filter(e=>e.target===target);
  const attunedItems=c=>(c.items||[]).filter(i=>i.equipment?.equipped&&i.equipment?.attuned);
  const attunementCapacity=c=>{const a=E.classLevel(c,'artificer');return a>=18?6:a>=14?5:3;};
  const magicItemCount=c=>attunedItems(c).filter(i=>i.magic||i.rarity||requiresAttunement(i)).length;
  const summary=c=>({
    level:E.totalLevel(c),proficiencyBonus:E.profBonus(c),
    abilities:Object.fromEntries((D.ABILITIES||[]).map(a=>[a,{score:E.abilityScore(c,a),modifier:E.abilityMod(c,a)}])),
    skills:Object.fromEntries(Object.keys(D.SKILLS||{}).map(k=>[k,E.skill(c,k)])),
    savingThrows:Object.fromEntries((D.ABILITIES||[]).map(a=>[a,E.saveThrow(c,a)])),
    ac:E.ac(c),speed:E.speed(c),initiative:E.initiative(c),carryingCapacity:E.carryingCapacity(c),carriedWeight:E.carriedWeight(c),
    hpMaximum:E.hpMaximum(c),hitDice:E.hitDice(c),extraAttacks:E.extraAttacks(c),spellcastingProfiles:profiles(c),spellcasterLevel:spellcasterLevel(c),spellSlots:spellSlots(c),
    spellAbility:spellAbility(c),spellAttackBonus:spellAttack(c),spellSaveDC:spellDC(c),features:E.features(c),conditions:clone(c.conditions||[]),resistances:clone(c.resistances||[]),immunities:clone(c.immunities||[]),vulnerabilities:clone(c.vulnerabilities||[]),attunedMagicItems:magicItemCount(c),attunementCapacity:attunementCapacity(c)
  });
  Object.assign(E,{spellcastingProfiles:profiles,spellcasterLevel,spellAbility,spellAttack,spellDC,spellSlots,slots:spellSlots,collectEffects,modifiers,attunedItems,magicItemCount,attunementCapacity,summary});
  window.DnDEngineV3=E;window.DnDEngineV2=E;
})();
