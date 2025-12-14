const {
  ApplicationV2,
  HandlebarsApplicationMixin
} = foundry.applications.api;

export class LightPrefabBrowserV2 extends HandlebarsApplicationMixin(
  class extends ApplicationV2 {}
) {
    static DEFAULT_OPTIONS = {
        id: "light-prefabs",
        // position: { 
        //     height: 200
        // },
        window: {
            resizable: true,
            title: "Префабы Источников Света"
        },
        form: {
            submitOnChange: true
        },
    };

    static PARTS = {
        main: {
            template: "modules/interactive-light/dist/templates/light-prefab-browser.hbs"
        }
    };

    async _prepareContext(context, options) {
        context.message = "OK";
        return context;
    }
}