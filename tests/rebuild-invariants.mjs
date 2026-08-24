import {readFileSync,readdirSync} from 'node:fs';
const required=['src/main.tsx','src/App.tsx','src/domain/types.ts','src/domain/rules.ts','src/domain/catalog.ts','src/domain/character-builder.ts','src/domain/spellcasting.ts','src/domain/slot-tables.ts','src/domain/validation.ts','src/application/storage.ts','src/ui/Builder.tsx'];
for(const f of required)readFileSync(f,'utf8');
const app=readFileSync('src/App.tsx','utf8');
for(const token of ['Builder','Equipment','Spells','Skills','Short Rest','Long Rest'])if(!app.includes(token))throw new Error(`Missing UI integration: ${token}`);
const types=readFileSync('src/domain/types.ts','utf8');
for(const token of ['alwaysPrepared','spellbook','damage','ArmorData','ShieldData','fightingStyles','feats'])if(!types.includes(token))throw new Error(`Missing canonical model field: ${token}`);
console.log('Rebuild invariants passed');
