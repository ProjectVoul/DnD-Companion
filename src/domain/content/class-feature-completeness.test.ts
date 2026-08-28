import {strict as assert} from 'node:assert';
import {CLASS_FEATURES} from './class-features';
import {CLASSES} from '../catalog';

const EXPECTED_LEVELS:Record<string,number[]>={
 barbarian:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
 // Bard has no base-class feature at 7th level; Song of Rest scales at 9th, 13th and 17th.
 bard:[1,2,3,4,5,6,8,10,12,13,14,16,17,18,19,20],
 // Cleric has no base-class feature at 3rd level; its Divine Domain progression is subclass content.
 cleric:[1,2,4,5,6,8,10,11,12,14,16,17,18,19,20],
 druid:[1,2,4,6,8,10,12,14,16,18,19,20],
 fighter:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
 monk:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
 paladin:[1,2,3,4,5,6,7,8,10,11,12,14,15,16,18,19,20],
 ranger:[1,2,3,4,5,6,7,8,10,11,12,14,16,18,19,20],
 rogue:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
 sorcerer:[1,2,3,4,6,8,10,12,14,16,17,18,19,20],
 warlock:[1,2,3,4,6,8,10,11,12,13,14,15,16,17,19,20],
 wizard:[1,2,4,6,8,10,12,14,16,18,19,20],
 artificer:[1,2,3,4,5,6,7,8,9,10,11,12,14,15,16,18,19,20]
};
for(const cls of CLASSES){const features=CLASS_FEATURES[cls.id]??[];assert.ok(features.length>0,`Missing class features: ${cls.id}`);const ids=features.map(f=>f.id);assert.equal(new Set(ids).size,ids.length,`Duplicate class feature ID: ${cls.id}`);for(const f of features){assert.equal(f.source,'class');assert.equal(f.level>=1&&f.level<=20,true,`Invalid feature level: ${f.id}`)}const levels=[...new Set(features.map(f=>f.level))].sort((a,b)=>a-b);assert.deepEqual(levels,EXPECTED_LEVELS[cls.id],`Class progression coverage mismatch: ${cls.id}`)}
console.log('Class feature completeness invariants passed');
