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

/**
 * Resolve concrete subclass features already present in the canonical registry.
 * Missing content is deliberately omitted rather than represented as fake rules text.
 */
export const subclassFeaturesFor = (classId: string, subclassId: string, level: number): Feature[] =>
  SUBCLASS_FEATURES.filter(
    feature =>
      feature.subclassId === subclassId &&
      feature.level <= level &&
      feature.level <= (FEATURE_LEVELS[classId]?.[FEATURE_LEVELS[classId].length - 1] ?? level),
  );

export const subclassFeaturesAtLevel = (classId: string, subclassId: string, level: number): Feature[] =>
  SUBCLASS_FEATURES.filter(feature => feature.subclassId === subclassId && feature.level === level);

/** Legacy compatibility helper: returns only unresolved slots, never pretending they are real features. */
export const subclassFeaturePlaceholders = (classId: string, subclassId: string): Feature[] =>
  subclassFeatureSlots(classId, subclassId)
    .filter(slot => !SUBCLASS_FEATURES.some(feature => feature.subclassId === subclassId && feature.level === slot.level))
    .map(slot => ({
      id: slot.id,
      name: slot.name,
      source: 'subclass',
      level: slot.level,
    }));
