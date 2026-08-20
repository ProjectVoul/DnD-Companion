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

    if (section === "abilities") {
        showAbilities("racial");
        return;
    }

    if (section === "inventory") {
        showInventory();
        return;
    }

    alert("This section is coming soon.");

}


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

        slot.current++;

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


// ---------- HP ----------

let currentHP = 100;
const maximumHP = 100;


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

}


// ---------- Hit Dice ----------

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


// ---------- Death Saves ----------

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


// ---------- Rest ----------

function openRestMenu() {

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
                onclick="shortRest()"
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


function closeRestMenu() {

    const menu =
        document.querySelector(
            ".rest-overlay"
        );

    if (menu) {
        menu.remove();
    }

}


// ---------- Long Rest ----------

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

}


// ---------- Short Rest ----------

function shortRest() {

    closeRestMenu();

    const diceSpent =
        prompt(
            `Hit Dice available: ${currentHitDice}\n\nHow many Hit Dice did you spend?`
        );

    if (diceSpent === null) {
        return;
    }

    const spent =
        parseInt(diceSpent);

    if (
        isNaN(spent) ||
        spent < 0 ||
        spent > currentHitDice
    ) {

        alert("Invalid number of Hit Dice.");

        return;

    }


    const hpRecovered =
        prompt(
            "How many HP did you recover from your physical dice rolls?"
        );

    if (hpRecovered === null) {
        return;
    }

    const recovered =
        parseInt(hpRecovered);

    if (
        isNaN(recovered) ||
        recovered < 0
    ) {

        alert("Invalid HP amount.");

        return;

    }


    currentHitDice -= spent;

    currentHP =
        Math.min(
            maximumHP,
            currentHP + recovered
        );

    updateHP();
    updateHitDice();

}

// ========================================
// ABILITIES
// ========================================


// ---------- Ability Data ----------

const abilities = [

    {
        id: "dragons-breath",
        name: "Dragon's Breath",
        category: "racial",
        icon: "🐉",
        actionType: "Action",
        usageType: "uses",
        currentUses: 1,
        maximumUses: 1,
        linkedItems: [
            "dragon-licorice"
        ],
        description:
            "You exhale destructive energy. The saving throw DC equals 8 + your Constitution modifier + your proficiency bonus. A creature that fails the saving throw takes 4d6 damage. You regain this ability after a long rest."
    },


    {
        id: "lay-on-hands",
        name: "Lay on Hands",
        category: "class",
        icon: "✋",
        actionType: "Action",
        usageType: "pool",
        currentPool: 65,
        maximumPool: 65,
        description:
            "Your blessed touch can heal wounds. You have a pool of healing power that replenishes when you take a long rest. You can restore a total number of hit points equal to five times your paladin level. You can spend 5 points from the pool to cure a disease or neutralize a poison."
    },


    {
        id: "shield-master",
        name: "Shield Master",
        category: "feat",
        icon: "🛡️",
        actionType: "Bonus Action / Reaction",
        usageType: "passive",
        description:
            "Add your shield's AC bonus to Dexterity saving throws and take no damage when a successful Dexterity saving throw would normally deal half damage. You can use a bonus action after attacking to shove a creature up to 5 feet away."
    },


    {
        id: "dragons-judgment",
        name: "Dragon's Judgment",
        category: "additional",
        icon: "⚔️",
        actionType: "On Hit",
        usageType: "uses",
        currentUses: 3,
        maximumUses: 3,
        linkedItems: [
            "golden-choice-sword"
        ],
        description:
            "When you hit a creature with this weapon, you can force the target to make a Wisdom saving throw. On a failure, choose one effect: the target falls prone and can stand only at the end of its turn without additional movement, or the target becomes mute and unable to speak or cast spells with verbal components until the end of its next turn. Three uses per long rest."
    },


    {
        id: "dragon-licorice",
        name: "Dragon Licorice",
        category: "additional",
        icon: "🍬",
        actionType: "Passive",
        usageType: "passive",
        linkedItems: [],
        description:
            "You have one additional use of Dragon's Breath per long rest."
    }

];

// ---------- Dragon's Breath / Dragon Licorice ----------

function updateDragonBreathUses() {

    const dragonBreath =
        abilities.find(
            ability =>
                ability.id === "dragons-breath"
        );

    const dragonLicorice =
        inventoryItems.find(
            item =>
                item.id === "dragon-licorice" &&
                item.quantity > 0
        );

    if (!dragonBreath) {
        return;
    }

    const baseUses = 1;

    const bonusUses =
        dragonLicorice ? 1 : 0;

    dragonBreath.maximumUses =
        baseUses + bonusUses;

    if (
        dragonBreath.currentUses >
        dragonBreath.maximumUses
    ) {
        dragonBreath.currentUses =
            dragonBreath.maximumUses;
    }
}

// ---------- Saved Ability State ----------

const savedAbilities =
    JSON.parse(
        localStorage.getItem(
            "abilityState"
        )
    );


if (savedAbilities) {

    abilities.forEach(
        ability => {

            const saved =
                savedAbilities[
                    ability.id
                ];

            if (!saved) {
                return;
            }


            if (
                ability.usageType ===
                "uses"
            ) {

                ability.currentUses =
                    saved.currentUses;

            }


            if (
                ability.usageType ===
                "pool"
            ) {

                ability.currentPool =
                    saved.currentPool;

            }

        }
    );

}


// ---------- Save Ability State ----------

function saveAbilityState() {

    const state = {};

    abilities.forEach(
        ability => {

            if (
                ability.usageType ===
                "uses"
            ) {

                state[ability.id] = {

                    currentUses:
                        ability.currentUses

                };

            }


            if (
                ability.usageType ===
                "pool"
            ) {

                state[ability.id] = {

                    currentPool:
                        ability.currentPool

                };

            }

        }
    );


    localStorage.setItem(
        "abilityState",
        JSON.stringify(state)
    );

}


// ---------- Ability Categories ----------

const abilityCategories = [

    {
        id: "racial",
        name: "Racial Abilities",
        icon: "🧬"
    },

    {
        id: "class",
        name: "Class Abilities",
        icon: "⚔️"
    },

    {
        id: "feat",
        name: "Feats",
        icon: "⭐"
    },

    {
        id: "additional",
        name: "Additional",
        icon: "✨"
    }

];


// ---------- Show Abilities ----------

function showAbilities(
    category = "racial"
) {

    const app =
        document.getElementById(
            "app"
        );


    app.innerHTML = `

        <header class="app-header">

            <button
                class="back-button"
                onclick="goHome()"
            >
                ← Back
            </button>


            <h1>
                Abilities
            </h1>


            <p>
                Your racial, class and additional abilities
            </p>

        </header>


        <main>

            <section class="ability-tabs">

                ${abilityCategories
                    .map(
                        cat => `

                            <button
                                class="
                                    ability-tab
                                    ${
                                        category ===
                                        cat.id
                                            ? "active"
                                            : ""
                                    }
                                "
                                onclick="
                                    showAbilities('${cat.id}')
                                "
                            >

                                ${cat.icon}

                                ${cat.name}

                            </button>

                        `
                    )
                    .join("")}

            </section>


            ${renderAbilityCategory(
                category
            )}

        </main>

    `;

}


// ---------- Render Ability Category ----------

function renderAbilityCategory(
    category
) {

    const categoryData =
        abilityCategories.find(
            cat =>
                cat.id === category
        );


    if (!categoryData) {
        return "";
    }


    const categoryAbilities =
        abilities.filter(
            ability =>
                ability.category ===
                category
        );


    if (
        categoryAbilities.length === 0
    ) {

        return `

            <p class="empty-message">
                No abilities in this category.
            </p>

        `;

    }


    return `

        <section class="ability-section">

            <h2>
                ${categoryData.icon}
                ${categoryData.name}
            </h2>


            <div class="ability-list">

                ${categoryAbilities
                    .map(
                        renderAbilityCard
                    )
                    .join("")}

            </div>

        </section>

    `;

}


// ---------- Render Ability Card ----------

function renderAbilityCard(
    ability
) {

    const usageHTML =
        renderAbilityUsage(
            ability
        );


    return `

        <div
            class="ability-card"
            onclick="
                showAbilityDetails(
                    '${ability.id}'
                )
            "
        >

            <div class="ability-icon">

                ${ability.icon}

            </div>


            <div class="ability-info">

                <div
                    class="ability-card-title"
                >

                    <h3>
                        ${ability.name}
                    </h3>


                    <span
                        class="ability-action-type"
                    >
                        ${ability.actionType}
                    </span>

                </div>


                <div
                    class="ability-meta"
                >

                    ${usageHTML}

                </div>

            </div>


            <span
                class="ability-arrow"
            >
                ›
            </span>

        </div>

    `;

}


// ---------- Render Ability Usage ----------

function renderAbilityUsage(
    ability
) {

    if (
        ability.usageType ===
        "uses"
    ) {

        let dots = "";


        for (
            let i = 0;
            i < ability.maximumUses;
            i++
        ) {

            dots += `

                <span
                    class="
                        ability-use-dot
                        ${
                            i <
                            ability.currentUses
                                ? "filled"
                                : "empty"
                        }
                    "
                ></span>

            `;

        }


        return `

            <div
                class="ability-uses"
            >

                <span>
                    Uses
                </span>

                <div
                    class="ability-use-dots"
                >
                    ${dots}
                </div>

                <span>
                    ${ability.currentUses}
                    /
                    ${ability.maximumUses}
                </span>

            </div>

        `;

    }


    if (
        ability.usageType ===
        "pool"
    ) {

        const percentage =
            (
                ability.currentPool /
                ability.maximumPool
            ) * 100;


        return `

            <div
                class="ability-pool"
            >

                <div
                    class="ability-pool-header"
                >

                    <span>
                        Pool
                    </span>

                    <strong>
                        ${ability.currentPool}
                        /
                        ${ability.maximumPool}
                    </strong>

                </div>


                <div
                    class="ability-pool-bar"
                >

                    <div
                        class="ability-pool-fill"
                        style="
                            width: ${percentage}%;
                        "
                    ></div>

                </div>

            </div>

        `;

    }


    return `

        <span
            class="ability-passive"
        >
            Passive
        </span>

    `;

}


// ---------- Ability Details ----------

function showAbilityDetails(
    abilityId
) {

    const ability =
        abilities.find(
            ability =>
                ability.id ===
                abilityId
        );


    if (!ability) {
        return;
    }


    const app =
        document.getElementById(
            "app"
        );


    app.innerHTML = `

        <header class="app-header">

            <button
                class="back-button"
                onclick="
                    showAbilities(
                        '${ability.category}'
                    )
                "
            >
                ← Abilities
            </button>


            <h1>
                ${ability.icon}
                ${ability.name}
            </h1>


            <p>
                ${ability.actionType}
            </p>

        </header>


        <main>

            <section
                class="ability-details"
            >


                <div
                    class="ability-detail-usage"
                >

                    ${renderAbilityUsage(
                        ability
                    )}

                </div>


                <div
                    class="ability-description"
                >

                    <h2>
                        Description
                    </h2>


                    <p>
                        ${ability.description}
                    </p>

                </div>


                ${
                    ability.linkedItems &&
                    ability.linkedItems.length
                        ? `

                            <div
                                class="
                                    ability-linked-items
                                "
                            >

                                <h2>
                                    Related Items
                                </h2>


                                ${ability.linkedItems
                                    .map(
                                        itemId => {

                                            const item =
                                                inventoryItems.find(
                                                    item =>
                                                        item.id ===
                                                        itemId
                                                );


                                            if (!item) {
                                                return "";
                                            }


                                            return `

                                                <button
                                                    class="
                                                        linked-ability-card
                                                    "
                                                    onclick="
                                                        showInventoryItem(
                                                            '${item.id}'
                                                        )
                                                    "
                                                >

                                                    <span>
                                                        ${item.icon}
                                                    </span>


                                                    <div>

                                                        <small>
                                                            Item
                                                        </small>

                                                        <strong>
                                                            ${item.name}
                                                        </strong>

                                                    </div>


                                                    <span>
                                                        ›
                                                    </span>

                                                </button>

                                            `;

                                        }
                                    )
                                    .join("")}

                            </div>

                        `
                        : ""
                }


                <div
                    class="ability-action-group"
                >


                    ${
                        ability.usageType ===
                        "uses"
                            ? `

                                <div
                                    class="
                                        ability-counter-actions
                                    "
                                >

                                    <button
                                        class="
                                            ability-counter-button
                                        "
                                        onclick="
                                            changeAbilityUses(
                                                '${ability.id}',
                                                -1
                                            )
                                        "
                                    >
                                        −
                                    </button>


                                    <span>
                                        ${ability.currentUses}
                                        /
                                        ${ability.maximumUses}
                                    </span>


                                    <button
                                        class="
                                            ability-counter-button
                                        "
                                        onclick="
                                            changeAbilityUses(
                                                '${ability.id}',
                                                1
                                            )
                                        "
                                    >
                                        +
                                    </button>

                                </div>

                            `
                            : ""
                    }


                    ${
                        ability.usageType ===
                        "pool"
                            ? `

                                <input
                                    type="range"
                                    class="
                                        ability-pool-slider
                                    "
                                    min="0"
                                    max="${ability.maximumPool}"
                                    value="${ability.currentPool}"
                                    oninput="
                                        changeAbilityPool(
                                            '${ability.id}',
                                            this.value
                                        )
                                    "
                                >

                            `
                            : ""
                    }

                </div>


            </section>

        </main>

    `;

}


// ---------- Change Ability Uses ----------

function changeAbilityUses(
    abilityId,
    amount
) {

    const ability =
        abilities.find(
            ability =>
                ability.id ===
                abilityId
        );


    if (!ability) {
        return;
    }


    if (
        ability.usageType !==
        "uses"
    ) {
        return;
    }


    ability.currentUses +=
        amount;


    if (
        ability.currentUses < 0
    ) {

        ability.currentUses = 0;

    }


    if (
        ability.currentUses >
        ability.maximumUses
    ) {

        ability.currentUses =
            ability.maximumUses;

    }


    saveAbilityState();

    showAbilityDetails(
        ability.id
    );

}


// ---------- Change Ability Pool ----------

function changeAbilityPool(
    abilityId,
    value
) {

    const ability =
        abilities.find(
            ability =>
                ability.id ===
                abilityId
        );


    if (!ability) {
        return;
    }


    if (
        ability.usageType !==
        "pool"
    ) {
        return;
    }


    ability.currentPool =
        Number(value);


    saveAbilityState();


    const valueElement =
        document.querySelector(
            ".ability-pool-current"
        );


    if (valueElement) {

        valueElement.textContent =
            ability.currentPool;

    }

}


// ---------- Reset Ability Uses ----------

function resetAbilityUses() {

    abilities.forEach(
        ability => {

            if (
                ability.usageType ===
                "uses"
            ) {

                ability.currentUses =
                    ability.maximumUses;

            }


            if (
                ability.usageType ===
                "pool"
            ) {

                ability.currentPool =
                    ability.maximumPool;

            }

        }
    );


    saveAbilityState();

}


// ---------- Character Resources ----------

function restoreAbilityResources() {

    resetAbilityUses();

}


// ---------- Home Menu ----------

const menuButtons =
    document.querySelectorAll(
        ".menu-button"
    );


menuButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                const text =
                    button.innerText
                        .toLowerCase();


                if (
                    text.includes(
                        "spells"
                    )
                ) {

                    openSection(
                        "spells"
                    );

                } else if (
                    text.includes(
                        "abilities"
                    )
                ) {

                    openSection(
                        "abilities"
                    );

                } else if (
                    text.includes(
                        "inventory"
                    )
                ) {

                    openSection(
                        "inventory"
                    );

                } else {

                    alert(
                        "This section is coming soon."
                    );

                }

            }
        );

    }
);

// ========================================
// INVENTORY
// ========================================


// ---------- Currency ----------

const defaultCurrency = {

    copper: 30,
    silver: 11,
    gold: 24,
    platinum: 3

};


const savedCurrency =
    JSON.parse(
        localStorage.getItem(
            "inventoryCurrency"
        )
    );


const currency =
    savedCurrency || defaultCurrency;


// ---------- Inventory Items ----------

const defaultInventoryItems = [

    // ---------- Equipment ----------

    {
        id: "plate-armor",
        name: "Plate Armor",
        category: "armor",
        location: "equipment",
        icon: "🛡️",
        description:
            "Heavy armor consisting of shaped metal plates covering most of the body.",
        quantity: 1,
        weight: null,
        equipped: true,
        magical: false,
        properties: [
            "Heavy Armor",
            "+7 AC"
        ],
        tags: [
            "Armor"
        ]
    },


    {
        id: "golden-choice-sword",
        name: "Sword of the Golden Choice",
        category: "weapons",
        location: "equipment",
        icon: "⚔️",
        description:
            "A magical sword carrying the power of the Dragon.",
        quantity: 1,
        weight: null,
        equipped: true,
        magical: true,
        properties: [
            "Magical Weapon",
            "Dragon's Judgment"
        ],
        linkedAbility:
            "dragons-judgment",
        tags: [
            "Weapon",
            "Magical"
        ]
    },


    {
        id: "bahamut-shield",
        name: "Shield of Bahamut",
        category: "shield",
        location: "equipment",
        icon: "🛡️",
        description:
            "A magical shield bearing the symbol of Bahamut.",
        quantity: 1,
        weight: null,
        equipped: true,
        magical: true,
        properties: [
            "+4 AC"
        ],
        tags: [
            "Shield",
            "Magical"
        ]
    },


    {
        id: "bahamut-symbol",
        name: "Symbol of Bahamut",
        category: "focus",
        location: "equipment",
        icon: "✝️",
        description:
            "A simple holy symbol of Bahamut used as a divine spellcasting focus.",
        quantity: 1,
        weight: null,
        equipped: true,
        magical: false,
        properties: [
            "Divine Focus"
        ],
        tags: [
            "Focus"
        ]
    },


    // ---------- Miscellaneous ----------

    {
        id: "healing-potion",
        name: "Simple Healing Potion",
        category: "miscellaneous",
        location: "miscellaneous",
        icon: "🧪",
        description:
            "A simple potion made from red berries. Restores 1d6 hit points.",
        quantity: 1,
        weight: null,
        equipped: false,
        magical: false,
        properties: [
            "Restores 1d6 HP"
        ],
        tags: [
            "Consumable",
            "Potion"
        ]
    },


    {
        id: "silver-rings",
        name: "Silver Rings",
        category: "miscellaneous",
        location: "miscellaneous",
        icon: "💍",
        description:
            "A pair of silver rings that can be used for magic or as a symbol of a bond between two people.",
        quantity: 1,
        weight: null,
        equipped: false,
        magical: false,
        properties: [
            "Pair of rings"
        ],
        tags: [
            "Accessory",
            "Treasure",
            "Spell Component"
        ]
    }

];


const savedInventory =
    JSON.parse(
        localStorage.getItem(
            "inventoryItems"
        )
    );


const inventoryItems =
    savedInventory ||
    defaultInventoryItems;

updateDragonBreathUses();

// ---------- Save Inventory ----------

function saveInventory() {

    localStorage.setItem(
        "inventoryItems",
        JSON.stringify(
            inventoryItems
        )
    );

}


function saveCurrency() {

    localStorage.setItem(
        "inventoryCurrency",
        JSON.stringify(
            currency
        )
    );

}


// ---------- Equipment Categories ----------

const equipmentCategories = [

    {
        id: "armor",
        name: "Armor",
        icon: "🛡️"
    },

    {
        id: "weapons",
        name: "Weapons",
        icon: "⚔️"
    },

    {
        id: "ammunition",
        name: "Ammunition",
        icon: "🏹"
    },

    {
        id: "focus",
        name: "Focus",
        icon: "✝️"
    },

    {
        id: "shield",
        name: "Shield",
        icon: "🛡️"
    },

    {
        id: "accessories",
        name: "Accessories / Others",
        icon: "💍"
    }

];


// ---------- Inventory Tags ----------

const inventoryTags = [

    // Equipment tags

    "Armor",
    "Weapon",
    "Shield",
    "Focus",
    "Ammunition",
    "Accessory",

    // Behaviour tags

    "Consumable",
    "Potion",
    "Treasure",
    "Common",
    "Quest Item",
    "Spell Component",
    "Magical",
    "Material",
    "Utility"

];


// ---------- Show Inventory ----------

function showInventory() {

    const app =
        document.getElementById(
            "app"
        );


    app.innerHTML = `

        <header class="app-header">

            <button
                class="back-button"
                onclick="goHome()"
            >
                ← Back
            </button>


            <h1>
                Inventory
            </h1>

        </header>


        <main>

            <section
                class="inventory-main-menu"
            >

                <button
                    class="inventory-main-button"
                    onclick="
                        showInventorySection(
                            'equipment'
                        )
                    "
                >

                    <span>
                        🛡️
                    </span>

                    <strong>
                        Equipment
                    </strong>

                    <span>
                        ›
                    </span>

                </button>


                <button
                    class="inventory-main-button"
                    onclick="
                        showInventorySection(
                            'miscellaneous'
                        )
                    "
                >

                    <span>
                        🎒
                    </span>

                    <strong>
                        Miscellaneous
                    </strong>

                    <span>
                        ›
                    </span>

                </button>

            </section>


            <section
                class="currency-summary"
            >

                <button
                    class="currency-summary-button"
                    onclick="
                        showCurrencyDetails()
                    "
                >

                    <span>
                        🪙
                    </span>


                    <div>

                        <strong>
                            Coin Pouch
                        </strong>


                        <small>
                            ${getTotalGoldValue()}
                            gp total
                        </small>

                    </div>


                    <span>
                        ›
                    </span>

                </button>


                <div
                    class="currency-mini"
                >

                    <span>
                        🟤
                        ${currency.copper}
                    </span>

                    <span>
                        ⚪
                        ${currency.silver}
                    </span>

                    <span>
                        🟡
                        ${currency.gold}
                    </span>

                    <span>
                        🔵
                        ${currency.platinum}
                    </span>

                </div>

            </section>

        </main>

    `;

}


// ---------- Inventory Section ----------

function showInventorySection(
    section
) {

    const app =
        document.getElementById(
            "app"
        );


    app.innerHTML = `

        <header class="app-header">

            <button
                class="back-button"
                onclick="
                    showInventory()
                "
            >
                ← Inventory
            </button>


            <h1>
                ${
                    section === "equipment"
                        ? "Equipment"
                        : "Miscellaneous"
                }
            </h1>

        </header>


        <main>

            ${
                section === "equipment"
                    ? renderEquipment()
                    : renderMiscellaneous()
            }

        </main>

    `;

}


// ---------- Equipment ----------

function renderEquipment() {

    let html = `

        <button
            class="inventory-add-button"
            onclick="
                openAddItemForm()
            "
        >
            ＋ Add Item
        </button>

    `;


    equipmentCategories.forEach(
        category => {

            const items =
                inventoryItems.filter(
                    item =>
                        item.location ===
                            "equipment"
                        &&
                        item.category ===
                            category.id
                );


            if (
                items.length === 0
            ) {

                return;

            }


            html += `

                <div
                    class="inventory-category"
                >

                    <h3>

                        ${category.icon}

                        ${category.name}

                    </h3>


                    <div
                        class="inventory-list"
                    >

                        ${items
                            .map(
                                renderInventoryItem
                            )
                            .join("")}

                    </div>

                </div>

            `;

        }
    );


    return html;

}


// ---------- Miscellaneous ----------

function renderMiscellaneous() {

    const items =
        inventoryItems.filter(
            item =>
                item.location ===
                "miscellaneous"
        );


    let html = `

        <button
            class="inventory-add-button"
            onclick="
                openAddItemForm()
            "
        >
            ＋ Add Item
        </button>

    `;


    if (
        items.length === 0
    ) {

        html += `

            <p
                class="empty-message"
            >
                No miscellaneous items.
            </p>

        `;

        return html;

    }


    html += `

        <div
            class="inventory-list"
        >

            ${items
                .map(
                    renderInventoryItem
                )
                .join("")}

        </div>

    `;


    return html;

}


// ---------- Inventory Item ----------

function renderInventoryItem(
    item
) {

    const weightText =
        item.weight !== null
            ? `${item.weight} kg`
            : "Weight not set";


    const canQuickConsume =
        hasQuickConsumeTag(
            item
        );


    const unavailable =
        item.quantity <= 0 &&
        canQuickConsume;


    return `

        <div
            class="inventory-item-card"
            onclick="
                showInventoryItem(
                    '${item.id}'
                )
            "
        >

            <div
                class="inventory-item-icon"
            >
                ${item.icon}
            </div>


            <div
                class="inventory-item-info"
            >

                <div
                    class="inventory-item-top"
                >

                    <h3>
                        ${item.name}
                    </h3>


                    <span
                        class="inventory-arrow"
                    >
                        ›
                    </span>

                </div>


                <div
                    class="inventory-item-meta"
                >

                    × ${item.quantity}


                    ${
                        item.equipped
                            ? " · Equipped"
                            : ""
                    }


                    ${
                        item.magical
                            ? " · ✨ Magical"
                            : ""
                    }

                </div>


                ${
                    unavailable
                        ? `

                            <div
                                class="
                                    inventory-unavailable
                                "
                            >
                                ⚠️ Unavailable
                            </div>

                        `
                        : ""
                }


                ${
                    item.tags &&
                    item.tags.length > 0
                        ? `

                            <div
                                class="
                                    inventory-tags
                                "
                            >

                                ${item.tags
                                    .map(
                                        tag => `

                                            <span
                                                class="
                                                    inventory-tag
                                                "
                                            >
                                                ${tag}
                                            </span>

                                        `
                                    )
                                    .join("")}

                            </div>

                        `
                        : ""
                }


                <span
                    class="inventory-weight"
                >
                    ⚖️ ${weightText}
                </span>


                ${
                    canQuickConsume
                        ? `

                            <button
                                class="
                                    inventory-consume-button
                                "
                                onclick="
                                    event.stopPropagation();

                                    consumeInventoryItem(
                                        '${item.id}'
                                    )
                                "
                                ${
                                    unavailable
                                        ? "disabled"
                                        : ""
                                }
                            >
                                Consume 1
                            </button>

                        `
                        : ""
                }


                ${
                    item.location ===
                    "equipment"
                        ? `

                            <button
                                class="
                                    inventory-equip-button
                                "
                                onclick="
                                    event.stopPropagation();

                                    toggleEquipment(
                                        '${item.id}'
                                    )
                                "
                            >
                                ${
                                    item.equipped
                                        ? "Unequip"
                                        : "Equip"
                                }
                            </button>

                        `
                        : hasEquipmentTag(
                            item
                        )
                            ? `

                                <button
                                    class="
                                        inventory-equip-button
                                    "
                                    onclick="
                                        event.stopPropagation();

                                        toggleEquipment(
                                            '${item.id}'
                                        )
                                    "
                                >
                                    Equip
                                </button>

                            `
                            : ""
                }

            </div>

        </div>

    `;

}


// ---------- Inventory Item Details ----------

function showInventoryItem(
    itemId
) {

    const item =
        inventoryItems.find(
            item =>
                item.id ===
                itemId
        );


    if (!item) {
        return;
    }


    const locationName =
        item.location ===
        "equipment"
            ? "Equipment"
            : "Miscellaneous";


    const app =
        document.getElementById(
            "app"
        );


    const propertiesHTML =
        item.properties &&
        item.properties.length > 0
            ? `

                <div
                    class="
                        inventory-details-properties
                    "
                >

                    <h2>
                        Properties
                    </h2>


                    <div>

                        ${item.properties
                            .map(
                                property => `

                                    <span
                                        class="
                                            inventory-property
                                        "
                                    >
                                        ${property}
                                    </span>

                                `
                            )
                            .join("")}

                    </div>

                </div>

            `
            : "";


    const tagsHTML =
        item.tags &&
        item.tags.length > 0
            ? `

                <div
                    class="
                        inventory-details-properties
                    "
                >

                    <h2>
                        Tags
                    </h2>


                    <div>

                        ${item.tags
                            .map(
                                tag => `

                                    <span
                                        class="
                                            inventory-tag
                                        "
                                    >
                                        ${tag}
                                    </span>

                                `
                            )
                            .join("")}

                    </div>

                </div>

            `
            : "";


    const canQuickConsume =
        hasQuickConsumeTag(
            item
        );


    const unavailable =
        item.quantity <= 0 &&
        canQuickConsume;


    app.innerHTML = `

        <header
            class="app-header"
        >

            <button
                class="back-button"
                onclick="
                    showInventorySection(
                        '${item.location}'
                    )
                "
            >
                ← ${locationName}
            </button>


            <h1>
                ${item.icon}
                ${item.name}
            </h1>


            <p>
                ${locationName}
            </p>

        </header>


        <main>

            <section
                class="inventory-details"
            >

                <div
                    class="
                        inventory-detail-summary
                    "
                >

                    <div
                        class="
                            inventory-detail-stat
                        "
                    >

                        <span>
                            QUANTITY
                        </span>

                        <strong>
                            ${item.quantity}
                        </strong>

                    </div>


                    <div
                        class="
                            inventory-detail-stat
                        "
                    >

                        <span>
                            WEIGHT
                        </span>

                        <strong>
                            ${
                                item.weight !== null
                                    ? `${item.weight} kg`
                                    : "—"
                            }
                        </strong>

                    </div>


                    <div
                        class="
                            inventory-detail-stat
                        "
                    >

                        <span>
                            STATUS
                        </span>

                        <strong>
                            ${
                                item.equipped
                                    ? "Equipped"
                                    : unavailable
                                        ? "Unavailable"
                                        : "Carried"
                            }
                        </strong>

                    </div>

                </div>


                <div
                    class="inventory-description"
                >

                    <h2>
                        Description
                    </h2>


                    <p>
                        ${item.description}
                    </p>

                </div>


                ${propertiesHTML}

                ${tagsHTML}


                <div
                    class="
                        inventory-action-group
                    "
                >

                    ${
                        item.location ===
                            "equipment" ||
                        hasEquipmentTag(
                            item
                        )
                            ? `

                                <button
                                    class="
                                        inventory-action-button
                                    "
                                    onclick="
                                        toggleEquipment(
                                            '${item.id}'
                                        )
                                    "
                                >
                                    ${
                                        item.equipped
                                            ? "Unequip"
                                            : "Equip"
                                    }
                                </button>

                            `
                            : ""
                    }


                    ${
                        canQuickConsume
                            ? `

                                <button
                                    class="
                                        inventory-action-button
                                    "
                                    onclick="
                                        consumeInventoryItem(
                                            '${item.id}'
                                        )
                                    "
                                    ${
                                        unavailable
                                            ? "disabled"
                                            : ""
                                    }
                                >
                                    Consume 1
                                </button>

                            `
                            : ""
                    }


                    <button
                        class="
                            inventory-action-button
                        "
                        onclick="
                            openEditItemForm(
                                '${item.id}'
                            )
                        "
                    >
                        Edit
                    </button>


                    <button
                        class="
                            inventory-action-button
                            inventory-delete-button
                        "
                        onclick="
                            deleteInventoryItem(
                                '${item.id}'
                            )
                        "
                    >
                        Delete
                    </button>

                </div>

            </section>

        </main>

    `;

}


// ---------- Equipment Tags ----------

function hasEquipmentTag(
    item
) {

    return item.tags &&
        item.tags.some(
            tag =>
                [
                    "Armor",
                    "Weapon",
                    "Shield",
                    "Focus",
                    "Ammunition",
                    "Accessory"
                ].includes(tag)
        );

}


// ---------- Equipment Category ----------

function getEquipmentCategoryFromTags(
    item
) {

    const tagMap = {

        Armor:
            "armor",

        Weapon:
            "weapons",

        Shield:
            "shield",

        Focus:
            "focus",

        Ammunition:
            "ammunition",

        Accessory:
            "accessories"

    };


    for (
        const tag of item.tags || []
    ) {

        if (
            tagMap[tag]
        ) {

            return tagMap[tag];

        }

    }


    return null;

}


// ---------- Single-Slot Equipment ----------

function isSingleSlotEquipment(
    category
) {

    return [
        "armor",
        "shield",
        "focus"
    ].includes(
        category
    );

}


// ---------- Equip / Unequip ----------

function toggleEquipment(
    itemId
) {

    const item =
        inventoryItems.find(
            item =>
                item.id ===
                itemId
        );


    if (!item) {
        return;
    }


    // ---------- UNEQUIP ----------

    if (
        item.equipped
    ) {

        item.equipped =
            false;


        // Equipment items remain
        // in their equipment category.
        // Items originally coming from
        // Miscellaneous return there.

        if (
            item.originalLocation ===
            "miscellaneous"
        ) {

            item.location =
                "miscellaneous";

            item.category =
                "miscellaneous";

        } else {

            item.location =
                "equipment";

        }


        saveInventory();

        showInventorySection(
            item.location
        );

        return;

    }


    // ---------- EQUIP ----------

    const category =
        getEquipmentCategoryFromTags(
            item
        );


    if (!category) {

        alert(
            "This item does not have an equipment tag."
        );

        return;

    }


    // ---------- Single-slot equipment ----------

    if (
        isSingleSlotEquipment(
            category
        )
    ) {

        const equippedItem =
            inventoryItems.find(
                other =>
                    other.id !==
                        item.id
                    &&
                    other.equipped ===
                        true
                    &&
                    other.location ===
                        "equipment"
                    &&
                    other.category ===
                        category
            );


        if (
            equippedItem
        ) {

            const confirmed =
                confirm(
                    `${equippedItem.name} is already equipped.\n\nEquip ${item.name} instead?`
                );


            if (!confirmed) {

                return;

            }


            equippedItem.equipped =
                false;


            if (
                equippedItem.originalLocation ===
                "miscellaneous"
            ) {

                equippedItem.location =
                    "miscellaneous";

                equippedItem.category =
                    "miscellaneous";

            }

        }

    }


    // ---------- Equipment category ----------

    item.category =
        category;


    item.equipped =
        true;


    item.location =
        "equipment";


    if (
        !item.originalLocation
    ) {

        item.originalLocation =
            "miscellaneous";

    }


    saveInventory();

    showInventorySection(
        "equipment"
    );

}


// ========================================
// INVENTORY ITEM MANAGEMENT
// ========================================


// ---------- Quick Consume ----------

function hasQuickConsumeTag(
    item
) {

    return item.tags &&
        item.tags.some(
            tag =>
                [
                    "Consumable",
                    "Ammunition",
                    "Spell Component"
                ].includes(tag)
        );

}


function consumeInventoryItem(
    itemId
) {

    const item =
        inventoryItems.find(
            item =>
                item.id ===
                itemId
        );


    if (!item) {
        return;
    }


    if (
        !hasQuickConsumeTag(
            item
        )
    ) {

        return;

    }


    if (
        item.quantity <= 0
    ) {

        return;

    }


    item.quantity--;


    saveInventory();


    if (
        document.querySelector(
            ".inventory-details"
        )
    ) {

        showInventoryItem(
            item.id
        );

    } else {

        showInventorySection(
            item.location
        );

    }

}

// ========================================
// INVENTORY ITEM FORMS
// ========================================


// ---------- Add Item ----------

function openAddItemForm() {

    openInventoryItemForm();

}


// ---------- Edit Item ----------

function openEditItemForm(
    itemId
) {

    const item =
        inventoryItems.find(
            item =>
                item.id === itemId
        );


    if (!item) {
        return;
    }


    openInventoryItemForm(
        item
    );

}


// ---------- Inventory Form ----------

function openInventoryItemForm(
    existingItem = null
) {

    const isEditing =
        existingItem !== null;


    const selectedTags =
        existingItem
            ? existingItem.tags || []
            : [];


    const form =
        document.createElement(
            "div"
        );


    form.className =
        "inventory-form-overlay";


    form.innerHTML = `

        <div
            class="
                inventory-form-modal
            "
        >

            <button
                class="rest-close"
                onclick="
                    this
                        .closest(
                            '.inventory-form-overlay'
                        )
                        .remove()
                "
            >
                ×
            </button>


            <h2>
                ${
                    isEditing
                        ? "Edit Item"
                        : "Add Item"
                }
            </h2>


            <label>

                Name

                <input
                    id="inventory-form-name"
                    type="text"
                    value="${
                        escapeHTML(
                            existingItem?.name ||
                            ""
                        )
                    }"
                    placeholder="Item name"
                >

            </label>


            <label>

                Icon

                <input
                    id="inventory-form-icon"
                    type="text"
                    value="${
                        escapeHTML(
                            existingItem?.icon ||
                            "📦"
                        )
                    }"
                    maxlength="4"
                >

            </label>


            <label>

                Description

                <textarea
                    id="
                        inventory-form-description
                    "
                    placeholder="
                        Describe the item...
                    "
                >${
                    escapeHTML(
                        existingItem?.description ||
                        ""
                    )
                }</textarea>

            </label>


            <label>

                Quantity

                <input
                    id="
                        inventory-form-quantity
                    "
                    type="number"
                    min="0"
                    step="1"
                    inputmode="numeric"
                    value="${
                        existingItem
                            ? existingItem.quantity
                            : 1
                    }"
                >

            </label>


            <label>

                Weight (kg)

                <input
                    id="
                        inventory-form-weight
                    "
                    type="number"
                    min="0"
                    step="0.01"
                    inputmode="decimal"
                    value="${
                        existingItem?.weight ??
                        ""
                    }"
                    placeholder="Optional"
                >

            </label>

                Properties

                <input
                    id="
                        inventory-form-properties
                    "
                    type="text"
                    value="${
                        escapeHTML(
                            existingItem?.properties
                                ?.join(", ") ||
                            ""
                        )
                    }"
                    placeholder="
                        Separate properties with commas
                    "
                >

            </label>


            <label
                class="
                    inventory-checkbox-label
                "
            >

                <input
                    id="
                        inventory-form-magical
                    "
                    type="checkbox"
                    ${
                        existingItem?.magical
                            ? "checked"
                            : ""
                    }
                >

                Magical item

            </label>


            <div
                class="
                    inventory-form-tags
                "
            >

                <strong>
                    Tags
                </strong>


                <small>
                    Choose up to 3
                </small>


                <div
                    class="
                        inventory-tag-options
                    "
                >

                    ${inventoryTags
                        .map(
                            tag => `

                                <label>

                                    <input
                                        type="checkbox"
                                        value="${tag}"
                                        class="
                                            inventory-tag-checkbox
                                        "
                                        ${
                                            selectedTags
                                                .includes(
                                                    tag
                                                )
                                                ? "checked"
                                                : ""
                                        }
                                        onchange="
                                            limitInventoryTags(
                                                this
                                            )
                                        "
                                    >

                                    ${tag}

                                </label>

                            `
                        )
                        .join("")}

                </div>

            </div>


            <button
                class="
                    inventory-form-submit
                "
                onclick="
                    saveInventoryItemForm(
                        '${
                            existingItem?.id ||
                            ""
                        }'
                    )
                "
            >

                ${
                    isEditing
                        ? "Save Changes"
                        : "Add Item"
                }

            </button>

        </div>

    `;


    document.body.appendChild(
        form
    );

}


// ---------- Limit Tags ----------

function limitInventoryTags(
    checkbox
) {

    const checked =
        document.querySelectorAll(
            ".inventory-tag-checkbox:checked"
        );


    if (
        checked.length > 3
    ) {

        checkbox.checked =
            false;


        alert(
            "You can choose a maximum of 3 tags."
        );

    }

}


// ---------- Save Item Form ----------

function saveInventoryItemForm(
    existingId = ""
) {

    const name =
        document.getElementById(
            "inventory-form-name"
        ).value.trim();


    if (!name) {

        alert(
            "Please enter an item name."
        );

        return;

    }


    const quantity =
        Number(
            document.getElementById(
                "inventory-form-quantity"
            ).value
        );


    if (
        !Number.isFinite(
            quantity
        ) ||
        quantity < 0
    ) {

        alert(
            "Quantity must be 0 or greater."
        );

        return;

    }


    const weightValue =
        document.getElementById(
            "inventory-form-weight"
        ).value;


    const weight =
        weightValue === ""
            ? null
            : Number(
                weightValue
            );


    if (
        weight !== null &&
        (
            !Number.isFinite(
                weight
            ) ||
            weight < 0
        )
    ) {

        alert(
            "Weight must be 0 or greater."
        );

        return;

    }


    const tags =
        Array.from(
            document.querySelectorAll(
                ".inventory-tag-checkbox:checked"
            )
        )
        .map(
            checkbox =>
                checkbox.value
        );

    const properties =
        document.getElementById(
            "inventory-form-properties"
        ).value
            .split(",")
            .map(
                property =>
                    property.trim()
            )
            .filter(
                Boolean
            );


    const selectedCategory =
    "miscellaneous";


    const equipmentCategory =
        getEquipmentCategoryFromTags(
            {
                tags
            }
        );


    const isEquipmentItem =
        equipmentCategory !== null;


    // ---------- Edit ----------

    if (existingId) {

        const item =
            inventoryItems.find(
                item =>
                    item.id ===
                    existingId
            );


        if (!item) {
            return;
        }


        item.name =
            name;


        item.icon =
            document.getElementById(
                "inventory-form-icon"
            ).value ||
            "📦";


        item.description =
            document.getElementById(
                "inventory-form-description"
            ).value.trim();


        item.quantity =
            Math.floor(
                quantity
            );


        item.weight =
            weight;


        item.properties =
            properties;


        item.magical =
            document.getElementById(
                "inventory-form-magical"
            ).checked;


        item.tags =
            tags;


        if (
            item.equipped
        ) {

            if (
                isEquipmentItem
            ) {

                item.category =
                    equipmentCategory;


                item.location =
                    "equipment";

            } else {

                item.equipped =
                    false;


                item.location =
                    "miscellaneous";


                item.category =
                    "miscellaneous";

            }

        } else {

            item.category =
                isEquipmentItem
                    ? equipmentCategory
                    : selectedCategory;

        }


        saveInventory();


        closeInventoryForm();


        showInventorySection(
            item.location
        );


        return;

    }


    // ---------- Create ----------

    const item = {

        id:
            "item-" +
            Date.now(),


        name:
            name,


        category:
            isEquipmentItem
                ? equipmentCategory
                : selectedCategory,


                location:
            isEquipmentItem
                ? "equipment"
                : "miscellaneous",


        icon:
            document.getElementById(
                "inventory-form-icon"
            ).value ||
            "📦",


        description:
            document.getElementById(
                "inventory-form-description"
            ).value.trim(),


        quantity:
            Math.floor(
                quantity
            ),


        weight:
            weight,


        equipped:
            false,


        magical:
            document.getElementById(
                "inventory-form-magical"
            ).checked,


        properties:
            properties,


        tags:
            tags,


        originalLocation:
            "miscellaneous"

    };


    inventoryItems.push(
        item
    );


    saveInventory();


    closeInventoryForm();


    showInventorySection(
        "miscellaneous"
    );

}


// ---------- Close Inventory Form ----------

function closeInventoryForm() {

    const overlay =
        document.querySelector(
            ".inventory-form-overlay"
        );


    if (overlay) {

        overlay.remove();

    }

}


// ---------- Delete Item ----------

function deleteInventoryItem(
    itemId
) {

    const item =
        inventoryItems.find(
            item =>
                item.id ===
                itemId
        );


    if (!item) {
        return;
    }


    const confirmed =
        confirm(
            `Delete "${item.name}"?\n\nThis cannot be undone.`
        );


    if (!confirmed) {
        return;
    }


    const index =
        inventoryItems.findIndex(
            item =>
                item.id ===
                itemId
        );


    if (
        index === -1
    ) {

        return;

    }


    inventoryItems.splice(
        index,
        1
    );


    saveInventory();


    showInventorySection(
        "miscellaneous"
    );

}


// ========================================
// CURRENCY DETAILS
// ========================================


// ---------- Currency Conversion ----------

function getTotalGoldValue() {

    return (

        currency.gold +

        currency.silver / 10 +

        currency.copper / 100 +

        currency.platinum * 10

    ).toFixed(2);

}


// ---------- Currency Details ----------

function showCurrencyDetails() {

    const app =
        document.getElementById(
            "app"
        );


    app.innerHTML = `

        <header
            class="app-header"
        >

            <button
                class="back-button"
                onclick="
                    showInventory()
                "
            >
                ← Inventory
            </button>


            <h1>
                🪙 Coin Pouch
            </h1>


            <p>
                Your currency
            </p>

        </header>


        <main>

            <section
                class="
                    currency-details
                "
            >


                <div
                    class="
                        currency-total
                    "
                >

                    <span>
                        Total Value
                    </span>


                    <strong>
                        ${getTotalGoldValue()}
                        gp
                    </strong>

                </div>


                <div
                    class="
                        currency-list
                    "
                >


                    <div
                        class="
                            currency-row
                            copper
                        "
                    >

                        <span>
                            🟤 Copper
                        </span>


                        <div>

                            <button
                                onclick="
                                    changeCurrency(
                                        'copper',
                                        -1
                                    )
                                "
                            >
                                −
                            </button>


                            <strong>
                                ${currency.copper}
                            </strong>


                            <button
                                onclick="
                                    changeCurrency(
                                        'copper',
                                        1
                                    )
                                "
                            >
                                +
                            </button>

                        </div>

                    </div>


                    <div
                        class="
                            currency-row
                            silver
                        "
                    >

                        <span>
                            ⚪ Silver
                        </span>


                        <div>

                            <button
                                onclick="
                                    changeCurrency(
                                        'silver',
                                        -1
                                    )
                                "
                            >
                                −
                            </button>


                            <strong>
                                ${currency.silver}
                            </strong>


                            <button
                                onclick="
                                    changeCurrency(
                                        'silver',
                                        1
                                    )
                                "
                            >
                                +
                            </button>

                        </div>

                    </div>


                    <div
                        class="
                            currency-row
                            gold
                        "
                    >

                        <span>
                            🟡 Gold
                        </span>


                        <div>

                            <button
                                onclick="
                                    changeCurrency(
                                        'gold',
                                        -1
                                    )
                                "
                            >
                                −
                            </button>


                            <strong>
                                ${currency.gold}
                            </strong>


                            <button
                                onclick="
                                    changeCurrency(
                                        'gold',
                                        1
                                    )
                                "
                            >
                                +
                            </button>

                        </div>

                    </div>


                    <div
                        class="
                            currency-row
                            platinum
                        "
                    >

                        <span>
                            🔵 Platinum
                        </span>


                        <div>

                            <button
                                onclick="
                                    changeCurrency(
                                        'platinum',
                                        -1
                                    )
                                "
                            >
                                −
                            </button>


                            <strong>
                                ${currency.platinum}
                            </strong>


                            <button
                                onclick="
                                    changeCurrency(
                                        'platinum',
                                        1
                                    )
                                "
                            >
                                +
                            </button>

                        </div>

                    </div>

                </div>


                <div
                    class="
                        currency-conversion
                    "
                >

                    <h2>
                        Gold Conversion
                    </h2>


                    <p>
                        1 pp = 10 gp ·
                        1 gp = 10 sp ·
                        1 sp = 10 cp
                    </p>


                    <strong>
                        ${getTotalGoldValue()}
                        gp
                    </strong>

                </div>


            </section>

        </main>

    `;

}


// ---------- Change Currency ----------

function changeCurrency(
    type,
    amount
) {

    currency[type] +=
        amount;


    if (
        currency[type] < 0
    ) {

        currency[type] =
            0;

    }


    saveCurrency();


    showCurrencyDetails();

}


// ---------- Set Currency ----------

function setCurrency(
    type,
    value
) {

    const amount =
        Number(
            value
        );


    if (
        !Number.isFinite(
            amount
        ) ||
        amount < 0
    ) {

        return;

    }


    currency[type] =
        Math.floor(
            amount
        );


    saveCurrency();


    showCurrencyDetails();

}


// ========================================
// SIMPLE HTML ESCAPE
// ========================================

function escapeHTML(
    value
) {

    return String(
        value
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


// ---------- Initialize ----------

// Home is rendered by index.html; no JS initializer is required.
