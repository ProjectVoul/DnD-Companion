/* D&D Companion — Artificer option bridge | Tasha 5e 2014 */
(() => {
  'use strict';
  const e=window.DnDCharacterEngine;
  if(!e) return;
  const art={hitDie:'d8',saves:['constitution','intelligence'],armor:['light','medium','shields'],weapons:['simple'],tools:["thieves' tools",'tinker’s tools','artisan’s tools'],spellcasting:'intelligence'};
  const subclasses=[['Alchemist',3],['Armorer',3],['Artillerist',3],['Battle Smith',3]];
  const slots=[[],[],[],[2,0,0,0],[3,0,0,0],[4,0,0,0],[4,0,0,0],[4,0,0,0],[4,0,0,0],[4,2,0,0],[4,3,0,0],[4,3,0,0],[4,3,0,0],[4,3,2,0],[4,3,2,0],[4,3,2,0],[4,3,2,0],[4,3,3,1],[4,3,3,1],[4,3,3,2],[4,3,3,2]];
  e.characterOptions=e.characterOptions||{};
  e.characterOptions.classData=e.characterOptions.classData||{};
  e.characterOptions.classData.Artificer={...art};
  e.characterOptions.subclasses=e.characterOptions.subclasses||{};
  e.characterOptions.subclasses.Artificer=subclasses;
  e.artificerSpellSlots=slots;
  if(!e.__artificerSyncV4Wrapped){
    const base=e.syncCharacterRules;
    e.syncCharacterRules=function(c){
      const out=base?base(c):c;
      if(out.identity?.class!=='Artificer') return out;
      out.proficiencies=out.proficiencies||{};
      out.proficiencies.savingThrows=art.saves.slice();
      out.proficiencies.armor=art.armor.slice();
      out.proficiencies.weapons=art.weapons.slice();
      out.proficiencies.tools=out.proficiencies.tools||[];
      out.spellcasting=out.spellcasting||{};
      out.spellcasting.ability='intelligence';
      out.resources=out.resources||{};
      const lv=Math.max(1,Math.min(20,Number(out.identity.level)||1));
      out.resources.hitDice=out.resources.hitDice||{};
      out.resources.hitDice.maximum=lv;out.resources.hitDice.die='d8';
      out.resources.spellSlots=out.resources.spellSlots||{};
      const row=slots[lv]||[];
      row.forEach((max,i)=>{if(max>0){const key=String(i+1),cur=Number(out.resources.spellSlots[key]?.current);out.resources.spellSlots[key]={current:Number.isFinite(cur)?Math.min(cur,max):max,maximum:max};}});
      return out;
    };
    e.__artificerSyncV4Wrapped=true;
  }
})();
