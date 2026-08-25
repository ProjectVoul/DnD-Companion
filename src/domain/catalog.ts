import type {Ability} from './types';
export type SpellcastingModel='none'|'known'|'prepared'|'spellbook'|'pact';
export interface ClassDefinition{ id:string; name:string; hitDie:4|6|8|10|12; primaryAbilities:Ability[]; savingThrows:Ability[]; spellcasting:SpellcastingModel; spellcastingAbility?:Ability; subclassLevel:number; }
export const CLASSES:ClassDefinition[]=[
{id:'barbarian',name:'Barbarian',hitDie:12,primaryAbilities:['str'],savingThrows:['str','con'],spellcasting:'none',subclassLevel:3},
{id:'bard',name:'Bard',hitDie:8,primaryAbilities:['cha'],savingThrows:['dex','cha'],spellcasting:'known',spellcastingAbility:'cha',subclassLevel:3},
{id:'cleric',name:'Cleric',hitDie:8,primaryAbilities:['wis'],savingThrows:['wis','cha'],spellcasting:'prepared',spellcastingAbility:'wis',subclassLevel:1},
{id:'druid',name:'Druid',hitDie:8,primaryAbilities:['wis'],savingThrows:['int','wis'],spellcasting:'prepared',spellcastingAbility:'wis',subclassLevel:2},
{id:'fighter',name:'Fighter',hitDie:10,primaryAbilities:['str','dex'],savingThrows:['str','con'],spellcasting:'none',subclassLevel:3},
{id:'monk',name:'Monk',hitDie:8,primaryAbilities:['dex','wis'],savingThrows:['str','dex'],spellcasting:'none',subclassLevel:3},
{id:'paladin',name:'Paladin',hitDie:10,primaryAbilities:['str','cha'],savingThrows:['wis','cha'],spellcasting:'prepared',spellcastingAbility:'cha',subclassLevel:3},
{id:'ranger',name:'Ranger',hitDie:10,primaryAbilities:['dex','wis'],savingThrows:['str','dex'],spellcasting:'prepared',spellcastingAbility:'wis',subclassLevel:3},
{id:'rogue',name:'Rogue',hitDie:8,primaryAbilities:['dex'],savingThrows:['dex','int'],spellcasting:'none',subclassLevel:3},
{id:'sorcerer',name:'Sorcerer',hitDie:6,primaryAbilities:['cha'],savingThrows:['con','cha'],spellcasting:'known',spellcastingAbility:'cha',subclassLevel:1},
{id:'warlock',name:'Warlock',hitDie:8,primaryAbilities:['cha'],savingThrows:['wis','cha'],spellcasting:'pact',spellcastingAbility:'cha',subclassLevel:1},
{id:'wizard',name:'Wizard',hitDie:6,primaryAbilities:['int'],savingThrows:['int','wis'],spellcasting:'spellbook',spellcastingAbility:'int',subclassLevel:2},
{id:'artificer',name:'Artificer',hitDie:8,primaryAbilities:['int'],savingThrows:['con','int'],spellcasting:'prepared',spellcastingAbility:'int',subclassLevel:3},
];
export const SUBCLASSES:Record<string,{id:string;name:string;source:string}[]>= {
barbarian:[{id:'berserker',name:'Path of the Berserker',source:'phb2014'},{id:'totem-warrior',name:'Path of the Totem Warrior',source:'phb2014'}],
bard:[{id:'lore',name:'College of Lore',source:'phb2014'},{id:'valor',name:'College of Valor',source:'phb2014'}],
cleric:[{id:'knowledge',name:'Knowledge Domain',source:'phb2014'},{id:'life',name:'Life Domain',source:'phb2014'},{id:'light',name:'Light Domain',source:'phb2014'},{id:'nature',name:'Nature Domain',source:'phb2014'},{id:'tempest',name:'Tempest Domain',source:'phb2014'},{id:'trickery',name:'Trickery Domain',source:'phb2014'},{id:'war',name:'War Domain',source:'phb2014'}],
druid:[{id:'land',name:'Circle of the Land',source:'phb2014'},{id:'moon',name:'Circle of the Moon',source:'phb2014'}],
fighter:[{id:'champion',name:'Champion',source:'phb2014'},{id:'battle-master',name:'Battle Master',source:'phb2014'},{id:'eldritch-knight',name:'Eldritch Knight',source:'phb2014'}],
monk:[{id:'open-hand',name:'Way of the Open Hand',source:'phb2014'},{id:'shadow',name:'Way of Shadow',source:'phb2014'},{id:'four-elements',name:'Way of the Four Elements',source:'phb2014'}],
paladin:[{id:'ancients',name:'Oath of the Ancients',source:'phb2014'},{id:'devotion',name:'Oath of Devotion',source:'phb2014'},{id:'vengeance',name:'Oath of Vengeance',source:'phb2014'}],
ranger:[{id:'hunter',name:'Hunter',source:'phb2014'},{id:'beast-master',name:'Beast Master',source:'phb2014'}],
rogue:[{id:'thief',name:'Thief',source:'phb2014'},{id:'assassin',name:'Assassin',source:'phb2014'},{id:'arcane-trickster',name:'Arcane Trickster',source:'phb2014'}],
sorcerer:[{id:'draconic',name:'Draconic Bloodline',source:'phb2014'},{id:'wild-magic',name:'Wild Magic',source:'phb2014'}],
warlock:[{id:'archfey',name:'The Archfey',source:'phb2014'},{id:'fiend',name:'The Fiend',source:'phb2014'},{id:'great-old-one',name:'The Great Old One',source:'phb2014'}],
wizard:[{id:'abjuration',name:'School of Abjuration',source:'phb2014'},{id:'conjuration',name:'School of Conjuration',source:'phb2014'},{id:'divination',name:'School of Divination',source:'phb2014'},{id:'enchantment',name:'School of Enchantment',source:'phb2014'},{id:'evocation',name:'School of Evocation',source:'phb2014'},{id:'illusion',name:'School of Illusion',source:'phb2014'},{id:'necromancy',name:'School of Necromancy',source:'phb2014'},{id:'transmutation',name:'School of Transmutation',source:'phb2014'}],
artificer:[{id:'alchemist',name:'Alchemist',source:'tasha2020'},{id:'armorer',name:'Armorer',source:'tasha2020'},{id:'artillerist',name:'Artillerist',source:'tasha2020'},{id:'battle-smith',name:'Battle Smith',source:'tasha2020'}],
};
export const SPECIES=['Dragonborn','Dwarf','Elf','Gnome','Half-Elf','Half-Orc','Halfling','Human','Variant Human','Tiefling'];
