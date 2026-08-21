/*
 * D&D Companion — Character creation option data
 * Ruleset: D&D 5e 2014
 *
 * This file contains compact rule metadata for the Character Sheet.
 * It intentionally keeps presentation out of the rules layer.
 */
(() => {
    'use strict';
    const engine = window.DnDCharacterEngine;
    if (!engine) return;

    const clone = value => JSON.parse(JSON.stringify(value));
    const classData = {
        Barbarian:{hitDie:'d12',saves:['strength','constitution'],armor:['light','medium','shields'],weapons:['simple','martial'],spellcasting:null},
        Bard:{hitDie:'d8',saves:['dexterity','charisma'],armor:['light'],weapons:['simple','hand crossbow','longsword','rapier','shortsword'],spellcasting:'charisma'},
        Cleric:{hitDie:'d8',saves:['wisdom','charisma'],armor:['light','medium','shields'],weapons:['simple'],spellcasting:'wisdom'},
        Druid:{hitDie:'d8',saves:['intelligence','wisdom'],armor:['light','medium','shields'],weapons:['druid'],spellcasting:'wisdom'},
        Fighter:{hitDie:'d10',saves:['strength','constitution'],armor:['light','medium','heavy','shields'],weapons:['simple','martial'],spellcasting:null},
        Monk:{hitDie:'d8',saves:['strength','dexterity'],armor:[],weapons:['simple','shortsword'],spellcasting:null},
        Paladin:{hitDie:'d10',saves:['wisdom','charisma'],armor:['light','medium','heavy','shields'],weapons:['simple','martial'],spellcasting:'charisma'},
        Ranger:{hitDie:'d10',saves:['strength','dexterity'],armor:['light','medium','shields'],weapons:['simple','martial'],spellcasting:'wisdom'},
        Rogue:{hitDie:'d8',saves:['dexterity','intelligence'],armor:['light'],weapons:['simple','hand crossbow','longsword','rapier','shortsword'],spellcasting:null},
        Sorcerer:{hitDie:'d6',saves:['constitution','charisma'],armor:[],weapons:['dagger','dart','sling','quarterstaff','light crossbow'],spellcasting:'charisma'},
        Warlock:{hitDie:'d8',saves:['wisdom','charisma'],armor:['light'],weapons:['simple'],spellcasting:'charisma'},
        Wizard:{hitDie:'d6',saves:['intelligence','wisdom'],armor:[],weapons:['dagger','dart','sling','quarterstaff','light crossbow'],spellcasting:'intelligence'}
    };

    const subclasses = {
        Barbarian:[['Path of the Berserker',3],['Path of the Totem Warrior',3]],
        Bard:[['College of Lore',3],['College of Valor',3]],
        Cleric:[['Knowledge Domain',1],['Life Domain',1],['Light Domain',1],['Nature Domain',1],['Tempest Domain',1],['Trickery Domain',1],['War Domain',1]],
        Druid:[['Circle of the Land',2],['Circle of the Moon',2]],
        Fighter:[['Champion',3],['Battle Master',3],['Eldritch Knight',3]],
        Monk:[['Way of the Open Hand',3],['Way of Shadow',3],['Way of the Four Elements',3]],
        Paladin:[['Oath of Devotion',3],['Oath of the Ancients',3],['Oath of Vengeance',3]],
        Ranger:[['Hunter',3],['Beast Master',3]],
        Rogue:[['Thief',3],['Assassin',3],['Arcane Trickster',3]],
        Sorcerer:[['Draconic Bloodline',1],['Wild Magic',1]],
        Warlock:[['The Archfey',1],['The Fiend',1],['The Great Old One',1]],
        Wizard:[['School of Abjuration',2],['School of Conjuration',2],['School of Divination',2],['School of Enchantment',2],['School of Evocation',2],['School of Illusion',2],['School of Necromancy',2],['School of Transmutation',2]]
    };

    const races = {
        Dwarf:{size:'Medium',speed:25,abilityBonuses:{constitution:2},languages:['Common','Dwarvish']},
        Elf:{size:'Medium',speed:30,abilityBonuses:{dexterity:2},languages:['Common','Elvish']},
        Halfling:{size:'Small',speed:25,abilityBonuses:{dexterity:2},languages:['Common','Halfling']},
        Human:{size:'Medium',speed:30,abilityBonuses:{strength:1,dexterity:1,constitution:1,intelligence:1,wisdom:1,charisma:1},languages:['Common']},
        Dragonborn:{size:'Medium',speed:30,abilityBonuses:{strength:2,charisma:1},languages:['Common','Draconic'],ancestry:true},
        Gnome:{size:'Small',speed:25,abilityBonuses:{intelligence:2},languages:['Common','Gnomish']},
        'Half-Elf':{size:'Medium',speed:30,abilityBonuses:{charisma:2},languages:['Common','Elvish'],flexibleAbilityBonuses:2},
        'Half-Orc':{size:'Medium',speed:30,abilityBonuses:{strength:2,constitution:1},languages:['Common','Orc']},
        Tiefling:{size:'Medium',speed:30,abilityBonuses:{charisma:2,intelligence:1},languages:['Common','Infernal']}
    };

    const dragonAncestry = {
        Black:['acid','Dexterity'],Blue:['lightning','Dexterity'],Brass:['fire','Dexterity'],Bronze:['lightning','Dexterity'],Copper:['acid','Dexterity'],
        Gold:['fire','Dexterity'],Green:['poison','Constitution'],Red:['fire','Dexterity'],Silver:['cold','Constitution'],White:['cold','Constitution']
    };

    const backgrounds = {
        Acolyte:{skills:['insight','religion'],languages:2},
        Charlatan:{skills:['deception','sleightOfHand'],tools:['disguise kit','forgery kit']},
        Criminal:{skills:['deception','stealth'],tools:['thieves\' tools','gaming set']},
        Entertainer:{skills:['acrobatics','performance'],tools:['disguise kit','musical instrument']},
        'Folk Hero':{skills:['animalHandling','survival'],tools:['artisan\'s tools','vehicles (land)']},
        'Guild Artisan':{skills:['insight','persuasion'],tools:['artisan\'s tools'],languages:1},
        Hermit:{skills:['medicine','religion'],tools:['herbalism kit'],languages:1},
        Noble:{skills:['history','persuasion'],tools:['gaming set'],languages:1},
        Outlander:{skills:['athletics','survival'],tools:['musical instrument'],languages:1},
        Sage:{skills:['arcana','history'],languages:2},
        Sailor:{skills:['athletics','perception'],tools:['navigator\'s tools','vehicles (water)']},
        Soldier:{skills:['athletics','intimidation'],tools:['gaming set','vehicles (land)']},
        Urchin:{skills:['sleightOfHand','stealth'],tools:['disguise kit','thieves\' tools']}
    };

    const paladinSpellSlots = [
        [],[0,0,0,0,0],[2,0,0,0,0],[3,0,0,0,0],[3,0,0,0,0],[4,2,0,0,0],[4,2,0,0,0],[4,3,0,0,0],[4,3,0,0,0],[4,3,2,0,0],[4,3,2,0,0],[4,3,3,0,0],[4,3,3,0,0],[4,3,3,1,0],[4,3,3,1,0],[4,3,3,2,0],[4,3,3,2,0],[4,3,3,3,1],[4,3,3,3,1],[4,3,3,3,2],[4,3,3,3,2]
    ];

    const fullCasterSlots = [
        [],[2,0,0,0,0,0,0,0,0],[3,0,0,0,0,0,0,0,0],[4,2,0,0,0,0,0,0,0],[4,3,0,0,0,0,0,0,0],[4,3,2,0,0,0,0,0,0],[4,3,3,0,0,0,0,0,0],[4,3,3,1,0,0,0,0,0],[4,3,3,2,0,0,0,0,0],[4,3,3,3,1,0,0,0,0],[4,3,3,3,2,0,0,0,0],[4,3,3,3,2,1,0,0,0],[4,3,3,3,2,1,0,0,0],[4,3,3,3,2,1,1,0,0],[4,3,3,3,2,1,1,0,0],[4,3,3,3,2,1,1,1,0],[4,3,3,3,2,1,1,1,0],[4,3,3,3,2,1,1,1,1],[4,3,3,3,3,1,1,1,1],[4,3,3,3,3,2,1,1,1],[4,3,3,3,3,2,2,1,1]
    ];

    const classOrder = Object.keys(classData);
    const raceOrder = Object.keys(races);
    const backgroundOrder = Object.keys(backgrounds);

    function ensureShape(character) {
        character.ruleState = character.ruleState || {};
        character.ruleState.raceInitialized = Boolean(character.ruleState.raceInitialized);
        character.ruleState.classInitialized = Boolean(character.ruleState.classInitialized);
        character.ruleState.backgroundInitialized = Boolean(character.ruleState.backgroundInitialized);
        character.abilityScoreBonuses = character.abilityScoreBonuses || {};
        character.proficiencies = character.proficiencies || {};
        character.proficiencies.savingThrows = character.proficiencies.savingThrows || [];
        character.proficiencies.skills = character.proficiencies.skills || {};
        character.proficiencies.armor = character.proficiencies.armor || [];
        character.proficiencies.weapons = character.proficiencies.weapons || [];
        character.resources = character.resources || {};
        character.resources.hp = character.resources.hp || {maximum:1,current:1,temporary:0};
        character.resources.hitDice = character.resources.hitDice || {current:1,maximum:1,die:'d8'};
        character.resources.spellSlots = character.resources.spellSlots || {};
        return character;
    }

    function abilityModifier(score){ return Math.floor(((Number(score)||0)-10)/2); }
    function setAbilityBonuses(character, bonuses){
        character.abilityScoreBonuses = clone(bonuses || {});
    }

    function setProficiencyList(character, key, values){ character.proficiencies[key] = [...new Set(values || [])]; }

    function classSpellSlots(className, level){
        const l=Math.max(1,Math.min(20,Number(level)||1));
        if (className==='Paladin'||className==='Ranger') return paladinSpellSlots[l] || [0,0,0,0,0];
        if (['Bard','Cleric','Druid','Sorcerer','Wizard'].includes(className)) return (fullCasterSlots[l]||[]).slice(0,9);
        return [];
    }

    function hitPointMaximum(character){
        const cls=classData[character.identity?.class];
        const level=Math.max(1,Math.min(20,Number(character.identity?.level)||1));
        const die=Number(String(cls?.hitDie||'d8').replace('d',''))||8;
        const con=abilityModifier(Number(character.abilityScores?.constitution||10)+(Number(character.abilityScoreBonuses?.constitution)||0));
        return Math.max(1,die+con+(level-1)*(Math.floor(die/2)+1+con));
    }

    function syncClass(character, explicit=false){
        ensureShape(character); const name=character.identity.class; const data=classData[name]; if(!data)return;
        character.resources.hitDice.maximum=Math.max(1,Number(character.identity.level)||1);
        character.resources.hitDice.current=Math.min(Number(character.resources.hitDice.current)||character.resources.hitDice.maximum,character.resources.hitDice.maximum);
        character.resources.hitDice.die=data.hitDie;
        if(explicit || !character.ruleState.classInitialized){
            setProficiencyList(character,'savingThrows',data.saves);
            setProficiencyList(character,'armor',data.armor);
            setProficiencyList(character,'weapons',data.weapons);
            character.spellcasting=character.spellcasting||{};
            character.spellcasting.ability=data.spellcasting||null;
        }
        const slots=classSpellSlots(name,character.identity.level);
        character.resources.spellSlots={}; slots.forEach((count,index)=>{if(count>0)character.resources.spellSlots[String(index+1)]={current:count,maximum:count};});
        if(data.spellcasting) character.spellcasting.ability=data.spellcasting;
        character.ruleState.classInitialized=true;
    }

    function syncRace(character, explicit=false){
        ensureShape(character); const key=character.identity.race==='Draconide'?'Dragonborn':character.identity.race; const data=races[key]; if(!data)return;
        if(explicit || !character.ruleState.raceInitialized){
            setAbilityBonuses(character,data.abilityBonuses);
            character.identity.size=data.size;
            character.baseSpeed=data.speed;
            character.ruleState.raceInitialized=true;
        }
        if(key==='Dragonborn'){
            character.dragonAncestry=character.dragonAncestry||'Red';
            const ancestry=dragonAncestry[character.dragonAncestry]||dragonAncestry.Red;
            character.defenses=character.defenses||{};
            character.defenses.resistances=[ancestry[0]];
        }
    }

    function syncBackground(character, explicit=false){
        ensureShape(character); const data=backgrounds[character.identity.background]; if(!data)return;
        if(explicit || !character.ruleState.backgroundInitialized){
            data.skills.forEach(skill=>{character.proficiencies.skills[skill]={...(character.proficiencies.skills[skill]||{}),proficiency:true};});
            character.ruleState.backgroundInitialized=true;
        }
    }

    function syncCharacterRules(character){
        ensureShape(character);
        syncClass(character,false); syncRace(character,false); syncBackground(character,false);
        return character;
    }

    function applySelection(character,type,value){
        ensureShape(character);
        if(type==='race'){character.identity.race=value;syncRace(character,true);}
        if(type==='class'){character.identity.class=value;character.identity.subclass='';syncClass(character,true);}
        if(type==='subclass'){character.identity.subclass=value;}
        if(type==='background'){character.identity.background=value;syncBackground(character,true);}
        const hp=hitPointMaximum(character); const old=Number(character.resources.hp.maximum)||1;
        if(!character.resources.hp.manualMaximum || old===1 || old===hitPointMaximum({...character,identity:{...character.identity,level:Math.max(1,(Number(character.identity.level)||1)-1)}})){
            character.resources.hp.maximum=hp;
            if(Number(character.resources.hp.current)||0<=1) character.resources.hp.current=hp;
        }
        return character;
    }

    function getRaceAncestries(){return Object.keys(dragonAncestry);}
    function getSubclasses(className){return (subclasses[className]||[]).map(([name,level])=>({name,level}));}
    function getClassData(){return clone(classData);}
    function getRaceData(){return clone(races);}
    function getBackgroundData(){return clone(backgrounds);}

    engine.characterOptions={classData:clone(classData),races:clone(races),backgrounds:clone(backgrounds),subclasses:clone(subclasses),dragonAncestry:clone(dragonAncestry)};
    engine.getCharacterClassData=getClassData;
    engine.getCharacterRaceData=getRaceData;
    engine.getCharacterBackgroundData=getBackgroundData;
    engine.getCharacterSubclasses=getSubclasses;
    engine.getDragonAncestries=getRaceAncestries;
    engine.getHitPointMaximum=hitPointMaximum;
    engine.syncCharacterRules=syncCharacterRules;
    engine.applyCharacterSelection=applySelection;
    engine.getCharacterSpellSlots=(character)=>clone(character.resources?.spellSlots||{});
})();
