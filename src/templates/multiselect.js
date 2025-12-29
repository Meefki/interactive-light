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
  input.placeholder = "Add tag…";

  const dropdown = document.createElement("datalist");
  dropdown.id = "tags";
  dropdown.classList.add("tag-dropdown");

  root.append(tagList, input, dropdown);

  let selected = [...initial];
  let availableTags = [...available];

  function renderTags() {
    tagList.innerHTML = "";

    for (const tag of selected) {
      const chip = document.createElement("span");
      chip.classList.add("tag-chip");
      chip.textContent = tag;

      chip.addEventListener("click", () => {
        selected = selected.filter(t => t !== tag);
        render();
      });

      tagList.appendChild(chip);
    }
  }

  function renderDropdown() {
    const query = input.value.trim().toLowerCase();
    dropdown.innerHTML = "";

    if (!query) return;

    const matches = availableTags.filter(tag =>
      tag.toLowerCase().includes(query) &&
      !selected.includes(tag)
    );

    for (const tag of matches) {
      const li = document.createElement("option");
      li.textContent = tag;

      li.addEventListener("click", () => {
        selected.push(tag);
        input.value = "";
        render();
      });

      dropdown.appendChild(li);
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
      if (!value || selected.includes(value)) return;

      selected.push(value);
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
