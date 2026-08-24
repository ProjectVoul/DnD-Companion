import type {Character,Item,WeaponData} from '../types';
export function equipped(c:Character,kind:Item['kind']){return c.items.filter(i=>i.equipped&&i.kind===kind)}
export function weaponAttackBonus(c:Character,item:Item){const w=item.weapon;if(!w)return 0;const ability=c.abilityScores[w.attackAbility];return Math.floor((ability-10)/2)+(w.proficient?c.proficiencyBonus:0)+w.attackBonus}
export function weaponDamageParts(item:Item){return item.weapon?.damage??[]}
export function weaponDamageBonus(c:Character,item:Item){const w=item.weapon;if(!w)return 0;return Math.floor((c.abilityScores[w.attackAbility]-10)/2)+w.damageBonus}
export function itemHasDamage(item:Item):item is Item&{weapon:{damage:NonNullable<WeaponData['damage']>}}{return item.kind==='weapon'&&!!item.weapon?.damage?.length}
