import type { Feature } from '../types';
import { CLASS_PROGRESSION } from './class-progression';
import { CLASS_FEATURE_DETAILS } from './class-feature-details';

/**
 * Single canonical base-class feature catalog.
 *
 * CLASS_PROGRESSION owns the level/identity data. This compatibility view
 * preserves the historical CLASS_FEATURES IDs used by existing consumers and
 * enriches them with the rule-bearing details catalog where available.
 * Subclass-only progression placeholders are deliberately excluded: subclass
 * progression is resolved by the subclass registry/feature layer.
 */
const SUBCLASS_ONLY = /^(?:primal-path|path-feature-|bard-college|college-feature|divine-domain|domain-feature-|druid-circle|circle-feature-|martial-archetype|archetype-|monastic-tradition|tradition-|sacred-oath|oath-feature-|ranger-archetype|roguish-archetype|sorcerous-origin|origin-|otherworldly-patron|patron-|arcane-tradition|specialist-|artificer-specialist)/;

function isBaseFeature(feature: Feature): boolean {
  const localId = feature.id.split(':')[1] ?? feature.id;
  return !SUBCLASS_ONLY.test(localId);
}

function toCompatibilityFeature(feature: Feature): Feature {
  const parts = feature.id.split(':');
  const classId = parts[0];
  const localId = parts[1] ?? feature.id;
  const details = CLASS_FEATURE_DETAILS[`${classId}:${localId}`];
  return {
    id: `${classId}:${localId}`,
    name: feature.name,
    source: 'class',
    level: feature.level,
    description: details?.description,
    activation: details?.activation,
    resourceId: feature.resourceId,
  };
}

export const CLASS_FEATURES: Record<string, Feature[]> = Object.fromEntries(
  Object.entries(CLASS_PROGRESSION).map(([classId, progression]) => [
    classId,
    progression.filter(isBaseFeature).map(toCompatibilityFeature),
  ]),
);
