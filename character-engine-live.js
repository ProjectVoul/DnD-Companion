/* D&D Companion — live application bridge for Character Engine */
(() => {
    'use strict';
    const engine=window.DnDCharacterEngine;
    if(!engine)return;

    function getLiveCharacter(){
        const character=engine.loadCharacter();
        const liveItems=typeof inventoryItems!=='undefined'&&Array.isArray(inventoryItems)?inventoryItems:null;
        character.items=liveItems||character.items||[];
        return character;
    }

    engine.getLiveCharacter=getLiveCharacter;
    engine.getLiveDerivedData=()=>engine.calculator.getDerivedData(getLiveCharacter());
    engine.getLiveArmorClassBreakdown=()=>engine.calculator.getArmorClassBreakdown(getLiveCharacter());
})();
