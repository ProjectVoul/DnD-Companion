import type {Character,Spell,SpellState} from '../types';
export function emptySpellState():SpellState{return {known:[],prepared:[],alwaysPrepared:[],spellbook:[],slots:{}}}
export function spellcastingClass(c:Character,classId:string){return c.classes.find(x=>x.id===classId)}
export function eligibleClassSpells(spells:Spell[],classId:string,enabledSources:string[]){return spells.filter(s=>s.classes.includes(classId)&&enabledSources.includes(s.source??'phb2014'))}
export function availablePrepared(state:SpellState){return [...new Set([...state.alwaysPrepared,...state.prepared])]} 
export function canPrepare(state:SpellState,spellId:string,preparedLimit:number){if(state.alwaysPrepared.includes(spellId))return true;if(state.prepared.includes(spellId))return true;return state.prepared.length<preparedLimit}
export function setPrepared(state:SpellState,spellId:string,prepared:boolean,limit:number):SpellState{const always=state.alwaysPrepared.includes(spellId);const next=new Set(state.prepared);if(always)return state;if(prepared&&next.size<limit)next.add(spellId);if(!prepared)next.delete(spellId);return {...state,prepared:[...next]}}
