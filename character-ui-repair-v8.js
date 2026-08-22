/* D&D Companion — UI repair v8
 * Restores inventory add/edit flows and makes skill P/M controls unambiguous.
 */
(() => {
  'use strict';
  const E=()=>window.DnDCharacterEngine;
  const APP=()=>document.getElementById('app');
  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));
  const n=v=>Number.isFinite(Number(v))?Number(v):0;
  const TYPES=[['armor','Armor','🛡️'],['weapon','Weapons','⚔️'],['shield','Shields','🛡️'],['focus','Focus','✝️'],['accessory','Accessories','💍']];
  const MISC_ICON='📦';
  const skillNames=['athletics','acrobatics','sleightOfHand','stealth','arcana','history','investigation','nature','religion','animalHandling','insight','medicine','perception','survival','deception','intimidation','performance','persuasion'];
  const get=()=>{const e=E(),c=e.getLiveCharacter?e.getLiveCharacter():e.loadCharacter();if(e.syncCharacterRules)e.syncCharacterRules(c);if(e.normalizeCharacter)e.normalizeCharacter(c);return c;};
  const save=c=>E().saveLiveCharacter?E().saveLiveCharacter(c):E().saveCharacter(c);
  const typeOf=i=>i?.mechanics?.type||i?.equipment?.type||'other';
  const isEquipment=i=>i?.inventorySection==='equipment'||['armor','weapon','shield','focus','accessory'].includes(typeOf(i));
  const id=()=>`item-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

  function itemEditor(item=null, defaults={section:'miscellaneous',type:'other'}){
    const i=item||{id:id(),name:'',description:'',quantity:1,weight:0,inventorySection:defaults.section,equipment:{type:defaults.type,equipped:false},mechanics:{type:defaults.type}};
    const type=typeOf(i), mech=i.mechanics||{}, attack=mech.attack||{}, dmg=(mech.damage||[])[0]||{};
    const overlay=document.createElement('div');overlay.className='inventory-editor-overlay';
    overlay.innerHTML=`<div class="inventory-editor-modal">
      <button class="inventory-editor-close" type="button">×</button><h2>${item?'Edit Item':'Add Item'}</h2>
      <div class="inventory-editor-grid">
        <label><span>Name</span><input id="ie-name" value="${esc(i.name)}" placeholder="Item name"></label>
        <label><span>Section</span><select id="ie-section"><option value="equipment" ${i.inventorySection==='equipment'?'selected':''}>Equipment</option><option value="miscellaneous" ${i.inventorySection!=='equipment'?'selected':''}>Miscellaneous</option></select></label>
        <label><span>Type</span><select id="ie-type"><option value="other" ${type==='other'?'selected':''}>Miscellaneous</option>${TYPES.map(([v,l])=>`<option value="${v}" ${type===v?'selected':''}>${l}</option>`).join('')}</select></label>
        <label><span>Quantity</span><input id="ie-qty" type="number" min="0" step="1" value="${Math.max(0,n(i.quantity)||1)}"></label>
        <label><span>Weight (lb)</span><input id="ie-weight" type="number" min="0" step="0.1" value="${n(i.weight)}"></label>
        <label class="ie-check"><input id="ie-equipped" type="checkbox" ${i.equipment?.equipped?'checked':''}> Equipped</label>
      </div>
      <label><span>Description</span><textarea id="ie-description" rows="3" placeholder="Description">${esc(i.description)}</textarea></label>
      <div id="ie-weapon-fields" class="inventory-editor-subsection ${type==='weapon'?'':'hidden'}">
        <h3>Weapon</h3><div class="inventory-editor-grid">
          <label><span>Attack bonus</span><input id="ie-attack-bonus" type="number" value="${n(attack.bonus)}"></label>
          <label><span>Ability</span><select id="ie-ability"><option value="strength" ${(attack.ability||'strength')==='strength'?'selected':''}>Strength</option><option value="dexterity" ${attack.ability==='dexterity'?'selected':''}>Dexterity</option></select></label>
          <label><span>Damage dice</span><input id="ie-dice" value="${dmg.dice?.count&&dmg.dice?.die?`${dmg.dice.count}${dmg.dice.die}`:'1d8'}" placeholder="1d8"></label>
          <label><span>Damage type</span><select id="ie-damage-type">${['slashing','piercing','bludgeoning','acid','cold','fire','force','lightning','necrotic','poison','psychic','radiant','thunder'].map(v=>`<option value="${v}" ${String(dmg.type||'slashing')===v?'selected':''}>${v}</option>`).join('')}</select></label>
        </div>
      </div>
      <div id="ie-armor-fields" class="inventory-editor-subsection ${type==='armor'?'':'hidden'}"><h3>Armor</h3><label><span>Armor Class</span><input id="ie-ac" type="number" min="0" value="${n(mech.armorClass)||18}"></label></div>
      <div class="inventory-editor-actions"><button type="button" class="inventory-cancel">Cancel</button>${item?'<button type="button" class="inventory-delete">Delete</button>':''}<button type="button" class="inventory-save">${item?'Save changes':'Add item'}</button></div>
    </div>`;
    document.body.appendChild(overlay);
    const close=()=>overlay.remove();overlay.querySelector('.inventory-editor-close').onclick=close;overlay.querySelector('.inventory-cancel').onclick=close;
    const typeSelect=overlay.querySelector('#ie-type'),sectionSelect=overlay.querySelector('#ie-section');
    const syncType=()=>{const t=typeSelect.value;overlay.querySelector('#ie-weapon-fields').classList.toggle('hidden',t!=='weapon');overlay.querySelector('#ie-armor-fields').classList.toggle('hidden',t!=='armor');if(t!=='other'&&t!=='accessory'&&sectionSelect.value!=='equipment')sectionSelect.value='equipment';};
    typeSelect.onchange=syncType;syncType();
    overlay.querySelector('.inventory-save').onclick=()=>{
      const c=get(),name=overlay.querySelector('#ie-name').value.trim();if(!name){alert('Enter an item name.');return;}
      const section=sectionSelect.value,t=typeSelect.value;
      const out=item?((c.items||[]).find(x=>String(x.id)===String(item.id))||item):{id:id()};
      out.name=name;out.description=overlay.querySelector('#ie-description').value.trim();out.quantity=Math.max(0,Math.floor(n(overlay.querySelector('#ie-qty').value)||0));out.weight=Math.max(0,n(overlay.querySelector('#ie-weight').value));out.inventorySection=section;
      out.equipment=out.equipment||{};out.equipment.type=t;out.equipment.equipped=overlay.querySelector('#ie-equipped').checked;
      out.mechanics=out.mechanics||{};out.mechanics.type=t;
      if(t==='weapon'){
        const raw=overlay.querySelector('#ie-dice').value.trim().match(/^(\d+)d(\d+)$/i)||[null,1,8];
        out.mechanics=E().createWeaponMechanics({...out.mechanics,type:'weapon',attack:{type:'melee',ability:overlay.querySelector('#ie-ability').value,proficient:true,bonus:n(overlay.querySelector('#ie-attack-bonus').value)},damage:[{dice:{count:Number(raw[1])||1,die:`d${Number(raw[2])||8}`},type:overlay.querySelector('#ie-damage-type').value,ability:null,modifier:0}]});
      } else if(t==='armor') out.mechanics=E().createArmorMechanics({...out.mechanics,type:'armor',armorClass:n(overlay.querySelector('#ie-ac').value)||18,category:out.mechanics.category||'heavy',dexterity:out.mechanics.dexterity||{applies:false,maximum:null}});
      else if(t==='shield') out.mechanics=E().createShieldMechanics({...out.mechanics,type:'shield'});
      if(!item)c.items=(c.items||[]).concat(out);save(c);close();renderInventorySection(section,t);
    };
    overlay.querySelector('.inventory-delete')?.addEventListener('click',()=>{if(!confirm(`Delete ${i.name}?`))return;const c=get();c.items=(c.items||[]).filter(x=>String(x.id)!==String(item.id));save(c);close();renderInventorySection(item.inventorySection==='equipment'?'equipment':'miscellaneous');});
  }

  function renderInventory(){
    const c=get(),items=c.items||[],eq=items.filter(isEquipment),misc=items.filter(i=>!isEquipment(i));
    APP().innerHTML=`<header class="app-header"><button class="back-button" onclick="goHome()">← Back</button><h1>Inventory</h1><p>Equipment and miscellaneous items</p></header><main><div class="inventory-choice-grid">
      <button class="inventory-choice" onclick="showEquipment()"><span>⚔️</span><div><strong>Equipment</strong><small>${eq.length} item${eq.length===1?'':'s'}</small></div><b>›</b></button>
      <button class="inventory-choice" onclick="showMiscellaneous()"><span>📦</span><div><strong>Miscellaneous</strong><small>${misc.length} item${misc.length===1?'':'s'}</small></div><b>›</b></button>
    </div></main>`;
  }
  function renderInventorySection(section,typeFilter=null){
    const c=get(),items=(c.items||[]).filter(i=>section==='equipment'?isEquipment(i):!isEquipment(i));
    let groups=section==='equipment'?TYPES.map(([t,l,ic])=>({t,l,ic,items:items.filter(i=>typeOf(i)===t)})).filter(g=>g.items.length):[{t:'other',l:'Miscellaneous',ic:MISC_ICON,items}];
    const title=section==='equipment'?'Equipment':'Miscellaneous';
    APP().innerHTML=`<header class="app-header"><button class="back-button" onclick="renderInventory()">← Inventory</button><div class="inventory-title-row"><div><h1>${title}</h1><p>${section==='equipment'?'Organized by equipment type':'Consumables, treasures and other items'}</p></div><button class="inventory-add-button" onclick="itemEditor(null,{section:'${section}',type:'${typeFilter|| (section==='equipment'?'weapon':'other')}'})">＋ Add item</button></div></header><main><div class="equipment-group-list">${groups.length?groups.map(g=>`<section class="equipment-group"><div class="equipment-group-header static"><span class="equipment-group-icon">${g.ic}</span><div><strong>${g.l}</strong><small>${g.items.length} item${g.items.length===1?'':'s'}</small></div></div>${g.items.map(itemCard).join('')}</section>`).join(''):'<p class="empty-message">No items here.</p>'}</div></main>`;
  }
  function itemCard(i){const t=typeOf(i),icon=TYPES.find(g=>g[0]===t)?.[2]||MISC_ICON;return `<div class="equipment-group-item ${i.equipment?.equipped?'equipped':''}"><span class="equipment-item-icon">${i.icon||icon}</span><span class="equipment-item-main"><strong>${esc(i.name)}</strong><small>×${Math.max(1,n(i.quantity)||1)}${i.equipment?.equipped?' · Equipped':''}${i.magical||i.tags?.includes('Magical')?' · ✨ Magical':''}</small></span><button class="inventory-edit-inline" type="button" onclick="itemEditorById('${esc(i.id)}')">Edit</button><span class="equipment-item-arrow">›</span></div>`;}
  function itemEditorById(id){const c=get(),i=(c.items||[]).find(x=>String(x.id)===String(id));if(i)itemEditor(i,{section:i.inventorySection||'miscellaneous',type:typeOf(i)});}
  window.renderInventory=renderInventory;window.showInventory=renderInventory;window.showEquipment=()=>renderInventorySection('equipment');window.showMiscellaneous=()=>renderInventorySection('miscellaneous');window.itemEditor=itemEditor;window.itemEditorById=itemEditorById;

  function repairSkillStateOnce(){
    const c=get(), skills=c.proficiencies?.skills||{};let prof=0;skillNames.forEach(s=>{if(skills[s]?.proficiency)prof++;});
    if(prof>=17&&!localStorage.getItem('dndCompanionSkillRepairV8')){
      const intended=['stealth','animalHandling','survival','deception','intimidation','performance','persuasion'];
      skillNames.forEach(s=>{skills[s]={proficiency:intended.includes(s),expertise:s==='intimidation'};});
      c.proficiencies.skills=skills;save(c);localStorage.setItem('dndCompanionSkillRepairV8','1');
    }
  }
  function decorateSkillButtons(){document.querySelectorAll('.character-sheet .skill-check').forEach(b=>{const kind=b.dataset.skillAction;b.textContent=b.classList.contains('active')?(kind==='expertise'?'★':'✓'):(kind==='expertise'?'M':'P');b.setAttribute('aria-label',kind==='expertise'?'Toggle expertise':'Toggle proficiency');b.title=kind==='expertise'?'M — Expertise':'P — Proficiency';});}
  function handleSkillClick(ev){const b=ev.target.closest?.('.character-sheet [data-skill-action]');if(!b)return;ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();const c=get(),s=b.dataset.skill,p=c.proficiencies.skills[s]||{};if(b.dataset.skillAction==='proficiency'){p.proficiency=!p.proficiency;if(!p.proficiency)p.expertise=false;}else{p.expertise=!p.expertise;if(p.expertise)p.proficiency=true;}c.proficiencies.skills[s]=p;save(c);window.showCharacterSheet();setTimeout(decorateSkillButtons,0);}
  document.addEventListener('click',handleSkillClick,true);
  const observer=new MutationObserver(()=>{if(document.querySelector('.character-sheet .skill-check'))decorateSkillButtons();});observer.observe(document.body,{childList:true,subtree:true});
  const oldShow=window.showCharacterSheet;window.showCharacterSheet=function(){repairSkillStateOnce();oldShow();setTimeout(decorateSkillButtons,0);};
  repairSkillStateOnce();
})();