import {strict as assert} from 'node:assert';
import {SPECIES_DATA} from './species';
for(const species of SPECIES_DATA){for(const feature of species.traits) assert.ok(feature.description,`Missing species trait description: ${species.id}:${feature.id}`);for(const sub of species.subraces) for(const feature of sub.traits) assert.ok(feature.description,`Missing subrace trait description: ${species.id}:${sub.id}:${feature.id}`);}
console.log(`Species description coverage passed: ${SPECIES_DATA.length} species`);
