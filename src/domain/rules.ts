import type { Ability, AbilityScores, Character, Item, Skill } from './types';

export const SKILLS: Record<Skill,{name:string;ability:Ability}> = {
  acrobatics:{name:'Acrobatics',ability:'dex'}, animalHandling:{name:'Animal Handling',ability:'wis'}, arcana:{name:'Arcana',ability:'int'}, athletics:{name:'Athletics',ability:'str'},
  deception:{name:'Deception',ability:'cha'}, history:{name:'History',ability:'int'}, insight:{name:'Insight',ability:'wis'}, intimidation:{name:'Intimidation',ability:'cha'},
  investigation:{name:'Investigation',ability:'int'}, medicine:{name:'Medicine',ability:'wis'}, nature:{name:'Nature',ability:'int'}, perception:{name:'Perception',ability:'wis'},
  performance:{name:'Performance',ability:'cha'}, persuasion:{name:'Persuasion',ability:'cha'}, religion:{name:'Religion',ability:'int'}, sleightOfHand:{name:'Sleight of Hand',ability:'dex'}, stealth:{name:'Stealth',ability:'dex'}, survival:{name:'Survival',ability:'wis'},
};
export const mod=(score:number)=>Math.floor((score-10)/2);
export const proficiency=(level:number)=>Math.ceil(level/4)+1;
export function abilityModifier(scores:AbilityScores,a:Ability){return mod(scores[a]);}
export function skillBonus(c:Character,s:Skill){const st=c.skillStates[s];const base=abilityModifier(c.abilityScores,SKILLS[s].ability);return base+(st.expertise?c.proficiencyBonus*2:st.proficient?c.proficiencyBonus:0)+(st.bonusOverride??0);}
export function equipped(c:Character,kind:Item['kind']){return c.items.filter(i=>i.equipped&&i.kind===kind);}
export function armorClass(c:Character){
  const armor=equipped(c,'armor')[0]?.armor; const shield=equipped(c,'shield')[0]?.shield;
  let ac=10+abilityModifier(c.abilityScores,'dex');
  if(armor){ac=armor.baseAC+(armor.dexBonus?Math.min(abilityModifier(c.abilityScores,'dex'),armor.dexCap??99):0)+armor.magicBonus;}
  if(shield) ac+=shield.acBonus+shield.magicBonus;
  return ac;
}
export function initiative(c:Character){return abilityModifier(c.abilityScores,'dex');}
export function passivePerception(c:Character){return 10+skillBonus(c,'perception');}
export function hpPercent(c:Character){return c.maxHP<=0?0:Math.max(0,Math.min(100,(c.currentHP/c.maxHP)*100));}
export function levelFromClasses(c:Character){return c.classes.reduce((n,x)=>n+x.level,0);}
