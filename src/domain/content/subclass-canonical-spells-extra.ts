import type {Spell} from '../types';

const phb=(spell:Spell):Spell=>({...spell,source:'phb2014'});

/** Additional PHB records referenced by subclass spell access and absent from the base canonical catalog. */
export const SUBCLASS_CANONICAL_SPELLS_EXTRA:Spell[]=[
 phb({id:'bane',name:'Bane',level:1,school:'Enchantment',classes:['bard','cleric'],concentration:true,castingTime:'1 action',range:'30 feet',components:['V','S','M'],duration:'Concentration, up to 1 minute',description:'Up to three creatures of your choice within range that can see or hear you make Charisma saving throws. A target that fails subtracts 1d4 from attack rolls and saving throws for the duration.'}),
];
