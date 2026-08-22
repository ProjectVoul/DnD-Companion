/* D&D Companion — class/race/subclass synchronization | D&D 5e 2014 */
(() => {
'use strict';
const e=window.DnDCharacterEngine;if(!e||!e.syncCharacterRules)return;
const baseSync=e.syncCharacterRules,baseApply=e.applyCharacterSelection;
const normRace=r=>r==='Draconide'?'Dragonborn':r;
const ensure=c=>{c.ruleState=c.ruleState||{};c.choices=c.choices||{};c.features=Array.isArray(c.features)?c.features:[];c.proficiencies=c.proficiencies||{};c.proficiencies.skills=c.proficiencies.skills||{};c.proficiencies.savingThrows=c.proficiencies.savingThrows||[];c.resources=c.resources||{};c.resources.hp=c.resources.hp||{maximum:1,current:1,temporary:0};return c;};
const clone=v=>JSON.parse(JSON.stringify(v));
const normalizeStyle=value=>{
 if(!value)return null;
 const raw=String(value).trim();
 const aliases={
  defense:'defense','Defense':'defense',
  dueling:'dueling','Dueling':'dueling',
  protection:'protection','Protection':'protection',
  greatweaponfighting:'greatWeaponFighting','great weapon fighting':'greatWeaponFighting','Great Weapon Fighting':'greatWeaponFighting'
 };
 return aliases[raw]||aliases[raw.toLowerCase()]||raw;
};
function generated(c){
 const out=[],cls=c.identity?.class,lv=Math.max(1,Number(c.identity?.level)||1),p=e.official5e2014?.paladin;
 if(cls==='Paladin'&&p?.coreFeatures){
  Object.values(p.coreFeatures).forEach(f=>{if(lv>=Number(f.level||1))out.push(clone(f));});
  if(lv>=2){
   const rawStyle=c.choices?.fightingStyle||c.fightingStyle;
   const style=normalizeStyle(rawStyle);
   const chosen=style&&p.fightingStyles?.[style];
   out.push(chosen?clone(chosen):e.createFeature({id:'fighting-style-choice',name:'Fighting Style',type:'class',level:2,description:'Choose a fighting style.'}));
  }
  [4,8,12,16,19].forEach(n=>{if(lv>=n)out.push(e.createFeature({id:`asi-${n}`,name:'Ability Score Improvement',type:'class',level:n}));});
 }
 const sub=p?.subclassFeatures?.[c.identity?.subclass]||[];sub.forEach(f=>{if(lv>=Number(f.level||1))out.push(clone(f));});
 const race=p?.raceFeatures?.[normRace(c.identity?.race)]||[];race.forEach(f=>{if(lv>=Number(f.level||1))out.push(clone(f));});
 return out;
}
e.syncCharacterRules=c=>{const out=baseSync(c)||c;ensure(out);const auto=new Set(out.ruleState.autoFeatureIds||[]);const manual=out.features.filter(f=>!auto.has(f.id));const gen=generated(out);out.features=[...manual,...gen];out.ruleState.autoFeatureIds=gen.map(f=>f.id);if(out.resources?.hp&&!out.resources.hp.manualMaximum&&e.getHitPointMaximum)out.resources.hp.maximum=e.getHitPointMaximum(out);return out;};
e.applyCharacterSelection=(c,type,value)=>{ensure(c);if(type==='fightingStyle'){c.choices.fightingStyle=normalizeStyle(value);c.fightingStyle=normalizeStyle(value);e.syncCharacterRules(c);return c;}const out=baseApply(c,type,value);e.syncCharacterRules(out);return out;};
})();