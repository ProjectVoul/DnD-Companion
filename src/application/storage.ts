import type {Character,HitDiePool} from '../domain/types';
import {CLASSES} from '../domain/catalog';
import {validateCharacter} from '../domain/validation';
const KEY='dnd-companion:characters:v3';
const PREVIOUS='dnd-companion:characters:v2';
const LEGACY='dnd-companion:characters:v1';
interface Envelope{version:3;character:Character;}
function safe(character:Character){return validateCharacter(character).some(x=>x.severity==='error')?null:character;}
function migrate(raw:unknown):Character|null{
 if(!raw||typeof raw!=='object')return null;
 const candidate=structuredClone(raw) as Record<string,any>;
 const character=(candidate.character&&typeof candidate.character==='object'?candidate.character:candidate) as Character;
 const old=character.hitDice as any;
 if(old&&Array.isArray(old.pools)){return character;}
 if(!old||typeof old.die!=='number'||typeof old.max!=='number'||typeof old.current!=='number')return null;
 const pools:HitDiePool[]=[];let remaining=Math.max(0,Math.min(Math.trunc(old.current),Math.trunc(old.max)));
 for(const cl of character.classes??[]){const def=CLASSES.find(x=>x.id===cl.id);if(!def)continue;const max=Math.max(0,Math.trunc(cl.level));const current=Math.min(max,remaining);pools.push({die:def.hitDie,max,current});remaining-=current;}
 if(!pools.length&&old.max>0)pools.push({die:old.die as HitDiePool['die'],max:Math.trunc(old.max),current:Math.min(Math.trunc(old.max),remaining)});
 character.hitDice={pools};
 return character;
}
export function loadCharacter(fallback:Character):Character{try{for(const key of [KEY,PREVIOUS,LEGACY]){const raw=localStorage.getItem(key);if(!raw)continue;const parsed=JSON.parse(raw) as Envelope|Character;const c=migrate(parsed);if(c&&safe(c))return c;}return structuredClone(fallback);}catch{return structuredClone(fallback)}}
export function saveCharacter(character:Character){if(safe(character))localStorage.setItem(KEY,JSON.stringify({version:3,character} satisfies Envelope));}
export function clearCharacter(){localStorage.removeItem(KEY);localStorage.removeItem(PREVIOUS);localStorage.removeItem(LEGACY)}
