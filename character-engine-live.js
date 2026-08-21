/* D&D Companion — live application bridge for Character Engine */
(() => {
'use strict';
const engine=window.DnDCharacterEngine;if(!engine)return;
function normalizeItem(item){if(!item||typeof item!=='object')return item;item.equipment=item.equipment||{};if(item.equipment.equipped===undefined&&item.equipped!==undefined)item.equipment.equipped=Boolean(item.equipped);if(item.equipment.type===undefined&&item.mechanics?.type)item.equipment.type=item.mechanics.type;return item;}
function getLiveCharacter(){const character=engine.loadCharacter();const liveItems=typeof inventoryItems!=='undefined'&&Array.isArray(inventoryItems)?inventoryItems:null;character.items=(liveItems||character.items||[]).map(normalizeItem);const hadAncestry=Boolean(character.dragonAncestry);if(engine.syncCharacterRules)engine.syncCharacterRules(character);if((character.identity.race==='Dragonborn'||character.identity.race==='Draconide')&&!hadAncestry){delete character.dragonAncestry;if(character.defenses)character.defenses.resistances=[];}return character;}
engine.getLiveCharacter=getLiveCharacter;engine.getLiveDerivedData=()=>engine.calculator.getDerivedData(getLiveCharacter());engine.getLiveArmorClassBreakdown=()=>engine.calculator.getArmorClassBreakdown(getLiveCharacter());engine.getLiveHitPointMaximum=()=>engine.getHitPointMaximum?engine.getHitPointMaximum(getLiveCharacter()):getLiveCharacter().resources.hp.maximum;
const css=document.createElement('link');css.rel='stylesheet';css.href='character-sheet.css';document.head.appendChild(css);
function loadScript(src,onload){const s=document.createElement('script');s.src=src;s.onload=onload;document.body.appendChild(s);}loadScript('character-engine-options-v2.js',()=>loadScript('character-engine-class-sync.js',()=>loadScript('character-sheet-v2.js')));
})();
