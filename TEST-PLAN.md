# Manual test plan

The rebuild is ready for manual testing only after CI is green.

## Baseline
- Open the app and create/reset the test character.
- Verify no console/runtime error and all navigation buttons render.

## Character
- Create Wizard, Paladin, Warlock, Druid and Fighter characters through Builder.
- Select species, subclass, ability scores and class skills.
- Verify proficiency bonus, saves and skill bonuses.
- Verify level-dependent class/subclass features.

## Combat
- Edit HP directly and with +/- controls; verify the bar and persistence.
- Verify AC from armor, Dex rules, shield and Defense fighting style.
- Verify initiative, passive perception, hit dice, death saves and conditions.

## Equipment
- Add and edit armor, weapon, shield and generic/magic items.
- Weapon: proficiency, attack bonus, damage bonus and multiple damage parts.
- Armor: category, base AC, Dex cap/application, strength requirement, stealth disadvantage, magic bonus.
- Shield: AC and magic bonus.
- Equip/unequip and verify derived stats.

## Spells
- Class spell list separated by level.
- Prepared tab separated into always-prepared and player-prepared.
- Wizard spellbook/known/prepared model.
- Paladin prepared capacity and oath spells.
- Warlock pact slots distinct from normal spell slots.
- Optional/source-tagged spells do not silently enter a disabled source.

## Rest/resources
- Short rest and long rest refresh the correct resources.
- Hit dice/death saves/HP behavior is consistent with the rules model.

## Persistence
- Reload page after changes.
- Reset fixture.
- Verify malformed legacy state falls back safely rather than crashing the app.
