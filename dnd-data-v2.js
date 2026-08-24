/* D&D Companion v2 — rules data
 * Ruleset: D&D 5e 2014 + optional Xanathar/Tasha content.
 * Mechanics are stored as structured data; UI never owns rules.
 */
(() => {
  'use strict';
  const A = ['strength','dexterity','constitution','intelligence','wisdom','charisma'];
  const SKILLS = {
    athletics:'strength', acrobatics:'dexterity', sleightOfHand:'dexterity', stealth:'dexterity',
    arcana:'intelligence', history:'intelligence', investigation:'intelligence', nature:'intelligence', religion:'intelligence',
    animalHandling:'wisdom', insight:'wisdom', medicine:'wisdom', perception:'wisdom', survival:'wisdom',
    deception:'charisma', intimidation:'charisma', performance:'charisma', persuasion:'charisma'
  };
  const SOURCES = {
    phb2014:{id:'phb2014',name:"Player's Handbook", optional:false},
    xanathar:{id:'xanathar',name:"Xanathar's Guide to Everything",optional:true},
    tasha:{id:'tasha',name:"Tasha's Cauldron of Everything",optional:true}
  };
  const CLASS = (id,name,hitDie,primary,save,spell)=>({id,name,hitDie,primary,save,spell});
  const CLASSES = {
    barbarian:CLASS('barbarian','Barbarian',12,['strength','constitution'],['strength','constitution'],null),
    bard:CLASS('bard','Bard',8,['charisma'],['dexterity','charisma'],'charisma'),
    cleric:CLASS('cleric','Cleric',8,['wisdom'],['wisdom','charisma'],'wisdom'),
    druid:CLASS('druid','Druid',8,['wisdom'],['intelligence','wisdom'],'wisdom'),
    fighter:CLASS('fighter','Fighter',10,['strength','dexterity'],['strength','constitution'],null),
    monk:CLASS('monk','Monk',8,['dexterity','wisdom'],['strength','dexterity'], 'wisdom'),
    paladin:CLASS('paladin','Paladin',10,['strength','charisma'],['wisdom','charisma'],'charisma'),
    ranger:CLASS('ranger', 'Ranger',10,['dexterity','wisdom'],['strength','dexterity'], 'wisdom'),
    rogue:CLASS('rogue','Rogue',8,['dexterity'],['dexterity','intelligence'],null),
    sorcerer:CLASS('sorcerer','Sorcerer',6,['charisma'],['constitution','charisma'],'charisma'),
    warlock:CLASS('warlock','Warlock',8,['charisma'],['wisdom','charisma'],'charisma'),
    wizard:CLASS('wizard','Wizard',6,['intelligence'],['intelligence','wisdom'],'intelligence'),
    artificer:CLASS('artificer','Artificer',8,['intelligence'],['constitution','intelligence'],'intelligence')
  };
  const SUBCLASSES = [
    ['barbarian','berserker','Path of the Berserker','phb2014'],['barbarian','totem','Path of the Totem Warrior','phb2014'],
    ['bard','lore','College of Lore','phb2014'],['bard','valor','College of Valor','phb2014'],
    ['cleric','knowledge','Knowledge Domain','phb2014'],['cleric','life','Life Domain','phb2014'],['cleric','light','Light Domain','phb2014'],['cleric','nature','Nature Domain','phb2014'],['cleric','tempest','Tempest Domain','phb2014'],['cleric','trickery','Trickery Domain','phb2014'],['cleric','war','War Domain','phb2014'],
    ['druid','land','Circle of the Land','phb2014'],['druid','moon','Circle of the Moon','phb2014'],
    ['fighter','champion','Champion','phb2014'],['fighter','battle-master','Battle Master','phb2014'],['fighter','eldritch-knight','Eldritch Knight','phb2014'],
    ['monk','open-hand','Way of the Open Hand','phb2014'],['monk','shadow','Way of Shadow','phb2014'],['monk','four-elements','Way of the Four Elements','phb2014'],
    ['paladin','devotion','Oath of Devotion','phb2014'],['paladin','ancients','Oath of the Ancients','phb2014'],['paladin','vengeance','Oath of Vengeance','phb2014'],
    ['ranger','hunter','Hunter','phb2014'],['ranger','beast-master','Beast Master','phb2014'],
    ['rogue','thief','Thief','phb2014'],['rogue','assassin','Assassin','phb2014'],['rogue','arcane-trickster','Arcane Trickster','phb2014'],
    ['sorcerer','draconic','Draconic Bloodline','phb2014'],['sorcerer','wild-magic','Wild Magic','phb2014'],
    ['warlock','archfey','The Archfey','phb2014'],['warlock','fiend','The Fiend','phb2014'],['warlock','great-old-one','The Great Old One','phb2014'],
    ['wizard','abjuration','School of Abjuration','phb2014'],['wizard','conjuration','School of Conjuration','phb2014'],['wizard','divination','School of Divination','phb2014'],['wizard','enchantment','School of Enchantment','phb2014'],['wizard','evocation','School of Evocation','phb2014'],['wizard','illusion','School of Illusion','phb2014'],['wizard','necromancy','School of Necromancy','phb2014'],['wizard','transmutation','School of Transmutation','phb2014'],
    ['barbarian','ancestral-guardian','Path of the Ancestral Guardian','xanathar'],['barbarian','storm-herald','Path of the Storm Herald','xanathar'],['barbarian','zealot','Path of the Zealot','xanathar'],
    ['bard','whispers','College of Whispers','xanathar'],['bard','glamour','College of Glamour','xanathar'],['bard','swords','College of Swords','xanathar'],
    ['cleric','forge','Forge Domain','xanathar'],['cleric','grave','Grave Domain','xanathar'],
    ['druid','dreams','Circle of Dreams','xanathar'],['druid','shepherd','Circle of the Shepherd','xanathar'],
    ['fighter','arcane-archer','Arcane Archer','xanathar'],['fighter','cavalier','Cavalier','xanathar'],['fighter','samurai','Samurai','xanathar'],
    ['monk','kensei','Way of the Kensei','xanathar'],['monk','drunken-master','Way of the Drunken Master','xanathar'],['monk','sun-soul','Way of the Sun Soul','xanathar'],
    ['paladin','conquest','Oath of Conquest','xanathar'],['paladin','redemption','Oath of Redemption','xanathar'],
    ['ranger','gloom-stalker','Gloom Stalker','xanathar'],['ranger','monster-slayer','Monster Slayer','xanathar'],['ranger','horizon-walker','Horizon Walker','xanathar'],
    ['rogue','scout','Scout','xanathar'],['rogue','inquisitive','Inquisitive','xanathar'],['rogue','mastermind','Mastermind','xanathar'],['rogue','swashbuckler','Swashbuckler','xanathar'],
    ['sorcerer','divine-soul','Divine Soul','xanathar'],['sorcerer','shadow-magic','Shadow Magic','xanathar'],['sorcerer','storm-sorcery','Storm Sorcery','xanathar'],
    ['warlock','celestial','The Celestial','xanathar'],['warlock','hexblade','The Hexblade','xanathar'],
    ['wizard','war-magic','War Magic','xanathar'],
    ['barbarian','beast','Path of the Beast','tasha'],['barbarian','wild-soul','Path of Wild Magic','tasha'],
    ['bard','eloquence','College of Eloquence','tasha'],['bard','creation','College of Creation','tasha'],
    ['cleric','twilight','Twilight Domain','tasha'],['cleric','order','Order Domain','tasha'],['cleric','peace','Peace Domain','tasha'],
    ['druid','wildfire','Circle of Wildfire','tasha'],['druid','stars','Circle of Stars','tasha'],['druid','spores','Circle of Spores','tasha'],
    ['fighter','psi-warrior','Psi Warrior','tasha'],['fighter','rune-knight','Rune Knight','tasha'],
    ['monk','astral-self','Way of the Astral Self','tasha'],['monk','mercy','Way of Mercy','tasha'],
    ['paladin','watchers','Oath of the Watchers','tasha'],['paladin','glory','Oath of Glory','tasha'],
    ['ranger','swarmkeeper','Swarmkeeper','tasha'],['ranger','fey-wanderer','Fey Wanderer','tasha'],
    ['rogue','phantom','Phantom','tasha'],['rogue','soulknife','Soulknife','tasha'],
    ['sorcerer','aberrant-mind','Aberrant Mind','tasha'],['sorcerer','clockwork-soul','Clockwork Soul','tasha'],
    ['wizard','bladesinging','Bladesinging','tasha'],['wizard','order-of-scribes','Order of Scribes','tasha']
  ].map(([classId,id,name,source])=>({id,classId,name,source}));
  const HIT_DICE = Object.fromEntries(Object.values(CLASSES).map(c=>[c.id,`d${c.hitDie}`]));
  const SPELL_SLOTS = [null,[2], [3], [4,2], [4,3], [4,3,2], [4,3,3], [4,3,3,1], [4,3,3,2], [4,3,3,3,1], [4,3,3,3,2], [4,3,3,3,2,1], [4,3,3,3,2,1,1], [4,3,3,3,2,1,1,1], [4,3,3,3,2,1,1,1,1], [4,3,3,3,2,1,1,1,1], [4,3,3,3,2,1,1,1,1], [4,3,3,3,2,1,1,1,1], [4,3,3,3,2,1,1,1,1], [4,3,3,3,2,1,1,1,1], [4,3,3,3,2,1,1,1,1]];
  const CLASS_FEATURES = {
    paladin:[{level:1,id:'divine-sense',name:'Divine Sense'},{level:1,id:'lay-on-hands',name:'Lay on Hands'},{level:2,id:'divine-smite',name:'Divine Smite'},{level:2,id:'fighting-style',name:'Fighting Style'},{level:5,id:'extra-attack',name:'Extra Attack'},{level:6,id:'aura-of-protection',name:'Aura of Protection'},{level:10,id:'aura-of-courage',name:'Aura of Courage'},{level:11,id:'improved-divine-smite',name:'Improved Divine Smite'}],
    fighter:[{level:1,id:'second-wind',name:'Second Wind'},{level:2,id:'action-surge',name:'Action Surge'},{level:5,id:'extra-attack',name:'Extra Attack'},{level:9,id:'indomitable',name:'Indomitable'}],
    rogue:[{level:1,id:'sneak-attack',name:'Sneak Attack'},{level:2,id:'cunning-action',name:'Cunning Action'},{level:5,id:'uncanny-dodge',name:'Uncanny Dodge'},{level:7,id:'evasion',name:'Evasion'}],
    barbarian:[{level:1,id:'rage',name:'Rage'},{level:2,id:'reckless-attack',name:'Reckless Attack'},{level:5,id:'extra-attack',name:'Extra Attack'},{level:7,id:'feral-instinct',name:'Feral Instinct'}],
    monk:[{level:1,id:'martial-arts',name:'Martial Arts'},{level:2,id:'ki',name:'Ki'},{level:5,id:'extra-attack',name:'Extra Attack'},{level:7,id:'evasion',name:'Evasion'}],
    bard:[{level:1,id:'bardic-inspiration',name:'Bardic Inspiration'},{level:2,id:'jack-of-all-trades',name:'Jack of All Trades'},{level:5,id:'font-of-inspiration',name:'Font of Inspiration'},{level:6,id:'extra-attack',name:'Countercharm'}],
    cleric:[{level:2,id:'channel-divinity',name:'Channel Divinity'}], druid:[{level:2,id:'wild-shape',name:'Wild Shape'}],
    ranger:[{level:2,id:'fighting-style',name:'Fighting Style'},{level:5,id:'extra-attack',name:'Extra Attack'}],
    sorcerer:[{level:2,id:'font-of-magic',name:'Font of Magic'},{level:3,id:'metamagic',name:'Metamagic'}],
    warlock:[{level:2,id:'eldritch-invocations',name:'Eldritch Invocations'},{level:3,id:'pact-boon',name:'Pact Boon'}],
    wizard:[{level:1,id:'arcane-recovery',name:'Arcane Recovery'}],
    artificer:[{level:2,id:'infuse-item',name:'Infuse Item'},{level:3,id:'right-tool-for-the-job',name:'Right Tool for the Job'}]
  };
  window.DnDDataV2 = {ABILITIES:A,SKILLS,SOURCES,CLASSES,SUBCLASSES,HIT_DICE,SPELL_SLOTS,CLASS_FEATURES};
})();