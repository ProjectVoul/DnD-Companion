/* Combat engine: weapon attack bonus and damage are derived centrally from item mechanics. */
(() => {
  'use strict';
  const E=window.DnDEngineV3||window.DnDEngineV2;if(!E)return;
  const n=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
  const abilityFor=(c,i)=>{const a=i?.mechanics?.attack?.ability;if(a)return a;const props=i?.mechanics?.properties||[];if(props.includes('finesse'))return E.abilityMod(c,'dexterity')>E.abilityMod(c,'strength')?'dexterity':'strength';return i?.mechanics?.attack?.type==='ranged'?'dexterity':'strength';};
  const attack=(c=E.state,item)=>{if(!item||item.mechanics?.type!=='weapon')return null;const atk=item.mechanics.attack||{},a=abilityFor(c,item),proficient=atk.proficient!==false,magic=n(item.magicBonus||item.mechanics?.magicBonus,0),bonus=E.abilityMod(c,a)+(proficient?E.profBonus(c):0)+n(atk.bonus,0)+magic+E.modifiers(c,'attackBonus').reduce((v,x)=>v+n(x.value),0);let damage=(item.mechanics?.damage||item.damage||[]).map(d=>({...d,dice:{count:n(d.dice?.count,1),die:d.dice?.die||'d8'},type:d.type||'bludgeoning'}));if(!damage.length)damage=[{dice:{count:1,die:'d8'},type:'bludgeoning'}];const primary=damage[0];primary.ability=a;primary.modifier=E.abilityMod(c,a)+n(primary.modifier,0);return {bonus,ability:a,damage,attacks:E.extraAttacks(c)};};
  E.attack=attack;
  window.DnDCombatV3={attack};
})();