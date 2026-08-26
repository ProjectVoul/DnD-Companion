import type {Character,Size} from '../domain/types';
import {BACKGROUNDS} from '../domain/content/backgrounds';

interface FightingStyleOption{ id:string;name:string;classes:string[];source:'phb2014'|'tasha2020';description:string; }
const sizes:Size[]=['Tiny','Small','Medium','Large','Huge','Gargantuan'];
const alignments=['Lawful Good','Neutral Good','Chaotic Good','Lawful Neutral','Neutral','Chaotic Neutral','Lawful Evil','Neutral Evil','Chaotic Evil'];
const fightingStyles:FightingStyleOption[]=[
 {id:'archery',name:'Archery',classes:['fighter','ranger'],source:'phb2014',description:'+2 to attack rolls you make with ranged weapons.'},
 {id:'defense',name:'Defense',classes:['fighter','paladin','ranger'],source:'phb2014',description:'While wearing armor, you gain a +1 bonus to AC.'},
 {id:'dueling',name:'Dueling',classes:['fighter','paladin','ranger'],source:'phb2014',description:'When wielding a melee weapon in one hand and no other weapons, you gain +2 to damage rolls with that weapon.'},
 {id:'great-weapon-fighting',name:'Great Weapon Fighting',classes:['fighter','paladin'],source:'phb2014',description:'When you roll a 1 or 2 on a damage die for a two-handed or versatile melee weapon, you can reroll it and must use the new roll.'},
 {id:'protection',name:'Protection',classes:['fighter','paladin'],source:'phb2014',description:'When a creature you can see attacks a target other than you within 5 feet, you can use your reaction to impose disadvantage on the attack roll while wielding a shield.'},
 {id:'two-weapon-fighting',name:'Two-Weapon Fighting',classes:['fighter','ranger'],source:'phb2014',description:'When engaging in two-weapon fighting, you can add your ability modifier to the damage of the second attack.'},
 {id:'blind-fighting',name:'Blind Fighting',classes:['fighter','paladin','ranger'],source:'tasha2020',description:'You have blindsight out to 10 feet. Within that range, you can effectively see anything not behind total cover, even while blinded or in darkness, and can perceive invisible creatures unless they successfully hide.'},
 {id:'interception',name:'Interception',classes:['fighter','paladin'],source:'tasha2020',description:'When a creature you can see hits a target other than you within 5 feet, use your reaction to reduce the damage by 1d10 + your proficiency bonus, to a minimum of 0. You must wield a shield or a simple or martial weapon.'},
 {id:'thrown-weapon-fighting',name:'Thrown Weapon Fighting',classes:['fighter','ranger'],source:'tasha2020',description:'You can draw a weapon with the thrown property as part of the attack. When you hit with a ranged attack using a thrown weapon, add +2 to the damage roll.'},
 {id:'unarmed-fighting',name:'Unarmed Fighting',classes:['fighter','paladin'],source:'tasha2020',description:'Your unarmed strikes deal 1d6 + Strength modifier bludgeoning damage, or 1d8 if you are not wielding weapons or a shield. At the start of your turn, you can deal 1d4 bludgeoning damage to a creature grappled by you.'},
 {id:'superior-technique',name:'Superior Technique',classes:['fighter'],source:'tasha2020',description:'Learn one Battle Master maneuver and gain one d6 superiority die; the die is recovered on a short or long rest.'},
 {id:'druidic-warrior',name:'Druidic Warrior',classes:['ranger'],source:'tasha2020',description:'Learn two cantrips of your choice from the druid spell list; they count as ranger spells and use Wisdom as the spellcasting ability.'}
];
const split=(value:string)=>value.split(',').map(x=>x.trim()).filter(Boolean);
const inspirationSlots=(value:Character['inspiration']):[boolean,boolean,boolean,boolean]=>value??[false,false,false,false];

export function DetailsPanel({c,update}:{c:Character;update:(fn:(x:Character)=>Character)=>void}){
 const background=BACKGROUNDS.find(b=>b.id===c.background);
 const patch=(p:Partial<Character>)=>update(x=>({...x,...p}));
 const setList=(key:'languages'|'toolProficiencies'|'armorProficiencies'|'weaponProficiencies',value:string)=>patch({[key]:split(value)} as Partial<Character>);
 const chooseBackground=(id:string)=>patch({background:id||undefined,backgroundData:(()=>{const b=BACKGROUNDS.find(x=>x.id===id);return b?{name:b.name,skillProficiencies:b.skillProficiencies,toolProficiencies:b.toolProficiencies,languages:b.languages,feature:b.feature}:undefined})()});
 const eligibleClasses=c.classes.filter(cl=>['fighter','paladin','ranger'].includes(cl.id)&&cl.level>=2);
 const fightingClass=eligibleClasses[0];
 const enabledTasha=(c.contentSources??[]).includes('tasha2020');
 const options=fightingStyles.filter(s=>s.classes.includes(fightingClass?.id??'')&&(s.source==='phb2014'||enabledTasha));
 const storedId=c.fightingStyles?.[0]?.toLowerCase()??'';
 const fightingStyle=options.find(s=>s.id===storedId)||fightingStyles.find(s=>s.id===storedId);
 const inspiration=inspirationSlots(c.inspiration);
 return <div className="grid">
  <section className="card">
   <h2>Character Details</h2>
   <div className="form-grid">
    <label>Name<input value={c.name} onChange={e=>patch({name:e.target.value})}/></label>
    <label>Alignment<select value={c.alignment??''} onChange={e=>patch({alignment:e.target.value||undefined})}><option value="">Optional</option>{alignments.map(a=><option key={a}>{a}</option>)}</select></label>
    <label>Background<select value={c.background??''} onChange={e=>chooseBackground(e.target.value)}><option value="">None</option>{BACKGROUNDS.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
    <label>Size<select value={c.size??'Medium'} onChange={e=>patch({size:e.target.value as Size})}>{sizes.map(s=><option key={s}>{s}</option>)}</select></label>
    <label>Speed<input type="number" min="0" value={c.speed??30} onChange={e=>patch({speed:Math.max(0,Number(e.target.value))})}/></label>
    <label>Darkvision (ft)<input type="number" min="0" value={c.darkvision??0} onChange={e=>patch({darkvision:Math.max(0,Number(e.target.value))})}/></label>
    <label>Experience<input type="number" min="0" value={c.experience??0} onChange={e=>patch({experience:Math.max(0,Number(e.target.value))})}/></label>
   </div>
   {background&&<p className="muted">{background.name}: {background.feature}. Background skills are managed by the character builder/skills panel.</p>}
   <label>Notes<textarea rows={7} value={c.notes??''} onChange={e=>patch({notes:e.target.value})} placeholder="Character notes, story, campaign details..."/></label>
  </section>

  <section className="card">
   <h2>Character State</h2>
   <div>
    <b>Inspiration</b>
    <div className="inspiration-slots">{inspiration.map((checked,index)=><button key={index} type="button" className={`inspiration-slot${checked?' active':''}`} aria-label={`Inspiration ${index+1}`} aria-pressed={checked} onClick={()=>patch({inspiration:(()=>{const slots=[...inspirationSlots(c.inspiration)] as [boolean,boolean,boolean,boolean];slots[index]=!slots[index];return slots;})()})}>{checked?'●':'○'}</button>)}</div>
    <small className="muted">Four independent sheet markers.</small>
   </div>
   {fightingClass&&<>
    <h3>Fighting Style</h3>
    <label>{fightingClass.name} · Level {fightingClass.level}
     <select value={fightingStyle?.id??''} onChange={e=>patch({fightingStyles:e.target.value?[e.target.value]:[]})}>
      <option value="">Choose a fighting style</option>
      {options.map(s=><option key={s.id} value={s.id}>{s.name}{s.source==='tasha2020'?' · Tasha':''}</option>)}
     </select>
    </label>
    {fightingStyle&&<p className="muted"><b>{fightingStyle.name}.</b> {fightingStyle.description}</p>}
    {!enabledTasha&&<p className="muted">Enable Tasha 2020 to add the supplemental Fighting Style options.</p>}
   </>}
   <h3>Conditions</h3>
   <label>Active conditions<input value={c.conditions.join(', ')} onChange={e=>patch({conditions:split(e.target.value)})} placeholder="Blinded, Poisoned"/></label>
   <h3>Defenses</h3>
   <label>Resistances<input value={c.resistances.join(', ')} onChange={e=>patch({resistances:split(e.target.value)})}/></label>
   <label>Immunities<input value={(c.immunities??[]).join(', ')} onChange={e=>patch({immunities:split(e.target.value)})}/></label>
   <label>Vulnerabilities<input value={(c.vulnerabilities??[]).join(', ')} onChange={e=>patch({vulnerabilities:split(e.target.value)})}/></label>
  </section>

  <section className="card">
   <h2>Proficiencies & Languages</h2>
   <label>Languages<input value={(c.languages??[]).join(', ')} onChange={e=>setList('languages',e.target.value)}/></label>
   <label>Tool proficiencies<input value={(c.toolProficiencies??[]).join(', ')} onChange={e=>setList('toolProficiencies',e.target.value)}/></label>
   <label>Armor proficiencies<input value={(c.armorProficiencies??[]).join(', ')} onChange={e=>setList('armorProficiencies',e.target.value)}/></label>
   <label>Weapon proficiencies<input value={(c.weaponProficiencies??[]).join(', ')} onChange={e=>setList('weaponProficiencies',e.target.value)}/></label>
  </section>

  <section className="card">
   <h2>Currency</h2>
   <div className="statgrid">
    {(['cp','sp','ep','gp','pp'] as const).map(k=><label key={k}>{k.toUpperCase()}<input type="number" min="0" value={c.currency?.[k]??0} onChange={e=>patch({currency:{cp:0,sp:0,ep:0,gp:0,pp:0,...c.currency,[k]:Math.max(0,Number(e.target.value))}})}/></label>)}
   </div>
  </section>
 </div>;
}
