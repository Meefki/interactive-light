const {
  ApplicationV2,
  HandlebarsApplicationMixin
} = foundry.applications.api;

export class LightPrefabBrowserV2 extends HandlebarsApplicationMixin(
  class extends ApplicationV2 {}
) {
    static DEFAULT_OPTIONS = {
        id: "light-prefabs",
        classes: ["prefab-browser-window"],
        position: { 
            height: 670,
            width: 570,
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

    activePrefab = null;
    search = "";
    allTags = [];
    activeTags = [];

    async _prepareContext(context, options) {
        const _context = {
            ...await super._prepareContext(context)
        };
        _context.prefabs = this.__mockPrefabs();
        return _context;
    }

    __mockPrefabs() {
        return [
            {
                preview: '',
                name: 'test1',
                tags: ['tag1', 'tag2', 'tag3']
            },
            {
                preview: '',
                name: 'test2',
                tags: ['tag1', 'tag2', 'tag3']
            },
            {
                preview: '',
                name: 'test3',
                tags: ['tag1', 'tag2', 'tag3']
            },
            {
                preview: '',
                name: 'test4',
                tags: ['tag1', 'tag2', 'tag3']
            },
            {
                preview: '',
                name: 'test5',
                tags: ['tag1', 'tag2', 'tag3']
            },
            {
                preview: '',
                name: 'test6',
                tags: ['tag1', 'tag2', 'tag3']
            },
            {
                preview: '',
                name: 'test7',
                tags: ['tag1', 'tag2', 'tag3']
            },
            {
                preview: '',
                name: 'test8',
                tags: ['tag1', 'tag2', 'tag3']
            },
            {
                preview: '',
                name: 'test9',
                tags: ['tag1', 'tag2', 'tag3']
            },
            {
                preview: '',
                name: 'test10',
                tags: ['tag1', 'tag2', 'tag3']
            }
        ]
    }
}