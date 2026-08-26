import {useState} from 'react';
import type {Character,Feature,FeatureSource} from '../domain/types';
import {CLASS_PROGRESSION} from '../domain/content/class-progression';
import {OPTIONAL_CLASS_FEATURES} from '../domain/content/optional-class-features';
import {PALADIN_SUBCLASS_FEATURES} from '../domain/content/paladin-subclass-features';
import {FEAT_DESCRIPTIONS} from '../domain/content/feat-descriptions';
import {FEATURE_DESCRIPTIONS} from '../domain/content/feature-descriptions';
import {enabledContentSources} from '../domain/content-sources';

const descriptionFor=(feature:Feature)=>feature.description??FEATURE_DESCRIPTIONS[feature.id]??FEATURE_DESCRIPTIONS[`${feature.id.split(':')[0]}:${feature.id.split(':')[1]}`];
const sourceLabels:Record<FeatureSource,string>={class:'Class',subclass:'Subclass',species:'Species / Race',feat:'Feats',background:'Background',item:'Items',optional:'Optional Features'};
const sourceOrder:FeatureSource[]=['species','background','class','subclass','feat','item','optional'];

export function FeaturesPanel({c,onResource}:{c:Character;onResource?:(resourceId:string)=>void}){
 const [selected,setSelected]=useState<Feature|null>(null);
 const enabled=new Set(enabledContentSources(c.contentSources));
 const chosen=new Set(c.optionalFeatures??[]);
 const optional=c.classes.flatMap(cl=>(OPTIONAL_CLASS_FEATURES[cl.id]??[]).filter(f=>chosen.has(f.id)&&f.level<=cl.level));
 const storedNonClass=c.features.filter(f=>f.source!=='class');
 const progression=c.classes.flatMap(cl=>(CLASS_PROGRESSION[cl.id]??[]).filter(f=>f.level<=cl.level));
 const subclass=c.classes.flatMap(cl=>cl.subclassId?(PALADIN_SUBCLASS_FEATURES[cl.subclassId]??[]).filter(f=>f.level<=cl.level&&enabled.has(f.sourceBook??'phb2014')):[]);
 const itemFeatures=c.items.filter(i=>(i.mechanicalEffects?.length||i.effects?.length)&&i.equipped).map(i=>({id:`item:${i.id}`,name:i.name,source:'item' as const,level:0,description:i.description??(i.effects??[]).join(' · '),effects:i.mechanicalEffects}));
 const features=[...storedNonClass,...progression,...subclass,...optional,...itemFeatures].map(f=>({...f,description:descriptionFor(f)}));
 const unique=[...new Map(features.map(f=>[f.id,f])).values()].sort((a,b)=>a.level-b.level||a.name.localeCompare(b.name));
 const groups=sourceOrder.map(source=>({source,items:unique.filter(f=>f.source===source)})).filter(g=>g.items.length);
 return <section className="card"><div className="row"><div><h2>Features & Traits</h2><p className="muted">Features are grouped by origin so class, subclass, species, feats, background and item effects stay distinct.</p></div><span className="muted">{unique.length} active</span></div>
 {groups.map(group=><div key={group.source}><h3>{sourceLabels[group.source]} <small>{group.items.length}</small></h3>{group.items.map(f=><button className="feature feature-button" key={f.id} onClick={()=>setSelected(f)}><div className="row"><b>{f.name}</b><small>{f.level?`Level ${f.level} · `:''}{sourceLabels[f.source]}{f.optional?' · Optional':''}</small></div><small>{f.description?'Description available':f.effects?.length?`${f.effects.length} mechanical effect${f.effects.length===1?'':'s'}`:f.resourceId?'Uses a resource':'Description missing'}</small></button>)}</div>)}
 {c.feats?.length&&!groups.some(g=>g.source==='feat')&&<p className="muted">No feat entries are currently active.</p>}
 {selected&&<FeatureModal feature={selected} close={()=>setSelected(null)} onResource={onResource}/>}</section>
}
function FeatureModal({feature,close,onResource}:{feature:Feature;close:()=>void;onResource?:(resourceId:string)=>void}){return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}><div className="modal"><div className="row"><div><span className="eyebrow">{sourceLabels[feature.source]}{feature.level?` · Level ${feature.level}`:''}</span><h2>{feature.name}</h2></div><button onClick={close}>×</button></div><p className="feature-description">{feature.description??'The rule summary for this feature is not yet populated in the canonical content catalog.'}</p>{feature.activation&&<p><b>Activation:</b> {feature.activation}</p>}{feature.effects?.length?<><h3>Mechanical effects</h3>{feature.effects.map(e=><div className="effect-line" key={e.id}><b>{e.target}</b><span>{e.value>=0?'+':''}{e.value}{e.ability?` ${e.ability.toUpperCase()}`:''}{e.skill?` · ${e.skill}`:''}</span></div>)}</>:null}{feature.resourceId&&<p><b>Resource:</b> <button onClick={()=>onResource?.(feature.resourceId!)}>{feature.resourceId}</button></p>}</div></div>}
