import { CLASSES, SUBCLASSES } from '../catalog';
import { SUBCLASS_FEATURES } from './subclassFeatures';
import { EXPANSION_SUBCLASS_FEATURES } from './expansionSubclassFeatures';

const registry = new Map<string, { source: string }>();
for (const [classId, subclasses] of Object.entries(SUBCLASSES)) {
  for (const subclass of subclasses) registry.set(`${classId}.${subclass.id}`, subclass);
}

describe('subclass content integrity', () => {
  it('has unique class ids and every subclass belongs to a known class', () => {
    expect(new Set(CLASSES.map(c => c.id)).size).toBe(CLASSES.length);
    for (const [classId, subclasses] of Object.entries(SUBCLASSES)) {
      expect(CLASSES.some(c => c.id === classId)).toBe(true);
      expect(new Set(subclasses.map(s => s.id)).size).toBe(subclasses.length);
    }
  });

  it('does not contain orphaned subclass features', () => {
    for (const feature of [...SUBCLASS_FEATURES, ...EXPANSION_SUBCLASS_FEATURES]) {
      expect(registry.has(feature.subclassId)).toBe(true);
    }
  });

  it('keeps registry source and feature source aligned by expansion boundary', () => {
    for (const feature of [...SUBCLASS_FEATURES, ...EXPANSION_SUBCLASS_FEATURES]) {
      const registered = registry.get(feature.subclassId)!;
      if (registered.source === 'phb2014') expect(feature.source).toBe('subclass');
    }
  });
});
