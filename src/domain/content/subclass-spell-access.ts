import type {CharacterClass} from '../types';
/** Canonical subclass spell access. IDs reference the single spell catalog. */
export interface SubclassSpellAccess{classId:string;subclassId:string;alwaysPrepared:string[];expanded:string[];}
export const SUBCLASS_SPELL_ACCESS:SubclassSpellAccess[]=[
 {classId:'paladin',subclassId:'devotion',alwaysPrepared:['protection-from-evil-and-good','sanctuary','lesser-restoration','zone-of-truth','beacon-of-hope','dispel-magic','freedom-of-movement','guardian-of-faith','commune','flame-strike'],expanded:[]},
 {classId:'paladin',subclassId:'ancients',alwaysPrepared:['ensnaring-strike','speak-with-animals','moonbeam','misty-step','plant-growth','protection-from-energy','ice-storm','stoneskin','commune-with-nature','tree-stride'],expanded:[]},
 {classId:'paladin',subclassId:'vengeance',alwaysPrepared:['bane','hunters-mark','hold-person','misty-step','haste','protection-from-energy','banishment','dimension-door','hold-monster','scrying'],expanded:[]},
 {classId:'paladin',subclassId:'glory',alwaysPrepared:['guiding-bolt','heroism','enhance-ability','magic-weapon','haste','protection-from-energy','compulsion','freedom-of-movement','flame-strike','commune'],expanded:[]},
 {classId:'paladin',subclassId:'watchers',alwaysPrepared:['alarm','detect-magic','moonbeam','see-invisibility','counterspell','nondetection','aura-of-purity','banishment','hold-monster','scrying'],expanded:[]},
];
export function subclassSpellAccess(classId:string,subclassId?:string){return subclassId?SUBCLASS_SPELL_ACCESS.find(x=>x.classId===classId&&x.subclassId===subclassId):undefined;}
export function subclassAlwaysPreparedSpellIds(cl:CharacterClass):string[]{return subclassSpellAccess(cl.id,cl.subclassId)?.alwaysPrepared??[];}
