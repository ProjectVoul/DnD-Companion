/* D&D Companion — Character Sheet navigation */
(() => {
'use strict';

function isHome(){
 const app=document.getElementById('app');
 return Boolean(app?.querySelector('.character-summary'));
}

function bindCharacterName(){
 const title=document.querySelector('.character-summary h1');
 if(!title)return;
 title.classList.add('character-sheet-link');
 title.tabIndex=0;
 title.title='Open Character Sheet';
 // The old sheet script attached an inline handler here. Remove it so the
 // delegated handler below is the single source of truth and survives UI redraws.
 title.onclick=null;
 title.onkeydown=null;
}

function addShortcut(){
 const app=document.getElementById('app');
 if(!app || isHome() || document.querySelector('.global-character-sheet-shortcut'))return;
 const main=app.querySelector('main');
 if(!main)return;
 const button=document.createElement('button');
 button.type='button';
 button.className='global-character-sheet-shortcut';
 button.textContent='↗ Character Sheet';
 button.onclick=()=>window.showCharacterSheet&&window.showCharacterSheet();
 main.insertBefore(button,main.firstChild);
}

function wrap(name){
 const original=window[name];
 if(typeof original!=='function'||original.__characterSheetWrapped)return;
 const wrapped=function(...args){const result=original.apply(this,args);setTimeout(()=>{bindCharacterName();addShortcut();},0);return result};
 wrapped.__characterSheetWrapped=true;
 window[name]=wrapped;
}

document.addEventListener('click',event=>{
 const title=event.target.closest?.('.character-summary h1');
 if(!title || !window.showCharacterSheet)return;
 event.preventDefault();
 window.showCharacterSheet();
});

document.addEventListener('keydown',event=>{
 const title=event.target.closest?.('.character-summary h1');
 if(!title || !window.showCharacterSheet)return;
 if(event.key==='Enter'||event.key===' '){
  event.preventDefault();
  window.showCharacterSheet();
 }
});

['showSpells','showAbilities','showInventory','showInventorySection','openRestMenu'].forEach(wrap);
window.addCharacterSheetShortcut=()=>{bindCharacterName();addShortcut();};
setTimeout(()=>{bindCharacterName();addShortcut();},0);
})();
