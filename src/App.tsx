import {useEffect,useState} from 'react';
import {TEST_CHARACTER,SPELLS} from './domain/sample-data';
import {normalizeCharacter} from './domain/rules/character';
import {loadCharacter,saveCharacter,clearCharacter} from './application/storage';
import {eligibleClassSpells} from './domain/rules/spellcasting';
import {Builder} from './ui/Builder';
import {Sheet} from './ui/Sheet';
import {SkillsPanel} from './ui/SkillsPanel';
import {EquipmentPanel} from './ui/EquipmentPanel';
import {SpellsPanel} from './ui/SpellsPanel';
import {FeaturesPanel} from './ui/FeaturesPanel';
import {ResourcesPanel} from './ui/ResourcesPanel';
import {LevelUpPanel} from './ui/LevelUpPanel';
import {SourcesPanel} from './ui/SourcesPanel';
import type {Character} from './domain/types';
type Section='sheet'|'skills'|'equipment'|'spells'|'features'|'resources'|'levelup'|'sources'|'builder';
const sections:Section[]=['sheet','skills','equipment','spells','features','resources','levelup','sources','builder'];
const labels:Record<Section,string>={sheet:'Character Sheet',skills:'Skills',equipment:'Inventory',spells:'Spells',features:'Features',resources:'Resources',levelup:'Level Up',sources:'Sources',builder:'New Character'};
export default function App(){const [c,setC]=useState<Character>(()=>normalizeCharacter(loadCharacter(TEST_CHARACTER)));const [section,setSection]=useState<Section>('sheet');useEffect(()=>saveCharacter(c),[c]);const update=(fn:(x:Character)=>Character)=>setC(x=>normalizeCharacter(fn(x)));const classId=c.classes[0]?.id??'';const enabledSources=c.contentSources??['phb2014','homebrew'];const classSpells=eligibleClassSpells(SPELLS,classId,enabledSources);return <div className="app"><header><div><span className="eyebrow">5e 2014 · Character Companion</span><h1>{c.name}</h1><p>{c.species} · {c.classes.map(x=>`${x.name} ${x.level}`).join(' / ')||'No class yet'}{c.classes[0]?.subclassName?` · ${c.classes[0].subclassName}`:''}{c.background?` · ${c.backgroundData?.name??c.background}`:''}</p></div><div className="header-stats"><b>Level {c.level}</b><span>PB +{c.proficiencyBonus}</span><button onClick={()=>{clearCharacter();setC(normalizeCharacter(structuredClone(TEST_CHARACTER)));setSection('sheet')}}>Reset test character</button></div></header><nav>{sections.map(s=><button key={s} className={section===s?'active':''} onClick={()=>setSection(s)}>{labels[s]}</button>)}</nav><main>{section==='sheet'&&<Sheet c={c} update={update}/>} {section==='skills'&&<SkillsPanel c={c} update={update}/>} {section==='equipment'&&<EquipmentPanel c={c} update={update}/>} {section==='spells'&&<SpellsPanel c={c} update={update} spells={classSpells}/>} {section==='features'&&<FeaturesPanel c={c}/>} {section==='resources'&&<ResourcesPanel c={c} update={update}/>} {section==='levelup'&&<LevelUpPanel c={c} update={update}/>} {section==='sources'&&<SourcesPanel c={c} update={update}/>} {section==='builder'&&<Builder onCreate={x=>{setC(normalizeCharacter(x));setSection('sheet')}}/>}</main></div>}
