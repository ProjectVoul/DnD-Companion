import type {DamagePart,Spell,SpellMechanics} from '../types';

const d=(dice:number,die:DamagePart['die'],type:DamagePart['type'],flat?:number):DamagePart=>({dice,die,type,...(flat===undefined?{}:{flat})});
const mechanics:Record<string,SpellMechanics>={
 'chill-touch':{attack:'ranged',damage:[d(1,8,'necrotic')],special:'Damage scales with character level: 2d8 at 5th, 3d8 at 11th, 4d8 at 17th. The target cannot regain hit points until the start of your next turn.'},
 'eldritch-blast':{attack:'ranged',damage:[d(1,10,'force')],special:'Creates additional beams at 5th, 11th and 17th character level. Each beam has its own attack roll and damage roll.'},
 'fire-bolt':{attack:'ranged',damage:[d(1,10,'fire')],special:'Damage scales with character level: 2d10 at 5th, 3d10 at 11th, 4d10 at 17th. A hit can ignite a flammable object that is not being worn or carried.'},
 'guidance':{special:'The target adds 1d4 to one ability check of its choice before the spell ends.'},
 'produce-flame':{attack:'ranged',damage:[d(1,8,'fire')],special:'The flame can be hurled as a ranged spell attack; damage scales with character level to 2d8 at 5th, 3d8 at 11th and 4d8 at 17th.'},
 'ray-of-frost':{attack:'ranged',damage:[d(1,8,'cold')],special:'Damage scales with character level: 2d8 at 5th, 3d8 at 11th, 4d8 at 17th. On a hit, reduce the target’s speed by 10 feet until the start of your next turn.'},
 'resistance':{special:'The target adds 1d4 to one saving throw of its choice before the spell ends.'},
 'shillelagh':{damage:[d(1,8,'bludgeoning')],special:'For the duration, the weapon uses your spellcasting ability instead of Strength for attack and damage rolls, becomes magical, and its damage die is d8. The effect ends if you cast the spell again or let go of the weapon.'},
 'shocking-grasp':{attack:'melee',damage:[d(1,8,'lightning')],special:'Damage scales with character level: 2d8 at 5th, 3d8 at 11th, 4d8 at 17th. The target cannot take reactions until the start of its next turn; you have advantage if it is wearing metal armor.'},
 'witch-bolt':{attack:'ranged',damage:[d(1,12,'lightning')],special:'On subsequent turns you can use your action to deal 1d12 lightning damage automatically while the original target remains in range and the spell persists. Initial damage increases by 1d12 per slot level above 1st.'},
 'bless':{targets:'Up to 3 creatures',special:'Each target adds 1d4 to attack rolls and saving throws for the duration. One additional creature can be targeted for each slot level above 1st.'},
 'cure-wounds':{targets:'One creature touched',special:'The target regains 1d8 + your spellcasting ability modifier hit points. Healing increases by 1d8 per slot level above 1st.'},
 'wrathful-smite':{save:'wis',damage:[d(1,6,'psychic')],special:'The next time you hit with a melee weapon attack during the spell, the attack deals 1d6 extra psychic damage. On a failed Wisdom save, the target is frightened until the spell ends; it can repeat the save as an action.'},
 'aura-of-vitality':{targets:'One creature within 30 feet',special:'As a bonus action on each turn, restore 2d6 hit points to one creature in the aura. The aura is centered on you and moves with you.'},
 'plane-shift':{attack:'melee',save:'cha',targets:'One willing creature touched, or one unwilling creature on a hit',special:'For willing travel, you and up to eight willing creatures within 5 feet are transported to a chosen plane. Against an unwilling creature, make a melee spell attack; on a hit it makes a Charisma save, and on a failure it is banished to a plane you specify.'}
};

export const withSpellMechanics=(spells:Spell[]):Spell[]=>spells.map(spell=>mechanics[spell.id]?{...spell,mechanics:mechanics[spell.id]}:spell);
export const SPELL_MECHANICS_IDS=Object.keys(mechanics);
