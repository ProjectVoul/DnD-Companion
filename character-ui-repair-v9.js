/* D&D Companion — canonical UI integration repair v9
 * One UI bridge only: inventory hierarchy and presentation decorators.
 * Skill state changes remain owned by Character Sheet v6; this file does not add a second skill handler.
 */
(() => {
  'use strict';
  const E=()=>window.DnDCharacterEngine, APP=()=>document.getElementById('app');
  if(!E||!APP)return;
  const n=v=>Number.isFinite(Number(v))?Number(v):0;
  const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const GROUPS=[['armor','Armor','🛡️'],['weapon','Weapons','⚔️'],['shield','Shields','🛡️'],['focus','Focus','✝️'],['accessory','Accessories','💍']];
  const typeOf=i=>i?.mechanics?.type||i?.equipment?.type||'other';
  const equipmentItems=c=>(c.items||[]).filter(i=>GROUPS.some(g=>g[0]===typeOf(i)));
  const miscItems=c=>(c.items||[]).filter(i=>!GROUPS.some(g=>g[0]===typeOf(i)));
  const get=()=>{const c=E().getLiveCharacter?E().getLiveCharacter():E().loadCharacter();if(E().syncCharacterRules)E().syncCharacterRules(c);if(E().normalizeCharacter)E().normalizeCharacter(c);return c;};
  const save=c=>E().saveLiveCharacter?E().saveLiveCharacter(c):E().saveCharacter(c);
  function itemCard(i){const t=typeOf(i),g=GROUPS.find(x=>x[0]===t),icon=g?.[2]||'📦';return `<button class="equipment-group-item ${i.equipment?.equipped?'equipped':''}" type="button" onclick="showInventoryItem('${esc(i.id)}')"><span class="equipment-item-icon">${i.icon||icon}</span><span class="equipment-item-main"><strong>${esc(i.name||'Unnamed item')}</strong><small>×${Math.max(1,n(i.quantity)||1)}${i.equipment?.equipped?' · Equipped':''}${i.magical?' · ✨ Magical':''}</small></span><span class="equipment-item-arrow">›</span></button>`;}
  function renderEquipment(){const c=get();APP().innerHTML=`<header class="app-header"><button class="back-button" type="button" onclick="showInventory()">← Inventory</button><div class="inventory-title-row"><div><h1>Equipment</h1><p>Organized by equipment type</p></div><button class="inventory-add-button" type="button" onclick="openEquipmentItemForm()">＋ Add Item</button></div></header><main><div class="equipment-group-list">${GROUPS.map(([t,l,ic])=>{const list=equipmentItems(c).filter(i=>typeOf(i)===t);return `<section class="equipment-group"><button class="equipment-group-header" type="button" onclick="toggleEquipmentGroup('${t}')"><span class="equipment-group-icon">${ic}</span><div><strong>${l}</strong><small>${list.length} item${list.length===1?'':'s'}</small></div><span class="equipment-group-chevron">⌄</span></button><div class="equipment-group-items" id="equipment-group-${t}">${list.length?list.map(itemCard).join(''):'<p class="equipment-group-empty">No items in this section.</p>'}</div></section>`;}).join('')}</div></main>`;}
  function renderMisc(){const c=get(),items=miscItems(c);APP().innerHTML=`<header class="app-header"><button class="back-button" type="button" onclick="showInventory()">← Inventory</button><div class="inventory-title-row"><div><h1>Miscellaneous</h1><p>Consumables, treasures and other items</p></div><button class="inventory-add-button" type="button" onclick="openMiscItemForm()">＋ Add Item</button></div></header><main><section class="equipment-group"><div class="equipment-group-header static"><span class="equipment-group-icon">📦</span><div><strong>Miscellaneous</strong><small>${items.length} item${items.length===1?'':'s'}</small></div></div>${items.length?items.map(itemCard).join(''):'<p class="equipment-group-empty">No items here.</p>'}</section></main>`;}
  function renderInventory(){const c=get(),eq=equipmentItems(c),misc=miscItems(c);APP().innerHTML=`<header class="app-header"><button class="back-button" type="button" onclick="goHome()">← Back</button><h1>Inventory</h1><p>Equipment and miscellaneous items</p></header><main><div class="inventory-choice-grid"><button class="inventory-choice" type="button" onclick="showEquipment()"><span>⚔️</span><div><strong>Equipment</strong><small>${eq.length} item${eq.length===1?'':'s'}</small></div><b>›</b></button><button class="inventory-choice" type="button" onclick="showMiscellaneous()"><span>📦</span><div><strong>Miscellaneous</strong><small>${misc.length} item${misc.length===1?'':'s'}</small></div><b>›</b></button></div></main>`;}
  const originalOpen=window.openItemForm,originalSave=window.saveItemForm;
  window.openEquipmentItemForm=()=>{window.__inventoryFormTarget='equipment';if(typeof originalOpen==='function')originalOpen();};
  window.openMiscItemForm=()=>{window.__inventoryFormTarget='miscellaneous';if(typeof originalOpen==='function')originalOpen();};
  if(typeof originalSave==='function')window.saveItemForm=id=>{const target=window.__inventoryFormTarget||'miscellaneous';window.__inventoryFormTarget=null;originalSave(id);const c=get(),i=id?(c.items||[]).find(x=>String(x.id)===String(id)):(c.items||[]).slice(-1)[0];if(i){const t=typeOf(i);if(target==='equipment'&&GROUPS.some(g=>g[0]===t))i.inventorySection='equipment';if(target==='miscellaneous'&&t==='other')i.inventorySection='miscellaneous';save(c);target==='equipment'?renderEquipment():renderMisc();}};
  window.showInventory=renderInventory;window.showEquipment=renderEquipment;window.showMiscellaneous=renderMisc;window.showInventorySection=(section,type='all')=>section==='equipment'?renderEquipment():renderMisc();
  window.toggleEquipmentGroup=t=>document.getElementById(`equipment-group-${t}`)?.classList.toggle('collapsed');

  function decorateSkills(){document.querySelectorAll('.character-sheet .skill-row').forEach(row=>{const buttons=row.querySelectorAll('[data-skill-action]');if(buttons.length<2)return;buttons[0].textContent=buttons[0].classList.contains('active')?'✓':'P';buttons[1].textContent=buttons[1].classList.contains('active')?'★':'M';buttons[0].title='P — Proficiency';buttons[1].title='M — Expertise';});}
  function decorateWeapons(){document.querySelectorAll('.character-sheet .weapon-entry').forEach(row=>{if(row.querySelector('.weapon-damage-v9'))return;const name=row.querySelector('strong')?.textContent?.trim();if(!name||!E().calculator?.getWeaponDamage)return;const c=get(),item=(c.items||[]).find(i=>i.name===name&&i.mechanics?.type==='weapon');if(!item)return;const damage=E().calculator.getWeaponDamage(c,item).map(d=>`${d.dice?.count||0}${d.dice?.die||''} ${d.type||''}${d.modifier?` ${d.modifier>0?'+':''}${d.modifier}`:''}`).join(' + ');if(!damage)return;const box=row.querySelector('.equipped-item-values');if(box){const s=document.createElement('span');s.className='weapon-damage-v9';s.textContent=damage;box.appendChild(s);}});}
  const originalSheet=window.showCharacterSheet;
  if(typeof originalSheet==='function')window.showCharacterSheet=()=>{originalSheet();decorateSkills();decorateWeapons();};

  // iOS/touch fallback: execute the button's native click path once on touch devices.
  // The normal click event remains the canonical path for mouse/trackpad input.
  let touchHandledAt=0;
  document.addEventListener('touchend',ev=>{
    const target=ev.target?.closest?.('button,[role="button"],input,select');
    if(!target||target.disabled)return;
    touchHandledAt=Date.now();
    ev.preventDefault();
    if(target.tagName==='BUTTON'||target.getAttribute('role')==='button')target.click();
  },{passive:false});
  document.addEventListener('click',ev=>{if(Date.now()-touchHandledAt<500)ev.stopImmediatePropagation();},true);
})();
