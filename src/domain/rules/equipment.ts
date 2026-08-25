import type {Character,Item,WeaponData} from '../types';
import {effectBonus,derivedAbilityMod} from './effects';
export function equipped(c:Character,kind:Item['kind']){return c.items.filter(i=>i.equipped&&i.kind===kind)}
export function weaponAttackBonus(c:Character,item:Item){const w=item.weapon;if(!w)return 0;return derivedAbilityMod(c,w.attackAbility)+(w.proficient?c.proficiencyBonus:0)+w.attackBonus+effectBonus(c,'attack')}
export function weaponDamageParts(item:Item){return item.weapon?.damage??[]}
export function weaponDamageBonus(c:Character,item:Item){const w=item.weapon;if(!w)return 0;return derivedAbilityMod(c,w.attackAbility)+w.damageBonus+effectBonus(c,'damage')}
export function itemHasDamage(item:Item):item is Item&{weapon:{damage:NonNullable<WeaponData['damage']>}}{return item.kind==='weapon'&&!!item.weapon?.damage?.length}
