import {strict as assert} from 'node:assert';
import {ALL_SPELLS,duplicateSpellIds} from './spell-catalog';
import {CONTENT_SOURCES} from './sources';
import {eligibleClassSpells} from '../rules/spellcasting';

const command=ALL_SPELLS.find(s=>s.id==='command');
assert.ok(command);
assert.deepEqual([...command.classes].sort(),['cleric','paladin']);
assert.equal(command.source,'phb2014');
for(const spell of ALL_SPELLS){assert.ok(spell.source,'Every catalogued spell must declare a source');assert.ok(CONTENT_SOURCES.some(source=>source.id===spell.source),'Every spell source must be known');assert.ok(spell.id,'Every spell must have an id');}
assert.deepEqual(duplicateSpellIds(ALL_SPELLS),[],'Runtime spell catalog must never expose duplicate ids');
assert.equal(CONTENT_SOURCES.find(s=>s.id==='phb2014')?.enabledByDefault,true);
assert.equal(CONTENT_SOURCES.find(s=>s.id==='xanathar2017')?.enabledByDefault,false);
assert.equal(CONTENT_SOURCES.find(s=>s.id==='tasha2020')?.enabledByDefault,false);

const corePaladin=eligibleClassSpells(ALL_SPELLS,'paladin',['phb2014']).map(s=>s.id);
const expectedCore=['bless','command','compelled-duel','cure-wounds','detect-evil-and-good','detect-magic','detect-poison-and-disease','divine-favor','heroism','protection-from-evil-and-good','purify-food-and-drink','searing-smite','shield-of-faith','thunderous-smite','wrathful-smite','aid','branding-smite','find-steed','lesser-restoration','locate-object','magic-weapon','protection-from-poison','zone-of-truth','aura-of-vitality','blinding-smite','create-food-and-water','crusaders-mantle','daylight','dispel-magic','elemental-weapon','magic-circle','remove-curse','revivify','aura-of-life','aura-of-purity','banishment','death-ward','locate-creature','banishing-smite','circle-of-power','destructive-wave','dispel-evil-and-good','geas','raise-dead'];
assert.equal(corePaladin.length,expectedCore.length);
for(const id of expectedCore)assert.ok(corePaladin.includes(id),`Missing PHB paladin spell: ${id}`);
const xanatharPaladin=eligibleClassSpells(ALL_SPELLS,'paladin',['phb2014','xanathar2017']).map(s=>s.id);
for(const id of ['ceremony','find-greater-steed','holy-weapon','staggering-smite'])assert.ok(xanatharPaladin.includes(id),`Missing Xanathar paladin spell: ${id}`);
const withoutXanathar=eligibleClassSpells(ALL_SPELLS,'paladin',['phb2014']).map(s=>s.id);
for(const id of ['ceremony','find-greater-steed','holy-weapon','staggering-smite'])assert.ok(!withoutXanathar.includes(id),`Xanathar spell leaked into core list: ${id}`);
const tashaPaladin=eligibleClassSpells(ALL_SPELLS,'paladin',['phb2014','tasha2020']).map(s=>s.id);
for(const id of ['prayer-of-healing','gentle-repose','spirit-shroud','summon-celestial','warding-bond'])assert.ok(tashaPaladin.includes(id),`Missing Tasha paladin spell: ${id}`);
console.log('Spell/content-source/duplicate invariants passed');
