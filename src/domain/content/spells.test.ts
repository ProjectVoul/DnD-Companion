import {strict as assert} from 'node:assert';
import {SPELLS} from './spells';
import {CONTENT_SOURCES} from './sources';

const command=SPELLS.find(s=>s.id==='command');
assert.ok(command);
assert.deepEqual(command.classes.sort(),['cleric','paladin']);
assert.equal(command.source,'phb2014');
for(const spell of SPELLS){assert.ok(spell.source,'Every catalogued spell must declare a source');assert.ok(CONTENT_SOURCES.some(source=>source.id===spell.source),'Every spell source must be a known content source');}
assert.equal(CONTENT_SOURCES.find(s=>s.id==='phb2014')?.enabledByDefault,true);
assert.equal(CONTENT_SOURCES.find(s=>s.id==='xanathar2017')?.enabledByDefault,false);
assert.equal(CONTENT_SOURCES.find(s=>s.id==='tasha2020')?.enabledByDefault,false);
console.log('Spell/content-source invariants passed');
