/* D&D Companion v2 — progression/rules layer.
 * Source basis: Player's Handbook 2014, Xanathar's Guide, Tasha's Cauldron.
 * This file contains mechanics, not presentation.
 */
(() => {
  'use strict';
  const D=window.DnDDataV2,C={};
  const asi={barbarian:[4,8,12,16,19],bard:[4,8,12,16,19],cleric:[4,8,12,16,19],druid:[4,8,12,16,19],fighter:[4,6,8,12,14,16,19],monk:[4,8,12,16,19],paladin:[4,8,12,16,19],ranger:[4,8,12,16,19],rogue:[4,8,10,12,16,19],sorcerer:[4,8,12,16,19],warlock:[4,8,12,16,19],wizard:[4,8,12,16,19],artificer:[4,8,12,16,19]};
  const subclassLevels={barbarian:[3,6,10,14],bard:[3,6,14],cleric:[1,2,6,8,17],druid:[2,6,10,14],fighter:[3,7,10,15,18],monk:[3,6,11,17],paladin:[3,7,15,20],ranger:[3,7,11,15],rogue:[3,9,13,17],sorcerer:[1,6,14,18],warlock:[1,6,10,14],wizard:[2,6,10,14],artificer:[3,5,9,15]};
  const multiclassPrerequisites={barbarian:{strength:13},bard:{charisma:13},cleric:{wisdom:13},druid:{wisdom:13},fighter:{or:[{strength:13},{dexterity:13}]},rogue:{dexterity:13},wizard:{intelligence:13},monk:{and:[{dexterity:13},{wisdom:13}]},paladin:{and:[{strength:13},{charisma:13}]},ranger:{and:[{dexterity:13},{wisdom:13}]},sorcerer:{charisma:13},warlock:{charisma:13},artificer:{intelligence:13}};
  const classSkills={
    barbarian:{count:2,options:['animalHandling','athletics','intimidation','nature','perception','survival']},
    bard:{count:3,options:Object.keys(D.SKILLS)},
    cleric:{count:2,options:['history','insight','medicine','persuasion','religion']},
    druid:{count:2,options:['arcana','animalHandling','insight','medicine','nature','perception','religion','survival']},
    fighter:{count:2,options:['acrobatics','animalHandling','athletics','history','insight','intimidation','perception','survival']},
    monk:{count:2,options:['acrobatics','athletics','history','insight','religion','stealth']},
    paladin:{count:2,options:['athletics','insight','intimidation','medicine','persuasion','religion']},
    ranger:{count:3,options:['animalHandling','athletics','insight','investigation','nature','perception','stealth','survival']},
    rogue:{count:4,options:['acrobatics','athletics','deception','insight','intimidation','investigation','perception','performance','persuasion','sleightOfHand','stealth']},
    sorcerer:{count:2,options:['arcana','deception','insight','intimidation','persuasion','religion']},
    warlock:{count:2,options:['arcana','deception','history','intimidation','investigation','nature','religion']},
    wizard:{count:2,options:['arcana','history','insight','investigation','medicine','religion']},
    artificer:{count:2,options:['arcana','history','investigation','medicine','nature','perception','sleightOfHand']}
  };
  const classProficiencies={
    barbarian:{armor:['light','medium','shields'],weapons:['simple','martial'],saves:['strength','constitution']},bard:{armor:['light'],weapons:['simple','hand-crossbows','longswords','rapiers','shortswords'],saves:['dexterity','charisma']},cleric:{armor:['light','medium','shields'],weapons:['simple'],saves:['wisdom','charisma']},druid:{armor:['light','medium','shields'],weapons:['club','dagger','dart','javelin','mace','quarterstaff','scimitar','sickle','sling','spear'],saves:['intelligence','wisdom']},fighter:{armor:['light','medium','heavy','shields'],weapons:['simple','martial'],saves:['strength','constitution']},monk:{armor:[],weapons:['simple','shortsword'],saves:['strength','dexterity']},paladin:{armor:['light','medium','heavy','shields'],weapons:['simple','martial'],saves:['wisdom','charisma']},ranger:{armor:['light','medium','shields'],weapons:['simple','martial'],saves:['strength','dexterity']},rogue:{armor:['light'],weapons:['simple','hand-crossbows','longswords','rapiers','shortswords'],saves:['dexterity','intelligence']},sorcerer:{armor:[],weapons:['dagger','dart','sling','quarterstaff','light-crossbow'],saves:['constitution','charisma']},warlock:{armor:['light'],weapons:['simple'],saves:['wisdom','charisma']},wizard:{armor:[],weapons:['dagger','dart','sling','quarterstaff','light-crossbow'],saves:['intelligence','wisdom']},artificer:{armor:['light','medium','shields'],weapons:['simple'],saves:['constitution','intelligence'],tools:['thieves-tools','tinkers-tools','artisan-choice']}
  };
  const multiclassProficiencies={barbarian:{armor:['shields'],weapons:['simple','martial']},bard:{armor:['light'],skills:'choice:1',tools:'choice:1 musical'},cleric:{armor:['light','medium','shields']},druid:{armor:['light','medium','shields']},fighter:{armor:['light','medium','heavy','shields'],weapons:['simple','martial']},monk:{weapons:['simple','shortsword']},paladin:{armor:['light','medium','shields'],weapons:['simple','martial']},ranger:{armor:['light','medium','shields'],weapons:['simple','martial'],skills:'choice:1'},rogue:{armor:['light'],weapons:['simple','shortsword'],skills:'choice:1',tools:['thieves-tools']},sorcerer:{weapons:['simple']},warlock:{armor:['light'],weapons:['simple']},wizard:{weapons:['simple']},artificer:{armor:['light','medium','shields'],weapons:['simple'],tools:['thieves-tools','tinkers-tools']}};
  const casterType={bard:'full',cleric:'full',druid:'full',sorcerer:'full',wizard:'full',paladin:'half',ranger:'half',artificer:'artificer',warlock:'pact'};
  const spellcastingSubclasses={fighter:{'eldritch-knight':'third'},rogue:{'arcane-trickster':'third'}};
  const pactSlots={1:{slots:1,level:1},2:{slots:2,level:1},3:{slots:2,level:2},4:{slots:2,level:2},5:{slots:2,level:3},6:{slots:2,level:3},7:{slots:2,level:4},8:{slots:2,level:4},9:{slots:2,level:5},10:{slots:2,level:5},11:{slots:3,level:5},12:{slots:3,level:5},13:{slots:3,level:5},14:{slots:3,level:5},15:{slots:3,level:5},16:{slots:3,level:5},17:{slots:4,level:5},18:{slots:4,level:5},19:{slots:4,level:5},20:{slots:4,level:5}};
  const martialExtraAttack={barbarian:{5:1},fighter:{5:1,11:2,20:3},monk:{5:1},paladin:{5:1},ranger:{5:1},bard:{6:1},artificer:{5:1}};
  const classResource={barbarian:{1:{id:'rage',formula:'level'}},monk:{2:{id:'ki',formula:'level'}},sorcerer:{2:{id:'sorcery-points',formula:'level'}},bard:{1:{id:'bardic-inspiration',formula:'cha-mod'}},fighter:{1:{id:'second-wind',formula:'1'},2:{id:'action-surge',formula:'1'}},paladin:{1:{id:'lay-on-hands',formula:'level*5'}},cleric:{2:{id:'channel-divinity',formula:'1'}},druid:{2:{id:'wild-shape',formula:'2'}}};
  Object.keys(D.CLASSES).forEach(id=>{C[id]={id,hitDie:D.CLASSES[id].hitDie,asi:asi[id]||[],subclassLevels:subclassLevels[id]||[],multiclassPrerequisite:multiclassPrerequisites[id]||null,skillChoices:classSkills[id]||null,proficiencies:classProficiencies[id]||{},multiclassProficiencies:multiclassProficiencies[id]||{},casterType:casterType[id]||null,resources:classResource[id]||{},extraAttack:martialExtraAttack[id]||{}};});
  C.fighter.spellcastingSubclasses=spellcastingSubclasses.fighter;C.rogue.spellcastingSubclasses=spellcastingSubclasses.rogue;
  D.CLASS_RULES=C;D.CLASS_SKILLS=classSkills;D.CLASS_PROFICIENCIES=classProficiencies;D.SPELLCASTING={casterType,pactSlots,fullCaster:'full',halfCaster:'half',artificer:'artificer',thirdCaster:'third'};D.MULTICLASS={prerequisites:multiclassPrerequisites,proficiencies:multiclassProficiencies};D.ASI_LEVELS=asi;D.SUBCLASS_LEVELS=subclassLevels;D.EXTRA_ATTACK=martialExtraAttack;D.CLASS_RESOURCES=classResource;
})();