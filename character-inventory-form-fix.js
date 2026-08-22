/* D&D Companion — inventory editor state hydration */
(() => {
  'use strict';
  function currentItem(){
    const button=document.querySelector('.inventory-form-submit');
    const match=button?.getAttribute('onclick')?.match(/saveInventoryItemForm\('([^']*)'\)/);
    const id=match?.[1];if(!id)return null;
    const e=window.DnDCharacterEngine;if(!e)return null;
    const c=e.getLiveCharacter?e.getLiveCharacter():e.loadCharacter();
    return c.items?.find(i=>i.id===id)||null;
  }
  const original=window.updateInventoryTypeFields;
  window.updateInventoryTypeFields=()=>{
    if(typeof original==='function')original();
    const item=currentItem(),type=document.getElementById('inventory-form-type')?.value,m=item?.mechanics||{};
    const set=(id,value)=>{const x=document.getElementById(id);if(x&&value!==undefined&&value!==null)x.value=value;};
    const check=(id,value)=>{const x=document.getElementById(id);if(x)x.checked=Boolean(value);};
    if(type==='weapon'){
      set('inventory-weapon-proficiency',item?.proficiency?.type||'martial');set('inventory-weapon-attack-type',m.attack?.type||'melee');set('inventory-weapon-ability',m.attack?.ability||'strength');set('inventory-weapon-attack-bonus',m.attack?.bonus??0);set('inventory-weapon-dice-count',m.damage?.[0]?.dice?.count??1);set('inventory-weapon-die',m.damage?.[0]?.dice?.die||'d8');set('inventory-weapon-damage-type',m.damage?.[0]?.type||'slashing');set('inventory-weapon-properties',(m.properties||[]).join(', '));
    }else if(type==='shield')set('inventory-shield-bonus',m.armorBonus??2);
  };
})();
