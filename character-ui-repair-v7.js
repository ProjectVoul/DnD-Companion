/* D&D Companion — UI repair v7
 * Inventory is split into Equipment / Miscellaneous.
 * Skills use real Character Engine proficiency/expertise state.
 */
(() => {
  'use strict';
  const E=()=>window.DnDCharacterEngine;
  const APP=()=>document.getElementById('app');
  const n=v=>Number.isFinite(Number(v))?Number(v):0;
  const esc=v=>String(v??'').replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));
  const GROUPS=[['armor','Armor','🛡️'],['weapon','Weapons','⚔️'],['shield','Shields','🛡️'],['focus','Focus','✝️'],['accessory','Accessories','💍']];
  const typeOf=i=>i?.mechanics?.type||i?.equipment?.type||'other';
  const inventorySection=i=>{
    if(i?.inventorySection==='equipment'||i?.inventorySection==='miscellaneous') return i.inventorySection;
    return GROUPS.some(g=>g[0]===typeOf(i))?'equipment':'miscellaneous';
  };
  const get=()=>{const e=E(),c=e.getLiveCharacter?e.getLiveCharacter():e.loadCharacter();if(e.syncCharacterRules)e.syncCharacterRules(c);if(e.normalizeCharacter)e.normalizeCharacter(c);return c;};
  const save=c=>E().saveLiveCharacter?E().saveLiveCharacter(c):E().saveCharacter(c);

  function itemIcon(i){const g=GROUPS.find(x=>x[0]===typeOf(i));return g?.[2]||'📦';}
  function itemCard(i){const eq=i.equipment?.equipped;return `<button class="equipment-group-item ${eq?'equipped':''}" onclick="showEquipmentItem('${esc(i.id)}')"><span class="equipment-item-icon">${itemIcon(i)}</span><span class="equipment-item-main"><strong>${esc(i.name||'Unnamed item')}</strong><small>×${n(i.quantity)||1}${eq?' · Equipped':''}${i.magical||i.tags?.includes('Magical')?' · ✨ Magical':''}</small></span><span class="equipment-item-arrow">›</span></button>`;}

  function renderRoot(){
    const c=get(),items=c.items||[];
    const equipment=items.filter(i=>inventorySection(i)==='equipment');
    const misc=items.filter(i=>inventorySection(i)==='miscellaneous');
    APP().innerHTML=`<header class="app-header"><button class="back-button" onclick="goHome()">← Back</button><h1>Inventory</h1><p>Organized by purpose</p></header><main><div class="inventory-root-list"><button class="inventory-root-card" onclick="showInventory('equipment')"><span class="inventory-root-icon">⚔️</span><span><strong>Equipment</strong><small>${equipment.length} item${equipment.length===1?'':'s'}</small></span><span>›</span></button><button class="inventory-root-card" onclick="showInventory('miscellaneous')"><span class="inventory-root-icon">📦</span><span><strong>Miscellaneous</strong><small>${misc.length} item${misc.length===1?'':'s'}</small></span><span>›</span></button></div></main>`;
  }

  function renderEquipment(){
    const c=get(),items=(c.items||[]).filter(i=>inventorySection(i)==='equipment');
    APP().innerHTML=`<header class="app-header"><button class="back-button" onclick="showInventory()">← Inventory</button><h1>Equipment</h1><p>Organized by equipment type</p></header><main><div class="equipment-group-list">${GROUPS.map(([type,label,icon])=>{const list=items.filter(i=>typeOf(i)===type);return `<section class="equipment-group"><button class="equipment-group-header" onclick="toggleEquipmentGroup('${type}')"><span class="equipment-group-icon">${icon}</span><div><strong>${label}</strong><small>${list.length} item${list.length===1?'':'s'}</small></div><span class="equipment-group-chevron">⌄</span></button><div class="equipment-group-items" id="equipment-group-${type}">${list.length?list.map(itemCard).join(''):'<p class="equipment-group-empty">No items in this section.</p>'}</div></section>`;}).join('')}</div></main>`;
  }

  function renderMisc(){
    const c=get(),items=(c.items||[]).filter(i=>inventorySection(i)==='miscellaneous');
    APP().innerHTML=`<header class="app-header"><button class="back-button" onclick="showInventory()">← Inventory</button><h1>Miscellaneous</h1><p>Consumables, treasures and other items</p></header><main><section class="equipment-group"><div class="equipment-group-header static"><span class="equipment-group-icon">📦</span><div><strong>Miscellaneous</strong><small>${items.length} item${items.length===1?'':'s'}</small></div></div><div class="equipment-group-items">${items.length?items.map(itemCard).join(''):'<p class="equipment-group-empty">No items in this section.</p>'}</div></section></main>`;
  }

  window.showInventory=view=>view==='equipment'?renderEquipment():view==='miscellaneous'?renderMisc():renderRoot();
  window.showEquipment=renderEquipment;
  window.toggleEquipmentGroup=type=>document.getElementById(`equipment-group-${type}`)?.classList.toggle('collapsed');
  window.showEquipmentItem=id=>{
    const c=get(),i=(c.items||[]).find(x=>String(x.id)===String(id));if(!i)return;
    const modal=document.createElement('div');modal.className='equipment-detail-overlay';
    modal.innerHTML=`<div class="equipment-detail-modal"><button class="equipment-detail-close" onclick="this.closest('.equipment-detail-overlay').remove()">×</button><div class="equipment-detail-icon">${itemIcon(i)}</div><h2>${esc(i.name)}</h2><p class="equipment-detail-type">${esc(typeOf(i)==='other'?'Miscellaneous':(GROUPS.find(g=>g[0]===typeOf(i))?.[1]||'Item'))}</p>${i.description?`<p>${esc(i.description)}</p>`:''}<div class="equipment-detail-grid"><div><small>Quantity</small><strong>${n(i.quantity)||1}</strong></div><div><small>Weight</small><strong>${n(i.weight)} kg</strong></div><div><small>Status</small><strong>${i.equipment?.equipped?'Equipped':'Not equipped'}</strong></div></div><button class="equipment-equip-button" onclick="toggleEquipmentEquip('${esc(i.id)}')">${i.equipment?.equipped?'Unequip':'Equip'}</button></div>`;
    document.body.appendChild(modal);
  };
  window.toggleEquipmentEquip=id=>{const c=get(),i=(c.items||[]).find(x=>String(x.id)===String(id));if(!i)return;i.equipment=i.equipment||{};i.equipment.equipped=!i.equipment.equipped;save(c);document.querySelector('.equipment-detail-overlay')?.remove();window.showInventory(inventorySection(i));};

  // The sheet's existing listener is a normal bubbling listener. Capture here so
  // these controls cannot fall through to a cosmetic-only handler.
  document.addEventListener('click',ev=>{
    const btn=ev.target.closest?.('[data-skill-action][data-skill]');
    if(!btn)return;
    ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();
    const c=get(),skill=btn.dataset.skill,action=btn.dataset.skillAction;
    c.proficiencies=c.proficiencies||{};c.proficiencies.skills=c.proficiencies.skills||{};
    const current=c.proficiencies.skills[skill]||{};
    const rank=current.expertise?'expertise':current.proficiency?'proficient':'none';
    let next=rank;
    if(action==='proficiency') next=rank==='none'?'proficient':'none';
    if(action==='expertise') next=rank==='expertise'?'proficient':'expertise';
    c.proficiencies.skills[skill]=next==='none'?{}:{proficiency:true,expertise:next==='expertise'};
    save(c);
    if(window.showCharacterSheet)window.showCharacterSheet();
  },true);
})();
