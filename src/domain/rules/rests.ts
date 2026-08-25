import type {Character,Die,RestType} from '../types';
import {derivedAbilityMod,derivedMaxHP} from './effects';
function availablePoolIndex(c:Character,die?:Die){return c.hitDice.pools.findIndex(p=>p.current>0&&(!die||p.die===die))}
export function totalHitDice(c:Character){return c.hitDice.pools.reduce((n,p)=>n+p.max,0)}
export function currentHitDice(c:Character){return c.hitDice.pools.reduce((n,p)=>n+p.current,0)}
export function recoverHitDice(c:Character){
 const next=structuredClone(c);let remaining=Math.max(1,Math.floor(totalHitDice(next)/2))-Math.min(currentHitDice(next),Math.max(1,Math.floor(totalHitDice(next)/2)));
 if(remaining<=0)return next;
 for(const pool of next.hitDice.pools){if(remaining<=0)break;const gain=Math.min(remaining,pool.max-pool.current);pool.current+=gain;remaining-=gain;}
 return next;
}
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
 const recovered=recoverHitDice(next);next.hitDice=recovered.hitDice;
 if(next.sharedSpellSlots)next.sharedSpellSlots=Object.fromEntries(Object.entries(next.sharedSpellSlots).map(([level,slot])=>[level,{...slot,used:0}]));
 Object.values(next.spellcasting).forEach(s=>{Object.values(s.slots).forEach(x=>{x.used=0});if(s.pactSlots)s.pactSlots.used=0});
 next.resources.forEach(r=>{if(r.recharge==='long')r.current=r.max});
 next.items.forEach(i=>{if(i.charges?.recharge==='long')i.charges.current=i.charges.max});
 return next;
}
export function spendHitDie(c:Character,die?:Die):Character{
 const maxHP=derivedMaxHP(c);if(currentHitDice(c)<=0||c.currentHP>=maxHP)return c;
 const index=availablePoolIndex(c,die);if(index<0)return c;
 const pool=c.hitDice.pools[index];const roll=1+Math.floor(Math.random()*pool.die);const healing=Math.max(0,roll+derivedAbilityMod(c,'con'));const next=structuredClone(c);
 next.hitDice.pools[index].current-=1;next.currentHP=Math.min(maxHP,next.currentHP+healing);if(next.currentHP>0)next.deathSaves={successes:0,failures:0};return next;
}
