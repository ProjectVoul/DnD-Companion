import {strict as assert} from 'node:assert';
import {SPELLS} from './spells';

const TECHNICAL_FIELDS=['range','castingTime','components','duration'] as const;
const DAMAGE_RE=/\b(d\d+|\d+d\d+)\b/i;
const SAVE_RE=/\b(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma) saving throw\b/i;
const ATTACK_RE=/\b(melee|ranged) spell attack\b/i;

const missingTechnical:string[]=[];
const missingMechanics:string[]=[];
for(const spell of SPELLS){
 const hasCore=TECHNICAL_FIELDS.every(k=>spell[k]);
 const hasMechanics=!!spell.mechanics;
 const needsMechanics=DAMAGE_RE.test(spell.description??'')||SAVE_RE.test(spell.description??'')||ATTACK_RE.test(spell.description??'');
 if(!hasCore){missingTechnical.push(spell.id);continue;}
 // The audit intentionally fails only when the text explicitly exposes a mechanical
 // value that is not represented structurally. This lets us migrate the catalog in
 // batches without inventing mechanics that the source text does not support.
 if(needsMechanics&&!hasMechanics)missingMechanics.push(spell.id);
}
const missing=[...missingTechnical,...missingMechanics];
assert.equal(missing.length,0,`Spell technical metadata audit: ${missing.length} spell(s) still need structured mechanics. Missing: ${missing.join(', ')}. Add save/attack/damage/area metadata from the source before declaring the catalog complete.`);
console.log('Spell technical metadata invariants passed');
