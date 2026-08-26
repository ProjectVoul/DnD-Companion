import type {Spell} from '../types';

/** 2014 PHB subclass spell-selection restrictions. */
export function subclassSpellChoices(spells:Spell[],classId:string,subclassId:string):Spell[]{
 if(classId==='fighter'&&subclassId==='eldritch-knight'){
  return spells.filter(s=>s.classes.includes('wizard')&&(s.school==='Abjuration'||s.school==='Evocation'));
 }
 if(classId==='rogue'&&subclassId==='arcane-trickster'){
  return spells.filter(s=>s.classes.includes('wizard')&&(s.school==='Enchantment'||s.school==='Illusion'));
 }
 return spells.filter(s=>s.classes.includes(classId));
}

export function canSubclassLearnSpell(spell:Spell,classId:string,subclassId:string):boolean{
 if(!spell.classes.includes('wizard')&&(subclassId==='eldritch-knight'||subclassId==='arcane-trickster'))return false;
 if(classId==='fighter'&&subclassId==='eldritch-knight')return spell.school==='Abjuration'||spell.school==='Evocation';
 if(classId==='rogue'&&subclassId==='arcane-trickster')return spell.school==='Enchantment'||spell.school==='Illusion';
 return spell.classes.includes(classId);
}
