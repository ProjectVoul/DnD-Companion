import {useMemo,useState} from 'react';
import {CLASSES,SPECIES,SUBCLASSES} from '../domain/catalog';
import {ABILITIES,CLASS_SKILL_COUNT,CLASS_SKILL_OPTIONS,createBlankCharacter,setClass,assignSubclass} from '../domain/character-builder';
import {mod} from '../domain/rules';
import type {Ability,Character,Skill} from '../domain/types';

export function Builder({onCreate}:{onCreate:(c:Character)=>void}){
 const [c,setC]=useState<Character>(()=>createBlankCharacter());
 const [step,setStep]=useState(1); const [scores,setScores]=useState<Record<Ability,number>>({str:15,dex:14,con:13,int:12,wis:10,cha:8});
 const cls=c.classes[0]?.id??''; const subclasses=useMemo(()=>SUBCLASSES[cls]??[],[cls]);
 const skillOptions=CLASS_SKILL_OPTIONS[cls]??[]; const selected=(Object.keys(c.skillStates) as Skill[]).filter(s=>c.skillStates[s].proficient);
 const chooseClass=(id:string)=>{const next=setClass({...c,abilityScores:scores},id);setC(next);setStep(2)};
 const chooseSubclass=(id:string)=>{setC(x=>assignSubclass(x,id));setStep(3)};
 const toggleScore=(a:Ability)=>setScores(x=>({...x,[a]:x[a]}));
 const toggleSkill=(s:Skill)=>{if(!skillOptions.includes(s))return;setC(x=>{const on=x.skillStates[s].proficient;if(on)return {...x,skillStates:{...x.skillStates,[s]:{proficient:false,expertise:false}}};if(selected.length>=CLASS_SKILL_COUNT[cls])return x;return {...x,skillStates:{...x.skillStates,[s]:{proficient:true,expertise:false}}};});};
 const finish=()=>onCreate({...c,abilityScores:scores,proficiencyBonus:2,maxHP:Math.max(1,c.maxHP+mod(scores.con)-mod(c.abilityScores.con)),currentHP:Math.max(1,c.maxHP+mod(scores.con)-mod(c.abilityScores.con))});
 return <section className="card builder"><div className="row"><div><h2>Create Character</h2><p className="muted">Data-driven 5e 2014 builder. Optional Tasha/Xanathar choices remain explicit.</p></div><b>Step {step} / 4</b></div>
 {step===1&&<><h3>Species</h3><div className="choice-grid">{SPECIES.map(s=><button className={c.species===s?'choice selected':'choice'} key={s} onClick={()=>setC(x=>({...x,species:s}))}>{s}</button>)}</div><h3>Class</h3><div className="choice-grid">{CLASSES.map(x=><button className={c.classes[0]?.id===x.id?'choice selected':'choice'} key={x.id} onClick={()=>chooseClass(x.id)}>{x.name}<small>d{x.hitDie} · {x.spellcasting}</small></button>)}</div></>}
 {step===2&&<><h3>Subclass</h3><div className="choice-grid">{subclasses.map(s=><button className={c.classes[0]?.subclassId===s.id?'choice selected':'choice'} key={s.id} onClick={()=>chooseSubclass(s.id)}>{s.name}<small>{s.source}</small></button>)}</div><button onClick={()=>setStep(3)}>Skip subclass for now</button></>}
 {step===3&&<><h3>Ability Scores</h3><p className="muted">Assign the standard array: 15, 14, 13, 12, 10, 8. The editor below is intentionally explicit; no hidden automatic reassignment.</p><div className="ability-builder">{ABILITIES.map(a=><label key={a}>{a.toUpperCase()}<select value={scores[a]} onChange={e=>setScores(x=>({...x,[a]:Number(e.target.value)}))}>{[15,14,13,12,10,8].map(v=><option key={v}>{v}</option>)}</select><small>modifier {mod(scores[a])>=0?'+':''}{mod(scores[a])}</small></label>)}</div><button onClick={()=>setStep(4)}>Continue</button></>}
 {step===4&&<><h3>Skill Proficiencies</h3><p className="muted">Choose {CLASS_SKILL_COUNT[cls]??0}. Expertise is a separate rule granted by class/features and is not silently added here.</p><div className="choice-grid">{skillOptions.map(s=><button className={c.skillStates[s].proficient?'choice selected':'choice'} key={s} onClick={()=>toggleSkill(s)}>{s}</button>)}</div><div className="row"><span>{selected.length} / {CLASS_SKILL_COUNT[cls]??0} selected</span><button disabled={selected.length!==CLASS_SKILL_COUNT[cls]} onClick={finish}>Create Character</button></div></>}
 </section>;
}
