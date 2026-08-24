export type Ability = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
export type Skill = 'acrobatics'|'animalHandling'|'arcana'|'athletics'|'deception'|'history'|'insight'|'intimidation'|'investigation'|'medicine'|'nature'|'perception'|'performance'|'persuasion'|'religion'|'sleightOfHand'|'stealth'|'survival';
export type DamageType = 'acid'|'bludgeoning'|'cold'|'fire'|'force'|'lightning'|'necrotic'|'piercing'|'poison'|'psychic'|'radiant'|'slashing'|'thunder';
export type ItemKind = 'weapon'|'armor'|'shield'|'focus'|'gear'|'magic';
export type ArmorCategory = 'light'|'medium'|'heavy';
export type Die = 4|6|8|10|12|20|100;
export type FeatureSource = 'class'|'subclass'|'species'|'feat'|'background'|'item'|'optional';

export interface AbilityScores { str:number; dex:number; con:number; int:number; wis:number; cha:number; }
export interface SkillState { proficient:boolean; expertise:boolean; bonusOverride?:number; }
export interface DamagePart { dice:number; die:Die; type:DamageType; flat?:number; }
export interface WeaponData { attackAbility:Ability; proficient:boolean; attackBonus:number; damageBonus:number; damage:DamagePart[]; properties:string[]; range?:string; }
export interface ArmorData { category:ArmorCategory; baseAC:number; dexBonus:boolean; dexCap?:number; strengthRequirement?:number; stealthDisadvantage:boolean; magicBonus:number; }
export interface ShieldData { acBonus:number; magicBonus:number; }
export interface Item { id:string; name:string; kind:ItemKind; quantity:number; weight?:number; description?:string; equipped:boolean; attuned?:boolean; weapon?:WeaponData; armor?:ArmorData; shield?:ShieldData; effects?:string[]; homebrew?:boolean; }
export interface Spell { id:string; name:string; level:number; school:string; classes:string[]; ritual?:boolean; concentration?:boolean; source?:string; }
export interface SpellState { known:string[]; prepared:string[]; alwaysPrepared:string[]; spellbook:string[]; slots:Record<number,{max:number,used:number}>; }
export interface Feature { id:string; name:string; source:FeatureSource; level:number; description?:string; optional?:boolean; }
export interface Resource { id:string; name:string; current:number; max:number; recharge:'short'|'long'|'manual'; }
export interface DeathSaves { successes:number; failures:number; }
export interface CharacterClass { id:string; name:string; level:number; subclassId?:string; subclassName?:string; }
export interface Character {
  id:string; name:string; species:string; background?:string; alignment?:string; classes:CharacterClass[];
  level:number; abilityScores:AbilityScores; skillStates:Record<Skill,SkillState>; savingThrowProficiency:Ability[];
  proficiencyBonus:number; maxHP:number; currentHP:number; tempHP:number; hitDice:{die:Die; max:number; current:number};
  deathSaves:DeathSaves; items:Item[]; spellcasting:Record<string,SpellState>; features:Feature[]; resources:Resource[];
  conditions:string[]; resistances:string[]; notes?:string;
}
