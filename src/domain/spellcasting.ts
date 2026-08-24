import type {Character,SpellState} from './types';
import {mod} from './rules';
import {CLASSES} from './catalog';

export function spellcastingState(c:Character,classId:string):SpellState{return c.spellcasting[classId]??{known:[],prepared:[],alwaysPrepared:[],spellbook:[],slots:{}};}
export function casterLevelContribution(classId:string,level:number){const d=CLASSES.find(x=>x.id===classId);if(!d)return 0;if(d.spellcasting==='pact')return 0;switch(classId){case 'paladin':case 'ranger':return Math.floor(level/2);case 'artificer':return Math.ceil(level/2);default:return level;}}
export function multiclassSpellcasterLevel(c:Character){return c.classes.reduce((n,cl)=>n+casterLevelContribution(cl.id,cl.level),0);}
export function preparedCapacity(c:Character,classId:string){const cl=c.classes.find(x=>x.id===classId);const d=CLASSES.find(x=>x.id===classId);if(!cl||!d||!d.spellcastingAbility)return 0;const ability=mod(c.abilityScores[d.spellcastingAbility]);switch(classId){case 'paladin':case 'ranger':return Math.max(1,ability+Math.floor(cl.level/2));case 'artificer':return Math.max(1,ability+Math.max(1,Math.floor(cl.level/2)));default:return Math.max(1,ability+cl.level);}}
export function canPrepareMore(c:Character,classId:string){const s=spellcastingState(c,classId);return s.prepared.length<preparedCapacity(c,classId);}
export function cantripProgression(level:number){return level<4?2:level<10?3:4;}
export function fullCasterSlotLevel(casterLevel:number){return Math.min(9,Math.max(0,casterLevel));}
