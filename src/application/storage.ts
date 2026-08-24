import type {Character} from '../domain/types';
import {validateCharacter} from '../domain/validation';
const KEY='dnd-companion:characters:v2';
const LEGACY='dnd-companion:characters:v1';
interface Envelope{version:2;character:Character;}
function safe(character:Character){return validateCharacter(character).some(x=>x.severity==='error')?null:character;}
export function loadCharacter(fallback:Character):Character{try{const raw=localStorage.getItem(KEY);if(raw){const parsed=JSON.parse(raw) as Envelope;const c=parsed.version===2?parsed.character:null;return c&&safe(c)?c:structuredClone(fallback);}const legacy=localStorage.getItem(LEGACY);if(legacy){const c=JSON.parse(legacy) as Character;return safe(c)??structuredClone(fallback);}return structuredClone(fallback);}catch{return structuredClone(fallback)}}
export function saveCharacter(character:Character){if(safe(character))localStorage.setItem(KEY,JSON.stringify({version:2,character} satisfies Envelope));}
export function clearCharacter(){localStorage.removeItem(KEY);localStorage.removeItem(LEGACY)}
