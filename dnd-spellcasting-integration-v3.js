/* Spell catalog integration: class eligibility, known/prepared/spellbook lists and safe homebrew preservation. */
(() => {
  'use strict';
  const E=window.DnDEngineV3||window.DnDEngineV2,D=window.DnDDataV2;if(!E||!D)return;
  const catalog=()=>D.SPELLS||{};
  const list=(c,id)=>Object.values(catalog()).filter(s=>s.classes.includes(id)&&E.classLevel(c,id)>0);
  const eligible=(c,id,spellId)=>list(c,id).some(s=>s.id===spellId);
  const oldSave=E.save;
  E.save=()=>{const c=E.state;c.spells??=[];c.spellcasting??={known:{},prepared:{},spellbook:{}};(c.classes||[]).forEach(cl=>{const id=cl.classId;c.spellcasting.known[id]??=[];c.spellcasting.prepared[id]??=[];c.spellcasting.spellbook[id]??=[];const ids=new Set(list(c,id).map(s=>s.id));c.spells.forEach(sp=>{if(sp.sourceClass===id&&sp.id&&!ids.has(sp.id))sp.homebrew=true;});});return oldSave();};
  E.eligibleSpells=(c,id)=>list(c,id);E.canLearnSpell=eligible;E.spellCatalog=catalog;
  window.DnDSpellCatalogV3={eligible,list};
})();