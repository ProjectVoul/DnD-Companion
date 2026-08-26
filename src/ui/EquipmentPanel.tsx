import {useState} from 'react';
import type {Ability,Character,DamageType,Die,Item,ItemKind} from '../domain/types';
import {totalWeight} from '../domain/rules/effects';
import {MechanicalEffectsEditor} from './MechanicalEffectsEditor';

const kinds:ItemKind[]=['armor','weapon','shield','focus','gear','magic'];
const equipmentKinds:ItemKind[]=['weapon','armor','shield','focus'];
const damageTypes:DamageType[]=['slashing','piercing','bludgeoning','fire','cold','acid','lightning','necrotic','radiant','poison','psychic','force','thunder'];
const dice:Die[]=[4,6,8,10,12,20];

function weaponDefaults(){return {attackAbility:'str' as Ability,proficient:false,attackBonus:0,damageBonus:0,damage:[{dice:1,die:8 as Die,type:'slashing' as DamageType}],properties:[]};}
function armorDefaults(){return {category:'light' as const,baseAC:11,dexBonus:true,stealthDisadvantage:false,magicBonus:0};}
function shieldDefaults(){return {acBonus:2,magicBonus:0};}

export function EquipmentPanel({c,update}:{c:Character;update:(fn:(x:Character)=>Character)=>void}){
  const [kind,setKind]=useState<ItemKind>('weapon');
  const [editing,setEditing]=useState<string|null>(null);
  const add=(k:ItemKind)=>{
    const item:Item={id:crypto.randomUUID(),name:k==='weapon'?'New Weapon':k==='armor'?'New Armor':k==='shield'?'New Shield':'New Item',kind:k,quantity:1,weight:0,equipped:false,description:'',effects:[],homebrew:k==='magic'?false:undefined,...(k==='weapon'?{weapon:weaponDefaults()}:{}),...(k==='armor'?{armor:armorDefaults()}:{}),...(k==='shield'?{shield:shieldDefaults()}:{}),};
    update(x=>({...x,items:[...x.items,item]}));
    setEditing(item.id);
  };
  const remove=(id:string)=>{update(x=>({...x,items:x.items.filter(i=>i.id!==id)}));setEditing(current=>current===id?null:current);};
  const equipment=c.items.filter(i=>equipmentKinds.includes(i.kind));
  const misc=c.items.filter(i=>!equipmentKinds.includes(i.kind));
  return <section className="card">
    <div className="row"><div><h2>Inventory</h2><p className="muted">Equipped gear is separated from miscellaneous carried items. Total weight: {totalWeight(c).toFixed(1)} lb.</p></div><div className="row"><select value={kind} onChange={e=>setKind(e.target.value as ItemKind)}>{kinds.map(k=><option key={k}>{k}</option>)}</select><button onClick={()=>add(kind)}>+ Add item</button></div></div>
    <InventoryGroup title="Equipment" items={equipment} edit={setEditing} remove={remove}/>
    <InventoryGroup title="Miscellaneous" items={misc} edit={setEditing} remove={remove}/>
    {editing&&c.items.some(i=>i.id===editing)&&<ItemModal item={c.items.find(i=>i.id===editing)!} update={update} close={()=>setEditing(null)} remove={()=>remove(editing)}/>} 
  </section>
}

function InventoryGroup({title,items,edit,remove}:{title:string;items:Item[];edit:(id:string)=>void;remove:(id:string)=>void}){
  return <div><h3>{title}</h3>{items.length?items.map(i=><div className="item" key={i.id}><button className="item-main" onClick={()=>edit(i.id)}><b>{i.name}</b><small>{i.quantity} × · {i.weight??0} lb · {i.equipped?'Equipped':'Carried'}{i.attuned?' · Attuned':''}{i.homebrew?' · Homebrew':''}</small></button><span>{i.equipped?'Equipped':'Carried'}</span><button className="danger" aria-label={`Delete ${i.name}`} title="Delete item" onClick={()=>remove(i.id)}>Delete</button></div>):<p className="muted">Nothing here.</p>}</div>
}

function ItemModal({item,update,close,remove}:{item:Item;update:(fn:(x:Character)=>Character)=>void;close:()=>void;remove:()=>void}){
  const patch=(p:Partial<Item>)=>update(x=>({...x,items:x.items.map(i=>i.id===item.id?{...i,...p}:i)}));
  const wp=(p:Partial<NonNullable<Item['weapon']>>)=>patch({weapon:{...item.weapon!,...p}});
  const ap=(p:Partial<NonNullable<Item['armor']>>)=>patch({armor:{...item.armor!,...p}});
  const sp=(p:Partial<NonNullable<Item['shield']>>)=>patch({shield:{...item.shield!,...p}});
  const changeKind=(next:ItemKind)=>{
    if(next==='weapon') patch({kind:next,weapon:item.weapon??weaponDefaults(),armor:undefined,shield:undefined});
    else if(next==='armor') patch({kind:next,weapon:undefined,armor:item.armor??armorDefaults(),shield:undefined});
    else if(next==='shield') patch({kind:next,weapon:undefined,armor:undefined,shield:item.shield??shieldDefaults()});
    else patch({kind:next,weapon:undefined,armor:undefined,shield:undefined});
  };
  const effects=item.effects??[];
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}><div className="modal item-modal">
    <div className="row"><div><span className="eyebrow">{item.kind}</span><h2>Edit item</h2></div><div className="row"><button className="danger" onClick={remove}>Delete item</button><button onClick={close}>Done</button></div></div>
    <div className="form-grid">
      <label>Name<input value={item.name} onChange={e=>patch({name:e.target.value})}/></label>
      <label>Type<select value={item.kind} onChange={e=>changeKind(e.target.value as ItemKind)}>{kinds.map(k=><option key={k}>{k}</option>)}</select></label>
      <label>Quantity<input type="number" min="1" value={item.quantity} onChange={e=>patch({quantity:Math.max(1,Number(e.target.value))})}/></label>
      <label>Weight (lb)<input type="number" min="0" step="0.1" value={item.weight??0} onChange={e=>patch({weight:Math.max(0,Number(e.target.value))})}/></label>
    </div>
    <label>Description<textarea value={item.description??''} onChange={e=>patch({description:e.target.value})}/></label>
    <label>Effects<textarea value={effects.join('\n')} placeholder="One descriptive effect per line" onChange={e=>patch({effects:e.target.value.split('\n').map(x=>x.trim()).filter(Boolean)})}/></label>
    <MechanicalEffectsEditor item={item} patch={patch}/>
    <div className="check-row"><label><input type="checkbox" checked={item.equipped} onChange={e=>patch({equipped:e.target.checked})}/> Equipped</label><label><input type="checkbox" checked={!!item.attuned} onChange={e=>patch({attuned:e.target.checked})}/> Attuned</label><label><input type="checkbox" checked={!!item.homebrew} onChange={e=>patch({homebrew:e.target.checked})}/> Homebrew</label></div>
    {item.weapon&&<><h3>Weapon</h3><div className="form-grid"><label>Attack ability<select value={item.weapon.attackAbility} onChange={e=>wp({attackAbility:e.target.value as Ability})}>{['str','dex','con','int','wis','cha'].map(a=><option key={a}>{a}</option>)}</select></label><label>Attack bonus<input type="number" value={item.weapon.attackBonus} onChange={e=>wp({attackBonus:Number(e.target.value)})}/></label><label>Damage bonus<input type="number" value={item.weapon.damageBonus} onChange={e=>wp({damageBonus:Number(e.target.value)})}/></label><label><span>Proficient</span><input type="checkbox" checked={item.weapon.proficient} onChange={e=>wp({proficient:e.target.checked})}/></label></div><h4>Damage components</h4>{item.weapon.damage.map((d,i)=><div className="damage-row" key={i}><input type="number" min="1" value={d.dice} onChange={e=>{const damage=[...item.weapon!.damage];damage[i]={...d,dice:Math.max(1,Number(e.target.value))};wp({damage})}}/><select value={d.die} onChange={e=>{const damage=[...item.weapon!.damage];damage[i]={...d,die:Number(e.target.value) as Die};wp({damage})}}>{dice.map(x=><option key={x} value={x}>d{x}</option>)}</select><select value={d.type} onChange={e=>{const damage=[...item.weapon!.damage];damage[i]={...d,type:e.target.value as DamageType};wp({damage})}}>{damageTypes.map(x=><option key={x}>{x}</option>)}</select><input type="number" placeholder="Flat" value={d.flat??''} onChange={e=>{const damage=[...item.weapon!.damage];damage[i]={...d,flat:e.target.value?Number(e.target.value):undefined};wp({damage})}}/><button onClick={()=>wp({damage:item.weapon!.damage.filter((_,j)=>j!==i)})}>×</button></div>)}<button onClick={()=>wp({damage:[...item.weapon!.damage,{dice:1,die:6,type:'fire'}]})}>+ Damage component</button></>}
    {item.armor&&<><h3>Armor</h3><div className="form-grid"><label>Base AC<input type="number" value={item.armor.baseAC} onChange={e=>ap({baseAC:Number(e.target.value)})}/></label><label>Category<select value={item.armor.category} onChange={e=>ap({category:e.target.value as 'light'|'medium'|'heavy'})}><option>light</option><option>medium</option><option>heavy</option></select></label><label>Dexterity cap<input type="number" value={item.armor.dexCap??''} onChange={e=>ap({dexCap:e.target.value?Number(e.target.value):undefined})}/></label><label>Strength requirement<input type="number" value={item.armor.strengthRequirement??''} onChange={e=>ap({strengthRequirement:e.target.value?Number(e.target.value):undefined})}/></label><label>Magic bonus<input type="number" value={item.armor.magicBonus} onChange={e=>ap({magicBonus:Number(e.target.value)})}/></label><label><span>Apply Dexterity</span><input type="checkbox" checked={item.armor.dexBonus} onChange={e=>ap({dexBonus:e.target.checked})}/></label><label><span>Stealth disadvantage</span><input type="checkbox" checked={item.armor.stealthDisadvantage} onChange={e=>ap({stealthDisadvantage:e.target.checked})}/></label></div></>}
    {item.shield&&<><h3>Shield</h3><div className="form-grid"><label>AC bonus<input type="number" value={item.shield.acBonus} onChange={e=>sp({acBonus:Number(e.target.value)})}/></label><label>Magic bonus<input type="number" value={item.shield.magicBonus} onChange={e=>sp({magicBonus:Number(e.target.magicBonus)})}/></label></div></>}
    <h3>Charges / uses</h3><div className="form-grid"><label>Maximum<input type="number" min="0" value={item.charges?.max??0} onChange={e=>{const max=Math.max(0,Number(e.target.value));patch({charges:{current:Math.min(item.charges?.current??max,max),max,recharge:item.charges?.recharge??'manual'}})}}/></label><label>Current<input type="number" min="0" value={item.charges?.current??0} onChange={e=>patch({charges:{current:Math.max(0,Math.min(item.charges?.max??0,Number(e.target.value))),max:item.charges?.max??0,recharge:item.charges?.recharge??'manual'}})}/></label><label>Recharge<select value={item.charges?.recharge??'manual'} onChange={e=>{const max=item.charges?.max??0;patch({charges:{current:Math.min(item.charges?.current??max,max),max,recharge:e.target.value as 'short'|'long'|'manual'}})}}><option value="manual">Manual</option><option value="short">Short Rest</option><option value="long">Long Rest</option></select></label></div>
  </div></div>
}
