import {strict as assert} from 'node:assert';
import {canMulticlassInto,levelUp} from './rules/leveling';
import type {Character} from './types';

const base:Character={id:'multiclass-test',name:'Test',species:'Human',classes:[{id:'fighter',name:'Fighter',level:4}],level:4,abilityScores:{str:16,dex:10,con:14,int:10,wis:10,cha:10},skillStates:{} as Character['skillStates'],savingThrowProficiency:[],proficiencyBonus:2,maxHP:36,currentHP:36,tempHP:0,hitDice:{pools:[{die:10,max:4,current:4}]},deathSaves:{successes:0,failures:0},items:[],spellcasting:{},features:[],resources:[],conditions:[],resistances:[],contentSources:['phb2014','tasha2020','homebrew']};

assert.equal(canMulticlassInto(base,'fighter'),true);
assert.equal(canMulticlassInto(base,'wizard'),false);
assert.equal(canMulticlassInto({...base,abilityScores:{...base.abilityScores,int:13}},'wizard'),true);
assert.equal(canMulticlassInto({...base,abilityScores:{...base.abilityScores,cha:13}},'paladin'),false);
assert.equal(canMulticlassInto({...base,abilityScores:{...base.abilityScores,str:13,cha:13}},'paladin'),true);
assert.equal(canMulticlassInto({...base,abilityScores:{...base.abilityScores,dex:13,wis:13}},'monk'),true);
assert.equal(canMulticlassInto({...base,abilityScores:{...base.abilityScores,int:13}},'artificer'),true);

const blocked=levelUp(base,'wizard','average');
assert.equal(blocked,base);
const allowed=levelUp({...base,abilityScores:{...base.abilityScores,int:13}},'wizard','average');
assert.equal(allowed.classes.some(c=>c.id==='wizard'&&c.level===1),true);
assert.equal(allowed.level,5);
assert.equal(allowed.hitDice.pools.length,2);
assert.deepEqual(allowed.hitDice.pools,[{die:10,max:4,current:4},{die:6,max:1,current:1}]);
console.log('multiclass prerequisite tests passed');
