import type {Character,Size} from '../domain/types';
import {BACKGROUNDS} from '../domain/content/backgrounds';

const sizes:Size[]=['Tiny','Small','Medium','Large','Huge','Gargantuan'];
const alignments=['Lawful Good','Neutral Good','Chaotic Good','Lawful Neutral','Neutral','Chaotic Neutral','Lawful Evil','Neutral Evil','Chaotic Evil'];
const fightingStyles=['Archery','Defense','Dueling','Great Weapon Fighting','Protection','Two-Weapon Fighting'];
const split=(value:string)=>value.split(',').map(x=>x.trim()).filter(Boolean);

export function DetailsPanel({c,update}:{c:Character;update:(fn:(x:Character)=>Character)=>void}){
 const background=BACKGROUNDS.find(b=>b.id===c.background);
 const patch=(p:Partial<Character>)=>update(x=>({...x,...p}));
 const setList=(key:'languages'|'toolProficiencies'|'armorProficiencies'|'weaponProficiencies',value:string)=>patch({[key]:split(value)} as Partial<Character>);
 const chooseBackground=(id:string)=>patch({background:id||undefined,backgroundData:(()=>{const b=BACKGROUNDS.find(x=>x.id===id);return b?{name:b.name,skillProficiencies:b.skillProficiencies,toolProficiencies:b.toolProficiencies,languages:b.languages,feature:b.feature}:undefined})()});
 const fightingClass=c.classes.find(cl=>['fighter','paladin','ranger'].includes(cl.id));
 const canChooseFightingStyle=!!fightingClass&&fightingClass.level>=2;
 const storedStyle=c.fightingStyles?.[0]??'';
 const fightingStyle=fightingStyles.find(s=>s.toLowerCase()===storedStyle.toLowerCase())??storedStyle;
 const hasInspiration=!!c.inspiration;
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
    <button type="button" className={`inspiration-toggle${hasInspiration?' active':''}`} aria-pressed={hasInspiration} onClick={()=>patch({inspiration:!hasInspiration})}>
     {hasInspiration?'● Inspiration available':'○ Inspiration not available'}
    </button>
    <small className="muted">2014 rules track Inspiration as a single resource.</small>
   </div>
   {canChooseFightingStyle&&<>
    <h3>Fighting Style</h3>
    <label>{fightingClass?.name} · Level {fightingClass?.level}
     <select value={fightingStyle} onChange={e=>patch({fightingStyles:e.target.value?[e.target.value]:[]})}>
      <option value="">Choose a fighting style</option>
      {fightingStyles.map(s=><option key={s}>{s}</option>)}
     </select>
    </label>
    <p className="muted">The Defense style grants +1 AC while wearing armor.</p>
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
