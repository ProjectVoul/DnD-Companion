/* D&D Companion — live application bridge for Character Engine */
(() => {
    'use strict';
    const engine=window.DnDCharacterEngine;
    if(!engine)return;

    function normalizeItem(item){
        if(!item||typeof item!=='object')return item;
        item.equipment=item.equipment||{};
        if(item.equipment.equipped===undefined&&item.equipped!==undefined)item.equipment.equipped=Boolean(item.equipped);
        if(item.equipment.type===undefined&&item.mechanics?.type)item.equipment.type=item.mechanics.type;
        if(item.mechanics?.type==='weapon'&&item.proficiency===undefined)item.proficiency={type:null};
        return item;
    }

    function getLiveCharacter(){
        const character=engine.loadCharacter();
        const liveItems=typeof inventoryItems!=='undefined'&&Array.isArray(inventoryItems)?inventoryItems:null;
        character.items=(liveItems||character.items||[]).map(normalizeItem);
        if(engine.syncCharacterRules)engine.syncCharacterRules(character);
        return character;
    }

    engine.getLiveCharacter=getLiveCharacter;
    engine.getLiveDerivedData=()=>engine.calculator.getDerivedData(getLiveCharacter());
    engine.getLiveArmorClassBreakdown=()=>engine.calculator.getArmorClassBreakdown(getLiveCharacter());
    engine.getLiveHitPointMaximum=()=>engine.getHitPointMaximum?engine.getHitPointMaximum(getLiveCharacter()):getLiveCharacter().resources.hp.maximum;

    const css=document.createElement('link');
    css.rel='stylesheet';
    css.href='character-sheet.css';
    document.head.appendChild(css);

    function loadScript(src,onload){
        const script=document.createElement('script');
        script.src=src;
        script.onload=onload;
        document.body.appendChild(script);
    }

    loadScript('character-engine-options.js',()=>loadScript('character-sheet.js'));
})();
