# D&D Companion — clean rebuild

## Goal
A generic D&D 5e 2014 character companion. The UI never contains class-specific rules; rules live in the domain engine and data layer.

## Layers
- `src/domain/types.ts` — canonical persisted character model.
- `src/domain/rules.ts` — pure derived-value functions; no DOM and no React.
- `src/domain/data/` — authoritative rules datasets, progressively imported from the supplied 2014 PHB, DMG, MM, Xanathar and Tasha PDFs.
- `src/application/` — character commands, validation, persistence and derived snapshots.
- `src/components/` — React presentation only.
- `src/App.tsx` — composition/navigation, not rules.

## Rules model
The character state keeps class, subclass, species, feats, skills, saving throws, resources, equipment, spellcasting, conditions and resistances separately. Derived values are calculated from state rather than stored redundantly.

Spellcasting distinguishes:
- class spell list;
- spells known (when applicable);
- spellbook (when applicable);
- player-prepared spells;
- always-prepared spells from class/subclass/species/feat/item;
- spell slots and Pact Magic slots.

Equipment distinguishes weapon, armor, shield, focus, gear and magic item. Weapons support multiple damage parts; armor supports base AC, Dexterity contribution/cap, Strength requirement, Stealth disadvantage and magical bonus; shields have their own AC contribution.

## Tasha/Xanathar
Optional content is represented as selectable sources/options. It must never silently replace a 2014 core feature. Replacement relationships and prerequisites belong to the rules data, not UI code.

## Testing standard
Every rules block must pass:
1. TypeScript/build checks.
2. Pure engine tests with representative characters.
3. Architecture/static checks ensuring UI does not duplicate rule calculations.
4. Manual browser testing after the build is green.
5. Rules double-check against the supplied PDFs before a rule is marked complete.
