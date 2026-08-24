/* D&D Companion v4 — complete, mobile-first equipment editor. */
(() => {
  'use strict';
  const E=window.DnDEngineV3||window.DnDEngineV2,D=window.DnDDataV2;
  if(!E)return;
  const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const types={other:'Miscellaneous',weapon:'Weapon',armor:'Armor',shield:'Shield',focus:'Spellcasting Focus',tool:'Tool'};
  const dice=['d4','d6','d8','d10','d12','d20'];
  const damageTypes=['acid','bludgeoning','cold','fire','force','lightning','necrotic','piercing','poison','psychic','radiant','slashing','thunder'];
  const props=['finesse','heavy','light','loading','reach','thrown','two-handed','versatile'];
  const field=(label,html,full=false)=>`<label class="form-field${full?' full':''}"><span>${label}</span>${html}</label>`;
  const modal=(title,body,save)=>{const r=document.createElement('div');r.className='modal-backdrop';r.innerHTML=`<div class="modal item-editor-v4"><header class="modal-head"><div><div class="eyebrow">EQUIPMENT</div><h2>${title}</h2></div><button type="button" data-close>×</button></header><div class="modal-body">${body}</div><footer class="modal-foot"><button type="button" class="button secondary" data-close>Cancel</button><button type="button" class="button" data-save>Save item</button></footer></div>`;document.body.appendChild(r);r.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>r.remove());r.querySelector('[data-save]').onclick=()=>save(r);return r;};
  const damageRow=(d={},i=0)=>`<div class="damage-row" data-damage-row="${i}"><input aria-label="Dice count" type="number" min="1" step="1" value="${Math.max(1,Number(d.dice?.count)||1)}" data-dmg-count><select aria-label="Die" data-dmg-die>${dice.map(x=>`<option value="${x}" ${d.dice?.die===x?'selected':''}>${x}</option>`).join('')}</select><select aria-label="Damage type" data-dmg-type>${damageTypes.map(x=>`<option value="${x}" ${d.type===x?'selected':''}>${x}</option>`).join('')}</select><input aria-label="Damage modifier" type="number" step="1" value="${Number(d.modifier)||0}" data-dmg-mod title="Flat damage bonus"><button type="button" class="danger" data-remove-damage>×</button></div>`;
  function openItem(index){
    const old=Number.isInteger(index)?E.state.items[index]:null;
    const i=old||{name:'',description:'',quantity:1,weight:0,equipment:{equipped:false,attuned:false},mechanics:{type:'other'}};
    const t=i.mechanics?.type||'other';
    const damage=i.mechanics?.damage?.length?i.mechanics.damage:[{dice:{count:1,die:'d8'},type:'slashing',modifier:0}];
    const body=`<div class="item-editor-intro">Choose the item category first. The form then exposes only the rules that matter for that equipment.</div><div class="form-grid">${field('Name',`<input data-name value="${esc(i.name)}" autocomplete="off">`)}${field('Type',`<select data-type>${Object.entries(types).map(([k,v])=>`<option value="${k}" ${t===k?'selected':''}>${v}</option>`).join('')}</select>`)}${field('Quantity',`<input type="number" min="1" step="1" data-qty value="${Math.max(1,Number(i.quantity)||1)}">`)}${field('Weight (lb)',`<input type="number" min="0" step="0.1" data-weight value="${Number(i.weight)||0}">`)}${field('Equipped',`<select data-equipped><option value="0" ${!i.equipment?.equipped?'selected':''}>No</option><option value="1" ${i.equipment?.equipped?'selected':''}>Yes</option></select>`)}${field('Attuned',`<select data-attuned><option value="0" ${!i.equipment?.attuned?'selected':''}>No</option><option value="1" ${i.equipment?.attuned?'selected':''}>Yes</option></select>`)}${field('Description',`<textarea data-desc rows="4">${esc(i.description||'')}</textarea>`,true)}<div class="form-field full" data-specific></div></div>`;
    const r=modal(old?`Edit item · ${esc(i.name||'Unnamed')}`:'Add item',body,root=>{
      const type=root.querySelector('[data-type]').value;
      const item={...i,id:i.id||`item-${Date.now()}`,name:root.querySelector('[data-name]').value.trim()||'Unnamed item',description:root.querySelector('[data-desc]').value,quantity:Math.max(1,Number(root.querySelector('[data-qty]').value)||1),weight:Math.max(0,Number(root.querySelector('[data-weight]').value)||0),equipment:{...(i.equipment||{}),equipped:root.querySelector('[data-equipped]').value==='1',attuned:root.querySelector('[data-attuned]').value==='1'},mechanics:{...(i.mechanics||{}),type}};
      const q=root.querySelector('[data-specific]');
      item.modifiers=[...(i.modifiers||[])].filter(m=>!String(m.id||'').startsWith('equipment-v4-'));
      if(type==='weapon'){
        const prof=q.querySelector('[data-proficiency]').value;
        item.proficiency={type:prof};
        item.mechanics.attack={...(i.mechanics?.attack||{}),type:q.querySelector('[data-atk-type]').value,ability:q.querySelector('[data-atk-ability]').value||null,proficient:prof!=='none',bonus:Number(q.querySelector('[data-atk-bonus]').value)||0,magicBonus:Number(q.querySelector('[data-atk-magic]').value)||0};
        item.mechanics.properties=[...q.querySelectorAll('[data-property]:checked')].map(x=>x.value);
        item.mechanics.damage=[...q.querySelectorAll('[data-damage-row]')].map(row=>({dice:{count:Math.max(1,Number(row.querySelector('[data-dmg-count]').value)||1),die:row.querySelector('[data-dmg-die]').value},type:row.querySelector('[data-dmg-type]').value,modifier:Number(row.querySelector('[data-dmg-mod]').value)||0}));
        if(!item.mechanics.damage.length)item.mechanics.damage=[{dice:{count:1,die:'d8'},type:'slashing',modifier:0}];
      }else if(type==='armor'){
        item.mechanics.category=q.querySelector('[data-category]').value;
        item.mechanics.armorClass=Number(q.querySelector('[data-ac]').value)||10;
        item.mechanics.dexterity={maximum:q.querySelector('[data-dex-max]').value===''?null:Number(q.querySelector('[data-dex-max]').value)};
        item.mechanics.strengthRequirement=Number(q.querySelector('[data-str]').value)||0;
        item.mechanics.stealthDisadvantage=q.querySelector('[data-stealth]').checked;
        const bonus=Number(q.querySelector('[data-magic-ac]').value)||0;if(bonus)item.modifiers.push({id:`equipment-v4-${item.id}`,target:'armorClass',mode:'add',value:bonus,sourceName:item.name});
      }else if(type==='shield'){
        item.mechanics.armorBonus=Number(q.querySelector('[data-shield-bonus]').value)||2;
        const bonus=Number(q.querySelector('[data-shield-magic]').value)||0;if(bonus)item.modifiers.push({id:`equipment-v4-${item.id}`,target:'armorClass',mode:'add',value:bonus,sourceName:item.name});
      }
      if(old)E.state.items[index]=item;else E.state.items.push(item);
      E.save();r.remove();
      window.dispatchEvent(new CustomEvent('dnd:character-changed'));
    });
    const specific=r.querySelector('[data-specific]');
    const bindDamage=()=>specific.querySelectorAll('[data-remove-damage]').forEach(b=>b.onclick=()=>b.closest('[data-damage-row]')?.remove());
    const render=()=>{
      const type=r.querySelector('[data-type]').value;
      if(type==='weapon'){
        const a=i.mechanics?.attack||{}, prof=i.proficiency?.type||a.proficiency?.type||'none';
        specific.innerHTML=`<div class="editor-section"><h3>Attack</h3><div class="form-grid">${field('Attack type',`<select data-atk-type><option value="melee">Melee</option><option value="ranged">Ranged</option></select>`)}${field('Ability',`<select data-atk-ability><option value="">Automatic</option>${D.ABILITIES.map(x=>`<option value="${x}" ${a.ability===x?'selected':''}>${x}</option>`).join('')}</select>`)}${field('Proficiency',`<select data-proficiency><option value="none" ${prof==='none'?'selected':''}>None</option><option value="simple" ${prof==='simple'?'selected':''}>Simple</option><option value="martial" ${prof==='martial'?'selected':''}>Martial</option><option value="custom" ${prof==='custom'?'selected':''}>Custom</option></select>`)}${field('Bonus to hit',`<input type="number" data-atk-bonus value="${Number(a.bonus)||0}">`)}${field('Magic bonus',`<input type="number" data-atk-magic value="${Number(a.magicBonus)||0}">`)}</div></div><div class="editor-section"><div class="section-title"><h3>Damage components</h3><button type="button" class="text-button" data-add-damage>+ Add damage</button></div><div class="damage-head"><span>Dice</span><span>Die</span><span>Type</span><span>Bonus</span></div><div data-damages>${damage.map((d,n)=>damageRow(d,n)).join('')}</div><small class="muted">Add more components for weapons such as 1d6 slashing + 1d6 fire.</small></div><div class="editor-section"><h3>Properties</h3><div class="tag-row">${props.map(p=>`<label class="tag"><input type="checkbox" value="${p}" data-property ${(i.mechanics?.properties||[]).includes(p)?'checked':''}> ${p}</label>`).join('')}</div></div>`;
        specific.querySelector('[data-atk-type]').value=a.type||'melee';specific.querySelector('[data-add-damage]').onclick=()=>{specific.querySelector('[data-damages]').insertAdjacentHTML('beforeend',damageRow({dice:{count:1,die:'d8'},type:'slashing',modifier:0},specific.querySelectorAll('[data-damage-row]').length));bindDamage();};bindDamage();
      }else if(type==='armor'){
        const m=i.mechanics||{};specific.innerHTML=`<div class="editor-section"><h3>Armor mechanics</h3><div class="form-grid">${field('Category',`<select data-category><option value="light" ${m.category==='light'?'selected':''}>Light</option><option value="medium" ${m.category==='medium'?'selected':''}>Medium</option><option value="heavy" ${m.category==='heavy'?'selected':''}>Heavy</option></select>`)}${field('Base AC',`<input type="number" min="0" data-ac value="${Number(m.armorClass)||10}">`)}${field('DEX bonus maximum',`<select data-dex-max><option value="">No limit</option><option value="2" ${Number(m.dexterity?.maximum)===2?'selected':''}>+2 maximum</option></select>`)}${field('Strength requirement',`<input type="number" min="0" data-str value="${Number(m.strengthRequirement)||0}">`)}${field('Magic AC bonus',`<input type="number" data-magic-ac value="${Number((i.modifiers||[]).find(x=>x.target==='armorClass')?.value)||0}">`)}<label class="check-field"><input type="checkbox" data-stealth ${m.stealthDisadvantage?'checked':''}> Stealth disadvantage</label></div></div>`;
      }else if(type==='shield'){
        const m=i.mechanics||{};specific.innerHTML=`<div class="editor-section"><h3>Shield mechanics</h3><div class="form-grid">${field('AC bonus',`<input type="number" data-shield-bonus value="${Number(m.armorBonus)||2}">`)}${field('Magic AC bonus',`<input type="number" data-shield-magic value="${Number((i.modifiers||[]).find(x=>x.target==='armorClass')?.value)||0}">`)}</div><small class="muted">A normal shield adds +2 AC; magic shields can add an additional bonus.</small></div>`;
      }else specific.innerHTML='<div class="editor-section"><h3>Additional rules</h3><p class="muted">No extra combat mechanics are required for this item type. You can still track quantity, weight, description, equipped state and attunement.</p></div>';
    };
    r.querySelector('[data-type]').onchange=render;render();
  }
  document.addEventListener('click',e=>{const trigger=e.target.closest?.('[data-action="add-item"],[data-add-item],[data-edit-item]');if(!trigger)return;e.preventDefault();e.stopImmediatePropagation();openItem(trigger.hasAttribute('data-edit-item')?Number(trigger.dataset.editItem):undefined);},true);
  window.DnDItemEditorV3={openItem};
})();
