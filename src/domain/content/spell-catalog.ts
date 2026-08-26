import type {Spell} from '../types';
import {SPELLS} from './spells';
import {PALADIN_SPELLS} from './paladin-spells';
import {PALADIN_SUPPLEMENTAL_SPELLS} from './paladin-supplemental-spells';

/**
 * Single runtime spell catalog.
 *
 * Source files can temporarily overlap while content is being consolidated,
 * but the application must never expose two records for the same spell id.
 * The first canonical record wins; later records only contribute when the id
 * is not already present. Class lists therefore belong to the canonical Spell
 * entity rather than being duplicated per class/subclass.
 */
const uniqueById=(spells:Spell[]):Spell[]=>{
 const seen=new Set<string>();
 return spells.filter(spell=>{
  if(seen.has(spell.id))return false;
  seen.add(spell.id);
  return true;
 });
};

export const ALL_SPELLS=uniqueById([...SPELLS,...PALADIN_SPELLS,...PALADIN_SUPPLEMENTAL_SPELLS]);

export const duplicateSpellIds=(spells:Spell[])=>(Object.entries(spells.reduce<Record<string,number>>((counts,spell)=>{counts[spell.id]=(counts[spell.id]??0)+1;return counts},{})).filter(([,count])=>count>1).map(([id,count])=>[id,count] as const));
