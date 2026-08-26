import {SUBCLASS_FEATURES} from './subclass-features';
import {SUBCLASSES} from './subclasses';

describe('universal subclass feature catalog',()=>{
  test('every registered subclass has a concrete feature registry entry',()=>{
    const missing=SUBCLASSES.filter(s=>!(SUBCLASS_FEATURES[`${s.classId}:${s.id}`]??[]).length);
    expect(missing.map(s=>`${s.classId}:${s.id}`)).toEqual([]);
  });
  test('registered subclass features have descriptions',()=>{
    const incomplete=Object.entries(SUBCLASS_FEATURES).flatMap(([key,features])=>features.filter(f=>!f.description).map(f=>`${key}:${f.id}`));
    expect(incomplete).toEqual([]);
  });
});
