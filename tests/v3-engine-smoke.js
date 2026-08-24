const fs=require('fs');
const vm=require('vm');
const assert=require('assert');
const storage=new Map();
global.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v))};
global.window={};
global.CustomEvent=class CustomEvent{constructor(type){this.type=type;}};
['dnd-data-v2.js','dnd-content-v2.js','dnd-content-v3-patch.js','dnd-rules-v2.js','dnd-class-features-v2.js','dnd-engine-v2.js','dnd-engine-v3.js','dnd-engine-v3-rules-patch.js'].forEach(file=>vm.runInThisContext(fs.readFileSync(file,'utf8'),{filename:file}));
const E=window.DnDEngineV3;
const D=window.DnDDataV2;

assert.ok(D.SUBCLASSES.some(s=>s.classId==='artificer'&&s.id==='alchemist'&&s.source==='tasha'));
assert.ok(D.SUBCLASSES.some(s=>s.classId==='artificer'&&s.id==='battle-smith'&&s.source==='tasha'));
assert.equal(D.SUBCLASS_FEATURES.artificer['battle-smith'].find(f=>f.id==='extra-attack').level,5);

const paladin=E.create({abilityScores:{strength:16,dexterity:10,constitution:16,intelligence:11,wisdom:13,charisma:18},classes:[{classId:'paladin',level:13,subclass:'devotion'}]});
assert.equal(E.totalLevel(paladin),13);
assert.equal(E.profBonus(paladin),5);
assert.equal(E.hpMaximum(paladin),121);
assert.equal(E.spellcasterLevel(paladin),6);
assert.deepEqual(E.spellSlots(paladin),{1:4,2:3,3:3});
assert.equal(E.spellDC(paladin),17);
assert.equal(E.extraAttacks(paladin),2);
assert.equal(E.saveThrow(paladin,'dexterity'),9);
assert.equal(E.hasImmunity(paladin,'frightened'),true);
const unconsciousPaladin=E.create({...paladin,conditions:['unconscious']});
assert.equal(E.hasImmunity(unconsciousPaladin,'frightened'),false);

const fighter11=E.create({abilityScores:{strength:18},classes:[{classId:'fighter',level:11,subclass:'battle-master'}]});
assert.equal(E.extraAttacks(fighter11),3);
const fighter20=E.create({abilityScores:{strength:18},classes:[{classId:'fighter',level:20,subclass:'battle-master'}]});
assert.equal(E.extraAttacks(fighter20),4);
const valor=E.create({abilityScores:{charisma:16},classes:[{classId:'bard',level:6,subclass:'valor'}]});
assert.equal(E.extraAttacks(valor),2);
const lore=E.create({abilityScores:{charisma:16},classes:[{classId:'bard',level:6,subclass:'lore'}]});
assert.equal(E.extraAttacks(lore),1);
assert.equal(E.initiative(lore),2);
const bardSkill=E.create({abilityScores:{intelligence:10},classes:[{classId:'bard',level:2,subclass:'lore'}]});
assert.equal(E.skill(bardSkill,'arcana'),2);
const armorer=E.create({abilityScores:{intelligence:16},classes:[{classId:'artificer',level:5,subclass:'armorer'}]});
assert.equal(E.extraAttacks(armorer),2);
const alchemist=E.create({abilityScores:{intelligence:16},classes:[{classId:'artificer',level:5,subclass:'alchemist'}]});
assert.equal(E.extraAttacks(alchemist),1);

const itemState=E.create({abilityScores:{strength:16,dexterity:10,constitution:16,intelligence:11,wisdom:13,charisma:18},classes:[{classId:'paladin',level:13}],items:[
  {id:'plate',name:'Plate Armor',mechanics:{type:'armor',category:'heavy',armorClass:18},equipment:{equipped:true}},
  {id:'shield',name:'Shield',mechanics:{type:'shield',armorBonus:4},equipment:{equipped:true}},
  {id:'magic',name:'Homebrew Ward',magic:true,attunementRequired:true,modifiers:[{target:'armorClass',value:1}],equipment:{equipped:true,attuned:true}}
]});
assert.equal(E.ac(itemState),23);

const unattuned=E.create({abilityScores:{dexterity:10},classes:[{classId:'fighter',level:1}],items:[
  {name:'Unattuned Charm',magic:true,attunementRequired:true,modifiers:[{target:'armorClass',value:5}],equipment:{equipped:true,attuned:false}}
]});
assert.equal(E.ac(unattuned),10);

const defenseState=E.create({abilityScores:{strength:16,dexterity:10,constitution:16,intelligence:11,wisdom:13,charisma:18},classes:[{classId:'paladin',level:13}],items:[
  {name:'Plate Armor',mechanics:{type:'armor',category:'heavy',armorClass:18},equipment:{equipped:true}},
  {name:'Shield',mechanics:{type:'shield',armorBonus:4},equipment:{equipped:true}}
],abilities:[{id:'defense-style',name:'Defense',effects:[{target:'armorClass',value:1,mode:'add'}]}]});
assert.equal(E.ac(defenseState),23);

const skills=E.create({abilityScores:{dexterity:16},classes:[{classId:'rogue',level:5}],proficiencies:{skills:{stealth:{proficiency:true},perception:{proficiency:true,expertise:true}}}});
assert.equal(E.skill(skills,'stealth'),6);
assert.equal(E.skill(skills,'perception'),9);

const multiclass=E.create({abilityScores:{intelligence:16,wisdom:14,charisma:16},classes:[{classId:'wizard',level:3},{classId:'paladin',level:6}]});
assert.equal(E.totalLevel(multiclass),9);
assert.equal(E.spellcasterLevel(multiclass),6);
assert.deepEqual(E.spellSlots(multiclass),{1:4,2:3,3:3});
assert.equal(E.spellAbility(multiclass,'wizard'),'intelligence');
assert.equal(E.spellAbility(multiclass,'paladin'),'charisma');

const warlock=E.create({abilityScores:{charisma:18},classes:[{classId:'warlock',level:5,subclass:'hexblade'}]});
assert.equal(E.spellcasterLevel(warlock),0);
assert.deepEqual(E.spellSlots(warlock).pact,{count:2,level:3});
assert.equal(E.spellDC(warlock),15);

const prepared=E.create({classes:[{classId:'wizard',level:5}],spells:[
  {id:'shield',name:'Shield',sourceClass:'wizard'},
  {id:'misty-step',name:'Misty Step',sourceClass:'wizard'}
],spellcasting:{prepared:{wizard:['shield']},known:{wizard:['shield','misty-step']},spellbook:{wizard:['shield','misty-step']}}});
assert.deepEqual(E.preparedSpells(prepared,'wizard'),['shield']);
assert.deepEqual(E.knownSpells(prepared,'wizard'),['shield','misty-step']);
assert.deepEqual(E.spellbook(prepared,'wizard'),['shield','misty-step']);

const conditions=E.create({conditions:['poisoned'],resistances:['fire'],immunities:['poison'],vulnerabilities:['cold']});
assert.equal(E.hasCondition(conditions,'poisoned'),true);
assert.equal(E.hasResistance(conditions,'fire'),true);
assert.equal(E.hasImmunity(conditions,'poison'),true);
assert.equal(E.hasVulnerability(conditions,'cold'),true);

const artificer=E.create({abilityScores:{intelligence:18},classes:[{classId:'artificer',level:14}]});
assert.equal(E.spellcasterLevel(artificer),7);
assert.equal(E.attunementCapacity(artificer),4);
const highArtificer=E.create({abilityScores:{intelligence:18},classes:[{classId:'artificer',level:18}]});
assert.equal(E.attunementCapacity(highArtificer),6);

console.log('D&D Companion v3 engine smoke tests passed');
