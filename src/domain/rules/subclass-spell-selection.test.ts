import {strict as assert} from 'node:assert';
import {subclassSpellChoices,canSubclassLearnSpell} from './subclass-spell-selection';
import type {Spell} from '../types';
const s=(id:string,school:string,classes:string[]):Spell=>({id,name:id,level:1,school,classes,description:'test',source:'phb2014'});
const spells=[s('shield','Abjuration',['wizard']),s('magic-missile','Evocation',['wizard']),s('charm-person','Enchantment',['bard','sorcerer','wizard']),s('silent-image','Illusion',['bard','sorcerer','wizard']),s('fireball','Evocation',['sorcerer','wizard'])];
const ek=subclassSpellChoices(spells,'fighter','eldritch-knight');assert.deepEqual(ek.map(x=>x.id),['shield','magic-missile','fireball']);assert.equal(canSubclassLearnSpell(spells[2],'fighter','eldritch-knight'),false);
const at=subclassSpellChoices(spells,'rogue','arcane-trickster');assert.deepEqual(at.map(x=>x.id),['charm-person','silent-image']);assert.equal(canSubclassLearnSpell(spells[0],'rogue','arcane-trickster'),false);
console.log('Subclass spell selection invariants passed');
