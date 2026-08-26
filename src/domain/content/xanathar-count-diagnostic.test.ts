import {strict as assert} from 'node:assert';
import {XANATHAR_SPELLS} from './xanathar-spells';
const ids=XANATHAR_SPELLS.map(s=>s.id);
console.log(`XANATHAR_COUNT=${ids.length}`);
console.log(`XANATHAR_IDS=${ids.join(',')}`);
assert.equal(ids.length,95,`Xanathar source audit expects 95 new spells; got ${ids.length}`);
