/* D&D Companion v4 runtime safety layer.
 * UI events delegate all rest calculations to the rules engine.
 */
(() => {
  'use strict';
  const E=window.DnDEngineV3||window.DnDEngineV2;
  if(!E)return;
  const num=v=>Number.isFinite(Number(v))?Number(v):0;

  document.addEventListener('click',event=>{
    const button=event.target.closest?.('[data-action="long-rest"],[data-action="short-rest"]');
    if(!button)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const c=E.state;
    if(button.dataset.action==='long-rest')E.performLongRest(c);else E.performShortRest(c);
    E.save();
    if(window.DnDAppV2?.render)window.DnDAppV2.render();
  },true);

  /* Keep one authoritative HP maximum in live state. */
  const originalSave=E.save.bind(E);
  E.save=()=>{
    const c=E.state;
    c.resources=c.resources||{};
    c.resources.hp=c.resources.hp||{current:1,maximum:E.summary(c).hpMaximum,temporary:0};
    c.resources.hp.maximum=E.summary(c).hpMaximum;
    c.resources.hp.current=Math.max(0,Math.min(num(c.resources.hp.current),c.resources.hp.maximum));
    return originalSave();
  };
})();
