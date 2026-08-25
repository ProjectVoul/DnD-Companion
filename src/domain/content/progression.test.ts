import {strict as assert} from 'node:assert';
import {CLASS_PROGRESSION} from './class-progression';

const levels=(classId:string,idPrefix:string)=>CLASS_PROGRESSION[classId].filter(f=>f.id.includes(`:${idPrefix}:`)).map(f=>f.level);
const asiLevels=(classId:string)=>CLASS_PROGRESSION[classId].filter(f=>f.id.includes(':asi-')).map(f=>f.level);

assert.deepEqual(levels('bard','song-of-rest'),[2,9,13,17]);
assert.deepEqual(levels('cleric','destroy-undead-1'),[5]);
assert.deepEqual(levels('cleric','destroy-undead-2'),[11]);
assert.deepEqual(levels('cleric','destroy-undead-3'),[14]);
assert.deepEqual(levels('cleric','destroy-undead-4'),[17]);
assert.deepEqual(levels('ranger','natural-explorer'),[1]);
assert.deepEqual(levels('ranger','natural-explorer-2'),[6]);
assert.deepEqual(levels('ranger','natural-explorer-3'),[10]);
assert.deepEqual(levels('warlock','eldritch-invocations'),[2]);
assert.deepEqual(levels('warlock','eldritch-invocations-2'),[5]);
assert.deepEqual(levels('warlock','eldritch-invocations-3'),[7]);
assert.deepEqual(levels('warlock','eldritch-invocations-4'),[9]);
assert.deepEqual(levels('warlock','eldritch-invocations-5'),[12]);
assert.deepEqual(levels('warlock','eldritch-invocations-6'),[15]);
assert.deepEqual(levels('warlock','eldritch-invocations-7'),[18]);
assert.deepEqual(levels('warlock','mystic-arcanum-6'),[11]);
assert.deepEqual(levels('warlock','mystic-arcanum-7'),[13]);
assert.deepEqual(levels('warlock','mystic-arcanum-8'),[15]);
assert.deepEqual(levels('warlock','mystic-arcanum-9'),[17]);

const standard=[4,8,12,16,19];
for(const id of ['barbarian','bard','cleric','druid','monk','paladin','ranger','rogue','sorcerer','warlock','wizard'])assert.deepEqual(asiLevels(id),standard,`ASI progression mismatch: ${id}`);
assert.deepEqual(asiLevels('fighter'),[4,6,8,12,14,16,19]);
assert.deepEqual(asiLevels('artificer'),standard);

console.log('Class progression invariants passed');
