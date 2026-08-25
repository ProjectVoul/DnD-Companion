import type {Character,Spell,SpellState} from '../types';
import {CLASSES} from '../catalog';
import {derivedAbilityMod} from './effects';
const PACT_SLOTS:[number,number][]=[[1,1],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],[9,2],[10,2],[11,3],[12,3],[13,3],[14,3],[15,3],[16,3],[17,4],[18,4],[19,4],[20,4]];
const PACT_SLOT_LEVEL=[0,1,1,2,2,3,3,4,4,5,5,5,5,5,5,5,5,5,5,5,5];
export function emptySpellState():SpellState{return {known:[],prepared:[],alwaysPrepared:[],spellbook:[],slots:{}}}
export function spellcastingClass(c:Character,classId:string){return c.classes.find(x=>x.id===classId)}
export function eligibleClassSpells(spells:Spell[],classId:string,enabledSources:string[]){return spells.filter(s=>s.classes.includes(classId)&&enabledSources.includes(s.source??'phb2014'))}
export function availablePrepared(state:SpellState){return [...new Set([...state.alwaysPrepared,...state.prepared])]} 
export function canPrepare(state:SpellState,spellId:string,preparedLimit:number){if(state.alwaysPrepared.includes(spellId))return true;if(state.prepared.includes(spellId))return true;return state.prepared.length<preparedLimit}
export function setPrepared(state:SpellState,spellId:string,prepared:boolean,limit:number):SpellState{const always=state.alwaysPrepared.includes(spellId);const next=new Set(state.prepared);if(always)return state;if(prepared&&next.size<limit)next.add(spellId);if(!prepared)next.delete(spellId);return {...state,prepared:[...next]}}
export function maxPreparedSpells(c:Character,classId:string){const cl=c.classes.find(x=>x.id===classId);const def=CLASSES.find(x=>x.id===classId);if(!cl?.spellcastingAbility||!def)return 0;const m=Math.max(0,derivedAbilityMod(c,cl.spellcastingAbility));if(def.spellcasting==='spellbook')return Math.max(1,m+cl.level);if(def.spellcasting==='prepared'){if(classId==='paladin'||classId==='ranger'||classId==='artificer')return Math.max(1,m+Math.floor(cl.level/2));return Math.max(1,m+cl.level)}return 0}
export function pactMagicSlots(c:Character,classId='warlock'){const cl=c.classes.find(x=>x.id===classId);if(!cl||classId!=='warlock')return null;const [,max]=PACT_SLOTS[Math.max(1,Math.min(20,cl.level))-1];const level=PACT_SLOT_LEVEL[Math.max(1,Math.min(20,cl.level))];return {max,level}}
