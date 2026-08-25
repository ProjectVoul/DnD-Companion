import {strict as assert} from 'node:assert';
import {auditContent} from './content-audit';

const audit=auditContent();

assert.deepEqual(audit.spellsMissingDescription,[],`Spells without descriptions: ${audit.spellsMissingDescription.join(', ')}`);
assert.deepEqual(audit.spellsMissingSource,[],`Spells without source: ${audit.spellsMissingSource.join(', ')}`);
assert.deepEqual(audit.featsMissingDescription,[],`Feats without descriptions: ${audit.featsMissingDescription.join(', ')}`);
assert.deepEqual(audit.backgroundsMissingDescription,[],`Backgrounds without descriptions: ${audit.backgroundsMissingDescription.join(', ')}`);

console.log('Content audit passed');
