import type {Spell} from '../types';

const spell=(source:Spell['source'],value:Spell):Spell=>({...value,source});

/**
 * Paladin additions that are not already represented by the canonical class
 * or source catalogs. Availability follows Tasha's optional Additional
 * Paladin Spells.
 */
export const PALADIN_SUPPLEMENTAL_SPELLS:Spell[]=[
 spell('tasha2020',{id:'prayer-of-healing',name:'Prayer of Healing',level:2,school:'Evocation',classes:['paladin'],castingTime:'10 minutes',range:'30 feet',components:['V'],duration:'Instantaneous',description:'Up to six creatures you choose within range regain hit points equal to 2d8 + your spellcasting ability modifier. The spell does not affect constructs or undead.',higherLevels:'Healing increases by 1d8 for each slot level above 2nd.'}),
 spell('tasha2020',{id:'gentle-repose',name:'Gentle Repose',level:2,school:'Necromancy',classes:['paladin'],ritual:true,castingTime:'1 action',range:'Touch',components:['V','S','M'],duration:'10 days',description:'You touch a corpse or other remains. The target is protected from decay and cannot become undead for the duration.'}),
 spell('tasha2020',{id:'warding-bond',name:'Warding Bond',level:2,school:'Abjuration',classes:['paladin'],castingTime:'1 action',range:'Touch',components:['V','S','M'],duration:'1 hour',description:'You protect a willing creature and create a mystical bond. While it remains within 60 feet, it gains +1 AC, +1 to saving throws, and resistance to all damage, while you take the same amount of damage whenever it takes damage.'})
];
