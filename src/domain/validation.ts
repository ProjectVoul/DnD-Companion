import type {Ability,Character,ContentSourceId,Skill} from './types';
import {SKILLS,proficiencyBonus,totalLevel} from './rules';
import {derivedMaxHP} from './rules/effects';
import {CONTENT_SOURCES} from './content/sources';
import {featDefinition} from './rules/feats';
export interface ValidationIssue{path:string;message:string;severity:'error'|'warning';}
const abilities:Ability[]=['str','dex','con','int','wis','cha'];
const validSources=new Set<ContentSourceId>(CONTENT_SOURCES.map(source=>source.id));
export function validateCharacter(c:Character):ValidationIssue[]{
 const issues:ValidationIssue[]=[];
 if(!c.id)issues.push({path:'id',message:'Character id is required',severity:'error'});
 if(c.level<1||c.level>20)issues.push({path:'level',message:'Character level must be 1-20',severity:'error'});
 if(c.classes.length){const summed=totalLevel(c);if(summed!==c.level)issues.push({path:'level',message:`Character level must equal class levels (${summed})`,severity:'error'});}
 if(c.classes.some(cl=>cl.level<1||cl.level>20))issues.push({path:'classes',message:'Each class level must be 1-20',severity:'error'});
 if(c.proficiencyBonus!==proficiencyBonus(c.level))issues.push({path:'proficiencyBonus',message:'Proficiency bonus must match character level',severity:'error'});
 for(const a of abilities)if(!Number.isFinite(c.abilityScores[a]))issues.push({path:`abilityScores.${a}`,message:'Ability score must be numeric',severity:'error'});
 const maxHP=derivedMaxHP(c);if(c.maxHP<0)issues.push({path:'maxHP',message:'Maximum HP cannot be negative',severity:'error'});if(c.currentHP<0||c.currentHP>maxHP)issues.push({path:'currentHP',message:'Current HP must stay between 0 and derived maximum HP',severity:'error'});
 if(c.tempHP<0)issues.push({path:'tempHP',message:'Temporary HP cannot be negative',severity:'error'});
 if(c.deathSaves.successes<0||c.deathSaves.successes>3||c.deathSaves.failures<0||c.deathSaves.failures>3)issues.push({path:'deathSaves',message:'Death save counters must be 0-3',severity:'error'});
 if(!Array.isArray(c.hitDice.pools)||c.hitDice.pools.some(p=>!Number.isInteger(p.max)||p.max<0||!Number.isInteger(p.current)||p.current<0||p.current>p.max))issues.push({path:'hitDice.pools',message:'Hit dice pools must have valid current and maximum counts',severity:'error'});
 for(const s of Object.keys(SKILLS) as Skill[]){const state=c.skillStates[s];if(!state)issues.push({path:`skillStates.${s}`,message:'Every PHB skill needs a state',severity:'error'});else if(state.expertise&&!state.proficient)issues.push({path:`skillStates.${s}`,message:'Expertise requires proficiency',severity:'error'});}
 for(const i of c.items){if(!Number.isInteger(i.quantity)||i.quantity<0)issues.push({path:`items.${i.id}.quantity`,message:'Item quantity must be a non-negative integer',severity:'error'});if(i.kind==='weapon'&&!i.weapon)issues.push({path:`items.${i.id}.weapon`,message:'Weapon items require weapon data',severity:'error'});if(i.kind==='armor'&&!i.armor)issues.push({path:`items.${i.id}.armor`,message:'Armor items require armor data',severity:'error'});if(i.kind==='shield'&&!i.shield)issues.push({path:`items.${i.id}.shield`,message:'Shield items require shield data',severity:'error'});if(i.charges&&(i.charges.current<0||i.charges.current>i.charges.max||i.charges.max<0))issues.push({path:`items.${i.id}.charges`,message:'Item charges must stay within 0 and maximum',severity:'error'});}
 for(const [classId,s] of Object.entries(c.spellcasting)){for(const [level,slot] of Object.entries(s.slots))if(slot.max<0||slot.used<0||slot.used>slot.max)issues.push({path:`spellcasting.${classId}.slots.${level}`,message:'Used spell slots must be within maximum',severity:'error'});if(s.pactSlots&&(s.pactSlots.max<0||s.pactSlots.used<0||s.pactSlots.used>s.pactSlots.max))issues.push({path:`spellcasting.${classId}.pactSlots`,message:'Pact slots must be within maximum',severity:'error'});}
 if(c.sharedSpellSlots)for(const [level,slot] of Object.entries(c.sharedSpellSlots))if(slot.max<0||slot.used<0||slot.used>slot.max)issues.push({path:`sharedSpellSlots.${level}`,message:'Shared spell slots must be within maximum',severity:'error'});
 for(const source of c.contentSources??[])if(!validSources.has(source))issues.push({path:'contentSources',message:`Unknown content source: ${source}`,severity:'error'});
 if(!(c.contentSources??[]).includes('tasha2020')&&c.classes.some(cl=>cl.id==='artificer'))issues.push({path:'contentSources',message:'Artificer requires Tasha content to be enabled',severity:'error'});
 for(const name of c.feats??[])if(!featDefinition(name))issues.push({path:'feats',message:`Unknown feat: ${name}`,severity:'warning'});
 return issues;
}
