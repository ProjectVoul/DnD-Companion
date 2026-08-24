/* D&D Companion v3 UI bootstrap. The v2 UI remains the presentation layer while the v3 rules engine supplies calculations. */
(() => {
  'use strict';
  const root=()=>document.getElementById('app');
  const escapeHTML=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const showBootError=(error,stage)=>{
    const el=root();if(!el)return;
    console.error('D&D Companion bootstrap failure',stage,error);
    el.innerHTML=`<div class="app-shell"><main class="card" style="margin:24px;padding:24px"><div class="eyebrow">D&D COMPANION · STARTUP</div><h1>Character sheet could not start</h1><p>The rules engine loaded, but the interface stopped during <b>${escapeHTML(stage)}</b>.</p><p class="muted">This diagnostic is intentionally visible instead of leaving a blank page.</p><details><summary>Technical detail</summary><pre style="white-space:pre-wrap;overflow:auto">${escapeHTML(error?.stack||error?.message||error||'Unknown error')}</pre></details></main></div>`;
  };
  const render=()=>{
    const E=window.DnDEngineV3||window.DnDEngineV2;
    if(!E){showBootError(new Error('No DnDEngineV3/DnDEngineV2 global was created'),'engine bootstrap');return;}
    try{
      const preparedSpells=E.preparedSpells;
      const knownSpells=E.knownSpells;
      const spellbook=E.spellbook;
      if(window.DnDAppV2?.render){
        window.DnDAppV2.render();
        window.DnDAppV3={render,preparedSpells,knownSpells,spellbook};
        return;
      }
      const c=E.state,s=E.summary(c),el=root();
      if(!el)throw new Error('#app was not found');
      el.innerHTML=`<div class="app-shell"><header class="hero"><div class="hero-mark">✦</div><div><div class="eyebrow">D&D COMPANION · 5E 2014</div><h1>${escapeHTML(c.identity?.name||'Unnamed Adventurer')}</h1><p>${(c.classes||[]).map(x=>`${escapeHTML(x.classId)} ${x.level}`).join(' / ')||'Level 1'}</p></div></header><main><section class="grid two"><article class="card stat-card accent"><div class="stat-label">HIT POINTS</div><div class="big-value">${c.resources?.hp?.current??s.hpMaximum}<span> / ${s.hpMaximum}</span></div></article><article class="card stat-card"><div class="stat-label">ARMOR CLASS</div><div class="big-value">${s.ac}</div></article></section></main></div>`;
      window.DnDAppV3={render,preparedSpells,knownSpells,spellbook};
    }catch(error){showBootError(error,'UI render');}
  };
  window.addEventListener('error',event=>{if(event.error)showBootError(event.error,'script execution');});
  window.addEventListener('unhandledrejection',event=>showBootError(event.reason,'promise execution'));
  window.DnDAppV3={render};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render();
})();