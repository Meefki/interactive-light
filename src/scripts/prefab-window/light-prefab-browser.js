import { Logger } from "../utils/logger.js";

const {
  ApplicationV2,
  HandlebarsApplicationMixin
} = foundry.applications.api;

export class LightPrefabBrowserV2 extends HandlebarsApplicationMixin(
  class extends ApplicationV2 {}
) {
    static DEFAULT_OPTIONS = {
        id: "light-prefabs",
        actions: {
            selectPrefab: LightPrefabBrowserV2.__onPrefabClick
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
    __allTags = [];
    __activeTags = [];

    async _prepareContext(context, options) {
        const _context = {
            ...await super._prepareContext(context)
        };
        _context.prefabs = this.__mockPrefabs();
        return _context;
    }

    static __onPrefabClick(event, target) {
        Logger.log("selectPrefab:", event, target);
        if (this.__activePrefab === target.dataset.id) {
            this.__activePrefab = null;
            target.checked = false;
            // target.dataset.checked = false;
        } else {
            this.__activePrefab = target.dataset.id;
            target.checked = true;
            // target.dataset.checked = true;
        }

        Logger.log("selectPrefab.__activePrefab:", this.__activePrefab);
    }

    __mockPrefabs() {
        return [
            {
                id: 'light-1',
                preview: 'assets/ForgottenAdventures/!Core_Settlements/Lightsources/Campfires_and_Firepits/Campfire_Embers_C1_1x1.webp',
                name: 'test1',
                tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7', 'tag8', 'tag9', 'tag10']
            },
            {
                id: 'light-2',
                preview: 'assets/ForgottenAdventures/!Core_Settlements/Lightsources/Campfires_and_Firepits/Campfire_Ash_C1_2x2.webp',
                name: 'test2',
                tags: ['tag1', 'tag2', 'tag3']
            },
            {
                id: 'light-3',
                preview: 'assets/ForgottenAdventures/!Core_Settlements/Lightsources/Campfires_and_Firepits/Campfire_Stone_Redrock_A1_1x1.webp',
                name: 'test3',
                tags: ['tag1', 'tag2', 'tag3']
            },
            {
                id: 'light-4',
                preview: 'assets/ForgottenAdventures/!Core_Settlements/Lightsources/Campfires_and_Firepits/Campfire_Stone_Redrock_A1_Lit_1x1.webp',
                name: 'test4',
                tags: ['tag1', 'tag2', 'tag3']
            },
            {
                id: 'light-5',
                preview: 'assets/ForgottenAdventures/!Core_Settlements/Lightsources/Campfires_and_Firepits/Campfire_Wood_Ashen_Lit_A1_1x1.webp',
                name: 'test5',
                tags: ['tag1', 'tag2', 'tag3']
            },
            {
                id: 'light-6',
                preview: 'assets/ForgottenAdventures/!Core_Settlements/Lightsources/Lamps/Lamp_Street_Double_Metal_Brass_C_1x1.webp',
                name: 'test6',
                tags: ['tag1', 'tag2', 'tag3']
            },
            {
                id: 'light-7',
                preview: 'assets/ForgottenAdventures/!Core_Settlements/Lightsources/Lamps/Lamp_Street_Double_Metal_Brass_J_1x1.webp',
                name: 'test7',
                tags: ['tag1', 'tag2', 'tag3']
            },
            {
                id: 'light-8',
                preview: 'assets/ForgottenAdventures/!Core_Settlements/Lightsources/Lamps/Mage_Light_Red_1x1.webp',
                name: 'test8',
                tags: ['tag1', 'tag2', 'tag3']
            },
            {
                id: 'light-9',
                preview: 'assets/ForgottenAdventures/!Core_Settlements/Lightsources/Lamps/Mage_Light_Blue_1x1.webp',
                name: 'test9',
                tags: ['tag1', 'tag2', 'tag3']
            },
            {
                id: 'light-10',
                preview: 'assets/ForgottenAdventures/!Core_Settlements/Lightsources/Torches_and_Sconces/Sconce_B_1x1.webp',
                name: 'test10',
                tags: ['tag1', 'tag2', 'tag3']
            }
        ]
    }
}