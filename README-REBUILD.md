# D&D Companion rebuild

This branch is the clean React + TypeScript + Vite architecture. The legacy JavaScript application remains available on `main` and `repair/stability` as historical/reference implementations.

## Architecture

- `src/domain/`: canonical rules, types and content data. Rules do not render UI.
- `src/application/`: persistence and application services.
- `src/ui/`: React presentation and builder flows.

A rule should have one authoritative implementation in `src/domain/`.

## Current base scope

The rebuild now covers the core 5e 2014 character workflow: guided creation, species/subspecies choices, backgrounds, classes/subclasses, ability scores, class skills, feats, level-up/ASI choices, derived combat values, HP/rests/death saves, equipment and typed item editing, effects, resources/charges, spell preparation/known/spellbook models, spell slots/pact slots, optional Xanathar/Tasha sources, and local persistence.

The next release gate is the systematic rules/content review against the uploaded 5e source PDFs, followed by the full manual test pass. Accounts and multi-character cloud persistence should come only after this base gate is green.

## Manual test baseline

The first test character is a level 13 Oath of Devotion paladin fixture. It is only a regression fixture; the application must remain class-agnostic.

Manual test coverage before release should include:

1. character builder: identity, species, subclass, background, ability scores, skills and feat choices;
2. character details: alignment, notes, languages, proficiencies, currency, conditions and defenses;
3. derived stats: proficiency, saves, skills, AC, initiative, passive perception, HP;
4. HP editing and persistence;
5. short/long rest and resources/charges;
6. equipment categories and typed editors;
7. multiple weapon damage parts and attack/proficiency fields;
8. armor/shield AC rules;
9. prepared/always-prepared/class spell list separation;
10. known spells and wizard spellbook model;
11. spell slots and pact slots;
12. class/subclass/species/feat features;
13. optional Tasha features as explicit choices;
14. Xanathar/Tasha additional content sources;
15. magic item and homebrew effects;
16. multiclass character state;
17. local persistence and reset/migration.

## GitHub Pages

For the eventual manual test deployment, Pages must publish this branch (`rebuild/react-engine`) from the repository root. Vite is configured with the repository base path `/DnD-Companion/`.
