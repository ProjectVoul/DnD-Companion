import type {Ability,Character,Effect,Skill} from '../types';
import {featEffects} from './feats';
const mod=(score:number)=>Math.floor((score-10)/2);

function derivedFeatureEffects(c:Character):Effect[]{
 const effects:Effect[]=[];
 // PHB 2014: Hill Dwarf's Dwarven Toughness increases max HP by 1, and by 1 again whenever the character gains a level.
 if(c.features.some(f=>f.id==='dwarven-toughness')){
  effects.push({id:'species:dwarven-toughness',name:'Dwarven Toughness',target:'maxHP',value:c.level,passive:true,sourceId:'species:dwarven-toughness'});
 }
 // PHB 2014: Paladin Aura of Protection applies the paladin's Charisma modifier (minimum +1) to saving throws.
 // The sheet models the self-benefit as a derived saving-throw modifier; range/ally targeting remains a combat-context concern.
 const paladin=c.classes.find(cl=>cl.id==='paladin');
 if(paladin&&paladin.level>=6){
  effects.push({id:'paladin:aura-of-protection',name:'Aura of Protection',target:'savingThrows',value:Math.max(1,mod(c.abilityScores.cha)),passive:true,sourceId:'class:paladin:aura-of-protection',description:'Self benefit while conscious and within the aura.'});
 }
 return effects;
}

export function allEffects(c:Character):Effect[]{
 const featureEffects=c.features.flatMap(f=>f.effects??[]).map(e=>({...e}));
 const itemEffects=c.items.filter(i=>i.equipped||i.attuned).flatMap(i=>i.mechanicalEffects??[]).map(e=>({...e}));
 const featMechanicalEffects=featEffects(c);
 const hasArmor=c.items.some(i=>i.equipped&&i.kind==='armor');
 const fighting=hasArmor&&c.fightingStyles?.includes('defense')?[{id:'fighting-style-defense',name:'Defense Fighting Style',target:'ac' as const,value:1,passive:true,sourceId:'fighting-style-defense',description:'While wearing armor, gain +1 AC.'}]:[];
 return [...featureEffects,...derivedFeatureEffects(c),...itemEffects,...featMechanicalEffects,...fighting];
}
function matching(c:Character,target:Effect['target'],ability?:Ability,skill?:Skill){return allEffects(c).filter(e=>e.target===target&&(!e.ability||e.ability===ability)&&(!e.skill||e.skill===skill))}
export function effectBonus(c:Character,target:Effect['target'],ability?:Ability,skill?:Skill){return matching(c,target,ability,skill).reduce((n,e)=>n+e.value,0)}
export function derivedAbilityScore(c:Character,a:Ability){const effects=matching(c,'ability',a);const nonFeat=effects.filter(e=>!e.sourceId?.startsWith('feat:')).reduce((n,e)=>n+e.value,0);const feat=effects.filter(e=>e.sourceId?.startsWith('feat:')).reduce((n,e)=>n+e.value,0);return c.abilityScores[a]+nonFeat+Math.min(feat,Math.max(0,20-(c.abilityScores[a]+nonFeat)))}
export function derivedAbilityMod(c:Character,a:Ability){return mod(derivedAbilityScore(c,a))}
export function derivedMaxHP(c:Character){return Math.max(0,c.maxHP+effectBonus(c,'maxHP'))}
export function totalWeight(c:Character){return c.items.reduce((n,i)=>n+(i.weight??0)*Math.max(0,i.quantity),0)}
