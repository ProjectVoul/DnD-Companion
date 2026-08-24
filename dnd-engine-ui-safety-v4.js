/* D&D Companion v4 UI safety bridge. */
(() => {
  'use strict';
  const E=window.DnDEngineV3||window.DnDEngineV2;
  if(!E)return;
  const finite=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;
  const oldSummary=E.summary;
  E.summary=(c=E.state)=>oldSummary(c||E.state);
  const oldSave=E.save;
  E.save=()=>{
    const c=E.state;
    c.resources??={};
    c.resources.hp??={current:1,maximum:1,temporary:0};
    const max=finite(E.hpMaximum(c),1);
    c.resources.hp.maximum=max;
    c.resources.hp.current=Math.max(0,Math.min(max,finite(c.resources.hp.current,max)));
    c.resources.hp.temporary=Math.max(0,finite(c.resources.hp.temporary,0));
    c.resources.spellSlots??={};
    Object.keys(c.resources.spellSlots).forEach(k=>{c.resources.spellSlots[k]=Math.max(0,finite(c.resources.spellSlots[k],0));});
    if(c.resources.pactSlots){Object.keys(c.resources.pactSlots).forEach(k=>{c.resources.pactSlots[k]=Math.max(0,finite(c.resources.pactSlots[k],0));});}
    return oldSave();
  };
})();
