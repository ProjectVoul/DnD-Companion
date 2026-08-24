/* Spellcasting rules: 2014 class-specific preparation/known-state semantics. */
(() => {
  'use strict';
  const E=window.DnDEngineV3||window.DnDEngineV2,D=window.DnDDataV2;if(!E||!D)return;
  const KNOWN={
    bard:[0,4,5,6,7,8,9,10,11,12,14,15,15,16,18,19,19,20,22,22,22],
    sorcerer:[0,2,3,4,5,6,7,8,9,10,11,12,12,13,13,14,14,15,15,15,15],
    warlock:[0,2,3,4,5,6,7,8,9,10,10,11,11,12,12,13,13,14,14,15,15],
    ranger:[0,0,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11]
  };
  const knownCount=(c,classId)=>KNOWN[classId]?.[Math.min(20,E.classLevel(c,classId))]||0;
  const preparedCount=(c,classId)=>{const l=E.classLevel(c,classId),mod=E.abilityMod(c,D.CLASSES[classId]?.spell||'wisdom');if(['cleric','druid'].includes(classId))return Math.max(1,l+mod);if(classId==='paladin')return Math.max(1,Math.floor(l/2)+mod);if(classId==='artificer')return Math.max(1,Math.floor(l/2)+mod);if(classId==='wizard')return Math.max(1,l+E.abilityMod(c,'intelligence'));return null;};
  const spellRules=(c=E.state)=>{const out={};(c.classes||[]).forEach(cl=>{const id=cl.classId;out[id]={classId:id,knownCount:knownCount(c,id),preparedCount:preparedCount(c,id),usesPreparation:preparedCount(c,id)!=null,usesKnown:knownCount(c,id)>0,spellbookMinimum:id==='wizard'?6+Math.max(0,E.classLevel(c,id)-1)*2:null};});return out;};
  const oldShort=E.performShortRest;if(oldShort)E.performShortRest=c=>{const result=oldShort(c);const slots=E.spellSlots(c);if(slots.pact){c.resources.spellSlots??={};c.resources.spellSlots.pact=0;}return result;};
  E.spellcastingRules=spellRules;const old=E.summary;E.summary=c=>({...old(c),spellcastingRules:spellRules(c)});window.DnDSpellcastingRulesV3={knownCount,preparedCount,spellRules};
})();