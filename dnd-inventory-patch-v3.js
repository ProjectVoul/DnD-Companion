/* Inventory presentation correction: Equipment contains all equipable categories; Miscellaneous is for true other items. */
(() => {
  'use strict';
  const E=window.DnDEngineV3||window.DnDEngineV2;if(!E)return;
  const type=i=>i?.mechanics?.type||i?.equipment?.type||'other';
  function normalize(){const main=document.querySelector('main');if(!main)return;const cards=[...main.querySelectorAll('.card')];const misc=cards.find(c=>c.querySelector('h2')?.textContent==='Miscellaneous'),equipment=cards.find(c=>c.querySelector('h2')?.textContent==='Equipment');if(!misc||!equipment)return;['focus','tool'].forEach(t=>{let group=equipment.querySelector(`.equip-group[data-equip-group="${t}"]`);if(!group){group=document.createElement('div');group.className='equip-group';group.dataset.equipGroup=t;group.innerHTML=`<h3>${t==='focus'?'Spellcasting Focus':'Tools'}</h3>`;equipment.appendChild(group);}const rows=[...misc.querySelectorAll('[data-item]')];rows.forEach(row=>{const i=E.state.items[Number(row.dataset.item)];if(i&&type(i)===t)group.appendChild(row);});});}
  const observer=new MutationObserver(()=>normalize());observer.observe(document.body,{childList:true,subtree:true});
  normalize();window.DnDInventoryPatchV3={normalize};
})();