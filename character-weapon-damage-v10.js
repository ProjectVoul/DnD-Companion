/* D&D Companion — weapon damage editor v10
 * Adds multiple damage components to weapon items without touching the
 * stable inventory navigation / interaction layer.
 */
(() => {
  'use strict';
  const E=()=>window.DnDCharacterEngine;
  const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const n=v=>Number.isFinite(Number(v))?Number(v):0;
  const DICE=['d4','d6','d8','d10','d12','d20'];
  const DAMAGE_TYPES=[
    ['acid','Acid'],['bludgeoning','Bludgeoning'],['cold','Cold'],['fire','Fire'],
    ['force','Force'],['lightning','Lightning'],['necrotic','Necrotic'],['piercing','Piercing'],
    ['poison','Poison'],['psychic','Psychic'],['radiant','Radiant'],['slashing','Slashing'],['thunder','Thunder']
  ];
  const TYPE_LABEL={weapon:'Weapons',armor:'Armor',shield:'Shields',focus:'Focus',accessory:'Accessories',other:'Other'};
  const TYPE_ICON={weapon:'⚔️',armor:'🛡️',shield:'🛡️',focus:'✝️',accessory:'💍',other:'📦'};
  const get=()=>{const e=E(),c=e.getLiveCharacter?e.getLiveCharacter():e.loadCharacter();if(e.syncCharacterRules)e.syncCharacterRules(c);if(e.normalizeCharacter)e.normalizeCharacter(c);return c;};
  const save=c=>E().saveLiveCharacter?E().saveLiveCharacter(c):E().saveCharacter(c);
  const itemType=i=>i?.mechanics?.type||i?.equipment?.type||'other';
  const currentId=()=>document.querySelector('.weapon-editor-submit')?.dataset.itemId||'';
  const currentItem=()=>{const id=currentId();return id?get().items.find(i=>String(i.id)===String(id)):null;};
  const damageRows=i=>{
    const rows=Array.isArray(i?.mechanics?.damage)?i.mechanics.damage:[];
    if(rows.length)return rows.map((d,idx)=>({
      count:Math.max(1,Math.floor(n(d?.dice?.count)||1)),
      die:DICE.includes(d?.dice?.die)?d.dice.die:'d8',
      type:DAMAGE_TYPES.some(x=>x[0]===d?.type)?d.type:'slashing',
      base:idx===0 && d?.ability==null
    }));
    return [{count:1,die:'d8',type:'slashing',base:true}];
  };
  function damageRowHtml(row,index){
    const typeOptions=DAMAGE_TYPES.map(([v,l])=>`<option value="${v}" ${row.type===v?'selected':''}>${l}</option>`).join('');
    const dieOptions=DICE.map(v=>`<option value="${v}" ${row.die===v?'selected':''}>${v}</option>`).join('');
    return `<div class="weapon-damage-row" data-damage-row="${index}">
      <div class="weapon-damage-row-title"><strong>${index===0?'Base damage':'Additional damage'}</strong>${index===0?'<small>Ability modifier applies</small>':'<small>No ability modifier</small>'}<button type="button" class="weapon-damage-remove" onclick="removeWeaponDamageRow(${index})" ${index===0?'disabled':''}>×</button></div>
      <div class="weapon-damage-fields">
        <label><span>Dice</span><input class="weapon-damage-count" type="number" min="1" max="20" value="${row.count}"></label>
        <label><span>Die</span><select class="weapon-damage-die">${dieOptions}</select></label>
        <label class="weapon-damage-type-field"><span>Damage type</span><select class="weapon-damage-type">${typeOptions}</select></label>
      </div>
    </div>`;
  }
  function renderRows(){
    const box=document.getElementById('weapon-damage-list');
    if(!box)return;
    const rows=window.__weaponDamageDraft||[{count:1,die:'d8',type:'slashing',base:true}];
    box.innerHTML=rows.map(damageRowHtml).join('');
  }
  window.addWeaponDamageRow=()=>{
    window.__weaponDamageDraft=window.__weaponDamageDraft||[];
    window.__weaponDamageDraft.push({count:1,die:'d6',type:'fire',base:false});
    renderRows();
  };
  window.removeWeaponDamageRow=index=>{
    if(!Array.isArray(window.__weaponDamageDraft)||index<=0)return;
    window.__weaponDamageDraft.splice(index,1);renderRows();
  };
  function collectRows(){
    return [...document.querySelectorAll('#weapon-damage-list .weapon-damage-row')].map((row,index)=>({
      dice:{count:Math.max(1,Math.min(20,Math.floor(n(row.querySelector('.weapon-damage-count')?.value)||1))),die:row.querySelector('.weapon-damage-die')?.value||'d8'},
      type:row.querySelector('.weapon-damage-type')?.value||'slashing',
      ability:index===0?null:'none',
      modifier:0,
      source:null
    }));
  }
  function injectStyles(){
    if(document.getElementById('weapon-damage-v10-style'))return;
    const s=document.createElement('style');s.id='weapon-damage-v10-style';s.textContent=`
      .weapon-damage-editor{border:1px solid var(--border);border-radius:12px;padding:12px;margin:10px 0;background:var(--surface-light)}
      .weapon-damage-editor h3{margin:0;font-size:12px;color:var(--accent-light)}
      .weapon-damage-editor-help{display:block;margin:4px 0 10px;color:var(--text-muted);font-size:10px;line-height:1.4}
      .weapon-damage-row{border:1px solid var(--border);border-radius:10px;padding:10px;margin:7px 0;background:var(--surface)}
      .weapon-damage-row-title{display:flex;align-items:center;gap:7px;margin-bottom:8px}
      .weapon-damage-row-title strong{font-size:11px}.weapon-damage-row-title small{flex:1;color:var(--text-muted);font-size:9px}
      .weapon-damage-remove{width:25px;height:25px;border:1px solid var(--border);border-radius:50%;background:transparent;color:var(--text-muted);font-size:17px;line-height:1;cursor:pointer}
      .weapon-damage-remove:not(:disabled):hover{border-color:var(--danger);color:#d77a82}.weapon-damage-remove:disabled{opacity:.3;cursor:not-allowed}
      .weapon-damage-fields{display:grid;grid-template-columns:72px 80px 1fr;gap:7px}.weapon-damage-fields label{margin:0!important}
      .weapon-damage-fields label span{font-size:9px;color:var(--text-muted)}
      .weapon-damage-fields input,.weapon-damage-fields select{width:100%;box-sizing:border-box;background:var(--surface-light);color:var(--text);border:1px solid var(--border);border-radius:8px;padding:8px;font:inherit;margin-top:4px}
      .weapon-damage-add{width:100%;margin-top:8px;border:1px dashed var(--accent);background:transparent;color:var(--accent-light);border-radius:9px;padding:9px;cursor:pointer;font:inherit}
      @media(max-width:430px){.weapon-damage-fields{grid-template-columns:65px 75px 1fr}}
    `;document.head.appendChild(s);
  }
  function openWeaponForm(existing){
    injectStyles();
    const i=existing||{},t=itemType(i),m=i.mechanics||{},o=document.createElement('div');
    window.__weaponDamageDraft=damageRows(i);
    o.className='inventory-form-overlay';
    o.innerHTML=`<div class="inventory-form-modal"><button class="rest-close" type="button" onclick="this.closest('.inventory-form-overlay').remove();window.__weaponDamageDraft=null">×</button><h2>${existing?'Edit Item':'Add Item'}</h2>
      <label>Name<input id="if-name" type="text" value="${esc(i.name||'')}"></label>
      <label>Icon<input id="if-icon" type="text" maxlength="4" value="${esc(i.icon||TYPE_ICON[t]||'⚔️')}"></label>
      <label>Description<textarea id="if-description">${esc(i.description||'')}</textarea></label>
      <label>Quantity<input id="if-quantity" type="number" min="0" step="1" value="${i.quantity??1}"></label>
      <label>Weight (kg)<input id="if-weight" type="number" min="0" step="0.01" value="${i.weight??0}"></label>
      <label>Item Type<select id="if-type"><option value="weapon" selected>Weapons</option><option value="armor">Armor</option><option value="shield">Shields</option><option value="focus">Focus</option><option value="accessory">Accessories</option><option value="other">Other</option></select></label>
      <div class="inventory-form-type-card"><h3>Weapon</h3>
        <label>Attack type<input id="if-attack-type" type="text" value="${esc(m.attack?.type||'melee')}"></label>
        <label>Attack ability<input id="if-attack-ability" type="text" value="${esc(m.attack?.ability||'strength')}"></label>
        <label>Attack bonus<input id="if-attack-bonus" type="number" value="${m.attack?.bonus??0}"></label>
        <div class="weapon-damage-editor"><h3>Damage</h3><small class="weapon-damage-editor-help">Set the base damage and add as many extra damage components as the weapon needs.</small><div id="weapon-damage-list"></div><button type="button" class="weapon-damage-add" onclick="addWeaponDamageRow()">＋ Add damage</button></div>
        <label>Weapon properties<input id="if-weapon-properties" type="text" value="${esc((m.properties||[]).join(', '))}" placeholder="finesse, heavy, versatile..."></label>
      </div>
      <label class="inventory-checkbox-label"><input id="if-magical" type="checkbox" ${i.magical?'checked':''}> Magical item</label>
      <label>Properties<input id="if-properties" type="text" value="${esc((i.properties||[]).join(', '))}" placeholder="finesse, heavy, +1 AC..."></label>
      <div class="inventory-form-tags"><strong>Tags</strong><div class="inventory-tag-options">${['Armor','Weapon','Shield','Focus','Ammunition','Accessory','Consumable','Potion','Treasure','Quest Item','Spell Component','Magical','Material','Utility'].map(v=>`<label><input type="checkbox" class="if-tag" value="${esc(v)}" ${(i.tags||[]).includes(v)?'checked':''}> ${esc(v)}</label>`).join('')}</div></div>
      <button type="button" class="inventory-form-submit weapon-editor-submit" data-item-id="${esc(i.id||'')}" onclick="saveWeaponItemForm()">${existing?'Save Changes':'Add Item'}</button>
    </div>`;
    document.body.appendChild(o);renderRows();
  }
  window.openItemForm=id=>{const x=get(),i=id?x.items.find(v=>String(v.id)===String(id)):null;openWeaponForm(i);};
  window.openAddItemForm=()=>openWeaponForm(null);
  window.saveWeaponItemForm=()=>{
    const x=get(),e=E(),id=currentId(),existing=id?x.items.find(v=>String(v.id)===String(id)):null;
    const name=document.getElementById('if-name')?.value.trim();if(!name){alert('Please enter an item name.');return;}
    const i=existing||e.createItem({id:`item-${Date.now()}`});
    i.name=name;i.icon=document.getElementById('if-icon')?.value||'⚔️';i.description=document.getElementById('if-description')?.value.trim()||'';
    i.quantity=Math.max(0,Math.floor(n(document.getElementById('if-quantity')?.value)));i.weight=Math.max(0,n(document.getElementById('if-weight')?.value));
    i.magical=!!document.getElementById('if-magical')?.checked;i.properties=(document.getElementById('if-properties')?.value||'').split(',').map(v=>v.trim()).filter(Boolean);
    i.tags=[...document.querySelectorAll('.if-tag:checked')].map(v=>v.value);i.equipment=i.equipment||{type:'weapon',equipped:false};i.equipment.type='weapon';
    i.inventorySection=i.equipment.equipped?'equipment':(existing?.inventorySection||'miscellaneous');
    const attackType=document.getElementById('if-attack-type')?.value||'melee',attackAbility=document.getElementById('if-attack-ability')?.value||'strength',attackBonus=n(document.getElementById('if-attack-bonus')?.value);
    i.mechanics=e.createWeaponMechanics({type:'weapon',attack:{type:attackType,ability:attackAbility,proficient:true,bonus:attackBonus},damage:collectRows(),properties:(document.getElementById('if-weapon-properties')?.value||'').split(',').map(v=>v.trim()).filter(Boolean)});
    if(!existing)x.items.push(i);save(x);window.__weaponDamageDraft=null;document.querySelector('.inventory-form-overlay')?.remove();
    const backType=i.inventorySection==='equipment'?'equipment':'miscellaneous';window.showInventorySection(backType,backType==='equipment'?'weapon':'all');
  };
})();