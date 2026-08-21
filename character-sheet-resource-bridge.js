/* D&D Companion — resource bridge between legacy session controls and Character Sheet */
(() => {
'use strict';
document.addEventListener('change',event=>{const target=event.target;if(target?.matches?.('[data-hp-current]'))localStorage.setItem('currentHP',String(Math.max(0,Number(target.value)||0));});
})();
