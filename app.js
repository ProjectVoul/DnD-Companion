// ========================================
// D&D COMPANION
// Main Application Logic
// ========================================


// ---------- Spell Data ----------

const spells = [
    {
        name: "Bless",
        level: 1,
        school: "Enchantment",
        castingTime: "1 Action",
        range: "30 ft",
        duration: "Concentration, up to 1 minute",
        components: "V, S, M",
        prepared: true,
        description:
            "You bless up to three creatures of your choice within range. Whenever a target makes an attack roll or a saving throw before the spell ends, the target can roll a d4 and add the number rolled to the attack roll or saving throw."
    },

    {
        name: "Command",
        level: 1,
        school: "Enchantment",
        castingTime: "1 Action",
        range: "60 ft",
        duration: "1 round",
        components: "V",
        prepared: true,
        description:
            "You speak a one-word command to a creature you can see within range. The target must succeed on a Wisdom saving throw or follow the command on its next turn."
    },

    {
        name: "Shield of Faith",
        level: 1,
        school: "Abjuration",
        castingTime: "1 Bonus Action",
        range: "60 ft",
        duration: "Concentration, up to 10 minutes",
        components: "V, S, M",
        prepared: true,
        description:
            "A shimmering field appears and surrounds a creature of your choice within range, granting it a +2 bonus to AC for the duration."
    },

    {
        name: "Aid",
        level: 2,
        school: "Abjuration",
        castingTime: "1 Action",
        range: "30 ft",
        duration: "8 hours",
        components: "V, S, M",
        prepared: true,
        description:
            "Your spell bolsters your allies with toughness and resolve. Choose up to three creatures within range. Each target's hit point maximum and current hit points increase by 5 for the duration."
    },

    {
        name: "Lesser Restoration",
        level: 2,
        school: "Abjuration",
        castingTime: "1 Action",
        range: "Touch",
        duration: "Instantaneous",
        components: "V, S",
        prepared: true,
        description:
            "You touch a creature and can end either one disease or one condition afflicting it. The condition can be blinded, deafened, paralyzed, or poisoned."
    }
];


// ---------- Load Saved Prepared Spells ----------

const savedPreparedSpells =
    JSON.parse(localStorage.getItem("preparedSpells"));

if (savedPreparedSpells) {

    spells.forEach(spell => {
        spell.prepared =
            savedPreparedSpells.includes(spell.name);
    });

}


// ---------- Spell Slots ----------

const savedSpellSlots =
    JSON.parse(localStorage.getItem("spellSlots"));

const spellSlots = savedSpellSlots || {
    1: { current: 4, maximum: 4 },
    2: { current: 3, maximum: 3 },
    3: { current: 2, maximum: 2 },
    4: { current: 1, maximum: 1 },
    5: { current: 0, maximum: 0 }
};


// ---------- Save Spell Slots ----------

function saveSpellSlots() {

    localStorage.setItem(
        "spellSlots",
        JSON.stringify(spellSlots)
    );

}


// ---------- Save Prepared Spells ----------

function savePreparedSpells() {

    const prepared = spells
        .filter(spell => spell.prepared)
        .map(spell => spell.name);

    localStorage.setItem(
        "preparedSpells",
        JSON.stringify(prepared)
    );

}


// ---------- Open Section ----------

function openSection(section) {

    if (section === "spells") {
        showSpells("prepared");
        return;
    }

    if (section === "rest") {
        openRestMenu();
        return;
    }

    alert("This section is coming soon.");

}


// ========================================
// SPELLS
// ========================================


// ---------- Spells Page ----------

function showSpells(tab = "prepared") {

    const app = document.getElementById("app");

    app.innerHTML = `

        <header class="app-header">

            <button
                class="back-button"
                onclick="goHome()"
            >
                ← Back
            </button>

            <h1>Spells</h1>

            <p>
                Your spellbook and prepared spells
            </p>

        </header>


        <main>

            <section class="spell-tabs">

                <button
                    class="spell-tab ${tab === "prepared" ? "active" : ""}"
                    onclick="showSpells('prepared')"
                >
                    ⭐ Prepared
                </button>

                <button
                    class="spell-tab ${tab === "spellbook" ? "active" : ""}"
                    onclick="showSpells('spellbook')"
                >
                    📚 Spellbook
                </button>

            </section>


            ${renderSpellSlotsSection(tab)}


            ${tab === "prepared"
                ? renderPreparedSection()
                : renderSpellbookSection()
            }

        </main>
    `;

}


// ---------- Spell Slots Section ----------

function renderSpellSlotsSection(tab) {

    if (tab !== "prepared") {
        return "";
    }

    return `

        <section class="spell-slots">

            <h2>Spell Slots</h2>

            ${renderSpellSlots()}

        </section>
    `;

}


// ---------- Render Spell Slots ----------

function renderSpellSlots() {

    let html = "";

    for (let level = 1; level <= 5; level++) {

        const slot = spellSlots[level];

        if (slot.maximum === 0) {
            continue;
        }

        html += `

            <div class="slot-row">

                <span class="slot-level">
                    ${level}${getOrdinal(level)}
                </span>

                <div class="slot-dots">

                    ${renderSlotDots(level, slot)}

                </div>

                <span class="slot-count">
                    ${slot.current} / ${slot.maximum}
                </span>

            </div>
        `;
    }

    return html;

}


// ---------- Render Clickable Slot Dots ----------

function renderSlotDots(level, slot) {

    let html = "";

    for (let i = 0; i < slot.maximum; i++) {

        const filled = i < slot.current;

        html += `

            <button
                class="slot-dot-button ${filled ? "filled" : "empty"}"
                onclick="toggleSpellSlot(${level}, ${i})"
                aria-label="${filled ? "Use" : "Restore"} spell slot"
            ></button>

        `;
    }

    return html;

}


// ---------- Toggle Spell Slot ----------

function toggleSpellSlot(level, index) {

    const slot = spellSlots[level];

    if (index < slot.current) {

        slot.current--;

    } else {

        if (slot.current < slot.maximum) {
            slot.current++;
        }

    }

    saveSpellSlots();

    showSpells("prepared");

}


// ---------- Prepared Spells ----------

function renderPreparedSection() {

    const preparedSpells =
        spells.filter(spell => spell.prepared);

    let html = "";

    for (let level = 1; level <= 5; level++) {

        const levelSpells =
            preparedSpells.filter(
                spell => spell.level === level
            );

        if (levelSpells.length === 0) {
            continue;
        }

        html += `

            <section class="prepared-level">

                <h2>
                    ${level}${getOrdinal(level)} Level
                </h2>

                <div class="spell-list">

                    ${levelSpells
                        .map(renderPreparedSpellCard)
                        .join("")}

                </div>

            </section>
        `;
    }

    if (html === "") {

        html = `
            <p class="empty-message">
                No spells prepared.
            </p>
        `;

    }

    return `

        <section class="prepared-section">

            <h2>Prepared Spells</h2>

            ${html}

        </section>
    `;

}


// ---------- Prepared Spell Card ----------

function renderPreparedSpellCard(spell) {

    return `

        <button
            class="spell-card"
            onclick="showSpellDetails('${spell.name}')"
        >

            <div class="spell-icon">
                ✨
            </div>

            <div class="spell-info">

                <h3>
                    ${spell.name}
                </h3>

                <p>
                    ${spell.duration}
                </p>

            </div>

            <span class="spell-arrow">
                ›
            </span>

        </button>
    `;

}


// ---------- Spellbook ----------

function renderSpellbookSection() {

    let html = "";

    for (let level = 1; level <= 5; level++) {

        const levelSpells =
            spells.filter(spell => spell.level === level);

        if (levelSpells.length === 0) {
            continue;
        }

        html += `

            <section class="spellbook-level">

                <h2>
                    ${level}${getOrdinal(level)} Level
                </h2>

                <div class="spell-list">

                    ${levelSpells
                        .map(renderSpellbookCard)
                        .join("")}

                </div>

            </section>
        `;
    }

    return html;

}


// ---------- Spellbook Card ----------

function renderSpellbookCard(spell) {

    const preparedClass =
        spell.prepared ? "prepared" : "";

    const buttonText =
        spell.prepared
            ? "✓ Unprepare"
            : "Prepare";

    return `

        <div class="spellbook-card ${preparedClass}">

            <button
                class="spell-card-main"
                onclick="showSpellDetails('${spell.name}')"
            >

                <div class="spell-icon">
                    ✨
                </div>

                <div class="spell-info">

                    <h3>
                        ${spell.name}
                    </h3>

                    <p>
                        ${spell.duration}
                    </p>

                </div>

            </button>


            <button
                class="prepare-button"
                onclick="togglePrepared('${spell.name}')"
            >
                ${buttonText}
            </button>

        </div>
    `;

}


// ---------- Prepare / Unprepare ----------

function togglePrepared(spellName) {

    const spell = spells.find(
        spell => spell.name === spellName
    );

    if (!spell) {
        return;
    }

    spell.prepared = !spell.prepared;

    savePreparedSpells();

    showSpells("spellbook");

}


// ---------- Spell Details ----------

function showSpellDetails(spellName) {

    const spell = spells.find(
        spell => spell.name === spellName
    );

    if (!spell) {
        return;
    }

    const app = document.getElementById("app");

    app.innerHTML = `

        <header class="app-header">

            <button
                class="back-button"
                onclick="showSpells('prepared')"
            >
                ← Spells
            </button>

            <h1>
                ${spell.name}
            </h1>

            <p>
                ${spell.level}${getOrdinal(spell.level)}
                level · ${spell.school}
            </p>

        </header>


        <main>

            <section class="spell-details">

                <div class="spell-detail-grid">

                    <div>
                        <span>CASTING TIME</span>
                        <strong>
                            ${spell.castingTime}
                        </strong>
                    </div>

                    <div>
                        <span>RANGE</span>
                        <strong>
                            ${spell.range}
                        </strong>
                    </div>

                    <div>
                        <span>DURATION</span>
                        <strong>
                            ${spell.duration}
                        </strong>
                    </div>

                    <div>
                        <span>COMPONENTS</span>
                        <strong>
                            ${spell.components}
                        </strong>
                    </div>

                </div>


                <div class="spell-description">

                    <h2>Description</h2>

                    <p>
                        ${spell.description}
                    </p>

                </div>

            </section>

        </main>
    `;

}


// ---------- Return Home ----------

function goHome() {

    window.location.reload();

}


// ---------- Ordinal Numbers ----------

function getOrdinal(number) {

    if (number === 1) return "st";
    if (number === 2) return "nd";
    if (number === 3) return "rd";

    return "th";

}


// ========================================
// CHARACTER RESOURCES
// ========================================


// ---------- Concentration ----------

let concentrating = false;


function toggleConcentration() {

    concentrating = !concentrating;

    const button =
        document.getElementById(
            "concentration-toggle"
        );

    if (!button) {
        return;
    }

    if (concentrating) {

        button.textContent = "ON";

        button.classList.add(
            "active"
        );

    } else {

        button.textContent = "OFF";

        button.classList.remove(
            "active"
        );

    }

}


// ---------- Status ----------

let conditions = [];


function toggleStatusMenu() {

    const menu =
        document.getElementById(
            "status-menu"
        );

    if (!menu) {
        return;
    }

    menu.classList.toggle(
        "hidden"
    );

}


function toggleCondition(checkbox) {

    if (checkbox.checked) {

        if (!conditions.includes(checkbox.value)) {

            conditions.push(
                checkbox.value
            );

        }

    } else {

        conditions =
            conditions.filter(
                condition =>
                    condition !== checkbox.value
            );

    }

    updateStatusDisplay();

}


function updateStatusDisplay() {

    const button =
        document.getElementById(
            "status-selector"
        );

    const container =
        document.getElementById(
            "active-conditions"
        );

    if (!button || !container) {
        return;
    }

    container.innerHTML = "";


    if (conditions.length === 0) {

        button.textContent =
            "Normal ▾";

        container.classList.add(
            "hidden"
        );

        return;

    }


    button.textContent =
        "Edit ▾";

    container.classList.remove(
        "hidden"
    );


    conditions.forEach(condition => {

        const badge =
            document.createElement("span");

        badge.className =
            "condition-badge";

        badge.textContent =
            condition;

        container.appendChild(badge);

    });

}


// ========================================
// HP
// ========================================


let currentHP = 100;
const maximumHP = 100;


// ---------- Build HP Slider ----------

function setupHPSlider() {

    const controls =
        document.querySelector(
            ".hp-controls"
        );

    if (!controls) {
        return;
    }


    controls.innerHTML = `

        <div class="hp-slider-container">

            <div class="hp-slider-value">

                <span id="current-hp">
                    ${currentHP}
                </span>

                <span class="hp-divider">
                    /
                </span>

                <span id="maximum-hp">
                    ${maximumHP}
                </span>

            </div>


            <input
                id="hp-slider"
                class="hp-slider"
                type="range"
                min="0"
                max="${maximumHP}"
                value="${currentHP}"
                step="1"
                oninput="setHPFromSlider(this.value)"
                aria-label="Hit Points"
            >

        </div>

    `;

}


function setHPFromSlider(value) {

    currentHP =
        Math.max(
            0,
            Math.min(
                maximumHP,
                Number(value)
            )
        );

    updateHP();

}


function changeHP(amount) {

    currentHP += amount;

    if (currentHP < 0) {
        currentHP = 0;
    }

    if (currentHP > maximumHP) {
        currentHP = maximumHP;
    }

    updateHP();

}


function updateHP() {

    const hp =
        document.getElementById(
            "current-hp"
        );

    if (hp) {
        hp.textContent = currentHP;
    }


    const slider =
        document.getElementById(
            "hp-slider"
        );

    if (slider) {
        slider.value = currentHP;
    }

}


// ========================================
// HIT DICE
// ========================================


let currentHitDice = 5;
const maximumHitDice = 5;


function changeHitDice(amount) {

    currentHitDice += amount;

    if (currentHitDice < 0) {
        currentHitDice = 0;
    }

    if (currentHitDice > maximumHitDice) {
        currentHitDice = maximumHitDice;
    }

    updateHitDice();

}


function updateHitDice() {

    const element =
        document.getElementById(
            "hit-dice-value"
        );

    if (element) {

        element.textContent =
            `${currentHitDice} / ${maximumHitDice}`;

    }

}


// ========================================
// DEATH SAVES
// ========================================


let deathSaves = {

    successes: 0,

    failures: 0

};


function toggleDeathSave(type, index) {

    if (type === "success") {

        deathSaves.successes =
            deathSaves.successes === index + 1
                ? index
                : index + 1;

    }


    if (type === "failure") {

        deathSaves.failures =
            deathSaves.failures === index + 1
                ? index
                : index + 1;

    }

    updateDeathSaves();

}


function updateDeathSaves() {

    const successDots =
        document.querySelectorAll(
            ".save-dot:not(.failure)"
        );

    const failureDots =
        document.querySelectorAll(
            ".save-dot.failure"
        );


    successDots.forEach((dot, index) => {

        dot.classList.toggle(
            "active",
            index < deathSaves.successes
        );

    });


    failureDots.forEach((dot, index) => {

        dot.classList.toggle(
            "active",
            index < deathSaves.failures
        );

    });

}


function resetDeathSaves() {

    deathSaves.successes = 0;
    deathSaves.failures = 0;

    updateDeathSaves();

}


// ========================================
// REST
// ========================================


// ---------- Open Rest Menu ----------

function openRestMenu() {

    const existing =
        document.querySelector(
            ".rest-overlay"
        );

    if (existing) {
        return;
    }


    const menu =
        document.createElement("div");

    menu.className =
        "rest-overlay";

    menu.innerHTML = `

        <div class="rest-modal">

            <button
                class="rest-close"
                onclick="closeRestMenu()"
            >
                ×
            </button>

            <h2>
                Rest
            </h2>

            <p>
                Choose your type of rest.
            </p>

            <button
                class="rest-option"
                onclick="longRest()"
            >

                <span>
                    🌙
                </span>

                <div>

                    <strong>
                        Long Rest
                    </strong>

                    <small>
                        Restore your major resources
                    </small>

                </div>

            </button>


            <button
                class="rest-option"
                onclick="openShortRestDiceSelection()"
            >

                <span>
                    ☕
                </span>

                <div>

                    <strong>
                        Short Rest
                    </strong>

                    <small>
                        Spend Hit Dice to recover HP
                    </small>

                </div>

            </button>

        </div>

    `;

    document.body.appendChild(menu);

}


// ---------- Close Rest Menu ----------

function closeRestMenu() {

    const menu =
        document.querySelector(
            ".rest-overlay"
        );

    if (menu) {
        menu.remove();
    }

}


// ========================================
// LONG REST
// ========================================


function longRest() {

    currentHP = maximumHP;

    resetDeathSaves();

    concentrating = false;

    currentHitDice =
        Math.min(
            maximumHitDice,
            currentHitDice +
            Math.ceil(maximumHitDice / 2)
        );


    for (let level = 1; level <= 5; level++) {

        spellSlots[level].current =
            spellSlots[level].maximum;

    }


    saveSpellSlots();

    closeRestMenu();

    updateHP();
    updateHitDice();


    const concentrationButton =
        document.getElementById(
            "concentration-toggle"
        );

    if (concentrationButton) {

        concentrationButton.textContent =
            "OFF";

        concentrationButton.classList.remove(
            "active"
        );

    }

}


// ========================================
// SHORT REST
// ========================================


// ---------- Step 1: Choose Hit Dice ----------

function openShortRestDiceSelection() {

    const modal =
        document.querySelector(
            ".rest-modal"
        );

    if (!modal) {
        return;
    }


    let diceButtons = "";

    for (
        let dice = 1;
        dice <= currentHitDice;
        dice++
    ) {

        diceButtons += `

            <button
                class="rest-option rest-dice-option"
                onclick="selectShortRestDice(${dice})"
            >

                <span>
                    🎲
                </span>

                <div>

                    <strong>
                        ${dice} Hit ${dice === 1 ? "Die" : "Dice"}
                    </strong>

                    <small>
                        Spend ${dice} ${dice === 1 ? "die" : "dice"}
                    </small>

                </div>

            </button>

        `;

    }


    if (currentHitDice === 0) {

        modal.innerHTML = `

            <button
                class="rest-close"
                onclick="closeRestMenu()"
            >
                ×
            </button>

            <h2>
                Short Rest
            </h2>

            <p>
                You have no Hit Dice available.
            </p>

            <button
                class="rest-option"
                onclick="closeRestMenu()"
            >

                <span>
                    ←
                </span>

                <div>
                    <strong>
                        Back
                    </strong>
                </div>

            </button>

        `;

        return;

    }


    modal.innerHTML = `

        <button
            class="rest-close"
            onclick="closeRestMenu()"
        >
            ×
        </button>

        <h2>
            Short Rest
        </h2>

        <p>
            You have <strong>${currentHitDice}</strong>
            Hit Dice available.
            How many do you want to spend?
        </p>

        <div class="rest-dice-grid">

            ${diceButtons}

        </div>

        <button
            class="rest-back-button"
            onclick="openRestMenuFromShortRest()"
        >
            ← Back
        </button>

    `;

}


// ---------- Return to Rest Selection ----------

function openRestMenuFromShortRest() {

    closeRestMenu();

    openRestMenu();

}


// ---------- Step 2: Confirm Dice Spent ----------

function selectShortRestDice(diceSpent) {

    const modal =
        document.querySelector(
            ".rest-modal"
        );

    if (!modal) {
        return;
    }


    modal.innerHTML = `

        <button
            class="rest-close"
            onclick="closeRestMenu()"
        >
            ×
        </button>

        <h2>
            Short Rest
        </h2>

        <p>
            You are spending
            <strong>
                ${diceSpent}
            </strong>
            ${diceSpent === 1 ? "Hit Die" : "Hit Dice"}.
        </p>

        <div class="rest-roll-message">

            <span>
                🎲
            </span>

            <strong>
                Roll your Hit Dice
            </strong>

            <small>
                Roll ${diceSpent} physical
                ${diceSpent === 1 ? "die" : "dice"},
                then enter the total HP recovered.
            </small>

        </div>


        <label
            class="rest-input-label"
            for="short-rest-hp"
        >
            HP recovered
        </label>


        <input
            id="short-rest-hp"
            class="rest-input"
            type="number"
            min="0"
            inputmode="numeric"
            placeholder="0"
        >


        <button
            class="rest-confirm-button"
            onclick="confirmShortRest(${diceSpent})"
        >
            Recover HP
        </button>


        <button
            class="rest-back-button"
            onclick="openShortRestDiceSelection()"
        >
            ← Change Hit Dice
        </button>

    `;


    const input =
        document.getElementById(
            "short-rest-hp"
        );

    if (input) {
        input.focus();
    }

}


// ---------- Step 3: Apply Short Rest ----------

function confirmShortRest(diceSpent) {

    const input =
        document.getElementById(
            "short-rest-hp"
        );

    if (!input) {
        return;
    }


    const hpRecovered =
        Number(input.value);


    if (
        !Number.isFinite(hpRecovered) ||
        hpRecovered < 0
    ) {

        input.focus();

        return;

    }


    currentHitDice -= diceSpent;


    currentHP =
        Math.min(
            maximumHP,
            currentHP + hpRecovered
        );


    updateHP();
    updateHitDice();

    closeRestMenu();

}


// ========================================
// HOME INITIALIZATION
// ========================================


function initializeHome() {

    setupHPSlider();

    updateHP();

    updateHitDice();

    updateDeathSaves();

    updateStatusDisplay();

}


// ---------- Home Menu ----------

const menuButtons =
    document.querySelectorAll(".menu-button");


menuButtons.forEach(button => {

    button.addEventListener("click", () => {

        const text =
            button.innerText.toLowerCase();


        if (text.includes("spells")) {

            openSection("spells");

        }

        else if (text.includes("rest")) {

            openSection("rest");

        }

        else {

            alert(
                "This section is coming soon."
            );

        }

    });

});


// ---------- Initialize ----------

initializeHome();