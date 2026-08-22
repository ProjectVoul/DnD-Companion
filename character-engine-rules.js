/* D&D Companion — 5e 2014 rules / combat calculation layer */
(() => {
  'use strict';
  const engine=window.DnDCharacterEngine;if(!engine)return;
  const calculator=engine.calculator,ABILITIES=engine.abilities,clone=v=>JSON.parse(JSON.stringify(v));
  const abilityModifier=score=>Math.floor(((Number(score)||0)-10)/2);
  const proficiencyBonus=level=>{const l=Math.max(1,Number(level)||1);return 2+Math.floor((l-1)/4);};
  const isEquipped=item=>item?.equipment?.equipped===true||item?.equipped===true;
  function getAllModifiers(character){
    const modifiers=[];
    (character.items||[]).forEach(item=>{if(!isEquipped(item))return;(item.modifiers||[]).forEach(m=>modifiers.push({...m,source:m.source||{type:'item',id:item.id},sourceName:m.sourceName||item.name||'Item'}));});
    (character.activeEffects||[]).filter(effect=>effect?.active!==false).forEach(effect=>modifiers.push({id:effect.id,source:effect.source,sourceName:effect.source?.name||effect.name||'Active Effect',target:effect.target,mode:effect.mode,value:effect.value,condition:effect.condition}));
    return modifiers;
  }
  const getTargetModifiers=(character,target)=>getAllModifiers(character).filter(m=>m.target===target);
  function applyModifier(value,modifier){const x=Number(modifier.value)||0;switch(modifier.mode){case'subtract':return value-x;case'multiply':return value*x;case'set':return x;default:return value+x;}}
  const applyTargetModifiers=(value,character,target)=>getTargetModifiers(character,target).reduce(applyModifier,value);
  function getEffectiveAbilityScore(character,ability){const base=Number(character.abilityScores?.[ability])||0;const racial=Number(character.abilityScoreBonuses?.[ability])||0;return applyTargetModifiers(base+racial,character,ability);}
  const getAbilityModifier=(character,ability)=>abilityModifier(getEffectiveAbilityScore(character,ability));
  function getWeaponAbility(character,item){const m=item?.mechanics||{},a=m.attack||{},p=m.properties||[];if(p.includes('finesse')){const choice=a.ability||character.weaponChoices?.[item.id];return choice==='strength'||choice==='dexterity'?choice:null;}if(ABILITIES.includes(a.ability))return a.ability;return a.type==='ranged'?'dexterity':'strength';}
  function weaponProficient(character,item){const prof=item?.proficiency,list=character.proficiencies?.weapons||[];if(!prof||prof.type==='none')return list.includes(item.name);if(list.includes(item.name))return true;if(prof.type==='simple')return list.includes('simple')||list.includes('Simple weapons')||list.includes('simple weapons');if(prof.type==='martial')return list.includes('martial')||list.includes('Martial weapons')||list.includes('martial weapons');return false;}
  function getWeaponAttackBonus(character,item){if(!item||item.mechanics?.type!=='weapon')return null;const ability=getWeaponAbility(character,item);if(!ability)return null;const proficiency=weaponProficient(character,item)?proficiencyBonus(character.identity.level):0;return applyTargetModifiers(getAbilityModifier(character,ability)+proficiency+(Number(item.mechanics?.attack?.bonus)||0),character,'weaponAttackBonus');}
  function getWeaponDamage(character,item){if(!item||item.mechanics?.type!=='weapon')return[];const attackAbility=getWeaponAbility(character,item);if(!attackAbility)return[];return(item.mechanics.damage||[]).map(d=>{const damageAbility=ABILITIES.includes(d?.ability)?d.ability:attackAbility;return{dice:clone(d.dice||{count:0,die:null}),type:d.type,ability:damageAbility,modifier:(Number(d.modifier)||0)+getAbilityModifier(character,damageAbility),source:d.source||{type:'item',id:item.id}};});}
  const getEquippedArmor=character=>(character.items||[]).find(item=>isEquipped(item)&&item?.mechanics?.type==='armor')||null;
  const getEquippedShield=character=>(character.items||[]).find(item=>isEquipped(item)&&item?.mechanics?.type==='shield')||null;
  function getArmorClassBreakdown(character){
    const armor=getEquippedArmor(character),shield=getEquippedShield(character),entries=[];let total;
    if(!armor){total=10+getAbilityModifier(character,'dexterity');entries.push({source:{type:'rules',id:'unarmored-ac'},label:'Unarmored base AC',mode:'set',value:10});const dex=getAbilityModifier(character,'dexterity');if(dex)entries.push({source:{type:'ability',id:'dexterity'},label:'Dexterity modifier',mode:'add',value:dex});}
    else{const m=armor.mechanics||{},base=Number(m.armorClass)||10,category=m.category||'light';total=base;entries.push({source:{type:'item',id:armor.id},label:armor.name||'Armor',mode:'set',value:base});if(category!=='heavy'&&m.dexterity?.applies!==false){const dex=getAbilityModifier(character,'dexterity'),max=category==='medium'?(m.dexterity?.maximum??2):null,contribution=max===null?dex:Math.min(dex,Number(max));if(contribution)entries.push({source:{type:'ability',id:'dexterity'},label:max===null?'Dexterity modifier':'Dexterity modifier (medium armor cap)',mode:'add',value:contribution});total+=contribution;}}
    if(shield){const bonus=Number(shield.mechanics?.armorBonus)||0;if(bonus){entries.push({source:{type:'item',id:shield.id},label:shield.name||'Shield',mode:'add',value:bonus});total+=bonus;}}
    // Only modifiers that are not already represented by the equipped armor/shield
    // mechanics are applied here. Legacy duplicate item modifiers are removed by runtime-fix.
    getTargetModifiers(character,'armorClass').forEach(m=>{const sourceId=m.source?.id;const duplicate=sourceId&&(sourceId===armor?.id||sourceId===shield?.id);if(duplicate)return;entries.push({source:m.source,label:m.sourceName||'Modifier',mode:m.mode,value:Number(m.value)||0,condition:m.condition||null});total=applyModifier(total,m);});
    let running=0;const breakdown=entries.map(entry=>{running=entry.mode==='set'?Number(entry.value)||0:applyModifier(running,entry);return{...entry,result:running};});return{total,breakdown,armorId:armor?.id||null,shieldId:shield?.id||null,calculation:armor?'standard-armor':'unarmored'};
  }
  const getArmorClass=character=>getArmorClassBreakdown(character).total;
  function getSpeedBreakdown(character){const entries=[];let total=Number(character.baseSpeed);if(!Number.isFinite(total))total=30;entries.push({source:{type:'character',id:'base-speed'},label:'Base speed',mode:'set',value:total});const armor=getEquippedArmor(character),req=Number(armor?.mechanics?.strengthRequirement)||0,strength=getEffectiveAbilityScore(character,'strength');if(req>0&&strength<req){entries.push({source:{type:'rules',id:'heavy-armor-strength'},label:'Armor Strength requirement',mode:'subtract',value:10,condition:`Strength ${strength} < ${req}`});total-=10;}getTargetModifiers(character,'speed').forEach(m=>{entries.push({source:m.source,label:m.sourceName||'Speed modifier',mode:m.mode,value:Number(m.value)||0,condition:m.condition||null});total=applyModifier(total,m);});let running=0;const breakdown=entries.map(entry=>{running=entry.mode==='set'?Number(entry.value)||0:applyModifier(running,entry);return{...entry,result:running};});return{total:running,breakdown};}
  const getSpeed=character=>getSpeedBreakdown(character).total;
  calculator.getAbilityModifier=getAbilityModifier;calculator.getEffectiveAbilityScore=getEffectiveAbilityScore;calculator.getWeaponAbility=getWeaponAbility;calculator.getWeaponAttackBonus=getWeaponAttackBonus;calculator.getWeaponDamage=getWeaponDamage;calculator.isWeaponProficient=weaponProficient;calculator.getArmorClassBreakdown=getArmorClassBreakdown;calculator.getACBreakdown=getArmorClassBreakdown;calculator.getArmorClass=getArmorClass;calculator.getSpeedBreakdown=getSpeedBreakdown;calculator.getSpeed=getSpeed;
})();
