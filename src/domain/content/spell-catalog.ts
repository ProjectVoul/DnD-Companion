import type {Spell} from '../types';
import {SPELLS} from './spells';
import {withSpellMechanics} from './spell-mechanics';
import {PALADIN_SPELLS} from './paladin-spells';
import {PALADIN_SUPPLEMENTAL_SPELLS} from './paladin-supplemental-spells';
import {SUBCLASS_CANONICAL_SPELLS} from './subclass-canonical-spells';
import {SUBCLASS_CANONICAL_SPELLS_EXTRA} from './subclass-canonical-spells-extra';
import {TASHA_SPELLS} from './tasha-spells';
import {XANATHAR_SPELLS} from './xanathar-spells';
import {XANATHAR_SPELLS_EXTRA} from './xanathar-spells-extra';

/** Single runtime spell catalog. One canonical record per spell id. */
const uniqueById=(spells:Spell[]):Spell[]=>{
 const seen=new Set<string>();
 return spells.filter(spell=>{if(seen.has(spell.id))return false;seen.add(spell.id);return true;});
};
/** Keep only entries actually published in Xanathar's chapter 3. */
const XANATHAR_CANONICAL=XANATHAR_SPELLS.filter(spell=>spell.id!=='distort-value'&&spell.id!=='fast-friends'&&spell.id!=='staggering-smite');
export const ALL_SPELLS=uniqueById([...withSpellMechanics(SPELLS),...PALADIN_SPELLS,...PALADIN_SUPPLEMENTAL_SPELLS,...SUBCLASS_CANONICAL_SPELLS,...SUBCLASS_CANONICAL_SPELLS_EXTRA,...XANATHAR_CANONICAL,...XANATHAR_SPELLS_EXTRA,...TASHA_SPELLS]);
export const duplicateSpellIds=(spells:Spell[])=>(Object.entries(spells.reduce<Record<string,number>>((counts,spell)=>{counts[spell.id]=(counts[spell.id]??0)+1;return counts},{})).filter(([,count])=>count>1).map(([id,count])=>[id,count] as const));
