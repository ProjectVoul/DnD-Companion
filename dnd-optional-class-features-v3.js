/* Tasha optional class features are opt-in; they never silently replace PHB features. */
(() => {
  'use strict';const D=window.DnDDataV2;if(!D)return;D.OPTIONAL_CLASS_FEATURES??={};
  const set=(cls,items)=>{D.OPTIONAL_CLASS_FEATURES[cls]=items.map(x=>({id:x[0],level:x[1],name:x[2],source:'tasha',optional:true,replaces:x[3]||null}));};
  set('barbarian', [['primal-knowledge',3,'Primal Knowledge'],['instinctive-pounce',7,'Instinctive Pounce']]);
  set('bard', [['magical-inspiration',1,'Magical Inspiration'],['additional-bard-spells',1,'Additional Bard Spells']]);
  set('cleric', [['additional-cleric-spells',1,'Additional Cleric Spells'],['harness-divine-power',2,'Harness Divine Power'],['cantrip-versatility',4,'Cantrip Versatility']]);
  set('druid', [['additional-druid-spells',1,'Additional Druid Spells'],['wild-companion',2,'Wild Companion'],['cantrip-versatility',4,'Cantrip Versatility']]);
  set('fighter', [['additional-fighting-style-options',1,'Additional Fighting Style Options'],['martial-versatility',4,'Martial Versatility'],['maneuver-options',3,'Maneuver Options']]);
  set('monk', [['dedicated-weapon',2,'Dedicated Weapon'],['quickened-healing',2,'Quickened Healing'],['focused-aim',5,'Focused Aim']]);
  set('paladin', [['additional-paladin-spells',2,'Additional Paladin Spells'],['harness-divine-power',3,'Harness Divine Power'],['martial-versatility',4,'Martial Versatility']]);
  set('ranger', [['additional-ranger-spells',2,'Additional Ranger Spells'],['favored-foe',1,'Favored Foe','favored-enemy'],['deft-explorer',1,'Deft Explorer','natural-explorer'],['primal-awareness',3,'Primal Awareness','primeval-awareness'],['martial-versatility',2,'Martial Versatility']]);
  set('rogue', [['steady-aim',3,'Steady Aim']]);
  set('sorcerer', [['additional-sorcerer-spells',1,'Additional Sorcerer Spells'],['sorcerous-versatility',4,'Sorcerous Versatility'],['magical-guidance',5,'Magical Guidance']]);
  set('warlock', [['additional-warlock-spells',1,'Additional Warlock Spells'],['eldritch-versatility',4,'Eldritch Versatility'],['additional-eldritch-invocations',2,'Additional Eldritch Invocations']]);
  set('wizard', [['additional-wizard-spells',1,'Additional Wizard Spells'],['cantrip-formulas',3,'Cantrip Formulas']]);
  D.CONTENT_COVERAGE??={};D.CONTENT_COVERAGE.tasha??={};D.CONTENT_COVERAGE.tasha.optionalClassFeatures=true;
})();