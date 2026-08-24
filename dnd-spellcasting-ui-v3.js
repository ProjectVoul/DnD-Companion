/* Spellcasting state presentation: known/prepared/spellbook are distinct. */
(() => {
  'use strict';
  const R=window.DnDSpellcastingRulesV3;if(!R)return;
  const render=()=>{const main=document.querySelector('main');if(!main||!main.querySelector('.spell-summary'))return;let card=main.querySelector('[data-spell-rules]');if(!card){card=document.createElement('section');card.className='card';card.dataset.spellRules='1';main.appendChild(card);}const rules=R.spellRules();card.innerHTML=`<div class="section-title"><h2>Spellcasting limits</h2></div>${Object.values(rules).map(r=>`<div class="list"><div><span>${r.classId}${r.spellbookMinimum!=null?' · Spellbook':''}</span><b>${r.usesPreparation?`Prepared ${r.preparedCount}`:''}${r.usesKnown?`${r.usesPreparation?' · ':''}Known ${r.knownCount}`:''}${r.spellbookMinimum!=null?` · Book ≥ ${r.spellbookMinimum}`:''}</b></div></div>`).join('')}`;};
  const o=new MutationObserver(render);o.observe(document.body,{childList:true,subtree:true});render();
})();