const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

global.window={};
['dnd-data-v2.js','dnd-content-v2.js','dnd-content-v3-patch.js','dnd-rules-v2.js','dnd-class-features-v2.js'].forEach(file=>vm.runInThisContext(fs.readFileSync(file,'utf8'),{filename:file}));
const D=window.DnDDataV2;
const validSources=new Set(Object.keys(D.SOURCES));
const classIds=Object.keys(D.CLASSES);

assert.equal(classIds.length,13,'expected 13 supported classes including Artificer');
for(const id of classIds){
  assert.ok(D.CLASS_RULES[id],`missing class rules: ${id}`);
  assert.ok(Array.isArray(D.CLASS_RULES[id].asi),`missing ASI progression: ${id}`);
  assert.ok(Array.isArray(D.CLASS_RULES[id].subclassLevels),`missing subclass progression: ${id}`);
  assert.ok(D.CLASS_RULES[id].proficiencies,`missing proficiencies: ${id}`);
}

const subclassKeys=new Set();
for(const s of D.SUBCLASSES){
  const key=`${s.classId}:${s.id}`;
  assert.ok(!subclassKeys.has(key),`duplicate subclass: ${key}`);
  subclassKeys.add(key);
  assert.ok(validSources.has(s.source),`unknown subclass source: ${s.source}`);
  assert.ok(D.CLASSES[s.classId],`subclass references unknown class: ${s.classId}`);
}

for(const id of ['alchemist','armorer','artillerist','battle-smith']){
  const key=`artificer:${id}`;
  assert.ok(subclassKeys.has(key),`missing Tasha Artificer subclass: ${id}`);
  assert.ok(Array.isArray(D.SUBCLASS_FEATURES.artificer[id]),`missing feature table: ${id}`);
  assert.ok(D.SUBCLASS_FEATURES.artificer[id].every(f=>f.source==='tasha'),`wrong source on ${id}`);
}

assert.deepEqual(D.CLASS_RULES.artificer.casterType,'artificer');
assert.equal(D.EXTRA_ATTACK.fighter[11],2);
assert.equal(D.EXTRA_ATTACK.fighter[20],3);
assert.equal(D.EXTRA_ATTACK.artificer[5],1);
assert.equal(D.CLASS_RULES.paladin.subclassLevels[0],3);
assert.equal(D.CLASS_RULES.wizard.subclassLevels[0],2);
assert.equal(D.CLASS_RULES.cleric.subclassLevels[0],1);

assert.ok(D.FEATS && Object.keys(D.FEATS).length>=45,'PHB/Tasha feat catalog unexpectedly small');
assert.ok(D.FEATS.feyTouched?.source==='tasha');
assert.ok(D.FEATS.warCaster?.source==='phb2014');

console.log('D&D Companion v3 content integrity tests passed');
