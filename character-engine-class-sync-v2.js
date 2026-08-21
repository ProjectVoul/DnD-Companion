/* D&D Companion — class/race migration bridge, 5e 2014 */
(() => {
'use strict';
const engine=window.DnDCharacterEngine;if(!engine||!engine.syncCharacterRules)return;
const baseSync=engine.syncCharacterRules;
const baseApply=engine.applyCharacterSelection;
const normRace=r=>r==='Draconide'?'Dragonborn':r;
const abilities=['strength','dexterity','constitution','intelligence','wisdom','charisma'];
engine.syncCharacterRules=character=>{
    const c=baseSync(character);c.ruleState=c.ruleState||{};
    if(!c.ruleState.raceMigrationInitialized){
        c.ruleState.legacyRace=normRace(c.identity?.race);
        c.ruleState.raceAppliedBonuses={};
        c.abilityScoreBonuses={};
        c.ruleState.raceMigrationInitialized=true;
    }
    const autoIds=new Set(c.ruleState.autoFeatureIds||[]);
    const manual=(c.features||[]).filter(f=>!autoIds.has(f.id));
    const generated=[];
    const defs=engine.official5e2014?.paladin?.coreFeatures;
    if(c.identity?.class==='Paladin'&&defs)Object.values(defs).forEach(f=>{if((Number(c.identity.level)||1)>=(Number(f.level)||1))generated.push(JSON.parse(JSON.stringify(f)));});
    c.features=[...manual,...generated];c.ruleState.autoFeatureIds=generated.map(f=>f.id);
    return c;
};
engine.applyCharacterSelection=(c,type,value)=>{
    if(type!=='race')return baseApply(c,type,value);
    c.ruleState=c.ruleState||{};const races=engine.characterOptions?.races||{};const oldRace=normRace(c.ruleState.legacyRace||c.identity?.race),newRace=normRace(value);
    if(oldRace===newRace&&!c.ruleState.raceExplicitlyApplied){
        c.identity.race=value;c.ruleState.raceExplicitlyApplied=true;c.abilityScoreBonuses={};c.ruleState.raceAppliedBonuses={};return c;
    }
    const oldBonus=c.ruleState.raceAppliedBonuses||races[oldRace]?.abilityBonuses||{};
    abilities.forEach(a=>{c.abilityScores[a]=(Number(c.abilityScores?.[a])||0)-(Number(oldBonus[a])||0);});
    c.identity.race=value;c.abilityScoreBonuses=JSON.parse(JSON.stringify(races[newRace]?.abilityBonuses||{}));c.ruleState.raceAppliedBonuses=JSON.parse(JSON.stringify(c.abilityScoreBonuses));c.ruleState.legacyRace=newRace;c.ruleState.raceExplicitlyApplied=true;
    baseSync(c);return c;
};
})();
