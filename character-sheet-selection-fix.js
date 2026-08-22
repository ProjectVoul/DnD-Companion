/* D&D Companion — normalize identity/rule selections after sheet edits */
(() => {
  'use strict';
  document.addEventListener('change', event => {
    const input=event.target;
    if(!input?.closest?.('.character-sheet')) return;
    const path=input.dataset?.select||input.dataset?.field;
    if(!path || !['identity.class','identity.race','identity.background','identity.subclass','identity.level'].includes(path)) return;
    const e=window.DnDCharacterEngine;if(!e)return;
    const c=e.getLiveCharacter?e.getLiveCharacter():e.loadCharacter();
    const value=input.value;
    if(path==='identity.level') c.identity.level=Math.max(1,Math.min(20,Number(value)||1));
    else if(e.applyCharacterSelection) e.applyCharacterSelection(c,path.split('.')[1],value);
    else { c.identity=c.identity||{};c.identity[path.split('.')[1]]=value; }
    if(e.saveLiveCharacter)e.saveLiveCharacter(c);else e.saveCharacter(c);
    if(window.showCharacterSheet)window.showCharacterSheet();
  });
})();
