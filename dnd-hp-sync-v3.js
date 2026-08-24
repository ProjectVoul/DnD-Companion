/* HP state synchronization: maximum is derived, current HP is mutable and clamped to it. */
(() => {
  'use strict';
  const E=window.DnDEngineV3||window.DnDEngineV2;if(!E)return;
  const oldSave=E.save;if(!oldSave)return;
  E.save=()=>{E.state.resources??={};E.state.resources.hp??={current:1,maximum:1,temporary:0};const max=E.hpMaximum(E.state);E.state.resources.hp.maximum=max;E.state.resources.hp.current=Math.max(0,Math.min(max,Number(E.state.resources.hp.current)||0));return oldSave();};
})();