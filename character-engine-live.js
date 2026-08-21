/* D&D Companion — live application bridge for Character Engine */
(() => {
'use strict';
const engine=window.DnDCharacterEngine;if(!engine)return;
function normalizeItem(item){
 if(!item||typeof item!=='object')return item;
 item.equipment=item.equipment||{};
 const tagType=({Armor:'armor',Weapon:'weapon',Shield:'shield',Focus:'focus',Accessory:'accessory'}[(item.tags||[]).find(t=>['Armor','Weapon','Shield','Focus','Accessory'].includes(t))]);
 const type=item.equipment.type||item.mechanics?.type||tagType||({armor:'armor',weapons:'weapon',shield:'shield',focus:'focus',accessories:'accessory'}[item.category]);
 if(type)item.equipment.type=type;
 if(item.equipment.equipped===undefined&&item.equipped!==undefined)item.equipment.equipped=Boolean(item.equipped);
 if(item.equipped===undefined&&item.equipment.equipped!==undefined)item.equipped=Boolean(item.equipment.equipped);
 if(type==='armor'&&item.mechanics?.type!=='armor')item.mechanics=engine.createArmorMechanics(item.mechanics||{});
 if(type==='shield'&&item.mechanics?.type!=='shield')item.mechanics=engine.createShieldMechanics(item.mechanics||{});
 if(type==='weapon'&&item.mechanics?.type!=='weapon')item.mechanics=engine.createWeaponMechanics(item.mechanics||{});
 return item;
}
function syncSpellSlots(character){try{const saved=JSON.parse(localStorage.getItem('spellSlots')||'null');if(!saved)return;character.resources=character.resources||{};character.resources.spellSlots={};Object.keys(saved).forEach(k=>{const s=saved[k];if(s&&Number(s.maximum)>0)character.resources.spellSlots[k]={current:Math.max(0,Math.min(Number(s.current)||0,Number(s.maximum)||0)),maximum:Number(s.maximum)||0};});}catch{}}
function syncCurrentHP(character){const raw=localStorage.getItem('currentHP');if(raw===null)return;const n=Number(raw);if(Number.isFinite(n))character.resources.hp.current=Math.max(0,Math.min(character.resources.hp.maximum||n,n));}
function getLiveCharacter(){const character=engine.loadCharacter();const liveItems=typeof inventoryItems!=='undefined'&&Array.isArray(inventoryItems)?inventoryItems:null;character.items=(liveItems||character.items||[]).map(normalizeItem);syncSpellSlots(character);if(engine.syncCharacterRules)engine.syncCharacterRules(character);syncCurrentHP(character);return character;}
engine.getLiveCharacter=getLiveCharacter;engine.getLiveDerivedData=()=>engine.calculator.getDerivedData(getLiveCharacter());engine.getLiveArmorClassBreakdown=()=>engine.calculator.getArmorClassBreakdown?engine.calculator.getArmorClassBreakdown(getLiveCharacter()):null;engine.getLiveHitPointMaximum=()=>engine.getHitPointMaximum?engine.getHitPointMaximum(getLiveCharacter()):getLiveCharacter().resources.hp.maximum;
const css=document.createElement('link');css.rel='stylesheet';css.href='character-sheet.css';document.head.appendChild(css);
function loadScript(src,onload){const s=document.createElement('script');s.src=src;s.onload=onload;s.onerror=()=>console.error('Character Engine: failed to load',src);document.body.appendChild(s);}
loadScript('character-engine-options-v2.js',()=>loadScript('character-engine-features.js',()=>loadScript('character-engine-paladin-2014.js',()=>loadScript('character-engine-class-sync-v3.js',()=>loadScript('character-engine-weapon-rules.js',()=>loadScript('character-sheet-v3.js',()=>loadScript('character-sheet-navigation.js',()=>loadScript('character-sheet-resource-bridge.js'))))))));
})();
