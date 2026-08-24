/* D&D Companion — unified HP / rest state bridge | D&D 5e 2014 */
(() => {
  'use strict';
  const e = window.DnDCharacterEngine;
  if (!e) return;
  const get = () => e.getLiveCharacter ? e.getLiveCharacter() : e.loadCharacter();
  const save = c => e.saveCharacter(c);
  const clamp = (v,min,max) => Math.min(max,Math.max(min,Number(v)||0));

  function syncHome(c){
    const hp=c.resources?.hp||{};
    const cur=Math.max(0,Number(hp.current)||0), max=Math.max(1,Number(hp.maximum)||1);
    const current=document.getElementById('current-hp');
    const maximum=document.getElementById('maximum-hp');
    if(current) current.textContent=cur;
    if(maximum) maximum.textContent=max;
    if(window.refreshDndHomeHP) window.refreshDndHomeHP();
  }

  window.changeHP = function(amount){
    const c=get(); c.resources=c.resources||{}; c.resources.hp=c.resources.hp||{current:1,maximum:1,temporary:0};
    c.resources.hp.current=clamp((Number(c.resources.hp.current)||0)+Number(amount||0),0,Number(c.resources.hp.maximum)||1);
    save(c); syncHome(c);
  };

  window.updateHP = function(){syncHome(get());};

  window.longRest = function(){
    const c=get(); c.resources=c.resources||{}; c.resources.hp=c.resources.hp||{current:1,maximum:1,temporary:0};
    if((Number(c.resources.hp.current)||0)<=0){alert('A character at 0 hit points cannot benefit from this long rest.');return;}
    c.resources.hp.current=Number(c.resources.hp.maximum)||1;
    c.resources.hp.temporary=0;
    c.resources.deathSaves={successes:0,failures:0};
    const hd=c.resources.hitDice||{current:0,maximum:0};
    hd.current=Math.min(Number(hd.maximum)||0,(Number(hd.current)||0)+Math.max(1,Math.floor((Number(hd.maximum)||0)/2)));
    c.resources.hitDice=hd;
    Object.values(c.resources.spellSlots||{}).forEach(s=>{s.current=s.maximum;});
    c.resources.featureUses={};
    c.resources.inspiration=Boolean(c.resources.inspiration);
    try{localStorage.removeItem('abilityState');}catch{}
    save(c);
    if(typeof closeRestMenu==='function') closeRestMenu();
    if(window.showCharacterSheet && document.querySelector('.character-sheet-v4')) window.showCharacterSheet(); else syncHome(c);
  };

  window.shortRest = function(){
    const c=get(); c.resources=c.resources||{}; c.resources.hp=c.resources.hp||{current:1,maximum:1,temporary:0};
    if((Number(c.resources.hp.current)||0)<=0){alert('A character at 0 hit points cannot spend Hit Dice to recover hit points from a short rest unless another rule provides recovery.');return;}
    const hd=c.resources.hitDice||{current:0,maximum:0,die:'d8'};
    const available=Number(hd.current)||0;
    if(available<=0){alert('No Hit Dice available.');return;}
    const rawDice=prompt(`Hit Dice available: ${available}\nHow many Hit Dice did you spend?`);
    if(rawDice===null)return;
    const spent=Math.floor(Number(rawDice));
    if(!Number.isFinite(spent)||spent<0||spent>available){alert('Invalid number of Hit Dice.');return;}
    if(spent===0){if(typeof closeRestMenu==='function')closeRestMenu();return;}
    const rawHP=prompt(`You spent ${spent} Hit Dice (${hd.die||'d8'}).\nEnter the total HP recovered from your rolls, including Constitution modifiers:`);
    if(rawHP===null)return;
    const recovered=Math.floor(Number(rawHP));
    if(!Number.isFinite(recovered)||recovered<0){alert('Invalid HP amount.');return;}
    hd.current-=spent; c.resources.hitDice=hd;
    c.resources.hp.current=clamp((Number(c.resources.hp.current)||0)+recovered,0,Number(c.resources.hp.maximum)||1);
    save(c);
    if(typeof closeRestMenu==='function') closeRestMenu();
    if(window.showCharacterSheet && document.querySelector('.character-sheet-v4')) window.showCharacterSheet(); else syncHome(c);
  };

  document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>syncHome(get()),60));
})();
