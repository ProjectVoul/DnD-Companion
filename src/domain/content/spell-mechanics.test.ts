import {strict as assert} from 'node:assert';
import {SPELLS} from './spells';
import {withSpellMechanics,SPELL_MECHANICS_IDS} from './spell-mechanics';

const TECHNICAL_FIELDS=['range','castingTime','components','duration'] as const;
const DAMAGE_RE=/\b(d\d+|\d+d\d+)\b/i;
const SAVE_RE=/\b(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma) saving throw\b/i;
const ATTACK_RE=/\b(melee|ranged) spell attack\b/i;

const catalog=withSpellMechanics(SPELLS);
const missingTechnical:string[]=[];
const missingMechanics:string[]=[];
for(const spell of catalog){
 const hasCore=TECHNICAL_FIELDS.every(k=>spell[k]);
 const hasMechanics=!!spell.mechanics;
 const needsMechanics=DAMAGE_RE.test(spell.description??'')||SAVE_RE.test(spell.description??'')||ATTACK_RE.test(spell.description??'');
 if(!hasCore){missingTechnical.push(spell.id);continue;}
 if(needsMechanics&&!hasMechanics)missingMechanics.push(spell.id);
}
const missing=[...missingTechnical,...missingMechanics];
assert.equal(missing.length,0,`Spell technical metadata audit: ${missing.length} spell(s) still need structured mechanics. Missing: ${missing.join(', ')}.`);
for(const id of SPELL_MECHANICS_IDS)assert.ok(catalog.find(spell=>spell.id===id)?.mechanics,`Missing registered mechanics: ${id}`);
console.log('Spell technical metadata invariants passed');
