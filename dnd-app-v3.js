/* D&D Companion v3 UI bootstrap. The full v2 UI remains the presentation layer while the v3 rules engine supplies calculations. */
(() => {
  'use strict';
  const E=window.DnDEngineV3||window.DnDEngineV2;
  if(!E)return;

  // Keep these explicit hooks in the v3 UI layer: preparedSpells, knownSpells
  // and spellbook are intentionally distinct because 5e 2014 uses different
  // preparation/known models by class.
  const preparedSpells=E.preparedSpells;
  const knownSpells=E.knownSpells;
  const spellbook=E.spellbook;

  const render=()=>{
    if(window.DnDAppV2?.render){
      window.DnDAppV2.render();
      return;
    }
    const root=document.getElementById('app');
    if(!root)return;
    const c=E.state,s=E.summary(c);
    root.innerHTML=`<div class="app-shell"><header class="hero"><div class="hero-mark">✦</div><div><div class="eyebrow">D&D COMPANION · 5E 2014</div><h1>${String(c.identity?.name||'Unnamed Adventurer').replace(/[&<>\"']/g,'')}</h1><p>${(c.classes||[]).map(x=>`${x.classId} ${x.level}`).join(' / ')||'Level 1'}</p></div></header><main><section class="grid two"><article class="card stat-card accent"><div class="stat-label">HIT POINTS</div><div class="big-value">${c.resources?.hp?.current??s.hpMaximum}<span> / ${s.hpMaximum}</span></div></article><article class="card stat-card"><div class="stat-label">ARMOR CLASS</div><div class="big-value">${s.ac}</div></article></section><section class="card"><h2>Abilities & Skills</h2><p class="muted">Open the character sections to manage proficiencies, features, inventory and spellcasting.</p></section></main></div>`;
  };
  window.DnDAppV3={render,preparedSpells,knownSpells,spellbook};
  render();
})();