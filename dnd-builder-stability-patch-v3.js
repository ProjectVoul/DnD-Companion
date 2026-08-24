/* Builder stability: a newly created character starts at full derived HP. */
(() => {
  'use strict';
  const E=window.DnDEngineV3||window.DnDEngineV2;if(!E)return;
  document.addEventListener('click',e=>{const b=e.target.closest?.('[data-builder-save]');if(!b)return;const beforeMax=Number(E.state.resources?.hp?.maximum)||1;const beforeCurrent=Number(E.state.resources?.hp?.current)||1;setTimeout(()=>{const max=E.summary().hpMaximum;if(beforeMax<=1&&max>1&&beforeCurrent<=1&&Number(E.state.resources?.hp?.current)<=1){E.state.resources.hp.current=max;E.state.resources.hp.maximum=max;E.save();}},0);});
})();