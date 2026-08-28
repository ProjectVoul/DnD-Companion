import type {Feature, FeatureSource} from '../types';

export interface SubclassFeature extends Feature {
  source: 'subclass';
  subclassId: string;
}

const f = (id:string, name:string, subclassId:string, level:number, description:string, optional=false):SubclassFeature => ({
  id, name, subclassId, level, source:'subclass', description, optional,
});

export const SUBCLASS_FEATURES: SubclassFeature[] = [
  // PHB 2014 — Battle Master
  f('fighter.battle-master.combat-superiority','Combat Superiority','fighter.battle-master',3,'You learn maneuvers and gain superiority dice; the subclass feature includes the maneuver and superiority-die rules.'),
  f('fighter.battle-master.know-your-enemy','Know Your Enemy','fighter.battle-master',7,'You can spend 1 minute observing or interacting with a creature outside combat to learn comparative information about its capabilities.'),
  f('fighter.battle-master.improved-combat-superiority','Improved Combat Superiority','fighter.battle-master',18,'Your superiority dice become d12s.'),

  // PHB 2014 — Champion
  f('fighter.champion.improved-critical','Improved Critical','fighter.champion',3,'Your weapon attacks score a critical hit on a roll of 19 or 20.'),
  f('fighter.champion.remarkable-athlete','Remarkable Athlete','fighter.champion',7,'You add half your proficiency bonus to Strength, Dexterity, or Constitution checks that do not already use your proficiency bonus; your running long jump increases by a number of feet equal to your Strength modifier.'),
  f('fighter.champion.survivor','Survivor','fighter.champion',18,'At the start of each of your turns, regain hit points equal to 5 + your Constitution modifier if you have no more than half your hit points and are not at 0 hit points.'),

  // PHB 2014 — Assassin
  f('rogue.assassin.assassinate','Assassinate','rogue.assassin',3,'You have advantage on attack rolls against creatures that have not taken a turn in the combat, and any hit against a surprised creature is a critical hit.'),
  f('rogue.assassin.infiltration-expertise','Infiltration Expertise','rogue.assassin',9,'You can create a false identity with the specified preparation and cost, subject to the feature rules.'),
  f('rogue.assassin.impersonator','Impostor','rogue.assassin',13,'You can unerringly mimic another person’s speech, writing, and behavior after studying them, subject to the feature rules.'),
  f('rogue.assassin.death-strike','Death Strike','rogue.assassin',17,'When you attack and hit a creature that is surprised, it must make the feature’s Constitution saving throw or take double damage from the attack.'),

  // PHB 2014 — Thief
  f('rogue.thief.fast-hands','Fast Hands','rogue.thief',3,'You can use the bonus action granted by Cunning Action to make a Dexterity (Sleight of Hand) check, use thieves’ tools, or take the Use an Object action.'),
  f('rogue.thief.second-story-work','Second-Story Work','rogue.thief',3,'Climbing no longer costs extra movement, and your running jump distance increases by your Dexterity modifier.'),
  f('rogue.thief.supreme-sneak','Supreme Sneak','rogue.thief',9,'You have advantage on a Dexterity (Stealth) check if you move no more than half your speed on the same turn.'),
  f('rogue.thief.use-magic-device','Use Magic Device','rogue.thief',13,'You ignore class, race, and level requirements on use of magic items, subject to the feature rules.'),
  f('rogue.thief.thiefs-reflexes','Thief’s Reflexes','rogue.thief',17,'You can take two turns during the first round of combat, subject to the feature rules.'),

  // Xanathar’s — Gloom Stalker
  f('ranger.gloom-stalker.dread-ambusher','Dread Ambusher','ranger.gloom-stalker',3,'You add your Wisdom modifier to initiative; your speed increases by 10 feet on the first turn; and when you take the Attack action on that turn you can make one additional weapon attack that deals an extra 1d8 weapon damage on a hit.'),
  f('ranger.gloom-stalker.umbral-sight','Umbral Sight','ranger.gloom-stalker',3,'You gain darkvision out to 60 feet, or increase existing darkvision by 60 feet; you are also invisible to creatures relying on darkvision to see you in darkness.'),
  f('ranger.gloom-stalker.stalkers-flurry','Stalker’s Flurry','ranger.gloom-stalker',11,'Once on each of your turns when you miss with a weapon attack, you can make another weapon attack as part of the same action.'),
  f('ranger.gloom-stalker.shadowy-dodge','Shadowy Dodge','ranger.gloom-stalker',15,'When a creature makes an attack roll against you and does not have advantage, you can use your reaction to impose disadvantage on that roll.'),

  // Tasha’s — Armorer
  f('artificer.armorer.tools-of-the-trade','Tools of the Trade','artificer.armorer',3,'You gain proficiency with heavy armor and smith’s tools; you can also use smith’s tools as a spellcasting focus for your artificer spells.'),
  f('artificer.armorer.arcane-armor','Arcane Armor','artificer.armorer',3,'You can turn a suit of armor into Arcane Armor, which does not impede your ability to cast spells, can cover the body, can replace missing limbs, and can be donned or doffed as specified.'),
  f('artificer.armorer.armor-model','Armor Model','artificer.armorer',3,'You can customize your Arcane Armor as Guardian or Infiltrator; the model grants its listed weapon and armor features.'),
  f('artificer.armorer.extra-attack','Extra Attack','artificer.armorer',5,'You can attack twice, instead of once, whenever you take the Attack action on your turn.'),
  f('artificer.armorer.armor-modifications','Armor Modifications','artificer.armorer',9,'You learn to modify your Arcane Armor with additional infusions and can treat its component pieces as separate items for infusion purposes, subject to the feature rules.'),
  f('artificer.armorer.perfected-armor','Perfected Armor','artificer.armorer',15,'Your Arcane Armor gains an additional model-specific defensive/offensive feature based on Guardian or Infiltrator.'),
];

export function getSubclassFeatures(subclassId:string, level:number): SubclassFeature[] {
  return SUBCLASS_FEATURES.filter(feature => feature.subclassId === subclassId && feature.level <= level);
}

export function getSubclassFeaturesAtLevel(subclassId:string, level:number): SubclassFeature[] {
  return SUBCLASS_FEATURES.filter(feature => feature.subclassId === subclassId && feature.level === level);
}

export function hasSubclassFeature(subclassId:string, featureId:string): boolean {
  return SUBCLASS_FEATURES.some(feature => feature.subclassId === subclassId && feature.id === featureId);
}
