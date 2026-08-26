export type {ContentSourceId} from './content-sources';
import type {ContentSourceId} from './content-sources';
export type Ability='str'|'dex'|'con'|'int'|'wis'|'cha';
export type Skill='acrobatics'|'animalHandling'|'arcana'|'athletics'|'deception'|'history'|'insight'|'intimidation'|'investigation'|'medicine'|'nature'|'perception'|'performance'|'persuasion'|'religion'|'sleightOfHand'|'stealth'|'survival';
export type DamageType='acid'|'bludgeoning'|'cold'|'fire'|'force'|'lightning'|'necrotic'|'piercing'|'poison'|'psychic'|'radiant'|'slashing'|'thunder';
export type ItemKind='armor'|'weapon'|'shield'|'focus'|'gear'|'magic';
export type ItemCategory='armor'|'weapon'|'shield'|'focus'|'gear'|'potion'|'scroll'|'ammunition'|'food'|'camping'|'tool'|'container'|'miscellaneous'|'magic';
export type ArmorCategory='light'|'medium'|'heavy';
export type Die=4|6|8|10|12|20|100;
export type FeatureSource='class'|'subclass'|'species'|'feat'|'background'|'item'|'optional';
export type RestType='short'|'long';
export type RechargeType='short'|'long'|'manual';
export type Size='Tiny'|'Small'|'Medium'|'Large'|'Huge'|'Gargantuan';
export type InspirationState=[boolean,boolean,boolean,boolean];
export type InspirationLegacy=boolean|number;
export interface AbilityScores{str:number;dex:number;con:number;int:number;wis:number;cha:number;}
export interface SkillState{proficient:boolean;expertise:boolean;bonusOverride?:number;}
export interface DamagePart{dice:number;die:Die;type:DamageType;flat?:number;}
export interface WeaponData{attackAbility:Ability;proficient:boolean;attackBonus:number;damageBonus:number;damage:DamagePart[];properties:string[];range?:string;}
export interface ArmorData{category:ArmorCategory;baseAC:number;dexBonus:boolean;dexCap?:number;strengthRequirement?:number;stealthDisadvantage:boolean;magicBonus:number;}
export interface ShieldData{acBonus:number;magicBonus:number;}
export type EffectTarget='ac'|'savingThrows'|'initiative'|'speed'|'darkvision'|'skill'|'skillProficiency'|'skillExpertise'|'attack'|'damage'|'maxHP'|'ability'|'passivePerception'|'passiveInvestigation';
export interface Effect{ id:string;name:string;target:EffectTarget;value:number;ability?:Ability;skill?:Skill;damageType?:DamageType;condition?:string;passive?:boolean;sourceId?:string;description?:string; }
export interface Item{id:string;name:string;kind:ItemKind;category?:ItemCategory;quantity:number;weight?:number;description?:string;equipped:boolean;requiresAttunement?:boolean;attuned?:boolean;effects?:string[];mechanicalEffects?:Effect[];charges?:{current:number;max:number;recharge:RechargeType};homebrew?:boolean;weapon?:WeaponData;armor?:ArmorData;shield?:ShieldData;}
export interface Spell{id:string;name:string;level:number;school:string;classes:string[];ritual?:boolean;concentration?:boolean;source?:string;alwaysPrepared?:boolean;castingTime?:string;range?:string;components?:string[];duration?:string;description?:string;higherLevels?:string;}
export interface SpellState{known:string[];prepared:string[];alwaysPrepared:string[];spellbook:string[];slots:Record<number,{max:number;used:number}>;pactSlots?:{max:number;used:number;level:number};}
export interface ConcentrationState{spellId:string;classId:string;}
export interface Feature{id:string;name:string;source:FeatureSource;sourceBook?:ContentSourceId;level:number;description?:string;optional?:boolean;replaces?:string;effects?:Effect[];resourceId?:string;activation?:'action'|'bonus-action'|'reaction'|'passive'|'special';}
export interface Resource{id:string;name:string;current:number;max:number;recharge:RechargeType;unlimited?:boolean;sourceId?:string;description?:string;}
export interface BackgroundData{name:string;skillProficiencies:string[];toolProficiencies:string[];languages:string[];feature?:string;description?:string;}
export interface DeathSaves{successes:number;failures:number;}
export interface HitDiePool{die:4|6|8|10|12;max:number;current:number;}
export interface HitDice{pools:HitDiePool[];}
export interface Currency{cp:number;sp:number;ep:number;gp:number;pp:number;}
export interface FeatChoice{ability?:Ability;skill?:Skill;skills?:Skill[];damageType?:DamageType;}
export type StoredFeatChoices=Record<string,FeatChoice|FeatChoice[]>;
export interface CharacterClass{id:string;name:string;level:number;subclassId?:string;subclassName?:string;spellcastingAbility?:Ability;}
export interface Character{id:string;name:string;species:string;subspecies?:string;background?:string;backgroundData?:BackgroundData;alignment?:string;speciesAbilityChoices?:Ability[];speciesSkillChoices?:Skill[];classes:CharacterClass[];level:number;abilityScores:AbilityScores;skillStates:Record<Skill,SkillState>;savingThrowProficiency:Ability[];proficiencyBonus:number;maxHP:number;currentHP:number;tempHP:number;hitDice:HitDice;deathSaves:DeathSaves;items:Item[];spellcasting:Record<string,SpellState>;sharedSpellSlots?:Record<number,{max:number;used:number}>;concentration?:ConcentrationState;features:Feature[];resources:Resource[];conditions:string[];resistances:string[];immunities?:string[];vulnerabilities?:string[];fightingStyles?:string[];feats?:string[];featChoices?:StoredFeatChoices;notes?:string;languages?:string[];toolProficiencies?:string[];armorProficiencies?:string[];weaponProficiencies?:string[];speed?:number;size?:Size;darkvision?:number;inspiration?:InspirationState;currency?:Currency;experience?:number;contentSources?:ContentSourceId[];optionalFeatures?:string[];}
