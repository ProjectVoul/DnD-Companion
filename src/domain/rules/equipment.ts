import type {Character,Item,WeaponData} from '../types';
import {effectBonus,derivedAbilityMod} from './effects';
import {featDefinition} from './feats';
export interface AttackOptions{powerAttack?:boolean;}
export function equipped(c:Character,kind:Item['kind']){return c.items.filter(i=>i.equipped&&i.kind===kind)}
function property(item:Item,name:string){return !!item.weapon?.properties.some(p=>p.toLowerCase()===name.toLowerCase()||p.toLowerCase().includes(name.toLowerCase()))}
function isRanged(item:Item){return property(item,'ranged')||!!item.weapon?.range}
function styles(c:Character){return new Set((c.fightingStyles??[]).map(s=>s.toLowerCase()));}
function hasFeat(c:Character,id:string){return (c.feats??[]).some(name=>(featDefinition(name)?.id??name)===id)}
export function weaponAttackBonus(c:Character,item:Item,options:AttackOptions={}){const w=item.weapon;if(!w)return 0;let bonus=derivedAbilityMod(c,w.attackAbility)+(w.proficient?c.proficiencyBonus:0)+w.attackBonus+effectBonus(c,'attack');if(styles(c).has('archery')&&isRanged(item))bonus+=2;if(options.powerAttack&&hasFeat(c,isRanged(item)?'sharpshooter':'great-weapon-master')&&(isRanged(item)||property(item,'heavy')))bonus-=5;return bonus}
export function weaponDamageParts(item:Item){return item.weapon?.damage??[]}
export function weaponDamageBonus(c:Character,item:Item,options:AttackOptions={}){const w=item.weapon;if(!w)return 0;let bonus=derivedAbilityMod(c,w.attackAbility)+w.damageBonus+effectBonus(c,'damage');const equippedWeapons=c.items.filter(i=>i.equipped&&i.kind==='weapon');const activeStyles=styles(c);if(activeStyles.has('dueling')&&equippedWeapons.length===1&&!isRanged(item)&&!property(item,'two-handed'))bonus+=2;if(activeStyles.has('thrown-weapon-fighting')&&property(item,'thrown')&&isRanged(item))bonus+=2;if(options.powerAttack&&hasFeat(c,isRanged(item)?'sharpshooter':'great-weapon-master')&&(isRanged(item)||property(item,'heavy')))bonus+=10;return bonus}
export function itemHasDamage(item:Item):item is Item&{weapon:{damage:NonNullable<WeaponData['damage']>}}{return item.kind==='weapon'&&!!item.weapon?.damage?.length}
