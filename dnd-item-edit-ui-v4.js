/* Inventory edit affordance. */
(() => {
  'use strict';
  let observer;
  const sync=()=>{
    observer?.disconnect();
    document.querySelectorAll('.item-row[data-item]').forEach(row=>{
      if(row.querySelector('[data-edit-item]'))return;
      const idx=row.dataset.item;
      const actions=row.querySelector('.item-actions');
      if(!actions)return;
      const b=document.createElement('button');b.type='button';b.textContent='Edit';b.dataset.editItem=idx;actions.insertBefore(b,actions.firstChild);
    });
    observer=new MutationObserver(sync);observer.observe(document.body,{childList:true,subtree:true});
  };
  observer=new MutationObserver(sync);sync();
})();
