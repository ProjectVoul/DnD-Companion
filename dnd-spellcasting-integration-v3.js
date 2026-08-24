/* Spell catalog integration: enforce class eligibility while preserving explicit homebrew spells. */
(() => {
  'use strict';
  const E=window.DnDEngineV3||window.DnDEngineV2,D=window.DnDDataV2;if(!E||!D)return;
  const eligible=(c,classId,spellId)=>{const sp=D.SPELLS?.[spellId];return !!sp&&sp.classes.includes(classId)&&E.classLevel(c,classId)>0;};
  const list=(c,classId)=>Object.values(D.SPELLS||{}).filter(sp=>sp.classes.includes(classId)&&E.classLevel(c,classId)>0);
  const oldSave=E.save;E.save=()=>{E.state.spells??=[];E.state.spellcasting??={known:{},prepared:{},spellbook:{}};E.state.classes?.forEach(cl=>{const id=cl.classId;E.state.spellcasting.known[id]??=[];E.state.spellcasting.prepared[id]??=[];E.state.spellcasting.spellbook[id]??=[];const catalog=new Set(list(E.state,id).map(x=>x.id));E.state.spells.forEach(sp=>{if(sp.sourceClass===id&&sp.id&&!catalog.has(sp.id))sp.homebrew=true;});});return oldSave();};
  E.eligibleSpells=(c,classId)=>list(c,classId);E.canLearnSpell=eligible;E.spellCatalog=D.SPELLS;
  window.DnDSpellCatalogV3={eligible,list};
})();