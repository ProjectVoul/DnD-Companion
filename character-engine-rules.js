/* D&D Companion — 5e 2014 rules / combat calculation layer */
(() => {
    'use strict';
    const engine = window.DnDCharacterEngine;
    if (!engine) return;
    const calculator = engine.calculator;
    const ABILITIES = engine.abilities;
    const clone = value => JSON.parse(JSON.stringify(value));

    function abilityModifier(score) { return Math.floor(((Number(score) || 0) - 10) / 2); }
    function proficiencyBonus(level) { const l=Math.max(1,Number(level)||1); return 2+Math.floor((l-1)/4); }
    function isEquipped(item){return item?.equipment?.equipped===true||item?.equipped===true;}
    function getAllModifiers(character) {
        const modifiers=[];
        (character.items||[]).forEach(item=>{
            if(!isEquipped(item)) return;
            (item.modifiers||[]).forEach(modifier=>modifiers.push({...modifier,source:modifier.source||{type:'item',id:item.id},sourceName:modifier.sourceName||item.name||'Item'}));
        });
        (character.activeEffects||[]).filter(effect=>effect?.active!==false).forEach(effect=>modifiers.push({id:effect.id,source:effect.source,sourceName:effect.source?.name||effect.name||'Active Effect',target:effect.target,mode:effect.mode,value:effect.value,condition:effect.condition}));
        return modifiers;
    }
    function getTargetModifiers(character,target){return getAllModifiers(character).filter(modifier=>modifier.target===target);}
    function applyModifier(value,modifier){const n=Number(modifier.value)||0;switch(modifier.mode){case'subtract':return value-n;case'multiply':return value*n;case'set':return n;default:return value+n;}}
    function applyTargetModifiers(value,character,target){return getTargetModifiers(character,target).reduce(applyModifier,value);}

    function getEffectiveAbilityScore(character,ability){
        const base=Number(character.abilityScores?.[ability])||0;
        const racial=Number(character.abilityScoreBonuses?.[ability])||0;
        return applyTargetModifiers(base+racial,character,ability);
    }
    function getAbilityModifier(character,ability){return abilityModifier(getEffectiveAbilityScore(character,ability));}

    function getWeaponAbility(character,item){
        const mechanics=item?.mechanics||{}; const attack=mechanics.attack||{}; const properties=mechanics.properties||[];
        if(properties.includes('finesse')){
            const choice=attack.ability||character.weaponChoices?.[item.id];
            return choice==='strength'||choice==='dexterity'?choice:null;
        }
        if(ABILITIES.includes(attack.ability)) return attack.ability;
        return attack.type==='ranged'?'dexterity':'strength';
    }

    function weaponProficient(character,item){
        const prof=item?.proficiency;
        const list=character.proficiencies?.weapons||[];
        if(!prof||prof.type==='none') return list.includes(item.name);
        if(list.includes(item.name)) return true;
        if(prof.type==='simple') return list.includes('simple')||list.includes('Simple weapons')||list.includes('simple weapons');
        if(prof.type==='martial') return list.includes('martial')||list.includes('Martial weapons')||list.includes('martial weapons');
        return false;
    }

    function getWeaponAttackBonus(character,item){
        if(!item||item.mechanics?.type!=='weapon')return null;
        const ability=getWeaponAbility(character,item); if(!ability)return null;
        const abilityBonus=getAbilityModifier(character,ability);
        const proficiency=weaponProficient(character,item)?proficiencyBonus(character.identity.level):0;
        const weaponBonus=Number(item.mechanics?.attack?.bonus)||0;
        return applyTargetModifiers(abilityBonus+proficiency+weaponBonus,character,'weaponAttackBonus');
    }

    function getWeaponDamage(character,item){
        if(!item||item.mechanics?.type!=='weapon')return[];
        const attackAbility=getWeaponAbility(character,item); if(!attackAbility)return[];
        return (item.mechanics.damage||[]).map(damage=>{
            const damageAbility=ABILITIES.includes(damage?.ability)?damage.ability:attackAbility;
            const abilityMod=getAbilityModifier(character,damageAbility);
            return {dice:clone(damage.dice||{count:0,die:null}),type:damage.type,ability:damageAbility,modifier:(Number(damage.modifier)||0)+abilityMod,source:damage.source||{type:'item',id:item.id}};
        });
    }

    function getEquippedArmor(character){return(character.items||[]).find(item=>isEquipped(item)&&item?.mechanics?.type==='armor')||null;}
    function getEquippedShield(character){return(character.items||[]).find(item=>isEquipped(item)&&item?.mechanics?.type==='shield')||null;}

    function getArmorClassBreakdown(character){
        const armor=getEquippedArmor(character), shield=getEquippedShield(character), entries=[];
        let total;
        if(!armor){
            total=10+getAbilityModifier(character,'dexterity');
            entries.push({source:{type:'rules',id:'unarmored-ac'},label:'Unarmored base AC',mode:'set',value:10});
            const dex=getAbilityModifier(character,'dexterity'); if(dex)entries.push({source:{type:'ability',id:'dexterity'},label:'Dexterity modifier',mode:'add',value:dex});
        }else{
            const m=armor.mechanics||{}, base=Number(m.armorClass)||10, category=m.category||'light';
            total=base;
            entries.push({source:{type:'item',id:armor.id},label:armor.name||'Armor',mode:'set',value:base});
            if(category!=='heavy'&&m.dexterity?.applies!==false){
                const dex=getAbilityModifier(character,'dexterity'); const max=category==='medium'?(m.dexterity?.maximum??2):null; const contribution=max===null?dex:Math.min(dex,Number(max));
                if(contribution)entries.push({source:{type:'ability',id:'dexterity'},label:max===null?'Dexterity modifier':'Dexterity modifier (medium armor cap)',mode:'add',value:contribution});
                total+=contribution;
            }
        }
        if(shield){const bonus=Number(shield.mechanics?.armorBonus)||0;if(bonus){entries.push({source:{type:'item',id:shield.id},label:shield.name||'Shield',mode:'add',value:bonus});total+=bonus;}}
        getTargetModifiers(character,'armorClass').forEach(modifier=>{entries.push({source:modifier.source,label:modifier.sourceName||'Modifier',mode:modifier.mode,value:Number(modifier.value)||0,condition:modifier.condition||null});total=applyModifier(total,modifier);});
        let running=0; const breakdown=entries.map(entry=>{running=entry.mode==='set'?Number(entry.value)||0:applyModifier(running,entry);return{...entry,result:running};});
        return {total,breakdown,armorId:armor?.id||null,shieldId:shield?.id||null,calculation:armor?'standard-armor':'unarmored'};
    }
    function getArmorClass(character){return getArmorClassBreakdown(character).total;}

    function getSpeedBreakdown(character){
        const entries=[]; let total=Number(character.baseSpeed); if(!Number.isFinite(total))total=30;
        entries.push({source:{type:'character',id:'base-speed'},label:'Base speed',mode:'set',value:total});
        const armor=getEquippedArmor(character), requirement=Number(armor?.mechanics?.strengthRequirement)||0, strength=getEffectiveAbilityScore(character,'strength');
        if(requirement>0&&strength<requirement){entries.push({source:{type:'rules',id:'heavy-armor-strength'},label:'Armor Strength requirement',mode:'subtract',value:10,condition:`Strength ${strength} < ${requirement}`});total-=10;}
        getTargetModifiers(character,'speed').forEach(modifier=>{entries.push({source:modifier.source,label:modifier.sourceName||'Speed modifier',mode:modifier.mode,value:Number(modifier.value)||0,condition:modifier.condition||null});total=applyModifier(total,modifier);});
        let running=0;const breakdown=entries.map(entry=>{running=entry.mode==='set'?Number(entry.value)||0:applyModifier(running,entry);return{...entry,result:running};});
        return{total:running,breakdown};
    }
    function getSpeed(character){return getSpeedBreakdown(character).total;}

    calculator.getAbilityModifier=getAbilityModifier;
    calculator.getEffectiveAbilityScore=getEffectiveAbilityScore;
    calculator.getWeaponAbility=getWeaponAbility;
    calculator.getWeaponAttackBonus=getWeaponAttackBonus;
    calculator.getWeaponDamage=getWeaponDamage;
    calculator.isWeaponProficient=weaponProficient;
    calculator.getArmorClassBreakdown=getArmorClassBreakdown;
    calculator.getACBreakdown=getArmorClassBreakdown;
    calculator.getArmorClass=getArmorClass;
    calculator.getSpeedBreakdown=getSpeedBreakdown;
    calculator.getSpeed=getSpeed;
})();
