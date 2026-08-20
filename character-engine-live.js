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

    // Load the Character Sheet as a presentation layer without changing the
    // existing HTML structure. This keeps the sheet isolated from app.js.
    const css=document.createElement('link');
    css.rel='stylesheet';
    css.href='character-sheet.css';
    document.head.appendChild(css);

    const script=document.createElement('script');
    script.src='character-sheet.js';
    script.defer=true;
    document.body.appendChild(script);
})();
