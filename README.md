# D&D Companion

## Architecture v2

The active application is now being rebuilt around a rules-first model for **D&D 5e 2014**.

- `dnd-data-v2.js` — structured rules/source data.
- `dnd-engine-v2.js` — the single authority for derived character values.
- `dnd-app-v2.js` — presentation and interaction only.
- `dnd-v2.css` — dark-fantasy visual layer.
- `index.html` — loads only the v2 runtime.

### Design principles

1. The app is a general character companion, not a Paladin sheet.
2. Character data is separate from calculated data.
3. Derived values are calculated from rules rather than manually stored.
4. Multiclass characters are first-class citizens.
5. Xanathar and Tasha are optional sources controlled per character/campaign.
6. Source options are data, not UI conditionals scattered through the application.
7. The UI must not implement D&D rules itself.
8. Legacy files remain in the repository temporarily as migration/reference material; they are no longer loaded by `index.html`.

## Rules scope

The current rules target the 2014 fifth-edition ruleset. The uploaded Player's Handbook, Dungeon Master's Guide, Monster Manual, Xanathar's Guide to Everything and Tasha's Cauldron of Everything are the reference set for the companion's rules work.

Tasha's material is modeled as optional, consistent with the book's own guidance. Xanathar's material is likewise treated as an optional expansion over the core rules.

The long-term architecture is intended to support additional sources without rewriting the character engine.
