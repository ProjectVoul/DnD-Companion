import { CLASS_FEATURES } from './class-features';

const EXPECTED_ASI_LEVELS: Record<string, number[]> = {
  barbarian: [4, 8, 12, 16, 19],
  bard: [4, 8, 12, 16, 19],
  cleric: [4, 8, 12, 16, 19],
  druid: [4, 8, 12, 16, 19],
  fighter: [4, 6, 8, 12, 14, 16, 19],
  monk: [4, 8, 12, 16, 19],
  paladin: [4, 8, 12, 16, 19],
  ranger: [4, 8, 12, 16, 19],
  rogue: [4, 8, 10, 12, 16, 19],
  sorcerer: [4, 8, 12, 16, 19],
  warlock: [4, 8, 12, 16, 19],
  wizard: [4, 8, 12, 16, 19],
  artificer: [4, 8, 12, 16, 19],
};

describe('PHB class progression integrity', () => {
  it('keeps every class progression ordered by level', () => {
    for (const [classId, features] of Object.entries(CLASS_FEATURES)) {
      for (let i = 1; i < features.length; i += 1) {
        expect(features[i].level).toBeGreaterThanOrEqual(features[i - 1].level);
      }
    }
  });

  it('uses the canonical Ability Score Improvement levels', () => {
    for (const [classId, expected] of Object.entries(EXPECTED_ASI_LEVELS)) {
      const actual = CLASS_FEATURES[classId]
        .filter(feature => feature.id.startsWith(`${classId}:asi-`))
        .map(feature => feature.level);
      expect(actual).toEqual(expected);
    }
  });
});
