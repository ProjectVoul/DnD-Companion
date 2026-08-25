import {FEATS} from '../content/feats';
import type {Ability,Character,Effect,FeatChoice,Skill} from '../types';

export function featIdFromName(name:string){return FEATS.find(f=>f.name===name)?.id;}
export function featDefinition(idOrName:string){return FEATS.find(f=>f.id===idOrName||f.name===idOrName);}

function hasSpellcasting(c:Character){return c.classes.some(cl=>cl.level>0&&cl.spellcastingAbility!==undefined);}
function hasArmorProficiency(c:Character,category:'light'|'medium'|'heavy'){return (c.armorProficiencies??[]).some(x=>x.toLowerCase().includes(category));}
function hasMartialWeaponProficiency(c:Character){const prof=(c.weaponProficiencies??[]).map(x=>x.toLowerCase());return prof.some(x=>x.includes('martial'))||c.classes.some(cl=>['barbarian','fighter','paladin','ranger','rogue'].includes(cl.id));}
function hasSpecies(c:Character,...names:string[]){const value=`${c.species} ${c.subspecies??''}`.toLowerCase();return names.some(n=>value.includes(n.toLowerCase()));}

export function featPrerequisiteMet(c:Character,idOrName:string){
 const id=featIdFromName(idOrName)??idOrName;
 const score=(a:Ability)=>c.abilityScores[a]>=13;
 switch(id){
  case 'defensive-duelist':return score('dex');
  case 'durable':return score('con');
  case 'elemental-adept':case 'spell-sniper':case 'war-caster':return hasSpellcasting(c);
  case 'grappler':case 'tavern-brawler':return score('str')||score('dex');
  case 'heavily-armored':return hasArmorProficiency(c,'medium');
  case 'heavy-armor-master':return hasArmorProficiency(c,'heavy');
  case 'inspiring-leader':return score('cha');
  case 'linguist':return score('int');
  case 'observant':return score('int')||score('wis');
  case 'ritual-caster':return score('int')||score('wis');
  case 'skulker':return score('dex');
  case 'fighting-initiate':return hasMartialWeaponProficiency(c);
  case 'metamagic-adept':return hasSpellcasting(c)||c.classes.some(cl=>cl.id==='warlock');
  case 'eldritch-adept':return hasSpellcasting(c)||c.classes.some(cl=>cl.id==='warlock');
  case 'elven-accuracy':return hasSpecies(c,'elf','half-elf');
  case 'dwarven-fortitude':return hasSpecies(c,'dwarf');
  case 'bountiful-luck':return hasSpecies(c,'halfling');
  case 'dragon-fear':case 'dragon-hide':return hasSpecies(c,'dragonborn','dragonide');
  case 'drow-high-magic':return hasSpecies(c,'drow');
  case 'fade-away':return hasSpecies(c,'gnome');
  case 'fey-teleportation':return hasSpecies(c,'high elf','elf (alto)');
  case 'flames-of-phlegethos':case 'infernal-constitution':return hasSpecies(c,'tiefling');
  case 'orcish-fury':return hasSpecies(c,'half-orc','mezzorco');
  case 'wood-elf-magic':return hasSpecies(c,'wood elf','elf (dei boschi)');
  case 'prodigy':return hasSpecies(c,'half-elf','half-orc','human','mezzelfo','mezzorco','umano');
  default:return true;
 }
}

export function featAbilityOptions(idOrName:string):Ability[]{
 const id=featIdFromName(idOrName)??idOrName;
 switch(id){
  case 'actor':case 'inspiring-leader':return ['cha'];
  case 'athlete':case 'defensive-duelist':case 'lightly-armored':case 'medium-armor-master':case 'heavily-armored':case 'heavy-armor-master':case 'weapon-master':return ['str','dex'];
  case 'durable':case 'dwarven-fortitude':return ['con'];
  case 'elemental-adept':case 'keen-mind':case 'linguist':return ['int'];
  case 'observant':case 'resilient':case 'ritual-caster':return ['int','wis'];
  case 'tavern-brawler':return ['str','dex'];
  case 'elven-accuracy':return ['dex','int','wis','cha'];
  case 'dragon-hide':case 'dragon-fear':return ['str','con','cha'];
  case 'fade-away':return ['dex','int'];
  case 'fey-teleportation':return ['int'];
  case 'flames-of-phlegethos':return ['int','cha'];
  case 'infernal-constitution':return ['con'];
  case 'orcish-fury':return ['str','con'];
  case 'skulker':return ['dex'];
  case 'fey-touched':case 'shadow-touched':case 'telekinetic':case 'telepathic':return ['int','wis','cha'];
  case 'chef':return ['con','wis'];
  case 'crusher':return ['str','con'];
  case 'piercer':return ['str','dex'];
  case 'poisoner':return ['dex','int'];
  case 'slasher':return ['str','dex'];
  case 'skill-expert':return ['str','dex','con','int','wis','cha'];
  default:return [];
 }
}

export function featSkillCount(idOrName:string){const id=featIdFromName(idOrName)??idOrName;switch(id){case 'skilled':return 3;case 'skill-expert':case 'prodigy':return 1;default:return 0;}}
export function featChoice(c:Character,idOrName:string):FeatChoice|undefined{const id=featIdFromName(idOrName)??idOrName;return c.featChoices?.[id];}

function abilityEffect(c:Character,id:string,options:Ability[]):Effect|undefined{const choice=featChoice(c,id)?.ability;if(!choice||!options.includes(choice))return undefined;return {id:`feat-${id}-${choice}`,name:featDefinition(id)?.name??id,target:'ability',value:1,ability:choice,passive:true,sourceId:`feat:${id}`};}
function skillEffects(c:Character,id:string):Effect[]{const choices=featChoice(c,id)?.skills??(featChoice(c,id)?.skill?[featChoice(c,id)!.skill!]:[]);if(!choices.length)return [];const count=featSkillCount(id);const selected=choices.slice(0,count);const effects:Effect[]=[];selected.forEach(skill=>{effects.push({id:`feat-${id}-skill-${skill}`,name:featDefinition(id)?.name??id,target:'skillProficiency',value:1,skill,passive:true,sourceId:`feat:${id}`});});if(id==='skill-expert'||id==='prodigy'){const expertise=selected[0];if(expertise)effects.push({id:`feat-${id}-expertise-${expertise}`,name:featDefinition(id)?.name??id,target:'skillExpertise',value:1,skill:expertise,passive:true,sourceId:`feat:${id}`});}return effects;}

export function featEffects(c:Character):Effect[]{
 const effects:Effect[]=[];
 for(const name of c.feats??[]){
  const id=featIdFromName(name)??name;const add=abilityEffect(c,id,featAbilityOptions(id));if(add)effects.push(add);effects.push(...skillEffects(c,id));
  switch(id){
   case 'alert':effects.push({id:'feat-alert-initiative',name:'Alert',target:'initiative',value:5,passive:true,sourceId:'feat:alert'});break;
   case 'mobile':effects.push({id:'feat-mobile-speed',name:'Mobile',target:'speed',value:3,passive:true,sourceId:'feat:mobile'});break;
   case 'observant':effects.push({id:'feat-observant-perception',name:'Observant',target:'passivePerception',value:5,passive:true,sourceId:'feat:observant'},{id:'feat-observant-investigation',name:'Observant',target:'passiveInvestigation',value:5,passive:true,sourceId:'feat:observant'});break;
   case 'tough':effects.push({id:'feat-tough-hp',name:'Tough',target:'maxHP',value:2*c.level,passive:true,sourceId:'feat:tough'});break;
   case 'resilient':{const a=featChoice(c,id)?.ability;if(a)effects.push({id:`feat-resilient-save-${a}`,name:'Resilient',target:'savingThrows',value:0,ability:a,passive:true,sourceId:'feat:resilient',description:'Adds saving throw proficiency.'});break;}
  }
 }
 return effects;
}
export function featBonus(c:Character,target:Effect['target'],ability?:Ability,skill?:Skill){return featEffects(c).filter(e=>e.target===target&&(!e.ability||e.ability===ability)&&(!e.skill||e.skill===skill)).reduce((n,e)=>n+e.value,0)}
export function featHasSaveProficiency(c:Character,a:Ability){return featEffects(c).some(e=>e.target==='savingThrows'&&e.sourceId==='feat:resilient'&&e.ability===a)}
export function featSkillProficiency(c:Character,skill:Skill){return featEffects(c).some(e=>e.target==='skillProficiency'&&e.skill===skill)}
export function featSkillExpertise(c:Character,skill:Skill){return featEffects(c).some(e=>e.target==='skillExpertise'&&e.skill===skill)}
export function featPassivePerceptionBonus(c:Character){return featBonus(c,'passivePerception')}
export function featPassiveInvestigationBonus(c:Character){return featBonus(c,'passiveInvestigation')}
export function featMaxHPBonus(c:Character){return featBonus(c,'maxHP')}
