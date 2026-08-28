import {strict as assert} from 'node:assert';
import {SPECIES_DATA} from './species';

const byId=Object.fromEntries(SPECIES_DATA.map(s=>[s.id,s]));

for(const species of SPECIES_DATA){
  assert.ok(species.size, `${species.id}: missing size`);
  assert.ok(species.languages?.length, `${species.id}: missing languages`);
  assert.ok(species.speed, `${species.id}: missing speed`);
}

assert.deepEqual(byId.dragonborn.languages,['Common','Draconic']);
assert.deepEqual(byId.dwarf.languages,['Common','Dwarvish']);
assert.deepEqual(byId.elf.languages,['Common','Elvish']);
assert.deepEqual(byId.gnome.languages,['Common','Gnomish']);
assert.deepEqual(byId.halfling.languages,['Common','Halfling']);
assert.deepEqual(byId['half-orc'].languages,['Common','Orc']);
assert.deepEqual(byId.tiefling.languages,['Common','Infernal']);
assert.deepEqual(byId.human.languages,['Common']);
assert.equal(byId.human.languageChoiceCount,1);
assert.equal(byId['half-elf'].languageChoiceCount,1);
assert.equal(byId['variant-human'].languageChoiceCount,1);
assert.equal(byId.gnome.size,'Small');
assert.equal(byId.halfling.size,'Small');
assert.equal(byId.dwarf.size,'Medium');
assert.equal(byId.elf.subraces.find(s=>s.id==='high-elf')?.languageChoiceCount,1);
console.log('Species metadata invariants passed');
