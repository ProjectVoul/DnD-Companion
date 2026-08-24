/* Class resource presentation. */
(() => {
  'use strict';
  const E=window.DnDClassResourcesV3; if(!E)return;
  const render=()=>{const main=document.querySelector('main');if(!main||!document.querySelector('.stat-card')||main.querySelector('[data-class-resources]'))return;const resources=E.resources();if(!resources.length)return;const card=document.createElement('section');card.className='card';card.dataset.classResources='1';card.innerHTML=`<div class="section-title"><h2>Class Resources</h2></div><div class="resource-grid">${resources.map(r=>`<div><span>${String(r.name).replace(/^./,x=>x.toUpperCase())} · ${r.classId}</span><b>${r.maximum}</b></div>`).join('')}</div>`;main.appendChild(card);};
  const o=new MutationObserver(render);o.observe(document.body,{childList:true,subtree:true});render();
})();