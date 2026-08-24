import type {Character} from '../domain/types';
const KEY='dnd-companion:characters:v1';
export function loadCharacter(fallback:Character):Character{try{const raw=localStorage.getItem(KEY);if(!raw)return structuredClone(fallback);return JSON.parse(raw) as Character}catch{return structuredClone(fallback)}}
export function saveCharacter(character:Character){localStorage.setItem(KEY,JSON.stringify(character))}
export function clearCharacter(){localStorage.removeItem(KEY)}
