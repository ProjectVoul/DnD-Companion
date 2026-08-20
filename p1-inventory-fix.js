/* P1 inventory form fix
 * The current form has a few id attributes containing whitespace/newlines.
 * That makes getElementById("inventory-form-quantity"), etc. return null and
 * the existing save handler stops before creating the item. This layer keeps
 * the existing UI intact and reads those fields by a stable substring match.
 */
(function () {
    "use strict";

    function field(name) {
        return document.querySelector(`[id*="${name}"]`);
    }

    window.saveInventoryItemForm = function (existingId = "") {
        const nameField = field("inventory-form-name");
        const iconField = field("inventory-form-icon");
        const descriptionField = field("inventory-form-description");
        const quantityField = field("inventory-form-quantity");
        const weightField = field("inventory-form-weight");
        const propertiesField = field("inventory-form-properties");
        const magicalField = field("inventory-form-magical");

        if (!nameField || !iconField || !descriptionField ||
            !quantityField || !weightField || !propertiesField || !magicalField) {
            console.error("Inventory form fields could not be found.");
            alert("Unable to read the inventory form. Please try again.");
            return;
        }

        const name = nameField.value.trim();
        if (!name) {
            alert("Please enter an item name.");
            return;
        }

        const quantity = Number(quantityField.value);
        if (!Number.isFinite(quantity) || quantity < 0) {
            alert("Quantity must be 0 or greater.");
            return;
        }

        const weightValue = weightField.value;
        const weight = weightValue === "" ? null : Number(weightValue);
        if (weight !== null && (!Number.isFinite(weight) || weight < 0)) {
            alert("Weight must be 0 or greater.");
            return;
        }

        const tags = Array.from(
            document.querySelectorAll(".inventory-tag-checkbox:checked")
        ).map(checkbox => checkbox.value);

        const properties = propertiesField.value
            .split(",")
            .map(property => property.trim())
            .filter(Boolean);

        const equipmentCategory = getEquipmentCategoryFromTags({ tags });
        const isEquipmentItem = equipmentCategory !== null;
        const selectedCategory = "miscellaneous";

        if (existingId) {
            const item = inventoryItems.find(item => item.id === existingId);
            if (!item) return;

            item.name = name;
            item.icon = iconField.value || "📦";
            item.description = descriptionField.value.trim();
            item.quantity = Math.floor(quantity);
            item.weight = weight;
            item.properties = properties;
            item.magical = magicalField.checked;
            item.tags = tags;

            if (item.equipped) {
                if (isEquipmentItem) {
                    item.category = equipmentCategory;
                    item.location = "equipment";
                } else {
                    item.equipped = false;
                    item.location = "miscellaneous";
                    item.category = "miscellaneous";
                }
            } else {
                item.category = isEquipmentItem
                    ? equipmentCategory
                    : selectedCategory;
                item.location = isEquipmentItem
                    ? "equipment"
                    : "miscellaneous";
            }

            saveInventory();
            closeInventoryForm();
            showInventorySection(item.location);
            return;
        }

        const item = {
            id: "item-" + Date.now(),
            name,
            category: isEquipmentItem ? equipmentCategory : selectedCategory,
            location: isEquipmentItem ? "equipment" : "miscellaneous",
            icon: iconField.value || "📦",
            description: descriptionField.value.trim(),
            quantity: Math.floor(quantity),
            weight,
            equipped: false,
            magical: magicalField.checked,
            properties,
            tags,
            originalLocation: "miscellaneous"
        };

        inventoryItems.push(item);
        saveInventory();
        closeInventoryForm();
        showInventorySection(item.location);
    };
})();
