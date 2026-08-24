# D&D Companion rebuild

This branch is the clean React + TypeScript + Vite architecture. The legacy JavaScript application remains available on `main` and `repair/stability` as historical/reference implementations.

## Architecture

- `src/domain/`: canonical rules, types and content data. Rules do not render UI.
- `src/application/`: persistence and application services.
- `src/ui/`: React presentation and builder flows.
- `src/main.tsx`: single browser entry point.

A rule should have one authoritative implementation in `src/domain/`.

## Manual test baseline

The first test character is a level 13 Oath of Devotion paladin fixture. It is only a regression fixture; the application must remain class-agnostic.

Manual test coverage before release should include:

1. character builder: species, class, subclass, ability scores, skills;
2. derived stats: proficiency, saves, skills, AC, initiative, passive perception, HP;
3. HP editing and persistence;
4. short/long rest and resources;
5. equipment categories and typed editors;
6. multiple weapon damage parts and attack/proficiency fields;
7. armor/shield AC rules;
8. prepared/always-prepared/class spell list separation;
9. known spells and wizard spellbook model;
10. spell slots and pact slots;
11. class/subclass/species/feat features;
12. optional Tasha features as explicit choices;
13. Xanathar/Tasha additional content sources;
14. magic item and homebrew effects;
15. multiclass character state;
16. local persistence and reset/migration.

## GitHub Pages

For the eventual manual test deployment, Pages must publish this branch (`rebuild/react-engine`) from the repository root. Vite is configured with the repository base path `/DnD-Companion/`.
