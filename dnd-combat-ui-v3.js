/* Combat presentation: include ability modifier in primary weapon damage. */
(() => {
  'use strict';
  const E=window.DnDCombatV3;if(!E)return;
  const signed=n=>Number(n)>0?`+${n}`:String(n);
  let observer;
  const render=()=>{observer?.disconnect();document.querySelectorAll('[data-item]').forEach(row=>{const i=window.DnDEngineV3?.state?.items?.[Number(row.dataset.item)];if(!i||i.mechanics?.type!=='weapon')return;const a=E.attack(window.DnDEngineV3.state,i),small=row.querySelector('.item-main small:nth-of-type(2)');if(!a||!small)return;const text=`${signed(a.bonus)} to hit · ${a.damage.map((d,idx)=>`${d.dice.count}${d.dice.die}${idx===0&&d.modifier?` ${signed(d.modifier)}`:''} ${d.type}`).join(' + ')} · ${a.attacks} attack${a.attacks===1?'':'s'}`;if(small.textContent!==text)small.textContent=text;});observer.observe(document.body,{childList:true,subtree:true});};
  observer=new MutationObserver(render);render();
})();