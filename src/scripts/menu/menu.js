import { locale } from "../constants/locale";
import { Logger } from "../utils/logger";

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
                ui.notifications.info("Моя кнопка в Lighting нажата!");
            },
            visible: true
        };
    }
}