// ========================================
// D&D COMPANION
// Main Application Logic
// ========================================


// ---------- Sample Spell Data ----------

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


// ---------- Spell Slots ----------

const spellSlots = {
    1: { current: 4, maximum: 4 },
    2: { current: 3, maximum: 3 },
    3: { current: 2, maximum: 2 },
    4: { current: 1, maximum: 1 },
    5: { current: 0, maximum: 0 }
};


// ---------- Menu Buttons ----------

const menuButtons = document.querySelectorAll(".menu-button");


// ---------- Open a Section ----------

function openSection(section) {

    if (section === "spells") {
        showSpells();
        return;
    }

    alert("This section is coming soon.");
}


// ---------- Spells Page ----------

function showSpells() {

    const app = document.getElementById("app");

    app.innerHTML = `
    
        <header class="app-header">
            <button class="back-button" onclick="goHome()">← Back</button>

            <h1>Spells</h1>
            <p>Your spellbook and prepared spells</p>
        </header>


        <main>

            <section class="spell-tabs">

                <button class="spell-tab active">
                    ⭐ Prepared
                </button>

                <button class="spell-tab">
                    📚 Spellbook
                </button>

            </section>


            <section class="spell-slots">

                <h2>Spell Slots</h2>

                ${renderSpellSlots()}

            </section>


            <section class="prepared-section">

                <h2>Prepared Spells</h2>

                <div class="spell-list">

                    ${renderPreparedSpells()}

                </div>

            </section>

        </main>
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

                    ${renderSlotDots(slot)}

                </div>

                <span class="slot-count">
                    ${slot.current} / ${slot.maximum}
                </span>

            </div>
        `;
    }

    return html;
}


// ---------- Render Slot Dots ----------

function renderSlotDots(slot) {

    let html = "";

    for (let i = 0; i < slot.maximum; i++) {

        if (i < slot.current) {
            html += `<span class="slot-dot filled"></span>`;
        } else {
            html += `<span class="slot-dot empty"></span>`;
        }

    }

    return html;
}


// ---------- Render Prepared Spells ----------

function renderPreparedSpells() {

    const preparedSpells = spells.filter(spell => spell.prepared);

    return preparedSpells.map(spell => `

        <button
            class="spell-card"
            onclick="showSpellDetails('${spell.name}')"
        >

            <div class="spell-icon">
                ✨
            </div>

            <div class="spell-info">

                <h3>${spell.name}</h3>

                <p>
                    ${spell.level}${getOrdinal(spell.level)} level
                    · ${spell.duration}
                </p>

            </div>

            <span class="spell-arrow">›</span>

        </button>

    `).join("");
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
                onclick="showSpells()"
            >
                ← Spells
            </button>

            <h1>${spell.name}</h1>

            <p>
                ${spell.level}${getOrdinal(spell.level)} level
                · ${spell.school}
            </p>

        </header>


        <main>

            <section class="spell-details">

                <div class="spell-detail-grid">

                    <div>
                        <span>CASTING TIME</span>
                        <strong>${spell.castingTime}</strong>
                    </div>

                    <div>
                        <span>RANGE</span>
                        <strong>${spell.range}</strong>
                    </div>

                    <div>
                        <span>DURATION</span>
                        <strong>${spell.duration}</strong>
                    </div>

                    <div>
                        <span>COMPONENTS</span>
                        <strong>${spell.components}</strong>
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


// ---------- Menu Events ----------

menuButtons.forEach(button => {

    button.addEventListener("click", () => {

        const text = button.innerText.toLowerCase();

        if (text.includes("spells")) {
            openSection("spells");
        } else {
            alert("This section is coming soon.");
        }

    });

});
