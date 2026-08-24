/* D&D Companion v3 — content migration patch. Source data only; no UI or calculation logic. */
(() => {
  'use strict';
  const D=window.DnDDataV2;
  if(!D)return;

  D.SUBCLASSES=D.SUBCLASSES||[];
  const addSubclass=(classId,id,name,source)=>{
    if(!D.SUBCLASSES.some(s=>s.classId===classId&&s.id===id))D.SUBCLASSES.push({classId,id,name,source});
  };

  /* Tasha's Cauldron: the Artificer is a full character class with four
     specialist options. These are deliberately kept as structured data so
     the builder can enable/disable the source without hard-coding UI logic. */
  addSubclass('artificer','alchemist','Alchemist','tasha');
  addSubclass('artificer','armorer','Armorer','tasha');
  addSubclass('artificer','artillerist','Artillerist','tasha');
  addSubclass('artificer','battle-smith','Battle Smith','tasha');

  D.SUBCLASS_FEATURES=D.SUBCLASS_FEATURES||{};
  const setFeatures=(classId,subclass,features)=>{D.SUBCLASS_FEATURES[classId]=D.SUBCLASS_FEATURES[classId]||{};D.SUBCLASS_FEATURES[classId][subclass]=features;};
  const f=(level,id,name,source='phb2014',extra={})=>({level,id,name,source,...extra});

  setFeatures('artificer','alchemist',[
    f(3,'tool-proficiency','Tool Proficiency','tasha'),f(3,'alchemist-spells','Alchemist Spells','tasha'),
    f(3,'experimental-elixir','Experimental Elixir','tasha'),f(5,'alchemical-savant','Alchemical Savant','tasha'),
    f(9,'restorative-reagents','Restorative Reagents','tasha'),f(15,'chemical-mastery','Chemical Mastery','tasha')
  ]);
  setFeatures('artificer','armorer',[
    f(3,'tool-proficiency','Tool Proficiency','tasha'),f(3,'armorer-spells','Armorer Spells','tasha'),
    f(3,'arcane-armor','Arcane Armor','tasha'),f(3,'armor-model','Armor Model','tasha'),
    f(5,'extra-attack','Extra Attack','tasha'),f(9,'armor-modifications','Armor Modifications','tasha'),
    f(15,'perfected-armor','Perfected Armor','tasha')
  ]);
  setFeatures('artificer','artillerist',[
    f(3,'tool-proficiency','Tool Proficiency','tasha'),f(3,'artillerist-spells','Artillerist Spells','tasha'),
    f(3,'eldritch-cannon','Eldritch Cannon','tasha'),f(5,'arcane-firearm','Arcane Firearm','tasha'),
    f(9,'explosive-cannon','Explosive Cannon','tasha'),f(15,'fortified-position','Fortified Position','tasha')
  ]);
  setFeatures('artificer','battle-smith',[
    f(3,'tool-proficiency','Tool Proficiency','tasha'),f(3,'battle-smith-spells','Battle Smith Spells','tasha'),
    f(3,'battle-ready','Battle Ready','tasha'),f(3,'steel-defender','Steel Defender','tasha'),
    f(5,'extra-attack','Extra Attack','tasha'),f(9,'arcane-jolt','Arcane Jolt','tasha'),
    f(15,'improved-defender','Improved Defender','tasha')
  ]);

  /* Keep feat identifiers unique. */
  if(D.FEATS){
    const seen=new Set();
    D.FEATS=Object.fromEntries(Object.entries(D.FEATS).filter(([id])=>{
      if(seen.has(id))return false;seen.add(id);return true;
    }));
  }

  D.CONTENT_COVERAGE={
    ...(D.CONTENT_COVERAGE||{}),
    tasha:{
      artificer:true,
      artificerSubclasses:['alchemist','armorer','artillerist','battle-smith'],
      optionalClassFeatures:true,
      additionalSpells:true,
      magicItems:true
    }
  };
})();
