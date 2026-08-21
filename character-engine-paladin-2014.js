/* D&D Companion — Paladin / race feature data | D&D 5e 2014 */
(() => {
'use strict';
const e=window.DnDCharacterEngine;if(!e||!e.createFeature)return;
const f=(id,name,type,level,x={})=>e.createFeature({id,name,type,level,...x});
const r=(id,name,maximum,recovery='longRest')=>e.createFeatureResource({id,name,maximum,current:maximum,recovery});
e.official5e2014=e.official5e2014||{};e.official5e2014.paladin=e.official5e2014.paladin||{};
e.official5e2014.paladin.subclassFeatures={
 'Oath of Devotion':[
  f('devotion-sacred-weapon','Sacred Weapon','subclass',3,{actions:[{type:'action'}]}),
  f('devotion-turn-the-unholy','Turn the Unholy','subclass',3,{actions:[{type:'action'}]}),
  f('devotion-aura','Aura of Devotion','subclass',7,{modifiers:[e.createFeatureModifier({id:'devotion-charmed-immunity',target:'conditionImmunity',mode:'add',value:'charmed',condition:{type:'conscious'}})]}),
  f('devotion-purity','Purity of Spirit','subclass',15),
  f('devotion-holy-nimbus','Holy Nimbus','subclass',20,{actions:[{type:'action'}],resources:[r('holy-nimbus','Holy Nimbus',1)]})
 ],
 oathSpells:{
  'Oath of Devotion':[
   [3,['Protection from Evil and Good','Sanctuary']],
   [5,['Lesser Restoration','Zone of Truth']],
   [9,['Beacon of Hope','Dispel Magic']],
   [13,['Freedom of Movement','Guardian of Faith']],
   [17,['Commune','Flame Strike']]
  ]
 }
};
e.official5e2014.paladin.raceFeatures={Dragonborn:[f('draconic-ancestry','Draconic Ancestry','race',1),f('breath-weapon','Breath Weapon','race',1,{actions:[{type:'action'}]})]};
e.getOathSpells=(subclass,lv)=>((e.official5e2014.paladin.subclassFeatures.oathSpells[subclass])||[]).filter(([n])=>Number(lv)>=n).flatMap(([,s])=>s);
})();
