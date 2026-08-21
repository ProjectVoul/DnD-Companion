/* D&D Companion — Character Sheet view
 *
 * The sheet is a read-only projection of the existing app state.
 * It intentionally does not create a second copy of gameplay state.
 */
(() => {
    "use strict";

    let previousHTML = null;

    const escapeHTML = value =>
        String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    function readCharacterIdentity() {
        const summary = document.querySelector(".character-summary");
        const paragraphs = summary
            ? Array.from(summary.querySelectorAll("p")).map(node => node.textContent.trim())
            : [];
        const stored = JSON.parse(sessionStorage.getItem("characterIdentity") || "null");
        return stored || {
            name: summary?.querySelector("h1")?.textContent.trim() || "Your Character",
            race: paragraphs[0] || "—",
            classLevel: paragraphs[1] || "—",
            alignment: paragraphs[2] || "—"
        };
    }

    function captureHomeState() {
        const hp = document.getElementById("current-hp");
        const maxHP = document.getElementById("maximum-hp");
        const hitDice = document.getElementById("hit-dice-value");
        const concentration = document.getElementById("concentration-toggle");
        const status = document.getElementById("status-selector");
        if (!hp && !hitDice && !concentration && !status) return;

        sessionStorage.setItem("characterHomeState", JSON.stringify({
            currentHP: hp?.textContent.trim() ?? null,
            maximumHP: maxHP?.textContent.trim() ?? null,
            hitDice: hitDice?.textContent.trim() ?? null,
            concentration: concentration?.textContent.trim() ?? null,
            status: status?.textContent.trim() ?? null,
            conditions: Array.from(document.querySelectorAll("#active-conditions .condition-badge"))
                .map(node => node.textContent.trim()),
            deathSaves: {
                successes: document.querySelectorAll(".save-dot:not(.failure).active").length,
                failures: document.querySelectorAll(".save-dot.failure.active").length
            }
        }));

        const summary = document.querySelector(".character-summary");
        if (summary) {
            sessionStorage.setItem("characterIdentity", JSON.stringify({
                name: summary.querySelector("h1")?.textContent.trim() || "Your Character",
                race: summary.querySelectorAll("p")[0]?.textContent.trim() || "—",
                classLevel: summary.querySelectorAll("p")[1]?.textContent.trim() || "—",
                alignment: summary.querySelectorAll("p")[2]?.textContent.trim() || "—"
            }));
        }
    }

    window.captureCharacterHomeState = captureHomeState;

    function readHomeState() {
        const saved = JSON.parse(sessionStorage.getItem("characterHomeState") || "null");
        return saved || {
            currentHP: localStorage.getItem("currentHP") || "100",
            maximumHP: "100",
            hitDice: "—",
            concentration: "OFF",
            status: "Normal",
            conditions: [],
            deathSaves: { successes: 0, failures: 0 }
        };
    }

    function readInventory() {
        const saved = JSON.parse(localStorage.getItem("inventoryItems") || "[]");
        return Array.isArray(saved) ? saved : [];
    }

    function readAbilityState() {
        const saved = JSON.parse(localStorage.getItem("abilityState") || "{}");
        return saved && typeof saved === "object" ? saved : {};
    }

    const abilityLabels = {
        "dragons-breath": "Dragon's Breath",
        "lay-on-hands": "Lay on Hands",
        "shield-master": "Shield Master",
        "dragons-judgment": "Dragon's Judgment",
        "dragon-licorice": "Dragon Licorice"
    };

    function abilitiesHTML() {
        const state = readAbilityState();
        return Object.entries(abilityLabels).map(([id, name]) => {
            const resource = state[id];
            let usage = "Passive";
            if (resource && Number.isFinite(resource.currentUses)) {
                const maximum = id === "dragons-breath" ? 2 : id === "dragons-judgment" ? 3 : resource.currentUses;
                usage = `${resource.currentUses} / ${maximum} uses`;
            } else if (resource && Number.isFinite(resource.currentPool)) {
                usage = `${resource.currentPool} / 65 pool`;
            }
            return `<div class="cs-list-row"><span>⚔️</span><div><strong>${escapeHTML(name)}</strong><small>${escapeHTML(usage)}</small></div></div>`;
        }).join("");
    }

    function spellsHTML() {
        const prepared = JSON.parse(localStorage.getItem("preparedSpells") || "[]");
        if (!Array.isArray(prepared) || prepared.length === 0) return '<p class="cs-muted">No spells prepared.</p>';
        return prepared.map(name => `<div class="cs-list-row"><span>✨</span><div><strong>${escapeHTML(name)}</strong><small>Prepared spell</small></div></div>`).join("");
    }

    function spellSlotsHTML() {
        const slots = JSON.parse(localStorage.getItem("spellSlots") || "null") || {
            1: { current: 4, maximum: 4 }, 2: { current: 3, maximum: 3 }, 3: { current: 2, maximum: 2 }, 4: { current: 1, maximum: 1 }, 5: { current: 0, maximum: 0 }
        };
        return Object.keys(slots).map(level => {
            const slot = slots[level];
            if (!slot || Number(slot.maximum) === 0) return "";
            const suffix = level === "1" ? "st" : level === "2" ? "nd" : level === "3" ? "rd" : "th";
            return `<div class="cs-resource-row"><span>${level}${suffix} level</span><strong>${slot.current} / ${slot.maximum}</strong></div>`;
        }).join("");
    }

    function equipmentHTML() {
        const equipped = readInventory().filter(item => item.equipped);
        if (!equipped.length) return '<p class="cs-muted">No equipped items.</p>';
        return equipped.map(item => `<div class="cs-list-row"><span>${escapeHTML(item.icon || "📦")}</span><div><strong>${escapeHTML(item.name)}</strong><small>${escapeHTML(Array.isArray(item.properties) && item.properties.length ? item.properties.join(" · ") : "Equipped")}</small></div></div>`).join("");
    }

    function render() {
        const app = document.getElementById("app");
        if (!app) return;
        captureHomeState();

        const identity = readCharacterIdentity();
        const state = readHomeState();
        const conditions = Array.isArray(state.conditions) && state.conditions.length ? state.conditions.map(escapeHTML).join(", ") : "Normal";
        const successes = Number(state.deathSaves?.successes) || 0;
        const failures = Number(state.deathSaves?.failures) || 0;
        const dots = (count, failure) => [0, 1, 2].map(index => `<span class="cs-dot ${failure ? "failure" : ""} ${index < count ? "filled" : ""}"></span>`).join("");

        app.innerHTML = `
            <header class="app-header cs-header">
                <button class="back-button" type="button" id="character-sheet-back">← Back</button>
                <h1>Character Sheet</h1>
                <p>Central view of your character data</p>
            </header>
            <main class="character-sheet">
                <section class="cs-identity"><div class="cs-avatar">⚔️</div><div><h2>${escapeHTML(identity.name)}</h2><p>${escapeHTML(identity.race)}</p><p>${escapeHTML(identity.classLevel)}</p><p>${escapeHTML(identity.alignment)}</p></div></section>
                <section class="cs-card">
                    <div class="cs-section-title">Combat & Resources</div>
                    <div class="cs-stat-grid">
                        <div class="cs-stat"><span>HP</span><strong>${escapeHTML(state.currentHP)} / ${escapeHTML(state.maximumHP)}</strong></div>
                        <div class="cs-stat"><span>Hit Dice</span><strong>${escapeHTML(state.hitDice)}</strong></div>
                        <div class="cs-stat"><span>Concentration</span><strong>${escapeHTML(state.concentration)}</strong></div>
                        <div class="cs-stat"><span>Status</span><strong>${conditions}</strong></div>
                    </div>
                    <div class="cs-subsection"><span class="cs-label">Death Saves</span><div class="cs-save-grid"><div><small>Successes</small><div class="cs-dots">${dots(successes, false)}</div></div><div><small>Failures</small><div class="cs-dots">${dots(failures, true)}</div></div></div></div>
                </section>
                <section class="cs-card">
                    <div class="cs-section-title">Spellcasting</div>
                    <div class="cs-info-row"><span>Class</span><strong>Paladin</strong></div>
                    <div class="cs-subsection"><span class="cs-label">Spell Slots</span>${spellSlotsHTML()}</div>
                    <div class="cs-subsection"><span class="cs-label">Prepared Spells</span><div class="cs-list">${spellsHTML()}</div></div>
                </section>
                <section class="cs-card"><div class="cs-section-title">Abilities</div><div class="cs-list">${abilitiesHTML()}</div></section>
                <section class="cs-card"><div class="cs-section-title">Equipped Equipment</div><div class="cs-list">${equipmentHTML()}</div></section>
            </main>`;

        document.getElementById("character-sheet-back")?.addEventListener("click", closeCharacterSheet);
    }

    function closeCharacterSheet() {
        const app = document.getElementById("app");
        if (!app || previousHTML === null) {
            if (typeof window.goHome === "function") window.goHome();
            return;
        }
        app.innerHTML = previousHTML;
        previousHTML = null;
        setTimeout(() => window.addCharacterSheetShortcut?.(), 0);
    }

    function injectStyles() {
        if (document.getElementById("character-sheet-style")) return;
        const style = document.createElement("style");
        style.id = "character-sheet-style";
        style.textContent = `
            .character-sheet{display:flex;flex-direction:column;gap:12px}
            .cs-header{padding-bottom:18px}
            .cs-identity{display:flex;align-items:center;gap:14px;padding:4px 2px 10px}
            .cs-avatar{width:64px;height:64px;display:flex;align-items:center;justify-content:center;background:var(--surface-light);border:1px solid var(--border);border-radius:12px;font-size:28px}
            .cs-identity h2{font-size:21px;font-weight:600;margin-bottom:3px}
            .cs-identity p{color:var(--text-muted);font-size:12px;line-height:1.5}
            .cs-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:16px}
            .cs-section-title{font-size:12px;text-transform:uppercase;letter-spacing:.8px;color:var(--text-muted);margin-bottom:13px}
            .cs-stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}
            .cs-stat{padding:11px;background:var(--surface-light);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:4px;min-width:0}
            .cs-stat span,.cs-label{color:var(--text-muted);font-size:10px;text-transform:uppercase;letter-spacing:.6px}
            .cs-stat strong{font-size:14px;overflow-wrap:anywhere}
            .cs-subsection{margin-top:15px;padding-top:15px;border-top:1px solid var(--border)}
            .cs-save-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:9px}
            .cs-save-grid small{color:var(--text-muted);font-size:11px}
            .cs-dots{display:flex;gap:6px;margin-top:8px}
            .cs-dot{width:13px;height:13px;border:1px solid var(--accent);border-radius:50%}
            .cs-dot.filled{background:var(--accent)}
            .cs-dot.failure{border-color:var(--danger)}
            .cs-dot.failure.filled{background:var(--danger)}
            .cs-info-row,.cs-resource-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid var(--border);font-size:13px}
            .cs-resource-row:last-child{border-bottom:0}
            .cs-info-row span,.cs-resource-row span{color:var(--text-muted)}
            .cs-list{display:flex;flex-direction:column;gap:7px;margin-top:9px}
            .cs-list-row{display:flex;align-items:center;gap:10px;padding:10px;background:var(--surface-light);border:1px solid var(--border);border-radius:10px}
            .cs-list-row>span{width:25px;text-align:center;font-size:18px;flex-shrink:0}
            .cs-list-row div{display:flex;flex-direction:column;gap:2px;min-width:0}
            .cs-list-row strong{font-size:13px}
            .cs-list-row small{color:var(--text-muted);font-size:10px;line-height:1.4}
            .cs-muted{color:var(--text-muted);font-size:12px}
            @media(max-width:430px){.cs-card{padding:14px}}
        `;
        document.head.appendChild(style);
    }

    window.showCharacterSheet = function () {
        const app = document.getElementById("app");
        if (!app) return;
        injectStyles();
        if (previousHTML === null) previousHTML = app.innerHTML;
        render();
        window.scrollTo({ top: 0, behavior: "auto" });
    };

    window.closeCharacterSheet = closeCharacterSheet;
    injectStyles();
})();
