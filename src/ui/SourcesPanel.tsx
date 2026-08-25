import {CONTENT_SOURCES} from '../domain/content-sources';
import type {Character} from '../domain/types';
export function SourcesPanel({c,update}:{c:Character;update:(fn:(x:Character)=>Character)=>void}){
 const enabled=new Set(c.contentSources??CONTENT_SOURCES.filter(s=>s.enabledByDefault).map(s=>s.id));
 const toggle=(id:string)=>update(x=>{
  const source=CONTENT_SOURCES.find(s=>s.id===id);
  if(!source||source.required)return x;
  const next=new Set(x.contentSources??CONTENT_SOURCES.filter(s=>s.enabledByDefault).map(s=>s.id));
  next.has(source.id)?next.delete(source.id):next.add(source.id);
  return {...x,contentSources:[...next]};
 });
 return <section className="card"><h2>Content Sources</h2><p className="muted">Choose which 5e 2014 content is available to this character/campaign. Enabling a source does not silently add every optional feature.</p><div className="choice-grid">{CONTENT_SOURCES.map(s=><button key={s.id} disabled={s.required} className={enabled.has(s.id)?'choice selected':'choice'} onClick={()=>toggle(s.id)}>{s.name}<small>{s.required?'Always enabled':s.description}</small></button>)}</div></section>
}
