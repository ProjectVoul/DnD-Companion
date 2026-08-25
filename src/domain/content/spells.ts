import type {Spell} from '../types';

/** Core spell catalog. Source is explicit so optional books can be enabled without silently mixing content. */
export const SPELLS:Spell[]=[
{id:'bless',name:'Bless',level:1,school:'Enchantment',classes:['cleric','paladin'],source:'phb2014'},
{id:'cure-wounds',name:'Cure Wounds',level:1,school:'Evocation',classes:['bard','cleric','druid','paladin','ranger'],source:'phb2014'},
{id:'shield-of-faith',name:'Shield of Faith',level:1,school:'Abjuration',classes:['cleric','paladin'],concentration:true,source:'phb2014'},
{id:'command',name:'Command',level:1,school:'Enchantment',classes:['cleric','paladin'],source:'phb2014'},
{id:'wrathful-smite',name:'Wrathful Smite',level:1,school:'Evocation',classes:['paladin'],concentration:true,source:'phb2014'},
{id:'aid',name:'Aid',level:2,school:'Abjuration',classes:['cleric','paladin'],source:'phb2014'},
{id:'find-steed',name:'Find Steed',level:2,school:'Conjuration',classes:['paladin'],source:'phb2014'},
{id:'lesser-restoration',name:'Lesser Restoration',level:2,school:'Abjuration',classes:['bard','cleric','druid','paladin','ranger'],source:'phb2014'},
{id:'magic-weapon',name:'Magic Weapon',level:2,school:'Transmutation',classes:['paladin','ranger','wizard'],concentration:true,source:'phb2014'},
{id:'dispel-magic',name:'Dispel Magic',level:3,school:'Abjuration',classes:['bard','cleric','druid','paladin','sorcerer','warlock','wizard'],source:'phb2014'},
{id:'revivify',name:'Revivify',level:3,school:'Necromancy',classes:['cleric','paladin'],source:'phb2014'},
{id:'aura-of-vitality',name:'Aura of Vitality',level:3,school:'Evocation',classes:['paladin'],concentration:true,source:'phb2014'},
{id:'banishment',name:'Banishment',level:4,school:'Abjuration',classes:['cleric','paladin','sorcerer','warlock','wizard'],concentration:true,source:'phb2014'},
{id:'death-ward',name:'Death Ward',level:4,school:'Abjuration',classes:['cleric','paladin'],source:'phb2014'},
{id:'circle-of-power',name:'Circle of Power',level:5,school:'Abjuration',classes:['paladin'],concentration:true,source:'phb2014'}
];
