/* D&D Companion v4 runtime safety layer.
 * Keeps interaction rules out of the UI while correcting stateful rest behavior.
 */
(() => {
  'use strict';
  const E=window.DnDEngineV3||window.DnDEngineV2;
  if(!E)return;
  const num=v=>Number.isFinite(Number(v))?Number(v):0;
  const maxHP=c=>E.summary(c).hpMaximum;
  const hitDiceMap=c=>c.resources.hitDice=c.resources.hitDice||{};
  const totalHD=c=>Object.values(E.hitDice(c)||{}).reduce((n,h)=>n+num(h.maximum),0);
  const currentHD=c=>Object.values(E.hitDice(c)||{}).reduce((n,h)=>n+num(h.current),0);
  const setHD=(c,target)=>{
    const map=hitDiceMap(c);
    let remaining=Math.max(0,target);
    Object.entries(E.hitDice(c)||{}).forEach(([id,h])=>{
      const current=Math.min(num(h.maximum),remaining);
      map[id]={current,maximum:num(h.maximum)};
      remaining-=current;
    });
  };
  const restoreSpellSlots=c=>{
    const slots=E.spellSlots(c)||{};
    c.resources.spellSlots=c.resources.spellSlots||{};
    Object.keys(slots).forEach(k=>{
      if(k==='pact')c.resources.spellSlots.pact=0;
      else c.resources.spellSlots[k]=0;
    });
  };
  const longRest=c=>{
    c.resources=c.resources||{};
    c.resources.hp=c.resources.hp||{};
    c.resources.hp.maximum=maxHP(c);
    c.resources.hp.current=c.resources.hp.maximum;
    c.resources.hp.temporary=0;
    c.resources.deathSaves={successes:0,failures:0};
    const max=totalHD(c),recover=Math.max(1,Math.floor(max/2));
    setHD(c,Math.min(max,currentHD(c)+recover));
    restoreSpellSlots(c);
    c.resources.inspiration=false;
    c.conditions=(c.conditions||[]).filter(x=>String(x).toLowerCase()==='exhaustion');
    return c;
  };
  const shortRest=c=>{
    c.resources=c.resources||{};
    c.resources.hp=c.resources.hp||{};
    c.resources.hp.maximum=maxHP(c);
    c.resources.deathSaves=c.resources.deathSaves||{successes:0,failures:0};
    /* Hit Dice are spent by the player; a short rest does not automatically
       restore them. The UI therefore only restores short-rest resources. */
    c.resources.shortRestCount=num(c.resources.shortRestCount)+1;
    return c;
  };
  E.performLongRest=longRest;
  E.performShortRest=shortRest;

  document.addEventListener('click',event=>{
    const button=event.target.closest?.('[data-action="long-rest"],[data-action="short-rest"]');
    if(!button)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const c=E.state;
    if(button.dataset.action==='long-rest'){
      longRest(c);
      E.save();
      if(window.DnDAppV2?.render)window.DnDAppV2.render();
    }else{
      shortRest(c);
      E.save();
      if(window.DnDAppV2?.render)window.DnDAppV2.render();
    }
  },true);

  /* Keep a single authoritative maximum in the live character state. */
  const originalSave=E.save.bind(E);
  E.save=()=>{
    const c=E.state;
    c.resources=c.resources||{};
    c.resources.hp=c.resources.hp||{current:1,maximum:maxHP(c),temporary:0};
    c.resources.hp.maximum=maxHP(c);
    c.resources.hp.current=Math.max(0,Math.min(num(c.resources.hp.current),c.resources.hp.maximum));
    return originalSave();
  };
})();
