import type {Feature} from '../types';
import {ALL_SUBCLASSES} from './subclass-registry';
import {SUBCLASS_FEATURES} from './subclassFeatures';

/** Universal 2014 subclass progression levels. Actual feature records remain canonical data. */
const FEATURE_LEVELS: Record<string, number[]> = {
  barbarian: [3, 6, 10, 14], bard: [3, 6, 14], cleric: [1, 2, 6, 8, 17],
  druid: [2, 6, 10, 14], fighter: [3, 7, 10, 15, 18], monk: [3, 6, 11, 17],
  paladin: [3, 7, 15, 20], ranger: [3, 7, 11, 15], rogue: [3, 9, 13, 17],
  sorcerer: [1, 6, 14, 18], warlock: [1, 6, 10, 14], wizard: [2, 6, 10, 14],
  artificer: [3, 5, 9, 15],
};

export interface SubclassFeatureSlot {
  classId: string;
  subclassId: string;
  level: number;
  id: string;
  name: string;
}

export const SUBCLASS_FEATURE_SLOTS: SubclassFeatureSlot[] = Object.entries(ALL_SUBCLASSES).flatMap(
  ([classId, subclasses]) => (subclasses as {id: string; name: string}[]).flatMap(subclass =>
    (FEATURE_LEVELS[classId] ?? []).map(level => ({
      classId,
      subclassId: subclass.id,
      level,
      id: `subclass:${classId}:${subclass.id}:${level}`,
      name: `${subclass.name} Feature`,
    })),
  ),
);

export const subclassFeatureSlots = (classId: string, subclassId: string): SubclassFeatureSlot[] =>
  SUBCLASS_FEATURE_SLOTS.filter(f => f.classId === classId && f.subclassId === subclassId);

/** Resolve only canonical features belonging to this subclass and unlocked by this class level. */
export const subclassFeaturesFor = (classId: string, subclassId: string, level: number): Feature[] => {
  const allowedLevels = FEATURE_LEVELS[classId] ?? [];
  return SUBCLASS_FEATURES.filter(feature =>
    feature.subclassId === subclassId &&
    feature.level <= level &&
    allowedLevels.includes(feature.level),
  );
};

export const subclassFeaturesAtLevel = (classId: string, subclassId: string, level: number): Feature[] =>
  SUBCLASS_FEATURES.filter(feature =>
    feature.subclassId === subclassId &&
    feature.level === level &&
    (FEATURE_LEVELS[classId] ?? []).includes(level),
  );

/** Legacy compatibility helper: unresolved progression slots are exposed as explicit placeholders, never fake rules. */
export const subclassFeaturePlaceholders = (classId: string, subclassId: string): Feature[] =>
  subclassFeatureSlots(classId, subclassId)
    .filter(slot => !SUBCLASS_FEATURES.some(feature => feature.subclassId === subclassId && feature.level === slot.level))
    .map(slot => ({
      id: slot.id,
      name: slot.name,
      source: 'subclass',
      level: slot.level,
    }));