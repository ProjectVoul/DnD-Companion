import type {Character,RestType} from '../types';
import {abilityMod} from './derived';

/** Apply only the universal 2014 benefits of a rest. Class/subclass resources
 * are refreshed from their explicit recharge metadata rather than guessed here. */
export function applyRest(c:Character,type:RestType):Character{
  const next=structuredClone(c);
  if(type==='short'){
    next.resources.forEach(r=>{if(r.recharge==='short')r.current=r.max});
    return next;
  }
  if(next.currentHP<=0)return next;
  next.currentHP=next.maxHP;
  next.tempHP=0;
  next.hitDice.current=Math.min(next.hitDice.max,next.hitDice.current+Math.max(1,Math.floor(next.hitDice.max/2)));
  Object.values(next.spellcasting).forEach(s=>{
    Object.values(s.slots).forEach(x=>x.used=0);
    if(s.pactSlots)s.pactSlots.used=0;
  });
  next.resources.forEach(r=>{if(r.recharge==='long')r.current=r.max});
  return next;
}

/** Spend one Hit Die during a short rest. The die is rolled automatically and
 * Constitution is added, matching the 2014 PHB rule. */
export function spendHitDie(c:Character):Character{
  if(c.hitDice.current<=0||c.currentHP>=c.maxHP)return c;
  const roll=1+Math.floor(Math.random()*c.hitDice.die);
  const healing=Math.max(0,roll+abilityMod(c.abilityScores.con));
  const next=structuredClone(c);
  next.hitDice.current-=1;
  next.currentHP=Math.min(next.maxHP,next.currentHP+healing);
  if(next.currentHP>0)next.deathSaves={successes:0,failures:0};
  return next;
}
