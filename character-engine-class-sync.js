/* D&D Companion — class feature activation bridge, 5e 2014 */
(() => {
'use strict';
const engine=window.DnDCharacterEngine;if(!engine||!engine.syncCharacterRules)return;
const baseSync=engine.syncCharacterRules;
engine.syncCharacterRules=character=>{
    const c=baseSync(character);
    c.ruleState=c.ruleState||{};
    const autoIds=new Set(c.ruleState.autoFeatureIds||[]);
    const manual=(c.features||[]).filter(f=>!autoIds.has(f.id));
    const generated=[];
    const defs=engine.official5e2014?.paladin?.coreFeatures;
    if(c.identity?.class==='Paladin'&&defs){
        Object.values(defs).forEach(feature=>{if((Number(c.identity.level)||1)>=(Number(feature.level)||1))generated.push(JSON.parse(JSON.stringify(feature)));});
    }
    c.features=[...manual,...generated];
    c.ruleState.autoFeatureIds=generated.map(f=>f.id);
    return c;
};
})();
