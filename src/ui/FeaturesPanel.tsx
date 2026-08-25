import {useState} from 'react';
import type {Character,Feature} from '../domain/types';
import {CLASS_PROGRESSION} from '../domain/content/class-progression';
import {OPTIONAL_CLASS_FEATURES} from '../domain/content/optional-class-features';
import {FEAT_DESCRIPTIONS} from '../domain/content/feat-descriptions';
import {FEATURE_DESCRIPTIONS} from '../domain/content/feature-descriptions';

const descriptionFor=(feature:Feature)=>feature.description??FEATURE_DESCRIPTIONS[feature.id]??FEATURE_DESCRIPTIONS[`${feature.id.split(':')[0]}:${feature.id.split(':')[1]}`];

export function FeaturesPanel({c,onResource}:{c:Character;onResource?:(resourceId:string)=>void}){
 const [selected,setSelected]=useState<Feature|null>(null);
 const chosen=new Set(c.optionalFeatures??[]);
 const optional=c.classes.flatMap(cl=>(OPTIONAL_CLASS_FEATURES[cl.id]??[]).filter(f=>chosen.has(f.id)&&f.level<=cl.level));
 const features=[...c.features,...c.classes.flatMap(cl=>(CLASS_PROGRESSION[cl.id]??[]).filter(f=>f.level<=cl.level)),...optional].map(f=>({...f,description:descriptionFor(f)}));
 const unique=[...new Map(features.map(f=>[f.id,f])).values()].sort((a,b)=>a.level-b.level||a.name.localeCompare(b.name));
 return <section className="card"><div className="row"><div><h2>Features & Traits</h2><p className="muted">Class, subclass, species, feat, background and item effects live here. Click any entry for details.</p></div><span className="muted">{unique.length} active</span></div>
 {c.feats?.length?<><h3>Feats</h3>{c.feats.map((feat,i)=><button className="feature feature-button" key={`${feat}-${i}`} onClick={()=>setSelected({id:`feat:${feat}`,name:feat,source:'feat',level:0,description:FEAT_DESCRIPTIONS[feat]??'The selected feat is not yet populated in the canonical feat catalog.'})}><div className="row"><b>{feat}</b><small>Feat</small></div><small>{FEAT_DESCRIPTIONS[feat]?'Description available':'Description missing'}</small></button>)}</>:null}
 {unique.map(f=><button className="feature feature-button" key={f.id} onClick={()=>setSelected(f)}><div className="row"><b>{f.name}</b><small>Level {f.level} · {f.source}{f.optional?' · Optional':''}</small></div><small>{f.description?'Description available':f.effects?.length?`${f.effects.length} mechanical effect${f.effects.length===1?'':'s'}`:f.resourceId?'Uses a resource':'Description missing'}</small></button>)}
 {selected&&<FeatureModal feature={selected} close={()=>setSelected(null)} onResource={onResource}/>}</section>
}
function FeatureModal({feature,close,onResource}:{feature:Feature;close:()=>void;onResource?:(resourceId:string)=>void}){return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}><div className="modal"><div className="row"><div><span className="eyebrow">{feature.source} · Level {feature.level}</span><h2>{feature.name}</h2></div><button onClick={close}>×</button></div><p className="feature-description">{feature.description??'The rule summary for this feature is not yet populated in the canonical content catalog.'}</p>{feature.activation&&<p><b>Activation:</b> {feature.activation}</p>}{feature.effects?.length?<><h3>Mechanical effects</h3>{feature.effects.map(e=><div className="effect-line" key={e.id}><b>{e.target}</b><span>{e.value>=0?'+':''}{e.value}{e.ability?` ${e.ability.toUpperCase()}`:''}{e.skill?` · ${e.skill}`:''}</span></div>)}</>:null}{feature.resourceId&&<p><b>Resource:</b> <button onClick={()=>onResource?.(feature.resourceId!)}>{feature.resourceId}</button></p>}</div></div>}
