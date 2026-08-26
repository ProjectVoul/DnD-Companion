import {strict as assert} from 'node:assert';
import {ALL_SPELLS} from './spell-catalog';
import {SUBCLASS_SPELL_ACCESS} from './subclass-spell-access';

for(const access of SUBCLASS_SPELL_ACCESS){
 assert.equal(new Set(access.alwaysPrepared).size,access.alwaysPrepared.length,`Duplicate always-prepared spell in ${access.classId}/${access.subclassId}`);
 for(const id of access.alwaysPrepared){
  const spell=ALL_SPELLS.find(s=>s.id===id);
  assert.ok(spell,`Missing canonical spell ${id} for ${access.classId}/${access.subclassId}`);
 }
}
const devotion=SUBCLASS_SPELL_ACCESS.find(x=>x.subclassId==='devotion')!;
assert.ok(devotion.alwaysPrepared.includes('dispel-magic'));
assert.ok(devotion.alwaysPrepared.includes('flame-strike'));
const glory=SUBCLASS_SPELL_ACCESS.find(x=>x.subclassId==='glory')!;
assert.ok(glory.alwaysPrepared.includes('summon-celestial')===false);
console.log('Universal subclass spell-access invariants passed');
