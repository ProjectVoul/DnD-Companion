import {strict as assert} from 'node:assert';
import {SPELLS} from './spells';
for(const spell of SPELLS){
  assert.equal(spell.source,'phb2014',`Unexpected source: ${spell.id}`);
  assert.ok(spell.castingTime,`Missing casting time: ${spell.id}`);
  assert.ok(spell.range,`Missing range: ${spell.id}`);
  assert.ok(spell.components?.length,`Missing components: ${spell.id}`);
  assert.ok(spell.duration,`Missing duration: ${spell.id}`);
  assert.ok(spell.description,`Missing description: ${spell.id}`);
  if(spell.concentration) assert.match(spell.duration!,/^Concentration,/ ,`Concentration mismatch: ${spell.id}`);
}
console.log(`Spell metadata coverage passed: ${SPELLS.length} records`);
