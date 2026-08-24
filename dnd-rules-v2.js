/* D&D Companion v2 — progression/rules layer.
 * Source basis: Player's Handbook 2014, Xanathar's Guide, Tasha's Cauldron.
 * This file contains mechanics, not presentation.
 */
(() => {
  'use strict';
  const D=window.DnDDataV2;
  const C={};
  const asi={barbarian:[4,8,12,16,19],bard:[4,8,12,16,19],cleric:[4,8,12,16,19],druid:[4,8,12,16,19],fighter:[4,6,8,12,14,16,19],monk:[4,8,12,16,19],paladin:[4,8,12,16,19],ranger:[4,8,12,16,19],rogue:[4,8,10,12,16,19],sorcerer:[4,8,12,16,19],warlock:[4,8,12,16,19],wizard:[4,8,12,16,19],artificer:[4,8,12,16,19]};
  const subclassLevels={barbarian:[3,6,10,14],bard:[3,6,14],cleric:[1,2,6,8,17],druid:[2,6,10,14],fighter:[3,7,10,15,18],monk:[3,6,11,17],paladin:[3,7,15,20],ranger:[3,7,11,15],rogue:[3,9,13,17],sorcerer:[1,6,14,18],warlock:[1,6,10,14],wizard:[2,6,10,14],artificer:[3,5,9,15]};
  const multiclassPrerequisites={
    barbarian:{strength:13},bard:{charisma:13},cleric:{wisdom:13},druid:{wisdom:13},fighter:{or:[{strength:13},{dexterity:13}]},rogue:{dexterity:13},wizard:{intelligence:13},monk:{and:[{dexterity:13},{wisdom:13}]},paladin:{and:[{strength:13},{charisma:13}]},ranger:{and:[{dexterity:13},{wisdom:13}]},sorcerer:{charisma:13},warlock:{charisma:13},artificer:{intelligence:13}
  };
  const multiclassProficiencies={
    barbarian:{armor:['shields'],weapons:['simple','martial']},bard:{armor:['light'],skills:'choice:1',tools:'choice:1 musical'},cleric:{armor:['light','medium','shields']},druid:{armor:['light','medium','shields'],weapons:[]},fighter:{armor:['light','medium','heavy','shields'],weapons:['simple','martial']},monk:{armor:[],weapons:['simple','shortsword']},paladin:{armor:['light','medium','heavy','shields'],weapons:['simple','martial']},ranger:{armor:['light','medium','shields'],weapons:['simple','martial'],skills:'choice:1'},rogue:{armor:['light'],weapons:['simple','shortsword'],skills:'choice:1',tools:['thieves-tools']},sorcerer:{armor:[],weapons:['simple']},warlock:{armor:['light'],weapons:['simple']},wizard:{armor:[],weapons:['simple']},artificer:{armor:['light','medium','shields'],weapons:['simple'],tools:['thieves-tools','tinkers-tools']}
  };
  const casterType={bard:'full',cleric:'full',druid:'full',sorcerer:'full',wizard:'full',paladin:'half',ranger:'half',artificer:'artificer',warlock:'pact'};
  const spellcastingSubclasses={
    fighter:{'eldritch-knight':'third'},rogue:{'arcane-trickster':'third'}
  };
  const pactSlots={1:{slots:1,level:1},2:{slots:2,level:1},3:{slots:2,level:2},4:{slots:2,level:2},5:{slots:2,level:3},6:{slots:2,level:3},7:{slots:2,level:4},8:{slots:2,level:4},9:{slots:2,level:5},10:{slots:2,level:5},11:{slots:3,level:5},12:{slots:3,level:5},13:{slots:3,level:5},14:{slots:3,level:5},15:{slots:3,level:5},16:{slots:3,level:5},17:{slots:4,level:5},18:{slots:4,level:5},19:{slots:4,level:5},20:{slots:4,level:5}};
  const martialExtraAttack={barbarian:{5:1},fighter:{5:1,11:2,20:3},monk:{5:1},paladin:{5:1},ranger:{5:1},bard:{6:1},artificer:{5:1}};
  const classResource={barbarian:{1:{id:'rage',formula:'level',uses:{1:2,3:3,6:4,12:5,17:6,20:'unlimited'}},monk:{2:{id:'ki',formula:'level'}},sorcerer:{2:{id:'sorcery-points',formula:'level'}},bard:{1:{id:'bardic-inspiration',formula:'cha-mod'}},fighter:{1:{id:'second-wind',formula:'1'},2:{id:'action-surge',formula:'1'}},paladin:{1:{id:'lay-on-hands',formula:'level*5'}},cleric:{2:{id:'channel-divinity',formula:'1'}},druid:{2:{id:'wild-shape',formula:'2'}},warlock:{2:{id:'eldritch-invocations',formula:'invocations-known'}}};
  Object.keys(D.CLASSES).forEach(id=>{
    C[id]={
      id,hitDie:D.CLASSES[id].hitDie,asi:asi[id]||[],subclassLevels:subclassLevels[id]||[],multiclassPrerequisite:multiclassPrerequisites[id]||null,
      multiclassProficiencies:multiclassProficiencies[id]||{},casterType:casterType[id]||null,resources:classResource[id]||{},extraAttack:martialExtraAttack[id]||{}
    };
  });
  C.fighter.spellcastingSubclasses=spellcastingSubclasses.fighter;C.rogue.spellcastingSubclasses=spellcastingSubclasses.rogue;
  D.CLASS_RULES=C;
  D.SPELLCASTING={casterType,pactSlots,fullCaster:'full',halfCaster:'half',artificer:'artificer',thirdCaster:'third'};
  D.MULTICLASS={prerequisites:multiclassPrerequisites,proficiencies:multiclassProficiencies};
  D.ASI_LEVELS=asi;
  D.SUBCLASS_LEVELS=subclassLevels;
  D.EXTRA_ATTACK=martialExtraAttack;
  D.CLASS_RESOURCES=classResource;
})();