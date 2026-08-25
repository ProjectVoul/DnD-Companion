import type {Ability,Character,FeatChoice} from '../types';
import {CLASSES} from '../catalog';
import {CLASS_PROGRESSION} from '../content/class-progression';
import {multiclassSpellSlots} from './spell-slots';
import {proficiencyBonus} from './derived';
import {derivedAbilityMod,derivedMaxHP} from './effects';
import {featCanBeSelected,featIdFromName} from './feats';
export type HPMode='average'|'roll';
export function hasASI(classId:string,level:number){return (CLASS_PROGRESSION[classId]??[]).some(f=>f.level===level&&f.id.includes(':asi-'));}
export function levelUp(c:Character,classId:string,mode:HPMode='average',abilityIncrease?:{ability?:Ability;amount?:number;secondAbility?:Ability},featSelection?:{id:string;choice?:FeatChoice}):Character{
 const current=c.classes.find(x=>x.id===classId);if(!current||current.level>=20||c.level>=20)return c;
 const next=structuredClone(c);const target=next.classes.find(x=>x.id===classId);const cls=CLASSES.find(x=>x.id===classId);if(!target||!cls)return c;
 if(featSelection&&!featCanBeSelected(next,featSelection.id,featSelection.choice))return c;
 const oldMaxHP=derivedMaxHP(c);const oldConMod=derivedAbilityMod(c,'con');
 target.level+=1;next.level=Math.min(20,next.level+1);next.proficiencyBonus=proficiencyBonus(next.level);
 if(abilityIncrease?.ability){next.abilityScores[abilityIncrease.ability]=Math.min(20,next.abilityScores[abilityIncrease.ability]+(abilityIncrease.amount??2));if(abilityIncrease.secondAbility)next.abilityScores[abilityIncrease.secondAbility]=Math.min(20,next.abilityScores[abilityIncrease.secondAbility]+1)}
 if(featSelection){const featId=featIdFromName(featSelection.id)??featSelection.id;next.feats=[...(next.feats??[]),featId];if(featSelection.choice)next.featChoices={...(next.featChoices??{}),[featId]:featSelection.choice};}
 const con=derivedAbilityMod(next,'con');const roll=mode==='average'?Math.floor(cls.hitDie/2)+1:1+Math.floor(Math.random()*cls.hitDie);const gain=Math.max(1,roll+con);const conRetroactive=Math.max(0,con-oldConMod)*next.level;next.maxHP+=gain+conRetroactive;const newMaxHP=derivedMaxHP(next);next.currentHP=Math.max(0,Math.min(newMaxHP,next.currentHP+(newMaxHP-oldMaxHP)));next.hitDice.max+=1;next.hitDice.current+=1;
 if(cls.spellcasting!=='none'){const slots=multiclassSpellSlots(next);next.sharedSpellSlots=slots;const states={...next.spellcasting,[classId]:{...(next.spellcasting[classId]??{known:[],prepared:[],alwaysPrepared:[],spellbook:[],slots:{}}),slots}};next.spellcasting=Object.fromEntries(Object.entries(states).map(([id,s])=>[id,{...s,slots:{...s.slots,...slots}}]));}
 const gained=(CLASS_PROGRESSION[classId]??[]).filter(f=>f.level===target.level);const existing=new Set(next.features.map(f=>f.id));gained.forEach(f=>{if(!existing.has(f.id))next.features.push(f)});return next;
}
