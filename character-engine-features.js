/* D&D Companion — Character Features & Proficiencies | D&D 5e 2014 */
(() => {
    'use strict';
    const engine = window.DnDCharacterEngine;
    if (!engine) return;
    const base = { ...engine.calculator };
    const ABILITIES = engine.abilities;
    const PROFICIENCY_TYPES = ['skill','savingThrow','weapon','armor','tool','language'];
    const FEATURE_TYPES = ['class','subclass','race','background','feat','other'];
    const ACTION_TYPES = ['action','bonusAction','reaction','free','passive','onHit','onDamage','onSave','triggered'];
    const clone = (v) => JSON.parse(JSON.stringify(v));

    function createProficiency(overrides = {}) { return { type:null, value:null, rank:'proficient', source:null, ...clone(overrides) }; }
    function createFeature(overrides = {}) {
        return { id:'', name:'', type:'other', source:null, level:1, active:true, description:'', prerequisites:[], choices:[], proficiencies:[], modifiers:[], grants:{features:[],spells:[],abilities:[]}, resources:[], actions:[], mechanics:{}, ...clone(overrides) };
    }
    function createFeatureChoice(overrides = {}) { return { id:'', label:'', type:'single', options:[], selected:null, required:true, ...clone(overrides) }; }
    function createFeatureResource(overrides = {}) { return { id:'', name:'', current:null, maximum:0, recovery:'longRest', formula:null, ...clone(overrides) }; }
    function createFeatureModifier(overrides = {}) { return { id:'', source:null, target:'', mode:'add', value:0, condition:null, ...clone(overrides) }; }

    function getCharacterFeatures(character) {
        return (character.features || character.abilities || []).filter((feature) => feature && feature.active !== false && (Number(character.identity?.level)||1) >= (Number(feature.level)||1));
    }

    function getFeatureProficiencies(character) {
        const result = [];
        getCharacterFeatures(character).forEach((feature) => (feature.proficiencies||[]).forEach((p) => {
            if (!PROFICIENCY_TYPES.includes(p.type)) return;
            result.push({ ...createProficiency(p), source:p.source || {type:'feature',id:feature.id,name:feature.name} });
        }));
        return result;
    }

    function getSkillRank(character, skill) {
        const explicit = character.proficiencies?.skills?.[skill];
        let rank = explicit?.expertise ? 'expertise' : explicit?.proficiency ? 'proficient' : 'none';
        getFeatureProficiencies(character).filter((p)=>p.type==='skill'&&p.value===skill).forEach((p)=>{
            if (p.rank==='expertise') rank='expertise'; else if (rank==='none') rank='proficient';
        });
        return rank;
    }

    function hasProficiency(character,type,value) {
        if (type==='skill') return getSkillRank(character,value)!=='none';
        const baseList={savingThrow:character.proficiencies?.savingThrows||[],weapon:character.proficiencies?.weapons||[],armor:character.proficiencies?.armor||[],tool:character.proficiencies?.tools||[],language:character.proficiencies?.languages||[]}[type]||[];
        return baseList.includes(value)||getFeatureProficiencies(character).some((p)=>p.type===type&&p.value===value);
    }

    function getFeatureModifiers(character) {
        const result=[];
        getCharacterFeatures(character).forEach((feature)=>(feature.modifiers||[]).forEach((modifier)=>result.push({
            ...createFeatureModifier(modifier), source:modifier.source||{type:'feature',id:feature.id,name:feature.name}, sourceName:modifier.sourceName||feature.name
        })));
        return result;
    }

    function wearingArmor(character) { return (character.items||[]).some((item)=>item?.equipment?.equipped&&item?.mechanics?.type==='armor'); }
    function conscious(character) { return character.status?.conscious!==false&&!character.status?.unconscious; }
    function conditionMet(character,condition) {
        if (!condition) return true;
        if (condition.type==='wearingArmor') return wearingArmor(character);
        if (condition.type==='conscious') return conscious(character);
        if (condition.type==='hasShield') return (character.items||[]).some((item)=>item?.equipment?.equipped&&item?.mechanics?.type==='shield');
        return false;
    }

    function resolveValue(character,value,target) {
        if (typeof value!=='string') return Number(value)||0;
        const map={strengthModifier:'strength',dexterityModifier:'dexterity',constitutionModifier:'constitution',intelligenceModifier:'intelligence',wisdomModifier:'wisdom'};
        if (map[value]) return base.getAbilityModifier(character,map[value]);
        if (value==='charismaModifier') {
            const mod=base.getAbilityModifier(character,'charisma');
            return target==='savingThrow'?Math.max(1,mod):mod;
        }
        return 0;
    }

    function applicableModifiers(character,target) {
        return getFeatureModifiers(character).filter((m)=>(!target||m.target===target)&&conditionMet(character,m.condition));
    }

    function asActiveEffects(character) {
        const derived=clone(character);
        derived.activeEffects=[...(derived.activeEffects||[]),...applicableModifiers(character).filter((m)=>m.target!=='savingThrow'&&m.target!=='conditionImmunity').map((m)=>({
            id:m.id,name:m.sourceName,source:m.source,target:m.target,mode:m.mode,value:resolveValue(character,m.value,m.target),condition:null,active:true
        }))];
        return derived;
    }

    function applyModifier(value,modifier) {
        const amount=resolveValue(modifier.character,modifier.value,modifier.target);
        if (modifier.mode==='subtract') return value-amount;
        if (modifier.mode==='multiply') return value*amount;
        if (modifier.mode==='set') return amount;
        return value+amount;
    }

    function getSkillModifier(character,skill) {
        const ability=engine.skills[skill]; if (!ability) return 0;
        const score=base.getAbilityModifier(character,ability), prof=base.getProficiencyBonus(character.identity.level), rank=getSkillRank(character,skill);
        return rank==='expertise'?score+prof*2:rank==='proficient'?score+prof:score;
    }

    function getSavingThrowModifier(character,ability) {
        let result=base.getAbilityModifier(character,ability);
        if (hasProficiency(character,'savingThrow',ability)) result+=base.getProficiencyBonus(character.identity.level);
        applicableModifiers(character,'savingThrow').forEach((m)=>{ result=applyModifier(result,{...m,character,target:'savingThrow'}); });
        return result;
    }

    function getArmorClass(character){return base.getArmorClass(asActiveEffects(character));}
    function getSpeed(character){return base.getSpeed(asActiveEffects(character));}
    function getInitiative(character){return base.getInitiative(asActiveEffects(character));}
    function getSpellAttackBonus(character){return base.getSpellAttackBonus(asActiveEffects(character));}
    function getSpellSaveDC(character){return base.getSpellSaveDC(asActiveEffects(character));}
    function getWeaponAttackBonus(character,item){return base.getWeaponAttackBonus(asActiveEffects(character),item);}

    function getWeaponDamage(character,item) {
        const damage=base.getWeaponDamage(asActiveEffects(character),item);
        const improved=getCharacterFeatures(character).find((feature)=>feature.id==='improved-divine-smite');
        if(improved&&item?.mechanics?.type==='weapon'&&item.mechanics.attack?.type!=='ranged') damage.push({dice:{count:1,die:'d8'},type:'radiant',ability:null,modifier:0,source:{type:'feature',id:improved.id,name:improved.name}});
        return damage;
    }

    function getFeatureResources(character) {
        const result=[];
        getCharacterFeatures(character).forEach((feature)=>(feature.resources||[]).forEach((resource)=>{
            const entry={...createFeatureResource(resource),source:{type:'feature',id:feature.id,name:feature.name}};
            if(entry.formula==='1 + charismaModifier') entry.maximum=Math.max(0,1+base.getAbilityModifier(character,'charisma'));
            if(entry.formula==='5 * paladinLevel') entry.maximum=5*(Number(character.identity?.level)||0);
            if(entry.formula==='max(1, charismaModifier)') entry.maximum=Math.max(1,base.getAbilityModifier(character,'charisma'));
            entry.current=entry.current==null?entry.maximum:Math.min(Math.max(0,Number(entry.current)||0),entry.maximum);
            result.push(entry);
        }));
        return result;
    }

    function getFeatureActions(character) {
        const result=[];
        getCharacterFeatures(character).forEach((feature)=>(feature.actions||[]).forEach((action)=>{
            const normalized=typeof action==='string'?{type:action}:{...action}; if(!ACTION_TYPES.includes(normalized.type)) return;
            result.push({...normalized,source:normalized.source||{type:'feature',id:feature.id,name:feature.name}});
        }));
        return result;
    }

    function getExtraAttacks(character){const feature=getCharacterFeatures(character).find((f)=>f.id==='extra-attack');return feature?.mechanics?.attacksPerAttackAction||1;}

    function getDerivedData(character) {
        const derived=base.getDerivedData(asActiveEffects(character));
        const skills=Object.fromEntries(Object.keys(engine.skills).map((skill)=>[skill,getSkillModifier(character,skill)]));
        const savingThrows=Object.fromEntries(ABILITIES.map((ability)=>[ability,getSavingThrowModifier(character,ability)]));
        const featureProficiencies=getFeatureProficiencies(character);
        const mergeList=(list,type)=>[...new Set([...(list||[]),...featureProficiencies.filter((p)=>p.type===type).map((p)=>p.value)])];
        return {...derived,skills,savingThrows,armorClass:getArmorClass(character),speed:getSpeed(character),initiative:getInitiative(character),spellAttackBonus:getSpellAttackBonus(character),spellSaveDC:getSpellSaveDC(character),weaponAttacksPerAttackAction:getExtraAttacks(character),features:getCharacterFeatures(character),featureResources:getFeatureResources(character),featureActions:getFeatureActions(character),featureModifiers:applicableModifiers(character),proficiencies:{skills:Object.fromEntries(Object.keys(engine.skills).map((skill)=>[skill,getSkillRank(character,skill)])),savingThrows:ABILITIES.filter((a)=>hasProficiency(character,'savingThrow',a)),weapons:mergeList(character.proficiencies?.weapons,'weapon'),armor:mergeList(character.proficiencies?.armor,'armor'),tools:mergeList(character.proficiencies?.tools,'tool'),languages:mergeList(character.proficiencies?.languages,'language')}};
    }

    // Core Paladin 5e 2014 definitions. The definitions are data and must be attached to a character to become active.
    const OFFICIAL_5E_2014={paladin:{fightingStyles:{
        defense:createFeature({id:'fighting-style-defense',name:'Defense',type:'class',level:2,modifiers:[createFeatureModifier({id:'defense-ac',target:'armorClass',mode:'add',value:1,condition:{type:'wearingArmor'}})]}),
        dueling:createFeature({id:'fighting-style-dueling',name:'Dueling',type:'class',level:2,mechanics:{damageBonus:2,condition:{type:'oneHandedMeleeWeapon',otherHandFree:true}}}),
        protection:createFeature({id:'fighting-style-protection',name:'Protection',type:'class',level:2,actions:[{type:'reaction',requires:['shield'],effect:'imposeDisadvantageOnAttackAgainstNearbyAlly'}]}),
        greatWeaponFighting:createFeature({id:'fighting-style-great-weapon-fighting',name:'Great Weapon Fighting',type:'class',level:2,mechanics:{rerollDamageDice:[1,2],requires:['twoHanded','versatileTwoHanded']}})
    },coreFeatures:{
        divineSense:createFeature({id:'divine-sense',name:'Divine Sense',type:'class',level:1,resources:[createFeatureResource({id:'divine-sense',name:'Divine Sense',recovery:'longRest',formula:'1 + charismaModifier'})],actions:[{type:'action'}]}),
        layOnHands:createFeature({id:'lay-on-hands',name:'Lay on Hands',type:'class',level:1,resources:[createFeatureResource({id:'lay-on-hands',name:'Lay on Hands',recovery:'longRest',formula:'5 * paladinLevel'})],actions:[{type:'action'}],mechanics:{healingPool:'5 * paladinLevel',cureCost:5}}),
        divineSmite:createFeature({id:'divine-smite',name:'Divine Smite',type:'class',level:2,actions:[{type:'onHit'}],mechanics:{requires:['meleeWeaponHit','spellSlot'],damage:{diceBySlot:{1:'2d8',2:'3d8',3:'4d8',4:'5d8',5:'5d8'},type:'radiant',undeadOrFiendExtraDie:true}}}),
        divineHealth:createFeature({id:'divine-health',name:'Divine Health',type:'class',level:3,modifiers:[createFeatureModifier({id:'disease-immunity',target:'conditionImmunity',mode:'add',value:'disease'})]}),
        extraAttack:createFeature({id:'extra-attack',name:'Extra Attack',type:'class',level:5,mechanics:{attacksPerAttackAction:2}}),
        auraOfProtection:createFeature({id:'aura-of-protection',name:'Aura of Protection',type:'class',level:6,modifiers:[createFeatureModifier({id:'aura-save',target:'savingThrow',mode:'add',value:'charismaModifier',condition:{type:'conscious',rangeFeet:10}})]}),
        auraOfCourage:createFeature({id:'aura-of-courage',name:'Aura of Courage',type:'class',level:10,modifiers:[createFeatureModifier({id:'fear-immunity',target:'conditionImmunity',mode:'add',value:'frightened',condition:{type:'conscious',rangeFeet:10}})]}),
        improvedDivineSmite:createFeature({id:'improved-divine-smite',name:'Improved Divine Smite',type:'class',level:11,mechanics:{extraMeleeWeaponDamage:{dice:'1d8',type:'radiant'}}}),
        cleansingTouch:createFeature({id:'cleansing-touch',name:'Cleansing Touch',type:'class',level:14,resources:[createFeatureResource({id:'cleansing-touch',name:'Cleansing Touch',recovery:'longRest',formula:'max(1, charismaModifier)'})],actions:[{type:'action'}]})
    }}}};

    engine.createProficiency=createProficiency;
    engine.createFeature=createFeature;
    engine.createFeatureChoice=createFeatureChoice;
    engine.createFeatureResource=createFeatureResource;
    engine.createFeatureModifier=createFeatureModifier;
    engine.proficiencyTypes=[...PROFICIENCY_TYPES];
    engine.featureTypes=[...FEATURE_TYPES];
    engine.actionTypes=[...ACTION_TYPES];
    engine.getCharacterFeatures=getCharacterFeatures;
    engine.getFeatureProficiencies=getFeatureProficiencies;
    engine.getFeatureModifiers=getFeatureModifiers;
    engine.getApplicableFeatureModifiers=applicableModifiers;
    engine.getFeatureResources=getFeatureResources;
    engine.getFeatureActions=getFeatureActions;
    engine.hasProficiency=hasProficiency;
    engine.getSkillRank=getSkillRank;
    engine.official5e2014=OFFICIAL_5E_2014;

    engine.calculator.getSkillModifier=getSkillModifier;
    engine.calculator.getSavingThrowModifier=getSavingThrowModifier;
    engine.calculator.getArmorClass=getArmorClass;
    engine.calculator.getSpeed=getSpeed;
    engine.calculator.getInitiative=getInitiative;
    engine.calculator.getSpellAttackBonus=getSpellAttackBonus;
    engine.calculator.getSpellSaveDC=getSpellSaveDC;
    engine.calculator.getWeaponAttackBonus=getWeaponAttackBonus;
    engine.calculator.getWeaponDamage=getWeaponDamage;
    engine.calculator.getDerivedData=getDerivedData;
})();
