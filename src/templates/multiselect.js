import { flag } from "../scripts/constants/flags.js";
import { locale } from "../scripts/constants/locale.js";
import { Logger } from "../scripts/utils/logger.js";
import { generateTagColor } from "../scripts/utils/tag-color.js"

export function createMultiSelect({
    initial = [],
    available = []
} = {}) {
    const root = document.createElement("div");
    root.classList.add("tag-input");

    const tagList = document.createElement("div");
    tagList.classList.add("tag-list");

    const input = document.createElement("input");
    input.type = "text";
    input.setAttribute("list", "tags");
    input.placeholder = game.i18n.localize(locale.multiselectAdd); //"Add tag…";

    const dropdown = document.createElement("datalist");
    dropdown.id = "tags";
    dropdown.classList.add("tag-dropdown");

    root.append(tagList, input, dropdown);

    let selected = [...initial];
    let availableTags = [...available];

    function renderTags() {
        tagList.innerHTML = "";

        for (const tag of selected) {
            const tagInput = document.createElement('input');
            tagInput.hidden = true;
            tagInput.name = `${flag.prefabTags}`;
            tagInput.value = tag.value;

            const chip = document.createElement("span");
            chip.classList.add("tag-chip");
            chip.textContent = tag.value;
            chip.style.setProperty('--tag-color', tag.color);

            chip.addEventListener("click", () => {
                selected = selected.filter(t => t.value !== tag.value);
                render();
            });

            tagList.append(tagInput, chip);
        }
    }

    function renderDropdown() {
        const query = input.value.trim().toLowerCase();
        dropdown.innerHTML = "";

        const matches = availableTags.filter(tag =>
            tag.value.toLowerCase().includes(query) &&
            !selected.filter(s => s.value.toLowerCase() === tag.value.toLowerCase()).length
        );

        for (const tag of matches) {
            const option = document.createElement("option");
            option.textContent = tag.value;

            option.addEventListener("click", () => {
                selected.push(tag);
                input.value = "";
                render();
            });

            dropdown.appendChild(option);
        }
    }

    function render() {
        renderTags();
        renderDropdown();
    }

    input.addEventListener("input", () => {
        renderDropdown();
    });

    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            const value = input.value.trim();
            if (!value || selected.map(s => s.value).includes(value)) return;

            const color = generateTagColor(value);
            const tag = { 
                value: value,
                color: color
            };
            selected.push(tag);
            input.value = "";
            render();
        }
    });

    render();

    return {
        element: root,
        getValue: () => [...selected],
        setValue: v => {
            selected = [...v];
            render();
        }
    };
}
