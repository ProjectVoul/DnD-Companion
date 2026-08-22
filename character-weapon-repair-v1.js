/* D&D Companion — weapon data repair v1 */
(() => {
  'use strict';
  const e=window.DnDCharacterEngine;if(!e)return;
  const originalGet=e.getLiveCharacter;
  const originalSave=e.saveLiveCharacter;
  if(!originalGet)return;
  const repair=c=>{
    let changed=false;
    (c.items||[]).forEach(item=>{
      if(item?.mechanics?.type!=='weapon')return;
      if(!Array.isArray(item.mechanics.damage)||item.mechanics.damage.length===0){
        item.mechanics.damage=[{dice:{count:1,die:'d8'},type:'slashing',ability:'strength',modifier:0}];
        changed=true;
      }
    });
    if(changed&&originalSave)originalSave(c);
    return c;
  };
  e.getLiveCharacter=()=>repair(originalGet());
  if(originalSave){
    e.saveLiveCharacter=c=>originalSave(repair(c));
  }
})();
