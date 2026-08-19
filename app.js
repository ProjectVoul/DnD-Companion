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
        showAbilities();
        return;
    }

    if (section === "inventory") {
        showInventory();
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
// ABILITIES
// ========================================


const abilities = [

    // ---------- Racial ----------

    {
        id: "dragon-breath",

        name: "Dragon Breath",

        category: "racial",

        icon: "🐉",

        description:
            "You exhale a destructive breath that deals 4d6 damage. The target must make a saving throw against your Dragon Breath DC.",

        details: [
            {
                label: "Save DC",
                value: "8 + Constitution modifier + proficiency bonus"
            },
            {
                label: "Damage",
                value: "4d6"
            }
        ],

        resource: {
            type: "uses",
            current: 2,
            maximum: 2,
            recovery: "longRest"
        },

        actions: [
            "Action"
        ]

    },


    // ---------- Class ----------

    {
        id: "lay-on-hands",

        name: "Lay on Hands",

        category: "class",

        icon: "✋",

        description:
            "Your blessed touch can heal wounds. You have a pool of healing power that replenishes when you take a long rest.",

        details: [
            {
                label: "Healing Pool",
                value: "5 × Paladin level"
            },
            {
                label: "Current Pool",
                value: "65 HP"
            },
            {
                label: "Special",
                value: "Spend 5 HP from the pool to cure a disease or neutralize a poison."
            }
        ],

        resource: {
            type: "pool",
            current: 65,
            maximum: 65,
            unit: "HP",
            recovery: "longRest"
        },

        actions: [
            "Action"
        ]

    },


    // ---------- Feat ----------

    {
        id: "shield-master",

        name: "Shield Master",

        category: "feat",

        icon: "🛡️",

        description:
            "You have mastered the use of your shield to defend yourself and control the battlefield.",

        details: [
            {
                label: "Dexterity Saves",
                value: "Add the AC bonus from your shield to Dexterity saving throws."
            },
            {
                label: "Reaction",
                value: "When an effect allows you to make a Dexterity saving throw to take only half damage on a success, you can use your reaction to take no damage instead."
            },
            {
                label: "Bonus Action",
                value: "After attacking, you can use a bonus action to shove a creature up to 5 feet away."
            }
        ],

        resource: {
            type: "none",
            recovery: null
        },

        actions: [
            "Passive",
            "Reaction",
            "Bonus Action"
        ]

    },


    // ---------- Additional / Magic Weapon ----------

    {
        id: "dragons-judgment",

        name: "Dragon's Judgment",

        category: "additional",

        icon: "⚔️",

        description:
            "When you hit a creature with the Sword of the Golden Choice, you can force the target to make a Wisdom saving throw.",

        details: [
            {
                label: "On Failure",
                value: "Choose one of the two effects below."
            },
            {
                label: "Prone",
                value: "The target falls prone and can stand only at the end of its turn, without using additional movement."
            },
            {
                label: "Silenced",
                value: "The target becomes unable to speak or cast spells with verbal components until the end of its next turn."
            }
        ],

        resource: {
            type: "uses",
            current: 3,
            maximum: 3,
            recovery: "longRest"
        },

        actions: [
            "Special"
        ]

    },


    // ---------- Additional / Magic Item ----------

    {
        id: "dragon-licorice",

        name: "Dragon Licorice",

        category: "additional",

        icon: "🍬",

        description:
            "This magical item grants you one additional use of Dragon Breath per long rest.",

        details: [
            {
                label: "Effect",
                value: "+1 Dragon Breath use per Long Rest."
            }
        ],

        resource: {
            type: "none",
            recovery: null
        },

        actions: [
            "Passive"
        ]

    }

];


// ---------- Ability Resource State ----------

abilities.forEach(ability => {

    if (!ability.resource) {
        return;
    }

    const saved =
        JSON.parse(
            localStorage.getItem(
                `ability-${ability.id}`
            )
        );

    if (saved !== null) {

        ability.resource.current =
            saved;

    }

});


// ---------- Save Ability Resource ----------

function saveAbilityResource(ability) {

    if (
        !ability.resource ||
        ability.resource.type === "none"
    ) {
        return;
    }

    localStorage.setItem(
        `ability-${ability.id}`,
        JSON.stringify(
            ability.resource.current
        )
    );

}


// ---------- Ability Category Names ----------

function getAbilityCategoryName(category) {

    const names = {

        racial: "Racial",

        class: "Class",

        feat: "Feats",

        additional: "Additional"

    };

    return names[category] || category;

}


// ---------- Render Ability Resource ----------

function renderAbilityResource(ability) {

    const resource =
        ability.resource;

    if (
        !resource ||
        resource.type === "none"
    ) {

        return `

            <div class="ability-passive-label">

                Passive

            </div>

        `;

    }


    if (resource.type === "uses") {

        let dots = "";

        for (
            let i = 0;
            i < resource.maximum;
            i++
        ) {

            const filled =
                i < resource.current;

            dots += `

                <button
                    class="ability-dot ${filled ? "filled" : "empty"}"
                    onclick="event.stopPropagation(); toggleAbilityUse('${ability.id}', ${i})"
                    aria-label="${filled ? "Use" : "Restore"} ability use"
                ></button>

            `;

        }


        return `

            <div class="ability-resource uses-resource">

                <div class="ability-resource-dots">

                    ${dots}

                </div>

                <span>
                    ${resource.current} / ${resource.maximum}
                </span>

            </div>

        `;

    }


    if (resource.type === "pool") {

        const percentage =
            resource.maximum > 0
                ? (
                    resource.current /
                    resource.maximum
                ) * 100
                : 0;


        return `

            <div
                class="ability-resource pool-resource"
                onclick="event.stopPropagation()"
            >

                <div class="ability-pool-value">

                    <span>
                        ${resource.current}
                    </span>

                    <span class="ability-pool-divider">
                        /
                    </span>

                    <span class="ability-pool-max">
                        ${resource.maximum}
                        ${resource.unit || ""}
                    </span>

                </div>


                <input
                    class="ability-pool-slider"
                    type="range"
                    min="0"
                    max="${resource.maximum}"
                    value="${resource.current}"
                    style="--pool-progress: ${percentage}%"
                    oninput="setAbilityPool('${ability.id}', this.value)"
                    aria-label="${ability.name} resource"
                >

            </div>

        `;

    }


    return "";

}


// ---------- Render Ability Card ----------

function renderAbilityCard(ability) {

    const categoryName =
        getAbilityCategoryName(
            ability.category
        );


    return `

        <button
            class="ability-card"
            onclick="showAbilityDetails('${ability.id}')"
        >

            <div class="ability-icon">

                ${ability.icon}

            </div>


            <div class="ability-card-content">

                <div class="ability-card-top">

                    <div>

                        <h3>
                            ${ability.name}
                        </h3>

                        <p class="ability-category-label">
                            ${categoryName}
                        </p>

                    </div>

                    <span class="ability-arrow">
                        ›
                    </span>

                </div>


                ${renderAbilityResource(ability)}

            </div>

        </button>

    `;

}


// ---------- Render Ability Section ----------

function renderAbilitySection(
    category,
    abilitiesInCategory
) {

    if (
        abilitiesInCategory.length === 0
    ) {

        return "";

    }


    return `

        <section class="ability-section">

            <div class="ability-section-title">

                <h2>
                    ${getAbilityCategoryName(category)}
                </h2>

            </div>


            <div class="ability-list">

                ${abilitiesInCategory
                    .map(renderAbilityCard)
                    .join("")}

            </div>

        </section>

    `;

}


// ---------- Abilities Page ----------

function showAbilities() {

    const app =
        document.getElementById("app");


    const categories = [
        "racial",
        "class",
        "feat",
        "additional"
    ];


    let html = "";


    categories.forEach(category => {

        const categoryAbilities =
            abilities.filter(
                ability =>
                    ability.category === category
            );


        html += renderAbilitySection(
            category,
            categoryAbilities
        );

    });


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
                Your abilities, feats and special features
            </p>

        </header>


        <main>

            ${html}

        </main>

    `;

}


// ---------- Toggle Ability Use ----------

function toggleAbilityUse(
    abilityId,
    index
) {

    const ability =
        abilities.find(
            ability =>
                ability.id === abilityId
        );


    if (
        !ability ||
        ability.resource.type !== "uses"
    ) {

        return;

    }


    if (index < ability.resource.current) {

        ability.resource.current--;

    } else {

        if (
            ability.resource.current <
            ability.resource.maximum
        ) {

            ability.resource.current++;

        }

    }


    saveAbilityResource(
        ability
    );


    showAbilities();

}


// ---------- Set Ability Pool ----------

function setAbilityPool(
    abilityId,
    value
) {

    const ability =
        abilities.find(
            ability =>
                ability.id === abilityId
        );


    if (
        !ability ||
        ability.resource.type !== "pool"
    ) {

        return;

    }


    ability.resource.current =
        Math.max(
            0,
            Math.min(
                ability.resource.maximum,
                Number(value)
            )
        );


    saveAbilityResource(
        ability
    );


    const slider =
        document.querySelector(
            `.ability-pool-slider[aria-label="${ability.name} resource"]`
        );


    if (slider) {

        const percentage =
            (
                ability.resource.current /
                ability.resource.maximum
            ) * 100;

        slider.style
            .setProperty(
                "--pool-progress",
                `${percentage}%`
            );

    }


    const valueElement =
        document.querySelector(
            ".ability-pool-value span:first-child"
        );


    if (valueElement) {

        valueElement.textContent =
            ability.resource.current;

    }

}


// ---------- Ability Details ----------

function showAbilityDetails(
    abilityId
) {

    const ability =
        abilities.find(
            ability =>
                ability.id === abilityId
        );


    if (!ability) {

        return;

    }


    const app =
        document.getElementById("app");


    const categoryName =
        getAbilityCategoryName(
            ability.category
        );


    let detailsHTML = "";


    if (
        ability.details &&
        ability.details.length > 0
    ) {

        detailsHTML = `

            <div class="ability-details-list">

                ${ability.details
                    .map(detail => `

                        <div class="ability-detail-row">

                            <span>
                                ${detail.label}
                            </span>

                            <strong>
                                ${detail.value}
                            </strong>

                        </div>

                    `)
                    .join("")}

            </div>

        `;

    }


    let actionsHTML = "";


    if (
        ability.actions &&
        ability.actions.length > 0
    ) {

        actionsHTML = `

            <div class="ability-actions">

                <span>
                    ${ability.actions.join(" · ")}
                </span>

            </div>

        `;

    }


    app.innerHTML = `

        <header class="app-header">

            <button
                class="back-button"
                onclick="showAbilities()"
            >
                ← Abilities
            </button>

            <h1>
                ${ability.icon}
                ${ability.name}
            </h1>

            <p>
                ${categoryName}
            </p>

        </header>


        <main>

            <section class="ability-details">

                ${renderAbilityResource(ability)}


                ${actionsHTML}


                <div class="ability-description">

                    <h2>
                        Description
                    </h2>

                    <p>
                        ${ability.description}
                    </p>

                </div>


                ${detailsHTML}

            </section>

        </main>

    `;

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

        button.textContent =
            "ON";

        button.classList.add(
            "active"
        );

    } else {

        button.textContent =
            "OFF";

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


function toggleCondition(
    checkbox
) {

    if (checkbox.checked) {

        if (
            !conditions.includes(
                checkbox.value
            )
        ) {

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


    if (
        !button ||
        !container
    ) {

        return;

    }


    container.innerHTML = "";


    if (
        conditions.length === 0
    ) {

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


    conditions.forEach(
        condition => {

            const badge =
                document.createElement(
                    "span"
                );


            badge.className =
                "condition-badge";


            badge.textContent =
                condition;


            container.appendChild(
                badge
            );

        }
    );

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


function setHPFromSlider(
    value
) {

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


function changeHP(
    amount
) {

    currentHP += amount;


    if (
        currentHP < 0
    ) {

        currentHP = 0;

    }


    if (
        currentHP > maximumHP
    ) {

        currentHP =
            maximumHP;

    }


    updateHP();

}


function updateHP() {

    const hp =
        document.getElementById(
            "current-hp"
        );


    if (hp) {

        hp.textContent =
            currentHP;

    }


    const slider =
        document.getElementById(
            "hp-slider"
        );


    if (slider) {

        slider.value =
            currentHP;

    }

}


// ========================================
// HIT DICE
// ========================================


let currentHitDice = 5;

const maximumHitDice = 5;


function changeHitDice(
    amount
) {

    currentHitDice += amount;


    if (
        currentHitDice < 0
    ) {

        currentHitDice = 0;

    }


    if (
        currentHitDice > maximumHitDice
    ) {

        currentHitDice =
            maximumHitDice;

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


function toggleDeathSave(
    type,
    index
) {

    if (
        type === "success"
    ) {

        deathSaves.successes =
            deathSaves.successes ===
            index + 1

                ? index

                : index + 1;

    }


    if (
        type === "failure"
    ) {

        deathSaves.failures =
            deathSaves.failures ===
            index + 1

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


    successDots.forEach(
        (dot, index) => {

            dot.classList.toggle(
                "active",
                index <
                deathSaves.successes
            );

        }
    );


    failureDots.forEach(
        (dot, index) => {

            dot.classList.toggle(
                "active",
                index <
                deathSaves.failures
            );

        }
    );

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
        document.createElement(
            "div"
        );


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


    document.body.appendChild(
        menu
    );

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

    currentHP =
        maximumHP;


    resetDeathSaves();


    concentrating =
        false;


    currentHitDice =
        Math.min(
            maximumHitDice,
            currentHitDice +
            Math.ceil(
                maximumHitDice / 2
            )
        );


    for (
        let level = 1;
        level <= 5;
        level++
    ) {

        spellSlots[level].current =
            spellSlots[level].maximum;

    }


    saveSpellSlots();


    // Reset ability resources
    abilities.forEach(
        ability => {

            if (
                ability.resource &&
                ability.resource.recovery ===
                "longRest"
            ) {

                ability.resource.current =
                    ability.resource.maximum;

                saveAbilityResource(
                    ability
                );

            }

        }
    );


    closeRestMenu();


    updateHP();

    updateHitDice();


    const concentrationButton =
        document.getElementById(
            "concentration-toggle"
        );


    if (
        concentrationButton
    ) {

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


    let diceButtons =
        "";


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
                        ${dice}
                        Hit
                        ${dice === 1
                            ? "Die"
                            : "Dice"}
                    </strong>

                    <small>
                        Spend
                        ${dice}
                        ${dice === 1
                            ? "die"
                            : "dice"}
                    </small>

                </div>

            </button>

        `;

    }


    if (
        currentHitDice === 0
    ) {

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
            You have
            <strong>
                ${currentHitDice}
            </strong>
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

function selectShortRestDice(
    diceSpent
) {

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
            ${diceSpent === 1
                ? "Hit Die"
                : "Hit Dice"}.
        </p>


        <div class="rest-roll-message">

            <span>
                🎲
            </span>

            <strong>
                Roll your Hit Dice
            </strong>

            <small>
                Roll
                ${diceSpent}
                physical
                ${diceSpent === 1
                    ? "die"
                    : "dice"},
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

function confirmShortRest(
    diceSpent
) {

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
        !Number.isFinite(
            hpRecovered
        ) ||
        hpRecovered < 0
    ) {

        input.focus();

        return;

    }


    currentHitDice -=
        diceSpent;


    currentHP =
        Math.min(
            maximumHP,
            currentHP +
            hpRecovered
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

                }

                else if (
                    text.includes(
                        "abilit"
                    )
                ) {

                    openSection(
                        "abilities"
                    );

                }

                else if (
                    text.includes(
                        "inventory"
                    )
                ) {

                    openSection(
                        "inventory"
                    );

                }

                else if (
                    text.includes(
                        "rest"
                    )
                ) {

                    openSection(
                        "rest"
                    );

                }

                else {

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

const currency = {

    copper: 30,

    silver: 11,

    gold: 24,

    platinum: 3

};


// ---------- Inventory Items ----------

const inventoryItems = [

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

        tags: []

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

        linkedAbility: "dragons-judgment",

        tags: []

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

        tags: []

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

        tags: []

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


// ---------- Inventory Categories ----------

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


// ---------- Miscellaneous Tags ----------

const inventoryTags = [

    "Consumable",

    "Potion",

    "Treasure",

    "Common",

    "Quest Item",

    "Spell Component",

    "Accessory",

    "Magical",

    "Material",

    "Utility"

];


// ---------- Currency Conversion ----------

function getCurrencyInGold() {

    return (

        currency.copper / 100

        +

        currency.silver / 10

        +

        currency.gold

        +

        currency.platinum * 10

    );

}


// ---------- Format Gold Value ----------

function formatGoldValue(value) {

    return value
        .toFixed(2)
        .replace(
            ".00",
            ""
        );

}


// ========================================
// INVENTORY PAGE
// ========================================


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

            <!-- ================================ -->
            <!-- INVENTORY AREAS -->
            <!-- ================================ -->

            <section class="inventory-navigation">

                <button
                    class="inventory-navigation-button"
                    onclick="showInventorySection('equipment')"
                >

                    <div class="inventory-navigation-icon">
                        ⚔️
                    </div>

                    <div class="inventory-navigation-info">

                        <strong>
                            Equipment
                        </strong>

                        <span>
                            Armor, weapons and equipped items
                        </span>

                    </div>

                    <span class="inventory-arrow">
                        ›
                    </span>

                </button>


                <button
                    class="inventory-navigation-button"
                    onclick="showInventorySection('miscellaneous')"
                >

                    <div class="inventory-navigation-icon">
                        📦
                    </div>

                    <div class="inventory-navigation-info">

                        <strong>
                            Miscellaneous
                        </strong>

                        <span>
                            Consumables, treasures and other items
                        </span>

                    </div>

                    <span class="inventory-arrow">
                        ›
                    </span>

                </button>

            </section>


            <!-- ================================ -->
            <!-- COIN POUCH -->
            <!-- ================================ -->

            <section class="currency-section">

                <button
                    class="currency-summary"
                    onclick="showCurrencyDetails()"
                >

                    <div class="currency-summary-icon">
                        💰
                    </div>


                    <div class="currency-summary-info">

                        <span>
                            Coin Pouch
                        </span>

                        <div class="currency-physical">

                            ${currency.copper} CP ·
                            ${currency.silver} SP ·
                            ${currency.gold} GP ·
                            ${currency.platinum} PP

                        </div>

                        <strong>
                            Total value:
                            ${formatGoldValue(
                                getCurrencyInGold()
                            )}
                            GP
                        </strong>

                    </div>


                    <span class="inventory-arrow">
                        ›
                    </span>

                </button>

            </section>

        </main>
    `;

}


// ========================================
// INVENTORY SUB-SECTIONS
// ========================================


function showInventorySection(section) {

    const app =
        document.getElementById(
            "app"
        );


    let title = "";
    let content = "";


    if (section === "equipment") {

        title = "⚔️ Equipment";
        content = renderEquipment();

    }


    if (section === "miscellaneous") {

        title = "📦 Miscellaneous";
        content = renderMiscellaneous();

    }


    app.innerHTML = `

        <header class="app-header">

            <button
                class="back-button"
                onclick="showInventory()"
            >
                ← Inventory
            </button>


            <h1>
                ${title}
            </h1>

        </header>


        <main>

            ${content}

        </main>

    `;

}


// ========================================
// EQUIPMENT
// ========================================


function renderEquipment() {

    let html = "";


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

                <div class="inventory-category">

                    <h3>

                        ${category.icon}

                        ${category.name}

                    </h3>


                    <div class="inventory-list">

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


// ========================================
// MISCELLANEOUS
// ========================================


function renderMiscellaneous() {

    const items =
        inventoryItems.filter(
            item =>
                item.location ===
                "miscellaneous"
        );


    if (
        items.length === 0
    ) {

        return `

            <p class="empty-message">

                No miscellaneous items.

            </p>

        `;

    }


    return `

        <div class="inventory-list">

            ${items
                .map(
                    renderInventoryItem
                )
                .join("")}

        </div>

    `;

}


// ========================================
// INVENTORY ITEM CARD
// ========================================


function renderInventoryItem(
    item
) {

    const weightText =
        item.weight !== null

            ? `${item.weight} kg`

            : "Weight not set";


    const quantityText =
        item.quantity > 1

            ? `× ${item.quantity}`

            : "";


    const equippedText =
        item.equipped

            ? "Equipped"

            : "";


    return `

        <button
            class="inventory-item-card"
            onclick="showInventoryItem('${item.id}')"
        >


            <div class="inventory-item-icon">

                ${item.icon}

            </div>


            <div class="inventory-item-info">


                <div class="inventory-item-top">

                    <h3>
                        ${item.name}
                    </h3>


                    <span class="inventory-arrow">
                        ›
                    </span>

                </div>


                <div class="inventory-item-meta">

                    ${quantityText}


                    ${equippedText}


                    ${
                        item.magical
                            ? "✨ Magical"
                            : ""
                    }

                </div>


                ${
                    item.tags.length > 0

                        ? `

                            <div class="inventory-tags">

                                ${item.tags
                                    .map(
                                        tag => `

                                            <span
                                                class="inventory-tag"
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


                <span class="inventory-weight">

                    ⚖️ ${weightText}

                </span>


            </div>


        </button>

    `;

}


// ========================================
// ITEM DETAILS
// ========================================


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


    const app =
        document.getElementById(
            "app"
        );


    const locationName =
        item.location ===
            "equipment"

            ? "Equipment"

            : "Miscellaneous";


    let propertiesHTML = "";


    if (
        item.properties &&
        item.properties.length > 0
    ) {

        propertiesHTML = `

            <div class="inventory-details-properties">

                <h2>
                    Properties
                </h2>


                <div>

                    ${item.properties
                        .map(
                            property => `

                                <span
                                    class="inventory-property"
                                >
                                    ${property}
                                </span>

                            `
                        )
                        .join("")}

                </div>

            </div>

        `;

    }


    let tagsHTML = "";


    if (
        item.tags &&
        item.tags.length > 0
    ) {

        tagsHTML = `

            <div class="inventory-details-properties">

                <h2>
                    Tags
                </h2>


                <div>

                    ${item.tags
                        .map(
                            tag => `

                                <span
                                    class="inventory-tag"
                                >
                                    ${tag}
                                </span>

                            `
                        )
                        .join("")}

                </div>

            </div>

        `;

    }


    let linkedAbilityHTML = "";


    if (
        item.linkedAbility
    ) {

        const ability =
            abilities.find(
                ability =>
                    ability.id ===
                    item.linkedAbility
            );


        if (ability) {

            linkedAbilityHTML = `

                <button
                    class="linked-ability-card"
                    onclick="showAbilityDetails('${ability.id}')"
                >

                    <div>

                        <span>
                            Linked Ability
                        </span>

                        <strong>
                            ${ability.icon}
                            ${ability.name}
                        </strong>

                    </div>


                    <span>
                        ›
                    </span>

                </button>

            `;

        }

    }


    app.innerHTML = `

        <header class="app-header">


            <button
                class="back-button"
                onclick="showInventory()"
            >
                ← Inventory
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


            <section class="inventory-details">


                <div class="inventory-detail-summary">


                    <div class="inventory-detail-stat">

                        <span>
                            QUANTITY
                        </span>

                        <strong>
                            ${item.quantity}
                        </strong>

                    </div>


                    <div class="inventory-detail-stat">

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


                    <div class="inventory-detail-stat">

                        <span>
                            STATUS
                        </span>

                        <strong>

                            ${
                                item.equipped
                                    ? "Equipped"
                                    : "Carried"
                            }

                        </strong>

                    </div>


                </div>


                <div class="inventory-description">

                    <h2>
                        Description
                    </h2>


                    <p>
                        ${item.description}
                    </p>

                </div>


                ${propertiesHTML}


                ${tagsHTML}


                ${linkedAbilityHTML}


                ${
                    item.location ===
                    "equipment"

                        ? `

                            <button
                                class="inventory-action-button"
                                onclick="toggleEquipment('${item.id}')"
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


            </section>


        </main>

    `;

}


// ========================================
// EQUIP / UNEQUIP
// ========================================


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


    item.equipped =
        !item.equipped;


    if (
        item.equipped
    ) {

        item.location =
            "equipment";

    }


    else {

        item.location =
            "miscellaneous";

    }


    showInventory();

}


// ========================================
// CURRENCY DETAILS
// ========================================


function showCurrencyDetails() {

    const app =
        document.getElementById(
            "app"
        );


    app.innerHTML = `

        <header class="app-header">


            <button
                class="back-button"
                onclick="showInventory()"
            >
                ← Inventory
            </button>


            <h1>
                💰 Coin Pouch
            </h1>


            <p>
                Your physical currency
            </p>


        </header>


        <main>


            <section class="currency-details">


                <div class="currency-total-card">

                    <span>
                        Total Value
                    </span>


                    <strong>
                        ${formatGoldValue(
                            getCurrencyInGold()
                        )}
                        GP
                    </strong>

                </div>


                ${renderCurrencyRow(
                    "copper",
                    "🟤",
                    "Copper",
                    "CP"
                )}


                ${renderCurrencyRow(
                    "silver",
                    "⚪",
                    "Silver",
                    "SP"
                )}


                ${renderCurrencyRow(
                    "gold",
                    "🟡",
                    "Gold",
                    "GP"
                )}


                ${renderCurrencyRow(
                    "platinum",
                    "⚪",
                    "Platinum",
                    "PP"
                )}


            </section>


        </main>

    `;

}


// ---------- Currency Row ----------

function renderCurrencyRow(
    type,
    icon,
    name,
    abbreviation
) {

    return `

        <div class="currency-row">


            <div class="currency-row-name">

                <span>
                    ${icon}
                </span>


                <div>

                    <strong>
                        ${name}
                    </strong>

                    <small>
                        ${abbreviation}
                    </small>

                </div>

            </div>


            <div class="currency-controls">


                <button
                    class="currency-minus"
                    onclick="changeCurrency('${type}', -1)"
                >
                    −
                </button>


                <input
                    class="currency-input"
                    type="number"
                    min="0"
                    value="${currency[type]}"
                    onchange="setCurrency('${type}', this.value)"
                >


                <button
                    class="currency-plus"
                    onclick="changeCurrency('${type}', 1)"
                >
                    +
                </button>


            </div>


        </div>

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

        currency[type] = 0;

    }


    showCurrencyDetails();

}


// ---------- Set Currency ----------

function setCurrency(
    type,
    value
) {

    const amount =
        Number(value);


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


    showCurrencyDetails();

}

// ---------- Initialize ----------

initializeHome();
