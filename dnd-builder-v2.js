/* D&D Companion v2 — guided character builder. UI delegates calculations to the engine/data layer. */
(() => {
  'use strict';
  const E=window.DnDEngineV2,D=window.DnDDataV2;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const label=s=>String(s).replace(/([A-Z])/g,' $1').replace(/[-_]/g,' ').replace(/^./,c=>c.toUpperCase());
  const cls=id=>D.CLASSES[id]?.name||label(id);
  const abilityLabels={strength:'Strength',dexterity:'Dexterity',constitution:'Constitution',intelligence:'Intelligence',wisdom:'Wisdom',charisma:'Charisma'};
  let draft=null;
  function clone(v){return JSON.parse(JSON.stringify(v));}
  function species(){return D.SPECIES||{};}
  function background(){return D.BACKGROUNDS||{};}
  function sourceEnabled(src){return src==='phb2014'||E.state.rules.sources[src]!==false;}
  function open(){
    draft=clone(E.state);
    draft.abilityScoresBase=draft.abilityScoresBase||clone(draft.abilityScores);
    draft.proficiencies=draft.proficiencies||{};
    draft.proficiencies.skillChoicesByClass=draft.proficiencies.skillChoicesByClass||{};
    draft.origin=draft.origin||{};
    draft.origin.species=draft.origin.species||draft.origin.race||'';
    draft.origin.subrace=draft.origin.subrace||'';
    draft.origin.customOrigin=!!draft.origin.customOrigin;
    render();
  }
  function render(){
    if(!draft)return;
    const root=document.createElement('div');root.className='builder-overlay';root.id='builder';
    root.innerHTML=`<div class="builder-modal"><header class="builder-head"><div><div class="eyebrow">CHARACTER BUILDER</div><h2>Build your character</h2><p>Choose the options; the companion handles the derived values.</p></div><button class="icon-button" data-builder-close>×</button></header><div class="builder-body">${identity()}${origin()}${classes()}${scores()}${skillChoices()}${options()}</div><footer class="builder-foot"><button class="button secondary" data-builder-cancel>Cancel</button><button class="button" data-builder-save>Save character</button></footer></div>`;
    document.body.appendChild(root);bind();
  }
  function field(name,value,type='text'){return `<label class="builder-field"><span>${name}</span><input data-field="${value}" type="${type}" name="${value}" value="${esc(draft.identity?.[value]||'')}"></label>`}
  function identity(){return `<section class="builder-section"><div class="builder-section-title"><h3>Identity</h3></div><div class="builder-grid two">${field('Name','name')}${field('Alignment','alignment')}</div><div class="builder-grid two">${field('Background','background')}</div></section>`}
  function origin(){
    const sp=species(),id=draft.origin.species||'',s=sp[id],sub=s?.subraces?.[draft.origin.subrace];
    const subOptions=s?Object.entries(s.subraces||{}).map(([k,v])=>`<option value="${k}" ${draft.origin.subrace===k?'selected':''}>${esc(v.name)}</option>`).join(''):'';
    const flex=s?.flexibleAbilityBonuses;
    return `<section class="builder-section"><div class="builder-section-title"><h3>Origin</h3><span class="pill">PHB · Tasha optional</span></div><div class="builder-grid two"><label class="builder-field"><span>Species</span><select data-origin-species>${Object.entries(sp).filter(([,x])=>sourceEnabled(x.source)).map(([k,v])=>`<option value="${k}" ${id===k?'selected':''}>${esc(v.name)}</option>`).join('')}</select></label><label class="builder-field"><span>Subrace</span><select data-origin-subrace ${subOptions?'':'disabled'}><option value="">— None —</option>${subOptions}</select></label></div><label class="toggle-row builder-toggle"><span><b>Use Tasha's custom origin</b><small>Replace the species ability score increases with flexible increases.</small></span><input type="checkbox" data-custom-origin ${draft.origin.customOrigin?'checked':''} ${sourceEnabled('tasha')?'':'disabled'}></label>${flexChoice('Origin ability +1 #1',draft.origin.flexChoice1||'')}${flexChoice('Origin ability +1 #2',draft.origin.flexChoice2||'')}${s?`<div class="origin-note"><b>${esc(s.name)}</b><span>${esc((s.traits||[]).join(' · '))}</span></div>`:''}</section>`;
  }
  function flexChoice(title,value){return `<label class="builder-field"><span>${title}</span><select data-flex-choice="${title.includes('#1')?'1':'2'}"><option value="">— Automatic —</option>${D.ABILITIES.map(a=>`<option value="${a}" ${value===a?'selected':''}>${abilityLabels[a]}</option>`).join('')}</select></label>`}
  function classes(){return `<section class="builder-section"><div class="builder-section-title"><h3>Classes</h3><button class="text-button" data-add-class>+ Add class</button></div><div class="class-editor">${draft.classes.map((cl,i)=>classRow(cl,i)).join('')}</div><p class="builder-help">Multiclassing is validated against the rules engine. A class beyond the first uses its multiclass proficiencies.</p></section>`}
  function classRow(cl,i){const rules=D.CLASS_RULES?.[cl.classId]||{},subNeed=(rules.subclassLevels||[])[0],l=Number(cl.level)||1;const subs=D.SUBCLASSES.filter(s=>s.classId===cl.classId&&sourceEnabled(s.source)&&l>=subNeed);const choice=rules.skillChoices;return `<div class="class-row"><div class="class-row-top"><label class="builder-field"><span>${i===0?'Starting class':'Multiclass'}</span><select data-class="${i}">${Object.entries(D.CLASSES).map(([id,v])=>`<option value="${id}" ${cl.classId===id?'selected':''}>${esc(v.name)}</option>`).join('')}</select></label><label class="builder-field small"><span>Level</span><input data-level="${i}" type="number" min="1" max="20" value="${l}"></label>${i>0?`<button class="danger-text" data-remove-class="${i}">Remove</button>`:''}</div><label class="builder-field"><span>Subclass${subNeed?` · unlocks at ${subNeed}`:''}</span><select data-subclass="${i}" ${subs.length?'':'disabled'}><option value="">— Choose later —</option>${subs.map(s=>`<option value="${s.id}" ${cl.subclass===s.id?'selected':''}>${esc(s.name)} · ${s.source==='phb2014'?'PHB':s.source==='xanathar'?'Xanathar':'Tasha'}</option>`).join('')}</select></label></div>`}
  function scores(){return `<section class="builder-section"><div class="builder-section-title"><h3>Ability scores</h3><span class="pill">Base scores</span></div><div class="score-editor">${D.ABILITIES.map(a=>`<label><span>${abilityLabels[a]}</span><input data-score="${a}" type="number" min="1" max="20" value="${Number(draft.abilityScoresBase[a]||10)}"><small>mod ${signed(Math.floor((Number(draft.abilityScoresBase[a]||10)-10)/2))}</small></label>`).join('')}</div></section>`}
  function skillChoices(){return `<section class="builder-section"><div class="builder-section-title"><h3>Skill choices</h3></div>${draft.classes.map((cl,i)=>skillChoiceBlock(cl,i)).join('')}</section>`}
  function skillChoiceBlock(cl,i){const r=D.CLASS_RULES?.[cl.classId]?.skillChoices;if(!r)return '';const selected=draft.proficiencies.skillChoicesByClass[`${cl.classId}:${i}`]||[];return `<div class="skill-choice-block"><div><b>${i===0?'Starting class':'Multiclass'} · ${esc(cls(cl.classId))}</b><small>Choose ${i===0?r.count:(D.MULTICLASS?.proficiencies?.[cl.classId]?.skills==='choice:1'?1:0)} skill${r.count===1?'':'s'}</small></div><div class="choice-grid">${r.options.map(k=>`<label><input type="checkbox" data-skill-choice="${i}:${k}" ${selected.includes(k)?'checked':''}> <span>${label(k)}</span></label>`).join('')}</div></div>`}
  function options(){return `<section class="builder-section"><div class="builder-section-title"><h3>Rules options</h3></div>${Object.values(D.SOURCES).map(s=>`<label class="toggle-row builder-toggle"><span><b>${esc(s.name)}</b><small>${s.optional?'Optional':'Core'}</small></span><input type="checkbox" data-builder-source="${s.id}" ${s.id==='phb2014'||draft.rules.sources[s.id]?'checked':''} ${s.id==='phb2014'?'disabled':''}></label>`).join('')}</section>`}
  function read(){
    document.querySelectorAll('#builder [data-field]').forEach(x=>{draft.identity=draft.identity||{};draft.identity[x.name]=x.value;});
    document.querySelectorAll('#builder [data-score]').forEach(x=>draft.abilityScoresBase[x.dataset.score]=Math.max(1,Math.min(20,Number(x.value)||10)));
    document.querySelectorAll('#builder [data-level]').forEach(x=>draft.classes[Number(x.dataset.level)] .level=Math.max(1,Math.min(20,Number(x.value)||1)));
    document.querySelectorAll('#builder [data-class]').forEach(x=>draft.classes[Number(x.dataset.class)].classId=x.value);
    document.querySelectorAll('#builder [data-subclass]').forEach(x=>draft.classes[Number(x.dataset.subclass)].subclass=x.value);
    document.querySelectorAll('#builder [data-origin-species]').forEach(x=>draft.origin.species=x.value);
    document.querySelectorAll('#builder [data-origin-subrace]').forEach(x=>draft.origin.subrace=x.value);
    const custom=document.querySelector('#builder [data-custom-origin]');draft.origin.customOrigin=!!custom?.checked;
    document.querySelectorAll('#builder [data-flex-choice]').forEach(x=>draft.origin[`flexChoice${x.dataset.flexChoice}`]=x.value);
    document.querySelectorAll('#builder [data-builder-source]').forEach(x=>{if(x.dataset.builderSource!=='phb2014')draft.rules.sources[x.dataset.builderSource]=x.checked;});
    draft.proficiencies.skillChoicesByClass={};document.querySelectorAll('#builder [data-skill-choice]:checked').forEach(x=>{const [i,k]=x.dataset.skillChoice.split(':');const key=`${draft.classes[Number(i)].classId}:${i}`;(draft.proficiencies.skillChoicesByClass[key] ||= []).push(k);});
  }
  function applyOrigin(){
    const base=clone(draft.abilityScoresBase),s=D.SPECIES?.[draft.origin.species];draft.identity.speed=s?.speed||30;draft.identity.size=s?.size||'Medium';
    let bonuses={};
    if(draft.origin.customOrigin&&sourceEnabled('tasha')){[draft.origin.flexChoice1,draft.origin.flexChoice2].filter(Boolean).forEach(a=>bonuses[a]=(bonuses[a]||0)+1);}
    else{Object.entries(s?.abilityBonuses||{}).forEach(([a,n])=>bonuses[a]=(bonuses[a]||0)+n);const sub=s?.subraces?.[draft.origin.subrace];Object.entries(sub?.abilityBonuses||{}).forEach(([a,n])=>bonuses[a]=(bonuses[a]||0)+n);if(s?.flexibleAbilityBonuses){[draft.origin.flexChoice1,draft.origin.flexChoice2].filter(Boolean).forEach(a=>bonuses[a]=(bonuses[a]||0)+s.flexibleAbilityBonuses.amount);}}
    draft.origin.abilityBonuses=bonuses;draft.abilityScores=D.ABILITIES.reduce((o,a)=>{o[a]=Math.min(20,base[a]+(bonuses[a]||0));return o;},{});
  }
  function applyProficiencies(){
    const p=draft.proficiencies||{};p.skills=p.skills||{};p.savingThrows=[];p.armor=[];p.weapons=[];p.tools=[];
    draft.classes.forEach((cl,i)=>{const rules=D.CLASS_RULES?.[cl.classId];if(!rules)return;if(i===0)(rules.proficiencies?.saves||[]).forEach(x=>p.savingThrows.push(x));else (rules.multiclassProficiencies?.armor||[]).forEach(x=>p.armor.push(x));(rules.proficiencies?.armor||[]).forEach(x=>{if(i===0)p.armor.push(x)});(rules.proficiencies?.weapons||[]).forEach(x=>{if(i===0)p.weapons.push(x)});(rules.proficiencies?.tools||[]).forEach(x=>{if(i===0)p.tools.push(x)});});
    const b=D.BACKGROUNDS?.[draft.identity.background];(b?.skills||[]).forEach(k=>p.skills[k]={proficiency:true,source:'background'});
    Object.values(p.skillChoicesByClass||{}).flat().forEach(k=>p.skills[k]={proficiency:true,source:'class'});
    const sp=D.SPECIES?.[draft.origin.species],sub=sp?.subraces?.[draft.origin.subrace];[...(sp?.traits||[]),(sub?.traits||[])].forEach(()=>{});
    draft.proficiencies=p;
  }
  function validate(){
    const errors=[];if(!draft.identity.name?.trim())errors.push('Give the character a name.');if(!draft.classes.length)errors.push('Choose at least one class.');
    draft.classes.forEach((cl,i)=>{if(!D.CLASSES[cl.classId])errors.push(`Class ${i+1} is invalid.`);if(i>0&&!E.meetsPrerequisite(draft,D.MULTICLASS?.prerequisites?.[cl.classId]))errors.push(`${cls(cl.classId)} does not meet its multiclass ability prerequisites.`);const r=D.CLASS_RULES?.[cl.classId]?.skillChoices;if(r){const chosen=draft.proficiencies.skillChoicesByClass[`${cl.classId}:${i}`]||[];const need=i===0?r.count:(D.MULTICLASS?.proficiencies?.[cl.classId]?.skills==='choice:1'?1:0);if(chosen.length!==need)errors.push(`${cls(cl.classId)} needs ${need} selected skill${need===1?'':'s'}.`);if(new Set(chosen).size!==chosen.length)errors.push(`${cls(cl.classId)} has duplicate skill choices.`);}});return errors;}
  function save(){read();applyOrigin();applyProficiencies();const errors=validate();if(errors.length){alert(errors.join('\n'));return;}E.state.identity=draft.identity;E.state.origin=draft.origin;E.state.abilityScoresBase=draft.abilityScoresBase;E.state.abilityScores=draft.abilityScores;E.state.classes=draft.classes;E.state.proficiencies=draft.proficiencies;E.state.rules=draft.rules;E.state.resources.hp.current=Math.min(E.state.resources.hp.current||E.summary().hpMaximum,E.summary().hpMaximum);E.save();close();E.state.resources.hp.current=E.summary().hpMaximum;E.save();window.DnDAppV2.render();}
  function close(){document.querySelector('#builder')?.remove();draft=null;}
  function bind(){const root=document.querySelector('#builder');root.querySelector('[data-builder-close]').onclick=close;root.querySelector('[data-builder-cancel]').onclick=close;root.querySelector('[data-builder-save]').onclick=save;root.querySelector('[data-add-class]').onclick=()=>{read();draft.classes.push({classId:'fighter',level:1,subclass:'',source:'phb2014'});render();};root.querySelectorAll('[data-remove-class]').forEach(b=>b.onclick=()=>{read();draft.classes.splice(Number(b.dataset.removeClass),1);render();});root.querySelector('[data-origin-species]').onchange=()=>{read();draft.origin.subrace='';render();};root.querySelector('[data-class]')?.addEventListener('change',()=>{read();draft.classes.forEach(c=>{c.subclass='';});render();});root.querySelectorAll('[data-class]').forEach(x=>x.onchange=()=>{read();draft.classes[Number(x.dataset.class)].subclass='';render();});root.querySelectorAll('[data-level]').forEach(x=>x.onchange=()=>{read();render();});root.querySelector('[data-custom-origin]')?.addEventListener('change',()=>{read();render();});}
  document.addEventListener('click',e=>{const b=e.target.closest?.('[data-action="edit"]');if(b){e.preventDefault();e.stopImmediatePropagation();open();}},true);
  window.DnDBuilderV2={open,close};
})();