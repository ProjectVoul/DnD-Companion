/* Small compatibility patch kept separate so the core engine stays compact. */
(() => {
  'use strict';
  const E=window.DnDEngineV2,D=window.DnDDataV2;
  const oldProfiles=E.spellcastingProfiles;
  const oldSummary=E.summary;
  E.spellcastingProfiles=c=>oldProfiles(c).map(p=>({...p,ability:p.ability||((p.type==='third')?'intelligence':null)}));
  E.spellAbility=(c=E.state,sourceClass=null)=>E.spellcastingProfiles(c).find(p=>!sourceClass||p.classId===sourceClass)?.ability||null;
  E.spellAttack=(c=E.state,sourceClass=null)=>{const a=E.spellAbility(c,sourceClass);return a?Math.floor((Number(c.abilityScores?.[a])||10-10)/2)+E.profBonus(c):null;};
  E.spellDC=(c=E.state,sourceClass=null)=>{const a=E.spellAbility(c,sourceClass);return a?8+Math.floor(((Number(c.abilityScores?.[a])||10)-10)/2)+E.profBonus(c):null;};
  E.summary=c=>{const s=oldSummary(c),profiles=E.spellcastingProfiles(c);return {...s,spellcastingProfiles:profiles,spellAbility:profiles[0]?.ability||null,spellAttackBonus:profiles[0]?E.spellAttack(c,profiles[0].classId):null,spellSaveDC:profiles[0]?E.spellDC(c,profiles[0].classId):null};};
})();