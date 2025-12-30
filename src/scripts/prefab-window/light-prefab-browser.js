import { flag } from "../constants/flags.js";
import { JournalManager } from "../journal/journal-manager.js";
import { PrefabPlacement } from "../placing/prefab-placement.js";
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

    async close(options = {}) {
        PrefabPlacement.stop();
        return super.close(options);
    }

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
            PrefabPlacement.stop();
        } else {
            this.__activePrefab = target.dataset.id;
            PrefabPlacement.start(this.__activePrefab);
        }
    }

    static async #deletePrefab(event, target) {
        if (!this.__activePrefab) return;
        await JournalManager.deletePrefab(this.__activePrefab);
        this.__activePrefab = null;
        PrefabPlacement.stop();
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
        return tags.sort(function (a, b) {
            return ('' + a.value).localeCompare(b.value);
        });
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

        return prefabViews.sort(function (a, b) {
            return ('' + a.name).localeCompare(b.name);
        });
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
}