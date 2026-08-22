/* D&D Companion — final integrity patch v1
 * AC is written into derived data explicitly; equipment items stay in Equipment.
 */
(() => {
  'use strict';
  const e = window.DnDCharacterEngine;
  if (!e || !e.calculator) return;
  const n = v => Number.isFinite(Number(v)) ? Number(v) : 0;
  const previousDerived = e.calculator.getDerivedData;
  function abilityMod(character, ability) {
    if (typeof e.calculator.getAbilityModifier === 'function') return e.calculator.getAbilityModifier(character, ability);
    return Math.floor((n(character.abilityScores?.[ability]) - 10) / 2);
  }
  function armorContribution(armor) {
    const raw = n(armor?.mechanics?.armorClass);
    return raw > 10 ? raw - 10 : raw;
  }
  function conditionMet(character, condition) {
    if (!condition) return true;
    if (condition.type === 'wearingArmor') return !!character.items?.some(i => i.equipment?.equipped && i.mechanics?.type === 'armor');
    if (condition.type === 'hasShield') return !!character.items?.some(i => i.equipment?.equipped && i.mechanics?.type === 'shield');
    if (condition.type === 'conscious') return character.status?.conscious !== false && !character.status?.unconscious;
    return true;
  }
  function modifierValue(character, modifier) {
    if (typeof modifier?.value === 'number') return modifier.value;
    const map = {strengthModifier:'strength',dexterityModifier:'dexterity',constitutionModifier:'constitution',intelligenceModifier:'intelligence',wisdomModifier:'wisdom',charismaModifier:'charisma'};
    return map[modifier?.value] ? abilityMod(character, map[modifier.value]) : n(modifier?.value);
  }
  function apply(value, character, modifier) {
    if (!conditionMet(character, modifier?.condition)) return value;
    const amount = modifierValue(character, modifier);
    switch (modifier?.mode) {
      case 'subtract': return value - amount;
      case 'multiply': return value * amount;
      case 'set': return amount;
      default: return value + amount;
    }
  }
  function getArmorClass(character) {
    const armor = character.items?.find(i => i.equipment?.equipped && i.mechanics?.type === 'armor') || null;
    const shield = character.items?.find(i => i.equipment?.equipped && i.mechanics?.type === 'shield') || null;
    const category = armor?.mechanics?.category || 'light';
    let ac = 10 + armorContribution(armor);
    if (category !== 'heavy') {
      const dex = abilityMod(character, 'dexterity');
      ac += category === 'medium' ? Math.min(dex, n(armor?.mechanics?.dexterity?.maximum ?? 2)) : dex;
    }
    if (shield) ac += n(shield.mechanics?.armorBonus);
    (character.items || []).forEach(item => {
      if (!item?.equipment?.equipped) return;
      (item.modifiers || [])
        .filter(m => m?.target === 'armorClass' && !String(m?.id || '').startsWith('legacy-ac-'))
        .forEach(m => { ac = apply(ac, character, m); });
    });
    if (typeof e.getApplicableFeatureModifiers === 'function') {
      e.getApplicableFeatureModifiers(character)
        .filter(m => m?.target === 'armorClass')
        .forEach(m => { ac = apply(ac, character, m); });
    }
    (character.activeEffects || [])
      .filter(x => x?.active !== false && x?.target === 'armorClass')
      .forEach(x => { ac = apply(ac, character, x); });
    return ac;
  }
  e.calculator.getArmorClass = getArmorClass;
  e.acRulesVersion = 2;
  e.acRules = { ...(e.acRules || {}), getArmorClass };
  e.calculator.getDerivedData = function(character) {
    const derived = previousDerived.call(this, character);
    derived.armorClass = getArmorClass(character);
    return derived;
  };
  document.addEventListener('click', () => {
    window.setTimeout(() => {
      try {
        const character = e.getLiveCharacter ? e.getLiveCharacter() : e.loadCharacter();
        let changed = false;
        (character.items || []).forEach(item => {
          const type = item?.mechanics?.type || item?.equipment?.type;
          if (['weapon','armor','shield','focus','accessory'].includes(type) && item.inventorySection !== 'equipment') {
            item.inventorySection = 'equipment';
            changed = true;
          }
        });
        if (changed) {
          if (e.saveLiveCharacter) e.saveLiveCharacter(character); else e.saveCharacter(character);
        }
      } catch (error) {
        console.error('Final integrity patch: failed to preserve inventory section', error);
      }
    }, 0);
  });
})();
