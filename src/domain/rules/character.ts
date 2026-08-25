import type {Character} from '../types';
import {proficiencyBonus,totalLevel} from './derived';
import {derivedMaxHP} from './effects';
export function normalizeCharacter(c:Character):Character{const n=structuredClone(c);n.level=totalLevel(n);n.proficiencyBonus=proficiencyBonus(n.level);n.currentHP=Math.max(0,Math.min(n.currentHP,derivedMaxHP(n)));n.tempHP=Math.max(0,n.tempHP);n.hitDice.pools=n.hitDice.pools.map(p=>({...p,max:Math.max(0,Math.trunc(p.max)),current:Math.max(0,Math.min(Math.trunc(p.current),Math.trunc(p.max)))})).filter(p=>p.max>0);n.deathSaves.successes=Math.max(0,Math.min(3,n.deathSaves.successes));n.deathSaves.failures=Math.max(0,Math.min(3,n.deathSaves.failures));return n}
