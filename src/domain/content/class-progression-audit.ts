import { CLASS_FEATURES } from './class-features';

/**
 * Non-destructive audit helpers for the canonical class progression.
 * These intentionally report problems instead of mutating content so source data
 * can be corrected against the supplied rulebooks without hiding discrepancies.
 */
export type ProgressionIssue =
  | { kind: 'unsorted-level'; classId: string; previousLevel: number; level: number }
  | { kind: 'duplicate-feature'; classId: string; featureId: string; level: number };

export function auditClassProgressions(): ProgressionIssue[] {
  const issues: ProgressionIssue[] = [];
  for (const [classId, features] of Object.entries(CLASS_FEATURES)) {
    let previousLevel = 0;
    const seen = new Set<string>();
    for (const feature of features) {
      if (feature.level < previousLevel) {
        issues.push({ kind: 'unsorted-level', classId, previousLevel, level: feature.level });
      }
      previousLevel = Math.max(previousLevel, feature.level ?? 0);
      if (seen.has(feature.id)) {
        issues.push({ kind: 'duplicate-feature', classId, featureId: feature.id, level: feature.level ?? 0 });
      }
      seen.add(feature.id);
    }
  }
  return issues;
}
