/* D&D Companion — Character Sheet navigation shortcuts */
(() => {
'use strict';
function addShortcut(){
 const app=document.getElementById('app');if(!app||document.querySelector('.global-character-sheet-shortcut'))return;
 const main=app.querySelector('main');if(!main)return;
 const button=document.createElement('button');button.type='button';button.className='global-character-sheet-shortcut';button.textContent='↗ Character Sheet';button.onclick=()=>window.showCharacterSheet&&window.showCharacterSheet();
 main.insertBefore(button,main.firstChild);
}
function wrap(name){
 const original=window[name];if(typeof original!=='function'||original.__characterSheetWrapped)return;
 const wrapped=function(...args){const result=original.apply(this,args);setTimeout(addShortcut,0);return result};wrapped.__characterSheetWrapped=true;window[name]=wrapped;
}
['showSpells','showAbilities','showInventory','showInventorySection','openRestMenu'].forEach(wrap);
window.addCharacterSheetShortcut=addShortcut;
setTimeout(addShortcut,0);
})();
