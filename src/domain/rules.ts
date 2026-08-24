import type {Ability,AbilityScores,Character,Item,Skill} from './types';
export const SKILLS:Record<Skill,{name:string;ability:Ability}>={acrobatics:{name:'Acrobatics',ability:'dex'},animalHandling:{name:'Animal Handling',ability:'wis'},arcana:{name:'Arcana',ability:'int'},athletics:{name:'Athletics',ability:'str'},deception:{name:'Deception',ability:'cha'},history:{name:'History',ability:'int'},insight:{name:'Insight',ability:'wis'},intimidation:{name:'Intimidation',ability:'cha'},investigation:{name:'Investigation',ability:'int'},medicine:{name:'Medicine',ability:'wis'},nature:{name:'Nature',ability:'int'},perception:{name:'Perception',ability:'wis'},performance:{name:'Performance',ability:'cha'},persuasion:{name:'Persuasion',ability:'cha'},religion:{name:'Religion',ability:'int'},sleightOfHand:{name:'Sleight of Hand',ability:'dex'},stealth:{name:'Stealth',ability:'dex'},survival:{name:'Survival',ability:'wis'}};
export const mod=(score:number)=>Math.floor((score-10)/2);
export const proficiency=(level:number)=>level<5?2:level<9?3:level<13?4:level<17?5:6;
export const abilityModifier=(scores:AbilityScores,a:Ability)=>mod(scores[a]);
export function skillBonus(c:Character,s:Skill){const st=c.skillStates[s];const base=abilityModifier(c.abilityScores,SKILLS[s].ability);return base+(st.expertise?c.proficiencyBonus*2:st.proficient?c.proficiencyBonus:0)+(st.bonusOverride??0);}
export function savingThrowBonus(c:Character,a:Ability){return abilityModifier(c.abilityScores,a)+(c.savingThrowProficiency.includes(a)?c.proficiencyBonus:0);}
export function equipped(c:Character,kind:Item['kind']){return c.items.filter(i=>i.equipped&&i.kind===kind);}
export function armorClass(c:Character){const armor=equipped(c,'armor')[0]?.armor;const shield=equipped(c,'shield')[0]?.shield;const dex=abilityModifier(c.abilityScores,'dex');let ac=10+dex;if(armor){const dexPart=armor.dexBonus?Math.min(dex,armor.dexCap??99):0;ac=armor.baseAC+dexPart+armor.magicBonus;}if(shield)ac+=shield.acBonus+shield.magicBonus;if(c.fightingStyles?.includes('defense')&&!!armor)ac+=1;return ac;}
export function initiative(c:Character){return abilityModifier(c.abilityScores,'dex');}
export function passivePerception(c:Character){return 10+skillBonus(c,'perception');}
export function hpPercent(c:Character){return c.maxHP<=0?0:Math.max(0,Math.min(100,c.currentHP/c.maxHP*100));}
export function levelFromClasses(c:Character){return c.classes.reduce((n,x)=>n+x.level,0);}
export function maxPreparedSpells(c:Character,classId:string){const cl=c.classes.find(x=>x.id===classId);if(!cl)return 0;const ability=cl.spellcastingAbility;return ability?Math.max(1,abilityModifier(c.abilityScores,ability)+Math.floor(cl.level/2)):0;}
