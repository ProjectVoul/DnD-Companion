/* P1 interaction layer: live HP/pool controls + short rest UI */
(function () {
    "use strict";

    // ---------- Dragon Breath ----------
    const dragonBreath = abilities.find(a => a.id === "dragons-breath");
    if (dragonBreath) {
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

    // ---------- Shared slider painting ----------
    function paintRange(range, value, maximum) {
        if (!range) return;

        const percentage = maximum > 0
            ? Math.max(0, Math.min(100, (value / maximum) * 100))
            : 0;

        range.style.background =
            `linear-gradient(to right, var(--accent) ${percentage}%, var(--surface-light) ${percentage}%)`;
    }

    // ---------- HP: one real slider, no duplicate bars ----------
    function installHPControl() {
        const section = document.querySelector(".status-hp");
        if (!section) return;

        // p1-recovery.js used to create a visual fill bar. Remove every
        // previous/generated HP bar before installing the actual control.
        section.querySelectorAll(".hp-bar").forEach(el => el.remove());
        section.querySelectorAll(".hp-slider").forEach(el => el.remove());

        // The +/- buttons are no longer part of the HP UI.
        section.querySelectorAll(".hp-button").forEach(button => button.remove());

        const controls = section.querySelector(".hp-controls");
        if (!controls) return;

        const bar = document.createElement("div");
        bar.className = "hp-bar";

        const range = document.createElement("input");
        range.id = "hp-slider";
        range.className = "hp-slider";
        range.type = "range";
        range.min = "0";
        range.max = String(maximumHP);
        range.step = "1";
        range.value = String(currentHP);
        range.setAttribute("aria-label", "Current hit points");

        bar.appendChild(range);
        section.insertBefore(bar, controls);

        if (!range.dataset.bound) {
            range.dataset.bound = "true";
            range.addEventListener("input", function () {
                currentHP = Number(this.value);

                const current = document.getElementById("current-hp");
                if (current) current.textContent = currentHP;

                paintRange(this, currentHP, maximumHP);
                localStorage.setItem("currentHP", String(currentHP));
            });
        }

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

        // Remove any old/original range control that was rendered elsewhere
        // in the ability detail page. The usage block below owns the one
        // interactive slider now.
        document.querySelectorAll(".ability-details input[type='range'], .ability-details .ability-pool-slider").forEach(el => {
            if (!usage.contains(el)) el.remove();
        });

        usage.innerHTML = `
            <div class="live-pool-control">
                <div class="live-pool-header">
                    <span>Pool</span>
                    <strong id="ability-pool-live-value">
                        ${ability.currentPool} / ${ability.maximumPool}
                    </strong>
                </div>

                <div class="pool-slider-wrap">
                    <input
                        id="ability-pool-slider"
                        class="ability-pool-slider"
                        type="range"
                        min="0"
                        max="${ability.maximumPool}"
                        step="1"
                        value="${ability.currentPool}"
                        aria-label="${ability.name} pool"
                    >
                </div>
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

        if (range) {
            range.value = String(ability.currentPool);
            paintRange(range, ability.currentPool, ability.maximumPool);
        }

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
            position: relative;
            width: 100%;
            height: 28px;
            margin: 8px 0 16px;
            padding: 0;
            border: 1px solid var(--border);
            border-radius: 999px;
            overflow: visible;
            background: transparent;
        }

        .hp-slider,
        .ability-pool-slider {
            display: block;
            width: 100%;
            height: 28px;
            margin: 0;
            padding: 0;
            appearance: none;
            -webkit-appearance: none;
            border: 0;
            border-radius: 999px;
            background: var(--surface-light);
            cursor: pointer;
            touch-action: pan-x;
        }

        .hp-slider:focus,
        .ability-pool-slider:focus {
            outline: none;
        }

        .hp-slider::-webkit-slider-runnable-track,
        .ability-pool-slider::-webkit-slider-runnable-track {
            height: 14px;
            margin-top: 7px;
            background: transparent;
            border-radius: 999px;
        }

        .hp-slider::-webkit-slider-thumb,
        .ability-pool-slider::-webkit-slider-thumb {
            width: 22px;
            height: 22px;
            margin-top: -4px;
            appearance: none;
            -webkit-appearance: none;
            border: 2px solid var(--accent-light);
            border-radius: 50%;
            background: var(--surface);
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
            cursor: grab;
        }

        .hp-slider::-webkit-slider-thumb:active,
        .ability-pool-slider::-webkit-slider-thumb:active {
            cursor: grabbing;
        }

        .hp-slider::-moz-range-track,
        .ability-pool-slider::-moz-range-track {
            height: 14px;
            background: transparent;
            border: 0;
            border-radius: 999px;
        }

        .hp-slider::-moz-range-progress,
        .ability-pool-slider::-moz-range-progress {
            height: 14px;
            background: var(--accent);
            border-radius: 999px;
        }

        .hp-slider::-moz-range-thumb,
        .ability-pool-slider::-moz-range-thumb {
            width: 22px;
            height: 22px;
            border: 2px solid var(--accent-light);
            border-radius: 50%;
            background: var(--surface);
            cursor: grab;
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

        .pool-slider-wrap {
            width: 100%;
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
