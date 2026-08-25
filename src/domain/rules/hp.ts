import type {Character} from '../types';
import {derivedMaxHP} from './effects';
export function setHP(c:Character,value:number):Character{const max=derivedMaxHP(c);const n=Math.max(0,Math.min(Math.trunc(value),max));const revived=c.currentHP===0&&n>0;return {...c,currentHP:n,deathSaves:revived?{successes:0,failures:0}:c.deathSaves}}
export function hpPercent(c:Character){const max=derivedMaxHP(c);return max>0?Math.max(0,Math.min(100,c.currentHP/max*100)):0}
export function setTempHP(c:Character,value:number):Character{return {...c,tempHP:Math.max(0,Math.trunc(value))}}
export function addDeathSave(c:Character,success:boolean):Character{const d={...c.deathSaves};if(success)d.successes=Math.min(3,d.successes+1);else d.failures=Math.min(3,d.failures+1);return {...c,deathSaves:d}}
