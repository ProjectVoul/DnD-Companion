export type SpellPreparationMode='known'|'prepared'|'spellbook'|'pact';
export type SpellcastingAbility='int'|'wis'|'cha';

/** PHB 2014 spellcasting model. Content values are rule metadata, not UI state. */
export interface PhbSpellcastingProfile {
  ability:SpellcastingAbility;
  mode:SpellPreparationMode;
  ritual:boolean;
  focus:boolean;
  multiclassContribution:'full'|'half'|'third'|'none';
}

export const PHB_SPELLCASTING:Record<string,PhbSpellcastingProfile>={
  bard:{ability:'cha',mode:'known',ritual:true,focus:true,multiclassContribution:'full'},
  cleric:{ability:'wis',mode:'prepared',ritual:true,focus:true,multiclassContribution:'full'},
  druid:{ability:'wis',mode:'prepared',ritual:true,focus:true,multiclassContribution:'full'},
  paladin:{ability:'cha',mode:'prepared',ritual:false,focus:true,multiclassContribution:'half'},
  ranger:{ability:'wis',mode:'known',ritual:false,focus:true,multiclassContribution:'half'},
  sorcerer:{ability:'cha',mode:'known',ritual:false,focus:true,multiclassContribution:'full'},
  wizard:{ability:'int',mode:'spellbook',ritual:true,focus:true,multiclassContribution:'full'},
  warlock:{ability:'cha',mode:'pact',ritual:false,focus:true,multiclassContribution:'none'},
  fighter-eldritch-knight:{ability:'int',mode:'known',ritual:true,focus:false,multiclassContribution:'third'},
  rogue-arcane-trickster:{ability:'int',mode:'known',ritual:true,focus:false,multiclassContribution:'third'},
};
