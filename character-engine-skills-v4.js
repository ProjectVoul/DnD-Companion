/* D&D Companion — Skill selection layer | D&D 5e 2014 */
(() => {
  'use strict';
  const e = window.DnDCharacterEngine;
  if (!e) return;

  // PHB 2014 class skill choices. Paladin and Artificer entries are verified
  // directly against the uploaded Player's Handbook and Tasha PDF.
  const CLASS_SKILL_CHOICES = {
    Barbarian: { count: 2, options: ['animalHandling','athletics','intimidation','nature','perception','survival'] },
    Bard: { count: 3, options: ['acrobatics','animalHandling','arcana','athletics','deception','history','insight','intimidation','investigation','medicine','nature','perception','performance','persuasion','sleightOfHand','stealth'] },
    Cleric: { count: 2, options: ['history','insight','medicine','persuasion','religion'] },
    Druid: { count: 2, options: ['arcana','animalHandling','insight','medicine','nature','perception','religion','survival'] },
    Fighter: { count: 2, options: ['acrobatics','animalHandling','athletics','history','insight','intimidation','perception','survival'] },
    Monk: { count: 2, options: ['acrobatics','athletics','history','insight','religion','stealth'] },
    Paladin: { count: 2, options: ['athletics','intimidation','insight','medicine','persuasion','religion'] },
    Ranger: { count: 3, options: ['animalHandling','athletics','insight','investigation','nature','perception','stealth','survival'] },
    Rogue: { count: 4, options: ['acrobatics','athletics','deception','insight','intimidation','investigation','perception','performance','persuasion','sleightOfHand','stealth'] },
    Sorcerer: { count: 2, options: ['arcana','deception','insight','intimidation','persuasion','religion'] },
    Warlock: { count: 2, options: ['arcana','deception','history','intimidation','investigation','nature','religion'] },
    Wizard: { count: 2, options: ['arcana','history','insight','investigation','medicine','religion'] },
    Artificer: { count: 2, options: ['arcana','investigation','medicine','nature','perception','sleightOfHand','history'] }
  };

  const LABELS = {
    athletics:'Athletics', acrobatics:'Acrobatics', sleightOfHand:'Sleight of Hand',
    stealth:'Stealth', arcana:'Arcana', history:'History', investigation:'Investigation',
    nature:'Nature', religion:'Religion', animalHandling:'Animal Handling', insight:'Insight',
    medicine:'Medicine', perception:'Perception', survival:'Survival', deception:'Deception',
    intimidation:'Intimidation', performance:'Performance', persuasion:'Persuasion'
  };

  const ensure = c => {
    c.choices = c.choices || {};
    c.choices.classSkills = Array.isArray(c.choices.classSkills) ? c.choices.classSkills : [];
    c.proficiencies = c.proficiencies || {};
    c.proficiencies.skills = c.proficiencies.skills || {};
    return c;
  };

  function getClassSkillChoices(character) {
    return CLASS_SKILL_CHOICES[character?.identity?.class] || { count: 0, options: [] };
  }

  function getBackgroundSkills(character) {
    const data = e.characterOptions?.backgrounds?.[character?.identity?.background];
    return Array.isArray(data?.skills) ? data.skills : [];
  }

  function getSelectedClassSkills(character) {
    ensure(character);
    const data = getClassSkillChoices(character);
    const blocked = new Set(getBackgroundSkills(character));
    const selected = character.choices.classSkills.filter(s => data.options.includes(s) && !blocked.has(s));
    return [...new Set(selected)].slice(0, data.count);
  }

  function getUnavailableClassSkills(character) {
    return getBackgroundSkills(character);
  }

  function setClassSkillSelection(character, skills) {
    ensure(character);
    const data = getClassSkillChoices(character);
    const background = new Set(getUnavailableClassSkills(character));
    const cleaned = [...new Set((skills || []).filter(s => data.options.includes(s) && !background.has(s)))].slice(0, data.count);
    character.choices.classSkills = cleaned;
    Object.keys(character.proficiencies.skills).forEach(skill=>{
      if(character.proficiencies.skills[skill]?.source==='class-choice') delete character.proficiencies.skills[skill];
    });
    cleaned.forEach(skill => {
      character.proficiencies.skills[skill] = { ...(character.proficiencies.skills[skill] || {}), proficiency: true, source: 'class-choice' };
    });
    return character;
  }

  function toggleClassSkill(character, skill) {
    ensure(character);
    const data = getClassSkillChoices(character);
    if (!data.options.includes(skill)) return { ok:false, reason:'not-available' };
    if (getUnavailableClassSkills(character).includes(skill)) return { ok:false, reason:'already-granted-by-background' };
    const selected = getSelectedClassSkills(character);
    const index = selected.indexOf(skill);
    if (index >= 0) selected.splice(index, 1);
    else {
      if (selected.length >= data.count) return { ok:false, reason:'selection-limit', limit:data.count };
      selected.push(skill);
    }
    setClassSkillSelection(character, selected);
    if (e.syncCharacterRules) e.syncCharacterRules(character);
    if (e.saveCharacter) e.saveCharacter(character);
    return { ok:true, selected:getSelectedClassSkills(character) };
  }

  e.classSkillChoices = CLASS_SKILL_CHOICES;
  e.skillLabels = LABELS;
  e.getClassSkillChoices = getClassSkillChoices;
  e.getSelectedClassSkills = getSelectedClassSkills;
  e.getBackgroundSkills = getBackgroundSkills;
  e.setClassSkillSelection = setClassSkillSelection;
  e.toggleClassSkill = toggleClassSkill;
})();
