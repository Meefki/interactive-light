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
        actions: {
            selectPrefab: LightPrefabBrowserV2.__onPrefabClick,
            selectTag: LightPrefabBrowserV2.__onTagClick
        },
        classes: ["prefab-browser-window"],
        position: {
            height: 675,
            width: 590,
            left: 105,
            top: 60
        },
        window: {
            resizable: true,
            title: "INTERACTIVE_LIGHT.Menu.Prefabs.Browser.Title",
        },
        form: {
            submitOnChange: true
        },
    };

    static PARTS = {
        main: { template: "modules/interactive-light/dist/templates/light-prefab-browser/main.hbs" }
    };

    __activePrefab = null;
    __search = "";
    __allTags = [
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
    ]; //[]
    __activeTags = [];

    async _prepareContext(context, options) {
        const _context = {
            ...await super._prepareContext(context)
        };
        _context.prefabs = this.__mockPrefabs();
        _context.activeTags = this.__activeTags;
        return _context;
    }

    static __onPrefabClick(event, target) {
        Logger.log("onPrefabClick:", event, target);
        if (event.altKey) {
            event.preventDefault();
            LightPrefabBrowserV2.__openSettings(target);
        }
        else LightPrefabBrowserV2.__selectPrefab(target);
    }

    static __openSettings(target) {
        Logger.log("openSettings:", target);
        // TODO: ...
        throw "Method Not Implemented";
    }

    static __selectPrefab(target) {
        Logger.log("selectPrefab:", target);
        if (this.__activePrefab === target.dataset.id) {
            this.__activePrefab = null;
            target.checked = false;
        } else {
            this.__activePrefab = target.dataset.id;
        }

        Logger.log("selectPrefab.__activePrefab:", this.__activePrefab);
    }

    static __onTagClick(event, target) {
        Logger.log("onTagClick:", event, target);
        if (!this.__activeTags) this.__activeTags = [];

        if (this.__activeTags.filter(at => at === target.dataset.id).length) {
            // exists
            this.__activeTags = this.__activeTags.filter(at => at !== target.dataset.id)
            Logger.log("selectTag: tag exists, removed", this.__activeTags);
        }
        else {
            // new
            this.__activeTags.push(target.dataset.id);
            Logger.log("selectTag: new tag, added", this.__activeTags);
        }
    }

    static __getPrefabById(prefabId) {
        // TODO: ...
        throw "Method Not Implemented";
    }

    __mockPrefabs() {
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