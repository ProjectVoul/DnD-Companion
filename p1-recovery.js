/* P1 recovery: functional fixes + common UI styling */
(function () {
    "use strict";

    // ---------- Dragon Licorice ----------
    function findDragonLicorice() {
        return inventoryItems.find(item =>
            (item.id === "dragon-licorice" ||
             String(item.name || "").trim().toLowerCase() === "dragon licorice") &&
            Number(item.quantity) > 0
        );
    }

    function ensureDragonLicorice() {
        const existing = inventoryItems.find(item =>
            item.id === "dragon-licorice" ||
            String(item.name || "").trim().toLowerCase() === "dragon licorice"
        );
        if (existing) return existing;

        const item = {
            id: "dragon-licorice",
            name: "Dragon Licorice",
            category: "miscellaneous",
            location: "miscellaneous",
            icon: "🍬",
            description: "A piece of enchanted licorice that grants one additional use of Dragon's Breath after a long rest.",
            quantity: 1,
            weight: null,
            equipped: false,
            magical: true,
            properties: ["Grants +1 Dragon's Breath use"],
            tags: ["Utility", "Magical"],
            originalLocation: "miscellaneous"
        };
        inventoryItems.push(item);
        saveInventory();
        return item;
    }

    ensureDragonLicorice();

    window.updateDragonBreathUses = function () {
        const ability = abilities.find(a => a.id === "dragons-breath");
        if (!ability) return;
        ability.maximumUses = 1 + (findDragonLicorice() ? 1 : 0);
        if (ability.currentUses > ability.maximumUses) {
            ability.currentUses = ability.maximumUses;
        }
    };

    updateDragonBreathUses();

    const licoriceAbility = abilities.find(a => a.id === "dragon-licorice");
    if (licoriceAbility) licoriceAbility.linkedItems = ["dragon-licorice"];

    // ---------- Long Rest -> reset abilities ----------
    const originalLongRest = window.longRest;
    if (typeof originalLongRest === "function") {
        window.longRest = function () {
            originalLongRest();
            updateDragonBreathUses();
            resetAbilityUses();
        };
    }

    // ---------- Quick consumption -> refresh linked resources ----------
    const originalConsume = window.consumeInventoryItem;
    if (typeof originalConsume === "function") {
        window.consumeInventoryItem = function (itemId) {
            originalConsume(itemId);
            updateDragonBreathUses();
            saveAbilityState();
        };
    }

    // ---------- HP bar ----------
    function ensureHPBar() {
        const section = document.querySelector(".status-hp");
        if (!section) return;

        let bar = document.getElementById("hp-bar-fill");
        if (!bar) {
            const wrapper = document.createElement("div");
            wrapper.className = "hp-bar";
            wrapper.setAttribute("aria-hidden", "true");
            wrapper.innerHTML = '<div id="hp-bar-fill" class="hp-bar-fill"></div>';
            const controls = section.querySelector(".hp-controls");
            if (controls) section.insertBefore(wrapper, controls);
            else section.appendChild(wrapper);
            bar = document.getElementById("hp-bar-fill");
        }

        const percentage = maximumHP > 0
            ? Math.max(0, Math.min(100, (currentHP / maximumHP) * 100))
            : 0;
        bar.style.width = `${percentage}%`;
    }

    const originalUpdateHP = window.updateHP;
    if (typeof originalUpdateHP === "function") {
        window.updateHP = function () {
            originalUpdateHP();
            ensureHPBar();
        };
    }
    ensureHPBar();

    // ---------- Shared visual language for Abilities + Inventory ----------
    const style = document.createElement("style");
    style.id = "p1-recovery-style";
    style.textContent = `
        .hp-bar{width:100%;height:8px;margin:4px 0 14px;background:var(--surface-light);border:1px solid var(--border);border-radius:999px;overflow:hidden}
        .hp-bar-fill{width:100%;height:100%;background:var(--accent);border-radius:inherit;transition:width .18s ease}

        .ability-tabs{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px}
        .ability-tab{flex:1 1 calc(50% - 8px);min-width:140px;padding:11px 12px;background:var(--surface);color:var(--text-muted);border:1px solid var(--border);border-radius:10px;font-family:inherit;font-size:12px;font-weight:600;cursor:pointer}
        .ability-tab.active{background:var(--surface-light);color:var(--accent-light);border-color:var(--accent)}
        .ability-section{margin-bottom:24px}.ability-section h2{margin-bottom:11px;font-size:16px;font-weight:600}
        .ability-list{display:flex;flex-direction:column;gap:8px}
        .ability-card{display:flex;align-items:center;gap:12px;width:100%;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:12px;cursor:pointer;transition:.15s ease}
        .ability-card:hover{background:var(--surface-light);border-color:#4a4641}.ability-card:active{transform:scale(.99)}
        .ability-icon{width:40px;min-width:40px;display:flex;align-items:center;justify-content:center;font-size:25px}
        .ability-info{flex:1;min-width:0}.ability-card-title{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:8px}
        .ability-card-title h3{font-size:15px;font-weight:600}.ability-action-type{color:var(--text-muted);font-size:10px;white-space:nowrap}.ability-meta{color:var(--text-muted);font-size:11px}.ability-arrow{color:var(--text-muted);font-size:24px}
        .ability-uses{display:flex;align-items:center;gap:8px}.ability-use-dots{display:flex;gap:5px}.ability-use-dot{width:9px;height:9px;border-radius:50%;border:1px solid var(--accent)}.ability-use-dot.filled{background:var(--accent)}
        .ability-pool-header{display:flex;justify-content:space-between;margin-bottom:5px}.ability-pool-bar{width:100%;height:6px;background:var(--surface-light);border:1px solid var(--border);border-radius:999px;overflow:hidden}.ability-pool-fill{height:100%;background:var(--accent);border-radius:inherit}.ability-passive{color:var(--accent-light)}
        .ability-details{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:18px}.ability-detail-usage{padding-bottom:16px;border-bottom:1px solid var(--border)}
        .ability-description{padding:16px 0}.ability-description h2,.ability-linked-items h2{margin-bottom:8px;font-size:15px}.ability-description p{color:var(--text-muted);font-size:13px;line-height:1.65}
        .ability-linked-items{padding:4px 0 16px}.linked-ability-card{display:flex;align-items:center;gap:10px;width:100%;padding:10px 12px;background:var(--surface-light);color:var(--text);border:1px solid var(--border);border-radius:10px;font-family:inherit;text-align:left;cursor:pointer}.linked-ability-card div{flex:1;display:flex;flex-direction:column;gap:2px}.linked-ability-card small{color:var(--text-muted);font-size:10px}.linked-ability-card strong{font-size:13px}
        .ability-action-group{display:flex;flex-direction:column;gap:10px}.ability-counter-actions{display:flex;align-items:center;justify-content:center;gap:16px}.ability-counter-actions>span{min-width:55px;text-align:center;font-weight:600}.ability-counter-button{width:38px;height:38px;background:var(--surface-light);color:var(--accent);border:1px solid var(--border);border-radius:50%;font-size:20px;cursor:pointer}.ability-pool-slider{width:100%;accent-color:var(--accent)}

        .inventory-main-menu{display:flex;flex-direction:column;gap:12px;margin-bottom:18px}.inventory-main-button,.currency-summary-button{display:flex;align-items:center;gap:14px;width:100%;min-height:78px;padding:15px 18px;background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:14px;font-family:inherit;text-align:left;cursor:pointer;transition:.15s ease}
        .inventory-main-button:hover,.currency-summary-button:hover{background:var(--surface-light);border-color:var(--accent)}.inventory-main-button:active,.currency-summary-button:active{transform:scale(.99)}
        .inventory-main-button strong,.currency-summary-button strong{flex:1;font-size:16px}.currency-summary{margin-top:4px}.currency-summary-button{min-height:84px}.currency-summary-button>div{flex:1;display:flex;flex-direction:column;gap:3px}.currency-summary-button small{color:var(--text-muted);font-size:12px}.currency-mini{display:flex;flex-wrap:wrap;gap:8px 14px;padding:10px 6px 0;color:var(--text-muted);font-size:11px}
        .inventory-add-button{margin-bottom:14px;padding:9px 13px;background:var(--surface);color:var(--accent-light);border:1px solid var(--border);border-radius:9px;font-family:inherit;font-size:12px;font-weight:600;cursor:pointer}.inventory-add-button:hover{border-color:var(--accent);background:var(--surface-light)}
        .inventory-item-card{align-items:flex-start}.inventory-item-info{gap:6px}
        .inventory-action-button,.inventory-equip-button,.inventory-consume-button{width:100%;min-height:34px;padding:7px 10px;background:var(--surface-light);color:var(--accent-light);border:1px solid var(--border);border-radius:9px;font-family:inherit;font-size:11px;font-weight:600;cursor:pointer}.inventory-action-button:hover,.inventory-equip-button:hover,.inventory-consume-button:hover{border-color:var(--accent)}
        .inventory-action-button:disabled,.inventory-equip-button:disabled,.inventory-consume-button:disabled{opacity:.4;cursor:not-allowed}.inventory-action-group{display:flex;flex-direction:column;gap:8px;padding-top:4px}.inventory-delete-button{color:#d28b8b}.inventory-unavailable{color:var(--danger);font-size:11px;font-weight:600}
        .inventory-details{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:18px}.inventory-detail-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding-bottom:16px;border-bottom:1px solid var(--border)}.inventory-detail-stat{display:flex;flex-direction:column;gap:4px}.inventory-detail-stat span{color:var(--text-muted);font-size:9px;letter-spacing:.7px}.inventory-detail-stat strong{font-size:13px}
        .inventory-description{padding:16px 0}.inventory-description h2,.inventory-details-properties h2{margin-bottom:8px;font-size:15px}.inventory-description p{color:var(--text-muted);font-size:13px;line-height:1.65}.inventory-details-properties{padding:0 0 16px}.inventory-details-properties>div{display:flex;flex-wrap:wrap;gap:6px}.inventory-property{color:var(--text-muted);font-size:12px}
        @media(max-width:430px){.ability-tab{min-width:0;flex-basis:calc(50% - 8px)}.ability-card{padding:12px}.inventory-detail-summary{grid-template-columns:1fr 1fr}}
    `;
    document.head.appendChild(style);
})();
