/* HP card v4: explicit current/max values, visible meter and direct editing. */
(() => {
  'use strict';
  const E=window.DnDEngineV3||window.DnDEngineV2;if(!E)return;
  const n=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
  let observer;
  const render=()=>{
    observer?.disconnect();
    const main=document.querySelector('main');
    const active=document.querySelector('.nav-item.active')?.dataset.nav;
    const card=main?.querySelector('.stat-card.accent');
    if(active!=='sheet'||!card){observer=new MutationObserver(render);observer.observe(document.body,{childList:true,subtree:true});return;}
    const c=E.state;c.resources??={};c.resources.hp??={current:1,maximum:E.hpMaximum(c),temporary:0};
    const max=Math.max(1,n(E.hpMaximum(c),1));
    let current=n(c.resources.hp.current,max);current=Math.max(0,Math.min(max,current));
    c.resources.hp.maximum=max;c.resources.hp.current=current;c.resources.hp.temporary=Math.max(0,n(c.resources.hp.temporary,0));
    card.innerHTML=`<div class="stat-label">HIT POINTS</div><div class="hp-v4-head"><div><span class="hp-v4-label">Current</span><input class="hp-v4-input" type="number" min="0" max="${max}" value="${current}" data-hp-current></div><div class="hp-v4-max"><span>Maximum</span><b>${max}</b></div></div><div class="meter hp-v4-meter"><i style="width:${Math.max(0,Math.min(100,current/max*100))}%"></i></div><div class="hp-v4-controls"><button type="button" data-hp-v4="-5">−5</button><button type="button" data-hp-v4="-1">−1</button><button type="button" data-hp-v4="1">+1</button><button type="button" data-hp-v4="5">+5</button></div><label class="hp-v4-temp">Temporary HP <input type="number" min="0" value="${c.resources.hp.temporary}" data-hp-temp></label>`;
    const update=()=>{
      const value=Math.max(0,Math.min(max,n(card.querySelector('[data-hp-current]').value,current));
      c.resources.hp.current=value;c.resources.hp.maximum=max;
      const temp=Math.max(0,n(card.querySelector('[data-hp-temp]').value,0));c.resources.hp.temporary=temp;
      card.querySelector('[data-hp-current]').value=value;card.querySelector('[data-hp-temp]').value=temp;card.querySelector('.hp-v4-meter i').style.width=`${value/max*100}%`;
      E.save();
    };
    card.querySelectorAll('[data-hp-v4]').forEach(b=>b.onclick=()=>{c.resources.hp.current=Math.max(0,Math.min(max,current+n(b.dataset.hpV4)));update();});
    card.querySelector('[data-hp-current]').onchange=update;card.querySelector('[data-hp-temp]').onchange=update;
    observer=new MutationObserver(render);observer.observe(document.body,{childList:true,subtree:true});
  };
  const style=document.createElement('style');style.textContent=`.hp-v4-head{display:flex;justify-content:space-between;align-items:end;gap:12px;margin:10px 0}.hp-v4-label,.hp-v4-max span{display:block;font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;opacity:.65}.hp-v4-input{font:inherit;font-size:2rem;font-weight:700;width:110px;background:transparent;border:0;border-bottom:1px solid currentColor;color:inherit}.hp-v4-max{text-align:right}.hp-v4-max b{font-size:1.5rem}.hp-v4-meter{height:12px;margin:12px 0}.hp-v4-controls{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.hp-v4-controls button{padding:9px;border:1px solid rgba(255,255,255,.15);border-radius:9px;background:transparent;color:inherit}.hp-v4-temp{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:12px;font-size:.85rem}.hp-v4-temp input{width:80px;padding:6px;border-radius:8px;border:1px solid rgba(255,255,255,.15);background:transparent;color:inherit}`;document.head.appendChild(style);
  render();
})();
