import {strict as assert} from 'node:assert';
import {FEATS} from './feats';
for(const feat of FEATS){assert.ok(feat.description && !feat.description.includes('not yet populated'),`Missing feat description: ${feat.id}`);}
console.log(`Feat description coverage passed: ${FEATS.length} records`);
