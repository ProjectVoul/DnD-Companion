const fs=require('fs');const vm=require('vm');const assert=require('assert');
const storage=new Map();global.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v))};global.window={};global.CustomEvent=class{constructor(type){this.type=type;}};
['dnd-data-v2.js','dnd-content-v2.js','dnd-content-v3-patch.js','dnd-rules-v2.js','dnd-class-features-v2.js','dnd-engine-v2.js','dnd-engine-v3.js','dnd-engine-v3-rules-patch.js','dnd-hp-sync-v3.js','dnd-racial-traits-v3.js'].forEach(f=>vm.runInThisContext(fs.readFileSync(f,'utf8'),{filename:f}));
const E=window.DnDEngineV3;
const tiefling=E.create({abilityScores:{constitution:10,charisma:14},classes:[{classId:'warlock',level:5}],origin:{species:'tiefling',subrace:''}});E.save();assert.ok(tiefling.origin.traits.length>=1);assert.equal(E.hasResistance(tiefling,'fire'),true);
const halfOrc=E.create({abilityScores:{strength:16,constitution:14},classes:[{classId:'fighter',level:5}],origin:{species:'half-orc',subrace:''}});E.save();assert.equal(halfOrc.proficiencies.skills.intimidation.proficiency,true);
console.log('D&D Companion v3 racial smoke tests passed');