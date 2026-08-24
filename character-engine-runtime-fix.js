/* D&D Companion — runtime correctness fixes
 * Compatibility guard for the Engine runtime.
 */
(() => {
  'use strict';
  const e=window.DnDCharacterEngine;if(!e)return;
  const MIGRATION_KEY='dndCompanionEngineMigrationV1';
  const LEGACY_KEYS=['inventoryItems','inventoryCurrency','currentHP','spellSlots','preparedSpells','abilityState'];
  const EQUIPMENT_TYPES=['weapon','armor','shield','focus','accessory'];
  const clone=v=>JSON.parse(JSON.stringify(v));
  const n=v=>Number.isFinite(Number(v))?Number(v):0;
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const originalSync=e.syncCharacterRules;
  const originalLongRest=e.longRest;
  const propertyAC=item=>(item?.properties||[]).map(String).map(v=>v.match(/^\s*\+(\d+)\s*AC\s*$/i)).find(Boolean)?.[1]||0;
  function cleanLegacyStorage(){LEGACY_KEYS.forEach(k=>{try{localStorage.removeItem(k);}catch(_){}});}
  function normalizeInventorySections(c){
    (c.items||[]).forEach(item=>{
      const type=item?.mechanics?.type||item?.equipment?.type;
      item.inventorySection=EQUIPMENT_TYPES.includes(type)?'equipment':'miscellaneous';
    });
  }
  function cleanStaleArmorModifiers(c){
    (c.items||[]).forEach(item=>{
      if(item?.mechanics?.type!=='armor'||!Array.isArray(item.modifiers))return;
      const ac=Number(propertyAC(item));
      item.modifiers=item.modifiers.filter(m=>!String(m?.id||'').startsWith('legacy-ac-')||ac>0);
      if(ac>0&&!item.modifiers.some(m=>String(m?.id||'')===`legacy-ac-${item.id}`))item.modifiers.push({id:`legacy-ac-${item.id}`,target:'armorClass',mode:'add',value:ac,sourceName:item.name});
    });
  }
  function syncPreservingRuntime(c){
    const before={class:c.identity?.class,level:Number(c.identity?.level)||1,hpCurrent:n(c.resources?.hp?.current),hitDiceCurrent:n(c.resources?.hitDice?.current),spellSlots:clone(c.resources?.spellSlots||{}),manualMaximum:Boolean(c.resources?.hp?.manualMaximum),levelRolls:Array.isArray(c.resources?.hp?.levelRolls)?[...c.resources.hp.levelRolls]:[]};
    const out=originalSync?originalSync(c):c;
    const classChanged=before.class!==out.identity?.class||before.level!==Number(out.identity?.level);
    out.resources=out.resources||{};out.resources.hp=out.resources.hp||{};out.resources.hitDice=out.resources.hitDice||{};
    out.resources.hp.manualMaximum=before.manualMaximum;out.resources.hp.levelRolls=before.levelRolls;
    if(!classChanged){
      out.resources.hitDice.current=clamp(before.hitDiceCurrent,0,Number(out.resources.hitDice.maximum)||0);
      Object.keys(out.resources.spellSlots||{}).forEach(level=>{if(before.spellSlots[level]){const max=Number(out.resources.spellSlots[level].maximum)||0;out.resources.spellSlots[level].current=clamp(n(before.spellSlots[level].current),0,max);}});
    }else{
      out.resources.hitDice.current=Number(out.resources.hitDice.maximum)||1;Object.values(out.resources.spellSlots||{}).forEach(s=>{s.current=s.maximum;});
    }
    if(e.getHitPointMaximum)out.resources.hp.maximum=e.getHitPointMaximum(out);
    out.resources.hp.current=clamp(before.hpCurrent,0,Number(out.resources.hp.maximum)||before.hpCurrent||1);
    normalizeInventorySections(out);
    cleanStaleArmorModifiers(out);
    return out;
  }
  e.syncCharacterRules=syncPreservingRuntime;
  e.getLiveCharacter=()=>{let c=e.loadCharacter();if(!localStorage.getItem(MIGRATION_KEY)){c=e.migrateLegacyCharacter?e.migrateLegacyCharacter():c;cleanLegacyStorage();c=e.loadCharacter();}else cleanLegacyStorage();c=syncPreservingRuntime(c);if(e.normalizeCharacter)e.normalizeCharacter(c);return c;};
  e.getLiveDerivedData=()=>e.calculator.getDerivedData(e.getLiveCharacter());
  e.saveLiveCharacter=c=>{const out=e.normalizeCharacter?e.normalizeCharacter(c):c;normalizeInventorySections(out);cleanStaleArmorModifiers(out);const saved=e.saveCharacter(out);cleanLegacyStorage();return saved;};
  e.normalizeCharacter=c=>{
    c.resources=c.resources||{};c.resources.hp=c.resources.hp||{maximum:1,current:1,temporary:0};c.resources.hitDice=c.resources.hitDice||{current:1,maximum:1,die:'d8'};c.resources.deathSaves=c.resources.deathSaves||{successes:0,failures:0};
    const level=Math.max(1,Math.min(20,Math.floor(n(c.identity?.level)||1)));c.resources.hitDice.maximum=level;
    const die=e.getHPDie?e.getHPDie(c):Number(String(c.resources.hitDice.die||'d8').replace('d',''))||8;c.resources.hitDice.die=`d${die}`;c.resources.hitDice.current=clamp(Math.floor(n(c.resources.hitDice.current)),0,level);
    if(e.getHitPointMaximum)c.resources.hp.maximum=e.getHitPointMaximum(c);c.resources.hp.current=clamp(n(c.resources.hp.current),0,Number(c.resources.hp.maximum)||1);c.resources.hp.temporary=Math.max(0,n(c.resources.hp.temporary));
    c.resources.deathSaves.successes=clamp(Math.floor(n(c.resources.deathSaves.successes)),0,3);c.resources.deathSaves.failures=clamp(Math.floor(n(c.resources.deathSaves.failures)),0,3);c.currency=c.currency||{copper:0,silver:0,gold:0,platinum:0};normalizeInventorySections(c);cleanStaleArmorModifiers(c);return c;
  };
  e.longRest=c=>{const out=originalLongRest?originalLongRest(c):c;out.customAbilityState=out.customAbilityState||{};const level=Math.max(1,Math.floor(n(out.identity?.level)||1));const breathMax=(out.items||[]).some(i=>i.id==='dragon-licorice'&&n(i.quantity)>0)?2:1;out.customAbilityState['dragons-breath']={currentUses:breathMax};out.customAbilityState['lay-on-hands']={currentPool:5*level};out.customAbilityState['dragons-judgment']={currentUses:3};return e.saveLiveCharacter(out);};
})();
