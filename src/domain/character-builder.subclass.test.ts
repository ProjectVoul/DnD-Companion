import {strict as assert} from 'node:assert';
import {createBlankCharacter,assignSubclass} from './character-builder';

const base=createBlankCharacter();
const multiclass={...base,classes:[
 {id:'paladin',name:'Paladin',level:20,spellcastingAbility:'cha'},
 {id:'wizard',name:'Wizard',level:14,spellcastingAbility:'int'}
]};
const paladin=assignSubclass(multiclass,'glory');
assert.equal(paladin.classes[0].subclassId,'glory');
assert.ok(paladin.features.some(f=>f.id==='paladin:glory:aura-of-alacrity'));
assert.ok(!paladin.features.some(f=>f.id==='wizard:bladesinging:blade-song'));

const wizard=assignSubclass(paladin,'order-of-scribes','wizard');
assert.equal(wizard.classes[1].subclassId,'order-of-scribes');
assert.ok(wizard.features.some(f=>f.id==='wizard:order-of-scribes:quill'));
assert.ok(wizard.features.some(f=>f.id==='wizard:order-of-scribes:one-with-the-word'));
assert.ok(!wizard.features.some(f=>f.id==='paladin:glory:aura-of-alacrity'));
assert.ok(!wizard.features.some(f=>f.id==='paladin:glory:living-legend'));

const swords=assignSubclass(multiclass,'swords','bard');
assert.equal(swords.classes[0].subclassId,undefined);
assert.equal(swords.classes[1].subclassId,undefined);
const bard={...base,classes:[{id:'bard',name:'Bard',level:14,spellcastingAbility:'cha'}]};
const bardSwords=assignSubclass(bard,'swords');
assert.equal(bardSwords.classes[0].subclassId,'swords');
assert.equal(bardSwords.features.filter(f=>f.id.startsWith('bard:swords:')).length,5);

console.log('Multiclass-aware concrete subclass assignment invariants passed');
