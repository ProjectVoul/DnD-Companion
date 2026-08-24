/* Subclass features are derived from class + selected subclass + level. */
(() => {
  'use strict';
  const E=window.DnDEngineV3,D=window.DnDDataV2;if(!E||!D)return;
  const base=E.features;
  const features=c=>{const out=base(c);(c.classes||[]).forEach(cl=>{const list=D.SUBCLASS_FEATURES?.[cl.classId]?.[cl.subclass]||[];list.filter(f=>Number(f.level)<=Number(cl.level)).forEach(f=>out.push({...f,source:f.source||'phb2014'}));});return out;};
  E.features=features;
  const oldSummary=E.summary;E.summary=c=>({...oldSummary(c),features:features(c)});
})();