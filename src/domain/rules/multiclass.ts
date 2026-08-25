import type {Character,Skill} from '../types';

type Grant={armor?:string[];weapons?:string[];skills?:number;skillOptions?:Skill[];tools?:number;toolOptions?:string[]};
const ALL_SKILLS:Skill[]=['acrobatics','animalHandling','arcana','athletics','deception','history','insight','intimidation','investigation','medicine','nature','perception','performance','persuasion','religion','sleightOfHand','stealth','survival'];
const CLASS_SKILLS:Record<string,Skill[]>={barbarian:['animalHandling','athletics','intimidation','nature','perception','survival'],bard:ALL_SKILLS,cleric:['history','insight','medicine','persuasion','religion'],druid:['arcana','animalHandling','insight','medicine','nature','perception','religion','survival'],fighter:['acrobatics','animalHandling','athletics','history','insight','intimidation','perception','survival'],monk:['acrobatics','athletics','history','insight','religion','stealth'],paladin:['athletics','insight','intimidation','medicine','persuasion','religion'],ranger:['animalHandling','athletics','insight','investigation','nature','perception','stealth','survival'],rogue:['acrobatics','athletics','deception','insight','intimidation','investigation','perception','performance','persuasion','sleightOfHand','stealth'],sorcerer:['arcana','deception','insight','intimidation','persuasion','religion'],warlock:['arcana','deception','history','intimidation','investigation','nature','religion'],wizard:['arcana','history','insight','investigation','medicine','religion'],artificer:['arcana','history','investigation','medicine','nature','perception','sleightOfHand']};
export const MULTICLASS_PROFICIENCIES:Record<string,Grant>={
 barbarian:{armor:[],weapons:['simple','martial']},
 bard:{armor:['light'],skills:1,skillOptions:CLASS_SKILLS.bard,tools:1,toolOptions:['musical-instrument']},
 cleric:{armor:['light','medium'],weapons:[],},
 druid:{armor:['light','medium','shield']},
 fighter:{armor:['light','medium','heavy','shield'],weapons:['simple','martial']},
 rogue:{armor:['light'],skills:1,skillOptions:CLASS_SKILLS.rogue,tools:1,toolOptions:['thieves-tools']},
 wizard:{weapons:['simple','shortsword']},
 monk:{weapons:['simple','shortsword']},
 paladin:{armor:['light','medium','heavy','shield'],weapons:['simple','martial']},
 ranger:{armor:['light','medium','shield'],weapons:['simple','martial'],skills:1,skillOptions:CLASS_SKILLS.ranger},
 sorcerer:{},
 warlock:{armor:['light'],weapons:['simple']},
 artificer:{armor:['light','medium','shield'],tools:2,toolOptions:['thieves-tools','tinkers-tools']}
};
export function multiclassGrant(classId:string){return MULTICLASS_PROFICIENCIES[classId]??{}}
export function multiclassChoiceValid(classId:string,choice?:{skills?:Skill[];tools?:string[]}){const grant=multiclassGrant(classId);const skills=choice?.skills??[];const tools=choice?.tools??[];if((grant.skills??0)!==skills.length||new Set(skills).size!==skills.length)return (grant.skills??0)===0&&skills.length===0&&(grant.tools??0)===tools.length&&new Set(tools).size===tools.length;if((grant.tools??0)!==tools.length||new Set(tools).size!==tools.length)return false;const skillOptions=new Set(grant.skillOptions??[]);const toolOptions=new Set(grant.toolOptions??[]);return skills.every(s=>skillOptions.has(s))&&tools.every(t=>toolOptions.has(t));}
export function applyMulticlassProficiencies(c:Character,classId:string,choice?:{skills?:Skill[];tools?:string[]}):Character{
 const grant=multiclassGrant(classId);const next=structuredClone(c);const chosenSkills=choice?.skills??[];const chosenTools=choice?.tools??[];
 next.armorProficiencies=[...new Set([...(next.armorProficiencies??[]),...(grant.armor??[])])];next.weaponProficiencies=[...new Set([...(next.weaponProficiencies??[]),...(grant.weapons??[])])];next.toolProficiencies=[...new Set([...(next.toolProficiencies??[]),...chosenTools])];
 for(const skill of chosenSkills)next.skillStates[skill]={...next.skillStates[skill],proficient:true};
 return next;
}
