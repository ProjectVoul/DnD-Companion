/* v3 rules correction layer — derived-rule corrections kept isolated until the data migration is complete. */
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
  const sourceEnabled=(c,source='phb2014')=>source==='phb2014'||c.rules?.sources?.[source]!==false;

  const castingType=cl=>{
    const configured=D.SPELLCASTING?.casterType?.[cl.classId];
    if(configured==='pact')return'pact';
    if(configured)return configured;
    if(FULL.has(cl.classId))return'full';
    if(HALF.has(cl.classId))return'half';
    if(cl.classId==='artificer')return'artificer';
    if(THIRD.has(cl.classId)){
      const sub=D.CLASS_RULES?.[cl.classId]?.spellcastingSubclasses?.[cl.subclass];
      if(sub)return sub;
      if(['eldritch-knight','arcane-trickster'].includes(cl.subclass))return'third';
    }
    return null;
  };

  const profiles=c=>(c.classes||[]).map(cl=>({
    classId:cl.classId,level:num(cl.level),subclass:cl.subclass||'',
    ability:D.CLASSES?.[cl.classId]?.spell||null,type:castingType(cl)
  })).filter(p=>p.type&&p.type!=='pact');

  const spellcasterLevel=c=>profiles(c).reduce((n,p)=>
    n+(p.type==='full'?p.level:p.type==='half'?Math.floor(p.level/2):p.type==='third'?Math.floor(p.level/3):p.type==='artificer'?Math.ceil(p.level/2):0),0);

  const spellAbility=(c,sourceClass)=>{
    if(sourceClass==='warlock'&&c.classes?.some(x=>x.classId==='warlock'))return D.CLASSES.warlock.spell;
    return (sourceClass?profiles(c).find(p=>p.classId===sourceClass):profiles(c)[0])?.ability||null;
  };
  const spellAttack=(c,sourceClass)=>{const a=spellAbility(c,sourceClass);return a?E.abilityMod(c,a)+E.profBonus(c):null;};
  const spellDC=(c,sourceClass)=>{const a=spellAbility(c,sourceClass);return a?8+E.abilityMod(c,a)+E.profBonus(c):null;};

  const spellSlots=c=>{
    const row=(D.SPELL_SLOTS||[])[Math.min(20,spellcasterLevel(c))]||[];
    const out=Object.fromEntries(row.map((n,i)=>[i+1,n]));
    const w=(c.classes||[]).filter(x=>x.classId==='warlock').reduce((n,x)=>n+num(x.level),0);
    if(w){const p=D.SPELLCASTING?.pactSlots?.[Math.min(20,w)];if(p)out.pact={count:p.slots,level:p.level};}
    return out;
  };

  /* Extra Attack is not additive across classes and only applies where the
     actual class/subclass grants it. The data table remains the source of truth. */
  const extraAttacks=c=>{
    let attacks=1;
    (c.classes||[]).forEach(cl=>{
      const level=num(cl.level),id=cl.classId;
      if(id==='artificer' && cl.subclass!=='battle-smith')return;
      if(id==='bard' && cl.subclass!=='valor')return;
      const table=D.EXTRA_ATTACK?.[id]||{};
      Object.keys(table).forEach(k=>{if(level>=num(k))attacks=Math.max(attacks,1+num(table[k]));});
      /* Safety net for the PHB core classes if a data table is unavailable. */
      if(['barbarian','fighter','monk','paladin','ranger'].includes(id)&&level>=5)attacks=Math.max(attacks,2);
      if(id==='fighter'&&level>=11)attacks=Math.max(attacks,3);
      if(id==='fighter'&&level>=20)attacks=Math.max(attacks,4);
    });
    return attacks;
  };

  const requiresAttunement=i=>!!(i?.attunementRequired||i?.requiresAttunement||i?.attunement?.required);
  const attunementCapacity=c=>{
    const a=E.classLevel(c,'artificer');
    if(a>=18)return 6;
    if(a>=14)return 4;
    return 3;
  };
  const attunedItems=c=>(c.items||[]).filter(i=>i.equipment?.equipped&&i.equipment?.attuned);
  const magicItemCount=c=>attunedItems(c).filter(i=>requiresAttunement(i)||i.magic||i.rarity).length;
  const canAttuneItem=(c,item)=>{
    if(!item||!requiresAttunement(item))return true;
    if(item.equipment?.attuned)return true;
    return magicItemCount(c)<attunementCapacity(c);
  };
  const canUseItem=(c,item)=>{
    if(!item)return false;
    if(item.equipment?.equippedRequired&&!item.equipment?.equipped)return false;
    if(requiresAttunement(item)&&!item.equipment?.attuned)return false;
    if(item.equipment?.attuned&&!canAttuneItem(c,item))return false;
    const req=item.requirements||{};
    if(req.class&&!(Array.isArray(req.class)?req.class.some(id=>E.classLevel(c,id)):E.classLevel(c,req.class)))return false;
    if(req.level&&E.totalLevel(c)<num(req.level))return false;
    if(req.race&&c.identity?.race!==req.race)return false;
    return true;
  };

  const collectEffects=c=>{
    const out=[];const add=(e,s,t)=>{if(e&&e.active!==false)out.push({...clone(e),source:e.source||s,sourceType:e.sourceType||t});};
    (c.activeEffects||[]).forEach(e=>add(e,e.source?.name||e.name||'Effect','effect'));
    (c.items||[]).forEach(i=>{if(i.equipment?.equipped&&(!requiresAttunement(i)||i.equipment?.attuned)){
      (i.effects||[]).forEach(e=>add(e,i.name||'Item','item'));
      (i.modifiers||[]).forEach(m=>add({...m,effectType:'modifier'},i.name||'Item','item'));
    }});
    (c.feats||[]).forEach(f=>(f.effects||[]).forEach(e=>add(e,f.name||'Feat','feat')));
    (c.abilities||[]).forEach(f=>(f.effects||[]).forEach(e=>add(e,f.name||'Feature','feature')));
    (c.origin?.traits||[]).forEach(f=>(f.effects||[]).forEach(e=>add(e,f.name||'Origin trait','origin')));
    return out;
  };
  const modifiers=(c,target)=>collectEffects(c).filter(e=>e.target===target);

  const featureSnapshot=c=>{
    const out=[];
    (c.classes||[]).forEach(cl=>{
      const list=D.CLASS_FEATURES?.[cl.classId]||[];
      list.filter(f=>num(f.level)<=num(cl.level)).forEach(f=>out.push({...clone(f),classId:cl.classId,source:f.source||'phb2014'}));
      const sub=D.SUBCLASS_FEATURES?.[cl.classId]?.[cl.subclass]||[];
      sub.filter(f=>num(f.level)<=num(cl.level)&&sourceEnabled(c,f.source||'phb2014')).forEach(f=>out.push({...clone(f),classId:cl.classId,subclass:cl.subclass,source:f.source||'phb2014'}));
    });
    (c.abilities||[]).forEach(f=>out.push({...clone(f),source:f.source||'custom'}));
    (c.feats||[]).forEach(f=>out.push({...clone(f),type:'feat',source:f.source||'custom'}));
    return out.sort((a,b)=>num(a.level)-num(b.level));
  };

  const summary=c=>({
    level:E.totalLevel(c),proficiencyBonus:E.profBonus(c),
    abilities:Object.fromEntries((D.ABILITIES||[]).map(a=>[a,{score:E.abilityScore(c,a),modifier:E.abilityMod(c,a)}])),
    skills:Object.fromEntries(Object.keys(D.SKILLS||{}).map(k=>[k,E.skill(c,k)])),
    savingThrows:Object.fromEntries((D.ABILITIES||[]).map(a=>[a,E.saveThrow(c,a)])),
    ac:E.ac(c),speed:E.speed(c),initiative:E.initiative(c),carryingCapacity:E.carryingCapacity(c),carriedWeight:E.carriedWeight(c),
    hpMaximum:E.hpMaximum(c),hitDice:E.hitDice(c),extraAttacks:extraAttacks(c),spellcastingProfiles:profiles(c),spellcasterLevel:spellcasterLevel(c),spellSlots:spellSlots(c),
    spellAbility:spellAbility(c),spellAttackBonus:spellAttack(c),spellSaveDC:spellDC(c),features:featureSnapshot(c),
    conditions:clone(c.conditions||[]),resistances:clone(c.resistances||[]),immunities:clone(c.immunities||[]),vulnerabilities:clone(c.vulnerabilities||[]),
    attunedMagicItems:magicItemCount(c),attunementCapacity:attunementCapacity(c)
  });

  Object.assign(E,{spellcastingProfiles:profiles,spellcasterLevel,spellAbility,spellAttack,spellDC,spellSlots,slots:spellSlots,extraAttacks,collectEffects,modifiers,attunedItems,magicItemCount,attunementCapacity,canAttuneItem,canUseItem,features:featureSnapshot,summary});
  window.DnDEngineV3=E;window.DnDEngineV2=E;
})();
