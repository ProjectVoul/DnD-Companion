import type {Ability,Character,Effect,Skill} from '../types';
import {abilityMod} from './derived';

export function allEffects(c:Character):Effect[]{
 const featureEffects=c.features.flatMap(f=>f.effects??[]).map(e=>({...e,sourceId:e.sourceId??fId(f.id)}));
 const itemEffects=c.items.filter(i=>i.equipped&&(!i.attuned||i.attuned)).flatMap(i=>i.mechanicalEffects??[]).map(e=>({...e,sourceId:e.sourceId??i.id}));
 const fighting=c.fightingStyles?.includes('defense')?[{id:'fighting-style-defense',name:'Defense Fighting Style',target:'ac' as const,value:1,passive:true,sourceId:'fighting-style-defense',description:'While wearing armor, gain +1 AC.'}]:[];
 return [...featureEffects,...itemEffects,...fighting];
}
function fId(id:string){return id.split(':')[0]??id}
function matching(c:Character,target:Effect['target'],ability?:Ability,skill?:Skill){return allEffects(c).filter(e=>e.target===target&&(!e.ability||e.ability===ability)&&(!e.skill||e.skill===skill))}
export function effectBonus(c:Character,target:Effect['target'],ability?:Ability,skill?:Skill){return matching(c,target,ability,skill).reduce((n,e)=>n+e.value,0)}
export function derivedAbilityScore(c:Character,a:Ability){return c.abilityScores[a]+effectBonus(c,'ability',a)}
export function derivedAbilityMod(c:Character,a:Ability){return abilityMod(derivedAbilityScore(c,a))}
export function totalWeight(c:Character){return c.items.reduce((n,i)=>n+(i.weight??0)*Math.max(0,i.quantity),0)}
