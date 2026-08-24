const fs=require('fs');const vm=require('vm');const assert=require('assert');
const storage=new Map();global.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v))};global.window={};global.CustomEvent=class{constructor(type){this.type=type;}};
['dnd-data-v2.js','dnd-content-v2.js','dnd-rules-v2.js','dnd-class-features-v2.js','dnd-class-features-v3-completion.js'].forEach(f=>vm.runInThisContext(fs.readFileSync(f,'utf8'),{filename:f}));
const D=window.DnDDataV2;
for(const id of Object.keys(D.CLASSES)){assert.ok((D.CLASS_FEATURES[id]||[]).length>=3,`missing base features for ${id}`);}
assert.equal(D.CLASS_FEATURES.wizard.find(f=>f.id==='arcane-tradition').level,2);
assert.equal(D.CLASS_FEATURES.barbarian.find(f=>f.id==='extra-attack').level,5);
assert.equal(D.CLASS_FEATURES.paladin.find(f=>f.id==='aura-of-protection').level,6);
assert.equal(D.CLASS_FEATURES.warlock.find(f=>f.id==='mystic-arcanum-9').level,17);
console.log('D&D Companion v3 feature progression smoke tests passed');