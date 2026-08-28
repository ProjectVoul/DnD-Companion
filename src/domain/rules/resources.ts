import type {Character,Resource} from '../types';

export interface FeatureResourceRule{max:(c:Character)=>number;recharge:'short'|'long'|'manual';unlimited?:boolean;name:string;description?:string;}
const abilityMod=(score:number)=>Math.floor((score-10)/2);
const FEATURE_RESOURCE_RULES:Record<string,FeatureResourceRule>={
 'breath-weapon':{name:'Breath Weapon',max:()=>1,recharge:'short',description:'Dragonborn Breath Weapon. One use, recovered after a short or long rest.'},
 'relentless-endurance':{name:'Relentless Endurance',max:()=>1,recharge:'long',description:'When reduced to 0 hit points but not killed outright, drop to 1 hit point instead. One use per long rest.'}
};
function featureResources(c:Character):Resource[]{const out:Resource[]=[];for(const feature of c.features){const rule=FEATURE_RESOURCE_RULES[feature.id];if(!rule)continue;const max=Math.max(0,Math.trunc(rule.max(c)));out.push({id:`feature:${feature.id}`,name:rule.name,current:max,max,recharge:rule.recharge,unlimited:rule.unlimited,sourceId:`${feature.source}:${feature.id}`,description:rule.description??feature.description});}return out;}
export function classResources(c:Character):Resource[]{
 const out:Resource[]=[];
 const push=(id:string,name:string,max:number,recharge:'short'|'long',unlimited=false,sourceId?:string,description?:string)=>out.push({id:`${sourceId??'class'}:${id}`,name,current:max,max,recharge,unlimited,sourceId,description});
 for(const cl of c.classes){switch(cl.id){
 case'barbarian':if(cl.level>=1)push('rage','Rage',cl.level>=20?0:cl.level>=17?6:cl.level>=12?5:cl.level>=6?4:cl.level>=3?3:2,'long',cl.level>=20,cl.id,'Rages per long rest; unlimited at 20th level.');break;
 case'bard':if(cl.level>=1){const max=Math.max(1,abilityMod(c.abilityScores.cha));push('bardic-inspiration','Bardic Inspiration',max,cl.level>=5?'short':'long',false,cl.id,'Uses equal to Charisma modifier (minimum one); recovered on a long rest, or short rest from 5th level.');}break;
 case'cleric':if(cl.level>=2)push('channel-divinity','Channel Divinity',cl.level>=18?3:cl.level>=6?2:1,'short',false,cl.id,'Channel Divinity uses are recovered on a short or long rest. Domain Channel Divinity options use this class resource.');break;
 case'druid':if(cl.level>=2)push('wild-shape','Wild Shape',cl.level>=20?0:2,'short',cl.level>=20,cl.id,'Two uses per short or long rest; unlimited at 20th level.');break;
 case'monk':if(cl.level>=2)push('ki','Ki',cl.level,'short',false,cl.id,'Ki points equal to monk level; recovered on a short or long rest.');break;
 case'paladin':if(cl.level>=1)push('lay-on-hands','Lay on Hands',cl.level*5,'long',false,cl.id,'Healing pool equal to five times paladin level; replenished on a long rest.');if(cl.level>=3)push('channel-divinity','Channel Divinity',1,'short',false,cl.id,'Channel Divinity uses are recovered on a short or long rest. Sacred Oath Channel Divinity options use this class resource.');if(cl.level>=1)push('divine-sense','Divine Sense',Math.max(1,1+abilityMod(c.abilityScores.cha)),'long',false,cl.id,'Uses equal to 1 + Charisma modifier (minimum one); replenished on a long rest.');if(cl.level>=14)push('cleansing-touch','Cleansing Touch',Math.max(1,abilityMod(c.abilityScores.cha)),'long',false,cl.id,'Uses equal to your Charisma modifier (minimum one); replenished on a long rest.');break;
 case'ranger':break;
 case'sorcerer':if(cl.level>=2)push('sorcery-points','Sorcery Points',cl.level,'long',false,cl.id,'Sorcery points equal to sorcerer level; recovered on a long rest.');break;
 case'fighter':if(cl.level>=1)push('second-wind','Second Wind',cl.level>=17?2:1,'short',false,cl.id,'One use, increasing to two at 17th level.');if(cl.level>=2)push('action-surge','Action Surge',cl.level>=17?2:1,'short',false,cl.id,'One use, increasing to two at 17th level.');if(cl.level>=9)push('indomitable','Indomitable',cl.level>=17?3:cl.level>=13?2:1,'long',false,cl.id,'One use, increasing to two at 13th and three at 17th level.');break;
 case'artificer':if(cl.level>=7)push('flash-of-genius','Flash of Genius',Math.max(0,abilityMod(c.abilityScores.int)),'long',false,cl.id,'Uses equal to Intelligence modifier; replenished on a long rest.');break;
 case'wizard':if(cl.level>=1)push('arcane-recovery','Arcane Recovery',1,'long',false,cl.id,'Once per long rest.');break;
 case'warlock':if(cl.level>=20)push('eldritch-master','Eldritch Master',1,'long',false,cl.id,'Once per long rest.');break;
 default:break;}}
 return [...out,...featureResources(c)];
}
