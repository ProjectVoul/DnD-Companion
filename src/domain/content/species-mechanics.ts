import type {Ability,DamageType,Feature,Skill,Size} from '../types';

/** Canonical 2014 PHB species mechanics kept separate from display/catalog data. */
export interface SpeciesMechanicProfile {
  id:string;
  abilityBonuses:Partial<Record<Ability,number>>;
  abilityChoices?:{count:number;bonus:number};
  size:Size;
  speed:number;
  darkvision?:number;
  languages:string[];
  languageChoices?:number;
  fixedSkillProficiencies?:Skill[];
  skillChoices?:number;
  resistances?:DamageType[];
  traits:Feature[];
}

export const PHB_SPECIES_IDS = [
  'dragonborn','dwarf','elf','gnome','half-elf','half-orc','halfling','human','variant-human','tiefling'
] as const;

export type PhbSpeciesId = typeof PHB_SPECIES_IDS[number];

/**
 * Kept deliberately data-only: derivation belongs to the character builder.
 * This prevents catalog entries from mutating character state directly.
 */
export const isPhbSpecies = (id:string): id is PhbSpeciesId =>
  (PHB_SPECIES_IDS as readonly string[]).includes(id);

export const mergeAbilityBonuses = (
  base:Partial<Record<Ability,number>>,
  extra:Partial<Record<Ability,number>>
):Partial<Record<Ability,number>> => {
  const result:{[K in Ability]?:number} = {...base};
  for (const ability of Object.keys(extra) as Ability[]) {
    result[ability] = (result[ability] ?? 0) + (extra[ability] ?? 0);
  }
  return result;
};