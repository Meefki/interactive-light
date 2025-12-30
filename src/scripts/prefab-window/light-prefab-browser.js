import { flag } from "../constants/flags.js";
import { JournalManager } from "../journal/journal-manager.js";
import { Logger } from "../utils/logger.js";

const {
    ApplicationV2,
    HandlebarsApplicationMixin
} = foundry.applications.api;

export class LightPrefabBrowserV2 extends HandlebarsApplicationMixin(
    class extends ApplicationV2 { }
) {
    static DEFAULT_OPTIONS = {
        id: "light-prefabs",
        form: {
            submitOnChange: true
        },
        actions: {
            selectPrefab: LightPrefabBrowserV2.#onPrefabClick,
            deletePrefab: LightPrefabBrowserV2.#deletePrefab,
            selectTag: LightPrefabBrowserV2.#onTagClick,
            clearFilters: LightPrefabBrowserV2.#clearFilters
        },
        classes: ["prefab-browser-window"],
        position: {
            height: 675,
            width: 502,
            left: 105,
            top: 60
        },
        window: {
            resizable: true,
            title: "INTERACTIVE_LIGHT.Menu.Prefabs.Browser.Title",
        }
    };

    static PARTS = {
        header: { template: "modules/interactive-light/dist/templates/light-prefab-browser/header.hbs" },
        headerTags: { template: "modules/interactive-light/dist/templates/light-prefab-browser/header-tags.hbs" },
        content: { template: "modules/interactive-light/dist/templates/light-prefab-browser/content.hbs" },
        footer: { template: "modules/interactive-light/dist/templates/light-prefab-browser/footer.hbs" },
    };

    __search = "";

    __prefabs = [];
    __filteredPrefabs = [];
    __activePrefab = "";

    __allTags = [];
    __activeTags = [];

    _onRender(context, options) {
        super._onRender(context, options);

        const scroller = this.element?.querySelector(".prefab-container");
        if (scroller && this.__scrollTop) {
            scroller.scrollTop = this.__scrollTop;
        }

        const searchInput = this.element?.querySelector('input[data-action="search"]');
        if (searchInput) {
            searchInput.addEventListener("input", (event) => {
                this.#search(event);
            });
        }
    }

    async _prepareContext(context, options) {
        const _context = {
            ...await super._prepareContext(context)
        };
        this.__prefabs = await this.__getPrefabs() ?? [];
        this.__allTags = await this.#getAllTags() ?? [];
        return _context;
    }

    async _preparePartContext(partId, context, options) {
        context = await super._preparePartContext(partId, context, options);
        switch (partId) {
            case "header": return await this._prepareHeaderContext(context, options);
            case "headerTags": return await this._prepareHeaderTagsContext(context, options);
            case "content": return await this._prepareContentContext(context, options);
        }
        return context;
    }

    async _prepareHeaderContext(context, options) {
        context.search = this.__search;
        return context;
    }

    async _prepareHeaderTagsContext(context, options) {
        context.allTags = this.__allTags = await this.#getAllTags() ?? [];
        context.activeTags = this.__activeTags;
        return context;
    }

    async _prepareContentContext(context, options) {
        context.prefabs = this.__filterPrefabs(this.__prefabs ?? [], this.__search, this.__activeTags);
        context.activeTags = this.__activeTags;
        context.selectedPrefabId = this.__activePrefab ?? "";

        if (!this.__filteredPrefabs.map(fp => fp.id).includes(this.__activePrefab)) this.__activePrefab = "";
        return context;
    }

    static #onPrefabClick(event, target) {
        if (event.altKey) {
            event.preventDefault();
            this.__openSettings(target);
        }
        else this.__selectPrefab(target);
    }

    static __openSettings(target) {
        // TODO: ...
        throw "Method Not Implemented";
    }

    __selectPrefab(target) {
        if (this.__activePrefab === target.dataset.id) {
            this.__activePrefab = null;
            target.checked = false;
        } else {
            this.__activePrefab = target.dataset.id;
        }
    }

    static async #deletePrefab(event, target) {
        if (!this.__activePrefab) return;
        await JournalManager.deletePrefab(this.__activePrefab);
        this.__activePrefab = null;
        this.render({ force: true, parts: ["headerTags", "content"] });
    }

    static #onTagClick(event, target) {
        if (!this.__activeTags) this.__activeTags = [];

        const app = this;

        const scroller = app.element?.querySelector(".prefab-container");
        if (scroller) {
            app.__scrollTop = scroller.scrollTop;
        }

        if (this.__activeTags.filter(at => at.value === target.dataset.id).length) {
            // exists
            this.__activeTags = this.__activeTags.filter(at => at.value !== target.dataset.id)
        }
        else {
            // new
            try {
                const tag = this.__allTags.filter(at => at.value === target.dataset.id)[0];
                this.__activeTags.push(tag);
            } catch (e) {
                Logger.error("#onTagClick:", "Unable to retrieve and add tag to the filter");
            }
        }

        this.render({ force: true, parts: ["headerTags", "content"] });
    }

    #search(event) {
        const value = event?.target?.value ?? "";
        if (this.__search === value) return;

        this.__search = value
        this.render({ force: true, parts: ["headerTags", "content"] });
    }

    static #clearFilters(event, target) {
        this.__search = "";
        this.__activeTags = [];

        this.render({ force: true, parts: ["headerTags", "content"] });
    }

    static #getPrefabById(prefabId) {
        // TODO: ...
        throw "Method Not Implemented";
    }

    async #getAllTags() {
        const tags = await JournalManager.getAllTags();
        return tags;
    }

    async __getPrefabs() {
        const prefabs = Object.values(await JournalManager.getPrefabs());
        const prefabViews = await Promise.all(prefabs.map(async (p) => {
            const tags = await JournalManager.getPrefabTags(null, false, p.light.document);
            const prefabView = {
                id: p.id,
                preview: p.tile?.document?.texture?.src ?? "",
                name: p.name,
                tags: tags
            }
            return prefabView;
        }));

        return prefabViews;
    }

    __filterPrefabs(prefabs, textSearch, tags) {
        this.__filteredPrefabs = [...prefabs];
        if (textSearch && textSearch.length) {
            const q = textSearch.trim().toLowerCase();
            if (q) {
                this.__filteredPrefabs = this.__filteredPrefabs.filter(p => {
                    const words = q.split(/\s+/);
                    return words.every(word => p.name.toLowerCase().includes(word));
                });
            }
        }

        if (tags && tags.length) {
            const tagsValueSet = new Set(tags.map(t => t.value));
            this.__filteredPrefabs = this.__filteredPrefabs.filter(p => p.tags.some(t => tagsValueSet.has(t.value)));
        }

        return this.__filteredPrefabs;
    }

    #mockPrefabs() {
        return [
            {
                id: 'light-1',
                preview: 'assets/ForgottenAdventures/!Core_Settlements/Lightsources/Campfires_and_Firepits/Campfire_Embers_C1_1x1.webp',
                name: 'Campfire Embers C1',
                tags: [
                    { value: 'white', color: 'White' },
                    { value: 'green', color: 'Green' },
                    { value: 'black', color: 'Black' },
                    { value: 'red', color: 'Red' },
                    { value: 'cyan', color: 'Cyan' },
                    { value: 'dark golden rod', color: 'DarkGoldenRod' },
                    { value: 'lemon', color: 'LemonChiffon' },
                    { value: 'blue', color: 'LightSkyBlue' },
                    { value: 'gray', color: 'LightSlateGrey' }
                ]
            },
            {
                id: 'light-2',
                preview: 'assets/ForgottenAdventures/!Core_Settlements/Lightsources/Campfires_and_Firepits/Campfire_Ash_C1_2x2.webp',
                name: 'Campfire Ash C1',
                tags: [{ value: 'white', color: 'White' },
                { value: 'green', color: 'Green' },
                { value: 'black', color: 'Black' }]
            },
            {
                id: 'light-3',
                preview: 'assets/ForgottenAdventures/!Core_Settlements/Lightsources/Campfires_and_Firepits/Campfire_Stone_Redrock_A1_1x1.webp',
                name: 'Campfire Stone Redrock A1',
                tags: [{ value: 'cyan', color: 'Cyan' },
                { value: 'dark golden rod', color: 'DarkGoldenRod' },
                { value: 'lemon', color: 'LemonChiffon' }]
            },
            {
                id: 'light-4',
                preview: 'assets/ForgottenAdventures/!Core_Settlements/Lightsources/Campfires_and_Firepits/Campfire_Stone_Redrock_A1_Lit_1x1.webp',
                name: 'Campfire Stone Redrock A1 Lit',
                tags: [{ value: 'dark golden rod', color: 'DarkGoldenRod' },
                { value: 'lemon', color: 'LemonChiffon' },
                { value: 'blue', color: 'LightSkyBlue' },
                { value: 'gray', color: 'LightSlateGrey' }]
            },
            {
                id: 'light-5',
                preview: 'assets/ForgottenAdventures/!Core_Settlements/Lightsources/Campfires_and_Firepits/Campfire_Wood_Ashen_Lit_A1_1x1.webp',
                name: 'Campfire Wood Ashen Lit A1',
                tags: [{ value: 'gray', color: 'LightSlateGrey' },
                { value: 'gold', color: 'PaleGoldenRod' }]
            },
            {
                id: 'light-6',
                preview: 'assets/ForgottenAdventures/!Core_Settlements/Lightsources/Lamps/Lamp_Street_Double_Metal_Brass_C_1x1.webp',
                name: 'Lamp Street Double Metal Brass C',
                tags: [{ value: 'red', color: 'Red' },
                { value: 'cyan', color: 'Cyan' },
                { value: 'dark golden rod', color: 'DarkGoldenRod' }]
            },
            {
                id: 'light-7',
                preview: 'assets/ForgottenAdventures/!Core_Settlements/Lightsources/Lamps/Lamp_Street_Double_Metal_Brass_J_1x1.webp',
                name: 'Lamp Street Double Metal Brass J',
                tags: [{ value: 'lemon', color: 'LemonChiffon' },
                { value: 'blue', color: 'LightSkyBlue' },
                { value: 'gray', color: 'LightSlateGrey' }]
            },
            {
                id: 'light-8',
                preview: 'assets/ForgottenAdventures/!Core_Settlements/Lightsources/Lamps/Mage_Light_Red_1x1.webp',
                name: 'Mag Light Red',
                tags: [{ value: 'blue', color: 'LightSkyBlue' }]
            },
            {
                id: 'light-9',
                preview: 'assets/ForgottenAdventures/!Core_Settlements/Lightsources/Lamps/Mage_Light_Blue_1x1.webp',
                name: 'Mage Light Blue 1x1',
                tags: [{ value: 'blue', color: 'LightSkyBlue' },
                { value: 'gray', color: 'LightSlateGrey' }]
            },
            {
                id: 'light-10',
                preview: 'assets/ForgottenAdventures/!Core_Settlements/Lightsources/Torches_and_Sconces/Sconce_B_1x1.webp',
                name: 'Sconce B 1x1',
                tags: [{ value: 'red', color: 'Red' },
                { value: 'cyan', color: 'Cyan' },
                { value: 'dark golden rod', color: 'DarkGoldenRod' }]
            }
        ]
    }
}