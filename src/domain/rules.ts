export * from './rules/index';
export {abilityMod as mod,proficiencyBonus as proficiency} from './rules/derived';
import type {Character} from './types';
export function maxPreparedSpells(c:Character,classId:string){const cl=c.classes.find(x=>x.id===classId);if(!cl?.spellcastingAbility)return 0;const m=Math.floor((c.abilityScores[cl.spellcastingAbility]-10)/2);if(classId==='paladin'||classId==='ranger')return Math.max(1,m+Math.floor(cl.level/2));if(classId==='artificer')return Math.max(1,m+Math.floor((cl.level+1)/2));return Math.max(1,m+cl.level)}
