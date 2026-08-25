import type {Character} from '../types';
import {proficiencyBonus,totalLevel} from './derived';
import {derivedMaxHP} from './effects';
export function normalizeCharacter(c:Character):Character{const n=structuredClone(c);n.level=totalLevel(n);n.proficiencyBonus=proficiencyBonus(n.level);n.currentHP=Math.max(0,Math.min(n.currentHP,derivedMaxHP(n)));n.tempHP=Math.max(0,n.tempHP);n.hitDice.current=Math.max(0,Math.min(n.hitDice.current,n.hitDice.max));n.deathSaves.successes=Math.max(0,Math.min(3,n.deathSaves.successes));n.deathSaves.failures=Math.max(0,Math.min(3,n.deathSaves.failures));return n}
