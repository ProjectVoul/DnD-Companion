import type {Ability,Character,Skill} from '../types';
export const ABILITIES:Ability[]=['str','dex','con','int','wis','cha'];
export const SKILLS:Record<Skill,Ability>={acrobatics:'dex',animalHandling:'wis',arcana:'int',athletics:'str',deception:'cha',history:'int',insight:'wis',intimidation:'cha',investigation:'int',medicine:'wis',nature:'int',perception:'wis',performance:'cha',persuasion:'cha',religion:'int',sleightOfHand:'dex',stealth:'dex',survival:'wis'};
export function abilityMod(score:number){return Math.floor((score-10)/2)}
export function proficiencyBonus(level:number){return Math.ceil(level/4)+1}
export function skillBonus(c:Character,skill:Skill){const s=c.skillStates[skill];const base=abilityMod(c.abilityScores[SKILLS[skill]]);return base+(s.proficient?c.proficiencyBonus:0)+(s.expertise?c.proficiencyBonus:0)+(s.bonusOverride??0)}
export function saveBonus(c:Character,a:Ability){return abilityMod(c.abilityScores[a])+(c.savingThrowProficiency.includes(a)?c.proficiencyBonus:0)}
export function initiative(c:Character){return abilityMod(c.abilityScores.dex)}
export function passivePerception(c:Character){return 10+skillBonus(c,'perception')}
export function maxDexForArmor(c:Character){const armor=c.items.find(i=>i.equipped&&i.kind==='armor')?.armor;if(!armor||!armor.dexBonus)return 0;return armor.dexCap??99}
export function armorClass(c:Character){const armor=c.items.find(i=>i.equipped&&i.kind==='armor')?.armor;const shield=c.items.find(i=>i.equipped&&i.kind==='shield')?.shield;const dex=abilityMod(c.abilityScores.dex);let ac=10;if(armor){const dexPart=armor.dexBonus?Math.min(dex,maxDexForArmor(c)):0;ac=armor.baseAC+dexPart+armor.magicBonus}else ac+=dex; if(shield)ac+=shield.acBonus+shield.magicBonus;if(c.fightingStyles?.includes('defense')&&!!armor)ac+=1;return ac}
export function totalLevel(c:Character){return c.classes.reduce((n,x)=>n+x.level,0)}
