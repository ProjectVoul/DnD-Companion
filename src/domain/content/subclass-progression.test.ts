import {strict as assert} from 'node:assert';
import {ALL_SUBCLASSES} from './subclass-registry';
import {SUBCLASS_FEATURES} from './subclassFeatures';
import {subclassFeatureSlots, subclassFeaturesAtLevel, subclassFeaturesFor} from './subclass-progression';

for (const [classId, subclasses] of Object.entries(ALL_SUBCLASSES)) {
  for (const subclass of subclasses as {id: string; name: string}[]) {
    const slots = subclassFeatureSlots(classId, subclass.id);
    assert.ok(slots.length > 0, `Subclass has no progression slots: ${classId}/${subclass.id}`);
    assert.deepEqual(slots.map(s => s.level), [...slots].sort((a, b) => a.level - b.level).map(s => s.level), `Subclass levels are not ordered: ${classId}/${subclass.id}`);
    const resolved = subclassFeaturesFor(classId, subclass.id, 20);
    assert.equal(new Set(resolved.map(f => f.id)).size, resolved.length, `Duplicate subclass feature ids: ${classId}/${subclass.id}`);
    for (const feature of resolved) {
      const canonical = SUBCLASS_FEATURES.find(f => f.id === feature.id);
      assert.ok(canonical, `Resolved feature is not canonical: ${feature.id}`);
      assert.equal(canonical?.subclassId, subclass.id, `Cross-subclass feature leaked: ${classId}/${subclass.id}/${feature.id}`);
      assert.ok(feature.level > 0 && feature.level <= 20, `Invalid subclass feature level: ${feature.id}`);
      assert.ok(subclassFeaturesAtLevel(classId, subclass.id, feature.level).some(f => f.id === feature.id), `Level resolver mismatch: ${feature.id}`);
    }
  }
}

for (const feature of subclassFeaturesFor('fighter', 'fighter.champion', 20)) assert.notEqual(feature.name, 'Champion Feature');

console.log('Universal subclass progression invariants passed');