import type {Feature} from '../types';
const o=(classId:string,level:number,id:string,name:string,replaces?:string):Feature=>({id:`tasha:${classId}:${id}`,name,source:'optional',sourceBook:'tasha2020',level,optional:true,replaces});
export const OPTIONAL_CLASS_FEATURES:Record<string,Feature[]>={
barbarian:[o('barbarian',2,'instinctive-pounce','Instinctive Pounce'),o('barbarian',3,'primal-knowledge','Primal Knowledge')],
bard:[o('bard',1,'additional-spells','Additional Bard Spells'),o('bard',2,'magical-inspiration','Magical Inspiration'),o('bard',4,'cantrip-versatility','Cantrip Versatility')],
cleric:[o('cleric',1,'additional-spells','Additional Cleric Spells'),o('cleric',2,'harness-divine-power','Harness Divine Power'),o('cleric',8,'blessed-strikes','Blessed Strikes','Divine Strike')],
druid:[o('druid',2,'wild-companion','Wild Companion'),o('druid',4,'cantrip-versatility','Cantrip Versatility')],
fighter:[o('fighter',1,'additional-fighting-style','Additional Fighting Style Options'),o('fighter',4,'martial-versatility','Martial Versatility')],
monk:[o('monk',2,'dedicated-weapon','Dedicated Weapon'),o('monk',2,'ki-fueled-attack','Ki-Fueled Attack'),o('monk',4,'quickened-healing','Quickened Healing'),o('monk',5,'focused-aim','Focused Aim')],
paladin:[o('paladin',2,'additional-spells','Additional Paladin Spells'),o('paladin',2,'fighting-style-options','Additional Fighting Style Options'),o('paladin',3,'harness-divine-power','Harness Divine Power'),o('paladin',2,'blessed-warrior','Blessed Warrior'),o('paladin',2,'blind-fighting','Blind Fighting'),o('paladin',2,'interception','Interception')],
ranger:[o('ranger',1,'favored-foe','Favored Foe','Favored Enemy'),o('ranger',1,'deft-explorer','Deft Explorer','Natural Explorer'),o('ranger',2,'additional-spells','Additional Ranger Spells'),o('ranger',2,'druidic-warrior','Druidic Warrior'),o('ranger',2,'ranger-spellcasting-focus','Ranger Spellcasting Focus')],
rogue:[o('rogue',4,'martial-versatility','Martial Versatility')],
sorcerer:[o('sorcerer',1,'additional-spells','Additional Sorcerer Spells'),o('sorcerer',2,'magical-guidance','Magical Guidance'),o('sorcerer',4,'metamagic-versatility','Metamagic Versatility')],
warlock:[o('warlock',1,'additional-spells','Additional Warlock Spells')],
wizard:[o('wizard',3,'cantrip-formulas','Cantrip Formulas')],
artificer:[]
};
