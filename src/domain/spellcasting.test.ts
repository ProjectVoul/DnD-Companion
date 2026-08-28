import {strict as assert} from 'node:assert';
import {maxKnownSpells,maxPreparedSpells,multiclassCasterLevel,pactMagicSlots,spellcastingProgression} from './rules/spellcasting';
import type {Character} from './types';
const base:Character={id:'spell-test',name:'Test',species:'Human',classes:[],level:1,abilityScores:{str:10,dex:10,con:10,int:16,wis:16,cha:16},skillStates:{} as Character['skillStates'],savingThrowProficiency:[],proficiencyBonus:2,maxHP:8,currentHP:8,tempHP:0,hitDice:{pools:[]},deathSaves:{successes:0,failures:0},items:[],spellcasting:{},features:[],resources:[],conditions:[],resistances:[]};
const wizard={...base,classes:[{id:'wizard',name:'Wizard',level:5,spellcastingAbility:'int' as const}]};
assert.equal(maxPreparedSpells(wizard,'wizard'),8); // INT +3 + wizard level 5
const cleric={...base,classes:[{id:'cleric',name:'Cleric',level:5,spellcastingAbility:'wis' as const}]};assert.equal(maxPreparedSpells(cleric,'cleric'),8);
const paladin={...base,abilityScores:{...base.abilityScores,cha:18},classes:[{id:'paladin',name:'Paladin',level:5,spellcastingAbility:'cha' as const}]};assert.equal(maxPreparedSpells(paladin,'paladin'),6); // CHA +4 + floor(5/2)
const bard={...base,classes:[{id:'bard',name:'Bard',level:5,spellcastingAbility:'cha' as const}],spellcasting:{bard:{known:['x','y','z'],prepared:[],alwaysPrepared:[],spellbook:[],slots:{}}}};assert.equal(maxKnownSpells(bard,'bard'),8);
const sorcerer={...base,classes:[{id:'sorcerer',name:'Sorcerer',level:10,spellcastingAbility:'cha' as const}]};assert.equal(maxKnownSpells(sorcerer,'sorcerer'),15);
const warlock={...base,classes:[{id:'warlock',name:'Warlock',level:11,spellcastingAbility:'cha' as const}]};assert.equal(maxKnownSpells(warlock,'warlock'),11);assert.deepEqual(pactMagicSlots(warlock),{max:3,level:5});
const ek={...base,classes:[{id:'fighter',name:'Fighter',level:7,subclassId:'eldritch-knight'}]};assert.deepEqual(spellcastingProgression(ek,'fighter'),{fullCasterLevels:0,halfCasterLevels:0,thirdCasterLevels:7,pactLevels:0});
const at={...base,classes:[{id:'rogue',name:'Rogue',level:9,subclassId:'arcane-trickster'}]};assert.equal(multiclassCasterLevel(at),3);
const mixed={...base,classes:[{id:'wizard',name:'Wizard',level:5,spellcastingAbility:'int' as const},{id:'paladin',name:'Paladin',level:6,spellcastingAbility:'cha' as const},{id:'fighter',name:'Fighter',level:6,subclassId:'eldritch-knight'}]};assert.equal(multiclassCasterLevel(mixed),9); // 5 full + floor(6/2) + floor(6/3)
console.log('spellcasting progression tests passed');
