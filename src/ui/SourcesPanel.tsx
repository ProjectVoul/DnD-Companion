import {CONTENT_SOURCES} from '../domain/content-sources';
import {CLASS_SOURCES} from '../domain/content/class-sources';
import {ALL_SUBCLASSES} from '../domain/content/subclass-registry';
import type {Character,ContentSourceId} from '../domain/types';
export function SourcesPanel({c,update}:{c:Character;update:(fn:(x:Character)=>Character)=>void}){
 const enabled=new Set<ContentSourceId>(c.contentSources??CONTENT_SOURCES.filter(s=>s.enabledByDefault).map(s=>s.id));
 const requiredForCharacter=new Set<ContentSourceId>(c.classes.map(cl=>(CLASS_SOURCES[cl.id]??'phb2014') as ContentSourceId));
 for(const cl of c.classes){const sub=ALL_SUBCLASSES[cl.id]?.find(s=>s.id===cl.subclassId);if(sub)requiredForCharacter.add(sub.source)}
 const toggle=(id:ContentSourceId)=>update(x=>{const source=CONTENT_SOURCES.find(s=>s.id===id);if(!source||source.required||requiredForCharacter.has(id))return x;const next=new Set<ContentSourceId>(x.contentSources??CONTENT_SOURCES.filter(s=>s.enabledByDefault).map(s=>s.id));next.has(source.id)?next.delete(source.id):next.add(source.id);return {...x,contentSources:[...next]};});
 return <section className="card"><h2>Content Sources</h2><p className="muted">Choose which 5e 2014 content is available to this character/campaign. A source required by the current class or subclass cannot be disabled.</p><div className="choice-grid">{CONTENT_SOURCES.map(s=><button key={s.id} disabled={s.required||requiredForCharacter.has(s.id)} className={enabled.has(s.id)?'choice selected':'choice'} onClick={()=>toggle(s.id)}>{s.name}<small>{s.required?'Always enabled':requiredForCharacter.has(s.id)?'Required by this character':s.description}</small></button>)}</div></section>
}
