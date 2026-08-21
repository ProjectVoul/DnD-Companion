/* D&D Companion — weapon proficiency resolution | D&D 5e 2014 */
(() => {
'use strict';
const e=window.DnDCharacterEngine;if(!e||!e.calculator)return;
const original=e.calculator.getWeaponAttackBonus;
e.calculator.getWeaponAttackBonus=(c,item)=>{
 if(!item||item.mechanics?.type!=='weapon')return null;
 const ability=e.calculator.getWeaponAbility(c,item);if(!ability)return null;
 const category=item.proficiency?.type||item.mechanics?.proficiency?.type||null;
 const proficient=category?e.hasProficiency(c,'weapon',category):false;
 const abilityBonus=e.calculator.getAbilityModifier(c,ability);
 const pb=proficient?e.calculator.getProficiencyBonus(c.identity.level):0;
 const bonus=Number(item.mechanics?.attack?.bonus)||0;
 const featureBonus=e.calculator.getTargetModifiers?e.calculator.getTargetModifiers(c,'weaponAttackBonus').reduce((v,m)=>m.mode==='subtract'?v-(Number(m.value)||0):m.mode==='set'?(Number(m.value)||0):v+(Number(m.value)||0),0):0;
 return abilityBonus+pb+bonus+featureBonus;
};
e.resolveWeaponProficiency=(c,item)=>{const category=item?.proficiency?.type||item?.mechanics?.proficiency?.type||null;return{category,proficient:category?e.hasProficiency(c,'weapon',category):false};};
})();
