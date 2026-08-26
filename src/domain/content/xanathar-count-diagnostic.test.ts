import {strict as assert} from 'node:assert';
import {ALL_SPELLS} from './spell-catalog';

// Xanathar's canonical set is assembled from the main source plus the
// supplemental records that were split out to keep the source maintainable.
const ids=ALL_SPELLS.filter(s=>s.source==='xanathar2017').map(s=>s.id);
console.log(`XANATHAR_COUNT=${ids.length}`);
console.log(`XANATHAR_IDS=${ids.join(',')}`);
assert.equal(ids.length,95,`Xanathar runtime source audit expects 95 new spells; got ${ids.length}`);
assert.equal(new Set(ids).size,95,'Xanathar runtime catalog must contain 95 unique spell ids');
