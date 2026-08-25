import type {Character,RestType} from '../types';
import {derivedAbilityMod,derivedMaxHP} from './effects';
export function applyRest(c:Character,type:RestType):Character{
 const next=structuredClone(c);const maxHP=derivedMaxHP(next);
 if(type==='short'){
  next.resources.forEach(r=>{if(r.recharge==='short')r.current=r.max});
  next.items.forEach(i=>{if(i.charges?.recharge==='short')i.charges.current=i.charges.max});
  Object.values(next.spellcasting).forEach(s=>{if(s.pactSlots)s.pactSlots.used=0});
  return next;
 }
 // 2014 PHB: a character must have at least 1 hit point at the start of a long rest.
 if(next.currentHP<=0)return c;
 next.currentHP=maxHP;next.tempHP=0;next.deathSaves={successes:0,failures:0};
 next.hitDice.current=Math.min(next.hitDice.max,next.hitDice.current+Math.max(1,Math.floor(next.hitDice.max/2)));
 if(next.sharedSpellSlots)next.sharedSpellSlots=Object.fromEntries(Object.entries(next.sharedSpellSlots).map(([level,slot])=>[level,{...slot,used:0}]));
 Object.values(next.spellcasting).forEach(s=>{Object.values(s.slots).forEach(x=>{x.used=0});if(s.pactSlots)s.pactSlots.used=0});
 next.resources.forEach(r=>{if(r.recharge==='long')r.current=r.max});
 next.items.forEach(i=>{if(i.charges?.recharge==='long')i.charges.current=i.charges.max});
 return next;
}
export function spendHitDie(c:Character):Character{
 const maxHP=derivedMaxHP(c);if(c.hitDice.current<=0||c.currentHP>=maxHP)return c;
 const roll=1+Math.floor(Math.random()*c.hitDice.die);const healing=Math.max(0,roll+derivedAbilityMod(c,'con'));const next=structuredClone(c);
 next.hitDice.current-=1;next.currentHP=Math.min(maxHP,next.currentHP+healing);if(next.currentHP>0)next.deathSaves={successes:0,failures:0};return next;
}
