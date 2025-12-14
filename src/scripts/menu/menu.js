import { locale } from "../constants/locale.js";
import { Logger } from "../utils/logger.js";
import { openLightPrefabBrowser } from "../prefab-window/light-prefab-browser-window.js";

export class Menu {
    static registerMenu(controls) {
        Logger.log(controls);
        if (!controls) return;
        const lighting = controls.lighting;
        if (!lighting) return;

        Logger.log(game.i18n.localize(locale.menuPrefabsLabel));
        lighting.tools.prefabs = {
            name: 'prefabs',
            title: game.i18n.localize(locale.menuPrefabsLabel),
            icon: 'fa-solid fa-fire-flame-simple',
            button: true,
            onChange: () => {
                try {
                    openLightPrefabBrowser();
                } catch (e) {
                    Logger.error("Unnable to create and render prefab window", e);
                }
            },
            visible: true
        };
    }
}