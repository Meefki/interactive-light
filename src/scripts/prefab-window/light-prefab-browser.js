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
            // search: LightPrefabBrowserV2.#search,
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

    // TODO: separate to header, prefabs-grid and footer
    static PARTS = {
        main: { template: "modules/interactive-light/dist/templates/light-prefab-browser/main.hbs" }
    };

    __prefabs = [];
    __activePrefab = null;
    __search = "";
    __allTags = [];
    __activeTags = [];

    _onRender(context, options) {
        super._onRender(context, options);

        const scroller = this.element?.querySelector(".prefab-container");
        Logger.log("_onRender.scroller:", scroller, "app.__scrollTop:", this.__scrollTop);
        if (scroller && this.__scrollTop) {
            scroller.scrollTop = this.__scrollTop;
        }

        const searchInput = this.element?.querySelector('input[data-action="search"]');
        Logger.log('_onRender.searchInput', searchInput);
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
        _context.prefabs = this.__prefabs = this.__filterPrefabs(this.__getPrefabs() ?? [], this.__search, this.__activeTags);
        _context.allTags = this.__allTags = this.#getAllTags() ?? [];
        _context.search = this.__search;
        Logger.log("_prepareContext.#getAllTags:", this.__allTags);
        Logger.log("LightPrefabBrowserV2.__search:", this.__search);
        _context.activeTags = this.__activeTags;
        return _context;
    }

    static #onPrefabClick(event, target) {
        Logger.log("onPrefabClick:", event, target);
        if (event.altKey) {
            event.preventDefault();
            LightPrefabBrowserV2.#openSettings(target);
        }
        else LightPrefabBrowserV2.#selectPrefab(target);
    }

    static #openSettings(target) {
        Logger.log("openSettings:", target);
        // TODO: ...
        throw "Method Not Implemented";
    }

    static #selectPrefab(target) {
        Logger.log("selectPrefab:", target);
        if (this.__activePrefab === target.dataset.id) {
            this.__activePrefab = null;
            target.checked = false;
        } else {
            this.__activePrefab = target.dataset.id;
        }

        Logger.log("selectPrefab.#activePrefab:", this.__activePrefab);
    }

    static #deletePrefab(event, target) {
        // TODO: ...
    }

    static #onTagClick(event, target) {
        Logger.log("onTagClick:", event, target);
        if (!this.__activeTags) this.__activeTags = [];

        const app = this;

        const scroller = app.element?.querySelector(".prefab-container");
        Logger.log("#onTagClick.app:", app, "scroller:", scroller);
        if (scroller) {
            Logger.log("#onTagClick.scroller.scrollTop:", scroller.scrollTop);
            app.__scrollTop = scroller.scrollTop;
        }

        if (this.__activeTags.filter(at => at.value === target.dataset.id).length) {
            // exists
            this.__activeTags = this.__activeTags.filter(at => at.value !== target.dataset.id)
            Logger.log("selectTag: tag exists, removed", this.__activeTags);
        }
        else {
            // new
            try {
                const tag = this.__allTags.filter(at => at.value === target.dataset.id)[0];
                this.__activeTags.push(tag);
                Logger.log("selectTag: new tag, added", this.__activeTags);
            } catch (e) {
                Logger.error("#onTagClick:", "Unable to retrieve and add tag to the filter");
            }
        }

        this.render({ force: true });
    }

    #search(event) {
        Logger.log("#search.event:", event);
        const value = event?.target?.value ?? "";
        Logger.log("#search.event.target.value:", value, this.__search);
        if (this.__search === value) return;

        this.__search = value
        this.render({ force: true });
    }

    static #clearFilters(event, target) {
        Logger.log("#clearFilters:", event, target);
        this.__search = "";
        this.__activeTags = [];

        this.render({ force: true });
    }

    static #getPrefabById(prefabId) {
        // TODO: ...
        throw "Method Not Implemented";
    }

    #getAllTags() {
        const tagMap = new Map();

        for (const prefab of this.__prefabs) {
            for (const tag of prefab.tags) {
                if (!tagMap.has(tag.value)) {
                    tagMap.set(tag.value, tag);
                }
            }
        }

        return [...tagMap.values()];
    }

    __getPrefabs() {
        return this.#mockPrefabs();
    }

    __filterPrefabs(prefabs, textSearch, tags) {
        Logger.log("__filterPrefabs:", prefabs, textSearch, tags);
        let filteredPrefabs = [...prefabs];
        if (textSearch && textSearch.length) {
            const q = textSearch.trim().toLowerCase();
            if (q) {
                filteredPrefabs = filteredPrefabs.filter(p => {
                    const words = q.split(/\s+/);
                    return words.every(word => p.name.toLowerCase().includes(word));
                });
                Logger.log("__filterPrefabs.filteredPrefabs (text):", filteredPrefabs);
            }
        }

        if (tags && tags.length) {
            const tagsValueSet = new Set(tags.map(t => t.value));
            Logger.log("__filterPrefabs.tagsValueSet (tags):", tagsValueSet);
            filteredPrefabs = filteredPrefabs.filter(p => p.tags.some(t => tagsValueSet.has(t.value)));
            Logger.log("__filterPrefabs.filteredPrefabs (tags):", filteredPrefabs);
        }

        return filteredPrefabs;
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
                    { value: 'gray', color: 'LightSlateGrey' },
                    { value: 'gold', color: 'PaleGoldenRod' }
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