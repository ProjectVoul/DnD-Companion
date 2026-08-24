export * from './rules/index';
export {abilityMod as mod,proficiencyBonus as proficiency} from './rules/derived';
import {CLASSES} from './catalog';
import type {Character} from './types';
export function maxPreparedSpells(c:Character,classId:string){const cl=c.classes.find(x=>x.id===classId);const def=CLASSES.find(x=>x.id===classId);if(!cl?.spellcastingAbility||!def)return 0;const m=Math.max(0,Math.floor((c.abilityScores[cl.spellcastingAbility]-10)/2));if(def.spellcasting==='spellbook')return Math.max(1,m+cl.level);if(def.spellcasting==='prepared'){if(classId==='paladin'||classId==='ranger')return Math.max(1,m+Math.floor(cl.level/2));if(classId==='artificer')return Math.max(1,m+Math.floor(cl.level/2));return Math.max(1,m+cl.level)}return 0}
