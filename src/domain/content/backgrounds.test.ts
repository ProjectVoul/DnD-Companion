import {strict as assert} from 'node:assert';
import {BACKGROUNDS} from './backgrounds';
for(const background of BACKGROUNDS) assert.ok(background.description,`Missing background description: ${background.id}`);
console.log(`Background description coverage passed: ${BACKGROUNDS.length} records`);
