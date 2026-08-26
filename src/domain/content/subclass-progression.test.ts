import {strict as assert} from 'node:assert';
import {ALL_SUBCLASSES} from './subclass-registry';
import {subclassFeatureSlots} from './subclass-progression';

for(const [classId,subclasses] of Object.entries(ALL_SUBCLASSES)){
 for(const subclass of subclasses as {id:string;name:string}[]){
  const slots=subclassFeatureSlots(classId,subclass.id);
  assert.ok(slots.length>0,`Subclass has no progression slots: ${classId}/${subclass.id}`);
  assert.deepEqual(slots.map(s=>s.level),[...slots].sort((a,b)=>a.level-b.level).map(s=>s.level),`Subclass levels are not ordered: ${classId}/${subclass.id}`);
 }
}
console.log('Universal subclass progression invariants passed');
