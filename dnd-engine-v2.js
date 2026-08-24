/* D&D Companion v2 — single source of truth for character calculations. */
(() => {
  'use strict';
  const D=window.DnDDataV2;
  const KEY='dndCompanionCharacterV2';
  const clone=v=>JSON.parse(JSON.stringify(v));
  const mod=score=>Math.floor(((Number(score)||0)-10)/2);
  const pb=level=>2+Math.floor((Math.max(1,Number(level)||1)-1)/4);
  const deep=(base,extra)=>{
    if(Array.isArray(base))return Array.isArray(extra)?clone(extra):clone(base);
    if(base&&typeof base==='object'){const o={},e=extra&&typeof extra==='object'&&!Array.isArray(extra)?extra:{};Object.keys(base).forEach(k=>o[k]=deep(base[k],e[k]));Object.keys(e).forEach(k=>{if(!(k in o))o[k]=e[k]});return o;}
    return extra===undefined?base:extra;
  };
  const DEFAULT={
    schemaVersion:2,ruleset:'5e-2014',
    rules:{sources:{phb2014:true,xanathar:true,tasha:true},optionalFeatures:{}},
    identity:{name:'',race:'',background:'',alignment:'',size:'Medium',speed:30,appearance:''},
    classes:[],abilityScores:{strength:10,dexterity:10,constitution:10,intelligence:10,wisdom:10,charisma:10},
    proficiencies:{skills:{},savingThrows:[],weapons:[],armor:[],tools:[],languages:[]},
    origin:{race:'',traits:[],customOrigin:false,abilityBonuses:{}},
    items:[],spells:[],abilities:[],activeEffects:[],resources:{hp:{current:1,maximum:1,temporary:0},hitDice:{},deathSaves:{successes:0,failures:0},inspiration:false,spellSlots:{}},
    notes:''
  };
  const migrate=old=>{
    const c=clone(old||{});
    if(!c.classes&&c.identity?.class)c.classes=[{classId:String(c.identity.class).toLowerCase().replace(/\s+/g,'-'),level:Number(c.identity.level)||1,subclass:c.identity.subclass||'',source:'phb2014'}];
    if(!c.classes?.length)c.classes=[{classId:'fighter',level:1,subclass:'',source:'phb2014'}];
    c.classes=c.classes.map(x=>({...x,classId:x.classId||'fighter',level:Math.max(1,Math.min(20,Number(x.level)||1)),source:x.source||'phb2014'}));
    c.rules=c.rules||DEFAULT.rules;c.rules.sources={...DEFAULT.rules.sources,...(c.rules.sources||{})};c.rules.optionalFeatures=c.rules.optionalFeatures||{};
    if(c.items)c.items=c.items.map((x,i)=>{const item=clone(x);item.id=item.id||`item-${i+1}`;item.inventorySection=item.inventorySection||(item.equipment?.equipped?'equipment':'miscellaneous');return item});
    return c;
  };
  function create(overrides={}){return deep(DEFAULT,migrate(overrides));}
  function load(){try{const v=localStorage.getItem(KEY);if(v)return create(JSON.parse(v));const legacy=localStorage.getItem('dndCompanionCharacterEngine');if(legacy)return create(JSON.parse(legacy));}catch(e){console.warn('D&D Companion: load failed',e)}return create();}
  let state=load();
  function save(){state=create(state);localStorage.setItem(KEY,JSON.stringify(state));window.dispatchEvent(new CustomEvent('dnd:character-changed'));return state;}
  function set(path,value){const parts=path.split('.');let o=state;parts.slice(0,-1).forEach(k=>{if(!o[k]||typeof o[k]!=='object')o[k]={};o=o[k]});o[parts.at(-1)]=value;save();}
  function totalLevel(c=state){return(c.classes||[]).reduce((n,x)=>n+(Number(x.level)||0),0)||1;}
  function classLevels(c=state){return c.classes||[];}
  function classData(id){return D.CLASSES[id]||null;}
  function classRule(id){return D.CLASS_RULES?.[id]||{};}
  function activeSource(source,c=state){return source==='phb2014'||c.rules.sources[source]!==false;}
  function profBonus(c=state){return pb(totalLevel(c));}
  function abilityScore(c,a){return Number(c.abilityScores?.[a])||0;}
  function abilityMod(c,a){return mod(abilityScore(c,a));}
  function itemModifiers(c,target){return(c.items||[]).filter(i=>i.equipment?.equipped).flatMap(i=>(i.modifiers||[]).filter(m=>m.target===target).map(m=>({...m,sourceName:i.name||'Item'})));}
  function effectModifiers(c,target){return(c.activeEffects||[]).filter(e=>e.active!==false&&e.target===target).map(e=>({...e,sourceName:e.source?.name||e.name||'Effect'}));}
  function modifiers(c,target){return[...itemModifiers(c,target),...effectModifiers(c,target)];}
  function apply(value,mods){return mods.reduce((v,m)=>{const n=Number(m.value)||0;switch(m.mode){case'subtract':return v-n;case'multiply':return v*n;case'set':return n;default:return v+n}},value);}
  function effectiveAbility(c,a){return apply(abilityScore(c,a),modifiers(c,a));}
  function skill(c,id){const a=D.SKILLS[id];if(!a)return 0;const p=c.proficiencies?.skills?.[id]||{};let v=mod(effectiveAbility(c,a));if(p.proficiency)v+=profBonus(c);if(p.expertise&&!p.proficiency)v+=profBonus(c);if(p.expertise&&p.proficiency)v+=profBonus(c);return apply(v,modifiers(c,`skill:${id}`));}
  function saveThrow(c,a){let v=mod(effectiveAbility(c,a));if((c.proficiencies?.savingThrows||[]).includes(a))v+=profBonus(c);return apply(v,modifiers(c,`save:${a}`));}
  function classLevel(c,id){return classLevels(c).filter(x=>x.classId===id).reduce((n,x)=>n+(Number(x.level)||0),0);}
  function subclasses(c){return classLevels(c).filter(x=>x.subclass).map(x=>D.SUBCLASSES.find(s=>s.id===x.subclass&&s.classId===x.classId&&activeSource(s.source,c))).filter(Boolean);}
  function subclassLevel(c,id){const cl=classLevels(c).find(x=>x.classId===id);return cl?.subclass?Number(cl.level)||0:0;}
  function asiChoices(c=state){const out=[];classLevels(c).forEach(cl=>(D.ASI_LEVELS?.[cl.classId]||[]).filter(l=>l<=(Number(cl.level)||0)).forEach(level=>out.push({classId:cl.classId,level,type:'asi-or-feat'})));return out;}
  function features(c=state){
    const out=[];
    classLevels(c).forEach(cl=>{
      const l=Number(cl.level)||0;
      (D.CLASS_FEATURES[cl.classId]||[]).filter(f=>f.level<=l).forEach(f=>out.push({...f,classId:cl.classId}));
      (D.ASI_LEVELS?.[cl.classId]||[]).filter(x=>x<=l).forEach(level=>out.push({level,id:`asi-${cl.classId}-${level}`,name:'Ability Score Improvement / Feat',classId:cl.classId,choice:true}));
      const sub=D.SUBCLASSES.find(s=>s.classId===cl.classId&&s.id===cl.subclass&&activeSource(s.source,c));
      if(sub)(D.SUBCLASS_LEVELS?.[cl.classId]||[]).filter(x=>x<=l).forEach(level=>out.push({level,id:`subclass-${cl.classId}-${sub.id}-${level}`,name:`${sub.name} feature`,classId:cl.classId,subclass:sub.id,choice:true,source:sub.source}));
    });
    return out.sort((a,b)=>a.level-b.level);
  }
  function hasFeature(c,id){return features(c).some(f=>f.id===id)||!!(c.abilities||[]).find(a=>a.id===id||a===id);}
  function extraAttacks(c=state){let n=1;classLevels(c).forEach(cl=>{const table=D.EXTRA_ATTACK?.[cl.classId]||{};Object.keys(table).forEach(k=>{if((Number(cl.level)||0)>=Number(k))n=Math.max(n,1+Number(table[k]));});const sub=D.CLASS_RULES?.[cl.classId]?.spellcastingSubclasses?.[cl.subclass];if(sub==='third'&&Number(cl.level)>=7){}});return n;}
  function armor(c){return(c.items||[]).find(i=>i.equipment?.equipped&&i.mechanics?.type==='armor')||null;}
  function shield(c){return(c.items||[]).find(i=>i.equipment?.equipped&&i.mechanics?.type==='shield')||null;}
  function ac(c=state){
    const ar=armor(c),sh=shield(c),dex=mod(effectiveAbility(c,'dexterity'));let v=10+dex;
    if(ar){const m=ar.mechanics||{},base=Number(m.armorClass)||10,cat=m.category||'light';if(cat==='heavy')v=base;else if(cat==='medium')v=base+Math.min(dex,Number(m.dexterity?.maximum??2));else v=base+dex;}
    if(sh)v+=Number(sh.mechanics?.armorBonus)||2;
    if(hasFeature(c,'unarmored-defense-barbarian')&&!ar&&!sh)v=10+mod(effectiveAbility(c,'dexterity'))+mod(effectiveAbility(c,'constitution'));
    if(hasFeature(c,'unarmored-defense-monk')&&!ar&&!sh)v=10+mod(effectiveAbility(c,'dexterity'))+mod(effectiveAbility(c,'wisdom'));
    return apply(v,modifiers(c,'armorClass'));
  }
  function speed(c=state){let v=Number(c.identity?.speed)||30;const ar=armor(c);if((Number(ar?.mechanics?.strengthRequirement)||0)>effectiveAbility(c,'strength'))v-=10;return apply(v,modifiers(c,'speed'));}
  function initiative(c=state){return apply(mod(effectiveAbility(c,'dexterity')),modifiers(c,'initiative'));}
  function carrying(c=state){return effectiveAbility(c,'strength')*15;}
  function weight(c=state){return(c.items||[]).reduce((n,i)=>n+(Number(i.weight)||0)*(Number(i.quantity)||0),0);}
  function spellcastingProfiles(c=state){
    const profiles=[];
    classLevels(c).forEach(cl=>{
      const id=cl.classId,l=Number(cl.level)||0,d=classData(id);if(!d)return;
      let type=D.SPELLCASTING?.casterType?.[id]||null;
      if(!type&&D.CLASS_RULES?.[id]?.spellcastingSubclasses?.[cl.subclass])type=D.CLASS_RULES[id].spellcastingSubclasses[cl.subclass];
      if(type)profiles.push({classId:id,level:l,ability:d.spell,type,subclass:cl.subclass||null});
    });
    return profiles;
  }
  function spellAbility(c=state,sourceClass=null){const p=spellcastingProfiles(c).find(x=>!sourceClass||x.classId===sourceClass);return p?.ability||null;}
  function spellAttack(c=state,sourceClass=null){const a=spellAbility(c,sourceClass);return a?apply(mod(effectiveAbility(c,a))+profBonus(c),modifiers(c,'spellAttackBonus')):null;}
  function spellDC(c=state,sourceClass=null){const a=spellAbility(c,sourceClass);return a?apply(8+mod(effectiveAbility(c,a))+profBonus(c),modifiers(c,'spellSaveDC')):null;}
  function spellcasterLevel(c=state){
    let total=0;
    spellcastingProfiles(c).forEach(p=>{if(p.type==='full')total+=p.level;else if(p.type==='half')total+=Math.floor(p.level/2);else if(p.type==='third')total+=Math.floor(p.level/3);else if(p.type==='artificer')total+=Math.ceil(p.level/2);});
    return total;
  }
  function slots(c=state){
    const l=Math.min(20,spellcasterLevel(c)),row=D.SPELL_SLOTS[l]||[];
    const result=Object.fromEntries(row.map((n,i)=>[i+1,n]));
    const pact=classLevel(c,'warlock');if(pact){const p=D.SPELLCASTING?.pactSlots?.[Math.min(20,pact)];if(p)result.pact={count:p.slots,level:p.level};}
    return result;
  }
  function hitDice(c=state){return Object.fromEntries(classLevels(c).map(cl=>[cl.classId,{die:`d${classData(cl.classId)?.hitDie||8}`,maximum:Number(cl.level)||0,current:Number(c.resources?.hitDice?.[cl.classId]?.current??cl.level)||0}]));}
  function hpMax(c=state){
    let total=0,first=true;
    classLevels(c).forEach(cl=>{const die=classData(cl.classId)?.hitDie||8,l=Math.max(0,Number(cl.level)||0);if(!l)return;if(first){total+=die;total+=(l-1)*(Math.floor(die/2)+1);first=false;}else total+=l*(Math.floor(die/2)+1);});
    total+=mod(effectiveAbility(c,'constitution'))*totalLevel(c);
    return Math.max(1,apply(total,modifiers(c,'hitPointMaximum')));
  }
  function weaponAbility(c,item){const atk=item?.mechanics?.attack||{},props=item?.mechanics?.properties||[];if(props.includes('finesse')){if(['strength','dexterity'].includes(atk.ability))return atk.ability;return abilityMod(c,'dexterity')>=abilityMod(c,'strength')?'dexterity':'strength';}return atk.ability||(atk.type==='ranged'?'dexterity':'strength');}
  function attack(c,item){if(!item||item.mechanics?.type!=='weapon')return null;const a=weaponAbility(c,item),atk=item.mechanics.attack||{};return{ability:a,bonus:apply(abilityMod(c,a)+(atk.proficient!==false?profBonus(c):0)+(Number(atk.bonus)||0),modifiers(c,'weaponAttackBonus')),attacks:extraAttacks(c),damage:(item.mechanics.damage||[]).map(d=>({dice:d.dice,type:d.type,modifier:(Number(d.modifier)||0)+abilityMod(c,d.ability||a)}))};}
  function meetsPrerequisite(c,req){if(!req)return true;if(req.and)return req.and.every(x=>meetsPrerequisite(c,x));if(req.or)return req.or.some(x=>meetsPrerequisite(c,x));return Object.entries(req).every(([a,n])=>abilityScore(c,a)>=Number(n));}
  function canMulticlassInto(c,classId){if(!D.CLASSES[classId])return false;return meetsPrerequisite(c,D.MULTICLASS?.prerequisites?.[classId]);}
  function availableSubclasses(c,classId){const cl=classLevels(c).find(x=>x.classId===classId);const l=Number(cl?.level)||0,need=(D.SUBCLASS_LEVELS?.[classId]||[])[0];return D.SUBCLASSES.filter(s=>s.classId===classId&&activeSource(s.source,c)&&l>=need);}
  function summary(c=state){
    const hp=hpMax(c),profiles=spellcastingProfiles(c),sourceSummary=Object.values(D.SOURCES).map(s=>({...s,enabled:s.source==='phb2014'||c.rules.sources[s.id]!==false}));
    return{level:totalLevel(c),proficiencyBonus:profBonus(c),abilities:Object.fromEntries(D.ABILITIES.map(a=>[a,{score:effectiveAbility(c,a),modifier:mod(effectiveAbility(c,a))}])),ac:ac(c),speed:speed(c),initiative:initiative(c),carryingCapacity:carrying(c),carriedWeight:weight(c),hpMaximum:hp,spellcastingLevel:spellcasterLevel(c),spellcastingProfiles:profiles,spellAbility:profiles[0]?.ability||null,spellAttackBonus:profiles[0]?spellAttack(c,profiles[0].classId):null,spellSaveDC:profiles[0]?spellDC(c,profiles[0].classId):null,spellSlots:slots(c),hitDice:hitDice(c),extraAttacks:extraAttacks(c),subclasses:subclasses(c),features:features(c),asiChoices:asiChoices(c),sources:sourceSummary};
  }
  window.DnDEngineV2={get state(){return state},load,save,set,create,summary,abilityScore,abilityMod,effectiveAbility,skill,saveThrow,profBonus,totalLevel,classLevels,classLevel,classData,classRule,subclasses,subclassLevel,features,asiChoices,hasFeature,extraAttacks,ac,speed,initiative,carrying,weight,spellcastingProfiles,spellAbility,spellAttack,spellDC,spellcasterLevel,slots,hpMax,hitDice,attack,meetsPrerequisite,canMulticlassInto,availableSubclasses,modifiers,D};
})();