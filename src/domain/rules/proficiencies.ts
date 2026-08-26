import type {Character} from '../types';
const STARTING:Record<string,{armor?:string[];weapons?:string[];tools?:string[]}>={
 barbarian:{armor:['light','medium','shield'],weapons:['simple','martial']},
 bard:{armor:['light'],weapons:['simple','hand-crossbow','longsword','rapier','shortsword']},
 cleric:{armor:['light','medium','shield'],weapons:['simple']},
 druid:{armor:['light','medium','shield'],weapons:['club','dagger','dart','javelin','mace','quarterstaff','scimitar','sickle','sling','spear']},
 fighter:{armor:['light','medium','heavy','shield'],weapons:['simple','martial']},
 monk:{weapons:['simple','shortsword']},
 paladin:{armor:['light','medium','heavy','shield'],weapons:['simple','martial']},
 ranger:{armor:['light','medium','shield'],weapons:['simple','martial']},
 rogue:{armor:['light'],weapons:['simple','hand-crossbow','longsword','rapier','shortsword'],tools:['thieves-tools']},
 sorcerer:{weapons:['dagger','dart','sling','quarterstaff','light-crossbow']},
 warlock:{armor:['light'],weapons:['simple']},
 wizard:{weapons:['dagger','dart','sling','quarterstaff','light-crossbow']},
 artificer:{armor:['light','medium','shield'],weapons:['simple'],tools:['thieves-tools','tinkers-tools']}
};
export function startingProficiencies(classId:string){return STARTING[classId]??{}}
export function applyStartingProficiencies(c:Character,classId:string):Character{const grant=startingProficiencies(classId);return {...c,armorProficiencies:[...new Set([...(c.armorProficiencies??[]),...(grant.armor??[])])],weaponProficiencies:[...new Set([...(c.weaponProficiencies??[]),...(grant.weapons??[])])],toolProficiencies:[...new Set([...(c.toolProficiencies??[]),...(grant.tools??[])])]};}
