import type {Character,Resource,RestType} from '../types';

export interface FeatureResourceRule{max:(c:Character)=>number;recharge:'short'|'long'|'manual';unlimited?:boolean;name:string;description?:string;}

const FEATURE_RESOURCE_RULES:Record<string,FeatureResourceRule>={
  'breath-weapon':{
    name:'Breath Weapon',
    max:()=>1,
    recharge:'short',
    description:'Dragonborn Breath Weapon. One use, recovered after a short or long rest.'
  }
};

function featureResources(c:Character):Resource[]{
  const seen=new Set<string>();
  const out:Resource[]=[];
  for(const feature of c.features){
    const rule=FEATURE_RESOURCE_RULES[feature.id];
    if(!rule||seen.has(feature.id))continue;
    seen.add(feature.id);
    const max=Math.max(0,Math.trunc(rule.max(c)));
    out.push({id:`feature:${feature.id}`,name:rule.name,current:max,max,recharge:rule.recharge,unlimited:rule.unlimited,sourceId:`species:${feature.id}`,description:rule.description??feature.description});
  }
  if(c.species.toLowerCase()==='dragonborn'&&!seen.has('breath-weapon')){
    const feature=c.features.find(f=>f.id==='breath-weapon');
    if(feature){
      const rule=FEATURE_RESOURCE_RULES['breath-weapon'];
      out.push({id:'feature:breath-weapon',name:rule.name,current:1,max:1,recharge:rule.recharge,sourceId:'species:breath-weapon',description:rule.description??feature.description});
    }
  }
  return out;
}

export function classResources(c:Character):Resource[]{
 const out:Resource[]=[];let channelDivinity=0;
 const push=(id:string,name:string,max:number,recharge:'short'|'long',unlimited=false,sourceId?:string)=>out.push({id:`${sourceId??'class'}:${id}`,name,current:max,max,recharge,unlimited,sourceId});
 for(const cl of c.classes){
  switch(cl.id){
   case'barbarian':if(cl.level>=1)push('rage','Rage',cl.level>=20?0:cl.level>=17?6:cl.level>=12?5:cl.level>=6?4:cl.level>=3?3:2,'long',cl.level>=20,cl.id);break;
   case'bard':if(cl.level>=1)push('bardic-inspiration','Bardic Inspiration',Math.max(1,Math.floor((c.abilityScores.cha-10)/2)),cl.level>=5?'short':'long',false,cl.id);break;
   case'cleric':if(cl.level>=2)channelDivinity=Math.max(channelDivinity,cl.level>=18?3:cl.level>=6?2:1);break;
   case'druid':if(cl.level>=2)push('wild-shape','Wild Shape',cl.level>=20?0:2,'short',cl.level>=20,cl.id);break;
   case'monk':if(cl.level>=2)push('ki','Ki',cl.level,'short',false,cl.id);break;
   case'paladin':if(cl.level>=1)push('lay-on-hands','Lay on Hands',cl.level*5,'long',false,cl.id);if(cl.level>=3)channelDivinity=Math.max(channelDivinity,1);break;
   case'sorcerer':if(cl.level>=2)push('sorcery-points','Sorcery Points',cl.level,'long',false,cl.id);break;
   case'fighter':if(cl.level>=1)push('second-wind','Second Wind',cl.level>=17?2:1,'short',false,cl.id);if(cl.level>=2)push('action-surge','Action Surge',cl.level>=17?2:1,'short',false,cl.id);break;
   default:break;
  }
 }
 if(channelDivinity)out.push({id:'shared:channel-divinity',name:'Channel Divinity',current:channelDivinity,max:channelDivinity,recharge:'short',sourceId:'shared:channel-divinity'});
 return [...out,...featureResources(c)];
}
