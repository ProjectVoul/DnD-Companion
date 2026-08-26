import type {Spell} from '../types';
import {SPELLS} from './spells';
import {PALADIN_SPELLS} from './paladin-spells';
import {PALADIN_SUPPLEMENTAL_SPELLS} from './paladin-supplemental-spells';
import {TASHA_SPELLS} from './tasha-spells';

/** Single runtime spell catalog. One canonical record per spell id. */
const uniqueById=(spells:Spell[]):Spell[]=>{
 const seen=new Set<string>();
 return spells.filter(spell=>{if(seen.has(spell.id))return false;seen.add(spell.id);return true;});
};
export const ALL_SPELLS=uniqueById([...SPELLS,...PALADIN_SPELLS,...PALADIN_SUPPLEMENTAL_SPELLS,...TASHA_SPELLS]);
export const duplicateSpellIds=(spells:Spell[])=>(Object.entries(spells.reduce<Record<string,number>>((counts,spell)=>{counts[spell.id]=(counts[spell.id]??0)+1;return counts},{})).filter(([,count])=>count>1).map(([id,count])=>[id,count] as const));
