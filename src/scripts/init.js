import { hook_alias } from "./constants/hook_alias.js";
import { AmbientLightConfig } from "./placing/ambient-light-config.js";
import { Logger } from "./utils/logger.js";
import { LibManager } from "./utils/lib-manager.js";
import { settings } from "./constants/settings.js";
import { Menu } from "./menu/menu.js";
import { registedHelpers } from "./utils/hbs-helpers.js";
import { TileInteractionManager } from "./placing/tile-interaction-manager.js"
import { PermissionManager } from "./placing/permission-manager.js";
import { preloadTemplates } from "../templates/preloadTemplates.js";

export function proceed() {
    Logger.info("Init Hooks");
    
    Hooks.once(hook_alias.init, (data) => {
        if (LibManager.moduleDepsCheck()) return;

        Initializer.__initHelpers(data);
        Initializer.__initHooks(data);
        Initializer.__initApp(data);
        preloadTemplates();
    });

    Logger.info("Hooks Init Finished!");
}

class Initializer {

    static __initHooks(data) {
        Hooks.on(
            hook_alias.renderAmbientLightConfig,
            AmbientLightConfig.renderLightConfigHook
        );
        Hooks.on(hook_alias.updateAmbientLight, AmbientLightConfig.trackLightPositionHook);
        Hooks.on(hook_alias.deleteAmbientLight, AmbientLightConfig.deleteAmbientLightHook);
        Hooks.on(hook_alias.canvasReady, settings.initSettings);
        Hooks.on(hook_alias.getSceneControlButtons, Menu.registerMenu);
    }
    
    static __initApp(data) {
        TileInteractionManager.AddClickHandlers();
        PermissionManager.init();
    }
    
    static __initHelpers(data) {
        registedHelpers();
    }    
}

export * as init from "./init.js";