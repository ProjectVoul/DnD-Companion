/* D&D Companion — Character Sheet v4 | completeness-first 5e 2014 sheet */
(() => {
  'use strict';
  const e = window.DnDCharacterEngine;
  if (!e) return;

  const A = ['strength','dexterity','constitution','intelligence','wisdom','charisma'];
  const AL = {strength:'STR',dexterity:'DEX',constitution:'CON',intelligence:'INT',wisdom:'WIS',charisma:'CHA'};
  const SK = {
    athletics:'Athletics', acrobatics:'Acrobatics', sleightOfHand:'Sleight of Hand', stealth:'Stealth',
    arcana:'Arcana', history:'History', investigation:'Investigation', nature:'Nature', religion:'Religion',
    animalHandling:'Animal Handling', insight:'Insight', medicine:'Medicine', perception:'Perception',
    survival:'Survival', deception:'Deception', intimidation:'Intimidation', performance:'Performance', persuasion:'Persuasion'
  };
  const esc = v => String(v ?? '').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const sign = v => { const n=Number(v)||0; return n>=0?`+${n}`:`${n}`; };
  const C = () => e.getLiveCharacter ? e.getLiveCharacter() : e.loadCharacter();
  const O = () => e.characterOptions || {};
  const LV = c => Math.max(1,Math.min(20,Number(c.identity?.level)||1));

  function hpInit(c){
    c.resources=c.resources||{};
    c.resources.hp=c.resources.hp||{maximum:1,current:1,temporary:0};
    c.resources.hp.temporary=Number(c.resources.hp.temporary)||0;
    c.resources.hp.levelRolls=Array.isArray(c.resources.hp.levelRolls)?c.resources.hp.levelRolls:[];
    c.resources.hp.manualMaximum=Boolean(c.resources.hp.manualMaximum);
  }
  function die(c){return Number(String(O().classData?.[c.identity?.class]?.hitDie||'d8').replace('d',''))||8;}
  function hpMax(c){
    hpInit(c);
    if(e.getHitPointMaximum && !c.resources.hp.manualMaximum) return e.getHitPointMaximum(c);
    const d=die(c), con=e.calculator.getAbilityModifier(c,'constitution'), lv=LV(c);
    if(!c.resources.hp.manualMaximum) return Math.max(1,d+con+(lv-1)*(Math.floor(d/2)+1+con));
    let total=d+con;
    for(let i=0;i<lv-1;i++){
      const r=Number(c.resources.hp.levelRolls[i]);
      total+=Math.max(1,Number.isInteger(r)&&r>=1&&r<=d?r:Math.floor(d/2)+1+con);
    }
    return Math.max(1,total);
  }
  function preparedSpells(){try{const x=JSON.parse(localStorage.getItem('preparedSpells')||'[]');return Array.isArray(x)?x:[];}catch{return[];}}
  function oathSpells(c){return e.getOathSpells?e.getOathSpells(c.identity?.subclass,LV(c)):[];}
  function spellLimit(c){
    const cls=c.identity?.class,lv=LV(c);
    if(cls==='Paladin'||cls==='Ranger') return Math.max(1,e.calculator.getAbilityModifier(c,cls==='Paladin'?'charisma':'wisdom')+Math.floor(lv/2));
    if(cls==='Cleric'||cls==='Druid') return Math.max(1,e.calculator.getAbilityModifier(c,cls==='Cleric'?'wisdom':'wisdom')+lv);
    if(cls==='Wizard') return Math.max(1,e.calculator.getAbilityModifier(c,'intelligence')+lv);
    if(cls==='Artificer') return Math.max(1,e.calculator.getAbilityModifier(c,'intelligence')+Math.floor(lv/2));
    return null;
  }
  function resourceState(c){c.resources.featureUses=c.resources.featureUses||{};return c.resources.featureUses;}
  function resourceCurrent(c,r){const s=resourceState(c);return s[r.id]===undefined?Number(r.current??r.maximum)||0:Math.min(Math.max(0,Number(s[r.id])||0),Number(r.maximum)||0);}
  function setResource(c,r,value){resourceState(c)[r.id]=Math.min(Math.max(0,Number(value)||0),Number(r.maximum)||0);e.saveCharacter(c);render();}
  function featureList(c){return e.getCharacterFeatures?e.getCharacterFeatures(c):c.features||[];}
  function sourceFeatures(c,type){return featureList(c).filter(f=>(f.type||'other')===type);}
  function skillRank(c,s){return e.getSkillRank?e.getSkillRank(c,s):(c.proficiencies?.skills?.[s]?.expertise?'expertise':c.proficiencies?.skills?.[s]?.proficiency?'proficient':'none');}

  function renderHomeHPBar(){
    const box=document.querySelector('.status-hp');
    if(!box) return;
    let bar=box.querySelector('.home-hp-bar');
    if(!bar){
      bar=document.createElement('div'); bar.className='home-hp-bar';
      bar.innerHTML='<div class="home-hp-fill"></div>';
      box.appendChild(bar);
    }
    const c=C(); hpInit(c); const max=hpMax(c); const cur=Math.min(max,Math.max(0,Number(c.resources.hp.current)||0));
    bar.querySelector('.home-hp-fill').style.width=`${max?Math.round(cur/max*100):0}%`;
  }

  function field(label,path,value){return `<label class="sheet-field"><span>${label}</span><input type="text" data-field="${path}" value="${esc(value)}"></label>`;}
  function num(label,path,value,min,max){return `<label class="sheet-field"><span>${label}</span><input type="number" data-field="${path}" value="${Number(value)||0}" min="${min}" max="${max}"></label>`;}
  function select(label,path,value,items,disabled=false){return `<label class="sheet-field"><span>${label}</span><select data-select="${path}" ${disabled?'disabled':''}>${items.map(x=>`<option value="${esc(x.value)}" ${String(x.value)===String(value)?'selected':''}>${esc(x.label)}</option>`).join('')}</select></label>`;}

  function renderSkillChoice(c){
    const data=e.getClassSkillChoices?e.getClassSkillChoices(c):{count:0,options:[]};
    if(!data.count) return '<p class="sheet-help">This class has no class-skill choice configured yet.</p>';
    const selected=e.getSelectedClassSkills?e.getSelectedClassSkills(c):[];
    const blocked=e.getBackgroundSkills?e.getBackgroundSkills(c):[];
    return `<div class="skill-choice-box"><div class="sheet-subheading"><strong>Class skill selection</strong><small>${selected.length} / ${data.count} chosen</small></div><div class="skill-choice-grid">${data.options.map(s=>{const on=selected.includes(s),isBlocked=blocked.includes(s);return `<button type="button" class="skill-choice-chip ${on?'selected':''} ${isBlocked?'blocked':''}" data-class-skill="${s}" ${isBlocked?'disabled':''}>${esc(SK[s]||s)}${isBlocked?' · background':''}</button>`}).join('')}</div><small class="sheet-help">Only skills offered by the class can be selected. A skill already granted by the background is not selectable again; the rules allow a different skill of the same type instead.</small></div>`;
  }

  function renderTraits(c,raceKey){
    const race=O().races?.[raceKey];
    const raceFeatures=sourceFeatures(c,'race');
    const abilityBonuses=Object.entries(race?.abilityBonuses||{}).map(([a,v])=>`${AL[a]||a} ${sign(v)}`).join(', ');
    const basics=[];
    if(race?.size) basics.push(`Size: ${race.size}`);
    if(race?.speed) basics.push(`Speed: ${race.speed} ft.`);
    if(abilityBonuses) basics.push(`Ability score increases: ${abilityBonuses}`);
    if(race?.languages?.length) basics.push(`Languages: ${race.languages.join(', ')}`);
    if(raceKey==='Dragonborn'&&c.dragonAncestry){const a=O().dragonAncestry?.[c.dragonAncestry];if(a) basics.push(`Draconic ancestry: ${c.dragonAncestry} · ${a[0]} resistance · ${a[1]} save`);}
    const featureHTML=raceFeatures.map(f=>`<details class="trait-detail"><summary>${esc(f.name)}</summary><p>${esc(f.description||raceFeatureDescription(f,c))}</p></details>`).join('');
    return `<div class="trait-basics">${basics.map(x=>`<span class="trait-pill">${esc(x)}</span>`).join('')||'<span class="sheet-empty">No racial basics configured.</span>'}</div>${featureHTML||'<p class="sheet-empty">No racial feature data linked.</p>'}`;
  }
  function raceFeatureDescription(f,c){
    if(f.id==='breath-weapon'&&c.identity?.race==='Dragonborn') return 'Action. The breath weapon uses the chosen draconic ancestry to determine damage, area and saving throw. The saving throw DC is 8 + Constitution modifier + proficiency bonus; damage scales by character level. It recharges after a short or long rest.';
    if(f.id==='draconic-ancestry') return 'Your draconic ancestry determines the damage type, breath weapon geometry and damage resistance.';
    return 'Feature description pending full rules text linkage.';
  }

  function renderFeatureSection(c,type,title){
    const fs=sourceFeatures(c,type);
    if(!fs.length) return '';
    return `<div class="feature-source-section"><h3>${title}</h3>${fs.map(f=>`<details class="trait-detail"><summary>${esc(f.name)} <small>level ${Number(f.level)||1}</small></summary><p>${esc(f.description||raceFeatureDescription(f,c))}</p></details>`).join('')}</div>`;
  }

  function renderResources(c,d){
    const resources=e.getFeatureResources?e.getFeatureResources(c):[];
    const rows=resources.map(r=>{const cur=resourceCurrent(c,r);return `<div class="resource-row"><div><strong>${esc(r.name)}</strong><small>${esc(r.recovery||'longRest')}</small></div><div class="resource-controls"><button type="button" data-resource="${esc(r.id)}" data-delta="-1">−</button><strong>${cur} / ${Number(r.maximum)||0}</strong><button type="button" data-resource="${esc(r.id)}" data-delta="1">+</button></div></div>`}).join('');
    return `<div class="resource-grid"><div class="resource-row"><div><strong>Inspiration</strong><small>special resource</small></div><button type="button" class="resource-toggle ${c.resources?.inspiration?'active':''}" data-inspiration>${c.resources?.inspiration?'Available':'Not available'}</button></div>${rows||'<p class="sheet-empty">No feature resources currently linked.</p>'}</div>`;
  }

  function renderSpellcasting(c){
    const slots=c.resources?.spellSlots||{}; const prep=preparedSpells(); const oath=oathSpells(c); const limit=spellLimit(c);
    const className=c.identity?.class||'—'; const ability=c.spellcasting?.ability;
    const slotRows=Object.keys(slots).sort((a,b)=>Number(a)-Number(b)).map(l=>`<div class="spell-slot"><span>Level ${l}</span><div class="slot-inline"><button type="button" data-slot="${l}" data-delta="-1">−</button><strong>${slots[l].current} / ${slots[l].maximum}</strong><button type="button" data-slot="${l}" data-delta="1">+</button></div></div>`).join('');
    return `<div class="sheet-detail"><span>Spellcasting class</span><strong>${esc(className)}</strong></div><div class="sheet-detail"><span>Ability</span><strong>${esc(ability?AL[ability]||ability:'—')}</strong></div><div class="sheet-detail"><span>Spell attack</span><strong>${c.spellcasting?.ability&&e.calculator.getSpellAttackBonus?sign(e.calculator.getSpellAttackBonus(c)):'—'}</strong></div><div class="sheet-detail"><span>Spell save DC</span><strong>${c.spellcasting?.ability&&e.calculator.getSpellSaveDC?e.calculator.getSpellSaveDC(c):'—'}</strong></div><div class="spell-source-map"><div><strong>Class spell list</strong><small>Available according to class spellcasting rules</small></div><div><strong>Prepared</strong><small>${limit?`${prep.length} / ${limit}`:`${prep.length} saved`}</small></div>${oath.length?`<div><strong>Subclass / Oath</strong><small>${oath.length} always prepared</small></div>`:''}</div><div class="spell-slots">${slotRows||'<p class="sheet-empty">No spell slots.</p>'}</div>${prep.length?`<div class="prepared-spell-list">${prep.map(s=>`<span class="prepared-spell-pill">${esc(s)}</span>`).join('')}</div>`:'<p class="sheet-empty">No prepared spells saved yet.</p>'}${oath.length?`<div class="sheet-subheading"><strong>Always prepared</strong><small>subclass / oath</small></div><div class="prepared-spell-list">${oath.map(s=>`<span class="prepared-spell-pill oath">${esc(s)}</span>`).join('')}</div>`:''}`;
  }

  function render(){
    const app=document.getElementById('app'); if(!app)return;
    const c=C(); hpInit(c); if(e.syncCharacterRules)e.syncCharacterRules(c);
    c.resources.hp.maximum=hpMax(c); if(c.resources.hp.current>c.resources.hp.maximum)c.resources.hp.current=c.resources.hp.maximum;
    const d=e.getLiveDerivedData?e.getLiveDerivedData():e.calculator.getDerivedData(c),o=O(),lv=LV(c);
    const raceKey=c.identity.race==='Draconide'?'Dragonborn':c.identity.race;
    const races=Object.keys(o.races||{}),classes=Object.keys(o.classData||{}),bgs=Object.keys(o.backgrounds||{});
    const subs=(o.subclasses?.[c.identity.class]||[]).map(x=>({value:x[0],label:`${x[0]} · level ${x[1]}`}));
    const hp=c.resources.hp,death=c.resources.deathSaves||{successes:0,failures:0};
    const carried=d.carriedWeight??0,capacity=d.carryingCapacity??0;
    const armor=e.calculator.getEquippedArmor(c),shield=e.calculator.getEquippedShield(c);
    const items=(c.items||[]).filter(i=>i?.equipment?.equipped||i?.equipped);
    const groups={};featureList(c).forEach(f=>(groups[f.type||'other']||=[]).push(f));
    const style=c.choices?.fightingStyle||c.fightingStyle||'';
    const styles=[['defense','Defense'],['dueling','Dueling'],['greatWeaponFighting','Great Weapon Fighting'],['protection','Protection']];
    const hpPct=hp.maximum?Math.round(Math.max(0,Math.min(hp.maximum,hp.current))/hp.maximum*100):0;

    app.innerHTML=`<header class="character-sheet-header"><button class="back-button" type="button" onclick="showCharacterHome()">← Character</button><div><h1>Character Sheet</h1><p>5e 2014 · rules-linked character data</p></div></header><main class="character-sheet-v4">
      <section class="sheet-column sheet-left">
        <div class="sheet-card sheet-identity"><h2>Identity</h2><div class="sheet-form-grid">${field('Name','identity.name',c.identity.name)}${select('Race','identity.race',c.identity.race,races.map(x=>({value:x,label:x==='Dragonborn'?'Dragonborn':x})))}${select('Class','identity.class',c.identity.class,classes.map(x=>({value:x,label:x})))}${select('Subclass / Oath','identity.subclass',c.identity.subclass,subs.length?subs:[{value:'',label:c.identity.class?'No subclass selected':'Choose class first'}],!c.identity.class)}${num('Level','identity.level',lv,1,20)}${select('Background','identity.background',c.identity.background,bgs.map(x=>({value:x,label:x})))}${field('Alignment','identity.alignment',c.identity.alignment)}${field('Size','identity.size',c.identity.size)}</div>${raceKey==='Dragonborn'?select('Draconic ancestry','dragonAncestry',c.dragonAncestry||'Red',Object.keys(o.dragonAncestry||{}).map(x=>({value:x,label:x}))):''}${c.identity.class==='Paladin'&&lv>=2?`<label class="sheet-field"><span>Fighting Style</span><select data-select="fightingStyle"><option value="">Choose style</option>${styles.map(([v,l])=>`<option value="${v}" ${style===v?'selected':''}>${l}</option>`).join('')}</select></label>`:''}<div class="rule-summary">${o.classData?.[c.identity.class]?`<b>${esc(c.identity.class)}</b> · ${o.classData[c.identity.class].hitDie} · Saves: ${o.classData[c.identity.class].saves.map(x=>AL[x]).join(', ')} · ${o.classData[c.identity.class].spellcasting?'Spellcasting: '+AL[o.classData[c.identity.class].spellcasting]:'No spellcasting'}`:'Choose a class to link its rules.'}</div></div>
        <div class="sheet-card"><h2>Ability Scores</h2><small class="sheet-help">Base score → effective score after race/effects</small><div class="ability-score-grid">${A.map(a=>{const base=Number(c.abilityScores?.[a])||10,eff=d.abilityScores?.[a]??base,delta=eff-base;return `<label class="ability-score"><span>${AL[a]}</span><input type="number" min="1" max="30" data-ability="${a}" value="${base}"><small>${delta?`${base} ${sign(delta)} = ${eff}`:eff}</small><strong>${sign(d.abilityModifiers[a])}</strong></label>`}).join('')}</div></div>
        <div class="sheet-card"><h2>Skills & Proficiencies</h2><small class="sheet-help">PROF adds the proficiency bonus. MAST = expertise (double proficiency).</small><div class="proficiency-list">${Object.keys(SK).map(s=>{const r=skillRank(c,s);return `<div class="skill-row"><span class="skill-rank ${r}">${r==='expertise'?'★':r==='proficient'?'✓':'·'}</span><span>${SK[s]} <small>${AL[e.skills[s]]}</small></span><strong>${sign(d.skills[s])}</strong></div>`}).join('')}</div>${renderSkillChoice(c)}</div>
        <div class="sheet-card"><h2>Saving Throws</h2><div class="proficiency-list">${A.map(a=>{const p=(c.proficiencies?.savingThrows||[]).includes(a);return `<div class="proficiency-row"><span class="save-prof ${p?'active':''}">${p?'✓':'·'}</span><span>${AL[a]}</span><strong>${sign(d.savingThrows[a])}</strong></div>`}).join('')}</div></div>
      </section>
      <section class="sheet-column sheet-center">
        <div class="sheet-card sheet-core"><div class="sheet-big-stat"><span>HIT POINTS</span><div class="hp-editor"><input type="number" min="0" data-hp-current value="${hp.current}"><strong>/ ${hp.maximum}</strong></div><div class="sheet-hp-bar"><div class="sheet-hp-fill" style="width:${hpPct}%"></div></div><small>${hpPct}% · ${hp.current} current</small></div><div class="sheet-stat-pair"><span>Temporary HP</span><input class="inline-number" type="number" min="0" data-hp-temp value="${hp.temporary}"></div><div class="sheet-stat-pair"><span>Hit Dice</span><strong>${c.resources.hitDice?.current||0} / ${c.resources.hitDice?.maximum||0} ${esc(c.resources.hitDice?.die||'')}</strong></div><div class="sheet-stat-pair"><span>Speed</span><strong>${d.speed} ft.</strong></div><div class="sheet-stat-pair"><span>Initiative</span><strong>${sign(d.initiative)}</strong></div><div class="sheet-stat-pair"><span>Passive Perception</span><strong>${d.passivePerception}</strong></div><div class="sheet-stat-pair"><span>Passive Insight</span><strong>${d.passiveInsight}</strong></div><div class="sheet-stat-pair"><span>Passive Investigation</span><strong>${d.passiveInvestigation}</strong></div><div class="sheet-stat-pair"><span>Proficiency Bonus</span><strong>${sign(d.proficiencyBonus)}</strong></div></div>
        <div class="sheet-card"><h2>Death Saves & Inspiration</h2><div class="death-editor"><div><span>Successes</span><div>${[0,1,2].map(i=>`<button type="button" class="death-dot ${i<death.successes?'active':''}" data-death="success" data-index="${i}"></button>`).join('')}</div></div><div><span>Failures</span><div>${[0,1,2].map(i=>`<button type="button" class="death-dot failure ${i<death.failures?'active':''}" data-death="failure" data-index="${i}"></button>`).join('')}</div></div></div><button type="button" class="resource-toggle ${c.resources?.inspiration?'active':''}" data-inspiration>${c.resources?.inspiration?'★ Inspiration available':'☆ Inspiration unavailable'}</button></div>
        <div class="sheet-card"><h2>Defenses</h2><div class="sheet-detail"><span>Resistances</span><strong>${(d.defenses?.resistances||[]).map(esc).join(', ')||'—'}</strong></div><div class="sheet-detail"><span>Immunities</span><strong>${(d.defenses?.immunities||[]).map(esc).join(', ')||'—'}</strong></div><div class="sheet-detail"><span>Vulnerabilities</span><strong>${(d.defenses?.vulnerabilities||[]).map(esc).join(', ')||'—'}</strong></div></div>
        <div class="sheet-card"><h2>Spellcasting</h2>${renderSpellcasting(c)}</div>
        <div class="sheet-card"><h2>Resources</h2>${renderResources(c,d)}</div>
      </section>
      <section class="sheet-column sheet-right">
        <div class="sheet-card sheet-combat"><h2>Combat</h2><div class="combat-primary"><div><span>AC</span><strong>${d.armorClass}</strong></div><div><span>Speed</span><strong>${d.speed}</strong></div><div><span>Initiative</span><strong>${sign(d.initiative)}</strong></div></div><div class="sheet-detail"><span>Carrying capacity</span><strong>${capacity} lb</strong></div><div class="sheet-detail"><span>Carried weight</span><strong>${carried} lb</strong></div></div>
        <div class="sheet-card"><h2>Racial Traits</h2>${renderTraits(c,raceKey)}</div>
        <div class="sheet-card"><h2>Class & Subclass Features</h2>${renderFeatureSection(c,'class','Class')}${renderFeatureSection(c,'subclass','Subclass / Oath')||'<p class="sheet-empty">No subclass features linked.</p>'}</div>
        <div class="sheet-card"><h2>Background & Feats</h2>${renderFeatureSection(c,'background','Background')||'<p class="sheet-empty">Background features not yet linked.</p>'}${renderFeatureSection(c,'feat','Feats')||'<p class="sheet-empty">No feats linked.</p>'}</div>
        <div class="sheet-card"><h2>Equipment & Attacks</h2>${armor?`<div class="equipment-summary-row"><span>Armor</span><strong>${esc(armor.name)}</strong><small>${Number(armor.mechanics?.armorClass)||0} AC base</small></div>`:'<div class="equipment-summary-row"><span>Armor</span><strong>None</strong></div>'}${shield?`<div class="equipment-summary-row"><span>Shield</span><strong>${esc(shield.name)}</strong><small>+${Number(shield.mechanics?.armorBonus)||0} AC</small></div>`:'<div class="equipment-summary-row"><span>Shield</span><strong>None</strong></div>'}${items.filter(i=>(i.mechanics?.type||i.equipment?.type)==='weapon').map(i=>{const a=e.calculator.getWeaponAttackBonus(c,i),dm=(e.calculator.getWeaponDamage(c,i)||[]).map(x=>`${x.dice?.count||0}${x.dice?.die||''} ${x.type||''}${x.modifier?` ${sign(x.modifier)}`:''}`).join(' + ');return `<div class="weapon-entry"><div><strong>${esc(i.name)}</strong><small>${esc(i.mechanics?.attack?.type||'melee')}</small></div><div class="equipped-item-values"><b>${a==null?'—':sign(a)}</b><span>${esc(dm||'—')}</span></div></div>`}).join('')||'<p class="sheet-empty">No equipped weapons.</p>'}</div>
      </section>
    </main>`;
    bind();
  }

  function bind(){
    document.querySelectorAll('[data-select]').forEach(i=>i.addEventListener('change',()=>{const c=C(),p=i.dataset.select,v=i.value;c.choices=c.choices||{};if(p==='fightingStyle'){c.choices.fightingStyle=v;c.fightingStyle=v;}else if(p==='dragonAncestry'){c.dragonAncestry=v;}else if(p.startsWith('identity.'))e.applyCharacterSelection(c,p.slice(9),v);if(e.syncCharacterRules)e.syncCharacterRules(c);e.saveCharacter(c);render();}));
    document.querySelectorAll('[data-field]').forEach(i=>i.addEventListener('change',()=>{const c=C(),p=i.dataset.field.split('.');let x=c;p.slice(0,-1).forEach(k=>x=x[k]);x[p[p.length-1]]=i.type==='number'?Number(i.value):i.value;if(e.syncCharacterRules)e.syncCharacterRules(c);e.saveCharacter(c);render();}));
    document.querySelectorAll('[data-ability]').forEach(i=>i.addEventListener('change',()=>{const c=C();c.abilityScores[i.dataset.ability]=Math.max(1,Math.min(30,Number(i.value)||10));if(e.syncCharacterRules)e.syncCharacterRules(c);e.saveCharacter(c);render();}));
    document.querySelectorAll('[data-hp-current]').forEach(i=>i.addEventListener('change',()=>{const c=C();hpInit(c);c.resources.hp.current=Math.max(0,Math.min(c.resources.hp.maximum,Number(i.value)||0));e.saveCharacter(c);render();}));
    document.querySelectorAll('[data-hp-temp]').forEach(i=>i.addEventListener('change',()=>{const c=C();hpInit(c);c.resources.hp.temporary=Math.max(0,Number(i.value)||0);e.saveCharacter(c);render();}));
    document.querySelectorAll('[data-class-skill]').forEach(b=>b.addEventListener('click',()=>{const c=C();if(e.toggleClassSkill)e.toggleClassSkill(c,b.dataset.classSkill);render();}));
    document.querySelectorAll('[data-resource]').forEach(b=>b.addEventListener('click',()=>{const c=C(),rs=e.getFeatureResources?e.getFeatureResources(c):[],r=rs.find(x=>x.id===b.dataset.resource);if(!r)return;setResource(c,r,resourceCurrent(c,r)+Number(b.dataset.delta));}));
    document.querySelectorAll('[data-inspiration]').forEach(b=>b.addEventListener('click',()=>{const c=C();c.resources.inspiration=!c.resources.inspiration;e.saveCharacter(c);render();}));
    document.querySelectorAll('[data-death]').forEach(b=>b.addEventListener('click',()=>{const c=C();c.resources.deathSaves=c.resources.deathSaves||{successes:0,failures:0};const k=b.dataset.death==='success'?'successes':'failures',n=Number(b.dataset.index)+1;c.resources.deathSaves[k]=c.resources.deathSaves[k]===n?n-1:n;e.saveCharacter(c);render();}));
    document.querySelectorAll('[data-slot]').forEach(b=>b.addEventListener('click',()=>{const c=C(),slot=c.resources.spellSlots?.[b.dataset.slot];if(!slot)return;slot.current=Math.min(slot.maximum,Math.max(0,slot.current+Number(b.dataset.delta)));e.saveCharacter(c);render();}));
  }

  window.showCharacterSheet=render;
  window.showCharacterHome=()=>window.location.reload();
  window.refreshDndHomeHP=renderHomeHPBar;
  document.addEventListener('DOMContentLoaded',renderHomeHPBar);
  setTimeout(renderHomeHPBar,50);
})();
