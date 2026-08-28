import type {Feature} from '../types';
import type {SubclassFeature} from './subclassFeatures';

const f=(id:string,name:string,subclassId:string,level:number,description:string):SubclassFeature=>({id,name,subclassId,level,source:'subclass',description});

/** Tasha's Cauldron of Everything: remaining PHB-class subclasses not present in the expansion catalog. */
export const TASHA_SUBCLASS_FEATURES:SubclassFeature[]=[
// Rogue — Soulknife
f('rogue.soulknife.psionic-power','Psionic Power','rogue.soulknife',3,'You gain Psionic Energy dice and the psionic abilities specified by the subclass.'),
f('rogue.soulknife.soul-blades','Soul Blades','rogue.soulknife',9,'Your psionic abilities gain the Soul Blades options specified by the subclass.'),
f('rogue.soulknife.psychic-veil','Psychic Veil','rogue.soulknife',13,'You can magically become invisible for a limited duration using your psionic power.'),
f('rogue.soulknife.rend-mind','Rend Mind','rogue.soulknife',17,'When you use Psychic Blades to damage a creature, you can force the saving throw and stun effect specified by the feature.'),
// Sorcerer — Aberrant Mind
f('sorcerer.aberrant-mind.psionic-spells','Psionic Spells','sorcerer.aberrant-mind',1,'You learn additional spells associated with aberrant magic; the spells can be replaced according to the subclass rules.'),
f('sorcerer.aberrant-mind.telepathic-speech','Telepathic Speech','sorcerer.aberrant-mind',1,'You can form a telepathic connection with a creature you can see for the duration specified by the feature.'),
f('sorcerer.aberrant-mind.psionic-sorcery','Psionic Sorcery','sorcerer.aberrant-mind',6,'You can cast your Psionic Spells by spending sorcery points instead of spell slots and without verbal or somatic components.'),
f('sorcerer.aberrant-mind.psychic-defenses','Psychic Defenses','sorcerer.aberrant-mind',6,'You gain resistance to psychic damage and advantage on saving throws against being charmed or frightened.'),
f('sorcerer.aberrant-mind.revelation-in-flesh','Revelation in Flesh','sorcerer.aberrant-mind',14,'You can spend sorcery points to manifest aberrant physical traits with the benefits specified by the feature.'),
f('sorcerer.aberrant-mind.warping-implosion','Warping Implosion','sorcerer.aberrant-mind',18,'You can create a point of spatial distortion that deals force damage and can teleport creatures as specified by the feature.'),
// Sorcerer — Clockwork Soul
f('sorcerer.clockwork-soul.clockwork-magic','Clockwork Magic','sorcerer.clockwork-soul',1,'You learn additional spells associated with the Plane of Mechanus; the spells can be replaced according to the subclass rules.'),
f('sorcerer.clockwork-soul.restore-balance','Restore Balance','sorcerer.clockwork-soul',1,'You can use your reaction to balance advantage or disadvantage on a roll made by a creature within range.'),
f('sorcerer.clockwork-soul.bastion-of-law','Bastion of Law','sorcerer.clockwork-soul',6,'You can spend sorcery points to create a magical ward represented by a pool of d8s that reduces incoming damage.'),
f('sorcerer.clockwork-soul.trance-of-order','Trance of Order','sorcerer.clockwork-soul',14,'You can enter a state in which d20 rolls below 10 are treated as 10, subject to the feature rules.'),
f('sorcerer.clockwork-soul.clockwork-cavalcade','Clockwork Cavalcade','sorcerer.clockwork-soul',18,'You can summon a mass of spirits of Mechanus that restore, repair, or damage creatures as specified by the feature.'),
// Warlock — Fathomless
f('warlock.fathomless.expanded-spell-list','Expanded Spell List','warlock.fathomless',1,'The Fathomless lets you choose from additional spells when you learn a warlock spell.'),
f('warlock.fathomless.tentacle-of-the-deeps','Tentacle of the Deeps','warlock.fathomless',1,'You can summon a spectral tentacle that deals cold damage and can slow a creature hit by it.'),
f('warlock.fathomless.gift-of-the-sea','Gift of the Sea','warlock.fathomless',1,'You gain a swimming speed and can breathe underwater.'),
f('warlock.fathomless.oceanic-soul','Oceanic Soul','warlock.fathomless',6,'You gain resistance to cold damage and can breathe underwater; you can share the ability as specified.'),
f('warlock.fathomless.guardian-coil','Guardian Coil','warlock.fathomless',6,'Your Tentacle of the Deeps can reduce damage dealt to you or another creature within its reach.'),
f('warlock.fathomless.grasping-tentacles','Grasping Tentacles','warlock.fathomless',10,'You learn Evard’s black tentacles and gain additional benefits to your tentacle feature as specified.'),
f('warlock.fathomless.fathomless-plunge','Fathomless Plunge','warlock.fathomless',14,'You can teleport yourself and willing creatures through a temporary watery portal to another body of water.'),
// Warlock — Genie
f('warlock.genie.expanded-spell-list','Expanded Spell List','warlock.genie',1,'The Genie lets you choose from additional spells when you learn a warlock spell.'),
f('warlock.genie.genies-vessel','Genie’s Vessel','warlock.genie',1,'You receive a vessel tied to your patron and gain the vessel benefits specified by the feature.'),
f('warlock.genie.elemental-gift','Elemental Gift','warlock.genie',6,'You gain resistance to a damage type associated with your patron and can gain a flying speed for a limited duration.'),
f('warlock.genie.sanctuary-vessel','Sanctuary Vessel','warlock.genie',10,'You can enter your Genie’s Vessel and gain the sanctuary benefits specified by the feature.'),
f('warlock.genie.limited-wish','Limited Wish','warlock.genie',14,'You can request the effect of a spell of 6th level or lower from any class, subject to the feature’s casting restrictions and recharge.'),
];