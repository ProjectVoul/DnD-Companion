import {strict as assert} from 'node:assert';
import type {Character} from '../types';
import {classResources} from './resources';

const character=(classes:Character['classes'],cha=18,int=18):Character=>({
 id:'resource-test',name:'Resource Test',species:'dragonborn',classes,level:Math.max(...classes.map(c=>c.level)),
 abilityScores:{str:10,dex:10,con:10,int,wis:10,cha},skillStates:{} as Character['skillStates'],savingThrowProficiency:[],proficiencyBonus:2,
 maxHP:10,currentHP:10,tempHP:0,hitDice:{pools:[]},deathSaves:{successes:0,failures:0},items:[],spellcasting:{},sharedSpellSlots:{},features:[{id:'breath-weapon',name:'Breath Weapon',source:'species',level:1}],resources:[],conditions:[],resistances:[],fightingStyles:[],feats:[],contentSources:[],optionalFeatures:[]
});

const resource=(c:Character,id:string)=>classResources(c).find(r=>r.id===id);

const bard=resource(character([{id:'bard',name:'Bard',level:5,spellcastingAbility:'cha'}]),'bard:bardic-inspiration');
assert.equal(bard?.max,4);assert.equal(bard?.recharge,'short');

const fighter=character([{id:'fighter',name:'Fighter',level:17}]);
assert.equal(resource(fighter,'fighter:second-wind')?.max,2);
assert.equal(resource(fighter,'fighter:action-surge')?.max,2);
assert.equal(resource(fighter,'fighter:indomitable')?.max,3);

const paladin=character([{id:'paladin',name:'Paladin',level:14,spellcastingAbility:'cha'}]);
assert.equal(resource(paladin,'paladin:lay-on-hands')?.max,70);
assert.equal(resource(paladin,'paladin:divine-sense')?.max,5);
assert.equal(resource(paladin,'paladin:cleansing-touch')?.max,4);
assert.equal(resource(paladin,'paladin:channel-divinity')?.max,1);

const cleric=character([{id:'cleric',name:'Cleric',level:18,spellcastingAbility:'wis'}]);
assert.equal(resource(cleric,'cleric:channel-divinity')?.max,3);

const multiclass=character([{id:'cleric',name:'Cleric',level:18,spellcastingAbility:'wis'},{id:'paladin',name:'Paladin',level:3,spellcastingAbility:'cha'}]);
assert.equal(resource(multiclass,'cleric:channel-divinity')?.max,3);
assert.equal(resource(multiclass,'paladin:channel-divinity')?.max,1);
assert.equal(classResources(multiclass).filter(r=>r.name==='Channel Divinity').length,2);

const artificer=character([{id:'artificer',name:'Artificer',level:10,spellcastingAbility:'int'}]);
assert.equal(resource(artificer,'artificer:flash-of-genius')?.max,4);
assert.equal(resource(artificer,'artificer:flash-of-genius')?.recharge,'long');

const dragonborn=character([{id:'fighter',name:'Fighter',level:1}]);
assert.equal(resource(dragonborn,'feature:breath-weapon')?.max,1);
assert.equal(resource(dragonborn,'feature:breath-weapon')?.recharge,'short');

console.log('Resource derivation invariants passed');
