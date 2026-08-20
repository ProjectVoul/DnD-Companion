/* P1 interaction layer: live HP/pool controls + short rest UI */
(function () {
    "use strict";

    // ---------- Dragon Breath ----------
    const dragonBreath = abilities.find(a => a.id === "dragons-breath");
    if (dragonBreath) {
        // Dragon Licorice adds a second available use. The new bonus is
        // granted immediately once on this page load.
        const hasLicorice = inventoryItems.some(item =>
            (item.id === "dragon-licorice" ||
             String(item.name || "").trim().toLowerCase() === "dragon licorice") &&
            Number(item.quantity) > 0
        );

        if (hasLicorice && dragonBreath.maximumUses < 2) {
            dragonBreath.maximumUses = 2;
            dragonBreath.currentUses = Math.min(2, Math.max(1, dragonBreath.currentUses + 1));
            saveAbilityState();
        }
    }

    // ---------- HP: the bar itself is the control ----------
    function paintRange(range, value, maximum) {
        if (!range) return;
        const percentage = maximum > 0
            ? Math.max(0, Math.min(100, (value / maximum) * 100))
            : 0;
        range.style.background =
            `linear-gradient(to right, var(--accent) ${percentage}%, var(--surface-light) ${percentage}%)`;
    }

    function installHPControl() {
        const section = document.querySelector(".status-hp");
        if (!section) return;

        let bar = document.getElementById("hp-bar-fill")?.parentElement;
        let range = document.getElementById("hp-slider");

        if (!bar) {
            bar = document.createElement("div");
            bar.className = "hp-bar";
            const controls = section.querySelector(".hp-controls");
            if (controls) section.insertBefore(bar, controls);
            else section.appendChild(bar);
        }

        if (!range) {
            bar.innerHTML = `
                <input
                    id="hp-slider"
                    class="hp-slider"
                    type="range"
                    min="0"
                    max="${maximumHP}"
                    value="${currentHP}"
                    aria-label="Current hit points"
                >
            `;
            range = document.getElementById("hp-slider");
        }

        // The +/- buttons are intentionally removed from the active UI:
        // HP is now controlled directly by the bar.
        section.querySelectorAll(".hp-button").forEach(button => {
            button.remove();
        });

        if (!range.dataset.bound) {
            range.dataset.bound = "true";
            range.addEventListener("input", function () {
                currentHP = Number(this.value);
                const current = document.getElementById("current-hp");
                if (current) current.textContent = currentHP;
                paintRange(this, currentHP, maximumHP);
            });
        }

        range.value = currentHP;
        paintRange(range, currentHP, maximumHP);
    }

    const previousUpdateHP = window.updateHP;
    window.updateHP = function () {
        if (typeof previousUpdateHP === "function") {
            previousUpdateHP();
        }
        installHPControl();
    };

    installHPControl();

    // ---------- Lay on Hands: one live interactive bar ----------
    function installPoolControl(ability) {
        const usage = document.querySelector(".ability-detail-usage");
        if (!usage || ability.usageType !== "pool") return;

        usage.innerHTML = `
            <div class="live-pool-control">
                <div class="live-pool-header">
                    <span>Pool</span>
                    <strong id="ability-pool-live-value">
                        ${ability.currentPool} / ${ability.maximumPool}
                    </strong>
                </div>

                <input
                    id="ability-pool-slider"
                    class="ability-pool-slider"
                    type="range"
                    min="0"
                    max="${ability.maximumPool}"
                    value="${ability.currentPool}"
                    aria-label="${ability.name} pool"
                >
            </div>
        `;

        const range = document.getElementById("ability-pool-slider");
        const value = document.getElementById("ability-pool-live-value");
        if (!range) return;

        const paint = () => paintRange(
            range,
            ability.currentPool,
            ability.maximumPool
        );

        range.addEventListener("input", function () {
            ability.currentPool = Number(this.value);
            if (value) {
                value.textContent =
                    `${ability.currentPool} / ${ability.maximumPool}`;
            }
            paint();
            saveAbilityState();
        });

        paint();
    }

    const previousShowAbilityDetails = window.showAbilityDetails;
    window.showAbilityDetails = function (abilityId) {
        if (typeof previousShowAbilityDetails === "function") {
            previousShowAbilityDetails(abilityId);
        }

        const ability = abilities.find(a => a.id === abilityId);
        if (ability && ability.usageType === "pool") {
            installPoolControl(ability);
        }
    };

    // Keep pool changes in-place rather than rebuilding the whole detail page.
    window.changeAbilityPool = function (abilityId, value) {
        const ability = abilities.find(a => a.id === abilityId);
        if (!ability || ability.usageType !== "pool") return;

        ability.currentPool = Number(value);

        const liveValue = document.getElementById("ability-pool-live-value");
        const range = document.getElementById("ability-pool-slider");

        if (liveValue) {
            liveValue.textContent =
                `${ability.currentPool} / ${ability.maximumPool}`;
        }
        paintRange(range, ability.currentPool, ability.maximumPool);
        saveAbilityState();
    };

    // ---------- Short Rest: custom modal ----------
    window.shortRest = function () {
        closeRestMenu();

        const overlay = document.createElement("div");
        overlay.className = "short-rest-overlay";
        overlay.innerHTML = `
            <div class="short-rest-modal">
                <button class="rest-close" type="button" aria-label="Close">×</button>

                <h2>Short Rest</h2>
                <p>Spend Hit Dice and enter the HP you recovered.</p>

                <label class="short-rest-field">
                    <span>Hit Dice spent</span>
                    <input
                        id="short-rest-dice"
                        type="number"
                        min="0"
                        max="${currentHitDice}"
                        value="0"
                        inputmode="numeric"
                    >
                    <small>Available: ${currentHitDice}</small>
                </label>

                <label class="short-rest-field">
                    <span>HP recovered</span>
                    <input
                        id="short-rest-hp"
                        type="number"
                        min="0"
                        value="0"
                        inputmode="numeric"
                    >
                </label>

                <button class="short-rest-submit" type="button">
                    Apply Short Rest
                </button>
            </div>
        `;

        document.body.appendChild(overlay);

        const close = () => overlay.remove();
        overlay.querySelector(".rest-close").addEventListener("click", close);

        overlay.querySelector(".short-rest-submit").addEventListener("click", () => {
            const dice = Number(document.getElementById("short-rest-dice").value);
            const recovered = Number(document.getElementById("short-rest-hp").value);

            if (!Number.isInteger(dice) || dice < 0 || dice > currentHitDice) {
                alert("Invalid number of Hit Dice.");
                return;
            }

            if (!Number.isInteger(recovered) || recovered < 0) {
                alert("Invalid HP amount.");
                return;
            }

            currentHitDice -= dice;
            currentHP = Math.min(maximumHP, currentHP + recovered);

            updateHP();
            updateHitDice();
            close();
        });
    };

    // ---------- P1 interaction styling ----------
    const style = document.createElement("style");
    style.id = "p1-interaction-style";
    style.textContent = `
        .hp-bar {
            width: 100%;
            height: 14px;
            margin: 8px 0 16px;
            border: 1px solid var(--border);
            border-radius: 999px;
            overflow: hidden;
            background: var(--surface-light);
        }

        .hp-slider,
        .ability-pool-slider {
            display: block;
            width: 100%;
            height: 14px;
            margin: 0;
            padding: 0;
            appearance: none;
            -webkit-appearance: none;
            border-radius: 999px;
            cursor: pointer;
        }

        .hp-slider::-webkit-slider-runnable-track,
        .ability-pool-slider::-webkit-slider-runnable-track {
            height: 14px;
            background: transparent;
            border-radius: 999px;
        }

        .hp-slider::-webkit-slider-thumb,
        .ability-pool-slider::-webkit-slider-thumb {
            width: 0;
            height: 0;
            appearance: none;
            -webkit-appearance: none;
        }

        .hp-slider::-moz-range-track,
        .ability-pool-slider::-moz-range-track {
            height: 14px;
            background: transparent;
            border-radius: 999px;
        }

        .hp-slider::-moz-range-thumb,
        .ability-pool-slider::-moz-range-thumb {
            width: 0;
            height: 0;
            border: 0;
            background: transparent;
        }

        .hp-controls {
            justify-content: center;
        }

        .live-pool-control {
            display: flex;
            flex-direction: column;
            gap: 9px;
        }

        .live-pool-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .live-pool-header span {
            color: var(--text-muted);
        }

        .live-pool-header strong {
            font-size: 18px;
        }

        .short-rest-overlay {
            position: fixed;
            inset: 0;
            z-index: 1100;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: rgba(0, 0, 0, 0.72);
        }

        .short-rest-modal {
            position: relative;
            width: 100%;
            max-width: 390px;
            padding: 24px;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        .short-rest-modal h2 {
            margin-bottom: 5px;
        }

        .short-rest-modal > p {
            color: var(--text-muted);
            font-size: 13px;
            margin-bottom: 20px;
        }

        .short-rest-field {
            display: flex;
            flex-direction: column;
            gap: 7px;
            margin-bottom: 14px;
            color: var(--text-muted);
            font-size: 12px;
        }

        .short-rest-field input {
            width: 100%;
            padding: 11px 12px;
            background: var(--surface-light);
            color: var(--text);
            border: 1px solid var(--border);
            border-radius: 9px;
            font-family: inherit;
            font-size: 14px;
            outline: none;
        }

        .short-rest-field input:focus {
            border-color: var(--accent);
        }

        .short-rest-field small {
            color: var(--text-muted);
            font-size: 11px;
        }

        .short-rest-submit {
            width: 100%;
            margin-top: 4px;
            padding: 12px;
            background: var(--surface-light);
            color: var(--accent-light);
            border: 1px solid var(--border);
            border-radius: 10px;
            font-family: inherit;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
        }

        .short-rest-submit:hover {
            border-color: var(--accent);
        }
    `;
    document.head.appendChild(style);
})();
